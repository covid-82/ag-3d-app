import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { materials, products, type MaterialRow, type ProductRow } from "@/db/schema";
import { KIND_SPECS, isKind } from "@/lib/configurator/kinds";
import type { Kind, MaterialOption, ProductData } from "@/lib/configurator/types";
import { STATIC_MATERIALS, STATIC_PRODUCTS, ensureSeed } from "./seed";

function getStaticProducts(): ProductData[] {
  return STATIC_PRODUCTS.map((p, i) => {
    const spec = KIND_SPECS[p.kind] ?? KIND_SPECS.wardrobe;
    return {
      id: i + 1,
      slug: p.slug,
      kind: p.kind,
      category: p.category,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      highlights: p.highlights,
      limits: {
        width: { ...spec.limits.width, ...p.limits?.width },
        height: { ...spec.limits.height, ...p.limits?.height },
        depth: { ...spec.limits.depth, ...p.limits?.depth },
      },
      defaults: p.defaults,
      pricing: spec.pricing,
      published: true,
      sortOrder: i,
    };
  });
}

function getStaticMaterials(): MaterialOption[] {
  return STATIC_MATERIALS.map((m) => ({
    slug: m.slug,
    name: m.name,
    type: m.type as "wood" | "solid",
    hex: m.hex,
    pricePerM2: m.pricePerM2,
  }));
}

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
  try {
    await ensureSeed();
    const conds = [];
    if (!opts.includeDraft) conds.push(eq(products.published, true));
    if (opts.category) conds.push(eq(products.category, opts.category));
    const rows = await db
      .select()
      .from(products)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(asc(products.sortOrder), asc(products.id));
    if (rows.length > 0) return rows.map(toProduct);
  } catch (err) {
    console.warn("[catalog] fallback to static products:", (err as Error)?.message || err);
  }
  const all = getStaticProducts();
  return opts.category ? all.filter((p) => p.category === opts.category) : all;
}

export async function getProductBySlug(slug: string, includeDraft = false): Promise<ProductData | null> {
  try {
    await ensureSeed();
    const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (row && (row.published || includeDraft)) return toProduct(row);
  } catch (err) {
    console.warn("[catalog] fallback to static product:", (err as Error)?.message || err);
  }
  const found = getStaticProducts().find((p) => p.slug === slug);
  return found ?? null;
}

export async function getProductById(id: number): Promise<ProductData | null> {
  try {
    await ensureSeed();
    const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (row) return toProduct(row);
  } catch (err) {
    console.warn("[catalog] fallback to static product by id:", (err as Error)?.message || err);
  }
  const found = getStaticProducts().find((p) => p.id === id);
  return found ?? null;
}

export async function listMaterials(opts: { includeInactive?: boolean } = {}): Promise<MaterialOption[]> {
  try {
    await ensureSeed();
    const rows = await db
      .select()
      .from(materials)
      .where(opts.includeInactive ? undefined : eq(materials.active, true))
      .orderBy(asc(materials.sortOrder), asc(materials.id));
    if (rows.length > 0) return rows.map(toMaterial);
  } catch (err) {
    console.warn("[catalog] fallback to static materials:", (err as Error)?.message || err);
  }
  return getStaticMaterials();
}

export async function listMaterialRows(): Promise<MaterialRow[]> {
  try {
    await ensureSeed();
    return await db.select().from(materials).orderBy(asc(materials.sortOrder), asc(materials.id));
  } catch {
    return [];
  }
}
