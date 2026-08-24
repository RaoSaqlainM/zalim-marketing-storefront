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

export function nextDemoOrderStatus(status: DemoOrderStatus): DemoOrderStatus {
  const currentIndex = demoOrderStatuses.findIndex(step => step.status === status);
  return demoOrderStatuses[Math.min(currentIndex + 1, demoOrderStatuses.length - 1)].status;
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
