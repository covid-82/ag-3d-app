import { count } from "drizzle-orm";
import { db } from "@/db";
import { materials, products } from "@/db/schema";
import { KIND_SPECS } from "@/lib/configurator/kinds";
import type { DesignConfig, Kind, Limits } from "@/lib/configurator/types";

const MATERIALS = [
  { slug: "oak-natural", name: "Oak Natural", type: "wood", hex: "#c9a06b", pricePerM2: 950_000 },
  { slug: "walnut", name: "Walnut", type: "wood", hex: "#6b4a32", pricePerM2: 1_250_000 },
  { slug: "jati-natural", name: "Jati Natural Cepu", type: "wood", hex: "#b9824a", pricePerM2: 1_400_000 },
  { slug: "sungkai-bleached", name: "Sungkai Alami", type: "wood", hex: "#dccdb0", pricePerM2: 890_000 },
  { slug: "putih-tulang", name: "Putih Tulang", type: "solid", hex: "#ece7dc", pricePerM2: 520_000 },
  { slug: "abu-batu", name: "Abu Batu", type: "solid", hex: "#8e918c", pricePerM2: 540_000 },
  { slug: "hijau-sage", name: "Hijau Sage", type: "solid", hex: "#8a9a84", pricePerM2: 600_000 },
  { slug: "hijau-hutan", name: "Hijau Hutan", type: "solid", hex: "#2f4a3c", pricePerM2: 620_000 },
  { slug: "terakota", name: "Terakota", type: "solid", hex: "#b4593a", pricePerM2: 620_000 },
  { slug: "biru-dusk", name: "Biru Dusk", type: "solid", hex: "#44566b", pricePerM2: 620_000 },
  { slug: "hitam-arang", name: "Hitam Arang", type: "solid", hex: "#2a2b2b", pricePerM2: 600_000 },
] as const;

