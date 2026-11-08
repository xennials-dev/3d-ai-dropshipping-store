import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  category: text("category").notNull(),
  image: text("image").notNull(),
  supplier: text("supplier").notNull(),
  supplierCountry: text("supplier_country").notNull(),
  supplierRating: real("supplier_rating").notNull().default(4.6),
  shippingMin: integer("shipping_min").notNull().default(3),
  shippingMax: integer("shipping_max").notNull().default(7),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  margin: real("margin").notNull().default(0.45),
  cost: real("cost").notNull().default(0),
  stock: integer("stock").notNull().default(120),
  featured: boolean("featured").notNull().default(false),
  badge: text("badge"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  address: text("address").notNull(),
  deliverySpeed: text("delivery_speed").notNull().default("standard"),
  promoCode: text("promo_code"),
  total: real("total").notNull(),
  marginEarned: real("margin_earned").notNull().default(0),
  status: text("status").notNull().default("paid"), // paid -> forwarded -> shipped -> delivered
  paymentStatus: text("payment_status").notNull().default("paid"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method").default("card"), // stripe, lemonsqueezy, simulated
  stripeSessionId: text("stripe_session_id"),
  paymentIntentId: text("payment_intent_id"),
  supplier: text("supplier").notNull(),
  supplierOrderId: text("supplier_order_id"),
  trackingNumber: text("tracking_number"),
  carrierName: text("carrier_name"),
  trackingUrl: text("tracking_url"),
  dispatchedAt: timestamp("dispatched_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  name: text("name").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
  image: text("image"),
  supplier: text("supplier"),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
