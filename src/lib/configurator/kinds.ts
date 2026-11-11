import type {
  BaseStyle,
  ColumnConfig,
  ColumnContent,
  DesignConfig,
  DoorMode,
  DoorPattern,
  DoorStyle,
  Kind,
  Limits,
  MaterialOption,
  Pricing,
  ProductData,
} from "./types";

/** Tebal papan standar (cm). */
export const PANEL = { t: 1.8, back: 0.8, front: 1.8, gap: 0.25 } as const;

export interface CabinetRules {
  minColW: number;
  maxColW: number;
  maxColumns: number;
  drawerHeight: number;
  minUpper: number;
  doors: DoorMode[];
  doorStyles: DoorStyle[];
  doorPatterns: DoorPattern[];
  bases: BaseStyle[];
  contents: ColumnContent[];
  backForced: boolean;
}

export interface DeskRules {
  pedestalWidth: number;
  minWidthOne: number;
  minWidthBoth: number;
  maxDrawers: number;
}

export interface DoorRules {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  standardSizes: { w: number; h: number; label: string }[];
  motifs: DoorPattern[];
}

export interface KindSpec {
  kind: Kind;
  label: string;
  engine: "cabinet" | "desk" | "door";
  bodyLabel: string;
  frontLabel: string;
  limits: Limits;
  pricing: Pricing;
  defaults: Partial<DesignConfig>;
  cabinet?: CabinetRules;
  desk?: DeskRules;
  door?: DoorRules;
}

const dim = (min: number, max: number, def: number): Limits["width"] => ({
  min,
  max,
  def,
  step: 1,
});

const ALL_DOOR_PATTERNS: DoorPattern[] = [
  "flush",
  "rattan",
  "vertical-groove",
  "horizontal-groove",
  "classic-panel",
  "glass-strip",
  "glass-full",
];

const COLUMN_PATTERNS: Record<Kind, ColumnConfig[]> = {
  wardrobe: [
    { content: "hanging", shelves: 1, drawers: 0, pattern: "flush" },
    { content: "shelves", shelves: 4, drawers: 2, pattern: "rattan" },
    { content: "hanging", shelves: 0, drawers: 0, pattern: "flush" },
  ],
  bookshelf: [{ content: "shelves", shelves: 4, drawers: 0 }],
  tvcabinet: [
    { content: "shelves", shelves: 1, drawers: 0, pattern: "rattan" },
    { content: "open", shelves: 0, drawers: 2 },
    { content: "shelves", shelves: 1, drawers: 0, pattern: "rattan" },
  ],
  desk: [],
  door: [{ content: "open", shelves: 0, drawers: 0 }],
};

export function defaultColumns(kind: Kind, n: number): ColumnConfig[] {
  const pattern = COLUMN_PATTERNS[kind] ?? [];
  if (!pattern.length) return [];
  return Array.from({ length: n }, (_, i) => ({ ...pattern[i % pattern.length] }));
}

