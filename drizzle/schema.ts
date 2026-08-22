import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const userRoles = pgEnum("user_role", ["user", "admin"]);
export const reviewStatuses = ["pending", "approved", "rejected"] as const;
export const reviewStatusValues = pgEnum("review_status", reviewStatuses);
export const orderStatuses = ["payment_pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
export const orderStatusValues = pgEnum("order_status", ["payment_pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);
export const paymentStatuses = ["unpaid", "paid", "failed", "refunded"] as const;
export const paymentStatusValues = pgEnum("payment_status", paymentStatuses);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  role: userRoles("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    isFeatured: boolean("isFeatured").notNull().default(false),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("categories_featured_idx").on(table.isFeatured, table.sortOrder)],
);

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 1024 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull().unique(),
    sku: varchar("sku", { length: 80 }).notNull().unique(),
    shortDescription: varchar("shortDescription", { length: 500 }),
    description: text("description"),
    specifications: jsonb("specifications").$type<Record<string, string>>(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compareAtPrice", { precision: 10, scale: 2 }),
    stockQuantity: integer("stockQuantity").notNull().default(0),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    categoryId: integer("categoryId").references(() => categories.id, { onDelete: "set null" }),
    brandId: integer("brandId").references(() => brands.id, { onDelete: "set null" }),
    isFeatured: boolean("isFeatured").notNull().default(false),
    isNew: boolean("isNew").notNull().default(false),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("products_catalog_idx").on(table.isActive, table.categoryId, table.brandId), index("products_featured_idx").on(table.isFeatured, table.isNew)],
);

export const productImages = pgTable(
  "productImages",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 1024 }).notNull(),
    altText: varchar("altText", { length: 255 }),
    position: integer("position").notNull().default(0),
  },
  table => [index("product_images_product_idx").on(table.productId, table.position)],
);

export const productReviews = pgTable(
  "productReviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 160 }),
    body: text("body").notNull(),
    status: reviewStatusValues("status").notNull().default("pending"),
    moderatedByUserId: integer("moderatedByUserId").references(() => users.id, { onDelete: "set null" }),
    moderatedAt: timestamp("moderatedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("product_reviews_public_idx").on(table.productId, table.status, table.createdAt), uniqueIndex("product_reviews_user_product_unique").on(table.userId, table.productId)],
);

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable(
  "cartItems",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cartId").notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [uniqueIndex("cart_product_unique").on(table.cartId, table.productId)],
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
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
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("addresses_user_idx").on(table.userId, table.isDefault)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().references(() => users.id, { onDelete: "restrict" }),
    orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
    status: orderStatusValues("status").notNull().default("payment_pending"),
    paymentStatus: paymentStatusValues("paymentStatus").notNull().default("unpaid"),
    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    shippingAmount: numeric("shippingAmount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    shippingAddress: jsonb("shippingAddress").$type<Record<string, unknown>>().notNull(),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
    stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }).unique(),
    trackingNumber: varchar("trackingNumber", { length: 255 }),
    placedAt: timestamp("placedAt", { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt", { withTimezone: true }),
    shippedAt: timestamp("shippedAt", { withTimezone: true }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index("orders_user_idx").on(table.userId, table.createdAt), index("orders_status_idx").on(table.status, table.paymentStatus)],
);

export const orderItems = pgTable(
  "orderItems",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("productId").references(() => products.id, { onDelete: "set null" }),
    productName: varchar("productName", { length: 220 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  },
  table => [index("order_items_order_idx").on(table.orderId)],
);

export const orderStatusHistory = pgTable(
  "orderStatusHistory",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusValues("status").notNull(),
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
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
