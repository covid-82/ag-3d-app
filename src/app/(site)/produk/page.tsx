import type { Metadata } from "next";
import Link from "next/link";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Container, PageHeader } from "@/components/ui/Section";
import { CATEGORIES } from "@/lib/configurator/labels";
import { listMaterials, listProducts } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog furnitur custom",
  description: "Lemari pakaian, rak buku, kabinet TV, dan meja kerja yang ukuran, isi, dan materialnya bisa Anda atur sendiri.",
  alternates: { canonical: "/produk" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const active = CATEGORIES.find((c) => c === kategori);
  const [all, materials] = await Promise.all([listProducts(), listMaterials()]);
  const products = active ? all.filter((p) => p.category === active) : all;

  const tab = (isActive: boolean) =>
    `inline-flex h-11 items-center border px-4 text-[14px] font-medium transition-colors ${
      isActive ? "border-ink bg-ink text-paper" : "border-ink/30 hover:border-ink"
    }`;

  return (
    <>
      <PageHeader
        eyebrow="Katalog"
        title="Pilih model, ubah sampai pas."
        description="Setiap model punya batas ukuran dan aturan konstruksinya sendiri. Harga yang tampil adalah perkiraan awal pada ukuran standar."
      />
      <Container className="pt-10">
        <nav aria-label="Filter kategori" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/produk" className={tab(!active)} aria-current={!active ? "page" : undefined}>
            Semua <span className="ml-2 font-mono text-xs opacity-70">{all.length}</span>
          </Link>
          {CATEGORIES.map((c) => {
            const count = all.filter((p) => p.category === c).length;
            if (!count) return null;
            return (
              <Link key={c} href={`/produk?kategori=${c}`} className={tab(active === c)} aria-current={active === c ? "page" : undefined}>
                {c} <span className="ml-2 font-mono text-xs opacity-70">{count}</span>
              </Link>
            );
          })}
        </nav>

        {products.length === 0 ? (
          <p className="py-24 text-center text-ink-soft">Belum ada produk pada kategori ini.</p>
        ) : (
          <div className="mt-8">
            <CatalogGrid products={products} materials={materials} />
          </div>
        )}
      </Container>
    </>
  );
}
