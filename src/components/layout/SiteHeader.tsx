import Link from "next/link";
import { NAV } from "@/lib/site";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav aria-label="Navigasi utama" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/produk" className={buttonClass("primary", "sm", "hidden md:inline-flex")}>
            Mulai mendesain
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
