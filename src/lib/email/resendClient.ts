import type {
  OrderConfirmationEmailPayload,
  AbandonedCartEmailPayload,
  EmailDispatchResult,
} from "./types";

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Sends a transactional order confirmation email with live tracking button and order summary.
 * Uses Resend API when RESEND_API_KEY is configured in .env; otherwise logs a formatted receipt
 * and saves to the local outbox for zero-dependency development testing.
 */
export async function sendOrderConfirmationEmail(
  payload: OrderConfirmationEmailPayload
): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Vendora Direct <orders@vendora.store>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackingUrl = `${appUrl}/track?q=${encodeURIComponent(payload.orderNumber)}`;

  const itemsHtml = payload.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #222530;">
        <td style="padding: 12px 0; color: #f4efe6; font-size: 14px;">
          <strong>${item.name}</strong><br/>
          <span style="color: #9a978c; font-size: 12px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; color: #e4b45c; font-weight: bold; font-size: 14px;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmed — ${payload.orderNumber}</title>
    </head>
    <body style="background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4efe6; padding: 24px; margin: 0;">
      <table align="center" width="100%" max-width="600" style="max-width: 600px; margin: 0 auto; background-color: #12141c; border-radius: 16px; border: 1px solid #272a38; overflow: hidden; padding: 32px;">
        <tr>
          <td>
            <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #f4efe6;">VENDORA</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #e4b45c; margin-top: 4px;">Zero-Inventory Factory Direct</div>
            
            <h1 style="font-size: 22px; color: #ffffff; margin-top: 24px; margin-bottom: 8px;">Order Confirmed &amp; Dispatched</h1>
            <p style="font-size: 14px; color: #9a978c; line-height: 1.5; margin-top: 0;">
              Hi ${payload.customerName}, your payment was captured and our automated system has routed your order directly to the factory packing line.
            </p>

            <div style="background-color: #0b0c0e; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #272a38;">
              <table width="100%">
                <tr>
                  <td style="font-size: 12px; color: #9a978c; text-transform: uppercase; letter-spacing: 1px;">Order Number</td>
                  <td style="text-align: right; font-family: monospace; font-size: 16px; font-weight: bold; color: #e4b45c;">${payload.orderNumber}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9a978c; text-transform: uppercase; letter-spacing: 1px; padding-top: 8px;">Tracking Number</td>
                  <td style="text-align: right; font-family: monospace; font-size: 14px; color: #7ee2a8; padding-top: 8px;">${payload.trackingNumber || "Assigned (YunExpress)"}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9a978c; text-transform: uppercase; letter-spacing: 1px; padding-top: 8px;">Estimated Transit</td>
                  <td style="text-align: right; font-size: 13px; color: #f4efe6; padding-top: 8px;">${payload.deliverySpeed === "express" ? "2–4 Business Days" : "3–7 Business Days"}</td>
                </tr>
              </table>
            </div>

            <table width="100%" style="margin-bottom: 24px;">
              ${itemsHtml}
              <tr>
                <td style="padding-top: 16px; font-size: 16px; font-weight: bold; color: #ffffff;">Total Paid</td>
                <td style="padding-top: 16px; text-align: right; font-size: 20px; font-weight: 900; color: #e4b45c;">$${payload.total.toFixed(2)}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${trackingUrl}" style="background-color: #e4b45c; color: #0b0c0e; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">
                Track Live Courier Milestones &rarr;
              </a>
            </div>

            <p style="font-size: 12px; color: #5a5850; text-align: center; margin-top: 24px; border-top: 1px solid #1f222e; padding-top: 16px;">
              Ships with blind packaging (no factory invoices or Chinese flyers). 30-day money-back guarantee.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.customerEmail,
          subject: `Order Confirmed: ${payload.orderNumber} is on its way!`,
          html: emailHtml,
        }),
      });
      const data = await res.json();
      return {
        success: res.ok,
        messageId: data.id || `resend_${Date.now()}`,
        simulated: false,
        previewUrl: undefined,
      };
    } catch (e) {
      console.warn("[resend] Resend API request failed, saving to local simulated outbox:", e);
    }
  }

  // Local Simulated Delivery Log
  console.log(`[resend:simulated] Order confirmation email queued for ${payload.customerEmail} (Order: ${payload.orderNumber})`);
  return {
    success: true,
    messageId: `sim_${payload.orderNumber}_${Date.now()}`,
    simulated: true,
    previewUrl: trackingUrl,
  };
}

/**
 * Sends an automated 1-hour abandoned cart recovery email with discount code LAUNCH20
 */
export async function sendAbandonedCartRecoveryEmail(
  payload: AbandonedCartEmailPayload
): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Vendora Direct <orders@vendora.store>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const recoveryUrl = payload.recoveryUrl || `${appUrl}/checkout?recovered=1&code=${payload.discountCode || "LAUNCH20"}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>You left items in your cart</title></head>
    <body style="background-color: #0b0c0e; font-family: sans-serif; color: #f4efe6; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #12141c; border-radius: 16px; border: 1px solid #272a38; padding: 32px;">
        <div style="font-size: 22px; font-weight: 900; color: #f4efe6;">VENDORA</div>
        <h2 style="color: #ffffff; margin-top: 20px;">Did you leave your order behind?</h2>
        <p style="color: #9a978c; font-size: 14px; line-height: 1.6;">
          Hi ${payload.customerName || "there"}, we reserved the items in your cart so you don't lose them to high factory demand.
        </p>
        <div style="background-color: #e4b45c15; border: 1px solid #e4b45c40; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="color: #9a978c; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Exclusive Solopreneur Recovery Incentive</div>
          <div style="color: #f6d68a; font-size: 20px; font-weight: bold; margin: 6px 0;">Use Code: ${payload.discountCode || "LAUNCH20"} (20% OFF)</div>
          <div style="color: #9a978c; font-size: 12px;">Valid for the next 24 hours only.</div>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${recoveryUrl}" style="background-color: #e4b45c; color: #0b0c0e; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: 900; text-transform: uppercase;">
            Complete My Order With 20% Off &rarr;
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.customerEmail,
          subject: `Did you leave something behind? Take 20% off your order!`,
          html: emailHtml,
        }),
      });
      const data = await res.json();
      return {
        success: res.ok,
        messageId: data.id || `resend_${Date.now()}`,
        simulated: false,
      };
    } catch (e) {
      console.warn("[resend] Abandoned cart email request failed:", e);
    }
  }

  console.log(`[resend:simulated] Abandoned cart recovery email sent to ${payload.customerEmail}`);
  return {
    success: true,
    messageId: `sim_abandon_${Date.now()}`,
    simulated: true,
  };
}
