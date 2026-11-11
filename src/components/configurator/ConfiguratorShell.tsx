"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Viewport } from "@/components/viewport/Viewport";
import { buildParts } from "@/lib/configurator/build";
import { KIND_SPECS } from "@/lib/configurator/kinds";
import { buildWhatsAppMessage } from "@/lib/configurator/message";
import { estimatePrice } from "@/lib/configurator/pricing";
import { encodeConfig } from "@/lib/configurator/share";
import { buildSpecLines } from "@/lib/configurator/summary";
import type { DesignConfig, MaterialOption, ProductData } from "@/lib/configurator/types";
import { formatRupiahShort } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { DimensionsPanel } from "./panels/DimensionsPanel";
import { MaterialsPanel } from "./panels/MaterialsPanel";
import { StructurePanel } from "./panels/StructurePanel";
import { SummaryPanel } from "./panels/SummaryPanel";
import { QuoteDialog } from "./QuoteDialog";
import { useConfigurator } from "./useConfigurator";
import {
  Undo2,
  Redo2,
  RotateCcw,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  Ruler,
  Sliders,
  Palette,
  FileText,
  Sparkles,
} from "lucide-react";

type Tab = "ukuran" | "struktur" | "material" | "ringkasan";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ukuran", label: "Ukuran", icon: Ruler },
  { id: "struktur", label: "Struktur & Motif", icon: Sliders },
  { id: "material", label: "Material", icon: Palette },
  { id: "ringkasan", label: "Ringkasan & Denah", icon: FileText },
];

interface Props {
  product: ProductData;
  materials: MaterialOption[];
  initial: DesignConfig;
}

