import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { brands, categories, products } from "../drizzle/schema.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the catalog.");
}

const db = drizzle(process.env.DATABASE_URL);

const media = {
  detailing: "/manus-storage/category-detailing_2f0366b5.jpg",
  interior: "/manus-storage/category-interior_d5e055da.jpg",
  utility: "/manus-storage/category-utility_fa340543.jpg",
  inflator: "/manus-storage/product-orbit-inflator_5d9564fd.jpg",
  detailKit: "/manus-storage/product-sierra-detail-kit_30c89008.jpg",
  organizer: "/manus-storage/product-atlas-organizer_955f56bc.jpg",
  mount: "/manus-storage/product-velar-mount_85a6698c.jpg",
  light: "/manus-storage/product-nova-light_24e6c57b.jpg",
};

const categoryRows = [
  { name: "Car Care", slug: "car-care", description: "Refined maintenance essentials for every mile.", imageUrl: media.detailing, isFeatured: true, sortOrder: 1 },
  { name: "Cabin & Comfort", slug: "cabin-comfort", description: "Thoughtful details for a calmer, better cabin.", imageUrl: media.interior, isFeatured: true, sortOrder: 2 },
  { name: "Roadside Utility", slug: "roadside-utility", description: "Dependable tools for everyday preparedness.", imageUrl: media.utility, isFeatured: true, sortOrder: 3 },
  { name: "Tech & Power", slug: "tech-power", description: "Useful technology built for the road.", imageUrl: media.interior, isFeatured: false, sortOrder: 4 },
];

for (const category of categoryRows) {
  await db.insert(categories).values(category).onDuplicateKeyUpdate({ set: category });
}

const brandRows = [
  { name: "Northline", slug: "northline", description: "Engineered essentials for considered driving.", logoUrl: null },
  { name: "VelaWorks", slug: "velaworks", description: "Minimal utility and dependable road technology.", logoUrl: null },
  { name: "Sierra Form", slug: "sierra-form", description: "Tactile car-care tools with refined materials.", logoUrl: null },
  { name: "Atlas Supply", slug: "atlas-supply", description: "Preparedness gear for every journey.", logoUrl: null },
];

for (const brand of brandRows) {
  await db.insert(brands).values(brand).onDuplicateKeyUpdate({ set: brand });
}

const categoryLookup = new Map();
for (const item of categoryRows) {
  const row = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, item.slug)).limit(1);
  categoryLookup.set(item.slug, row[0].id);
}
const brandLookup = new Map();
for (const item of brandRows) {
  const row = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, item.slug)).limit(1);
  brandLookup.set(item.slug, row[0].id);
}

