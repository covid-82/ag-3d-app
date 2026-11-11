import { notFound, redirect } from "next/navigation";
import { encodeConfig } from "@/lib/configurator/share";
import { getRequestByCode } from "@/lib/data/requests";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/** Tautan pendek desain yang dikirim pelanggan: membuka kembali konfigurator dengan konfigurasi tersimpan. */
export default async function SharedDesign({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Cek apakah code adalah token konfigurasi base64 langsung
  const directConfig = decodeConfig(code);
  if (directConfig) {
    redirect(`/konfigurator/lemari-pakaian-engsel?d=${code}`);
  }

  // Jika bukan, cari di database quote requests
  const req = await getRequestByCode(code.toUpperCase());
  if (!req || !req.config || !req.productSlug) notFound();
  redirect(`/konfigurator/${req.productSlug}?d=${encodeConfig(req.config)}`);
}
