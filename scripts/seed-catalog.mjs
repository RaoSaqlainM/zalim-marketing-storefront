import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { brands, categories, products } from "../drizzle/schema.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the catalog.");

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
  { name: "Car Care", slug: "car-care", description: "Washing, detailing and seasonal protection for everyday cars and weekend projects.", imageUrl: media.detailing, isFeatured: true, sortOrder: 1 },
  { name: "Interior & Comfort", slug: "cabin-comfort", description: "Useful cabin storage, cleaning and travel upgrades for every drive.", imageUrl: media.interior, isFeatured: true, sortOrder: 2 },
  { name: "Safety & Utility", slug: "roadside-utility", description: "Roadside, boot and touring essentials for real-world preparedness.", imageUrl: media.utility, isFeatured: true, sortOrder: 3 },
  { name: "Lighting & Electrical", slug: "tech-power", description: "Practical charging, visibility and phone solutions for modern vehicles.", imageUrl: media.light, isFeatured: true, sortOrder: 4 },
  { name: "Exterior & Touring", slug: "exterior-touring", description: "Flexible, road-ready storage and utility solutions for longer journeys.", imageUrl: media.utility, isFeatured: false, sortOrder: 5 },
  { name: "Phone & Navigation", slug: "phone-navigation", description: "Secure mounts and power accessories for safer everyday navigation.", imageUrl: media.mount, isFeatured: false, sortOrder: 6 },
];

for (const category of categoryRows) await db.insert(categories).values(category).onDuplicateKeyUpdate({ set: category });

const brandRows = [
  { name: "Northline", slug: "northline", description: "Practical vehicle essentials for everyday miles.", logoUrl: null },
  { name: "VelaWorks", slug: "velaworks", description: "Clean, dependable electrical and navigation accessories.", logoUrl: null },
  { name: "Sierra Form", slug: "sierra-form", description: "Car care tools designed for repeat use.", logoUrl: null },
  { name: "Atlas Supply", slug: "atlas-supply", description: "Storage and preparedness equipment for road trips and touring.", logoUrl: null },
];

