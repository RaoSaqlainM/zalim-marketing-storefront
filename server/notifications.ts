type OrderEmailMilestone = "placed" | "confirmed" | "shipped";

type OrderEmailInput = {
  recipient: string | null | undefined;
  customerName: string | null | undefined;
  orderNumber: string;
  total: number | string;
  currency: string;
  milestone: OrderEmailMilestone;
  trackingNumber?: string | null;
};

const copy: Record<OrderEmailMilestone, { subject: string; title: string; message: string }> = {
  placed: { subject: "We have received your order", title: "Your order is in motion.", message: "We have received your order and will let you know when it is confirmed for fulfilment." },
  confirmed: { subject: "Your Zalim Marketing order is confirmed", title: "Your order is confirmed.", message: "Payment has been confirmed and our team is preparing your selection for dispatch." },
  shipped: { subject: "Your Zalim Marketing order is on the road", title: "Your order is on the road.", message: "Your order has been handed to delivery and is making its way to you." },
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendOrderEmail(input: OrderEmailInput) {
  if (!input.recipient || !isEmailConfigured()) return { delivered: false, skipped: true } as const;
  const message = copy[input.milestone];
  const total = new Intl.NumberFormat("en-PK", { style: "currency", currency: input.currency || "PKR", maximumFractionDigits: 0 }).format(Number(input.total));
  const greeting = input.customerName ? `Hello ${input.customerName},` : "Hello,";
  const tracking = input.milestone === "shipped" && input.trackingNumber ? `<p style="margin:20px 0 0;color:#536070">Tracking reference: <strong>${input.trackingNumber}</strong></p>` : "";
  const html = `<div style="background:#f6f3ed;padding:36px 18px;font-family:Arial,sans-serif;color:#182132"><div style="max-width:560px;margin:0 auto;background:#ffffff;padding:34px;border-radius:18px"><p style="font-size:11px;font-weight:700;letter-spacing:2px;color:#a37c35;margin:0">ZALIM MARKETING</p><h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.05;margin:14px 0">${message.title}</h1><p style="font-size:15px;line-height:1.65;color:#536070">${greeting}<br/>${message.message}</p><div style="margin-top:24px;padding:16px;border-radius:12px;background:#f6f3ed"><p style="margin:0;font-size:12px;letter-spacing:1px;color:#6b7280">ORDER ${input.orderNumber}</p><p style="margin:8px 0 0;font-size:17px;font-weight:700">${total}</p></div>${tracking}<p style="margin-top:28px;font-size:12px;line-height:1.6;color:#6b7280">Road-ready essentials, thoughtfully selected.</p></div></div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [input.recipient], subject: `${message.subject} · ${input.orderNumber}`, html }),
  });
  if (!response.ok) throw new Error("Order notification could not be delivered.");
  return { delivered: true, skipped: false } as const;
}
