"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const field = "mt-1.5 h-11 w-full rounded-sm border border-line bg-paper px-3 text-[15px] font-normal focus:border-ink focus:outline-none";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message",
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          notes: fd.get("notes"),
          website: fd.get("website"),
        }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error ?? "Gagal mengirim pesan.");
      setCode(data.code);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="border border-ink bg-paper-2 p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-clay">Terkirim</p>
        <h3 className="mt-2 font-display text-2xl font-medium">Pesan Anda sudah kami terima.</h3>
        <p className="mt-3 text-ink-soft">Kami membalas lewat WhatsApp pada jam kerja. Kode referensi: <span className="font-mono font-medium text-ink">{code}</span></p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border border-ink bg-paper p-6 sm:p-8">
      <label className="text-[13px] font-semibold">
        Nama
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] font-semibold">
          Nomor WhatsApp
          <input name="phone" required inputMode="tel" autoComplete="tel" maxLength={25} className={field} />
        </label>
        <label className="text-[13px] font-semibold">
          Email <span className="font-normal text-ink-mute">(opsional)</span>
          <input name="email" type="email" autoComplete="email" maxLength={120} className={field} />
        </label>
      </div>
      <label className="text-[13px] font-semibold">
        Pesan
        <textarea name="notes" required minLength={5} maxLength={2000} rows={5} className="mt-1.5 w-full rounded-sm border border-line bg-paper px-3 py-2.5 text-[15px] font-normal focus:border-ink focus:outline-none" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && (
        <p role="alert" className="border-l-2 border-clay bg-clay/10 px-3 py-2 text-[13px] text-clay-dark">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={state === "sending"}>
        {state === "sending" ? "Mengirim…" : "Kirim pesan"}
      </Button>
    </form>
  );
}
