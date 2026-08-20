import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import {
  addresses,
  brands,
  cartItems,
  carts,
  categories,
  orderItems,
  orders,
  orderStatusHistory,
  productImages,
  products,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { sendOrderEmail } from "./notifications";
import { createStripeCheckoutSession, isStripeConfigured } from "./payments";

type CatalogFilters = {
  query?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "name";
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};

export const categorySelect = {
  id: categories.id,
  name: categories.name,
  slug: categories.slug,
  description: categories.description,
  imageUrl: categories.imageUrl,
  isFeatured: categories.isFeatured,
  sortOrder: categories.sortOrder,
};

export const brandSelect = {
  id: brands.id,
  name: brands.name,
  slug: brands.slug,
  description: brands.description,
  logoUrl: brands.logoUrl,
};

export const productSelect = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  sku: products.sku,
  shortDescription: products.shortDescription,
  description: products.description,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  stockQuantity: products.stockQuantity,
  imageUrl: products.imageUrl,
  specifications: products.specifications,
  isFeatured: products.isFeatured,
  isNew: products.isNew,
  isActive: products.isActive,
  createdAt: products.createdAt,
  category: categorySelect,
  brand: brandSelect,
};

function catalogOrder(sort: CatalogFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return asc(products.price);
    case "price-desc":
      return desc(products.price);
    case "name":
      return asc(products.name);
    case "featured":
      return desc(products.isFeatured);
    default:
      return desc(products.createdAt);
  }
}

export async function listCatalog(filters: CatalogFilters = {}) {
  const db = await getDb();
  if (!db) return { products: [], total: 0, page: 1, pageSize: filters.pageSize ?? 12 };

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const term = filters.query?.trim();
  const conditions = [
    filters.includeInactive ? undefined : eq(products.isActive, true),
    term ? sql`(${products.name} LIKE ${`%${term}%`} OR ${products.sku} LIKE ${`%${term}%`})` : undefined,
    filters.categorySlug ? eq(categories.slug, filters.categorySlug) : undefined,
    filters.brandSlug ? eq(brands.slug, filters.brandSlug) : undefined,
    filters.minPrice !== undefined ? gte(products.price, filters.minPrice.toFixed(2)) : undefined,
    filters.maxPrice !== undefined ? lte(products.price, filters.maxPrice.toFixed(2)) : undefined,
  ];
  const whereClause = and(...conditions);
  const baseQuery = db
    .select(productSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id));

  const [productRows, countRows] = await Promise.all([
    baseQuery.where(whereClause).orderBy(catalogOrder(filters.sort)).limit(pageSize).offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause),
  ]);

  return {
    products: productRows,
    total: Number(countRows[0]?.count ?? 0),
    page,
    pageSize,
  };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select(productSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  const product = rows[0];
  if (!product) return null;

  const images = await db
    .select({ id: productImages.id, url: productImages.url, altText: productImages.altText, position: productImages.position })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.position));

  return { ...product, images };
}

export async function getFeaturedCatalog(kind: "featured" | "new") {
  const db = await getDb();
  if (!db) return [];
  return db
    .select(productSelect)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.isActive, true), kind === "featured" ? eq(products.isFeatured, true) : eq(products.isNew, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);
}

export async function listCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select(categorySelect).from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select(brandSelect).from(brands).orderBy(asc(brands.name));
}

export async function searchSuggestions(query: string) {
  const db = await getDb();
  const term = query.trim();
  if (!db || term.length < 2) return [];
  return db
    .select({ id: products.id, name: products.name, slug: products.slug, imageUrl: products.imageUrl, price: products.price })
    .from(products)
    .where(and(eq(products.isActive, true), like(products.name, `%${term}%`)))
    .orderBy(desc(products.isFeatured), desc(products.createdAt))
    .limit(6);
}

