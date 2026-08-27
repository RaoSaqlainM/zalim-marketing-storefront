export type PaymentPreference = "card" | "transfer" | "collection";

export const paymentPreviewDelayMs = 900;

export const paymentPreferenceLabels: Record<PaymentPreference, string> = {
  card: "Fictional card-route preview",
  transfer: "Fictional transfer-route preview",
  collection: "Fictional collection-route preview",
};

export function paymentPreviewConfirmation(preference: PaymentPreference) {
  return {
    title: "Test checkout complete.",
    detail: `The selected route is ${paymentPreferenceLabels[preference].toLowerCase()}. Nothing has been charged or sent to a provider.`,
  };
}
