import { formatRupiah } from "@/lib/format";
import type { Estimate } from "./pricing";
import type { SpecLine } from "./summary";

export const estimateText = (e: Estimate) => `${formatRupiah(e.min)} – ${formatRupiah(e.max)}`;

/** Pesan WhatsApp berisi seluruh spesifikasi + tautan desain, agar admin tidak perlu bertanya ulang. */
export function buildWhatsAppMessage(opts: {
  productName: string;
  lines: SpecLine[];
  estimate?: Estimate;
  url: string;
  code?: string;
  customer?: string;
}): string {
  const head = opts.code
    ? `Halo Ukur, saya ${opts.customer ?? ""} baru mengirim permintaan penawaran (kode ${opts.code}).`
    : "Halo Ukur, saya ingin meminta penawaran untuk desain berikut.";
  const body = opts.lines
    .filter((l) => !/^Kolom \d/.test(l.label))
    .map((l) => `• ${l.label}: ${l.value}`)
    .join("\n");
  const est = opts.estimate ? `\nEstimasi di konfigurator: ${estimateText(opts.estimate)}` : "";
  return `${head}\n\n*${opts.productName}*\n${body}${est}\n\nLihat desain 3D saya:\n${opts.url}`;
}
