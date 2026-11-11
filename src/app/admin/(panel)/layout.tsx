import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col md:flex-row">
      <aside className="shrink-0 border-b border-line bg-paper px-4 py-4 md:w-60 md:border-b-0 md:border-r md:py-6">
        <div className="mb-4 flex items-center justify-between md:mb-8 md:block">
          <Logo href="/admin" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute md:mt-2 md:block">Admin</span>
        </div>
        <AdminNav />
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-[13px] md:mt-8">
          <Link href="/" target="_blank" className="text-ink-soft hover:text-ink">
            Lihat website ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-clay hover:underline">
              Keluar
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 md:py-8">{children}</div>
    </div>
  );
}