for (const brand of brandRows) await db.insert(brands).values(brand).onDuplicateKeyUpdate({ set: brand });

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
  { name: "Orbit Air Digital Tyre Inflator", slug: "orbit-air-digital-tyre-inflator", sku: "ZM-ORB-100", shortDescription: "A compact 12V inflator for quick, clear tyre-pressure top-ups.", description: "Keep tyre checks simple at home, on a road trip or before a long commute. Orbit Air has a digital pressure readout, a flexible hose and a compact carry case.", specifications: { VehicleExamples: "Toyota Corolla, Ford Ranger, VW Golf, Mazda CX-5", Power: "12V vehicle socket", Display: "Digital pressure readout", Storage: "Compact zip case" }, price: "39.90", compareAtPrice: "49.90", stockQuantity: 46, imageUrl: media.inflator, categoryId: categoryLookup.get("roadside-utility"), brandId: brandLookup.get("northline"), isFeatured: true, isNew: true, isActive: true },
  { name: "Sierra All-Season Detail Kit", slug: "sierra-all-season-detail-kit", sku: "ZM-SIR-200", shortDescription: "A four-piece wash and interior-care set for regular use.", description: "A straightforward collection for paintwork, trims and cabin surfaces. The kit includes a cleaner, microfiber cloth, soft brush and finishing wax.", specifications: { VehicleExamples: "Universal fit for UK, US and Australian vehicles", Contents: "Four-piece care set", Surfaces: "Paint, plastic and interior trim", Cloth: "Dense microfiber" }, price: "32.00", compareAtPrice: "39.00", stockQuantity: 58, imageUrl: media.detailKit, categoryId: categoryLookup.get("car-care"), brandId: brandLookup.get("sierra-form"), isFeatured: true, isNew: false, isActive: true },
  { name: "Atlas Boot Organiser", slug: "atlas-boot-organiser", sku: "ZM-ATL-320", shortDescription: "Fold-flat boot storage for cables, groceries, recovery gear and travel items.", description: "A structured organiser with adjustable dividers and a non-slip base. Use it in a hatchback, SUV, ute or pickup to keep loose essentials in one place.", specifications: { VehicleExamples: "Ford Ranger, Toyota Hilux, Subaru Outback, VW Tiguan", Compartments: "Adjustable dividers", Base: "Non-slip", Format: "Fold-flat" }, price: "44.00", compareAtPrice: null, stockQuantity: 35, imageUrl: media.organizer, categoryId: categoryLookup.get("exterior-touring"), brandId: brandLookup.get("atlas-supply"), isFeatured: true, isNew: true, isActive: true },
  { name: "Vela Magnetic Phone Mount", slug: "vela-magnetic-phone-mount", sku: "ZM-VEL-410", shortDescription: "A compact vent mount that holds navigation securely and neatly.", description: "Vela keeps your phone visible without filling the windscreen. Its metal vent clip and rotating magnetic head suit everyday navigation in a wide range of vehicles.", specifications: { VehicleExamples: "Ford F-150, Honda Civic, BMW 3 Series, Toyota Yaris", Mount: "Magnetic vent clip", Rotation: "360-degree adjustment", Included: "Slim mounting ring" }, price: "19.00", compareAtPrice: "24.00", stockQuantity: 82, imageUrl: media.mount, categoryId: categoryLookup.get("phone-navigation"), brandId: brandLookup.get("velaworks"), isFeatured: true, isNew: false, isActive: true },
  { name: "Nova Emergency Beacon Light", slug: "nova-emergency-beacon-light", sku: "ZM-NOV-510", shortDescription: "A rechargeable roadside visibility light with a magnetic base.", description: "Store Nova in the boot or side compartment for unexpected stops. The weather-ready housing and amber beacon help make your vehicle more visible when needed.", specifications: { VehicleExamples: "Universal fit for sedans, SUVs, utes and pickups", Light: "Amber emergency beacon", Power: "Rechargeable", Base: "Magnetic" }, price: "27.00", compareAtPrice: null, stockQuantity: 64, imageUrl: media.light, categoryId: categoryLookup.get("roadside-utility"), brandId: brandLookup.get("atlas-supply"), isFeatured: false, isNew: true, isActive: true },
  { name: "Northline Vent & Trim Brush", slug: "northline-vent-trim-brush", sku: "ZM-NOR-620", shortDescription: "Soft detailing bristles for vents, seams and hard-to-reach cabin surfaces.", description: "A compact, washable brush for the small interior spaces that collect dust quickly. The textured handle is easy to grip while the bristles stay gentle on trim.", specifications: { VehicleExamples: "Universal cabin accessory", Bristles: "Soft synthetic", Grip: "Textured handle", Care: "Washable" }, price: "12.00", compareAtPrice: null, stockQuantity: 94, imageUrl: media.detailKit, categoryId: categoryLookup.get("car-care"), brandId: brandLookup.get("northline"), isFeatured: false, isNew: false, isActive: true },
  { name: "Vela RoadCharge 45W Adapter", slug: "vela-roadcharge-45w-adapter", sku: "ZM-VEL-710", shortDescription: "A dual-port 12V charger for phones, tablets and navigation devices.", description: "RoadCharge delivers practical fast charging without clutter. Two ports make it easy to keep a phone and passenger device powered on longer drives.", specifications: { VehicleExamples: "Toyota RAV4, Ford Focus, Hyundai i30, Mazda 3", Output: "45W dual-port", Ports: "USB-C and USB-A", Connection: "12V vehicle socket" }, price: "29.00", compareAtPrice: "34.00", stockQuantity: 73, imageUrl: media.mount, categoryId: categoryLookup.get("tech-power"), brandId: brandLookup.get("velaworks"), isFeatured: false, isNew: true, isActive: true },
  { name: "Atlas Seatback Travel Organiser", slug: "atlas-seatback-travel-organiser", sku: "ZM-ATL-820", shortDescription: "A slim seatback organiser for family trips, work travel and everyday storage.", description: "Keep cables, water bottles, travel documents and passenger essentials in easy reach. The adjustable straps suit most front seatbacks without a bulky profile.", specifications: { VehicleExamples: "Kia Sportage, Toyota Prado, Ford Explorer, Skoda Octavia", Pockets: "Six compartments", Material: "Wipe-clean fabric", Fit: "Adjustable seatback straps" }, price: "36.00", compareAtPrice: null, stockQuantity: 39, imageUrl: media.organizer, categoryId: categoryLookup.get("cabin-comfort"), brandId: brandLookup.get("atlas-supply"), isFeatured: true, isNew: false, isActive: true },
  { name: "Sierra Microfibre Drying Towel", slug: "sierra-microfibre-drying-towel", sku: "ZM-SIR-910", shortDescription: "A large, absorbent towel for quick wash-day drying without harsh friction.", description: "A practical finishing towel for weekly cleaning and seasonal detailing. Its dense weave absorbs water efficiently and is machine washable for repeat use.", specifications: { VehicleExamples: "Universal car-care accessory", Size: "Large drying format", Weave: "High-absorbency microfiber", Care: "Machine washable" }, price: "18.00", compareAtPrice: null, stockQuantity: 108, imageUrl: media.detailKit, categoryId: categoryLookup.get("car-care"), brandId: brandLookup.get("sierra-form"), isFeatured: false, isNew: true, isActive: true },
  { name: "Northline LED Inspection Light", slug: "northline-led-inspection-light", sku: "ZM-NOR-1020", shortDescription: "A rechargeable work light for boot checks, campsite setup and quick repairs.", description: "A compact inspection light with a sturdy magnetic base and simple USB charging. Keep one in the garage, boot or touring kit for useful light where you need it.", specifications: { VehicleExamples: "Universal for garage, touring and roadside use", Light: "LED work light", Mount: "Magnetic base", Charging: "USB rechargeable" }, price: "25.00", compareAtPrice: "30.00", stockQuantity: 52, imageUrl: media.light, categoryId: categoryLookup.get("tech-power"), brandId: brandLookup.get("northline"), isFeatured: true, isNew: true, isActive: true },
];

for (const product of productRows) await db.insert(products).values(product).onDuplicateKeyUpdate({ set: product });

console.log(`Seeded ${categoryRows.length} categories, ${brandRows.length} brands, and ${productRows.length} products.`);
