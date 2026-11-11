import type {
  BaseStyle,
  ColumnContent,
  DoorMode,
  DoorPattern,
  DoorStyle,
  HandleStyle,
  HardwareFinish,
  LegStyle,
  Pedestal,
} from "./types";

export const DOOR_LABEL: Record<DoorMode, string> = {
  none: "Tanpa pintu",
  hinged: "Pintu engsel",
  sliding: "Pintu geser",
};

export const DOOR_STYLE_LABEL: Record<DoorStyle, string> = {
  solid: "Panel kayu penuh",
  glass: "Kaca bening + bingkai",
};

export const DOOR_PATTERN_LABEL: Record<DoorPattern, string> = {
  flush: "Polos Minimalis",
  rattan: "Anyaman Rotan Mata Ayam",
  "vertical-groove": "Alur Tali Air Vertikal",
  "horizontal-groove": "Alur Tali Air Horizontal",
  "classic-panel": "Panel Shaker Klasik",
  "glass-strip": "Kaca Strip Tengah",
  "glass-full": "Kaca Bening Keliling",
};

export const HANDLE_LABEL: Record<HandleStyle, string> = {
  bar: "Handle batang minimalis",
  knob: "Knob bulat",
  push: "Push-to-open",
  "brass-bar": "Batang kuningan satin",
};

export const BASE_LABEL: Record<BaseStyle, string> = {
  plinth: "Plint kayu 8 cm",
  legs: "Kaki 14 cm (mid-century)",
  floating: "Melayang di dinding (French Cleat)",
  floor: "Menempel lantai penuh",
};

export const CONTENT_LABEL: Record<ColumnContent, string> = {
  shelves: "Ambalan / Rak",
  hanging: "Gantungan Baju",
  open: "Ruang Terbuka",
};

export const LEG_LABEL: Record<LegStyle, string> = {
  frame: "Rangka besi hollow hitam",
  panel: "Panel kayu solid",
  "tapered-wood": "Kaki kayu meruncing",
  "tubular-steel": "Baja tubular silinder",
};

export const PEDESTAL_LABEL: Record<Pedestal, string> = {
  none: "Tanpa laci",
  left: "Laci sisi kiri",
  right: "Laci sisi kanan",
  both: "Laci kedua sisi (kiri & kanan)",
};

export const HARDWARE_LIST: {
  slug: HardwareFinish;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
}[] = [
  { slug: "black", name: "Hitam doff", hex: "#1c1c1c", metalness: 0.5, roughness: 0.45 },
  { slug: "brass", name: "Kuningan satin", hex: "#b8924a", metalness: 0.9, roughness: 0.3 },
  { slug: "steel", name: "Baja sikat", hex: "#aeb2b5", metalness: 0.9, roughness: 0.35 },
];

export const HARDWARE_LABEL: Record<HardwareFinish, string> = {
  black: "Hitam doff",
  brass: "Kuningan satin",
  steel: "Baja sikat",
};

export const CATEGORIES = ["Lemari", "Rak", "Kabinet", "Meja", "Pintu"] as const;
