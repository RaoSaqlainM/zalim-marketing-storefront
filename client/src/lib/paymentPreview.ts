export type PaymentPreference = "card" | "transfer" | "collection";

export const paymentPreviewDelayMs = 900;

export const paymentPreferenceLabels: Record<PaymentPreference, string> = {
  card: "Card payment after confirmation",
  transfer: "Bank transfer after confirmation",
  collection: "Payment on collection where offered",
};

export function paymentPreviewConfirmation(preference: PaymentPreference) {
  return {
    title: "Preference saved for your enquiry.",
    detail: `Your selected route is ${paymentPreferenceLabels[preference]}. No payment has been processed.`,
  };
}
