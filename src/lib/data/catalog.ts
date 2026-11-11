import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { materials, products, type MaterialRow, type ProductRow } from "@/db/schema";
import { isKind } from "@/lib/configurator/kinds";
import type { Kind, MaterialOption, ProductData } from "@/lib/configurator/types";
import { ensureSeed } from "./seed";

function toProduct(row: ProductRow): ProductData {
  return {
    id: row.id,
    slug: row.slug,
    kind: (isKind(row.kind) ? row.kind : "wardrobe") as Kind,
    category: row.category,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    highlights: row.highlights,
    limits: row.limits,
    defaults: row.defaults,
    pricing: row.pricing,
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

export function toMaterial(row: MaterialRow): MaterialOption {
  return {
    slug: row.slug,
    name: row.name,
    type: row.type === "wood" ? "wood" : "solid",
    hex: row.hex,
    pricePerM2: row.pricePerM2,
  };
}

export async function listProducts(opts: { includeDraft?: boolean; category?: string } = {}): Promise<ProductData[]> {
  await ensureSeed();
  const conds = [];
  if (!opts.includeDraft) conds.push(eq(products.published, true));
  if (opts.category) conds.push(eq(products.category, opts.category));
  const rows = await db
    .select()
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(products.sortOrder), asc(products.id));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string, includeDraft = false): Promise<ProductData | null> {
  await ensureSeed();
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row || (!row.published && !includeDraft)) return null;
  return toProduct(row);
}

export async function getProductById(id: number): Promise<ProductData | null> {
  await ensureSeed();
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ? toProduct(row) : null;
}

export async function listMaterials(opts: { includeInactive?: boolean } = {}): Promise<MaterialOption[]> {
  await ensureSeed();
  const rows = await db
    .select()
    .from(materials)
    .where(opts.includeInactive ? undefined : eq(materials.active, true))
    .orderBy(asc(materials.sortOrder), asc(materials.id));
  return rows.map(toMaterial);
}

export async function listMaterialRows(): Promise<MaterialRow[]> {
  await ensureSeed();
  return db.select().from(materials).orderBy(asc(materials.sortOrder), asc(materials.id));
}
