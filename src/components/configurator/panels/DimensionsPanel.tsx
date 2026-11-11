"use client";

import React, { useState } from "react";
import { SliderField } from "@/components/ui/controls";
import type { DesignConfig, Limits } from "@/lib/configurator/types";
import { Lock, Unlock, Layers, Plus, Trash2, DoorOpen } from "lucide-react";

interface Props {
  config: DesignConfig;
  limits: Limits;
  apply: (patch: Partial<DesignConfig>, key?: string) => void;
}

export function DimensionsPanel({ config, limits, apply }: Props) {
  const [lockedRatio, setLockedRatio] = useState(false);

  // Ubah dimensi dengan proteksi rasio gembok
  const handleDimensionChange = (key: "width" | "height" | "depth", val: number) => {
    if (!lockedRatio) {
      apply({ [key]: val }, `dim-${key}`);
      return;
    }

    const oldVal = config[key];
    if (oldVal <= 0) return;
    const ratio = val / oldVal;

    const patch: Partial<DesignConfig> = { [key]: val };
    if (key !== "width") {
      patch.width = Math.min(
        limits.width.max,
        Math.max(limits.width.min, Math.round(config.width * ratio))
      );
    }
    if (key !== "height") {
      patch.height = Math.min(
        limits.height.max,
        Math.max(limits.height.min, Math.round(config.height * ratio))
      );
    }
    if (key !== "depth") {
      patch.depth = Math.min(
        limits.depth.max,
        Math.max(limits.depth.min, Math.round(config.depth * ratio))
      );
    }

    apply(patch, `dim-lock-${key}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Tombol Gembok Rasio */}
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <p className="text-xs text-ink-soft">
          Atur dimensi presisi dalam sentimeter (cm).
        </p>
        <button
          type="button"
          onClick={() => setLockedRatio(!lockedRatio)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
            lockedRatio
              ? "bg-clay/10 border-clay text-clay-dark"
              : "bg-paper-2 border-line text-ink-mute hover:text-ink"
          }`}
          title="Kunci Proporsi Aspek Rasio (Width / Height)"
        >
          {lockedRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{lockedRatio ? "Terkunci" : "Bebas"}</span>
        </button>
      </div>

      {/* Sliders Dimensi Utama */}
      <div className="divide-y divide-line">
        <SliderField
          label="Lebar Total"
          value={config.width}
          min={limits.width.min}
          max={limits.width.max}
          step={limits.width.step}
          onChange={(v) => handleDimensionChange("width", v)}
        />
        <SliderField
          label="Tinggi Badan"
          value={config.height}
          min={limits.height.min}
          max={limits.height.max}
          step={limits.height.step}
          onChange={(v) => handleDimensionChange("height", v)}
        />
        <SliderField
          label="Kedalaman (Depth)"
          value={config.depth}
          min={limits.depth.min}
          max={limits.depth.max}
          step={limits.depth.step}
          onChange={(v) => handleDimensionChange("depth", v)}
        />
      </div>

      {/* Slider Bukaan Pintu (Door Open Angle) */}
      <div className="pt-2 border-t border-line">
        <SliderField
          label="Sudut Bukaan Pintu"
          value={config.doorOpenAngle || 0}
          min={0}
          max={90}
          step={5}
          onChange={(v) => apply({ doorOpenAngle: v }, "door-angle")}
        />
        <p className="text-[11px] text-ink-mute mt-1">
          Geser untuk menguji aksesibilitas ruang bukaan dan visibilitas ambalan dalam.
        </p>
      </div>

      {/* Modul Susunan Bertingkat (+ Tambah di Atas - Supernata Style) */}
      <div className="pt-4 border-t border-line">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-moss" />
            <span className="text-sm font-semibold text-ink">Susunan Lemari Bertingkat</span>
          </div>
          {!config.hasTopModule ? (
            <button
              type="button"
              onClick={() =>
                apply(
                  { hasTopModule: true, topModuleHeight: 50, topModuleDoors: "hinged" },
                  "add-top-module"
                )
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-moss text-white text-xs font-medium hover:bg-moss/90 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah di Atas</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => apply({ hasTopModule: false }, "remove-top-module")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Modul Atas</span>
            </button>
          )}
        </div>

        {config.hasTopModule && (
          <div className="p-3.5 bg-paper-2 rounded-xl border border-line space-y-3">
            <SliderField
              label="Tinggi Kabinet Atas"
              value={config.topModuleHeight || 50}
              min={30}
              max={80}
              step={2}
              onChange={(v) => apply({ topModuleHeight: v }, "top-module-h")}
            />
            <div className="flex items-center justify-between text-xs text-ink-soft pt-1">
              <span>Total Tinggi Keseluruhan:</span>
              <span className="font-mono font-bold text-moss">
                {config.height + (config.topModuleHeight || 0)} cm
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
