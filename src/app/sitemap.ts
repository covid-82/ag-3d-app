import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts().catch(() => []);
  const base = SITE.url.replace(/\/$/, "");
  const pages = ["", "/produk", "/panduan-pemesanan", "/tentang", "/kontak"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...products.map((p) => ({ url: `${base}/produk/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
