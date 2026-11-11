"use client";

import Link from "next/link";
import { Box } from "lucide-react";
import { ElevationSvg } from "@/components/drawing/ElevationSvg";
import { productPreview } from "@/lib/configurator/preview";
import type { MaterialOption, ProductData } from "@/lib/configurator/types";
import { formatRupiahShort } from "@/lib/format";

interface Props {
  product: ProductData;
  materials: MaterialOption[];
  onQuick3D?: () => void;
}

export function ProductCard({ product, materials, onQuick3D }: Props) {
  const { config, result, estimate } = productPreview(product, materials);
  return (
    <div className="group relative flex flex-col border border-ink bg-paper transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* 2D Elevation Canvas Preview Area */}
      <div className="paper-grid relative flex aspect-[4/3] items-center justify-center border-b border-ink p-5 overflow-hidden">
        <Link
          href={`/produk/${product.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`Lihat detail ${product.name}`}
        />
        <ElevationSvg
          result={result}
          config={config}
          materials={materials}
          annotate
          className="h-full w-full pointer-events-none"
          title={`Tampak depan ${product.name}`}
        />
        <span className="absolute left-3 top-3 z-10 bg-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] ring-1 ring-ink pointer-events-none">
          {product.category}
        </span>

        {/* Tombol Pratinjau 3D Cepat */}
        {onQuick3D && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuick3D();
            }}
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper/95 backdrop-blur-md border border-line text-[11.5px] font-medium text-ink shadow-xs hover:border-clay hover:text-clay active:scale-95 transition-all cursor-pointer"
            title="Pratinjau 3D Cepat"
          >
            <Box className="w-3.5 h-3.5 text-clay" />
            <span>Pratinjau 3D</span>
          </button>
        )}
      </div>

      {/* Konten Kartu */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.45rem] font-medium leading-tight">
          <Link href={`/produk/${product.slug}`} className="hover:text-clay transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-soft">
          {product.tagline}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-mute">
              Mulai dari
            </p>
            <p className="font-display text-lg font-semibold">
              {formatRupiahShort(estimate.min)}
            </p>
          </div>
          <Link
            href={`/konfigurator/${product.slug}`}
            className="text-[14px] font-semibold text-clay transition-transform group-hover:translate-x-1"
          >
            Konfigurasi →
          </Link>
        </div>
      </div>
    </div>
  );
}
