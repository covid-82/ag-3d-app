import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "ukur_admin";
const MAX_AGE = 60 * 60 * 12;

const adminPassword = () => process.env.ADMIN_PASSWORD || "ukur-admin";
const secret = () => process.env.SESSION_SECRET || `ukur::${adminPassword()}`;

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  return safeEqual(createHmac("sha256", "pw").update(input).digest("hex"), createHmac("sha256", "pw").update(adminPassword()).digest("hex"));
}

export async function startSession() {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `admin.${exp}`;
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;
  const idx = raw.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

/** Panggil di awal setiap halaman & server action admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
