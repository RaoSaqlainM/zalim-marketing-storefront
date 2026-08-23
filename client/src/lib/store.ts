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
export const motorOilImage = "/manus-storage/zalim-meridian-motor-oil_d2ae9ba4.png";

export function formatCurrency(value: string | number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
}

export function discountedPercent(product: Pick<StoreProduct, "price" | "compareAtPrice">) {
  if (!product.compareAtPrice || Number(product.compareAtPrice) <= Number(product.price)) return null;
  return Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100);
}

export function productImage(product: Pick<StoreProduct, "imageUrl" | "name">) {
  if (product.name.toLowerCase().includes("engine oil")) return motorOilImage;
  return product.imageUrl || "/manus-storage/category-utility_fa340543.jpg";
}

export const policyContent: Record<string, { eyebrow: string; title: string; intro: string; sections: Array<{ heading: string; body: string }> }> = {
  about: {
    eyebrow: "About Zalim-Marketing",
    title: "Built for the way real vehicles are used.",
    intro: "Zalim-Marketing is an independent automotive marketplace created by Saqlain Mushtaq for drivers who want useful products, clear fitment context and a direct line to a real person before they order.",
    sections: [
      { heading: "Why Zalim-Marketing exists", body: "A useful automotive store should help with the decision before it asks for the order. Zalim-Marketing was built around the practical moments that shape ownership: preparing for a commute, protecting a cabin, planning a family trip, improving visibility or putting together a reliable touring kit." },
      { heading: "A practical product edit", body: "The catalogue is organised across car care, interior comfort, lighting and technology, roadside utility, power, exterior protection, touring and workshop essentials. Products are selected around everyday usefulness, clear specifications and the situations in which drivers actually use them." },
      { heading: "Vehicle context first", body: "The Vehicle Finder uses familiar United Kingdom, United States and Australian vehicle examples, including Ford, Toyota, Volkswagen, BMW, Honda, Chevrolet, Jeep, Mazda, Hyundai and Subaru. It is a practical starting point, not a replacement for product dimensions, fitment notes or a direct enquiry." },
      { heading: "Clear pricing and direct support", body: "Catalogue prices are displayed in EUR so the product price is easy to understand before you ask about delivery. Zalim-Marketing currently uses an enquiry-first process, which means availability, delivery options and next steps are confirmed directly rather than hidden behind a checkout flow." },
      { heading: "Who runs the marketplace", body: "Zalim-Marketing is owned and developed by Saqlain Mushtaq. The marketplace is designed to stay direct and practical: if something is unclear, you can ask about the product, the vehicle context or the destination before agreeing an order." },
      { heading: "How to get useful guidance", body: "For the best response, send the product name or link, your vehicle make, model and year where relevant, and the city or country for delivery. WhatsApp support is available at +92 325 5531155 and detailed enquiries can be sent to raosaqlaingee@gmail.com." },
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
    eyebrow: "FAQs",
    title: "Useful answers before you enquire.",
    intro: "These answers explain how the Zalim-Marketing catalogue, vehicle guidance, delivery discussion and enquiry-first ordering process work.",
    sections: [
      { heading: "How do I use the catalogue?", body: "Start with a department, search for a product or use Vehicle Finder when the item depends on the car. Each product page includes the listed EUR price, key information, availability guidance and an option to add the item to an enquiry shortlist." },
      { heading: "How do I check fitment?", body: "Use the Vehicle Finder for a helpful first filter, then read the product description, dimensions and compatibility notes. For vehicle-specific parts or accessories, include your make, model and year in your enquiry so the request can be reviewed with the right context." },
      { heading: "Are listed products available immediately?", body: "Product pages show the current catalogue status, but final availability is confirmed after an enquiry. If you need several units, a replacement or an alternative product, mention that in your message so the request can be reviewed properly." },
      { heading: "Why are prices shown in EUR?", body: "Zalim-Marketing uses EUR for clear catalogue pricing across the marketplace. Delivery, any destination-specific charges and the final order arrangement are discussed directly because item size, route and carrier coverage can vary." },
      { heading: "How does an order enquiry work?", body: "Add products to your basket or send the item link through WhatsApp or email. Include your vehicle context where useful and your destination. Zalim-Marketing then reviews availability and responds with the next practical step before any order is agreed." },
      { heading: "Can I pay through the website?", body: "No. The website does not collect card details and does not present a payment form. Zalim-Marketing currently uses a direct enquiry process so product, availability and delivery information can be confirmed clearly first." },
      { heading: "How is delivery arranged?", body: "Delivery timing and the available route depend on the item, destination and confirmed availability. Include your city, country and delivery preference in the enquiry so a suitable option can be discussed." },
      { heading: "How do I contact support?", body: "WhatsApp +92 325 5531155 is the quickest route for product and fitment questions. For longer requests, email raosaqlaingee@gmail.com with the product name or link, vehicle details and destination." },
    ],
  },
  shipping: {
    eyebrow: "Delivery information",
    title: "Delivery details are confirmed before an order is agreed.",
    intro: "Zalim-Marketing uses a request-first delivery process so the product, destination, route and handover details can be discussed clearly before anything is finalised.",
    sections: [
      { heading: "Start with a complete request", body: "Send the selected product names or links, the quantity required, your vehicle context where relevant, and the city and country for delivery. This gives Zalim-Marketing the information needed to discuss a realistic route and timing." },
      { heading: "Availability is checked first", body: "An enquiry is not an automatic order confirmation. The item, quantity and current availability are reviewed before a delivery arrangement is discussed, helping to avoid assumptions about stock or dispatch timing." },
      { heading: "How delivery costs are handled", body: "Product prices are shown in EUR. Delivery costs are confirmed separately because carriers, destination coverage, parcel dimensions and item weight can change the practical options available." },
      { heading: "Estimated timing", body: "Any timing shared before an order is agreed is an estimate based on the information available at that point. Final timing depends on the confirmed item, destination, carrier option and the details agreed directly with you." },
      { heading: "Address and contact details", body: "When a delivery route is agreed, provide a complete delivery address, a contact name and a reachable phone number. Check these details carefully before confirming them, as they are used to plan the handover." },
      { heading: "Tracking and handover updates", body: "Where tracking, dispatch or handover information is available, it is shared through the contact method used for the enquiry. Keep the order conversation available until the delivery is complete." },
      { heading: "Questions before delivery", body: "If you are comparing destinations, timing or product alternatives, ask before an order is agreed. Direct guidance is available through WhatsApp +92 325 5531155 or raosaqlaingee@gmail.com." },
    ],
  },
  returns: {
    eyebrow: "Returns and issue resolution",
    title: "Returns policy built around a clear conversation.",
    intro: "If an agreed order arrives damaged, incorrect or materially different from the confirmed item, contact Zalim-Marketing promptly so the issue can be assessed with the product and delivery details in view.",
    sections: [
      { heading: "When to contact us", body: "Contact Saqlain through WhatsApp or email as soon as possible after delivery if an item is damaged, incorrect, incomplete, faulty on arrival or materially different from the confirmed item. Early contact helps match the report to the agreed order and delivery record." },
      { heading: "What to include in the report", body: "Include the item name, order reference or conversation details, a concise explanation, clear photographs or video where relevant, and the delivery location. Keep the original packaging and any delivery labels until the issue has been reviewed." },
      { heading: "Condition for standard returns", body: "Where a return is accepted for a change of mind or a product that is not faulty, the item should normally be unused, complete, in resaleable condition and returned with its original packaging. The final route is discussed before anything is sent back." },
      { heading: "Products requiring additional review", body: "Vehicle-specific parts, electrical products, opened consumables, hygiene-sensitive items and products showing installation or use may need additional assessment. This protects safety, fitment and resale conditions for every customer." },
      { heading: "Return approval and instructions", body: "Do not send an item to an address unless return instructions have been agreed in writing. If a return route is approved, Zalim-Marketing will explain the required steps, destination and any information needed to identify the parcel." },
      { heading: "Possible resolutions", body: "After the request is reviewed, the available resolution is explained clearly. Depending on the confirmed circumstances, this may include a replacement, exchange, return arrangement, store credit or refund. The appropriate route depends on the item, issue and order agreement." },
      { heading: "Return delivery and timing", body: "Return transport, costs and timing are confirmed directly because destination, item size and the reason for the return can vary. Keep proof of return or handover where it applies until the request is resolved." },
      { heading: "Need help with a fitment issue?", body: "If a vehicle-specific item does not appear right, stop installation where safe to do so and contact support with the product, vehicle make, model and year. This gives Zalim-Marketing the context needed to assess the next step." },
    ],
  },
  privacy: {
    eyebrow: "Privacy policy",
    title: "Your details are used to handle your request, not to create noise.",
    intro: "This privacy policy explains how Zalim-Marketing handles information provided through the website, WhatsApp and email while the marketplace operates on an enquiry-first basis.",
    sections: [
      { heading: "Who is responsible for this information", body: "Zalim-Marketing is managed by Saqlain Mushtaq. For a privacy question or a request about information connected with an enquiry or agreed order, email raosaqlaingee@gmail.com with enough detail to identify the relevant conversation." },
      { heading: "Information you may provide", body: "This may include your name, email address, WhatsApp number, product request, vehicle make, model and year, delivery location, order details and the messages you send to support. Please do not send sensitive information that is not needed to answer your request." },
      { heading: "How the information is used", body: "Information is used to answer product questions, discuss vehicle context, confirm availability, prepare delivery options, manage an agreed order, resolve an issue and provide post-order support. It is not published publicly through the website." },
      { heading: "Website activity and technical information", body: "Like most websites, technical information may be processed to operate, secure and improve the site, such as browser or device information and basic usage signals. Zalim-Marketing does not use this website to collect payment-card details." },
      { heading: "Contact services and third parties", body: "If you contact Zalim-Marketing through WhatsApp or email, those providers handle your messages according to their own terms and privacy practices. Delivery or product suppliers may receive only the information reasonably needed to fulfil an agreed request." },
      { heading: "How long information is kept", body: "Enquiry and order information is retained only for as long as reasonably needed to respond, manage an agreed request, resolve an issue and meet applicable record-keeping requirements. The retention period can differ depending on the request and whether an order was agreed." },
      { heading: "Your requests and choices", body: "You can ask about the information connected with your enquiry, request a correction or ask for deletion by contacting raosaqlaingee@gmail.com. Some information may need to be retained where it is necessary for an agreed order, issue resolution or legal record-keeping." },
      { heading: "Changes to this policy", body: "This policy may be updated as Zalim-Marketing develops its services, catalogue and ordering process. The current version is published on this page, and the page should be reviewed before providing new information." },
    ],
  },
  terms: {
    eyebrow: "Terms of use",
    title: "Straightforward terms for using the catalogue.",
    intro: "The Zalim-Marketing website is an information and enquiry platform for automotive products. A submitted enquiry does not automatically create an order, reserve stock or confirm delivery.",
    sections: [
      { heading: "Using the website", body: "You may browse the catalogue, use Vehicle Finder, create an enquiry shortlist and contact support for lawful personal or business purchasing purposes. Do not use the site in a way that interferes with its security, availability or other users." },
      { heading: "Catalogue information", body: "Product descriptions, vehicle examples, EUR prices, images, specifications and availability indicators are provided to support an informed enquiry. Check product-specific details, dimensions and compatibility notes before requesting an order." },
      { heading: "Vehicle fitment", body: "Vehicle Finder and product fitment references are guidance tools. You remain responsible for confirming that an item is appropriate for the vehicle, installation method and intended use. Ask support when a product is vehicle-specific or any detail is unclear." },
      { heading: "Enquiries and availability", body: "An enquiry is a request for information or a proposed order, not an automatic confirmation. Availability, quantity, delivery options and the final agreed details are confirmed directly before an order is accepted." },
      { heading: "Prices and delivery", body: "Catalogue prices are shown in EUR. Delivery costs, timing and any destination-specific arrangements are discussed separately because carrier coverage, item dimensions and destination can vary. Obvious errors may be corrected before an order is agreed." },
      { heading: "Payment handling", body: "Zalim-Marketing does not collect payment-card details through this website and no card payment form is presented on the storefront. Any order arrangement is discussed through the direct enquiry process once the relevant details are clear." },
      { heading: "Your information", body: "Provide accurate contact, vehicle and delivery information when asking for assistance. Do not provide information you are not authorised to share. Privacy information is explained separately in the Zalim-Marketing Privacy page." },
      { heading: "Changes and contact", body: "The catalogue, guidance pages and these terms may be updated as the marketplace develops. If you have a question about using the site, contact Zalim-Marketing through WhatsApp +92 325 5531155 or raosaqlaingee@gmail.com before relying on an assumption." },
    ],
  },
};
