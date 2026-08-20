import { createHmac, timingSafeEqual } from "node:crypto";

type CheckoutLine = { name: string; unitAmount: number; quantity: number };

export type StripeCheckoutRequest = {
  orderId: number;
  orderNumber: string;
  customerEmail?: string | null;
  currency: string;
  lines: CheckoutLine[];
  successUrl: string;
  cancelUrl: string;
};

export type StripeWebhookEvent = {
  type: string;
  data: {
    object: {
      id?: string;
      payment_intent?: string | null;
      metadata?: Record<string, string>;
    };
  };
};

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function stripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

function amountToMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export async function createStripeCheckoutSession(request: StripeCheckoutRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured.");
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", request.successUrl);
  form.set("cancel_url", request.cancelUrl);
  form.set("client_reference_id", String(request.orderId));
  form.set("metadata[orderId]", String(request.orderId));
  form.set("metadata[orderNumber]", request.orderNumber);
  form.set("payment_method_types[0]", "card");
  form.set("billing_address_collection", "required");
  if (request.customerEmail) form.set("customer_email", request.customerEmail);
  request.lines.forEach((line, index) => {
    form.set(`line_items[${index}][price_data][currency]`, request.currency.toLowerCase());
    form.set(`line_items[${index}][price_data][product_data][name]`, line.name);
    form.set(`line_items[${index}][price_data][unit_amount]`, String(amountToMinorUnits(line.unitAmount)));
    form.set(`line_items[${index}][quantity]`, String(line.quantity));
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `autogear-order-${request.orderId}`,
    },
    body: form,
  });
  const data = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !data.id || !data.url) throw new Error(data.error?.message || "Stripe could not create a checkout session.");
  return { id: data.id, url: data.url };
}

function parseSignature(header: string) {
  const values = header.split(",").reduce<Record<string, string[]>>((result, part) => {
    const [key, value] = part.split("=", 2);
    if (key && value) (result[key] ||= []).push(value);
    return result;
  }, {});
  return { timestamp: values.t?.[0], signatures: values.v1 || [] };
}

export function verifyStripeWebhookSignature(payload: Buffer, signatureHeader: string | undefined, secret: string, toleranceSeconds = 300) {
  if (!signatureHeader || !secret) return false;
  const { timestamp, signatures } = parseSignature(signatureHeader);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  const eventAge = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (eventAge > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload.toString("utf8")}`).digest("hex");
  return signatures.some(signature => {
    const candidate = Buffer.from(signature, "utf8");
    const comparison = Buffer.from(expected, "utf8");
    return candidate.length === comparison.length && timingSafeEqual(candidate, comparison);
  });
}

export function parseStripeWebhookEvent(payload: Buffer): StripeWebhookEvent | null {
  try {
    const parsed = JSON.parse(payload.toString("utf8")) as StripeWebhookEvent;
    return parsed?.type && parsed?.data?.object ? parsed : null;
  } catch {
    return null;
  }
}
