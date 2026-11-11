"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="text-[13px] font-semibold">
        Kata sandi admin
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 h-11 w-full rounded-sm border border-line bg-paper px-3 text-[15px] font-normal focus:border-ink focus:outline-none"
        />
      </label>
      {state?.error && (
        <p role="alert" className="border-l-2 border-clay bg-clay/10 px-3 py-2 text-[13px] text-clay-dark">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
