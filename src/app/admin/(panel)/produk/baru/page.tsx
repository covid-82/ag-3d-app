import { createProductAction } from "@/app/admin/actions";
import { AdminTitle, Card, Field, inputCls } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { KIND_LIST } from "@/lib/configurator/kinds";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produk baru" };

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <AdminTitle title="Produk baru" description="Pilih jenis model 3D sebagai dasar. Produk baru berstatus draf sampai Anda menayangkannya." />
      <Card className="max-w-xl">
        <form action={createProductAction} className="grid gap-4">
          <Field label="Nama produk">
            <input name="name" required minLength={3} maxLength={120} className={inputCls} placeholder="mis. Lemari Anak 2 Pintu" />
          </Field>
          <Field label="Jenis model 3D" hint="Menentukan bentuk, komponen, dan aturan konstruksi. Jenis baru memerlukan developer.">
            <select name="kind" className={inputCls}>
              {KIND_LIST.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          {error && <p className="text-[13px] text-clay-dark">Nama produk minimal 3 karakter.</p>}
          <Button type="submit" variant="primary">
            Buat & lanjut edit
          </Button>
        </form>
      </Card>
    </>
  );
}
