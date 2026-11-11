"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Ringkasan", exact: true },
  { href: "/admin/permintaan", label: "Permintaan" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/material", label: "Material" },
  { href: "/admin/bantuan", label: "Panduan admin" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Navigasi admin" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-sm px-3 py-2.5 text-[14px] font-medium transition-colors ${
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-3 hover:text-ink"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
