import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/layout/Logo";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm border border-ink bg-paper p-8">
        <LogoMark className="h-9 w-9" />
        <h1 className="mt-5 font-display text-3xl font-medium">Panel admin</h1>
        <p className="mt-1 text-[14px] text-ink-soft">Kelola katalog, material, dan permintaan pelanggan.</p>
        <LoginForm />
      </div>
    </main>
  );
}