export async function getCartForUser(userId: number) {
  const db = await getDb();
  if (!db) return { id: null, items: [], subtotal: 0, itemCount: 0 };
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  const cart = existing[0];
  if (!cart) return { id: null, items: [], subtotal: 0, itemCount: 0 };

  const rows = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      imageUrl: products.imageUrl,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));
  const subtotal = rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = rows.reduce((sum, item) => sum + item.quantity, 0);
  return { id: cart.id, items: rows, subtotal, itemCount };
}

async function getOrCreateCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(carts).values({ userId });
  const created = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!created[0]) throw new Error("Unable to create cart");
  return created[0];
}

export async function addCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.isActive, true))).limit(1);
  if (!product[0]) throw new Error("Product is unavailable");
  if (product[0].stockQuantity < quantity) throw new Error("Requested quantity is unavailable");
  const cart = await getOrCreateCart(userId);
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing[0]) {
    const nextQuantity = existing[0].quantity + quantity;
    if (nextQuantity > product[0].stockQuantity) throw new Error("Requested quantity is unavailable");
    await db.update(cartItems).set({ quantity: nextQuantity }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
  }
  return getCartForUser(userId);
}

export async function updateCartItem(userId: number, cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db
    .select({ cartItemId: cartItems.id, productId: products.id, stockQuantity: products.stockQuantity })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId)))
    .limit(1);
  const item = rows[0];
  if (!item) throw new Error("Cart item not found");
  if (quantity < 1) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    if (quantity > item.stockQuantity) throw new Error("Requested quantity is unavailable");
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }
  return getCartForUser(userId);
}

export async function removeCartItem(userId: number, cartItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId)))
    .limit(1);
  if (rows[0]) await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  return getCartForUser(userId);
}

export async function listAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), desc(addresses.updatedAt));
}

