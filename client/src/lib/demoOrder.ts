export type DemoOrderLine = {
  name: string;
  quantity: number;
  price: number;
  sku: string;
};

export type TestPaymentDetails = {
  cardholder: string;
  reference: string;
};

export const demoCheckoutSample = {
  enquiry: {
    name: "Sample Customer",
    email: "sample@example.com",
    phone: "+00 000 000 000",
    location: "Example City",
    address: "Test location only — not a real address",
    vehicle: "Sample vehicle — confirm fitment before purchase",
    message: "Browser-local checkout demonstration only.",
  },
  payment: {
    cardholder: "Sample Customer",
    reference: "DEMO-4242",
  },
} as const;

export type DemoOrderStatus = "placed" | "packed" | "dispatched" | "delivered";

export type DemoOrder = {
  createdAt: string;
  deliveryEstimate: string;
  items: DemoOrderLine[];
  reference: string;
  status: DemoOrderStatus;
  subtotal: number;
};

export const demoDeliveryEstimate = "3–5 business days after availability is confirmed";
export const demoOrderStatuses: Array<{ label: string; status: DemoOrderStatus; text: string }> = [
  { status: "placed", label: "Test order placed", text: "The local demo order has been created in this browser." },
  { status: "packed", label: "Packing", text: "The demo shows the selected items being prepared." },
  { status: "dispatched", label: "Dispatched", text: "The demo shows a shipment status, not a real carrier hand-off." },
  { status: "delivered", label: "Delivered", text: "The demo completes the sample order journey in this browser." },
];
export const demoOrderProgressStages: Array<{ label: string; statuses: DemoOrderStatus[]; text: string }> = [
  { label: "Processing", statuses: ["placed", "packed"], text: "We are preparing the selected items in this browser-only test journey." },
  { label: "Shipped", statuses: ["dispatched"], text: "The test journey has reached its simulated shipment stage." },
  { label: "Delivered", statuses: ["delivered"], text: "The test journey has reached its final simulated delivery stage." },
];
export const demoDeliveryGuidance: Record<DemoOrderStatus, { title: string; text: string; timing: string }> = {
  placed: { title: "Test fulfilment review", text: "The local test order is waiting for its next simulated stage. No stock reservation or carrier hand-off is made.", timing: "Test timing: confirmation review" },
  packed: { title: "Test packing update", text: "The selected items are shown as prepared in this browser-only journey. No parcel has been packed.", timing: "Test timing: preparing dispatch" },
  dispatched: { title: "Test shipment update", text: "The tracking display is illustrative only. No carrier booking, tracking number, or shipment has been created.", timing: "Test timing: 3–5 business days after availability review" },
  delivered: { title: "Test delivery complete", text: "The visual journey is complete in this browser. No delivery confirmation or proof of delivery exists.", timing: "Test timing: delivery stage complete" },
};
const demoOrderStorageKey = "zalim-marketing-demo-order";

export function validateTestPayment(details: TestPaymentDetails) {
  if (!details.cardholder.trim()) return "Enter a fictional test cardholder name.";
  if (!/^DEMO-\d{4}$/.test(details.reference.trim().toUpperCase())) return "Use a fictional reference in the format DEMO-4242.";
  return null;
}

export function demoOrderTotal(items: DemoOrderLine[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function createDemoOrder(items: DemoOrderLine[]): DemoOrder {
  return {
    createdAt: new Date().toISOString(),
    deliveryEstimate: demoDeliveryEstimate,
    items,
    reference: `ZM-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "placed",
    subtotal: demoOrderTotal(items),
  };
}

export function createDemoSampleOrder() {
  return createDemoOrder([{ name: "Meridian 5W-30 Fully Synthetic Engine Oil", quantity: 1, price: 49, sku: "ZM-ML-530-5L" }]);
}

export function nextDemoOrderStatus(status: DemoOrderStatus): DemoOrderStatus {
  const currentIndex = demoOrderStatuses.findIndex(step => step.status === status);
  return demoOrderStatuses[Math.min(currentIndex + 1, demoOrderStatuses.length - 1)].status;
}

export function demoOrderProgressIndex(status: DemoOrderStatus) {
  return Math.max(0, demoOrderProgressStages.findIndex(stage => stage.statuses.includes(status)));
}

export function saveDemoOrder(order: DemoOrder) {
  window.localStorage.setItem(demoOrderStorageKey, JSON.stringify(order));
}

export function readDemoOrder(): DemoOrder | null {
  try {
    const stored = window.localStorage.getItem(demoOrderStorageKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as DemoOrder;
    if (!parsed.reference || !Array.isArray(parsed.items) || !demoOrderStatuses.some(step => step.status === parsed.status)) return null;
    return parsed;
  }
  catch {
    return null;
  }
}
