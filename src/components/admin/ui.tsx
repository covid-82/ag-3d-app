import type { ReactNode } from "react";

export function AdminTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[14.5px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-paper p-5 ${className}`}>
      {title && <h2 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-clay">{title}</h2>}
      {children}
    </section>
  );
}

export const inputCls =
  "h-10 w-full rounded-sm border border-line bg-paper px-3 text-[14.5px] focus:border-ink focus:outline-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-[13px] font-semibold">
      {label}
      <div className="mt-1.5 font-normal">{children}</div>
      {hint && <span className="mt-1 block text-[12px] font-normal text-ink-mute">{hint}</span>}
    </label>
  );
}

export function Flash({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <p role="status" className="mb-5 border-l-2 border-moss bg-moss/10 px-3 py-2 text-[13.5px] text-moss">
      {children}
    </p>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    baru: "bg-clay text-white",
    dihubungi: "bg-brass/25 text-ink",
    penawaran: "bg-ink/10 text-ink",
    deal: "bg-moss text-white",
    batal: "bg-paper-3 text-ink-mute",
  };
  const label: Record<string, string> = {
    baru: "Baru",
    dihubungi: "Dihubungi",
    penawaran: "Penawaran",
    deal: "Deal",
    batal: "Batal",
  };
  return (
    <span className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium ${tone[status] ?? tone.penawaran}`}>
      {label[status] ?? status}
    </span>
  );
}
