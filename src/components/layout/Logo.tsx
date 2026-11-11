import Link from "next/link";
import { SITE } from "@/lib/site";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="1.5" y="1.5" width="29" height="29" stroke="currentColor" strokeWidth="2" />
      <path d="M1.5 9h6M1.5 16h9M1.5 23h6" stroke="currentColor" strokeWidth="2" />
      <path d="M16 30.5V12h14.5" stroke="#c2562f" strokeWidth="2.4" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 text-ink" aria-label={`${SITE.name} — beranda`}>
      <LogoMark />
      <span className="font-display text-[1.65rem] font-semibold leading-none tracking-tight">{SITE.name.toLowerCase()}</span>
    </Link>
  );
}
