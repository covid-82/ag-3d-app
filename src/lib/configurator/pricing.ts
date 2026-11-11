import type { BuildResult, MaterialOption, Pricing } from "./types";

export interface Estimate {
  min: number;
  max: number;
}

const WASTE = 1.15; // allowance sisa potongan papan
const GLASS_PER_M2 = 450_000;
const RATTAN_PER_M2 = 650_000; // anyaman rotan mata ayam asli
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

/**
 * Estimasi harga dihitung otomatis dari luas papan riil, volume m3, dan komponen yang dikonfigurasi.
 */
export function estimatePrice(
  result: BuildResult,
  pricing: Pricing,
  body: MaterialOption | undefined,
  front: MaterialOption | undefined,
): Estimate {
  const bodyRate = body?.pricePerM2 ?? 550_000;
  const frontRate = front?.pricePerM2 ?? bodyRate;
  const { area, drawers, hingedDoors, slidingPanels, handles } = result.stats;

  const materials =
    (area.body * bodyRate +
      area.shade * bodyRate * 0.8 +
      area.front * frontRate +
      (area.rattan || 0) * RATTAN_PER_M2 +
      area.glass * GLASS_PER_M2) *
    WASTE;

  const hardware =
    drawers * pricing.perDrawer +
    hingedDoors * pricing.perHingedDoor +
    slidingPanels * pricing.perSlidingPanel +
    handles * pricing.perHandle;

  const total = materials * pricing.margin + hardware + pricing.base;
  return { min: roundTo(total * 0.94, 25_000), max: roundTo(total * 1.06, 25_000) };
}
