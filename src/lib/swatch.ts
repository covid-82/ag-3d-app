import type { CSSProperties } from "react";

/** Gaya CSS untuk kotak contoh material: kayu diberi garis serat tipis, warna polos tetap datar. */
export function swatchStyle(m: { hex: string; type: string }): CSSProperties {
  if (m.type === "wood") {
    return {
      backgroundColor: m.hex,
      backgroundImage:
        "repeating-linear-gradient(8deg, rgba(60,32,10,0.16) 0 1px, transparent 1px 5px), repeating-linear-gradient(-4deg, rgba(255,240,215,0.22) 0 2px, transparent 2px 9px)",
    };
  }
  return { backgroundColor: m.hex };
}
