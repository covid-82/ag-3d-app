import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { requests, type RequestRow } from "@/db/schema";

export const REQUEST_STATUSES = ["baru", "dihubungi", "penawaran", "deal", "batal"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  baru: "Baru",
  dihubungi: "Sudah dihubungi",
  penawaran: "Penawaran dikirim",
  deal: "Deal",
  batal: "Batal",
};

export function generateCode(): string {
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UKR-${ym}-${rand}`;
}

export type NewRequest = Omit<typeof requests.$inferInsert, "id" | "createdAt" | "status" | "adminNote" | "code">;

export async function createRequest(input: NewRequest): Promise<RequestRow> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db
        .insert(requests)
        .values({ ...input, code: generateCode() })
        .returning();
      return row;
    } catch (err) {
      if (attempt === 4) throw err;
    }
  }
  throw new Error("Gagal membuat permintaan");
}

export const listRequests = (limit = 200) =>
  db.select().from(requests).orderBy(desc(requests.createdAt)).limit(limit);

export async function getRequest(id: number): Promise<RequestRow | null> {
  const [row] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  return row ?? null;
}

export async function getRequestByCode(code: string): Promise<RequestRow | null> {
  const [row] = await db.select().from(requests).where(eq(requests.code, code)).limit(1);
  return row ?? null;
}

export async function countByStatus(): Promise<Record<string, number>> {
  const rows = await db.select({ status: requests.status, n: count() }).from(requests).groupBy(requests.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}
