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
export const promoImage = "/manus-storage/promo-workshop_27e6c57b.jpg";

export function formatCurrency(value: string | number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
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
    eyebrow: "The Zalim-Marketing point of view",
    title: "Better journeys are built in the details.",
    intro: "Zalim-Marketing curates practical automotive essentials with one simple standard: each item should earn its place before, during and after the journey.",
    sections: [
      { heading: "Considered utility", body: "We focus on accessories that quietly improve the daily drive, from dependable roadside tools to cabin pieces that make every mile feel more ordered." },
      { heading: "A more useful marketplace", body: "The catalogue is designed to be easy to explore, clear to compare and grounded in practical specifications rather than unnecessary noise." },
      { heading: "Made for the road ahead", body: "Whether the trip is familiar or far from home, thoughtful preparation is a simple kind of luxury." },
    ],
  },
  contact: {
    eyebrow: "Contact Zalim-Marketing",
    title: "Real support, built around your vehicle.",
    intro: "Talk to Saqlain Mushtaq for product guidance, catalogue questions and order enquiries through WhatsApp or email.",
    sections: [
      { heading: "WhatsApp support", body: "Message +92 325 5531155 for product questions, vehicle guidance and order enquiries. Include your make, model and year when the item is vehicle-specific." },
      { heading: "Email support", body: "For detailed product questions and catalogue requests, email raosaqlaingee@gmail.com. Include the item name or link and your vehicle details where useful." },
      { heading: "Fit guidance", body: "Vehicle Finder is a practical starting point. Always review the fit notes, dimensions and product specifications before requesting an order." },
    ],
  },
  faq: {
    eyebrow: "Frequently asked",
    title: "The essentials, clarified.",
    intro: "A few concise answers to help you shop the catalogue with confidence.",
    sections: [
      { heading: "How do I know an item is available?", body: "Each product page shows the current listed availability. If you need a larger quantity or an alternative item, send a WhatsApp enquiry before planning your order." },
      { heading: "How is delivery arranged?", body: "Delivery timing and the final quote depend on the item, destination and availability. Include your city, country and delivery details in the enquiry form so the request can be reviewed properly." },
      { heading: "Do I pay through the website?", body: "No. Zalim-Marketing currently uses an enquiry-first process. Send your product request and delivery details, then wait for availability and next-step confirmation." },
    ],
  },
  shipping: {
    eyebrow: "Delivery details",
    title: "Delivery is confirmed with your request.",
    intro: "Every destination and item combination is reviewed individually so the information you receive is clear and useful.",
    sections: [
      { heading: "Before dispatch", body: "Send your selected items, vehicle context where relevant and delivery location through the enquiry flow. Zalim-Marketing will then confirm availability and a practical delivery option." },
      { heading: "Delivery quote", body: "Product prices are displayed in EUR. Delivery costs and timing are confirmed directly after the enquiry because carrier coverage, destination and item size can vary." },
      { heading: "Tracking and updates", body: "When a delivery is agreed, the relevant tracking or handover information is shared directly through the contact method used for the enquiry." },
    ],
  },
  returns: {
    eyebrow: "Returns policy",
    title: "A clear route when something is not right.",
    intro: "If an agreed order is damaged, incorrect or not as expected, contact Zalim-Marketing promptly with the order reference and clear photographs where relevant.",
    sections: [
      { heading: "Requesting a return", body: "Contact Saqlain on WhatsApp or email with the item name, the order reference, a short explanation and photographs if the product is damaged or incorrect." },
      { heading: "Product condition", body: "For return assessment, items should normally be unused, complete and in their original packaging unless the product arrived damaged or incorrect." },
      { heading: "Resolution", body: "After reviewing the circumstances, Zalim-Marketing will explain the available next step, which may include an exchange, replacement, store credit or refund where appropriate." },
    ],
  },
  privacy: {
    eyebrow: "Privacy information",
    title: "Your enquiry details stay focused on the request.",
    intro: "Zalim-Marketing only uses the contact, vehicle and delivery information you provide to understand and respond to your product enquiry.",
    sections: [
      { heading: "Information you share", body: "You may provide your name, email address, WhatsApp number, delivery location, vehicle details and product request. Please avoid sharing information that is not needed to answer the enquiry." },
      { heading: "How it is used", body: "The details are used to discuss fit guidance, item availability, delivery options and an agreed order. They are not presented publicly through the website." },
      { heading: "Questions about privacy", body: "For a question about the information connected to an enquiry, contact raosaqlaingee@gmail.com and include enough detail for the request to be identified." },
    ],
  },
  terms: {
    eyebrow: "Terms of use",
    title: "Straightforward catalogue terms.",
    intro: "The Zalim-Marketing website is an information and enquiry platform for automotive products. A submitted enquiry is not an automatic order confirmation.",
    sections: [
      { heading: "Catalogue information", body: "Product descriptions, vehicle examples, EUR prices and availability are provided to support an informed enquiry. Check the product-specific specifications and confirm fit before requesting an order." },
      { heading: "Order enquiries", body: "Availability, delivery options and any final order details are confirmed directly after an enquiry. Zalim-Marketing does not collect payment details through this website." },
      { heading: "Appropriate use", body: "Use the website and support channels lawfully and provide accurate contact, vehicle and delivery information when asking for assistance." },
    ],
  },
};
