import type { KindSpec } from "./kinds";
import {
  BASE_LABEL,
  CONTENT_LABEL,
  DOOR_LABEL,
  DOOR_PATTERN_LABEL,
  DOOR_STYLE_LABEL,
  HANDLE_LABEL,
  HARDWARE_LABEL,
  LEG_LABEL,
  PEDESTAL_LABEL,
} from "./labels";
import { columnWidth } from "./rules";
import type { BuildResult, DesignConfig, MaterialOption } from "./types";

export interface SpecLine {
  label: string;
  value: string;
}

export const formatDims = (c: Pick<DesignConfig, "width" | "height" | "depth">) =>
  `${c.width} × ${c.height} × ${c.depth} cm`;

export function describeColumn(col: DesignConfig["columns"][number]): string {
  const parts: string[] = [];
  if (col.content === "hanging") parts.push(col.shelves > 0 ? "Gantung + ambalan topi" : "Gantung baju");
  else if (col.content === "shelves") parts.push(col.shelves > 0 ? `${col.shelves} ambalan` : "Ruang kosong");
  else parts.push(CONTENT_LABEL.open);
  if (col.drawers > 0) parts.push(`${col.drawers} laci`);
  return parts.join(" · ");
}

/** Ringkasan spesifikasi: dipakai di panel, formulir penawaran, pesan WhatsApp, dan panel admin. */
export function buildSpecLines(
  spec: KindSpec,
  c: DesignConfig,
  materials: MaterialOption[],
  result: BuildResult,
): SpecLine[] {
  const mat = (slug: string) => materials.find((m) => m.slug === slug)?.name ?? slug;
  const totalH = result.totalHeight || c.height;
  const lines: SpecLine[] = [{ label: "Ukuran Total (L × T × K)", value: `${c.width} × ${totalH} × ${c.depth} cm` }];

  if (spec.engine === "cabinet") {
    const n = c.columns.length;
    lines.push({ label: "Jumlah Kolom", value: `${n} kolom (±${Math.round(columnWidth(c.width, n))} cm/kolom)` });
    c.columns.forEach((col, i) => lines.push({ label: `Kolom ${i + 1}`, value: describeColumn(col) }));
    lines.push({
      label: "Tipe & Motif Pintu",
      value:
        c.doors === "none"
          ? DOOR_LABEL.none
          : `${DOOR_LABEL[c.doors]} (${DOOR_PATTERN_LABEL[c.doorPattern || "flush"]})`,
    });
    if (c.hasTopModule) {
      lines.push({ label: "Modul Kabinet Atas", value: `Aktif, tinggi ${c.topModuleHeight} cm bertumpuk` });
    }
    lines.push({ label: "Model Handle", value: HANDLE_LABEL[c.handle] });
    lines.push({ label: "Konstruksi Alas", value: BASE_LABEL[c.base] });
    lines.push({ label: "Panel Belakang", value: c.back ? "Tertutup rapat" : "Terbuka" });
  } else if (spec.engine === "desk") {
    lines.push({ label: "Kaki Meja", value: LEG_LABEL[c.legStyle] });
    lines.push({
      label: "Laci Samping (Pedestal)",
      value: c.pedestal === "none" ? PEDESTAL_LABEL.none : `${PEDESTAL_LABEL[c.pedestal]}, ${c.pedestalDrawers} laci`,
    });
    lines.push({ label: "Modesty Panel", value: c.modesty ? "Ya (Tertutup)" : "Terbuka" });
    if (c.pedestal !== "none") lines.push({ label: "Model Handle", value: HANDLE_LABEL[c.handle] });
  } else {
    // Door Kind
    lines.push({ label: "Material Kusen", value: c.frameMaterial === "aluminum" ? "Aluminium Anodized" : "Kayu Solid" });
    lines.push({ label: "Motif Daun Pintu", value: DOOR_PATTERN_LABEL[c.doorPattern || "classic-panel"] });
    lines.push({ label: "Tebal Dinding", value: `${c.wallThickness || 14} cm` });
    if (c.hasSideWindow && c.hasSideWindow !== "none") {
      lines.push({ label: "Kombinasi Jendela", value: `Jendela samping kaca mati (${c.hasSideWindow})` });
    }
    lines.push({ label: "Handle Pintu", value: HANDLE_LABEL[c.handle] });
  }

  lines.push({ label: spec.bodyLabel, value: mat(c.bodyMaterial) });
  lines.push({ label: spec.frontLabel, value: mat(c.frontMaterial) });
  lines.push({ label: "Hardware & Finishing", value: HARDWARE_LABEL[c.hardware] });

  const s = result.stats;
  const comp: string[] = [];
  if (s.drawers) comp.push(`${s.drawers} laci`);
  if (s.hingedDoors) comp.push(`${s.hingedDoors} daun pintu`);
  if (s.slidingPanels) comp.push(`${s.slidingPanels} panel geser`);
  if (s.shelves) comp.push(`${s.shelves} ambalan`);
  if (comp.length) lines.push({ label: "Total Komponen", value: comp.join(", ") });

  lines.push({ label: "Estimasi Volume & Berat", value: `${s.woodVolumeM3} m³ (~${s.estimatedWeightKg} kg)` });

  return lines;
}
