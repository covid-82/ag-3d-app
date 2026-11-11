import { PANEL, type KindSpec } from "../kinds";
import { DRAWER_GAP, baseHeightOf, columnWidth } from "../rules";
import type { BayDimensionHUD, BuildResult, ColumnBounds, DesignConfig, Motion } from "../types";
import { addDrawer, addHandle, box, finalize, newBuilder, rod, type Builder } from "./shared";

const { t, back: bt, front: ft, gap: g } = PANEL;

/** Lemari, rak, dan kabinet: badan + kolom berisi rak/gantung/laci + pintu + modul atas bertumpuk. */
export function buildCabinet(spec: KindSpec, c: DesignConfig): BuildResult {
  const rules = spec.cabinet!;
  const b = newBuilder();
  const W = c.width;
  const H = c.height;
  const D = c.depth;
  const baseH = c.base === "floating" ? 25 : baseHeightOf(c.base);
  const sliding = c.doors === "sliding";
  const frontDepth = sliding ? ft * 2 + 1.2 : ft;
  const zF = D / 2 - frontDepth; // bidang depan carcass
  const zB = -D / 2;
  const zIn = c.back ? zB + bt : zB;
  const n = c.columns.length;

  // 1. Carcass Badan Utama
  b.parts.push(
    box("top", "body", [-W / 2, W / 2, H - t, H, zB, zF]),
    box("bottom", "body", [-W / 2, W / 2, baseH, baseH + t, zB, zF]),
    box("side-l", "body", [-W / 2, -W / 2 + t, baseH + t, H - t, zB, zF]),
    box("side-r", "body", [W / 2 - t, W / 2, baseH + t, H - t, zB, zF]),
  );
  if (c.back) {
    b.parts.push(box("back", "shade", [-W / 2 + t, W / 2 - t, baseH + t, H - t, zB, zB + bt]));
  }

  // 2. Alas / Base Penyangga
  if (c.base === "plinth") {
    b.parts.push(box("plinth", "shade", [-W / 2 + 2, W / 2 - 2, 0, baseH, zF - 5.8, zF - 4]));
  } else if (c.base === "legs") {
    const xs = [-(W / 2 - 6), W / 2 - 6];
    if (W > 175) xs.splice(1, 0, 0); // Kaki penyangga tengah otomatis
    xs.forEach((x, i) => {
      [zF - 6, zB + 6].forEach((z, j) => {
        b.parts.push(box(`leg-${i}-${j}`, "hardware", [x - 2, x + 2, 0, baseH, z - 2, z + 2]));
      });
    });
  } else if (c.base === "floating") {
    // Bracket French Cleat di belakang dinding
    b.parts.push(box("french-cleat", "hardware", [-W / 2 + 10, W / 2 - 10, H - 12, H - 4, zB - 1.5, zB]));
  }

  // 3. Kolom & Kompartemen Internal
  const columns: ColumnBounds[] = [];
  const cw = columnWidth(W, n);
  const dh = rules.drawerHeight;

  c.columns.forEach((col, i) => {
    const x0 = -W / 2 + t + i * (cw + t);
    const x1 = x0 + cw;
    const fx0 = i === 0 ? -W / 2 : x0 - t / 2;
    const fx1 = i === n - 1 ? W / 2 : x1 + t / 2;
    columns.push({ x0: fx0, x1: fx1 });

    if (i < n - 1) {
      b.parts.push(box(`div-${i}`, "body", [x1, x1 + t, baseH + t, H - t, zIn, zF], { col: i }));
    }

    const nd = col.drawers;
    const yD = baseH + nd * (dh + DRAWER_GAP);

    // Render laci
    for (let k = 0; k < nd; k++) {
      const yb = baseH + DRAWER_GAP + k * (dh + DRAWER_GAP);
      addDrawer(b, {
        id: `c${i}-d${k}`,
        col: i,
        fx0,
        fx1,
        yb,
        yt: yb + dh,
        zFront: zF + ft,
        ix0: x0,
        ix1: x1,
        zBack: zIn,
        floorY: baseH + t,
        handle: c.handle,
        ft,
        pattern: col.pattern || c.doorPattern,
      });
    }

    const floorU = nd > 0 ? yD + t : baseH + t;
    if (nd > 0) {
      b.parts.push(box(`c${i}-dsh`, "body", [x0, x1, yD, yD + t, zIn, zF - 0.5], { col: i }));
    }
    const topU = H - t;
    const hu = topU - floorU;

    const shelfHeightsCm: number[] = [];

    // Ambalan / Rak
    if (col.content === "shelves" && col.shelves > 0) {
      const m = col.shelves;
      const gap = (hu - m * t) / (m + 1);
      const gapRounded = Number(gap.toFixed(1));
      for (let k = 1; k <= m; k++) {
        const y0 = floorU + k * gap + (k - 1) * t;
        b.parts.push(box(`c${i}-s${k}`, "body", [x0, x1, y0, y0 + t, zIn, zF - 0.5], { col: i }));
        b.tally.shelves++;
        shelfHeightsCm.push(gapRounded);
      }
      shelfHeightsCm.push(gapRounded);
    } else if (col.content === "hanging") {
      let railY = topU - 5;
      if (col.shelves > 0) {
        const ys = topU - 38;
        b.parts.push(box(`c${i}-top`, "body", [x0, x1, ys, ys + t, zIn, zF - 0.5], { col: i }));
        b.tally.shelves++;
        railY = ys - 5;
        shelfHeightsCm.push(Number((topU - ys).toFixed(1)));
        shelfHeightsCm.push(Number((ys - floorU).toFixed(1)));
      } else {
        shelfHeightsCm.push(Number(hu.toFixed(1)));
      }
      b.parts.push(rod(`c${i}-rod`, x0 + 0.3, x1 - 0.3, railY, (zIn + zF) / 2, 2.6, { col: i }));
    } else {
      shelfHeightsCm.push(Number(hu.toFixed(1)));
    }

    // Rekam Dimensi HUD Kompartemen
    b.bayHuds.push({
      colIndex: i,
      x: (x0 + x1) / 2,
      bottomY: floorU,
      topY: topU,
      widthCm: Number(cw.toFixed(1)),
      shelfHeightsCm,
    });

    // Pintu Berengsel
    if (c.doors === "hinged") {
      const yb = (nd > 0 ? yD : baseH) + g;
      const yt = H - g;
      if (yt - yb >= 12) {
        addHingedDoors(b, c, i, n, fx0, fx1, yb, yt, zF, col.pattern || c.doorPattern);
      }
    }
  });

  // Pintu Geser
  if (sliding) addSlidingDoors(b, c, W, H, D, baseH);

  // 4. Modul Tambahan di Atas (+ Tambah di Atas / Top Overhead Module)
  let totalH = H;
  if (c.hasTopModule && c.topModuleHeight >= 20) {
    const topH = c.topModuleHeight;
    totalH = H + topH;
    const topFloorY = H;
    const topCeilY = totalH;

    // Carcass atas
    b.parts.push(
      box("topmod-roof", "body", [-W / 2, W / 2, topCeilY - t, topCeilY, zB, zF]),
      box("topmod-sidel", "body", [-W / 2, -W / 2 + t, topFloorY, topCeilY - t, zB, zF]),
      box("topmod-sider", "body", [W / 2 - t, W / 2, topFloorY, topCeilY - t, zB, zF]),
    );
    if (c.back) {
      b.parts.push(box("topmod-back", "shade", [-W / 2 + t, W / 2 - t, topFloorY, topCeilY - t, zB, zB + bt]));
    }

    // Dividers atas & Pintu atas
    c.columns.forEach((_, i) => {
      const x0 = -W / 2 + t + i * (cw + t);
      const x1 = x0 + cw;
      const fx0 = i === 0 ? -W / 2 : x0 - t / 2;
      const fx1 = i === n - 1 ? W / 2 : x1 + t / 2;

      if (i < n - 1) {
        b.parts.push(box(`topmod-div-${i}`, "body", [x1, x1 + t, topFloorY, topCeilY - t, zIn, zF], { col: i }));
      }

      if (c.topModuleDoors === "hinged") {
        addHingedDoors(
          b,
          c,
          i + 100,
          n,
          fx0,
          fx1,
          topFloorY + g,
          topCeilY - g,
          zF,
          c.doorPattern,
        );
      }
    });
  }

  return finalize(b, columns, baseH, totalH);
}

