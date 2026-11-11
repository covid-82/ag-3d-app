import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container, PageHeader, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Panduan pemesanan",
  description: "Langkah memesan furnitur custom di Ukur: dari konfigurasi 3D, penawaran, survey ukuran, produksi, sampai pemasangan.",
  alternates: { canonical: "/panduan-pemesanan" },
};

const STEPS = [
  {
    title: "Rancang di konfigurator",
    body: "Pilih model, atur ukuran, isi kolom, pintu, material, dan warna. Gunakan tombol Reset bila ingin mulai dari awal, dan Urungkan untuk membatalkan langkah terakhir.",
    tip: "Ukur ruang Anda dulu. Sisakan 1–2 cm di kiri-kanan dan atas agar mudah dipasang.",
  },
  {
    title: "Kirim permintaan penawaran",
    body: "Isi nama dan nomor WhatsApp. Spesifikasi, ukuran, dan gambar pratinjau ikut terkirim otomatis. Anda juga bisa langsung mengirim desain lewat WhatsApp.",
    tip: "Tambahkan catatan: lokasi pemasangan, lantai berapa, ada lift atau tidak.",
  },
  {
    title: "Konsultasi & survey ukuran",
    body: "Tim kami menghubungi Anda, memeriksa kelayakan desain, dan menjadwalkan survey bila diperlukan. Perubahan desain pada tahap ini tanpa biaya.",
    tip: "Siapkan foto ruang dan denah sederhana bila survey belum memungkinkan.",
  },
  {
    title: "Penawaran & uang muka",
    body: "Anda menerima penawaran final berisi gambar kerja, daftar material, jadwal, dan harga. Produksi dimulai setelah desain disetujui dan uang muka diterima.",
    tip: "Harga di konfigurator hanyalah perkiraan; angka final ada di penawaran.",
  },
  {
    title: "Produksi",
    body: "Umumnya 3–5 minggu. Kami mengabarkan progres pada tahap utama, dan Anda boleh meminta foto saat rangka selesai dirakit.",
    tip: "Perubahan setelah produksi dimulai tetap dimungkinkan, namun dapat memengaruhi harga dan jadwal.",
  },
  {
    title: "Pengiriman & pemasangan",
    body: "Furnitur dikirim dan dipasang oleh tim kami. Pelunasan dilakukan setelah pemasangan selesai dan Anda puas dengan hasilnya.",
    tip: "Pastikan akses masuk (pintu, tangga, lift) cukup untuk panel terbesar.",
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Panduan pemesanan"
        title="Enam langkah, dari layar sampai ruang Anda."
        description="Tidak perlu paham gambar teknik. Anda cukup memilih, kami yang memastikan semuanya bisa dibuat dan dipasang dengan benar."
      />
      <Container className="py-16 lg:py-24">
        <ol className="relative grid gap-0 border-l border-ink">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative grid gap-4 py-8 pl-8 sm:pl-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
              <span className="absolute -left-[17px] top-8 grid h-8 w-8 place-items-center border border-ink bg-paper font-mono text-[12px] font-medium">
                {i + 1}
              </span>
              <div>
                <h2 className="font-display text-2xl font-medium sm:text-3xl">{s.title}</h2>
                <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-soft">{s.body}</p>
              </div>
              <p className="self-start border-l-2 border-clay bg-paper-2 px-4 py-3 text-[14.5px] leading-snug">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-clay">Tips</span>
                <br />
                {s.tip}
              </p>
            </li>
          ))}
        </ol>
      </Container>

      <section className="border-t border-line bg-paper-2 py-16 lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="Aturan umum" title="Hal yang sebaiknya Anda tahu." />
          <ul className="divide-y divide-line border-y border-ink text-[15.5px] leading-relaxed">
            {[
              "Warna dan serat di layar adalah pendekatan. Sampel material dapat dilihat di workshop.",
              "Estimasi harga di konfigurator berlaku sebagai acuan awal, bukan penawaran mengikat.",
              "Ukuran di luar batas konfigurator tetap dapat dipertimbangkan melalui konsultasi.",
              "Pengiriman dan pemasangan di luar area layanan dibahas per kasus.",
            ].map((t) => (
              <li key={t} className="flex gap-3 py-4">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-clay" />
                {t}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-lg font-display text-3xl font-medium leading-tight sm:text-4xl">Siap mencoba? Butuh sekitar 5 menit.</h2>
        <Button href="/produk" variant="primary" size="md">
          Pilih model
        </Button>
      </Container>
    </>
  );
}
