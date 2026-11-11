"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Estimate } from "@/lib/configurator/pricing";
import { estimateText } from "@/lib/configurator/message";
import type { SpecLine } from "@/lib/configurator/summary";
import type { BuildResult, DesignConfig, MaterialOption } from "@/lib/configurator/types";
import { ElevationSvg } from "@/components/drawing/ElevationSvg";
import { PlanSvg } from "@/components/drawing/PlanSvg";
import { FileText, Compass, MessageCircle, Share2, Download, RotateCcw } from "lucide-react";

interface Props {
  config: DesignConfig;
  result: BuildResult;
  materials: MaterialOption[];
  lines: SpecLine[];
  estimate: Estimate;
  onQuote: () => void;
  onWhatsApp: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
  isModified: boolean;
}

export function SummaryPanel({
  config,
  result,
  materials,
  lines,
  estimate,
  onQuote,
  onWhatsApp,
  onCopy,
  onDownload,
  onReset,
  isModified,
}: Props) {
  const [dimensions, ...rest] = lines;
  const [blueprintView, setBlueprintView] = useState<"elevation" | "plan">("plan");

  return (
    <div className="space-y-5">
      {/* Dimensi & Spesifikasi Fisik Box */}
      <div className="rounded-xl border border-line bg-paper-2 p-4 shadow-2xs">
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
          Dimensi Keseluruhan
        </p>
        <p className="mt-1 font-mono text-xl font-bold tracking-tight text-ink">
          {config.width} × {result.totalHeight || config.height} × {config.depth} cm
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line/60 pt-3 text-center font-mono text-xs">
          <div>
            <p className="text-ink-mute">Lebar (W)</p>
            <p className="text-sm font-semibold">{config.width} cm</p>
          </div>
          <div>
            <p className="text-ink-mute">Tinggi (H)</p>
            <p className="text-sm font-semibold">{result.totalHeight || config.height} cm</p>
          </div>
          <div>
            <p className="text-ink-mute">Tebal (D)</p>
            <p className="text-sm font-semibold">{config.depth} cm</p>
          </div>
        </div>

        {/* Volume & Estimasi Bobot Pertukangan */}
        <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs text-ink-soft">
          <span>Kapasitas Volume Kayu:</span>
          <span className="font-mono font-medium text-moss">
            {result.stats.woodVolumeM3} m³ (~{result.stats.estimatedWeightKg} kg)
          </span>
        </div>
      </div>

      {/* Gambar Teknik 2D Arsitektural (Tampak Depan vs Denah) */}
      <div className="rounded-xl border border-line bg-paper p-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-line mb-3">
          <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-moss" />
            Gambar Teknik Arsitektural 2D
          </span>
          <div className="flex items-center gap-1 bg-paper-2 p-0.5 rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setBlueprintView("elevation")}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all ${
                blueprintView === "elevation" ? "bg-white text-ink shadow-xs" : "text-ink-mute hover:text-ink"
              }`}
            >
              Tampak Depan
            </button>
            <button
              type="button"
              onClick={() => setBlueprintView("plan")}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all ${
                blueprintView === "plan" ? "bg-white text-ink shadow-xs" : "text-ink-mute hover:text-ink"
              }`}
            >
              Denah Ayunan
            </button>
          </div>
        </div>

        {blueprintView === "elevation" ? (
          <ElevationSvg
            result={result}
            config={config}
            materials={materials}
            annotate={true}
            className="w-full max-h-[220px]"
          />
        ) : (
          <PlanSvg
            result={result}
            config={config}
            materials={materials}
            className="w-full max-h-[220px]"
          />
        )}
      </div>

      {/* Rincian Komponen */}
      <dl className="divide-y divide-line border-y border-line text-xs">
        {rest.map((l, i) => (
          <div key={`${l.label}-${i}`} className="grid grid-cols-[8rem_1fr] gap-2 py-2">
            <dt className="text-ink-mute">{l.label}</dt>
            <dd className="font-medium text-ink">{l.value}</dd>
          </div>
        ))}
      </dl>

      {/* Kotak Estimasi Harga Realtime */}
      <div className="rounded-xl bg-ink p-4 text-paper shadow-md">
        <p className="font-mono text-[10px] uppercase tracking-wider text-paper/60">
          Perkiraan Harga Transparan
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
          {estimateText(estimate)}
        </p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-paper/70">
          Dihitung otomatis dari volume kayu riil, jenis finishing, profil tepi, dan mekanik rel/engsel.
        </p>
      </div>

      {/* Tombol Aksi Pesan & CTA */}
      <div className="grid gap-2 pt-1">
        <Button
          variant="accent"
          size="lg"
          onClick={onWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white border-none py-3.5"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="font-semibold text-sm">Pesan Langsung via WhatsApp</span>
        </Button>

        <Button variant="outline" onClick={onQuote} className="w-full py-2.5">
          Ajukan Penawaran Resmi & Survey Lokasi
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="border-line flex items-center justify-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Salin Tautan</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="border-line flex items-center justify-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Spek</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!isModified}
          className="text-ink-mute hover:text-ink text-xs flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Kembalikan ke Setelan Awal</span>
        </Button>
      </div>
    </div>
  );
}
