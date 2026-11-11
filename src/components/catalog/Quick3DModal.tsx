"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Box, ExternalLink, Sparkles } from "lucide-react";
import { Viewport } from "@/components/viewport/Viewport";
import { Button } from "@/components/ui/Button";
import { buildParts } from "@/lib/configurator/build";
import { productPreview } from "@/lib/configurator/preview";
import type { MaterialOption, ProductData } from "@/lib/configurator/types";
import { formatRupiahShort } from "@/lib/format";

interface Props {
  product: ProductData;
  materials: MaterialOption[];
  onClose: () => void;
}

export function Quick3DModal({ product, materials, onClose }: Props) {
  // Ambil config pratinjau awal
  const initial = useMemo(() => productPreview(product, materials), [product, materials]);

  // State material yang aktif diuji coba
  const [selectedMatSlug, setSelectedMatSlug] = useState<string>(
    initial.config.bodyMaterial || materials[0]?.slug || "oak-natural"
  );

  // Buat config dinamis dengan material terpilih
  const currentConfig = useMemo(() => {
    return {
      ...initial.config,
      bodyMaterial: selectedMatSlug,
      doorMaterial: selectedMatSlug,
    };
  }, [initial.config, selectedMatSlug]);

  // Kalkulasi 3D parts realtime
  const result = useMemo(
    () => buildParts(product.kind, currentConfig),
    [product.kind, currentConfig]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Material pilihan untuk uji coba cepat
  const quickMaterials = useMemo(() => {
    return materials.slice(0, 8);
  }, [materials]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau 3D ${product.name}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-paper border border-line rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5 bg-paper">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-clay font-medium bg-clay/10 px-2 py-0.5 rounded">
                {product.category}
              </span>
              <span className="font-mono text-[11px] text-ink-mute">
                {product.limits.width.def} × {product.limits.height.def} × {product.limits.depth.def} cm
              </span>
            </div>
            <h3 className="font-display text-lg font-medium text-ink truncate mt-0.5">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau 3D"
            className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-paper-2 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Canvas Viewport (Single WebGL Instance) */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-h-[360px] bg-[#f6f4f0] border-b border-line overflow-hidden">
          <Viewport
            mode="showcase"
            isInteractiveDefault={true}
            config={currentConfig}
            result={result}
            materials={materials}
            className="w-full h-full"
          />
          <div className="pointer-events-none absolute left-3 top-3 bg-paper/90 backdrop-blur-md px-2.5 py-1 rounded border border-line font-mono text-[10.5px] text-ink shadow-2xs">
            Putar & perbesar bebas dengan jempol
          </div>
        </div>

        {/* Material Swatches Picker */}
        <div className="px-4 py-3 border-b border-line bg-paper-2/60">
          <p className="text-[11.5px] font-medium text-ink-soft mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-clay" />
              <span>Ganti Finis / Bahan:</span>
            </span>
            <span className="font-mono text-clay font-semibold">
              {materials.find((m) => m.slug === selectedMatSlug)?.name}
            </span>
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {quickMaterials.map((mat) => {
              const active = mat.slug === selectedMatSlug;
              return (
                <button
                  key={mat.slug}
                  type="button"
                  onClick={() => setSelectedMatSlug(mat.slug)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                    active
                      ? "border-clay bg-paper text-ink shadow-xs ring-1 ring-clay"
                      : "border-line bg-paper text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: mat.hex }}
                  />
                  <span>{mat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-paper">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
              Estimasi Mulai Dari
            </p>
            <p className="font-display text-base sm:text-lg font-semibold text-moss">
              {formatRupiahShort(initial.estimate.min)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              href={`/produk/${product.slug}`}
              variant="outline"
              size="sm"
            >
              Detail
            </Button>
            <Button
              href={`/konfigurator/${product.slug}`}
              variant="primary"
              size="sm"
            >
              Kustomisasi 3D →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
