import { PANEL, defaultColumns, type CabinetRules, type KindSpec } from "./kinds";
import type { BaseStyle, ColumnConfig, DesignConfig, Limits } from "./types";

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const DRAWER_GAP = 0.3;

export function baseHeightOf(base: BaseStyle): number {
  return base === "plinth" ? 8 : base === "legs" ? 14 : 0;
}

/** Lebar bersih satu kolom bila lebar total dibagi n kolom. */
export function columnWidth(width: number, n: number): number {
  return (width - PANEL.t * (n + 1)) / n;
}

/** Rentang jumlah kolom yang masih menghasilkan lebar kolom wajar. */
export function columnRange(rules: CabinetRules, width: number): { min: number; max: number } {
  let min = 1;
  while (min < rules.maxColumns && columnWidth(width, min) > rules.maxColW) min++;
  let max = min;
  while (max < rules.maxColumns && columnWidth(width, max + 1) >= rules.minColW) max++;
  return { min, max };
}

export function interiorHeight(cfg: Pick<DesignConfig, "height" | "base">): number {
  return cfg.height - baseHeightOf(cfg.base) - 2 * PANEL.t;
}

export function drawersMax(rules: CabinetRules, cfg: Pick<DesignConfig, "height" | "base">): number {
  const ih = interiorHeight(cfg);
  return clamp(Math.floor((ih - rules.minUpper) / (rules.drawerHeight + DRAWER_GAP)), 0, 6);
}

/** Tinggi ruang di atas tumpukan laci (dalam cm). */
export function upperHeight(
  rules: CabinetRules,
  cfg: Pick<DesignConfig, "height" | "base">,
  drawers: number,
): number {
  return interiorHeight(cfg) - drawers * (rules.drawerHeight + DRAWER_GAP);
}

export function shelvesMax(upper: number): number {
  return clamp(Math.floor((upper - 20) / (20 + PANEL.t)), 0, 8);
}

export const hangingOk = (upper: number) => upper >= 90;
export const topShelfOk = (upper: number) => upper >= 140;

export function pedestalDrawersMax(cfg: Pick<DesignConfig, "height">): number {
  const room = cfg.height - 3 - 3;
  return clamp(Math.floor(room / 12.3), 1, 4);
}

export interface SanitizeResult {
  config: DesignConfig;
  notices: string[];
}

/**
 * Menjaga konfigurasi tetap valid: ukuran di dalam batas, jumlah kolom masuk akal,
 * kombinasi komponen yang tidak boleh akan disesuaikan otomatis.
 */
export function sanitize(spec: KindSpec, limits: Limits, input: DesignConfig): SanitizeResult {
  const notices: string[] = [];
  const cfg: DesignConfig = { ...input, columns: input.columns.map((c) => ({ ...c })) };

  const axes = [
    ["width", "Lebar"],
    ["height", "Tinggi"],
    ["depth", "Kedalaman"],
  ] as const;
  for (const [axis, label] of axes) {
    const lim = limits[axis];
    const raw = Number.isFinite(input[axis]) ? input[axis] : lim.def;
    const v = clamp(Math.round(raw), lim.min, lim.max);
    if (Math.abs(v - raw) > 1) notices.push(`${label} dibatasi ${lim.min}–${lim.max} cm untuk model ini.`);
    cfg[axis] = v;
  }

  if (spec.cabinet) {
    const rules = spec.cabinet;
    if (!rules.bases.includes(cfg.base)) cfg.base = rules.bases[0];
    if (!rules.doors.includes(cfg.doors)) cfg.doors = rules.doors[0];
    if (!rules.doorStyles.includes(cfg.doorStyle)) cfg.doorStyle = rules.doorStyles[0];
    if (rules.backForced) cfg.back = true;

    const range = columnRange(rules, cfg.width);
    const wanted = cfg.columns.length || range.min;
    const n = clamp(wanted, range.min, range.max);
    if (cfg.columns.length && n !== cfg.columns.length) {
      notices.push(
        `Jumlah kolom disesuaikan menjadi ${n} agar lebar tiap kolom tetap ${rules.minColW}–${rules.maxColW} cm.`,
      );
    }
    const fill = defaultColumns(spec.kind, Math.max(n, 1));
    const cols: ColumnConfig[] = [];
    for (let i = 0; i < n; i++) cols.push(cfg.columns[i] ?? fill[i] ?? { content: "shelves", shelves: 2, drawers: 0 });

    const dMax = drawersMax(rules, cfg);
    cols.forEach((col, i) => {
      if (!rules.contents.includes(col.content)) col.content = rules.contents[0];
      const wantDrawers = clamp(Math.round(col.drawers || 0), 0, 6);
      col.drawers = Math.min(wantDrawers, dMax);
      if (col.drawers < wantDrawers) notices.push(`Kolom ${i + 1}: laci dikurangi, tinggi lemari tidak cukup.`);
      const upper = upperHeight(rules, cfg, col.drawers);
      if (col.content === "hanging" && !hangingOk(upper)) {
        col.content = rules.contents.includes("shelves") ? "shelves" : "open";
        notices.push(`Kolom ${i + 1}: ruang gantung butuh tinggi minimal 90 cm di atas laci.`);
      }
      if (col.content === "hanging") {
        col.shelves = topShelfOk(upper) ? clamp(Math.round(col.shelves || 0), 0, 1) : 0;
      } else if (col.content === "shelves") {
        col.shelves = clamp(Math.round(col.shelves || 0), 0, shelvesMax(upper));
      } else {
        col.shelves = 0;
      }
    });
    cfg.columns = cols;

    if (cfg.doors === "sliding" && cols.some((c) => c.drawers > 0)) {
      cfg.doors = rules.doors.includes("hinged") ? "hinged" : "none";
      notices.push("Pintu geser tidak bisa digabung dengan laci. Diganti ke pintu engsel.");
    }
  }

  if (spec.desk) {
    const rules = spec.desk;
    const minW = cfg.pedestal === "both" ? rules.minWidthBoth : rules.minWidthOne;
    if (cfg.pedestal !== "none" && cfg.width < minW) {
      cfg.pedestal = cfg.pedestal === "both" && cfg.width >= rules.minWidthOne ? "right" : "none";
      notices.push("Lebar meja terlalu sempit untuk laci samping, konfigurasi laci disesuaikan.");
    }
    cfg.pedestalDrawers = clamp(Math.round(cfg.pedestalDrawers || 1), 1, pedestalDrawersMax(cfg));
  }

  if (spec.door) {
    if (!cfg.doorPattern) cfg.doorPattern = "classic-panel";
    if (!cfg.wallThickness) cfg.wallThickness = 14;
    if (!cfg.frameMaterial) cfg.frameMaterial = "wood";
  }

  return { config: cfg, notices };
}