interface SeedProduct {
  slug: string;
  kind: Kind;
  category: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  limits?: Partial<Record<keyof Limits, Partial<Limits["width"]>>>;
  defaults: Partial<DesignConfig>;
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: "lemari-pakaian-engsel",
    kind: "wardrobe",
    category: "Lemari",
    name: "Lemari Pakaian Modular & Rotan",
    tagline: "Lemari modular lantai-plafon dengan opsi motif anyaman rotan mata ayam dan kabinet atas.",
    description:
      "Lemari pakaian lantai-ke-plafon dengan pintu engsel soft-close dan opsi kabinet atas bertingkat. Setiap kolom bisa diisi ruang gantung, rak, atau laci dengan motif daun pintu rotan alami atau alur garis kayu.",
    highlights: [
      "Lebar 100–360 cm, dukungan modul kabinet atas bertumpuk",
      "Pilihan fasad: Anyaman Rotan Alami, Shaker Klasik, Alur Garis",
      "Engsel soft-close dengan simulasi bukaan pintu 3D",
    ],
    defaults: {
      bodyMaterial: "putih-tulang",
      frontMaterial: "jati-natural",
      doors: "hinged",
      doorPattern: "rattan",
      handle: "brass-bar",
      hasTopModule: false,
      topModuleHeight: 50,
      doorOpenAngle: 0,
    },
  },
  {
    slug: "lemari-pintu-geser",
    kind: "wardrobe",
    category: "Lemari",
    name: "Lemari Pintu Geser Modern",
    tagline: "Pintu geser hemat ruang untuk kamar minimalis tanpa ayunan pintu.",
    description:
      "Lemari dengan pintu geser dua jalur pada rel aluminium presisi. Hemat ruang tanpa memakan area lalu lintas kamar tidur.",
    highlights: [
      "Dua atau tiga panel geser pada rel aluminium",
      "Tanpa ruang ayun, cocok untuk kamar sempit",
      "Isi tiap kolom bisa diatur bebas",
    ],
    defaults: {
      bodyMaterial: "abu-batu",
      frontMaterial: "hijau-hutan",
      doors: "sliding",
      doorPattern: "flush",
      handle: "bar",
      hardware: "brass",
      hasTopModule: false,
      topModuleHeight: 0,
      columns: [
        { content: "hanging", shelves: 1, drawers: 0, pattern: "flush" },
        { content: "shelves", shelves: 4, drawers: 0, pattern: "flush" },
        { content: "hanging", shelves: 0, drawers: 0, pattern: "flush" },
      ],
    },
  },
  {
    slug: "rak-buku-modular",
    kind: "bookshelf",
    category: "Rak",
    name: "Rak Buku & Display Koleksi",
    tagline: "Rak buku bersekat dengan ambalan kokoh dan uji bentang bebas lendut.",
    description:
      "Rak buku terbuka dengan kolom modular dan ambalan yang dapat disesuaikan. Dukungan kalkulasi bentang ambalan bebas lendut.",
    highlights: [
      "Tinggi hingga 240 cm, lebar 60–240 cm",
      "Jumlah rak per kolom bebas diatur",
      "HUD dimensi celah ambalan real-time",
    ],
    limits: { width: { def: 160 } },
    defaults: {
      bodyMaterial: "oak-natural",
      frontMaterial: "oak-natural",
      doors: "none",
      back: true,
      base: "plinth",
      hasTopModule: false,
    },
  },
  {
    slug: "kredensa-tv",
    kind: "tvcabinet",
    category: "Kabinet",
    name: "Kredensa TV & Media Console",
    tagline: "Kabinet rendah dengan kaki ramping kuningan dan pintu rotan anyaman.",
    description:
      "Kabinet TV rendah berkaki ramping atau opsi floating wall-mount. Dilengkapi pintu anyaman rotan mata ayam untuk sirkulasi udara perangkat elektronik.",
    highlights: [
      "Pilihan alas: Kaki Kuningan, Plinth Solid, atau Floating Wall",
      "Pintu Anyaman Rotan Alami untuk sirkulasi udara audio",
      "HUD dimensi internal per kolom",
    ],
    defaults: {
      bodyMaterial: "hitam-arang",
      frontMaterial: "jati-natural",
      doors: "hinged",
      doorPattern: "rattan",
      handle: "brass-bar",
      base: "legs",
      hardware: "brass",
      hasTopModule: false,
    },
  },
  {
    slug: "meja-kerja",
    kind: "desk",
    category: "Meja",
    name: "Meja Kerja Arsitektural",
    tagline: "Meja kerja dengan laci pedestal samping dan rangka kaki besi kokoh.",
    description:
      "Meja kerja berpermukaan solid tebal dengan pilihan laci pedestal di sisi kiri atau kanan serta panel modesty.",
    highlights: [
      "Lebar 100–240 cm, kedalaman hingga 90 cm",
      "Laci samping kiri/kanan dengan rel full extension",
      "Tinggi 68–80 cm ergonomis",
    ],
    defaults: {
      bodyMaterial: "hitam-arang",
      frontMaterial: "oak-natural",
      legStyle: "frame",
      pedestal: "right",
      pedestalDrawers: 3,
      modesty: true,
      hardware: "black",
      hasTopModule: false,
    },
  },
  {
    slug: "pintu-kusen-studio",
    kind: "door",
    category: "Pintu",
    name: "Pintu & Kusen Studio",
    tagline: "Pintu arsitektural solid dengan simulasi denah 2D busur ayunan dan pilihan motif daun pintu.",
    description:
      "Generator pintu dan kusen parametrik. Menampilkan visualisasi denah arsitektural 2D lengkap dengan busur ayunan pintu (*door swing arc*), ketebalan dinding, serta variasi motif daun pintu (anyaman rotan, panel klasik, alur tali air, dan jendela samping).",
    highlights: [
      "Simulasi sudut ayunan pintu 0–90° dengan denah 2D",
      "Pilihan motif: Anyaman Rotan, Panel Klasik Shaker, Alur CNC",
      "Kombinasi opsional jendela samping kaca mati kiri/kanan",
    ],
    defaults: {
      bodyMaterial: "jati-natural",
      frontMaterial: "jati-natural",
      doorPattern: "rattan",
      frameMaterial: "wood",
      handle: "brass-bar",
      hardware: "brass",
      hasTopModule: false,
    },
  },
];

let seeding: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = run().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

async function run() {
  const [{ n: productCount }] = await db.select({ n: count() }).from(products);
  const [{ n: materialCount }] = await db.select({ n: count() }).from(materials);
  if (productCount > 0 || materialCount > 0) return;

  await db.insert(materials).values(MATERIALS.map((m, i) => ({ ...m, sortOrder: i })));

  await db.insert(products).values(
    PRODUCTS.map((p, i) => {
      const spec = KIND_SPECS[p.kind] ?? KIND_SPECS.wardrobe;
      const limits: Limits = {
        width: { ...spec.limits.width, ...p.limits?.width },
        height: { ...spec.limits.height, ...p.limits?.height },
        depth: { ...spec.limits.depth, ...p.limits?.depth },
      };
      return {
        slug: p.slug,
        kind: p.kind,
        category: p.category,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        highlights: p.highlights,
        limits,
        defaults: p.defaults,
        pricing: spec.pricing,
        published: true,
        sortOrder: i,
      };
    }),
  );
}
