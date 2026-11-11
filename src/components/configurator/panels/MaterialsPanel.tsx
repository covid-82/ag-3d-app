"use client";

import { ControlGroup, HardwareDot, Segmented, SwatchGrid } from "@/components/ui/controls";
import type { KindSpec } from "@/lib/configurator/kinds";
import { HARDWARE_LIST } from "@/lib/configurator/labels";
import type { DesignConfig, MaterialOption } from "@/lib/configurator/types";

interface Props {
  spec: KindSpec;
  config: DesignConfig;
  materials: MaterialOption[];
  apply: (patch: Partial<DesignConfig>) => void;
}

function MaterialPicker({
  label,
  materials,
  value,
  onChange,
}: {
  label: string;
  materials: MaterialOption[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const woods = materials.filter((m) => m.type === "wood");
  const solids = materials.filter((m) => m.type === "solid");
  const current = materials.find((m) => m.slug === value);
  return (
    <ControlGroup label={label} aside={<span className="text-[12.5px] text-ink-soft">{current?.name}</span>}>
      {woods.length > 0 && (
        <>
          <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-mute">Serat kayu</p>
          <SwatchGrid label={`${label}: kayu`} materials={woods} value={value} onChange={onChange} />
        </>
      )}
      {solids.length > 0 && (
        <>
          <p className="mb-2 mt-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-mute">Warna cat / HPL</p>
          <SwatchGrid label={`${label}: warna`} materials={solids} value={value} onChange={onChange} />
        </>
      )}
    </ControlGroup>
  );
}

export function MaterialsPanel({ spec, config, materials, apply }: Props) {
  return (
    <div className="divide-y divide-line">
      <MaterialPicker label={spec.bodyLabel} materials={materials} value={config.bodyMaterial} onChange={(s) => apply({ bodyMaterial: s })} />
      <MaterialPicker label={spec.frontLabel} materials={materials} value={config.frontMaterial} onChange={(s) => apply({ frontMaterial: s })} />
      <ControlGroup label="Finishing hardware" hint="Berlaku untuk handle, kaki, dan rel gantung.">
        <Segmented
          label="Finishing hardware"
          options={HARDWARE_LIST.map((h) => ({ value: h.slug, label: h.name }))}
          value={config.hardware}
          onChange={(v) => apply({ hardware: v })}
        />
        <div className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <HardwareDot slug={config.hardware} /> {HARDWARE_LIST.find((h) => h.slug === config.hardware)?.name}
        </div>
      </ControlGroup>
    </div>
  );
}
