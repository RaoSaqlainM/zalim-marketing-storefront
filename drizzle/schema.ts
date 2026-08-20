import { boolean, decimal, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    isFeatured: boolean("isFeatured").notNull().default(false),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("categories_featured_idx").on(table.isFeatured, table.sortOrder)],
);

export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull().unique(),
    sku: varchar("sku", { length: 80 }).notNull().unique(),
    shortDescription: varchar("shortDescription", { length: 500 }),
    description: text("description"),
    specifications: json("specifications").$type<Record<string, string>>(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
    stockQuantity: int("stockQuantity").notNull().default(0),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    categoryId: int("categoryId").references(() => categories.id, { onDelete: "set null" }),
    brandId: int("brandId").references(() => brands.id, { onDelete: "set null" }),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isNew: boolean("isNew").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("products_catalog_idx").on(table.isActive, table.categoryId, table.brandId),
    index("products_featured_idx").on(table.isFeatured, table.isNew),
  ],
);

export const productImages = mysqlTable(
  "productImages",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 1024 }).notNull(),
    altText: varchar("altText", { length: 255 }),
    position: int("position").notNull().default(0),
  },
  table => [index("product_images_product_idx").on(table.productId, table.position)],
);

export const reviewStatuses = ["pending", "approved", "rejected"] as const;

export const productReviews = mysqlTable(
  "productReviews",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: int("rating").notNull(),
    title: varchar("title", { length: 160 }),
    body: text("body").notNull(),
    status: mysqlEnum("status", reviewStatuses).notNull().default("pending"),
    moderatedByUserId: int("moderatedByUserId").references(() => users.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderatedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("product_reviews_public_idx").on(table.productId, table.status, table.createdAt),
    uniqueIndex("product_reviews_user_product_unique").on(table.userId, table.productId),
  ],
);

export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable(
  "cartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    cartId: int("cartId").notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("cart_product_unique").on(table.cartId, table.productId)],
);

export const addresses = mysqlTable(
  "addresses",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull(),
    recipientName: varchar("recipientName", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    city: varchar("city", { length: 120 }).notNull(),
    region: varchar("region", { length: 120 }),
    postalCode: varchar("postalCode", { length: 40 }),
    country: varchar("country", { length: 2 }).notNull().default("PK"),
    isDefault: boolean("isDefault").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("addresses_user_idx").on(table.userId, table.isDefault)],
);

export const orderStatuses = ["payment_pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
export const paymentStatuses = ["unpaid", "paid", "failed", "refunded"] as const;

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "restrict" }),
    orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
    status: mysqlEnum("status", orderStatuses).notNull().default("payment_pending"),
    paymentStatus: mysqlEnum("paymentStatus", paymentStatuses).notNull().default("unpaid"),
    currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingAmount: decimal("shippingAmount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    shippingAddress: json("shippingAddress").$type<Record<string, unknown>>().notNull(),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
    stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }).unique(),
    trackingNumber: varchar("trackingNumber", { length: 255 }),
    placedAt: timestamp("placedAt").defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt"),
    shippedAt: timestamp("shippedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("orders_user_idx").on(table.userId, table.createdAt), index("orders_status_idx").on(table.status, table.paymentStatus)],
);

export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: int("productId").references(() => products.id, { onDelete: "set null" }),
    productName: varchar("productName", { length: 220 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  },
  table => [index("order_items_order_idx").on(table.orderId)],
);

export const orderStatusHistory = mysqlTable(
  "orderStatusHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", orderStatuses).notNull(),
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("order_history_order_idx").on(table.orderId, table.createdAt)],
);

export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type ProductReview = typeof productReviews.$inferSelect;
