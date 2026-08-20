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
    eyebrow: "About Zalim-Marketing",
    title: "A more considered way to equip the drive.",
    intro: "Zalim-Marketing is an independent automotive marketplace built by Saqlain Mushtaq for people who want useful equipment, clear information and a direct route to real support.",
    sections: [
      { heading: "The idea behind the marketplace", body: "A better automotive store should do more than place products in a grid. Zalim-Marketing is organised around the decisions people actually make before a commute, a family trip, a weekend drive or a longer touring route." },
      { heading: "Built around practical ownership", body: "The range brings together car care, cabin organisation, lighting, roadside preparedness, power, exterior protection, touring and workshop essentials. Each department starts with a simple question: will this make the vehicle easier, safer or more enjoyable to live with?" },
      { heading: "International vehicle context", body: "Vehicle examples reflect familiar United Kingdom, United States and Australian makes including Ford, Toyota, Volkswagen, BMW, Honda, Chevrolet, Jeep, Mazda, Hyundai and Subaru. Examples are a starting point, not a substitute for checking product dimensions and fit notes." },
      { heading: "Who to speak to", body: "Saqlain Mushtaq owns and develops Zalim-Marketing. For a product, fitment or order enquiry, message WhatsApp +92 325 5531155 or email raosaqlaingee@gmail.com with the item, vehicle context and destination." },
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
    eyebrow: "Returns and issue resolution",
    title: "A clear route when something is not right.",
    intro: "This is a working returns policy for the Zalim-Marketing enquiry process. If an agreed order arrives damaged, incorrect or materially different from the confirmed item, contact us promptly so the issue can be assessed properly.",
    sections: [
      { heading: "Raise the issue quickly", body: "Contact Saqlain through WhatsApp or email as soon as possible after delivery. Include the item name, order reference, a concise explanation, clear photographs where relevant and the delivery location. This allows the request to be matched with the agreed order details." },
      { heading: "Eligibility assessment", body: "Each request is reviewed against the item, the condition reported and the order confirmation. Items should normally be unused, complete and returned with their original packaging unless the issue concerns damage, a fault or an incorrect item." },
      { heading: "Items that need special review", body: "Vehicle-specific parts, electrical products, opened consumables and items showing installation or use may need additional assessment before a return route can be agreed. This helps protect fitment, safety and resale conditions for every customer." },
      { heading: "Available resolutions", body: "After review, Zalim-Marketing will explain the available next step. Depending on the confirmed circumstances, this may include return instructions, a replacement, an exchange, store credit or a refund. Delivery and return arrangements are confirmed directly because destinations and item sizes vary." },
      { heading: "Before sending anything back", body: "Do not send an item to an address unless return instructions have been agreed in writing. Retain relevant packaging and proof of delivery until the request is resolved." },
    ],
  },
  privacy: {
    eyebrow: "Privacy policy",
    title: "Your details are used to handle your request.",
    intro: "This working privacy policy explains how Zalim-Marketing uses the information you provide through the website, WhatsApp and email while the marketplace operates on an enquiry-first basis.",
    sections: [
      { heading: "Who manages the information", body: "Zalim-Marketing is managed by Saqlain Mushtaq. For privacy questions or a request relating to information connected with an enquiry, email raosaqlaingee@gmail.com with enough detail to identify the conversation or order request." },
      { heading: "Information you may provide", body: "This can include your name, email address, WhatsApp number, product request, vehicle make, model and year, delivery location and messages you send to support. Please do not send information that is not needed to answer the request." },
      { heading: "Why it is used", body: "Information is used to answer product questions, discuss vehicle context, confirm availability, prepare delivery options, manage an agreed order and provide post-order support. It is not displayed publicly through the website." },
      { heading: "Contact channels and service providers", body: "If you contact Zalim-Marketing through WhatsApp or email, those services handle the message according to their own terms and privacy practices. The website itself does not collect payment-card details and no card payment form is presented on this storefront." },
      { heading: "Retention and requests", body: "Enquiry and order information is kept only for as long as reasonably needed to respond, manage an agreed request and meet applicable record-keeping obligations. You can ask about, correct or request deletion of information by contacting raosaqlaingee@gmail.com, subject to any records that must be retained." },
      { heading: "Policy updates", body: "This policy may be updated as Zalim-Marketing develops its services and ordering process. The latest version will be available on this page." },
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
