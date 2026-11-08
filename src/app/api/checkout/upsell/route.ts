import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UPSELL_CATALOG, UpsellRecommendation } from "@/lib/upsellData";
import { dispatchOrderToSupplier } from "@/lib/fulfillment/cjDropshipping";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderNumber = String(body?.orderNumber ?? "").trim().toUpperCase();
    const upsellId = String(body?.upsellId ?? "").trim();

    if (!orderNumber || !upsellId) {
      return NextResponse.json(
        { error: "orderNumber and upsellId are required." },
        { status: 400 }
      );
    }

    const upsellItem: UpsellRecommendation | undefined = UPSELL_CATALOG.find(
      (u) => u.id === upsellId
    );
    if (!upsellItem) {
      return NextResponse.json({ error: "Upsell offer not found." }, { status: 404 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Original order not found." }, { status: 404 });
    }

    // Add upsell to orderItems
    const [insertedItem] = await db
      .insert(orderItems)
      .values({
        orderId: order.id,
        productId: null,
        name: `${upsellItem.name} [Exclusive 1-Click Post-Purchase Add-on]`,
        price: upsellItem.discountedPrice,
        quantity: 1,
        image: upsellItem.image,
        supplier: upsellItem.supplier,
      })
      .returning();

    // Recalculate order total & margin
    const addedMargin = upsellItem.discountedPrice - upsellItem.cost;
    const newTotal = Number((order.total + upsellItem.discountedPrice).toFixed(2));
    const newMargin = Number((order.marginEarned + addedMargin).toFixed(2));

    await db
      .update(orders)
      .set({
        total: newTotal,
        marginEarned: newMargin,
      })
      .where(eq(orders.id, order.id));

    // Dispatch add-on item to supplier line
    try {
      await dispatchOrderToSupplier({
        orderNumber: `${order.orderNumber}-UP`,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.address,
        deliverySpeed: order.deliverySpeed === "express" ? "express" : "standard",
        items: [
          {
            productId: 999,
            name: upsellItem.name,
            quantity: 1,
            unitPrice: upsellItem.discountedPrice,
          },
        ],
        note: `1-Click Post-Purchase Upsell Add-on bundled with ${order.orderNumber}`,
      });
    } catch (dispatchErr) {
      console.warn("[upsell] Supplier auto-dispatch notice:", dispatchErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${upsellItem.name} to your order!`,
      newTotal,
      addedItem: insertedItem,
    });
  } catch (error) {
    console.error("[api/checkout/upsell]", error);
    return NextResponse.json(
      { error: "Failed to process 1-click upsell." },
      { status: 500 }
    );
  }
}
