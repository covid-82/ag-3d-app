import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/Button";
import { Container, PageHeader } from "@/components/ui/Section";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Ukur lewat WhatsApp, email, atau formulir. Kunjungi workshop dengan janji temu.",
  alternates: { canonical: "/kontak" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontak"
        title="Bicara langsung dengan tim kami."
        description="Untuk pertanyaan umum, ukuran khusus, atau janji kunjungan. Untuk penawaran desain, gunakan tombol “Minta penawaran” di konfigurator agar spesifikasi ikut terkirim."
      />
      <Container className="grid gap-10 py-14 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-20">
        <div className="space-y-6">
          <div className="border border-ink p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-clay">Tercepat</p>
            <h2 className="mt-2 font-display text-2xl font-medium">WhatsApp</h2>
            <p className="mt-1 font-mono text-lg">{SITE.whatsappDisplay}</p>
            <Button
              href={whatsappLink("Halo Ukur, saya ingin bertanya tentang furnitur custom.")}
              external
              variant="primary"
              size="md"
              className="mt-5"
            >
              Chat sekarang
            </Button>
          </div>
          <dl className="divide-y divide-line border-y border-ink text-[15.5px]">
            {[
              ["Email", SITE.email],
              ["Alamat", SITE.address],
              ["Jam kerja", SITE.hours],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 py-4">
                <dt className="text-ink-mute">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[14.5px] leading-relaxed text-ink-soft">{SITE.workshop}</p>
        </div>
        <ContactForm />
      </Container>
    </>
  );
}
