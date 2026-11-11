import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container, PageHeader, SectionHeading } from "@/components/ui/Section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang Ukur",
  description: "Ukur adalah workshop furnitur made-to-measure. Kami mengerjakan lemari, rak, kabinet, dan meja sesuai ukuran ruang Anda.",
  alternates: { canonical: "/tentang" },
};

const PRINCIPLES = [
  {
    title: "Ukuran ditentukan ruangnya",
    body: "Furnitur standar memaksa ruang menyesuaikan. Kami membalik urutannya: ukur ruangnya dulu, baru furniturnya dibuat.",
  },
  {
    title: "Material disebut apa adanya",
    body: "Rangka dari multiplek dan blockboard, fasad dari veneer atau HPL. Semuanya tertulis jelas di penawaran, tanpa istilah yang menyamarkan.",
  },
  {
    title: "Aturan konstruksi dijaga",
    body: "Konfigurator tidak mengizinkan kombinasi yang melemahkan struktur, seperti rak terlalu jarang atau laci pada pintu geser. Ini bukan pembatas, melainkan pengalaman kami di workshop.",
  },
  {
    title: "Hasil akhirnya terpasang",
    body: "Kami mengirim dan memasang sendiri. Furnitur yang bagus di layar belum selesai bila pintunya belum rata di dinding Anda.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tentang"
        title="Workshop kecil dengan satu keyakinan: ukuran itu penting."
        description="Ukur memproduksi furnitur made-to-measure untuk rumah dan kantor. Website ini adalah cara kami membuat proses desain lebih mudah dipahami oleh orang yang bukan desainer."
      />

      <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-24">
        <SectionHeading eyebrow="Cara kerja kami" title="Dari konfigurator ke workshop, tanpa terjemahan ulang." />
        <div className="space-y-5 text-[16.5px] leading-relaxed text-ink-soft">
          <p>
            Dulu, memesan furnitur custom berarti menjelaskan keinginan lewat chat, menunggu sketsa, lalu revisi
            berulang kali. Banyak detail hilang di perjalanan.
          </p>
          <p>
            Dengan konfigurator, Anda menyusun sendiri desain yang Anda bayangkan dan melihatnya dari semua sudut. Saat
            Anda mengirim permintaan, workshop menerima ukuran, susunan komponen, material, dan gambar yang sama persis
            dengan yang Anda lihat.
          </p>
          <p>
            Tim kami lalu memeriksa kelayakannya, mengonfirmasi ukuran di lokasi, dan menyusun penawaran. Anda tetap bisa
            mengubah desain sebelum produksi dimulai.
          </p>
        </div>
      </Container>

      <section className="border-y border-ink bg-paper-2">
        <Container className="py-16 lg:py-24">
          <SectionHeading eyebrow="Prinsip" title="Empat hal yang kami pegang." />
          <div className="mt-12 grid gap-px border border-ink bg-ink md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="bg-paper p-7 lg:p-9">
                <span className="font-mono text-sm text-clay">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-2xl font-medium leading-snug">{p.title}</h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <SectionHeading eyebrow="Kunjungi" title="Lihat contoh material langsung." />
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{SITE.workshop} Warna di layar bisa berbeda dengan aslinya, jadi kami sarankan melihat sampel sebelum memutuskan.</p>
        </div>
        <div className="border border-ink p-7">
          <p className="font-display text-xl font-medium">{SITE.name} Workshop</p>
          <p className="mt-2 text-ink-soft">{SITE.address}</p>
          <p className="mt-1 text-ink-soft">{SITE.hours}</p>
          <Button href="/kontak" variant="primary" className="mt-6">
            Buat janji kunjungan
          </Button>
        </div>
      </Container>
    </>
  );
}
