import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { isEmailConfigured, sendOrderEmail } from "./notifications";
import { isStripeConfigured, parseStripeWebhookEvent, verifyStripeWebhookSignature } from "./payments";

const originalEnvironment = { stripe: process.env.STRIPE_SECRET_KEY, webhook: process.env.STRIPE_WEBHOOK_SECRET, resend: process.env.RESEND_API_KEY, sender: process.env.RESEND_FROM_EMAIL };

afterEach(() => {
  process.env.STRIPE_SECRET_KEY = originalEnvironment.stripe;
  process.env.STRIPE_WEBHOOK_SECRET = originalEnvironment.webhook;
  process.env.RESEND_API_KEY = originalEnvironment.resend;
  process.env.RESEND_FROM_EMAIL = originalEnvironment.sender;
});

describe("payment and notification configuration", () => {
  it("requires both Stripe credentials before enabling checkout", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(isStripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
    expect(isStripeConfigured()).toBe(true);
  });

  it("accepts a current valid Stripe signature and rejects altered payloads", () => {
    const secret = "whsec_test_secret";
    const payload = Buffer.from(JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs_test", metadata: { orderId: "42" } } } }));
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload.toString("utf8")}`).digest("hex");
    expect(verifyStripeWebhookSignature(payload, `t=${timestamp},v1=${signature}`, secret)).toBe(true);
    expect(verifyStripeWebhookSignature(Buffer.from("altered"), `t=${timestamp},v1=${signature}`, secret)).toBe(false);
    expect(parseStripeWebhookEvent(payload)?.data.object.metadata?.orderId).toBe("42");
  });

  it("keeps order email delivery dormant without an approved provider credential", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    expect(isEmailConfigured()).toBe(false);
    await expect(sendOrderEmail({ recipient: "buyer@example.com", customerName: "Buyer", orderNumber: "AG-123", total: "1000.00", currency: "PKR", milestone: "placed" })).resolves.toEqual({ delivered: false, skipped: true });
  });
});
