import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use your verified domain (e.g. orders@yourdomain.com). Required to send to any recipient.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const FROM_NAME = process.env.RESEND_FROM_NAME ?? "FnM's Mini Mart";

export interface OrderConfirmationData {
  orderNumber: string;
  totalCents: number;
  items: { name: string; quantity: number; unitPriceCents: number }[];
  recipientName: string;
  deliveryAddress: string;
  paymentMethod: string;
}

export async function sendOrderConfirmation(
  to: string,
  data: OrderConfirmationData
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set; skipping order confirmation email");
    return { success: false, error: "Email not configured" };
  }

  if (!FROM_EMAIL) {
    console.warn(
      "[Email] RESEND_FROM_EMAIL not set. Set it to an address on your verified domain (e.g. orders@yourdomain.com) to send to customers."
    );
    return { success: false, error: "From address not configured" };
  }

  const totalFormatted = `KES ${(data.totalCents / 100).toFixed(2)}`;
  const itemsRows = data.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>KES ${(i.unitPriceCents / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.5rem;">Order confirmed</h1>
  <p>Hi ${escapeHtml(data.recipientName)},</p>
  <p>Thanks for your order. Here are the details:</p>
  <p><strong>Order number:</strong> ${escapeHtml(data.orderNumber)}</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <thead><tr style="border-bottom: 2px solid #eee;"><th style="text-align: left;">Item</th><th>Qty</th><th style="text-align: right;">Price</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <p style="font-size: 1.1rem;"><strong>Total: ${totalFormatted}</strong></p>
  <p><strong>Delivery to:</strong><br/>${escapeHtml(data.deliveryAddress)}</p>
  <p><strong>Payment:</strong> ${escapeHtml(data.paymentMethod)}</p>
  <p>We'll notify you when your order is on its way.</p>
  <p>— ${escapeHtml(FROM_NAME)}</p>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Order ${data.orderNumber} confirmed`,
      html,
    });
    if (error) {
      console.error("[Email] Order confirmation failed:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    console.error("[Email] Order confirmation error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