export const KIND_SPECS: Record<Kind, KindSpec> = {
  wardrobe: {
    kind: "wardrobe",
    label: "Lemari Pakaian & Wardrobe",
    engine: "cabinet",
    bodyLabel: "Rangka & Badan Lemari",
    frontLabel: "Pintu & Laci (Fasad)",
    limits: {
      width: dim(100, 360, 200),
      height: dim(180, 260, 220),
      depth: dim(45, 70, 60),
    },
    pricing: {
      base: 750_000,
      perDrawer: 450_000,
      perHingedDoor: 150_000,
      perSlidingPanel: 900_000,
      perHandle: 45_000,
      margin: 1.5,
    },
    defaults: {
      base: "plinth",
      doors: "hinged",
      doorStyle: "solid",
      doorPattern: "rattan",
      handle: "brass-bar",
      back: true,
      hasTopModule: false,
      topModuleHeight: 50,
      topModuleDoors: "hinged",
      doorOpenAngle: 0,
    },
    cabinet: {
      minColW: 40,
      maxColW: 80,
      maxColumns: 6,
      drawerHeight: 22,
      minUpper: 100,
      doors: ["none", "hinged", "sliding"],
      doorStyles: ["solid", "glass"],
      doorPatterns: ALL_DOOR_PATTERNS,
      bases: ["plinth", "legs", "floor"],
      contents: ["hanging", "shelves", "open"],
      backForced: true,
    },
  },
  bookshelf: {
    kind: "bookshelf",
    label: "Rak Buku & Pajangan",
    engine: "cabinet",
    bodyLabel: "Rangka & Ambalan",
    frontLabel: "Pintu & Laci (Fasad)",
    limits: {
      width: dim(60, 240, 120),
      height: dim(80, 240, 200),
      depth: dim(25, 45, 32),
    },
    pricing: {
      base: 450_000,
      perDrawer: 350_000,
      perHingedDoor: 130_000,
      perSlidingPanel: 0,
      perHandle: 40_000,
      margin: 1.45,
    },
    defaults: {
      base: "plinth",
      doors: "none",
      doorStyle: "solid",
      doorPattern: "flush",
      handle: "bar",
      back: true,
      hasTopModule: false,
      topModuleHeight: 40,
      topModuleDoors: "none",
      doorOpenAngle: 0,
    },
    cabinet: {
      minColW: 30,
      maxColW: 90,
      maxColumns: 5,
      drawerHeight: 20,
      minUpper: 50,
      doors: ["none", "hinged"],
      doorStyles: ["solid", "glass"],
      doorPatterns: ALL_DOOR_PATTERNS,
      bases: ["plinth", "legs", "floor"],
      contents: ["shelves", "open"],
      backForced: false,
    },
  },
  tvcabinet: {
    kind: "tvcabinet",
    label: "Kabinet TV & Kredensa",
    engine: "cabinet",
    bodyLabel: "Rangka & Carcass",
    frontLabel: "Pintu & Laci (Fasad)",
    limits: {
      width: dim(120, 280, 180),
      height: dim(35, 75, 52),
      depth: dim(30, 50, 42),
    },
    pricing: {
      base: 450_000,
      perDrawer: 400_000,
      perHingedDoor: 130_000,
      perSlidingPanel: 0,
      perHandle: 40_000,
      margin: 1.5,
    },
    defaults: {
      base: "legs",
      doors: "hinged",
      doorStyle: "solid",
      doorPattern: "rattan",
      handle: "brass-bar",
      back: true,
      hasTopModule: false,
      topModuleHeight: 0,
      topModuleDoors: "none",
      doorOpenAngle: 0,
    },
    cabinet: {
      minColW: 35,
      maxColW: 80,
      maxColumns: 6,
      drawerHeight: 16,
      minUpper: 0,
      doors: ["none", "hinged"],
      doorStyles: ["solid", "glass"],
      doorPatterns: ALL_DOOR_PATTERNS,
      bases: ["plinth", "legs", "floating", "floor"],
      contents: ["shelves", "open"],
      backForced: true,
    },
  },
  desk: {
    kind: "desk",
    label: "Meja Kerja & Studio",
    engine: "desk",
    bodyLabel: "Rangka Kaki & Modesty",
    frontLabel: "Top Meja & Laci Pedestal",
    limits: {
      width: dim(100, 240, 150),
      height: dim(68, 80, 75),
      depth: dim(50, 90, 65),
    },
    pricing: {
      base: 350_000,
      perDrawer: 380_000,
      perHingedDoor: 0,
      perSlidingPanel: 0,
      perHandle: 40_000,
      margin: 1.5,
    },
    defaults: {
      legStyle: "frame",
      pedestal: "right",
      pedestalDrawers: 3,
      modesty: true,
      handle: "brass-bar",
      hasTopModule: false,
      topModuleHeight: 0,
      topModuleDoors: "none",
      doorOpenAngle: 0,
    },
    desk: { pedestalWidth: 42, minWidthOne: 110, minWidthBoth: 160, maxDrawers: 4 },
  },
  door: {
    kind: "door",
    label: "Pintu & Kusen Studio",
    engine: "door",
    bodyLabel: "Kusen & Frame Dinding",
    frontLabel: "Daun Pintu & Panel Motif",
    limits: {
      width: dim(70, 240, 90),
      height: dim(190, 260, 215),
      depth: dim(10, 20, 14),
    },
    pricing: {
      base: 950_000,
      perDrawer: 0,
      perHingedDoor: 350_000,
      perSlidingPanel: 0,
      perHandle: 120_000,
      margin: 1.45,
    },
    defaults: {
      doors: "hinged",
      doorStyle: "solid",
      doorPattern: "classic-panel",
      handle: "bar",
      wallThickness: 14,
      frameMaterial: "wood",
      hasSideWindow: "none",
      sideWindowWidth: 45,
      doorOpenAngle: 0,
    },
    door: {
      minWidth: 70,
      maxWidth: 240,
      minHeight: 190,
      maxHeight: 260,
      standardSizes: [
        { w: 80, h: 210, label: "80 x 210 cm (Kamar/Standar)" },
        { w: 90, h: 215, label: "90 x 215 cm (Utama/Lebar)" },
        { w: 140, h: 215, label: "140 x 215 cm (Pintu Ganda 2 Daun)" },
      ],
      motifs: ALL_DOOR_PATTERNS,
    },
  },
};

export const KIND_LIST = Object.values(KIND_SPECS);

export function isKind(value: string): value is Kind {
  return value in KIND_SPECS;
}

export function baseConfig(): DesignConfig {
  return {
    width: 150,
    height: 100,
    depth: 50,
    bodyMaterial: "",
    frontMaterial: "",
    hardware: "brass",
    base: "plinth",
    doors: "hinged",
    doorStyle: "solid",
    doorPattern: "flush",
    handle: "brass-bar",
    back: true,
    columns: [],
    hasTopModule: false,
    topModuleHeight: 50,
    topModuleDoors: "hinged",
    legStyle: "frame",
    pedestal: "none",
    pedestalDrawers: 3,
    modesty: true,
    doorOpenAngle: 0,
  };
}

export function makeInitialConfig(
  spec: KindSpec,
  product: Pick<ProductData, "limits" | "defaults">,
  materials: MaterialOption[],
): DesignConfig {
  const cfg: DesignConfig = {
    ...baseConfig(),
    ...spec.defaults,
    ...product.defaults,
    width: product.limits.width.def,
    height: product.limits.height.def,
    depth: product.limits.depth.def,
  };
  const woods = materials.filter((m) => m.type === "wood");
  const solids = materials.filter((m) => m.type === "solid");
  const has = (slug: string) => materials.some((m) => m.slug === slug);
  if (!has(cfg.bodyMaterial)) cfg.bodyMaterial = (solids[0] ?? materials[0])?.slug ?? "";
  if (!has(cfg.frontMaterial)) cfg.frontMaterial = (woods[0] ?? materials[0])?.slug ?? "";
  if (spec.engine === "cabinet" && cfg.columns.length === 0) {
    const n = defaultColumnCount(spec, cfg.width);
    cfg.columns = defaultColumns(spec.kind, n);
  }
  return cfg;
}

function defaultColumnCount(spec: KindSpec, width: number): number {
  const rules = spec.cabinet;
  if (!rules) return 1;
  const target = spec.kind === "bookshelf" ? 55 : spec.kind === "tvcabinet" ? 60 : 62;
  const raw = Math.round(width / target);
  return Math.min(rules.maxColumns, Math.max(1, raw));
}