export function ConfiguratorShell({ product, materials, initial }: Props) {
  const spec = KIND_SPECS[product.kind] ?? KIND_SPECS.wardrobe;
  const {
    config,
    apply,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    isModified,
    notices,
    dismissNotices,
  } = useConfigurator(spec, product.limits, initial);

  const [tab, setTab] = useState<Tab>("ukuran");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(true);

  const captureRef = useRef<(() => string | null) | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo(() => buildParts(product.kind, config), [product.kind, config]);
  const lines = useMemo(
    () => buildSpecLines(spec, config, materials, result),
    [spec, config, materials, result],
  );
  const estimate = useMemo(
    () =>
      estimatePrice(
        result,
        product.pricing,
        materials.find((m) => m.slug === config.bodyMaterial),
        materials.find((m) => m.slug === config.frontMaterial),
      ),
    [result, product.pricing, materials, config.bodyMaterial, config.frontMaterial],
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const designUrl = useMemo(() => {
    const code = encodeConfig(config);
    return typeof window !== "undefined"
      ? `${window.location.origin}/desain/${code}`
      : `/desain/${code}`;
  }, [config]);

  const handleCopy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(designUrl);
      flash("Tautan desain berhasil disalin ke clipboard!");
    }
  }, [designUrl, flash]);

  const handleWhatsApp = useCallback(() => {
    const msg = buildWhatsAppMessage({
      productName: product.name,
      lines,
      estimate,
      url: designUrl,
    });
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  }, [product.name, lines, estimate, designUrl]);

  const handleDownload = useCallback(() => {
    const dataUrl = captureRef.current?.();
    if (!dataUrl) {
      flash("Gagal mengambil tangkapan 3D.");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${product.slug}-${config.width}x${config.height}.png`;
    a.click();
    flash("Gambar pratinjau 3D berhasil diunduh!");
  }, [product.slug, config.width, config.height, flash]);

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-paper overflow-hidden text-ink font-sans">
      {/* 1. Header Bar: Brand, Realtime Live Price & Action Buttons */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white/90 backdrop-blur-md px-3 sm:px-6 z-20">
        {/* Sisi Kiri: Brand & Nama Produk */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Link href="/" aria-label="Beranda" className="text-moss shrink-0">
            <LogoMark className="h-7 w-7" />
          </Link>
          <span className="hidden h-5 w-px bg-line sm:block" />
          <Link
            href="/produk"
            className="min-w-0 truncate text-xs sm:text-sm font-medium text-ink-soft hover:text-ink flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">← Katalog</span>
            <span className="font-semibold text-ink text-sm sm:text-base truncate">
              {product.name}
            </span>
          </Link>
        </div>

        {/* Tengah: Realtime Live Price Ticker (Supernata Style) */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-paper-2 border border-line shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-ink-mute font-mono hidden md:inline">
            Estimasi
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-moss">
            {formatRupiahShort(estimate.min)}
          </span>
        </div>

        {/* Sisi Kanan: Undo/Redo & CTA Button */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink hover:border-ink disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Urungkan (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="w-9 h-9 rounded-lg border border-line flex items-center justify-center text-ink hover:border-ink disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Ulangi (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <Button
            variant="accent"
            size="sm"
            onClick={handleWhatsApp}
            className="h-9 px-3 text-xs sm:text-sm flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white border-none shadow-xs ml-1"
          >
            <MessageCircle className="w-4 h-4 fill-current hidden sm:inline" />
            <span>Pesan</span>
          </Button>
        </div>
      </header>

      {/* 2. Main Studio Workspace: 3D Viewport + Inspector Controls */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Sisi Kiri / Atas: 3D Canvas Viewport */}
        <div
          className={`relative transition-all duration-300 ease-in-out ${
            mobileSheetExpanded
              ? "h-[45dvh] lg:h-full lg:flex-1"
              : "h-[85dvh] lg:h-full lg:flex-1"
          }`}
        >
          <Viewport
            result={result}
            config={config}
            materials={materials}
            onOpenAngleChange={(deg) => apply({ doorOpenAngle: deg }, "door-angle")}
            captureRef={captureRef}
            className="w-full h-full"
          />

          {/* Mobile Bottom Sheet Toggle Pill */}
          <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink/90 text-white text-xs font-medium shadow-md backdrop-blur-md active:scale-95 transition-all"
            >
              {mobileSheetExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Perluas 3D</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Buka Panel Kontrol</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sisi Kanan / Bawah: Tabbed Inspector Panel */}
        <aside
          className={`flex min-h-0 flex-col border-t lg:border-t-0 lg:border-l border-line bg-paper transition-all duration-300 ease-in-out z-10 ${
            mobileSheetExpanded
              ? "flex-1 lg:w-[27rem] xl:w-[30rem] lg:flex-none"
              : "h-14 lg:h-full lg:w-[27rem] xl:w-[30rem] lg:flex-none overflow-hidden"
          }`}
        >
          {/* Tabs Navigation Header (Touch Friendly 46px) */}
          <div
            role="tablist"
            className="grid grid-cols-4 border-b border-line bg-paper-2/80 shrink-0"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => {
                    setTab(t.id);
                    if (!mobileSheetExpanded) setMobileSheetExpanded(true);
                  }}
                  className={`relative flex flex-col items-center justify-center h-[50px] transition-all ${
                    isActive ? "text-moss font-semibold bg-white" : "text-ink-mute hover:text-ink"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[11px] leading-tight truncate px-1">{t.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-2 bottom-0 h-[2.5px] bg-moss rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Notices Bar jika ada benturan ukuran */}
          {notices.length > 0 && (
            <div
              role="status"
              className="flex shrink-0 items-start gap-2 border-b border-clay/30 bg-clay/10 px-3 py-2 text-xs leading-snug text-clay-dark"
            >
              <ul className="flex-1 space-y-0.5">
                {notices.map((m, idx) => (
                  <li key={idx}>• {m}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={dismissNotices}
                className="font-bold text-sm px-1 text-clay-dark"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Tab Scrollable Content Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-8" role="tabpanel">
            {tab === "ukuran" && (
              <DimensionsPanel config={config} limits={product.limits} apply={apply} />
            )}
            {tab === "struktur" && (
              <StructurePanel
                spec={spec}
                config={config}
                apply={apply}
                selected={null}
                onSelect={() => {}}
              />
            )}
            {tab === "material" && (
              <MaterialsPanel
                spec={spec}
                config={config}
                materials={materials}
                apply={apply}
              />
            )}
            {tab === "ringkasan" && (
              <SummaryPanel
                config={config}
                result={result}
                materials={materials}
                lines={lines}
                estimate={estimate}
                onQuote={() => setQuoteOpen(true)}
                onWhatsApp={handleWhatsApp}
                onCopy={handleCopy}
                onDownload={handleDownload}
                onReset={reset}
                isModified={isModified}
              />
            )}
          </div>

          {/* Sticky Bottom Bar on Desktop */}
          <div className="hidden lg:flex shrink-0 items-center justify-between gap-3 border-t border-line bg-paper-2 px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                Estimasi Total
              </p>
              <p className="font-mono text-base font-bold text-moss truncate">
                {formatRupiahShort(estimate.min)} – {formatRupiahShort(estimate.max)}
              </p>
            </div>
            <Button variant="accent" size="sm" onClick={() => setQuoteOpen(true)}>
              Minta Penawaran
            </Button>
          </div>
        </aside>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-16 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] rounded-xl bg-ink/95 text-white px-4 py-2 text-xs font-medium shadow-xl backdrop-blur-md border border-white/20 animate-fade-in"
        >
          {toast}
        </div>
      )}

      {/* Quote Dialog Modal */}
      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        productName={product.name}
        productSlug={product.slug}
        config={config}
        lines={lines}
        estimate={estimate}
        capture={() => captureRef.current?.() ?? null}
        designUrl={() => designUrl}
      />
    </div>
  );
}
