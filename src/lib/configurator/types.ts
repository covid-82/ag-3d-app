/**
 * Tipe inti mesin konfigurator arsitektural Kayuara 3D.
 * Semua satuan ukuran dalam sentimeter (cm) kecuali ketebalan teknis.
 * Koordinat: x = kanan/kiri, y = vertikal/tinggi, z = ke arah depan (depan positif). Titik nol di tengah lantai.
 */

export type Kind = "wardrobe" | "bookshelf" | "tvcabinet" | "desk" | "door";

export type ColumnContent = "shelves" | "hanging" | "open";
export type DoorMode = "none" | "hinged" | "sliding";
export type DoorStyle = "solid" | "glass";
export type DoorPattern =
  | "flush"
  | "rattan"
  | "vertical-groove"
  | "horizontal-groove"
  | "classic-panel"
  | "glass-strip"
  | "glass-full";

export type HandleStyle = "bar" | "knob" | "push" | "brass-bar";
export type BaseStyle = "plinth" | "legs" | "floating" | "floor";
export type HardwareFinish = "black" | "brass" | "steel";
export type LegStyle = "panel" | "frame" | "tapered-wood" | "tubular-steel";
export type Pedestal = "none" | "left" | "right" | "both";

export interface ColumnConfig {
  content: ColumnContent;
  /** Jumlah rak (content=shelves) atau 0/1 rak atas (content=hanging). */
  shelves: number;
  /** Jumlah laci di bagian bawah kolom. */
  drawers: number;
  /** Motif spesifik pintu kolom ini (opsional jika override). */
  pattern?: DoorPattern;
}

export interface DesignConfig {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: string;
  frontMaterial: string;
  hardware: HardwareFinish;
  // Lemari, rak, kabinet
  base: BaseStyle;
  doors: DoorMode;
  doorStyle: DoorStyle;
  doorPattern: DoorPattern;
  handle: HandleStyle;
  back: boolean;
  columns: ColumnConfig[];
  // Modul susunan atas (overhead module / tambah di atas)
  hasTopModule: boolean;
  topModuleHeight: number;
  topModuleDoors: DoorMode;
  // Meja kerja
  legStyle: LegStyle;
  pedestal: Pedestal;
  pedestalDrawers: number;
  modesty: boolean;
  // State interaktif bukaan pintu (0 = tertutup rapat, 90 = terbuka 90 derajat)
  doorOpenAngle: number;
  // Pintu Kusen Arsitektural (Door Studio style)
  wallThickness?: number;
  frameMaterial?: "wood" | "aluminum";
  hasSideWindow?: "none" | "left" | "right" | "both";
  sideWindowWidth?: number;
}

export interface DimLimit {
  min: number;
  max: number;
  step: number;
  def: number;
}

export interface Limits {
  width: DimLimit;
  height: DimLimit;
  depth: DimLimit;
}

export interface Pricing {
  base: number;
  perDrawer: number;
  perHingedDoor: number;
  perSlidingPanel: number;
  perHandle: number;
  margin: number;
}

export type PartRole = "body" | "front" | "shade" | "hardware" | "glass" | "rattan" | "accent";

export type Motion =
  | { type: "slide"; offset: [number, number, number] }
  | { type: "hinge"; pivot: [number, number, number]; angle: number };

export interface Part {
  id: string;
  role: PartRole;
  shape: "box" | "rod" | "cylinder";
  /** Ukuran [x, y, z] dalam cm. */
  size: [number, number, number];
  /** Titik tengah [x, y, z] dalam cm. */
  pos: [number, number, number];
  /** Indeks kolom, dipakai untuk memilih kolom dengan klik pada model. */
  col?: number;
  motion?: Motion;
  pattern?: DoorPattern;
}

export interface BuildStats {
  drawers: number;
  hingedDoors: number;
  slidingPanels: number;
  handles: number;
  shelves: number;
  /** Luas permukaan papan per peran, dalam m². */
  area: Record<PartRole, number>;
  /** Estimasi volume kayu total dalam m3 */
  woodVolumeM3: number;
  /** Estimasi berat produk total dalam kg */
  estimatedWeightKg: number;
}

export interface ColumnBounds {
  x0: number;
  x1: number;
}

export interface BayDimensionHUD {
  colIndex: number;
  x: number;
  bottomY: number;
  topY: number;
  widthCm: number;
  shelfHeightsCm: number[];
}

export interface BuildResult {
  parts: Part[];
  stats: BuildStats;
  columns: ColumnBounds[];
  bayHuds: BayDimensionHUD[];
  baseHeight: number;
  totalHeight: number;
}

export interface MaterialOption {
  slug: string;
  name: string;
  type: "wood" | "solid" | "metal";
  grainType?: "teak" | "sungkai" | "walnut" | "oak" | "rattan" | "lacquer";
  hex: string;
  secondaryHex?: string;
  pricePerM2: number;
  roughness?: number;
  metalness?: number;
}

export interface ProductData {
  id: number;
  slug: string;
  kind: Kind;
  category: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  limits: Limits;
  defaults: Partial<DesignConfig>;
  pricing: Pricing;
  published: boolean;
  sortOrder: number;
}
