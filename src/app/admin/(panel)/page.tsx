import Link from "next/link";
import { AdminTitle, Card, StatusBadge } from "@/components/admin/ui";
import { formatDate, formatRupiahShort } from "@/lib/format";
import { listProducts } from "@/lib/data/catalog";
import { REQUEST_STATUSES, STATUS_LABEL, countByStatus, listRequests } from "@/lib/data/requests";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ringkasan" };

export default async function AdminDashboard() {
  const [counts, recent, products] = await Promise.all([countByStatus(), listRequests(6), listProducts({ includeDraft: true })]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <AdminTitle title="Ringkasan" description="Permintaan terbaru dan kondisi katalog Anda." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {REQUEST_STATUSES.map((s) => (
          <Link key={s} href="/admin/permintaan" className="border border-line bg-paper p-4 transition-colors hover:border-ink">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">{STATUS_LABEL[s]}</p>
            <p className="mt-2 font-display text-3xl font-medium">{counts[s] ?? 0}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card title={`Permintaan terbaru (${total} total)`}>
          {recent.length === 0 ? (
            <p className="py-6 text-[14px] text-ink-soft">Belum ada permintaan masuk.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/permintaan/${r.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-paper-2/60">
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold">
                        {r.name} <span className="font-normal text-ink-mute">· {r.productName ?? "Pesan umum"}</span>
                      </p>
                      <p className="font-mono text-[11.5px] text-ink-mute">
                        {r.code} · {formatDate(r.createdAt)}
                        {r.estimateMin ? ` · ${formatRupiahShort(r.estimateMin)}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Katalog">
          <ul className="divide-y divide-line text-[14px]">
            {products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/produk/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                <span className={`font-mono text-[11px] ${p.published ? "text-moss" : "text-ink-mute"}`}>{p.published ? "tayang" : "draf"}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
