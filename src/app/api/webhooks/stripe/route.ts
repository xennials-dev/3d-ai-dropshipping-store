import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { dispatchOrderToSupplier } from "@/lib/fulfillment/cjDropshipping";
import { sendOrderConfirmationEmail } from "@/lib/email/resendClient";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.warn("[stripe-webhook] Stripe or STRIPE_WEBHOOK_SECRET is not configured on this server");
    return NextResponse.json(
      { error: "Stripe webhook secret is missing. Set STRIPE_WEBHOOK_SECRET in environment." },
      { status: 400 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (id: ${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderNumber = session.client_reference_id || session.metadata?.orderNumber;

        if (orderNumber) {
          console.log(`[stripe-webhook] Payment completed for order: ${orderNumber}`);
          const [order] = await db
            .update(orders)
            .set({
              status: "paid",
              paymentStatus: "paid",
              stripeSessionId: session.id,
              paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            })
            .where(eq(orders.orderNumber, orderNumber))
            .returning();

          if (order) {
            // ZERO-TOUCH AUTONOMOUS SUPPLIER DISPATCH
            try {
              const items = await db
                .select()
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));

              const fulfillment = await dispatchOrderToSupplier({
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                shippingAddress: order.address,
                deliverySpeed: order.deliverySpeed === "express" ? "express" : "standard",
                items: items.map((i) => ({
                  productId: i.productId || 0,
                  name: i.name,
                  quantity: i.quantity,
                  unitPrice: i.price,
                })),
                note: "Automated Stripe Webhook Zero-Touch Dispatch",
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

              // AUTOMATED ORDER CONFIRMATION EMAIL (RESEND)
              await sendOrderConfirmationEmail({
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                total: order.total,
                deliverySpeed: order.deliverySpeed,
                trackingNumber: fulfillment.trackingNumber,
                items: items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                  image: i.image,
                })),
              });
            } catch (autoErr) {
              console.error("[stripe-webhook] Automated fulfillment/email error:", autoErr);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderNumber = intent.metadata?.orderNumber;
        if (orderNumber) {
          await db
            .update(orders)
            .set({
              paymentStatus: "paid",
              paymentIntentId: intent.id,
            })
            .where(eq(orders.orderNumber, orderNumber));
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderNumber = intent.metadata?.orderNumber;
        console.warn(`[stripe-webhook] Payment intent failed for order: ${orderNumber}`);
        if (orderNumber) {
          await db
            .update(orders)
            .set({
              paymentStatus: "failed",
            })
            .where(eq(orders.orderNumber, orderNumber));
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (typeof charge.payment_intent === "string") {
          console.log(`[stripe-webhook] Charge refunded for payment intent: ${charge.payment_intent}`);
          await db
            .update(orders)
            .set({
              paymentStatus: "refunded",
            })
            .where(eq(orders.paymentIntentId, charge.payment_intent));
        }
        break;
      }

      default:
        // Acknowledge other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] Database update error:", error);
    return NextResponse.json({ error: "Failed to update order state from webhook" }, { status: 500 });
  }
}
