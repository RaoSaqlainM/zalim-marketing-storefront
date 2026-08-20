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
    intro: "AutoGear Market selects useful automotive objects with a simple standard: each item should feel considered before, during and after the journey.",
    sections: [
      { heading: "Considered utility", body: "We focus on accessories that quietly improve the daily drive, from dependable roadside tools to cabin pieces that make every mile feel more ordered." },
      { heading: "A more measured catalog", body: "Our assortment is designed to be easy to explore, clear to compare and grounded in practical specifications rather than unnecessary noise." },
      { heading: "Made for the road ahead", body: "Whether the trip is familiar or far from home, we believe smart preparation is a simple kind of luxury." },
    ],
  },
  contact: {
    eyebrow: "Talk to us",
    title: "Helpful answers, without the runaround.",
    intro: "Our care team is available for product questions, order assistance and delivery support.",
    sections: [
      { heading: "Customer care", body: "Email care@autogear.market with your order number and a short description of what you need. We aim to reply within one business day." },
      { heading: "Product guidance", body: "Need help choosing between two items? Tell us your vehicle, use case and priorities, and we will help you find the better fit." },
      { heading: "Business hours", body: "Monday through Saturday, 10:00–18:00 PKT. Messages received outside these hours are answered on the next business day." },
    ],
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "The essentials, clarified.",
    intro: "A few concise answers to help you shop with confidence.",
    sections: [
      { heading: "How do I know an item is in stock?", body: "Each product page shows the current stock status. Items can only be added to cart in available quantities." },
      { heading: "Can I change my delivery address?", body: "You can save and manage addresses from your account. If an order has not moved to fulfillment, contact us and we will do our best to assist." },
      { heading: "Where can I find my order updates?", body: "Your account shows order history and status milestones. We also email you at placement, confirmation and shipment once email delivery is configured." },
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
    intro: "If your order is damaged, incorrect or not as expected, contact our care team so we can review the best next step.",
    sections: [
      { heading: "Requesting a return", body: "Contact care@autogear.market with your order number, a description of the issue and clear photographs where relevant." },
      { heading: "Product condition", body: "To be eligible for return assessment, items should be unused, complete and in their original packaging unless the product arrived damaged or incorrect." },
      { heading: "Resolution", body: "After review, we will confirm the available resolution, which may include replacement, store credit or refund according to the applicable circumstances." },
    ],
  },
};
