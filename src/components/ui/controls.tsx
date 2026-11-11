"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { HARDWARE_LIST } from "@/lib/configurator/labels";
import { swatchStyle } from "@/lib/swatch";
import type { MaterialOption } from "@/lib/configurator/types";

/* ---------- Label & grup ---------- */

export function ControlGroup({
  label,
  hint,
  children,
  aside,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h4 className="text-[13px] font-semibold text-ink">{label}</h4>
        {aside}
      </div>
      {children}
      {hint && <p className="mt-2 text-[12.5px] leading-snug text-ink-mute">{hint}</p>}
    </div>
  );
}

/* ---------- Segmented ---------- */

export interface SegOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  reason?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  columns,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  columns?: number;
}) {
  const reasons = options.filter((o) => o.disabled && o.reason);
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={o.disabled}
              title={o.disabled ? o.reason : undefined}
              onClick={() => onChange(o.value)}
              className={`min-h-11 rounded-sm border px-2 py-2 text-[13.5px] font-medium leading-tight transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink hover:border-ink disabled:border-line disabled:text-ink-mute/60 disabled:hover:border-line"
              } disabled:cursor-not-allowed`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {reasons.map((o) => (
        <p key={o.value} className="mt-2 flex gap-1.5 text-[12.5px] leading-snug text-clay-dark">
          <span aria-hidden>↳</span>
          <span>
            <strong className="font-semibold">{o.label}</strong> tidak tersedia: {o.reason}
          </span>
        </p>
      ))}
    </div>
  );
}

/* ---------- Stepper ---------- */

export function Stepper({
  value,
  min,
  max,
  onChange,
  unit,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
  label: string;
}) {
  const btn =
    "grid h-11 w-11 place-items-center border border-line bg-paper text-xl leading-none transition-colors hover:border-ink disabled:cursor-not-allowed disabled:text-ink-mute/50 disabled:hover:border-line";
  return (
    <div className="inline-flex items-stretch" role="group" aria-label={label}>
      <button type="button" className={`${btn} rounded-l-sm`} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Kurangi ${label}`}>
        −
      </button>
      <div className="grid min-w-16 place-items-center border-y border-line bg-paper-2 px-3 font-mono text-[15px] font-medium" aria-live="polite">
        {value}
        {unit && <span className="ml-1 text-xs text-ink-mute">{unit}</span>}
      </div>
      <button type="button" className={`${btn} rounded-r-sm`} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Tambah ${label}`}>
        +
      </button>
    </div>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  reason,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  reason?: string;
}) {
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="flex min-h-11 w-full items-center justify-between gap-4 rounded-sm text-left text-[13.5px] font-medium disabled:cursor-not-allowed disabled:text-ink-mute/60"
      >
        <span>{label}</span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${checked ? "border-ink bg-ink" : "border-line bg-paper-2"}`}>
          <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${checked ? "left-5.5 bg-paper" : "left-0.5 bg-ink-mute"}`} />
        </span>
      </button>
      {disabled && reason && <p className="text-[12.5px] leading-snug text-clay-dark">↳ {reason}</p>}
    </div>
  );
}

/* ---------- Slider + input angka ---------- */

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "cm",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => setDraft(null), [value]);
  const fill = ((value - min) / Math.max(1, max - min)) * 100;

  const commit = () => {
    if (draft === null) return;
    const n = Number(draft.replace(",", "."));
    setDraft(null);
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))));
  };

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            inputMode="numeric"
            aria-label={`${label} dalam ${unit}`}
            value={draft ?? String(value)}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9.,]/g, ""))}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), commit())}
            className="h-9 w-[4.5rem] rounded-sm border border-line bg-paper px-2 text-right font-mono text-[15px] font-medium focus:border-ink focus:outline-none"
          />
          <span className="font-mono text-xs text-ink-mute">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        className="slider mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between font-mono text-[11px] text-ink-mute">
        <span>
          min {min}
        </span>
        <span>
          maks {max}
        </span>
      </div>
    </div>
  );
}

/* ---------- Swatch material ---------- */

export function SwatchGrid({
  materials,
  value,
  onChange,
  label,
}: {
  materials: MaterialOption[];
  value: string;
  onChange: (slug: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {materials.map((m) => {
        const active = m.slug === value;
        return (
          <button
            key={m.slug}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.slug)}
            className="group flex flex-col items-center gap-1.5 text-center"
          >
            <span
              className={`block aspect-square w-full rounded-sm border transition-all ${
                active ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper" : "border-ink/20 group-hover:border-ink"
              }`}
              style={swatchStyle(m)}
            />
            <span className={`text-[11.5px] leading-tight ${active ? "font-semibold text-ink" : "text-ink-soft"}`}>{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HardwareDot({ slug }: { slug: string }) {
  const h = HARDWARE_LIST.find((x) => x.slug === slug);
  return <span className="inline-block h-3 w-3 rounded-full border border-ink/30" style={{ background: h?.hex }} />;
}
