"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="grid h-10 w-10 place-items-center rounded-md border border-line text-ink hover:bg-paper-2 active:scale-95 transition-all"
      >
        <span className="relative block h-3.5 w-5">
          <span className={`absolute left-0 h-[2px] w-5 bg-ink transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-[2px] w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-[2px] w-5 bg-ink transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>
      {open && (
        <nav
          id="mobile-nav"
          className="fixed inset-x-0 top-[65px] z-40 h-[calc(100dvh-65px)] overflow-y-auto border-t border-line bg-paper px-5 pb-10 pt-4"
        >
          <ul className="divide-y divide-line">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-5 font-display text-2xl font-medium text-ink"
                >
                  {item.label}
                  <span aria-hidden className="text-clay">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button
              href="/produk"
              variant="primary"
              size="md"
              onClick={() => setOpen(false)}
              className="w-full justify-center"
            >
              Mulai mendesain
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
