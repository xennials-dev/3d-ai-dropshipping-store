import { NextResponse } from "next/server";
import { db, ensureDbReady } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { PROMO_CODES, FREE_SHIPPING_AT, STANDARD_SHIPPING_FEE, EXPRESS_SHIPPING_FEE } from "@/lib/promos";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { dispatchOrderToSupplier } from "@/lib/fulfillment/cjDropshipping";
import { sendOrderConfirmationEmail } from "@/lib/email/resendClient";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

type CheckoutItem = { id: number; qty: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = String(body?.customerName ?? "").trim().slice(0, 120);
    const customerEmail = String(body?.customerEmail ?? "").trim().toLowerCase().slice(0, 160);
    const address = String(body?.address ?? "").trim().slice(0, 300);
    const deliverySpeed = body?.deliverySpeed === "express" ? "express" : "standard";
    const promoCodeRaw = String(body?.promoCode ?? "").trim().toUpperCase();
    const paymentMethodChoice = body?.paymentMethod === "simulated" ? "simulated" : "auto";
    const items = (Array.isArray(body?.items) ? body.items : []) as CheckoutItem[];

    if (customerName.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customerEmail))
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    if (address.length < 8) return NextResponse.json({ error: "Please enter a complete delivery address." }, { status: 400 });
    if (items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

    const ids = [...new Set(items.map((i) => Number(i.id)).filter((n) => Number.isFinite(n) && n > 0))];
    if (ids.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

    // Price everything from the database — never trust client totals
    await ensureDbReady();
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    if (rows.length === 0) return NextResponse.json({ error: "Products not found." }, { status: 400 });
    const byId = new Map(rows.map((p) => [p.id, p]));

    let subtotal = 0;
    let margin = 0;
    const lines: { product: (typeof rows)[number]; qty: number }[] = [];
    for (const item of items) {
      const product = byId.get(Number(item.id));
      const qty = Math.min(20, Math.max(1, Math.floor(Number(item.qty) || 1)));
      if (!product) continue;
      subtotal += product.price * qty;
      margin += (product.price - product.cost) * qty;
      lines.push({ product, qty });
    }
    if (lines.length === 0) return NextResponse.json({ error: "Products not found." }, { status: 400 });

    const promo = PROMO_CODES[promoCodeRaw] ?? null;
    const discount = promo ? subtotal * promo.rate : 0;
    const expressFee = deliverySpeed === "express" ? EXPRESS_SHIPPING_FEE : 0;
    const baseShip = subtotal >= FREE_SHIPPING_AT ? 0 : STANDARD_SHIPPING_FEE;
    const shippingFee = deliverySpeed === "express" ? expressFee : baseShip;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // Supplier of record for the parcel: value-weighted pick
    const supplierWeight = new Map<string, number>();
    for (const l of lines) {
      supplierWeight.set(l.product.supplier, (supplierWeight.get(l.product.supplier) ?? 0) + l.product.price * l.qty);
    }
    const supplier = [...supplierWeight.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Vendora Network";

    const stripe = getStripe();
    const useStripe = isStripeConfigured() && paymentMethodChoice !== "simulated";
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create order with collision-safe order number (3 attempts)
    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = `VND-${Math.floor(100000 + Math.random() * 900000)}`;
      try {
        const [order] = await db
          .insert(orders)
          .values({
            orderNumber,
            customerName,
            customerEmail,
            address,
            deliverySpeed,
            promoCode: promo ? promoCodeRaw : null,
            total: Math.round(total * 100) / 100,
            marginEarned: Math.round(margin * 100) / 100,
            status: useStripe ? "paid" : "paid", // initial status; webhook confirms & advances
            paymentStatus: useStripe ? "pending" : "paid",
            paymentMethod: useStripe ? "stripe" : "simulated",
            supplier,
          })
          .returning();

        await db.insert(orderItems).values(
          lines.map((l) => ({
            orderId: order.id,
            productId: l.product.id,
            name: l.product.name,
            price: l.product.price,
            quantity: l.qty,
            image: l.product.image,
            supplier: l.product.supplier,
          }))
        );

        const etaDays = deliverySpeed === "express" ? "2–4" : "3–7";

        // REAL STRIPE CHECKOUT SESSION FLOW
        if (useStripe && stripe) {
          const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => ({
            price_data: {
              currency: "usd",
              product_data: {
                name: l.product.name,
                description: l.product.tagline,
                images: l.product.image.startsWith("http") ? [l.product.image] : [],
              },
              unit_amount: Math.round(l.product.price * 100),
            },
            quantity: l.qty,
          }));

          if (shippingFee > 0) {
            lineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: deliverySpeed === "express" ? "Express Courier Shipping (2–4 days)" : "Standard Direct Shipping (3–7 days)",
                },
                unit_amount: Math.round(shippingFee * 100),
              },
              quantity: 1,
            });
          }

          let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
          if (promo && promo.rate > 0) {
            try {
              const coupon = await stripe.coupons.create({
                percent_off: Math.round(promo.rate * 100),
                duration: "once",
                name: `Discount (${promoCodeRaw})`,
              });
              discounts = [{ coupon: coupon.id }];
            } catch (couponErr) {
              console.warn("[checkout] Coupon creation skipped:", couponErr);
            }
          }

          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: customerEmail,
            client_reference_id: orderNumber,
            line_items: lineItems,
            discounts,
            metadata: {
              orderNumber,
              orderId: String(order.id),
              customerName,
              deliverySpeed,
              promoCode: promo ? promoCodeRaw : "",
            },
            success_url: `${origin}/order-success?n=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout?canceled=1`,
          });

          await db
            .update(orders)
            .set({ stripeSessionId: session.id })
            .where(eq(orders.id, order.id));

          return NextResponse.json({
            ok: true,
            isStripe: true,
            url: session.url,
            orderNumber,
            total: order.total,
            eta: `${etaDays} business days`,
            supplier,
          });
        }

        // INSTANT SIMULATED CARD CHECKOUT (DEVELOPMENT / TEST FALLBACK)
        // Automatically dispatch order to supplier (Zero-touch fulfillment)
        try {
          const fulfillment = await dispatchOrderToSupplier({
            orderNumber,
            customerName,
            customerEmail,
            shippingAddress: address,
            deliverySpeed,
            items: lines.map((l) => ({
              productId: l.product.id,
              name: l.product.name,
              quantity: l.qty,
              unitPrice: l.product.price,
            })),
            note: "Vendora Zero-Touch Simulated Checkout Dispatch",
          });

          if (fulfillment.success) {
            await db
              .update(orders)
              .set({
                status: "forwarded",
                supplierOrderId: fulfillment.supplierOrderId,
                trackingNumber: fulfillment.trackingNumber,
                carrierName: fulfillment.carrierName,
                trackingUrl: fulfillment.trackingUrl,
                dispatchedAt: new Date(),
              })
              .where(eq(orders.id, order.id));
          }

          // Trigger automated order confirmation email (Resend)
          await sendOrderConfirmationEmail({
            orderNumber,
            customerName,
            customerEmail,
            total: order.total,
            deliverySpeed,
            trackingNumber: fulfillment.trackingNumber,
            items: lines.map((l) => ({
              name: l.product.name,
              quantity: l.qty,
              price: l.product.price,
              image: l.product.image,
            })),
          });
        } catch (fulfillmentErr) {
          console.warn("[checkout] Automated fulfillment/email notice:", fulfillmentErr);
        }

        return NextResponse.json({
          ok: true,
          isStripe: false,
          orderNumber,
          total: order.total,
          eta: `${etaDays} business days`,
          supplier,
        });
      } catch (error: unknown) {
        const code = (error as { code?: string })?.code;
        if (code === "23505" && attempt < 2) continue; // order number collision — retry
        throw error;
      }
    }
    return NextResponse.json({ error: "Could not allocate an order number — try again." }, { status: 500 });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json({ error: "Checkout failed. Your card was not charged." }, { status: 500 });
  }
}
