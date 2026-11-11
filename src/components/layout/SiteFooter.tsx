import Link from "next/link";
import { NAV, SITE, whatsappLink } from "@/lib/site";
import { Container } from "@/components/ui/Section";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink bg-ink text-paper">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="text-paper [&_a]:text-paper">
            <Logo />
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-paper/70">
            Furnitur made-to-measure. Anda menentukan ukuran dan isinya, workshop kami mengerjakannya sampai terpasang.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Jelajahi</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-[15px] text-paper/85 hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Hubungi kami</h3>
          <ul className="mt-4 space-y-2.5 text-[15px] text-paper/85">
            <li>
              <a href={whatsappLink("Halo Ukur, saya ingin bertanya tentang furnitur custom.")} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="text-paper/70">{SITE.address}</li>
            <li className="text-paper/70">{SITE.hours}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-paper/15">
        <Container className="flex flex-col gap-2 py-5 text-[13px] text-paper/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Seluruh desain dibuat atas pesanan.</p>
          <p>Harga di konfigurator adalah estimasi; penawaran final setelah survey ukuran.</p>
        </Container>
      </div>
    </footer>
  );
}
