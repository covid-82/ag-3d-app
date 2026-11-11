import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  DesignConfig,
  Limits,
  Pricing,
} from "@/lib/configurator/types";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  kind: text("kind").notNull(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  limits: jsonb("limits").$type<Limits>().notNull(),
  defaults: jsonb("defaults").$type<Partial<DesignConfig>>().notNull().default({}),
  pricing: jsonb("pricing").$type<Pricing>().notNull(),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull().default("solid"), // "wood" | "solid"
  hex: text("hex").notNull(),
  pricePerM2: integer("price_per_m2").notNull().default(500000),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("quote"), // "quote" | "message"
  productId: integer("product_id"),
  productName: text("product_name"),
  productSlug: text("product_slug"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  city: text("city"),
  notes: text("notes"),
  config: jsonb("config").$type<DesignConfig>(),
  summary: jsonb("summary").$type<{ label: string; value: string }[]>(),
  estimateMin: integer("estimate_min"),
  estimateMax: integer("estimate_max"),
  previewImage: text("preview_image"),
  status: text("status").notNull().default("baru"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type MaterialRow = typeof materials.$inferSelect;
export type RequestRow = typeof requests.$inferSelect;
