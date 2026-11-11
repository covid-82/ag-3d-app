"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/Button";
import { buildWhatsAppMessage, estimateText } from "@/lib/configurator/message";
import type { Estimate } from "@/lib/configurator/pricing";
import type { SpecLine } from "@/lib/configurator/summary";
import type { DesignConfig } from "@/lib/configurator/types";
import { whatsappLink } from "@/lib/site";

interface Props {
  open: boolean;
  onClose: () => void;
  productName: string;
  productSlug: string;
  config: DesignConfig;
  lines: SpecLine[];
  estimate: Estimate;
  capture: () => string | null;
  designUrl: () => string;
}

const field =
  "h-11 w-full rounded-sm border border-line bg-paper px-3 text-[15px] focus:border-ink focus:outline-none";

export function QuoteDialog({ open, onClose, productName, productSlug, config, lines, estimate, capture, designUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; name: string } | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setPreview(capture());
    setError("");
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstField.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          productSlug,
          config,
          previewImage: preview,
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          city: fd.get("city"),
          notes: fd.get("notes"),
          website: fd.get("website"),
        }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Gagal mengirim permintaan.");
      setDone({ code: data.code, name: String(fd.get("name") ?? "") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim permintaan.");
    } finally {
      setSubmitting(false);
    }
  };

  const shortUrl = done ? `${window.location.origin}/desain/${done.code}` : designUrl();

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 sm:items-center sm:p-6" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-md bg-paper shadow-2xl sm:rounded-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-clay">{done ? "Terkirim" : "Minta penawaran"}</p>
            <h2 id="quote-title" className="font-display text-2xl font-medium leading-tight">
              {done ? "Permintaan Anda sudah masuk" : productName}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-line text-lg hover:border-ink">
            ×
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_1.1fr]">
          <div className="border-b border-line bg-paper-2 p-5 md:border-b-0 md:border-r">
            <div className="aspect-[4/3] w-full overflow-hidden border border-line bg-paper">
              {preview ? (
                <img src={preview} alt={`Pratinjau desain ${productName}`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center p-4 text-center text-[13px] text-ink-mute">
                  Pratinjau gambar tidak tersedia. Spesifikasi lengkap tetap ikut terkirim.
                </div>
              )}
            </div>
            <dl className="mt-4 space-y-1.5 text-[13px]">
              {lines
                .filter((l) => !/^Kolom \d/.test(l.label))
                .slice(0, 9)
                .map((l, i) => (
                  <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-2">
                    <dt className="text-ink-mute">{l.label}</dt>
                    <dd className="font-medium">{l.value}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-4 border-t border-line pt-3 text-[13px]">
              <span className="text-ink-mute">Perkiraan: </span>
              <span className="font-semibold">{estimateText(estimate)}</span>
            </p>
          </div>

          {done ? (
            <div className="flex flex-col gap-4 p-5">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Terima kasih, {done.name.split(" ")[0]}. Tim kami akan menghubungi Anda untuk memastikan ukuran dan detail,
                lalu mengirim penawaran. Simpan kode berikut untuk referensi.
              </p>
              <p className="border border-ink bg-paper-2 px-4 py-3 text-center font-mono text-2xl font-medium tracking-wider">{done.code}</p>
              <Button
                variant="accent"
                size="lg"
                external
                href={whatsappLink(
                  buildWhatsAppMessage({ productName, lines, estimate, url: shortUrl, code: done.code, customer: done.name }),
                )}
              >
                Percepat lewat WhatsApp
              </Button>
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(shortUrl)}>
                Salin tautan desain
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Kembali ke konfigurator
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3.5 p-5">
              <label className="block text-[13px] font-semibold">
                Nama
                <input ref={firstField} name="name" required minLength={2} maxLength={80} autoComplete="name" className={`${field} mt-1.5 font-normal`} />
              </label>
              <label className="block text-[13px] font-semibold">
                Nomor WhatsApp
                <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="08xx-xxxx-xxxx" maxLength={25} className={`${field} mt-1.5 font-normal`} />
              </label>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block text-[13px] font-semibold">
                  Email <span className="font-normal text-ink-mute">(opsional)</span>
                  <input name="email" type="email" autoComplete="email" maxLength={120} className={`${field} mt-1.5 font-normal`} />
                </label>
                <label className="block text-[13px] font-semibold">
                  Kota <span className="font-normal text-ink-mute">(opsional)</span>
                  <input name="city" autoComplete="address-level2" maxLength={80} className={`${field} mt-1.5 font-normal`} />
                </label>
              </div>
              <label className="block text-[13px] font-semibold">
                Catatan <span className="font-normal text-ink-mute">(opsional)</span>
                <textarea name="notes" rows={3} maxLength={2000} placeholder="Mis. ukuran ruang, target waktu, atau detail yang belum bisa dipilih di konfigurator." className="mt-1.5 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-[15px] font-normal focus:border-ink focus:outline-none" />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              {error && (
                <p role="alert" className="border-l-2 border-clay bg-clay/10 px-3 py-2 text-[13px] text-clay-dark">
                  {error}
                </p>
              )}
              <Button type="submit" variant="accent" size="lg" disabled={submitting} className="mt-1 w-full">
                {submitting ? "Mengirim…" : "Kirim permintaan"}
              </Button>
              <p className="text-[12px] leading-snug text-ink-mute">
                Konfigurasi, ukuran, dan gambar pratinjau ikut terkirim otomatis. Data Anda hanya dipakai untuk menyiapkan penawaran.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
