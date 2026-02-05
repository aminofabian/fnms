/**
 * TextSMS.co.ke integration – send SMS to admin phones when an order is placed.
 * Env: SMS_API_URL, SMS_PARTNER_ID, SMS_API_KEY, SMS_SENDER_ID, ADMIN_PHONES
 */

const BASE_URL = (process.env.SMS_API_URL ?? "https://sms.textsms.co.ke/api/services/sendsms/").replace(/\?$/, "");
const PARTNER_ID = process.env.SMS_PARTNER_ID;
const API_KEY = process.env.SMS_API_KEY;
const SHORTCODE = process.env.SMS_SENDER_ID ?? "TextSMS";

/** Normalize Kenyan phone to 254XXXXXXXXX for TextSMS API. */
export function normalizePhone(phone: string): string | null {
  const digits = phone.trim().replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("254")) return digits;
  if (digits.length === 9) return "254" + digits;
  return null;
}

function getAdminPhones(): string[] {
  const raw = process.env.ADMIN_PHONES;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((p) => p.trim().replace(/^\+/, "").replace(/\s/g, ""))
    .filter((p) => /^254\d{9}$/.test(p));
}

export async function sendSms(message: string, mobile: string): Promise<{ success: boolean; error?: string }> {
  if (!API_KEY || !PARTNER_ID) {
    console.warn("[SMS] SMS_API_KEY or SMS_PARTNER_ID not set; skipping SMS");
    return { success: false, error: "SMS not configured" };
  }

  const url = BASE_URL.startsWith("http") ? BASE_URL : `https://${BASE_URL}`;
  const body = {
    apikey: API_KEY,
    partnerID: PARTNER_ID,
    message,
    shortcode: SHORTCODE,
    mobile,
    pass_type: "plain",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { responses?: { "respose-code": number; "response-description"?: string }[] };
    const code = data.responses?.[0]?.["respose-code"];
    if (code === 200) return { success: true };
    const desc = data.responses?.[0]?.["response-description"] ?? res.statusText;
    console.error("[SMS] Send failed:", code, desc);
    return { success: false, error: desc };
  } catch (e) {
    console.error("[SMS] Send error:", e);
    return { success: false, error: e instanceof Error ? e.message : "Failed to send SMS" };
  }
}

/** Send order alert to all ADMIN_PHONES. Fire-and-forget; does not throw. */
export function sendOrderAlert(params: {
  orderNumber: string;
  totalCents: number;
  recipientName: string;
}): void {
  const phones = getAdminPhones();
  if (phones.length === 0) {
    console.warn("[SMS] ADMIN_PHONES not set; skipping order alert");
    return;
  }

  const totalFormatted = `KES ${(params.totalCents / 100).toFixed(0)}`;
  const message = `New order ${params.orderNumber} – ${totalFormatted} – ${params.recipientName}. Check dashboard.`;

  phones.forEach((mobile) => {
    sendSms(message, mobile).then((r) => {
      if (!r.success) console.error("[SMS] Order alert failed for", mobile, r.error);
    });
  });
}

/** Send order-received confirmation to the customer (logged-in user's phone). Fire-and-forget. */
export function sendOrderReceivedSms(orderNumber: string, userPhone: string): void {
  const mobile = normalizePhone(userPhone);
  if (!mobile) {
    console.warn("[SMS] Invalid user phone for order-received SMS:", userPhone);
    return;
  }
  const message = `Your order ${orderNumber} has been received and will be processed in less than an hour. Thank you for shopping with FnM's.`;
  sendSms(message, mobile).then((r) => {
    if (!r.success) console.error("[SMS] Order-received SMS failed for", mobile, r.error);
  });
}
