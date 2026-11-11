import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { AdminTitle, Card, Field, Flash, inputCls } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, DOOR_LABEL, DOOR_STYLE_LABEL, BASE_LABEL, HANDLE_LABEL, HARDWARE_LABEL } from "@/lib/configurator/labels";
import { KIND_SPECS } from "@/lib/configurator/kinds";
import { getProductById, listMaterials } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit produk" };

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [product, materials] = await Promise.all([getProductById(Number(id)), listMaterials({ includeInactive: true })]);
  if (!product) notFound();
  const spec = KIND_SPECS[product.kind];
  const d = product.defaults;

  const dimRow = (label: string, prefix: "w" | "h" | "d", axis: "width" | "height" | "depth") => {
    const l = product.limits[axis];
    const hard = spec.limits[axis];
    return (
      <div className="grid grid-cols-[6rem_1fr_1fr_1fr] items-center gap-3">
        <div>
          <p className="text-[13px] font-semibold">{label}</p>
          <p className="font-mono text-[10.5px] text-ink-mute">teknis {hard.min}–{hard.max}</p>
        </div>
        {(["min", "max", "def"] as const).map((k) => (
          <label key={k} className="block">
            <span className="mb-1 block font-mono text-[10.5px] uppercase text-ink-mute">{k === "def" ? "awal" : k}</span>
            <input name={`${prefix}_${k}`} type="number" defaultValue={l[k]} min={hard.min} max={hard.max} className={inputCls} />
          </label>
        ))}
      </div>
    );
  };

  const select = (name: string, value: string | undefined, options: [string, string][]) => (
    <select name={name} defaultValue={value} className={inputCls}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );

  const matOptions: [string, string][] = materials.map((m) => [m.slug, m.name]);

  return (
    <>
      <p className="mb-3 text-[13px]">
        <Link href="/admin/produk" className="text-ink-soft hover:text-ink">← Semua produk</Link>
      </p>
      <AdminTitle
        title={product.name}
        description={`Jenis model: ${spec.label}`}
        action={
          <div className="flex gap-2">
            <Button href={`/konfigurator/${product.slug}`} variant="outline" size="sm">
              Coba konfigurator ↗
            </Button>
            {product.published && (
              <Button href={`/produk/${product.slug}`} variant="ghost" size="sm">
                Lihat halaman ↗
              </Button>
            )}
          </div>
        }
      />
      <Flash show={saved === "1"}>Perubahan tersimpan.</Flash>

      <form action={saveProductAction} className="grid gap-6 xl:grid-cols-2">
        <input type="hidden" name="id" value={product.id} />

        <Card title="Informasi katalog" className="grid content-start gap-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama produk">
              <input name="name" required defaultValue={product.name} className={inputCls} />
            </Field>
            <Field label="Kategori">
              {select("category", product.category, CATEGORIES.map((c) => [c, c]))}
            </Field>
          </div>
          <Field label="Tagline" hint="Satu kalimat di kartu katalog.">
            <input name="tagline" defaultValue={product.tagline} maxLength={300} className={inputCls} />
          </Field>
          <Field label="Deskripsi">
            <textarea name="description" rows={4} defaultValue={product.description} className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14.5px] focus:border-ink focus:outline-none" />
          </Field>
          <Field label="Poin unggulan" hint="Satu poin per baris, maksimal 8.">
            <textarea name="highlights" rows={4} defaultValue={product.highlights.join("\n")} className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14.5px] focus:border-ink focus:outline-none" />
          </Field>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-[14px] font-medium">
              <input type="checkbox" name="published" defaultChecked={product.published} className="h-4 w-4 accent-[#c2562f]" />
              Tayangkan di website
            </label>
            <label className="flex items-center gap-2 text-[14px] font-medium">
              Urutan
              <input name="sortOrder" type="number" defaultValue={product.sortOrder} className={`${inputCls} w-20`} />
            </label>
          </div>
        </Card>

        <Card title="Batas ukuran (cm)" className="grid content-start gap-4">
          <p className="text-[12.5px] text-ink-soft">
            Anda dapat mempersempit batas dan mengubah ukuran awal. Rentang teknis ditetapkan developer agar konstruksi tetap aman.
          </p>
          {dimRow("Lebar", "w", "width")}
          {dimRow("Tinggi", "h", "height")}
          {dimRow("Kedalaman", "d", "depth")}
        </Card>

        <Card title="Rumus estimasi harga" className="grid content-start gap-4">
          <p className="text-[12.5px] text-ink-soft">
            Total = (luas papan × harga material/m²) × pengali + biaya komponen + biaya tetap. Harga material diatur di menu Material.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Biaya tetap (Rp)">
              <input name="p_base" type="number" defaultValue={product.pricing.base} className={inputCls} />
            </Field>
            <Field label="Pengali ongkos kerja" hint="1,0–4,0">
              <input name="p_margin" type="number" step="0.05" defaultValue={product.pricing.margin} className={inputCls} />
            </Field>
            <Field label="Per laci (Rp)">
              <input name="p_drawer" type="number" defaultValue={product.pricing.perDrawer} className={inputCls} />
            </Field>
            <Field label="Per daun pintu engsel (Rp)">
              <input name="p_door" type="number" defaultValue={product.pricing.perHingedDoor} className={inputCls} />
            </Field>
            <Field label="Per panel geser (Rp)">
              <input name="p_slide" type="number" defaultValue={product.pricing.perSlidingPanel} className={inputCls} />
            </Field>
            <Field label="Per handle (Rp)">
              <input name="p_handle" type="number" defaultValue={product.pricing.perHandle} className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card title="Pengaturan awal konfigurator" className="grid content-start gap-4 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Material rangka awal">{select("def_bodyMaterial", d.bodyMaterial, matOptions)}</Field>
            <Field label="Material fasad awal">{select("def_frontMaterial", d.frontMaterial, matOptions)}</Field>
            <Field label="Hardware awal">
              {select("def_hardware", d.hardware ?? "black", Object.entries(HARDWARE_LABEL))}
            </Field>
            <Field label="Handle awal">{select("def_handle", d.handle ?? "bar", Object.entries(HANDLE_LABEL))}</Field>
            {spec.cabinet && (
              <>
                <Field label="Pintu awal">
                  {select("def_doors", d.doors ?? spec.defaults.doors, spec.cabinet.doors.map((x) => [x, DOOR_LABEL[x]]))}
                </Field>
                <Field label="Gaya pintu awal">
                  {select("def_doorStyle", d.doorStyle ?? "solid", spec.cabinet.doorStyles.map((x) => [x, DOOR_STYLE_LABEL[x]]))}
                </Field>
                <Field label="Alas awal">
                  {select("def_base", d.base ?? spec.defaults.base, spec.cabinet.bases.map((x) => [x, BASE_LABEL[x]]))}
                </Field>
                <Field label="Jumlah kolom awal" hint={`1–${spec.cabinet.maxColumns}; menyesuaikan lebar otomatis`}>
                  <input name="def_cols" type="number" min={1} max={spec.cabinet.maxColumns} defaultValue={d.columns?.length ?? 3} className={inputCls} />
                </Field>
              </>
            )}
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3 xl:col-span-2">
          <Button type="submit" variant="accent" size="lg">
            Simpan perubahan
          </Button>
        </div>
      </form>

      <form action={deleteProductAction} className="mt-10 border-t border-line pt-5">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="text-[13px] text-ink-mute underline underline-offset-2 hover:text-clay-dark">
          Hapus produk ini secara permanen
        </button>
      </form>
    </>
  );
}
