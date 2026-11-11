import Link from "next/link";
import { AdminTitle } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/Button";
import { KIND_SPECS } from "@/lib/configurator/kinds";
import { listProducts } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produk" };

export default async function AdminProducts() {
  const products = await listProducts({ includeDraft: true });
  return (
    <>
      <AdminTitle
        title="Produk"
        description="Kelola katalog. Setiap produk memakai satu jenis model 3D; batas ukuran, harga, dan pengaturan awalnya dapat diubah."
        action={
          <Link href="/admin/produk/baru" className={buttonClass("primary", "sm")}>
            + Produk baru
          </Link>
        }
      />
      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[560px] text-left text-[14px]">
          <thead className="border-b border-line bg-paper-2 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">Jenis model</th>
              <th className="px-4 py-3 font-medium">Lebar</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-paper-2/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/produk/${p.id}`} className="font-semibold text-clay hover:underline">
                    {p.name}
                  </Link>
                  <p className="font-mono text-[11.5px] text-ink-mute">/{p.slug}</p>
                </td>
                <td className="px-4 py-3">{KIND_SPECS[p.kind].label}</td>
                <td className="px-4 py-3 font-mono text-[12.5px]">
                  {p.limits.width.min}–{p.limits.width.max} cm
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono text-[11.5px] ${p.published ? "text-moss" : "text-ink-mute"}`}>{p.published ? "Tayang" : "Draf"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
