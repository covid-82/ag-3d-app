import { AdminTitle, Card } from "@/components/admin/ui";

export const metadata = { title: "Panduan admin" };

const ADMIN_CAN = [
  "Menambah, menayangkan/menyembunyikan, mengurutkan, dan menghapus produk katalog.",
  "Mengubah nama, kategori, tagline, deskripsi, dan poin unggulan produk.",
  "Mempersempit batas lebar/tinggi/kedalaman serta mengubah ukuran awal, dalam rentang teknis yang aman.",
  "Mengubah pengaturan awal: material, hardware, handle, jenis pintu, alas, dan jumlah kolom.",
  "Menambah, mengubah warna/nama/harga, mengurutkan, dan menonaktifkan material atau warna.",
  "Mengubah rumus estimasi harga: biaya tetap, pengali ongkos kerja, biaya per laci/pintu/panel geser/handle.",
  "Melihat permintaan pelanggan lengkap dengan pratinjau, spesifikasi, tautan desain; mengubah status dan menulis catatan; membalas via WhatsApp.",
];

const DEV_NEEDED = [
  "Jenis model 3D baru (mis. tempat tidur, meja makan, dapur). Setiap jenis memerlukan pembuatan geometri dan aturan konstruksi.",
  "Komponen baru: tipe pintu, bentuk handle, gaya kaki, atau isi kolom baru.",
  "Aturan kombinasi (mis. pintu geser tidak bisa dengan laci), jarak minimal antar rak, atau lebar kolom minimal/maksimal.",
  "Memperluas rentang teknis ukuran di atas batas yang sudah ditetapkan per jenis model.",
  "Finishing hardware baru (saat ini: hitam doff, kuningan, baja sikat) dan tekstur kayu kustom dari foto.",
  "Penyimpanan desain per akun, keranjang, checkout, pembayaran, dan unduhan PDF spesifikasi.",
];

export default function AdminHelp() {
  return (
    <>
      <AdminTitle title="Panduan admin" description="Ringkasan apa yang dapat Anda atur sendiri dan apa yang masih memerlukan bantuan developer." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Bisa diatur lewat admin">
          <ul className="space-y-3 text-[14.5px] leading-snug">
            {ADMIN_CAN.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 bg-moss" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Perlu bantuan developer">
          <ul className="space-y-3 text-[14.5px] leading-snug">
            {DEV_NEEDED.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 bg-clay" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card title="Kontak & identitas usaha" className="mt-6">
        <p className="text-[14.5px] leading-relaxed text-ink-soft">
          Nomor WhatsApp, email, alamat, dan jam kerja disimpan di <code className="font-mono text-[13px] text-ink">src/lib/site.ts</code>. Kata sandi admin
          diatur lewat variabel lingkungan <code className="font-mono text-[13px] text-ink">ADMIN_PASSWORD</code>.
        </p>
      </Card>
    </>
  );
}
