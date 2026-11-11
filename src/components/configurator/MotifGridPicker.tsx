"use client";

import React from "react";
import type { DoorPattern } from "@/lib/configurator/types";
import { Check } from "lucide-react";

interface Props {
  value: DoorPattern;
  onChange: (pattern: DoorPattern) => void;
}

interface MotifOption {
  id: DoorPattern;
  title: string;
  desc: string;
  renderPreview: () => React.ReactNode;
}

export const MOTIF_OPTIONS: MotifOption[] = [
  {
    id: "rattan",
    title: "Anyaman Rotan",
    desc: "Rotan alami motif mata ayam",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#e8ded0]">
        <rect x="3" y="3" width="34" height="54" fill="none" stroke="#6e5033" strokeWidth="3" />
        <defs>
          <pattern id="rattan-pat" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="#b08a4a" />
            <path d="M0 3 h6 M3 0 v6" stroke="#8c6430" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect x="6" y="6" width="28" height="48" fill="url(#rattan-pat)" />
      </svg>
    ),
  },
  {
    id: "flush",
    title: "Polos Minimalis",
    desc: "Permukaan rata serat kayu utuh",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <line x1="12" y1="2" x2="14" y2="58" stroke="#a68e6f" strokeWidth="1" opacity="0.6" />
        <line x1="26" y1="2" x2="28" y2="58" stroke="#a68e6f" strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "vertical-groove",
    title: "Alur Vertikal",
    desc: "Garis tali air CNC presisi",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <line x1="9" y1="2" x2="9" y2="58" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="16" y1="2" x2="16" y2="58" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="23" y1="2" x2="23" y2="58" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="30" y1="2" x2="30" y2="58" stroke="#5a452c" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "horizontal-groove",
    title: "Alur Horizontal",
    desc: "Garis sekat modern minimalis",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <line x1="2" y1="12" x2="38" y2="12" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="2" y1="24" x2="38" y2="24" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="2" y1="36" x2="38" y2="36" stroke="#5a452c" strokeWidth="1.2" />
        <line x1="2" y1="48" x2="38" y2="48" stroke="#5a452c" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "classic-panel",
    title: "Panel Shaker Klasik",
    desc: "Bingkai timbul proporsional",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <rect x="6" y="6" width="28" height="20" fill="#a89173" stroke="#5a452c" strokeWidth="1" />
        <rect x="6" y="30" width="28" height="24" fill="#a89173" stroke="#5a452c" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "glass-strip",
    title: "Kaca Strip Tengah",
    desc: "Aksen vertikal kaca transparan",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <rect x="14" y="2" width="12" height="56" fill="#9dc2cc" stroke="#375560" strokeWidth="1" opacity="0.8" />
        <line x1="16" y1="8" x2="24" y2="24" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "glass-full",
    title: "Kaca Bening Framed",
    desc: "Frame kayu/aluminium keliling",
    renderPreview: () => (
      <svg viewBox="0 0 40 60" className="w-full h-full rounded bg-[#cbb89d]">
        <rect x="2" y="2" width="36" height="56" fill="#baa384" stroke="#8f785b" strokeWidth="1" />
        <rect x="6" y="6" width="28" height="48" fill="#a8c8d2" stroke="#375560" strokeWidth="1" opacity="0.8" />
        <line x1="10" y1="12" x2="28" y2="44" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
      </svg>
    ),
  },
];

export function MotifGridPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {MOTIF_OPTIONS.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-center p-2.5 rounded-xl border text-left transition-all relative ${
              isSelected
                ? "border-moss bg-moss/5 ring-2 ring-moss/30 shadow-sm"
                : "border-line bg-paper-2 hover:bg-paper-3/60"
            }`}
          >
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-moss text-white flex items-center justify-center text-[10px]">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-12 h-16 my-1 flex items-center justify-center drop-shadow-sm">
              {opt.renderPreview()}
            </div>
            <span className="text-xs font-semibold text-ink text-center mt-1">
              {opt.title}
            </span>
            <span className="text-[10px] text-ink-mute text-center leading-tight">
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
