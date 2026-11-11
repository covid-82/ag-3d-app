import Link from "next/link";
import { AdminTitle, StatusBadge } from "@/components/admin/ui";
import { formatDate, formatRupiahShort } from "@/lib/format";
import { listRequests } from "@/lib/data/requests";

export const dynamic = "force-dynamic";
export const metadata = { title: "Permintaan" };

export default async function RequestsPage() {
  const rows = await listRequests();
  return (
    <>
      <AdminTitle title="Permintaan pelanggan" description="Permintaan penawaran dari konfigurator dan pesan dari halaman kontak." />
      {rows.length === 0 ? (
        <p className="border border-dashed border-line bg-paper p-10 text-center text-ink-soft">Belum ada permintaan masuk.</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="border-b border-line bg-paper-2 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Estimasi</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper-2/50">
                  <td className="px-4 py-3 font-mono text-[12.5px]">
                    <Link href={`/admin/permintaan/${r.id}`} className="font-medium text-clay hover:underline">
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[12.5px] text-ink-mute">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3">{r.productName ?? <span className="text-ink-mute">Pesan umum</span>}</td>
                  <td className="px-4 py-3 font-mono text-[12.5px]">
                    {r.estimateMin ? `${formatRupiahShort(r.estimateMin)} – ${formatRupiahShort(r.estimateMax ?? r.estimateMin)}` : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-ink-soft">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
