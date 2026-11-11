const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatRupiah = (v: number) => rupiah.format(v).replace(/\u00a0/g, " ");

/** 12.500.000 → "12,5 jt" */
export function formatRupiahShort(v: number): string {
  if (v >= 1_000_000) {
    const jt = v / 1_000_000;
    return `Rp ${jt.toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  return formatRupiah(v);
}

export const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(
    new Date(d),
  );

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
