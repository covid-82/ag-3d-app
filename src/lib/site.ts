/** Identitas & kontak usaha Kayuara 3D Studio. */
export const SITE = {
  name: "Kayuara 3D",
  descriptor: "Studio Furnitur & Pintu Arsitektural Parametrik",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ag-3d-app.vercel.app",
  whatsapp: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  email: "halo@kayuara.id",
  address: "Sentra Kayu & Pertukangan Modern, Jepara & Jakarta",
  hours: "Senin–Sabtu, 08.00–18.00 WIB",
  workshop: "Workshop & studio 3D terbuka untuk kunjungan dan konsultasi spesifikasi.",
} as const;

export const NAV = [
  { href: "/produk", label: "Katalog Studio" },
  { href: "/panduan-pemesanan", label: "Panduan Arsitektural" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
] as const;

export function whatsappLink(message: string, phone: string = SITE.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
