"use client";

import { useMemo } from "react";
import { buildParts } from "@/lib/configurator/build";
import type { DesignConfig, Kind, MaterialOption } from "@/lib/configurator/types";
import { Viewport } from "./Viewport";

/** Pratinjau 3D berputar otomatis (tanpa panel edit) untuk beranda dan halaman detail produk. */
export function ShowcaseViewer({
  kind,
  config,
  materials,
  className = "",
}: {
  kind: Kind;
  config: DesignConfig;
  materials: MaterialOption[];
  className?: string;
}) {
  const result = useMemo(() => buildParts(kind, config), [kind, config]);
  return (
    <div className={`relative w-full max-w-full overflow-hidden ${className}`}>
      <Viewport
        mode="showcase"
        config={config}
        result={result}
        materials={materials}
        className="w-full h-full"
      />
    </div>
  );
}
