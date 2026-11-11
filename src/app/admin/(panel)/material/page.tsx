import { createMaterialAction, deleteMaterialAction, saveMaterialAction } from "@/app/admin/actions";
import { AdminTitle, Card, Flash, inputCls } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { swatchStyle } from "@/lib/swatch";
import { listMaterialRows } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Material" };

export default async function AdminMaterials({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const rows = await listMaterialRows();

  return (
    <>
      <AdminTitle
        title="Material & warna"
        description="Pilihan yang muncul di konfigurator. Nonaktifkan material yang kosong stok alih-alih menghapusnya, agar permintaan lama tetap terbaca."
      />
      <Flash show={saved === "1"}>Perubahan tersimpan.</Flash>
      {error && <p className="mb-5 text-[13px] text-clay-dark">Nama material minimal 2 karakter.</p>}

      <div className="space-y-3">
        {rows.map((m) => (
          <div key={m.id} className="border border-line bg-paper p-4">
            <form action={saveMaterialAction} className="grid items-end gap-3 sm:grid-cols-[3rem_1fr_7rem_6rem_9rem_5rem_auto] sm:gap-4">
              <input type="hidden" name="id" value={m.id} />
              <div className="aspect-square w-12 border border-ink/30" style={swatchStyle({ hex: m.hex, type: m.type === "wood" ? "wood" : "solid" })} />
              <label className="text-[12px] font-semibold">
                Nama
                <input name="name" defaultValue={m.name} required className={`${inputCls} mt-1`} />
              </label>
              <label className="text-[12px] font-semibold">
                Jenis
                <select name="type" defaultValue={m.type} className={`${inputCls} mt-1`}>
                  <option value="wood">Kayu</option>
                  <option value="solid">Warna</option>
                </select>
              </label>
              <label className="text-[12px] font-semibold">
                Warna
                <input name="hex" type="color" defaultValue={m.hex} className="mt-1 h-10 w-full cursor-pointer rounded-sm border border-line bg-paper p-1" />
              </label>
              <label className="text-[12px] font-semibold">
                Harga/m² (Rp)
                <input name="pricePerM2" type="number" defaultValue={m.pricePerM2} className={`${inputCls} mt-1`} />
              </label>
              <label className="text-[12px] font-semibold">
                Urutan
                <input name="sortOrder" type="number" defaultValue={m.sortOrder} className={`${inputCls} mt-1`} />
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px] font-medium">
                  <input type="checkbox" name="active" defaultChecked={m.active} className="h-4 w-4 accent-[#c2562f]" />
                  Aktif
                </label>
                <Button type="submit" variant="primary" size="sm">
                  Simpan
                </Button>
              </div>
            </form>
            <form action={deleteMaterialAction} className="mt-2 text-right">
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="text-[12px] text-ink-mute underline underline-offset-2 hover:text-clay-dark">
                Hapus
              </button>
            </form>
          </div>
        ))}
      </div>

      <Card title="Tambah material" className="mt-8">
        <form action={createMaterialAction} className="grid items-end gap-4 sm:grid-cols-[1fr_8rem_6rem_10rem_auto]">
          <label className="text-[12px] font-semibold">
            Nama
            <input name="name" required minLength={2} className={`${inputCls} mt-1`} placeholder="mis. Oak Smoke" />
          </label>
          <label className="text-[12px] font-semibold">
            Jenis
            <select name="type" className={`${inputCls} mt-1`}>
              <option value="wood">Kayu</option>
              <option value="solid">Warna</option>
            </select>
          </label>
          <label className="text-[12px] font-semibold">
            Warna
            <input name="hex" type="color" defaultValue="#b9824a" className="mt-1 h-10 w-full cursor-pointer rounded-sm border border-line bg-paper p-1" />
          </label>
          <label className="text-[12px] font-semibold">
            Harga/m² (Rp)
            <input name="pricePerM2" type="number" defaultValue={600000} className={`${inputCls} mt-1`} />
          </label>
          <input type="hidden" name="sortOrder" value={99} />
          <Button type="submit" variant="accent">
            Tambah
          </Button>
        </form>
      </Card>
    </>
  );
}