function addHingedDoors(
  b: Builder,
  c: DesignConfig,
  i: number,
  n: number,
  fx0: number,
  fx1: number,
  yb: number,
  yt: number,
  zF: number,
  pattern: string,
) {
  const span = fx1 - fx0;
  const count = span > 62 ? 2 : 1;
  const openDeg = c.doorOpenAngle || 0;
  const openRad = (openDeg * Math.PI) / 180;

  for (let j = 0; j < count; j++) {
    const a = fx0 + (span / count) * j + g / 2;
    const e = fx0 + (span / count) * (j + 1) - g / 2;
    const hinge: "left" | "right" =
      count === 2 ? (j === 0 ? "left" : "right") : i < (n - 1) / 2 + 0.01 ? "left" : "right";
    const hx = hinge === "left" ? a : e;
    const motion: Motion = {
      type: "hinge",
      pivot: [hx, 0, zF + ft / 2],
      angle: hinge === "left" ? -(1.55 * (openRad / 1.57 || 1)) : (1.55 * (openRad / 1.57 || 1)),
    };
    const id = `c${i}-door${j}`;
    const extra = { col: i % 100, motion, pattern: c.doorPattern };

    if (c.doorStyle === "glass" || pattern === "glass-full") {
      const fw = 4;
      const zm = zF + ft / 2;
      b.parts.push(
        box(`${id}-fl`, "front", [a, a + fw, yb, yt, zF, zF + ft], extra),
        box(`${id}-fr`, "front", [e - fw, e, yb, yt, zF, zF + ft], extra),
        box(`${id}-ft`, "front", [a + fw, e - fw, yt - fw, yt, zF, zF + ft], extra),
        box(`${id}-fb`, "front", [a + fw, e - fw, yb, yb + fw, zF, zF + ft], extra),
        box(`${id}-gl`, "glass", [a + fw - 0.3, e - fw + 0.3, yb + fw - 0.3, yt - fw + 0.3, zm - 0.2, zm + 0.2], extra),
      );
    } else if (pattern === "rattan") {
      // Pintu Kayu Frame dengan Sisipan Anyaman Rotan Mata Ayam
      const fw = 4.8;
      const zm = zF + ft / 2;
      b.parts.push(
        box(`${id}-fl`, "front", [a, a + fw, yb, yt, zF, zF + ft], extra),
        box(`${id}-fr`, "front", [e - fw, e, yb, yt, zF, zF + ft], extra),
        box(`${id}-ft`, "front", [a + fw, e - fw, yt - fw, yt, zF, zF + ft], extra),
        box(`${id}-fb`, "front", [a + fw, e - fw, yb, yb + fw, zF, zF + ft], extra),
        box(`${id}-rattan`, "rattan", [a + fw - 0.2, e - fw + 0.2, yb + fw - 0.2, yt - fw + 0.2, zm - 0.2, zm + 0.2], extra),
      );
    } else if (pattern === "glass-strip") {
      // Pintu dengan Kaca Strip Vertikal di Tengah
      const wDaun = e - a;
      const stripW = Math.min(14, wDaun * 0.3);
      const sideW = (wDaun - stripW) / 2;
      const zm = zF + ft / 2;
      b.parts.push(
        box(`${id}-sl`, "front", [a, a + sideW, yb, yt, zF, zF + ft], extra),
        box(`${id}-sr`, "front", [e - sideW, e, yb, yt, zF, zF + ft], extra),
        box(`${id}-gl`, "glass", [a + sideW, e - sideW, yb, yt, zm - 0.25, zm + 0.25], extra),
      );
    } else if (pattern === "classic-panel") {
      // Panel Timbul / Shaker Klasik
      const border = 5.2;
      b.parts.push(
        box(`${id}-base`, "front", [a, e, yb, yt, zF, zF + ft * 0.8], extra),
        box(`${id}-raised`, "front", [a + border, e - border, yb + border, yt - border, zF + ft * 0.8, zF + ft], extra),
      );
    } else {
      // Polos / Alur
      b.parts.push(box(id, "front", [a, e, yb, yt, zF, zF + ft], extra));
    }

    b.tally.hingedDoors++;
    addHandle(b, {
      id: `${id}-h`,
      style: c.handle,
      kind: "door",
      x0: a,
      x1: e,
      yb,
      yt,
      zFront: zF + ft,
      edge: hinge === "left" ? "right" : "left",
      col: i % 100,
      motion,
    });
  }
}

function addSlidingDoors(b: Builder, c: DesignConfig, W: number, H: number, D: number, baseH: number) {
  const panels = W > 240 ? 3 : 2;
  const overlap = 2;
  const pw = (W + (panels - 1) * overlap) / panels;
  const yb = baseH + g;
  const yt = H - g;
  for (let j = 0; j < panels; j++) {
    const front = j % 2 === 1;
    const zb = front ? D / 2 - ft : D / 2 - 2 * ft - 0.6;
    const x0 = -W / 2 + j * (pw - overlap);
    const x1 = x0 + pw;
    const motion: Motion | undefined = front
      ? { type: "slide", offset: [-(pw - overlap), 0, 0] }
      : undefined;
    const id = `slide${j}`;
    const extra = { motion, pattern: c.doorPattern };
    b.parts.push(box(id, "front", [x0, x1, yb, yt, zb, zb + ft], extra));
    b.tally.slidingPanels++;
    addHandle(b, {
      id: `${id}-h`,
      style: c.handle === "push" ? "push" : "bar",
      kind: "door",
      x0,
      x1,
      yb,
      yt,
      zFront: zb + ft - (front ? 0 : 1.4),
      edge: j === 0 ? "right" : "left",
      motion,
    });
  }
}
