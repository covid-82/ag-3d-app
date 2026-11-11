import Link from "next/link";
import { ElevationSvg } from "@/components/drawing/ElevationSvg";
import { productPreview } from "@/lib/configurator/preview";
import type { MaterialOption, ProductData } from "@/lib/configurator/types";
import { formatRupiahShort } from "@/lib/format";

export function ProductCard({ product, materials }: { product: ProductData; materials: MaterialOption[] }) {
  const { config, result, estimate } = productPreview(product, materials);
  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group flex flex-col border border-ink bg-paper transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="paper-grid relative flex aspect-[4/3] items-center justify-center border-b border-ink p-5">
        <ElevationSvg result={result} config={config} materials={materials} annotate className="h-full w-full" title={`Tampak depan ${product.name}`} />
        <span className="absolute left-3 top-3 bg-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] ring-1 ring-ink">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.45rem] font-medium leading-tight">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-soft">{product.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-mute">Mulai dari</p>
            <p className="font-display text-lg font-semibold">{formatRupiahShort(estimate.min)}</p>
          </div>
          <span className="text-[14px] font-semibold text-clay transition-transform group-hover:translate-x-1">Konfigurasi →</span>
        </div>
      </div>
    </Link>
  );
}