export async function saveAddress(
  userId: number,
  input: {
    id?: number;
    label: string;
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    region?: string | null;
    postalCode?: string | null;
    country: string;
    isDefault: boolean;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  if (input.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  if (input.id) {
    await db.update(addresses).set({ ...input }).where(and(eq(addresses.id, input.id), eq(addresses.userId, userId)));
  } else {
    await db.insert(addresses).values({ ...input, userId });
  }
  return listAddresses(userId);
}

export async function deleteAddress(userId: number, addressId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.delete(addresses).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
  return listAddresses(userId);
}

export async function createPendingOrder(userId: number, addressId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const cart = await getCartForUser(userId);
  if (!cart.id || cart.items.length === 0) throw new Error("Your cart is empty");
  const address = await db.select().from(addresses).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId))).limit(1);
  if (!address[0]) throw new Error("Select a valid delivery address");
  if (cart.items.some(item => !item.isActive || item.quantity > item.stockQuantity)) {
    throw new Error("Some cart items are no longer available in the requested quantity");
  }

  const subtotal = cart.subtotal.toFixed(2);
  const shippingAmount = cart.subtotal >= 5000 ? "0.00" : "350.00";
  const total = (Number(subtotal) + Number(shippingAmount)).toFixed(2);
  const orderNumber = `AG-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
  await db.insert(orders).values({
    userId,
    orderNumber,
    status: "payment_pending",
    paymentStatus: "unpaid",
    currency: "PKR",
    subtotal,
    shippingAmount,
    total,
    shippingAddress: address[0],
    placedAt: new Date(),
  });
  const created = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = created[0];
  if (!order) throw new Error("Unable to create order");
  await db.insert(orderItems).values(
    cart.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.price).toFixed(2),
    })),
  );
  await db.insert(orderStatusHistory).values({ orderId: order.id, status: "payment_pending", note: "Order created and awaiting payment" });
  const customer = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  try {
    await sendOrderEmail({ recipient: customer[0]?.email, customerName: customer[0]?.name, orderNumber: order.orderNumber, total: order.total, currency: order.currency, milestone: "placed" });
  } catch (error) {
    console.error("[Notifications] Order placed email failed", error);
  }
  return order;
}

export async function startStripeCheckout(userId: number, addressId: number, origin: string) {
  if (!isStripeConfigured()) throw new Error("Stripe payment setup is incomplete.");
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const order = await createPendingOrder(userId, addressId);
  const [items, customer] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1),
  ]);
  const session = await createStripeCheckoutSession({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: customer[0]?.email,
    currency: order.currency,
    lines: [
      ...items.map(item => ({ name: item.productName, unitAmount: Number(item.unitPrice), quantity: item.quantity })),
      ...(Number(order.shippingAmount) > 0 ? [{ name: "Standard delivery", unitAmount: Number(order.shippingAmount), quantity: 1 }] : []),
    ],
    successUrl: `${origin}/order-confirmation?order=${order.orderNumber}`,
    cancelUrl: `${origin}/checkout?payment=cancelled`,
  });
  await db.update(orders).set({ stripeCheckoutSessionId: session.id }).where(eq(orders.id, order.id));
  return { checkoutUrl: session.url, orderNumber: order.orderNumber };
}

export async function confirmStripeOrder(input: { orderId: number; checkoutSessionId?: string; paymentIntentId?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const matched = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  const order = matched[0];
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "paid") return { success: true, idempotent: true };
  await db.update(orders).set({ status: "confirmed", paymentStatus: "paid", confirmedAt: new Date(), stripeCheckoutSessionId: input.checkoutSessionId ?? order.stripeCheckoutSessionId, stripePaymentIntentId: input.paymentIntentId ?? order.stripePaymentIntentId }).where(eq(orders.id, order.id));
  await db.insert(orderStatusHistory).values({ orderId: order.id, status: "confirmed", note: "Stripe payment confirmed" });
  const cart = await db.select().from(carts).where(eq(carts.userId, order.userId)).limit(1);
  if (cart[0]) await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
  const customer = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, order.userId)).limit(1);
  try {
    await sendOrderEmail({ recipient: customer[0]?.email, customerName: customer[0]?.name, orderNumber: order.orderNumber, total: order.total, currency: order.currency, milestone: "confirmed" });
  } catch (error) {
    console.error("[Notifications] Order confirmation email failed", error);
  }
  return { success: true, idempotent: false };
}

export async function listOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(userId: number, orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const orderRows = await db.select().from(orders).where(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber))).limit(1);
  const order = orderRows[0];
  if (!order) return null;
  const [items, history] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(desc(orderStatusHistory.createdAt)),
  ]);
  return { ...order, items, history };
}

export async function listAdminOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled", note?: string, trackingNumber?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing[0]) throw new Error("Order not found");
  if (existing[0].status === status) return { success: true, idempotent: true };
  const timestampField = status === "confirmed" ? { confirmedAt: new Date() } : status === "shipped" ? { shippedAt: new Date() } : {};
  await db.update(orders).set({ status, trackingNumber: trackingNumber ?? undefined, ...timestampField }).where(eq(orders.id, orderId));
  await db.insert(orderStatusHistory).values({ orderId, status, note: note ?? null });
  if (status === "confirmed" || status === "shipped") {
    const customer = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, existing[0].userId)).limit(1);
    try {
      await sendOrderEmail({ recipient: customer[0]?.email, customerName: customer[0]?.name, orderNumber: existing[0].orderNumber, total: existing[0].total, currency: existing[0].currency, milestone: status, trackingNumber });
    } catch (error) {
      console.error(`[Notifications] Order ${status} email failed`, error);
    }
  }
  return { success: true, idempotent: false };
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; imageUrl?: string | null; isFeatured?: boolean; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(categories).values(input);
  return listCategories();
}

export async function createBrand(input: { name: string; slug: string; description?: string | null; logoUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(brands).values(input);
  return listBrands();
}

export async function createProduct(input: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(products).values(input);
  const created = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
  return created[0];
}

export async function updateProduct(productId: number, input: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(products).set(input).where(eq(products.id, productId));
  return { success: true };
}
