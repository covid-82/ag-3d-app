import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-28 text-center">
          <p className="font-mono text-sm text-clay">404 · ukuran tidak ditemukan</p>
          <h1 className="mt-4 font-display text-5xl font-medium">Halaman ini tidak ada.</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">Tautan mungkin sudah berubah, atau produknya tidak lagi tersedia.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/" variant="outline">Ke beranda</Button>
            <Button href="/produk" variant="accent">Lihat katalog</Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
