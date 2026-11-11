import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { ShowcaseViewer } from "@/components/viewport/ShowcaseViewer";
import { BASE_LABEL, DOOR_LABEL, HANDLE_LABEL } from "@/lib/configurator/labels";
import { productPreview } from "@/lib/configurator/preview";
import { formatDims } from "@/lib/configurator/summary";
import { getProductBySlug, listMaterials, listProducts } from "@/lib/data/catalog";
import { formatRupiah, formatRupiahShort } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: `${product.name} custom ukuran`,
    description: product.tagline,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: { title: product.name, description: product.tagline, type: "website" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, materials, all] = await Promise.all([getProductBySlug(slug), listMaterials(), listProducts()]);
  if (!product) notFound();

  const { spec, config, estimate } = productPreview(product, materials);
  const related = all.filter((p) => p.id !== product.id && (p.category === product.category || p.kind !== product.kind)).slice(0, 3);
  const l = product.limits;

  const options: [string, string][] = [];
  if (spec.cabinet) {
    const r = spec.cabinet;
    options.push(["Kolom", `1–${r.maxColumns} kolom (lebar tiap kolom ${r.minColW}–${r.maxColW} cm)`]);
    options.push(["Isi kolom", r.contents.map((c) => ({ hanging: "gantung", shelves: "rak", open: "kosong" })[c]).join(", ") + ", plus laci"]);
    options.push(["Pintu", r.doors.map((d) => DOOR_LABEL[d].toLowerCase()).join(", ")]);
    options.push(["Alas", r.bases.map((b) => BASE_LABEL[b].toLowerCase()).join(", ")]);
  } else {
    options.push(["Kaki", "rangka besi atau panel kayu"]);
    options.push(["Laci samping", "kiri, kanan, atau kedua sisi (1–4 laci)"]);
    options.push(["Panel belakang", "opsional"]);
  }
  options.push(["Handle", Object.values(HANDLE_LABEL).join(", ").toLowerCase()]);
  options.push(["Material", `${materials.length} pilihan kayu & warna`]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: estimate.min,
      highPrice: estimate.max,
      availability: "https://schema.org/MadeToOrder",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-ink-mute">
          <Link href="/" className="hover:text-ink">Beranda</Link> / <Link href="/produk" className="hover:text-ink">Produk</Link> /{" "}
          <span className="text-ink">{product.name}</span>
        </nav>
      </Container>

      <Container className="grid gap-10 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-ink">
            <ShowcaseViewer kind={product.kind} config={config} materials={materials} className="aspect-[4/3] min-h-[300px] w-full" />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
            Konfigurasi awal · {formatDims(config)}
          </p>
        </div>

        <div>
          <Eyebrow>{product.category}</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{product.tagline}</p>

          <div className="mt-7 border border-ink bg-paper-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">Perkiraan pada ukuran awal</p>
            <p className="mt-1 font-display text-3xl font-medium">
              {formatRupiahShort(estimate.min)} – {formatRupiahShort(estimate.max)}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              Berubah otomatis di konfigurator mengikuti ukuran, material, dan komponen. ({formatRupiah(estimate.min)} sebagai titik awal)
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button href={`/konfigurator/${product.slug}`} variant="accent" size="lg" className="flex-1">
              Konfigurasi sekarang
            </Button>
            <Button
              href={whatsappLink(`Halo Ukur, saya tertarik dengan ${product.name}. Boleh bertanya dulu?`)}
              external
              variant="outline"
              size="lg"
            >
              Tanya via WhatsApp
            </Button>
          </div>

          <ul className="mt-8 space-y-2.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15.5px] leading-snug">
                <span aria-hidden className="mt-2 h-2 w-2 shrink-0 bg-clay" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container className="grid gap-12 border-t border-line py-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow="Tentang model ini" title="Rancangannya" />
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{product.description}</p>
        </div>
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-clay">Batas ukuran</h2>
          <table className="mt-4 w-full border-y border-ink text-[15px]">
            <thead className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
              <tr className="border-b border-line">
                <th className="py-2 text-left font-medium">Dimensi</th>
                <th className="py-2 text-right font-medium">Min</th>
                <th className="py-2 text-right font-medium">Maks</th>
                <th className="py-2 text-right font-medium">Awal</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {(
                [
                  ["Lebar", l.width],
                  ["Tinggi", l.height],
                  ["Kedalaman", l.depth],
                ] as const
              ).map(([k, v]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <td className="py-3 font-sans font-medium">{k}</td>
                  <td className="py-3 text-right">{v.min} cm</td>
                  <td className="py-3 text-right">{v.max} cm</td>
                  <td className="py-3 text-right">{v.def} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-clay">Yang bisa Anda atur</h2>
          <dl className="mt-4 divide-y divide-line border-y border-ink">
            {options.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-[15px]">
                <dt className="text-ink-mute">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper-2 py-16">
          <Container>
            <SectionHeading eyebrow="Model lain" title="Mungkin Anda juga butuh" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} materials={materials} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
