import type {
  BayDimensionHUD,
  BuildResult,
  ColumnBounds,
  DoorPattern,
  HandleStyle,
  Motion,
  Part,
  PartRole,
} from "../types";

export interface Tally {
  drawers: number;
  hingedDoors: number;
  slidingPanels: number;
  handles: number;
  shelves: number;
}

export interface Builder {
  parts: Part[];
  tally: Tally;
  bayHuds: BayDimensionHUD[];
}

export const newBuilder = (): Builder => ({
  parts: [],
  tally: { drawers: 0, hingedDoors: 0, slidingPanels: 0, handles: 0, shelves: 0 },
  bayHuds: [],
});

type Extra = { col?: number; motion?: Motion; pattern?: DoorPattern };

/** Papan/balok dari batas [x0, x1, y0, y1, z0, z1] dalam cm. */
export function box(
  id: string,
  role: PartRole,
  [x0, x1, y0, y1, z0, z1]: [number, number, number, number, number, number],
  extra: Extra = {},
): Part {
  return {
    id,
    role,
    shape: "box",
    size: [Math.max(0.1, x1 - x0), Math.max(0.1, y1 - y0), Math.max(0.1, z1 - z0)],
    pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    ...extra,
  };
}

/** Batang horizontal/silinder sepanjang sumbu X. */
export function rod(
  id: string,
  x0: number,
  x1: number,
  y: number,
  z: number,
  d: number,
  extra: Extra = {},
): Part {
  return {
    id,
    role: "hardware",
    shape: "rod",
    size: [x1 - x0, d, d],
    pos: [(x0 + x1) / 2, y, z],
    ...extra,
  };
}

interface HandleOpts {
  id: string;
  style: HandleStyle;
  kind: "drawer" | "door";
  x0: number;
  x1: number;
  yb: number;
  yt: number;
  zFront: number;
  edge?: "left" | "right";
  col?: number;
  motion?: Motion;
}

export function addHandle(b: Builder, o: HandleOpts) {
  if (o.style === "push") return;
  const z0 = o.zFront;
  const z1 = o.zFront + 2.4;
  const cx = (o.x0 + o.x1) / 2;
  const cy = (o.yb + o.yt) / 2;
  const extra: Extra = { col: o.col, motion: o.motion };
  let bounds: [number, number, number, number, number, number];

  if (o.kind === "drawer") {
    if (o.style === "knob") {
      bounds = [cx - 1.5, cx + 1.5, cy - 1.5, cy + 1.5, z0, z1];
    } else {
      const w = Math.min(32, (o.x1 - o.x0) * 0.55);
      bounds = [cx - w / 2, cx + w / 2, cy - 0.6, cy + 0.6, z0, z1];
    }
  } else {
    const hx = o.edge === "left" ? o.x0 + 4.5 : o.x1 - 4.5;
    const h = o.yt - o.yb;
    const hy = h > 130 ? Math.min(Math.max(105, o.yb + 20), o.yt - 20) : cy;
    if (o.style === "knob") {
      bounds = [hx - 1.5, hx + 1.5, hy - 1.5, hy + 1.5, z0, z1];
    } else {
      const hh = Math.min(42, h * 0.4);
      bounds = [hx - 0.6, hx + 0.6, hy - hh / 2, hy + hh / 2, z0, z1];
    }
  }
  b.parts.push(box(o.id, "hardware", bounds, extra));
  b.tally.handles++;
}

interface DrawerOpts {
  id: string;
  col?: number;
  fx0: number;
  fx1: number;
  yb: number;
  yt: number;
  zFront: number;
  ix0: number;
  ix1: number;
  zBack: number;
  floorY: number;
  handle: HandleStyle;
  ft: number;
  pattern?: DoorPattern;
}

export function addDrawer(b: Builder, o: DrawerOpts) {
  const g = 0.15;
  const zFt = o.zFront - o.ft;
  const boxDepth = Math.max(10, Math.min(55, zFt - o.zBack - 1.5));
  const bz1 = zFt - 0.3;
  const bz0 = bz1 - boxDepth;
  const motion: Motion = { type: "slide", offset: [0, 0, boxDepth * 0.65] };
  const extra: Extra = { col: o.col, motion, pattern: o.pattern };

  b.parts.push(box(`${o.id}-f`, "front", [o.fx0 + g, o.fx1 - g, o.yb, o.yt, zFt, o.zFront], extra));

  const by0 = Math.max(o.yb + 1.5, o.floorY + 0.3);
  const by1 = Math.max(o.yt - 3, by0 + 4);
  const bx0 = o.ix0 + 0.8;
  const bx1 = o.ix1 - 0.8;
  const s = 1.2;
  b.parts.push(
    box(`${o.id}-l`, "body", [bx0, bx0 + s, by0, by1, bz0, bz1], extra),
    box(`${o.id}-r`, "body", [bx1 - s, bx1, by0, by1, bz0, bz1], extra),
    box(`${o.id}-k`, "body", [bx0 + s, bx1 - s, by0, by1, bz0, bz0 + s], extra),
    box(`${o.id}-b`, "body", [bx0 + s, bx1 - s, by0, by0 + 0.8, bz0 + s, bz1], extra),
  );
  b.tally.drawers++;

  addHandle(b, {
    id: `${o.id}-h`,
    style: o.handle,
    kind: "drawer",
    x0: o.fx0,
    x1: o.fx1,
    yb: o.yb,
    yt: o.yt,
    zFront: o.zFront,
    col: o.col,
    motion,
  });
}

export function finalize(
  b: Builder,
  columns: ColumnBounds[],
  baseHeight: number,
  totalHeight: number = 0,
): BuildResult {
  const area: Record<PartRole, number> = {
    body: 0,
    front: 0,
    shade: 0,
    hardware: 0,
    glass: 0,
    rattan: 0,
    accent: 0,
  };

  let totalVolumeCm3 = 0;
  for (const p of b.parts) {
    if (p.shape === "box") {
      const vol = p.size[0] * p.size[1] * p.size[2];
      if (p.role !== "hardware") totalVolumeCm3 += vol;
      const [a, c] = [...p.size].sort((m, n) => n - m);
      area[p.role] += (a * c) / 10000;
    }
  }

  const woodVolumeM3 = Number((totalVolumeCm3 / 1_000_000).toFixed(3));
  // Bobot: 690 kg/m3 (kayu solid / plywood kiln-dried) + aksesoris
  const estimatedWeightKg = Math.max(
    14,
    Math.round(woodVolumeM3 * 690 + b.tally.drawers * 2.8 + b.tally.hingedDoors * 2.2 + 4),
  );

  return {
    parts: b.parts,
    stats: {
      ...b.tally,
      area,
      woodVolumeM3,
      estimatedWeightKg,
    },
    columns,
    bayHuds: b.bayHuds,
    baseHeight,
    totalHeight: totalHeight > 0 ? totalHeight : 100,
  };
}
