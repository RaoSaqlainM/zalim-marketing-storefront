import { afterEach, describe, expect, it, vi } from "vitest";
import { sendOrderEmail } from "./notifications";

const originalKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.RESEND_FROM_EMAIL;

afterEach(() => {
  process.env.RESEND_API_KEY = originalKey;
  process.env.RESEND_FROM_EMAIL = originalFrom;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("order milestone notifications", () => {
  it.each([
    ["placed", "We have received your order"],
    ["confirmed", "Your Zalim Marketing order is confirmed"],
    ["shipped", "Your Zalim Marketing order is on the road"],
  ] as const)("sends the %s milestone using the corresponding customer message", async (milestone, subject) => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "orders@example.test";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendOrderEmail({ recipient: "customer@example.test", customerName: "Ayesha", orderNumber: "AG-12345678-123", total: 5600, currency: "PKR", milestone, trackingNumber: milestone === "shipped" ? "TRACK-24" : undefined })).resolves.toEqual({ delivered: true, skipped: false });

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.from).toBe("orders@example.test");
    expect(body.to).toEqual(["customer@example.test"]);
    expect(body.subject).toContain(subject);
    expect(body.html).toContain("AG-12345678-123");
    if (milestone === "shipped") expect(body.html).toContain("TRACK-24");
  });

  it("skips sending cleanly when the recipient or provider configuration is absent", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    await expect(sendOrderEmail({ recipient: null, customerName: null, orderNumber: "AG-1", total: 0, currency: "PKR", milestone: "placed" })).resolves.toEqual({ delivered: false, skipped: true });
  });
});
