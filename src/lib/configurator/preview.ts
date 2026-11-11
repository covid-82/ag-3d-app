import { buildParts } from "./build";
import { KIND_SPECS, makeInitialConfig } from "./kinds";
import { estimatePrice } from "./pricing";
import { sanitize } from "./rules";
import type { MaterialOption, ProductData } from "./types";

/** Konfigurasi awal sebuah produk lengkap dengan model & estimasi harga. Dipakai kartu katalog dan halaman detail. */
export function productPreview(product: ProductData, materials: MaterialOption[]) {
  const spec = KIND_SPECS[product.kind];
  const config = sanitize(spec, product.limits, makeInitialConfig(spec, product, materials)).config;
  const result = buildParts(product.kind, config);
  const estimate = estimatePrice(
    result,
    product.pricing,
    materials.find((m) => m.slug === config.bodyMaterial),
    materials.find((m) => m.slug === config.frontMaterial),
  );
  return { spec, config, result, estimate };
}
