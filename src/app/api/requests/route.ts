import { NextResponse } from "next/server";
import { buildParts } from "@/lib/configurator/build";
import { KIND_SPECS } from "@/lib/configurator/kinds";
import { estimatePrice } from "@/lib/configurator/pricing";
import { sanitize } from "@/lib/configurator/rules";
import { baseConfig } from "@/lib/configurator/kinds";
import { buildSpecLines } from "@/lib/configurator/summary";
import type { DesignConfig } from "@/lib/configurator/types";
import { getProductBySlug, listMaterials } from "@/lib/data/catalog";
import { createRequest } from "@/lib/data/requests";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  if (str(body.website, 50)) return NextResponse.json({ code: "UKR-OK" }); // honeypot

  const name = str(body.name, 80);
  const phone = str(body.phone, 25);
  const email = str(body.email, 120);
  const city = str(body.city, 80);
  const notes = str(body.notes, 2000);
  const type = body.type === "message" ? "message" : "quote";

  if (name.length < 2) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Nomor WhatsApp/telepon tidak valid." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (type === "message" && notes.length < 5) {
    return NextResponse.json({ error: "Pesan terlalu singkat." }, { status: 400 });
  }

  const common = { name, phone, email: email || null, city: city || null, notes: notes || null, type };

  if (type === "message") {
    const row = await createRequest({ ...common, productId: null, productName: null, productSlug: null });
    return NextResponse.json({ code: row.code });
  }

  const slug = str(body.productSlug, 80);
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const spec = KIND_SPECS[product.kind];
  const materials = await listMaterials({ includeInactive: true });
  const raw = { ...baseConfig(), ...(body.config as Partial<DesignConfig>) } as DesignConfig;
  if (!Array.isArray(raw.columns)) raw.columns = [];
  const { config } = sanitize(spec, product.limits, raw);
  const result = buildParts(product.kind, config);
  const estimate = estimatePrice(
    result,
    product.pricing,
    materials.find((m) => m.slug === config.bodyMaterial),
    materials.find((m) => m.slug === config.frontMaterial),
  );
  const summary = buildSpecLines(spec, config, materials, result);

  const preview = typeof body.previewImage === "string" ? body.previewImage : "";
  const previewImage =
    preview.startsWith("data:image/jpeg;base64,") && preview.length < 450_000 ? preview : null;

  const row = await createRequest({
    ...common,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    config,
    summary,
    estimateMin: estimate.min,
    estimateMax: estimate.max,
    previewImage,
  });
  return NextResponse.json({ code: row.code });
}
