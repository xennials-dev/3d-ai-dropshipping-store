export type EmailDispatchResult = {
  success: boolean;
  messageId: string;
  simulated: boolean;
  previewUrl?: string;
};

export type OrderConfirmationEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  deliverySpeed: string;
  trackingNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string | null;
  }>;
};

export type AbandonedCartEmailPayload = {
  customerEmail: string;
  customerName?: string;
  cartItems?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  discountCode?: string;
  recoveryUrl?: string;
};
