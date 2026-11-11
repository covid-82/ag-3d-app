import { buildCabinet } from "./builders/cabinet";
import { buildDesk } from "./builders/desk";
import { buildDoor } from "./builders/door";
import { KIND_SPECS } from "./kinds";
import type { BuildResult, DesignConfig, Kind } from "./types";

/** Satu pintu masuk: konfigurasi → daftar komponen 3D + statistik. Fungsi murni, aman dipakai di server maupun klien. */
export function buildParts(kind: Kind, config: DesignConfig): BuildResult {
  const spec = KIND_SPECS[kind] ?? KIND_SPECS.wardrobe;
  if (spec.engine === "cabinet") return buildCabinet(spec, config);
  if (spec.engine === "desk") return buildDesk(spec, config);
  return buildDoor(spec, config);
}
