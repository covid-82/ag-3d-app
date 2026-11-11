/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRequestAction, updateRequestAction } from "@/app/admin/actions";
import { AdminTitle, Card, Field, Flash, StatusBadge, inputCls } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { encodeConfig } from "@/lib/configurator/share";
import { formatDate, formatRupiah } from "@/lib/format";
import { REQUEST_STATUSES, STATUS_LABEL, getRequest } from "@/lib/data/requests";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail permintaan" };

function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `62${d.slice(1)}` : d.startsWith("62") ? d : `62${d}`;
}

export default async function RequestDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const req = await getRequest(Number(id));
  if (!req) notFound();

  const designLink = req.config && req.productSlug ? `/konfigurator/${req.productSlug}?d=${encodeConfig(req.config)}` : null;
  const reply = whatsappLink(
    `Halo ${req.name}, terima kasih sudah mengirim permintaan ${req.productName ?? ""} (${req.code}) ke Ukur. Boleh kami konfirmasi beberapa detail?`,
    waNumber(req.phone),
  );

  return (
    <>
      <p className="mb-3 text-[13px]">
        <Link href="/admin/permintaan" className="text-ink-soft hover:text-ink">← Semua permintaan</Link>
      </p>
      <AdminTitle
        title={req.code}
        description={`${req.type === "quote" ? "Permintaan penawaran" : "Pesan umum"} · ${formatDate(req.createdAt)}`}
        action={<StatusBadge status={req.status} />}
      />
      <Flash show={saved === "1"}>Perubahan tersimpan.</Flash>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {req.config && (
            <Card title={req.productName ?? "Desain"}>
              {req.previewImage ? (
                <img src={req.previewImage} alt={`Pratinjau desain ${req.productName}`} className="aspect-[4/3] w-full border border-line object-cover" />
              ) : (
                <p className="border border-dashed border-line p-6 text-center text-[13px] text-ink-mute">Pratinjau tidak tersedia (3D tidak aktif saat dikirim).</p>
              )}
              <dl className="mt-5 divide-y divide-line border-y border-line text-[14px]">
                {(req.summary ?? []).map((l, i) => (
                  <div key={i} className="grid grid-cols-[9rem_1fr] gap-3 py-2">
                    <dt className="text-ink-mute">{l.label}</dt>
                    <dd className="font-medium">{l.value}</dd>
                  </div>
                ))}
              </dl>
              {req.estimateMin && (
                <p className="mt-4 text-[14px]">
                  <span className="text-ink-mute">Estimasi konfigurator: </span>
                  <strong>{formatRupiah(req.estimateMin)} – {formatRupiah(req.estimateMax ?? req.estimateMin)}</strong>
                </p>
              )}
              {designLink && (
                <Button href={designLink} variant="outline" size="sm" className="mt-4">
                  Buka desain di konfigurator ↗
                </Button>
              )}
            </Card>
          )}
          {req.notes && (
            <Card title="Catatan pelanggan">
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{req.notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Pelanggan">
            <p className="text-lg font-semibold">{req.name}</p>
            <p className="mt-1 font-mono text-[13.5px]">{req.phone}</p>
            {req.email && <p className="font-mono text-[13px] text-ink-soft">{req.email}</p>}
            {req.city && <p className="mt-1 text-[13.5px] text-ink-soft">{req.city}</p>}
            <Button href={reply} external variant="accent" size="sm" className="mt-4">
              Balas lewat WhatsApp
            </Button>
          </Card>

          <Card title="Tindak lanjut">
            <form action={updateRequestAction} className="grid gap-4">
              <input type="hidden" name="id" value={req.id} />
              <Field label="Status">
                <select name="status" defaultValue={req.status} className={inputCls}>
                  {REQUEST_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Catatan internal">
                <textarea name="adminNote" rows={4} defaultValue={req.adminNote ?? ""} className="w-full rounded-sm border border-line bg-paper px-3 py-2 text-[14.5px] focus:border-ink focus:outline-none" />
              </Field>
              <Button type="submit" variant="primary">
                Simpan
              </Button>
            </form>
          </Card>

          <form action={deleteRequestAction}>
            <input type="hidden" name="id" value={req.id} />
            <button type="submit" className="text-[13px] text-ink-mute underline underline-offset-2 hover:text-clay-dark">
              Hapus permintaan ini
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
