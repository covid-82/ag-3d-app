import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Button } from "@/components/ui/Button";
import { swatchStyle } from "@/lib/swatch";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Section";
import { ShowcaseViewer } from "@/components/viewport/ShowcaseViewer";
import { formatDims } from "@/lib/configurator/summary";
import { productPreview } from "@/lib/configurator/preview";
import { listMaterials, listProducts } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "Pilih model", body: "Lemari, rak, kabinet TV, atau meja kerja. Tiap model sudah punya aturan ukuran dan konstruksi yang aman." },
  { n: "02", title: "Atur sampai pas", body: "Ubah lebar, tinggi, dan kedalaman. Tentukan isi tiap kolom: gantung, rak, atau laci. Pilih pintu, material, dan warna." },
  { n: "03", title: "Lihat langsung di 3D", body: "Putar, zoom, buka pintu dan laci. Setiap perubahan langsung tampil di model, lengkap dengan garis ukuran." },
  { n: "04", title: "Kirim, kami hitung", body: "Desain terkirim ke workshop beserta spesifikasi dan gambar. Anda menerima penawaran setelah ukuran di lokasi dikonfirmasi." },
];

const FAQ = [
  {
    q: "Apakah harga di konfigurator sudah final?",
    a: "Belum. Angka di konfigurator adalah perkiraan yang dihitung dari luas papan, material, dan komponen pilihan Anda. Harga final kami berikan setelah ukuran di lokasi dikonfirmasi, karena kondisi dinding, lantai, dan instalasi listrik bisa memengaruhi desain.",
  },
  {
    q: "Berapa lama pengerjaannya?",
    a: "Umumnya 3–5 minggu sejak desain disetujui dan uang muka diterima, tergantung antrean workshop dan jumlah komponen. Estimasi pastinya tercantum di penawaran.",
  },
  {
    q: "Bagaimana kalau ukuran saya di luar batas konfigurator?",
    a: "Kirim saja desain terdekat dan tuliskan ukuran yang Anda butuhkan di catatan. Tim kami menilai kelayakan strukturnya dan memberi saran, misalnya membagi menjadi dua modul.",
  },
  {
    q: "Tampilan 3D tidak muncul di perangkat saya.",
    a: "Konfigurator otomatis menampilkan gambar tampak depan yang tetap mengikuti seluruh pilihan Anda, sehingga permintaan penawaran tetap bisa dikirim. Mencoba browser lain biasanya memulihkan tampilan 3D.",
  },
];

export default async function HomePage() {
  const [products, materials] = await Promise.all([listProducts(), listMaterials()]);
  const hero = products[0];
  const heroPreview = hero ? productPreview(hero, materials) : null;
  const woods = materials.filter((m) => m.type === "wood").length;

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid gap-10 pb-14 pt-10 lg:grid-cols-[1fr_1.08fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-16">
          <div className="fade-up">
            <Eyebrow>{SITE.descriptor}</Eyebrow>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6.2vw,5rem)] font-medium leading-[0.98] tracking-[-0.02em]">
              Furnitur yang pas, <span className="italic text-clay">sampai ke sentimeter.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Pilih model, atur ukuran dan isinya, lalu lihat hasilnya langsung dalam 3D sebelum satu papan pun dipotong.
              Kirim desain Anda ke workshop kami untuk mendapat penawaran.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/produk" variant="primary" size="md">
                Mulai mendesain
              </Button>
              <Button href="/panduan-pemesanan" variant="outline" size="md">
                Lihat cara pemesanan
              </Button>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-ink pt-5">
              {[
                [`${products.length}`, "model siap dikonfigurasi"],
                [`${materials.length}`, `material & warna (${woods} serat kayu)`],
                ["3D", "putar, zoom, buka laci"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-medium">{v}</dt>
                  <dd className="mt-1 text-[12.5px] leading-snug text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {hero && heroPreview && (
            <div className="relative">
              <div className="relative border border-ink">
                <ShowcaseViewer
                  kind={hero.kind}
                  config={heroPreview.config}
                  materials={materials}
                  className="aspect-[5/4] min-h-[320px] w-full sm:aspect-[4/3] lg:aspect-[5/4]"
                />
                <div className="pointer-events-none absolute left-3 top-3 bg-paper px-2.5 py-1.5 font-mono text-[11px] ring-1 ring-ink">
                  {hero.name} · {formatDims(heroPreview.config)}
                </div>
              </div>
              <p className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                <span>Pratinjau langsung, bukan gambar statis</span>
                <a href={`/konfigurator/${hero.slug}`} className="text-clay hover:underline">
                  Buka konfigurator →
                </a>
              </p>
            </div>
          )}
        </Container>
        <div className="ruler-x" aria-hidden />
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="Alur pemesanan" title="Dari ide ke penawaran dalam satu halaman." />
          <ol className="mt-12 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-paper p-6 lg:p-7">
                <span className="font-mono text-sm text-clay">{s.n}</span>
                <h3 className="mt-6 font-display text-2xl font-medium">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-line bg-paper-2 py-20 lg:py-28">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Katalog" title="Model yang bisa Anda ubah bentuknya." />
            <Button href="/produk" variant="outline">
              Lihat semua produk
            </Button>
          </div>
          <div className="mt-12">
            <CatalogGrid products={products.slice(0, 6)} materials={materials} />
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Yang bisa diatur"
              title="Bukan sekadar ganti warna."
              description="Konfigurator mengubah konstruksi furnitur, bukan hanya tampilannya. Jumlah kolom, jarak rak, dan tinggi laci menyesuaikan ukuran yang Anda pilih, dengan batas yang menjaga furnitur tetap kokoh."
            />
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {[
                ["Ukuran", "Lebar, tinggi, dan kedalaman dengan batas per model"],
                ["Isi kolom", "Ruang gantung, rak, laci, atau kosong, diatur per kolom"],
                ["Pintu", "Engsel, geser, atau kaca berbingkai; handle batang, knob, atau push-open"],
                ["Material", `${materials.length} pilihan serat kayu dan warna, dipisah untuk rangka dan fasad`],
                ["Hardware", "Hitam doff, kuningan, atau baja sikat"],
              ].map(([k, v]) => (
                <li key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4">
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-clay">{k}</span>
                  <span className="text-[15px] leading-snug">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="self-start border border-ink bg-paper p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">Material tersedia</p>
            <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4">
              {materials.map((m) => (
                <div key={m.slug}>
                  <div className="aspect-square border border-ink/25" style={swatchStyle(m)} />
                  <p className="mt-2 text-[12.5px] font-medium leading-tight">{m.name}</p>
                  <p className="font-mono text-[10.5px] uppercase text-ink-mute">{m.type === "wood" ? "kayu" : "warna"}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-2 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow="Pertanyaan umum" title="Sebelum Anda mulai." />
          <div className="divide-y divide-ink border-y border-ink">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-start justify-between gap-6 font-display text-xl font-medium leading-snug">
                  {f.q}
                  <span aria-hidden className="mt-1 font-mono text-lg text-clay transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-moss text-paper">
        <Container className="flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Ruang Anda punya ukurannya sendiri. Kami ikuti.
          </h2>
          <Button href="/produk" variant="primary" size="md">
            Mulai mendesain
          </Button>
        </Container>
      </section>
    </>
  );
}
