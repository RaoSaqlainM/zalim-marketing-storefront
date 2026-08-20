export type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type StoreBrand = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
};

export type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  specifications: Record<string, string> | null;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  createdAt: Date | string;
  category: StoreCategory | null;
  brand: StoreBrand | null;
};

export const heroImage = "/manus-storage/autogear-hero_c8cf25af.jpg";
export const promoImage = "/manus-storage/promo-workshop_27e6a3cd.jpg";

export function formatCurrency(value: string | number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function discountedPercent(product: Pick<StoreProduct, "price" | "compareAtPrice">) {
  if (!product.compareAtPrice || Number(product.compareAtPrice) <= Number(product.price)) return null;
  return Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100);
}

export function productImage(product: Pick<StoreProduct, "imageUrl">) {
  return product.imageUrl || "/manus-storage/category-utility_fa340543.jpg";
}

export const policyContent: Record<string, { eyebrow: string; title: string; intro: string; sections: Array<{ heading: string; body: string }> }> = {
  about: {
    eyebrow: "Our point of view",
    title: "Better journeys are built in the details.",
    intro: "Zalim Marketing curates practical automotive essentials with a simple standard: each item should earn its place before, during and after the journey.",
    sections: [
      { heading: "Considered utility", body: "We focus on accessories that quietly improve the daily drive, from dependable roadside tools to cabin pieces that make every mile feel more ordered." },
      { heading: "A more useful marketplace", body: "The collection is designed to be easy to explore, clear to compare and grounded in practical specifications rather than unnecessary noise." },
      { heading: "Made for the road ahead", body: "Whether the trip is familiar or far from home, we believe smart preparation is a simple kind of luxury." },
    ],
  },
  contact: {
    eyebrow: "Support updates",
    title: "Clear guidance, built around your order.",
    intro: "Zalim Marketing is preparing its customer support channels. In the meantime, account-based order details remain the source of truth for purchase and delivery progress.",
    sections: [
      { heading: "Order guidance", body: "Sign in to review an order’s status, delivery address and tracking reference. These details update with each recorded fulfilment milestone." },
      { heading: "Product guidance", body: "Use Vehicle finder as a starting point, then compare product specifications carefully before placing an order. Vehicle-specific fit should always be confirmed from the listed details." },
      { heading: "Support channel", body: "A direct customer-support route will be published here once the store owner connects its preferred service. No phone or email contact details are currently displayed." },
    ],
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "The essentials, clarified.",
    intro: "A few concise answers to help you shop with confidence.",
    sections: [
      { heading: "How do I know an item is in stock?", body: "Each product page shows the current stock status. Items can only be added to cart in available quantities." },
      { heading: "Can I change my delivery address?", body: "You can save and manage addresses from your account. Changes to an order that has not progressed to fulfilment will become available when the store’s support service is connected." },
      { heading: "Where can I find my order updates?", body: "Your account shows order history and status milestones. Order notifications will be activated when the store owner connects the delivery service." },
    ],
  },
  shipping: {
    eyebrow: "Delivery details",
    title: "Clear shipping, carefully handled.",
    intro: "We want delivery expectations to feel as considered as the products you choose.",
    sections: [
      { heading: "Dispatch timing", body: "Confirmed orders are prepared in the order they are received. Dispatch timing and carrier availability are shown in your order communications." },
      { heading: "Delivery charges", body: "Shipping is calculated clearly at checkout. Orders over the stated threshold qualify for complimentary standard delivery." },
      { heading: "Tracking", body: "Once an order is handed to the carrier, the shipment status and tracking reference appear in your account and shipment notification." },
    ],
  },
  returns: {
    eyebrow: "Returns policy",
    title: "A simple path when something is not right.",
    intro: "If an order is damaged, incorrect or not as expected, Zalim Marketing will provide a clear return-request route when customer support is activated.",
    sections: [
      { heading: "Requesting a return", body: "The return-request form and support route will be published with the store’s customer-service connection. Keep your order number and any relevant product-condition photographs ready." },
      { heading: "Product condition", body: "To be eligible for return assessment, items should be unused, complete and in their original packaging unless the product arrived damaged or incorrect." },
      { heading: "Resolution", body: "After review, we will confirm the available resolution, which may include replacement, store credit or refund according to the applicable circumstances." },
    ],
  },
};
