export type SupplierOrderLine = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  sku?: string;
};

export type SupplierOrderPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  deliverySpeed: "standard" | "express";
  items: SupplierOrderLine[];
  note?: string;
};

export type SupplierFulfillmentResult = {
  success: boolean;
  supplierPlatform: "CJDropshipping" | "Zendrop" | "AliExpressDSers" | "SimulatedDirect";
  supplierOrderId: string;
  trackingNumber: string;
  carrierName: string;
  trackingUrl: string;
  estimatedDeliveryDays: string;
  dispatchedAt: string;
  simulated: boolean;
  message: string;
};

export type SupplierTrackingMilestone = {
  timestamp: string;
  status: "order_created" | "picked_and_packed" | "customs_cleared" | "in_transit" | "out_for_delivery" | "delivered";
  location: string;
  description: string;
};

export type SupplierTrackingDetails = {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  carrierUrl: string;
  status: "forwarded" | "shipped" | "in_transit" | "delivered";
  estimatedDelivery: string;
  milestones: SupplierTrackingMilestone[];
};
