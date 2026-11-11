import { PANEL, type KindSpec } from "../kinds";
import type { BuildResult, DesignConfig } from "../types";
import { addDrawer, box, finalize, newBuilder, type Builder } from "./shared";

const { t, front: ft } = PANEL;
const TOP_T = 3;

/** Meja kerja: permukaan, kaki (panel/rangka besi), laci samping, panel penutup. */
export function buildDesk(spec: KindSpec, c: DesignConfig): BuildResult {
  const rules = spec.desk!;
  const b = newBuilder();
  const W = c.width;
  const H = c.height;
  const D = c.depth;
  const legH = H - TOP_T;
  const inset = 2.5;

  b.parts.push(box("top", "front", [-W / 2, W / 2, legH, H, -D / 2, D / 2]));

  let innerL = -W / 2 + inset;
  let innerR = W / 2 - inset;

  (["left", "right"] as const).forEach((side) => {
    const sgn = side === "left" ? -1 : 1;
    const outer = sgn * (W / 2 - inset);
    const hasPedestal = c.pedestal === "both" || c.pedestal === side;

    if (hasPedestal) {
      const xa = sgn < 0 ? outer : outer - rules.pedestalWidth;
      const xb = sgn < 0 ? outer + rules.pedestalWidth : outer;
      addPedestal(b, c, side, xa, xb, legH, D);
      if (sgn < 0) innerL = xb;
      else innerR = xa;
    } else if (c.legStyle === "panel") {
      const xa = sgn < 0 ? outer : outer - t;
      const xb = sgn < 0 ? outer + t : outer;
      b.parts.push(box(`panel-${side}`, "body", [xa, xb, 0, legH, -D / 2 + 4, D / 2 - 4]));
      if (sgn < 0) innerL = xb;
      else innerR = xa;
    } else {
      const xc = outer - sgn * 2.5;
      [D / 2 - 5, -D / 2 + 5].forEach((z, j) => {
        b.parts.push(box(`leg-${side}-${j}`, "hardware", [xc - 2, xc + 2, 0, legH, z - 2, z + 2]));
      });
      b.parts.push(box(`rail-${side}`, "hardware", [xc - 0.8, xc + 0.8, legH - 7, legH - 4, -D / 2 + 5, D / 2 - 5]));
      if (sgn < 0) innerL = xc + 2;
      else innerR = xc - 2;
    }
  });

  const zm = -D / 2 + 5;
  if (c.modesty) {
    b.parts.push(box("modesty", "body", [innerL, innerR, legH - 38, legH, zm, zm + 1.6]));
  } else if (c.legStyle === "frame") {
    b.parts.push(box("back-rail", "hardware", [innerL, innerR, legH - 7, legH - 4, zm, zm + 1.5]));
  }

  return finalize(b, [], 0);
}

function addPedestal(
  b: Builder,
  c: DesignConfig,
  side: "left" | "right",
  xa: number,
  xb: number,
  legH: number,
  D: number,
) {
  const zFront = D / 2 - 3;
  const zBack = -D / 2 + 4;
  const y0 = 3;
  const y1 = legH;
  const zCarcassFront = zFront - ft;

  b.parts.push(
    box(`ped-${side}-sl`, "body", [xa, xa + t, y0, y1, zBack, zCarcassFront]),
    box(`ped-${side}-sr`, "body", [xb - t, xb, y0, y1, zBack, zCarcassFront]),
    box(`ped-${side}-bk`, "shade", [xa + t, xb - t, y0, y1, zBack, zBack + 0.8]),
    box(`ped-${side}-bt`, "body", [xa + t, xb - t, y0, y0 + t, zBack, zCarcassFront]),
    box(`ped-${side}-kick`, "shade", [xa + 1, xb - 1, 0, y0, zCarcassFront - 4, zCarcassFront - 2.4]),
  );

  const n = c.pedestalDrawers;
  const gap = 0.3;
  const faceH = (y1 - y0 - gap * (n + 1)) / n;
  for (let k = 0; k < n; k++) {
    const yb = y0 + gap + k * (faceH + gap);
    addDrawer(b, {
      id: `ped-${side}-d${k}`,
      fx0: xa,
      fx1: xb,
      yb,
      yt: yb + faceH,
      zFront,
      ix0: xa + t,
      ix1: xb - t,
      zBack: zBack + 0.8,
      floorY: y0 + t,
      handle: c.handle,
      ft,
    });
  }
}