const productRows = [
  {
    name: "Orbit Air Compact Inflator",
    slug: "orbit-air-compact-inflator",
    sku: "AG-ORB-100",
    shortDescription: "A compact cordless inflator designed for a precise, confident top-up.",
    description: "Orbit Air brings a composed, reliable approach to everyday tyre care. Its compact form stores neatly in a glovebox or boot, while the flexible hose and adaptive nozzles make quick pressure adjustments straightforward.",
    specifications: { Power: "Cordless rechargeable", Display: "Digital pressure readout", Included: "Flexible hose and adapters", Storage: "Compact travel case" },
    price: "6490.00",
    compareAtPrice: "7490.00",
    stockQuantity: 26,
    imageUrl: media.inflator,
    categoryId: categoryLookup.get("roadside-utility"),
    brandId: brandLookup.get("northline"),
    isFeatured: true,
    isNew: true,
    isActive: true,
  },
  {
    name: "Sierra Detail Ritual Kit",
    slug: "sierra-detail-ritual-kit",
    sku: "AG-SIR-200",
    shortDescription: "Four essential tools for an intentionally better wash-day routine.",
    description: "A coordinated collection of car-care essentials designed to make regular maintenance feel deliberate. The Sierra Detail Ritual Kit pairs a gentle surface cleanser, premium microfiber, fine detailing brush and protective wax finish.",
    specifications: { Contents: "Four-piece care set", Surface: "Suitable for painted and interior surfaces", Finish: "Low-residue", Cloth: "Dense microfiber" },
    price: "4890.00",
    compareAtPrice: "5490.00",
    stockQuantity: 38,
    imageUrl: media.detailKit,
    categoryId: categoryLookup.get("car-care"),
    brandId: brandLookup.get("sierra-form"),
    isFeatured: true,
    isNew: false,
    isActive: true,
  },
  {
    name: "Atlas Foldaway Trunk System",
    slug: "atlas-foldaway-trunk-system",
    sku: "AG-ATL-320",
    shortDescription: "Structured storage that keeps the essentials exactly where you expect them.",
    description: "The Atlas Foldaway Trunk System adds quiet order to your everyday carry. Its tailored form holds roadside tools, shopping or travel necessities securely, then collapses flat when not in use.",
    specifications: { Material: "Structured woven fabric", Compartments: "Adjustable dividers", Base: "Non-slip", Format: "Fold-flat" },
    price: "5790.00",
    compareAtPrice: null,
    stockQuantity: 19,
    imageUrl: media.organizer,
    categoryId: categoryLookup.get("cabin-comfort"),
    brandId: brandLookup.get("atlas-supply"),
    isFeatured: true,
    isNew: true,
    isActive: true,
  },
  {
    name: "Vela Magnetic Vent Mount",
    slug: "vela-magnetic-vent-mount",
    sku: "AG-VEL-410",
    shortDescription: "A discreet magnetic mount with a clean, steady hold.",
    description: "Vela removes the visual clutter from everyday navigation. Its compact magnetic head and precision vent grip keep your phone in a natural position without overwhelming the cabin architecture.",
    specifications: { Mount: "Magnetic vent clip", Rotation: "360-degree adjustment", Material: "Matte polymer and metal", Included: "Slim mounting ring" },
    price: "2490.00",
    compareAtPrice: "2890.00",
    stockQuantity: 62,
    imageUrl: media.mount,
    categoryId: categoryLookup.get("tech-power"),
    brandId: brandLookup.get("velaworks"),
    isFeatured: true,
    isNew: false,
    isActive: true,
  },
  {
    name: "Nova Safety Signal Light",
    slug: "nova-safety-signal-light",
    sku: "AG-NOV-510",
    shortDescription: "A compact rechargeable signal light for the unexpected stop.",
    description: "Nova is a small but practical layer of visibility for the road ahead. Its triangular, weather-ready form stores neatly in the vehicle and gives a clear amber signal when you need it most.",
    specifications: { Light: "Amber emergency beacon", Power: "Rechargeable", Housing: "Weather-ready", Positioning: "Magnetic base" },
    price: "3290.00",
    compareAtPrice: null,
    stockQuantity: 41,
    imageUrl: media.light,
    categoryId: categoryLookup.get("roadside-utility"),
    brandId: brandLookup.get("atlas-supply"),
    isFeatured: false,
    isNew: true,
    isActive: true,
  },
  {
    name: "Northline Cabin Air Brush",
    slug: "northline-cabin-air-brush",
    sku: "AG-NOR-620",
    shortDescription: "Soft bristles made for the vents, seams and details that deserve attention.",
    description: "A finely made detail brush designed for the overlooked spaces in your cabin. It is soft enough for sensitive surfaces, compact enough for the glovebox and pleasingly simple to use.",
    specifications: { Bristles: "Soft synthetic", Grip: "Textured anodized handle", Use: "Vents and cabin details", Care: "Washable" },
    price: "1290.00",
    compareAtPrice: null,
    stockQuantity: 74,
    imageUrl: media.detailKit,
    categoryId: categoryLookup.get("car-care"),
    brandId: brandLookup.get("northline"),
    isFeatured: false,
    isNew: false,
    isActive: true,
  },
  {
    name: "Vela RoadCharge 45W Adapter",
    slug: "vela-roadcharge-45w-adapter",
    sku: "AG-VEL-710",
    shortDescription: "A streamlined dual-port charger for dependable power on the move.",
    description: "RoadCharge is designed to sit quietly in your centre console while keeping your essential devices ready. Dual ports allow two devices to charge together without the usual tangle.",
    specifications: { Output: "45W dual-port", Connection: "12V vehicle socket", Ports: "USB-C and USB-A", Finish: "Matte alloy" },
    price: "3790.00",
    compareAtPrice: "4290.00",
    stockQuantity: 47,
    imageUrl: media.mount,
    categoryId: categoryLookup.get("tech-power"),
    brandId: brandLookup.get("velaworks"),
    isFeatured: false,
    isNew: true,
    isActive: true,
  },
  {
    name: "Atlas Weekender Seatback Tote",
    slug: "atlas-weekender-seatback-tote",
    sku: "AG-ATL-820",
    shortDescription: "A refined seatback organiser for a more collected journey.",
    description: "The Weekender Seatback Tote keeps travel pieces organised without bringing visual noise to your cabin. Its minimal profile conceals practical pockets for cables, bottles and small passenger essentials.",
    specifications: { Attachment: "Adjustable seatback straps", Pockets: "Six structured compartments", Material: "Wipe-clean fabric", Profile: "Slim fit" },
    price: "4590.00",
    compareAtPrice: null,
    stockQuantity: 21,
    imageUrl: media.organizer,
    categoryId: categoryLookup.get("cabin-comfort"),
    brandId: brandLookup.get("atlas-supply"),
    isFeatured: true,
    isNew: false,
    isActive: true,
  },
];

for (const product of productRows) {
  await db.insert(products).values(product).onDuplicateKeyUpdate({ set: product });
}

console.log(`Seeded ${categoryRows.length} categories, ${brandRows.length} brands, and ${productRows.length} products.`);
