"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { materials, products, requests } from "@/db/schema";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { KIND_SPECS, defaultColumns, isKind } from "@/lib/configurator/kinds";
import type { DesignConfig, DimLimit, Limits, Pricing } from "@/lib/configurator/types";
import { getProductById } from "@/lib/data/catalog";
import { REQUEST_STATUSES } from "@/lib/data/requests";
import { slugify } from "@/lib/format";

const text = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const num = (fd: FormData, k: string, fallback = 0) => {
  const n = Number(String(fd.get(k) ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
};
const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------- Sesi ---------- */

export async function loginAction(_prev: { error?: string } | undefined, fd: FormData) {
  if (!checkPassword(String(fd.get("password") ?? ""))) return { error: "Kata sandi salah." };
  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Permintaan ---------- */

export async function updateRequestAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const status = text(fd, "status", 20);
  if (!id || !(REQUEST_STATUSES as readonly string[]).includes(status)) return;
  await db.update(requests).set({ status, adminNote: text(fd, "adminNote", 2000) || null }).where(eq(requests.id, id));
  redirect(`/admin/permintaan/${id}?saved=1`);
}

export async function deleteRequestAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  if (id) await db.delete(requests).where(eq(requests.id, id));
  redirect("/admin/permintaan");
}

/* ---------- Produk ---------- */

function limitFrom(fd: FormData, prefix: string, hard: DimLimit): DimLimit {
  const min = clampN(Math.round(num(fd, `${prefix}_min`, hard.min)), hard.min, hard.max);
  const max = clampN(Math.round(num(fd, `${prefix}_max`, hard.max)), min, hard.max);
  const def = clampN(Math.round(num(fd, `${prefix}_def`, hard.def)), min, max);
  return { min, max, def, step: 1 };
}

export async function saveProductAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const product = await getProductById(id);
  if (!product) redirect("/admin/produk");
  const spec = KIND_SPECS[product.kind];

  const limits: Limits = {
    width: limitFrom(fd, "w", spec.limits.width),
    height: limitFrom(fd, "h", spec.limits.height),
    depth: limitFrom(fd, "d", spec.limits.depth),
  };
  const pricing: Pricing = {
    base: Math.max(0, Math.round(num(fd, "p_base"))),
    perDrawer: Math.max(0, Math.round(num(fd, "p_drawer"))),
    perHingedDoor: Math.max(0, Math.round(num(fd, "p_door"))),
    perSlidingPanel: Math.max(0, Math.round(num(fd, "p_slide"))),
    perHandle: Math.max(0, Math.round(num(fd, "p_handle"))),
    margin: clampN(num(fd, "p_margin", 1.5), 1, 4),
  };

  const defaults: Partial<DesignConfig> = { ...product.defaults };
  const pick = <T extends string>(key: keyof DesignConfig, allowed: readonly T[]) => {
    const v = text(fd, `def_${key}`, 30) as T;
    if (allowed.includes(v)) (defaults as Record<string, unknown>)[key] = v;
  };
  if (spec.cabinet) {
    pick("doors", spec.cabinet.doors);
    pick("doorStyle", spec.cabinet.doorStyles);
    pick("base", spec.cabinet.bases);
    const cols = clampN(Math.round(num(fd, "def_cols", defaults.columns?.length ?? 0)), 1, spec.cabinet.maxColumns);
    if (cols && cols !== defaults.columns?.length) defaults.columns = defaultColumns(spec.kind, cols);
  }
  pick("handle", ["bar", "knob", "push"] as const);
  pick("hardware", ["black", "brass", "steel"] as const);
  const matSlugs = (await db.select({ slug: materials.slug }).from(materials)).map((m) => m.slug);
  pick("bodyMaterial", matSlugs);
  pick("frontMaterial", matSlugs);

  await db
    .update(products)
    .set({
      name: text(fd, "name", 120) || product.name,
      category: text(fd, "category", 40) || product.category,
      tagline: text(fd, "tagline", 300),
      description: text(fd, "description", 3000),
      highlights: text(fd, "highlights", 1500)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
      published: fd.get("published") === "on",
      sortOrder: Math.round(num(fd, "sortOrder")),
      limits,
      pricing,
      defaults,
    })
    .where(eq(products.id, id));
  redirect(`/admin/produk/${id}?saved=1`);
}

const CATEGORY_BY_KIND = { wardrobe: "Lemari", bookshelf: "Rak", tvcabinet: "Kabinet", desk: "Meja" } as const;

export async function createProductAction(fd: FormData) {
  await requireAdmin();
  const kind = text(fd, "kind", 20);
  const name = text(fd, "name", 120);
  if (!isKind(kind) || name.length < 3) redirect("/admin/produk/baru?error=1");
  const spec = KIND_SPECS[kind];

  const baseSlug = slugify(name) || kind;
  let slug = baseSlug;
  for (let i = 2; ; i++) {
    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (!exists) break;
    slug = `${baseSlug}-${i}`;
  }

  const [row] = await db
    .insert(products)
    .values({
      slug,
      kind,
      category: CATEGORY_BY_KIND[kind],
      name,
      tagline: "",
      description: "",
      highlights: [],
      limits: spec.limits,
      defaults: {},
      pricing: spec.pricing,
      published: false,
      sortOrder: 99,
    })
    .returning({ id: products.id });
  redirect(`/admin/produk/${row.id}?saved=1`);
}

export async function deleteProductAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  if (id) await db.delete(products).where(eq(products.id, id));
  redirect("/admin/produk");
}

/* ---------- Material ---------- */

const HEX = /^#[0-9a-fA-F]{6}$/;

function materialFields(fd: FormData) {
  const hex = text(fd, "hex", 7);
  return {
    name: text(fd, "name", 60),
    type: text(fd, "type", 10) === "wood" ? "wood" : "solid",
    hex: HEX.test(hex) ? hex.toLowerCase() : "#cccccc",
    pricePerM2: Math.max(0, Math.round(num(fd, "pricePerM2"))),
    active: fd.get("active") === "on",
    sortOrder: Math.round(num(fd, "sortOrder")),
  };
}

export async function saveMaterialAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const f = materialFields(fd);
  if (!id || f.name.length < 2) return;
  await db.update(materials).set(f).where(eq(materials.id, id));
  redirect("/admin/material?saved=1");
}

export async function createMaterialAction(fd: FormData) {
  await requireAdmin();
  const f = materialFields(fd);
  if (f.name.length < 2) redirect("/admin/material?error=1");
  let slug = slugify(f.name) || "material";
  for (let i = 2; ; i++) {
    const [exists] = await db.select({ id: materials.id }).from(materials).where(eq(materials.slug, slug)).limit(1);
    if (!exists) break;
    slug = `${slugify(f.name)}-${i}`;
  }
  await db.insert(materials).values({ ...f, slug, active: true });
  redirect("/admin/material?saved=1");
}

export async function deleteMaterialAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  if (id) await db.delete(materials).where(eq(materials.id, id));
  redirect("/admin/material?saved=1");
}
