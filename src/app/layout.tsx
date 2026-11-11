import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--f-display", axes: ["opsz"], display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Furnitur custom, dirancang langsung dalam 3D`,
    template: `%s · ${SITE.name}`,
  },
  description:
    "Pilih model, atur ukuran dan isi, lihat hasilnya dalam 3D, lalu kirim desain untuk mendapat penawaran. Lemari, rak, kabinet TV, dan meja kerja made-to-measure.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
