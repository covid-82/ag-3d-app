"use client";

import { ControlGroup, Segmented, Stepper, Toggle, type SegOption } from "@/components/ui/controls";
import { defaultColumns, type KindSpec } from "@/lib/configurator/kinds";
import { BASE_LABEL, CONTENT_LABEL, DOOR_STYLE_LABEL } from "@/lib/configurator/labels";
import {
  columnRange,
  columnWidth,
  drawersMax,
  hangingOk,
  pedestalDrawersMax,
  shelvesMax,
  topShelfOk,
  upperHeight,
} from "@/lib/configurator/rules";
import { describeColumn } from "@/lib/configurator/summary";
import type {
  ColumnConfig,
  DesignConfig,
  DoorMode,
  DoorPattern,
  HandleStyle,
  Pedestal,
} from "@/lib/configurator/types";
import { MotifGridPicker } from "../MotifGridPicker";

interface Props {
  spec: KindSpec;
  config: DesignConfig;
  apply: (patch: Partial<DesignConfig> | ((c: DesignConfig) => Partial<DesignConfig>), key?: string) => void;
  selected: number | null;
  onSelect: (i: number | null) => void;
}

export function StructurePanel(props: Props) {
  if (props.spec.engine === "cabinet") return <CabinetStructure {...props} />;
  if (props.spec.engine === "desk") return <DeskStructure {...props} />;
  return <DoorStructure {...props} />;
}

const DOOR_SHORT: Record<DoorMode, string> = { none: "Tanpa", hinged: "Engsel", sliding: "Geser" };
const HANDLE_OPTIONS: SegOption<HandleStyle>[] = [
  { value: "bar", label: "Batang" },
  { value: "knob", label: "Knob" },
  { value: "push", label: "Push-open" },
  { value: "brass-bar", label: "Kuningan" },
];

function CabinetStructure({ spec, config, apply, selected, onSelect }: Props) {
  const rules = spec.cabinet!;
  const n = config.columns.length;
  const range = columnRange(rules, config.width);
  const sel = selected !== null && selected < n ? selected : 0;
  const col = config.columns[sel];
  const dMax = drawersMax(rules, config);
  const upper = upperHeight(rules, config, col.drawers);
  const sMax = shelvesMax(upper);
  const anyDrawers = config.columns.some((c) => c.drawers > 0);
  const cw = Math.round(columnWidth(config.width, n));

  const setCol = (patch: Partial<ColumnConfig>) =>
    apply(
      (c) => ({
        columns: c.columns.map((cc, i) => (i === sel ? { ...cc, ...patch } : cc)),
      }),
      `col${sel}`,
    );

  const resize = (count: number) =>
    apply((c) => {
      const fill = defaultColumns(spec.kind, count);
      return { columns: Array.from({ length: count }, (_, i) => c.columns[i] ?? fill[i]) };
    }, "cols");

  const contentOptions: SegOption<ColumnConfig["content"]>[] = rules.contents.map((v) => ({
    value: v,
    label: CONTENT_LABEL[v],
    disabled: v === "hanging" && !hangingOk(upper),
    reason: "ruang di atas laci kurang dari 90 cm.",
  }));

  const doorOptions: SegOption<DoorMode>[] = rules.doors.map((v) => ({
    value: v,
    label: DOOR_SHORT[v],
    disabled: v === "sliding" && anyDrawers,
    reason: "rel geser menutup seluruh bagian depan, jadi tidak bisa digabung dengan laci. Atur laci ke 0 di semua kolom.",
  }));

  const handleOptions = HANDLE_OPTIONS.map((o) => ({
    ...o,
    disabled: config.doors === "sliding" && (o.value === "knob" || o.value === "push"),
    reason: "pintu geser memakai handle batang profil.",
  }));

  return (
    <div className="divide-y divide-line">
      {/* 1. Pengaturan Kolom Carcass */}
      <ControlGroup
        label="Jumlah kolom"
        hint={`Lebar tiap kolom ±${cw} cm (batas ${rules.minColW}–${rules.maxColW} cm).`}
        aside={<Stepper label="kolom" value={n} min={range.min} max={range.max} onChange={resize} />}
      >
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Pilih kolom untuk diedit">
          {config.columns.map((c, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === sel}
              onClick={() => onSelect(i)}
              className={`min-h-11 flex-1 basis-24 rounded-lg border px-2.5 py-1.5 text-left transition-all ${
                i === sel
                  ? "border-moss bg-moss/10 font-semibold text-moss"
                  : "border-line bg-paper-2 hover:border-ink/40 text-ink-soft"
              }`}
            >
              <span className="block font-mono text-[10px] text-ink-mute">Kolom {i + 1}</span>
              <span className="block text-xs leading-tight">{describeColumn(c)}</span>
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* 2. Detail Sekat Kolom Terpilih */}
      <section
        aria-label={`Pengaturan kolom ${sel + 1}`}
        className="border-l-2 border-moss bg-paper-2/70 rounded-r-xl p-3 my-2 space-y-3"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-moss font-bold">
          Pengaturan Kolom {sel + 1} dari {n}
        </p>
        <ControlGroup label="Isi kompartemen">
          <Segmented
            label="Isi kolom"
            options={contentOptions}
            value={col.content}
            onChange={(v) =>
              setCol({
                content: v,
                shelves: v === "shelves" ? Math.max(col.shelves, 2) : v === "hanging" ? col.shelves : 0,
              })
            }
          />
        </ControlGroup>

        {col.content === "shelves" && (
          <ControlGroup
            label="Jumlah ambalan / rak"
            aside={<Stepper label="rak" value={col.shelves} min={0} max={sMax} onChange={(v) => setCol({ shelves: v })} />}
            hint={`Maksimal ${sMax} rak pada tinggi ini.`}
          />
        )}

        {col.content === "hanging" && (
          <ControlGroup label="Rak atas gantungan">
            <Toggle
              label="Ambalan topi di atas rel gantung"
              checked={col.shelves > 0}
              disabled={!topShelfOk(upper)}
              reason="butuh tinggi ruang minimal 140 cm."
              onChange={(v) => setCol({ shelves: v ? 1 : 0 })}
            />
          </ControlGroup>
        )}

        <ControlGroup
          label="Laci bawah"
          aside={<Stepper label="laci" value={col.drawers} min={0} max={dMax} onChange={(v) => setCol({ drawers: v })} />}
          hint={dMax === 0 ? "Tinggi badan tidak cukup untuk laci." : `Tinggi laci ${rules.drawerHeight} cm, maks ${dMax} laci.`}
        />

        {n > 1 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() =>
                apply(
                  (c) => ({
                    columns: c.columns.map(() => ({ ...c.columns[sel] })),
                  }),
                  "copy",
                )
              }
              className="text-xs font-semibold text-moss underline underline-offset-2 hover:text-moss/80"
            >
              Terapkan susunan ini ke semua kolom
            </button>
          </div>
        )}
      </section>

      {/* 3. Pintu & Fasad */}
      <ControlGroup label="Tipe bukaan pintu">
        <Segmented label="Jenis pintu" options={doorOptions} value={config.doors} onChange={(v) => apply({ doors: v })} />
      </ControlGroup>

      {/* 4. Visual Motif Grid Picker (Door Studio Style) */}
      {config.doors !== "none" && (
        <div className="py-3">
          <label className="block text-xs font-semibold text-ink mb-2">
            Pola & Motif Daun Pintu (Visual Grid)
          </label>
          <MotifGridPicker
            value={config.doorPattern || "flush"}
            onChange={(pattern: DoorPattern) => apply({ doorPattern: pattern }, "pattern")}
          />
        </div>
      )}

      {/* 5. Handle & Aksesoris */}
      <ControlGroup label="Model pegangan (handle)">
        <Segmented label="Handle" options={handleOptions} value={config.handle} onChange={(v) => apply({ handle: v })} />
      </ControlGroup>

      {/* 6. Pilihan Alas (Plinth / Kaki / Floating) */}
      <ControlGroup label="Konstruksi alas">
        <Segmented
          label="Alas"
          options={rules.bases.map((v) => ({ value: v, label: BASE_LABEL[v] }))}
          value={config.base}
          onChange={(v) => apply({ base: v })}
        />
      </ControlGroup>

      {!rules.backForced && (
        <div className="py-2">
          <Toggle label="Panel penutup belakang" checked={config.back} onChange={(v) => apply({ back: v })} />
        </div>
      )}
    </div>
  );
}

function DeskStructure({ spec, config, apply }: Props) {
  const rules = spec.desk!;
  const dMax = pedestalDrawersMax(config);
  const tooNarrowOne = config.width < rules.minWidthOne;
  const tooNarrowBoth = config.width < rules.minWidthBoth;

  const pedestalOptions: SegOption<Pedestal>[] = [
    { value: "none", label: "Tanpa" },
    { value: "left", label: "Kiri", disabled: tooNarrowOne, reason: `lebar meja minimal ${rules.minWidthOne} cm.` },
    { value: "right", label: "Kanan", disabled: tooNarrowOne, reason: `lebar meja minimal ${rules.minWidthOne} cm.` },
    { value: "both", label: "Kedua sisi", disabled: tooNarrowBoth, reason: `lebar meja minimal ${rules.minWidthBoth} cm.` },
  ];

  return (
    <div className="divide-y divide-line">
      <ControlGroup label="Kaki meja">
        <Segmented
          label="Kaki meja"
          options={[
            { value: "frame", label: "Rangka Besi Hitam" },
            { value: "panel", label: "Panel Kayu Solid" },
          ]}
          value={config.legStyle}
          onChange={(v) => apply({ legStyle: v })}
        />
      </ControlGroup>
      <ControlGroup label="Laci samping (Pedestal)">
        <Segmented label="Laci samping" options={pedestalOptions} value={config.pedestal} onChange={(v) => apply({ pedestal: v })} />
      </ControlGroup>
      {config.pedestal !== "none" && (
        <>
          <ControlGroup
            label="Jumlah laci per sisi"
            aside={<Stepper label="laci" value={config.pedestalDrawers} min={1} max={dMax} onChange={(v) => apply({ pedestalDrawers: v })} />}
            hint={`Maksimal ${dMax} laci pada tinggi meja ini.`}
          />
          <ControlGroup label="Handle">
            <Segmented label="Handle" options={HANDLE_OPTIONS} value={config.handle} onChange={(v) => apply({ handle: v })} />
          </ControlGroup>
        </>
      )}
      <div className="py-2">
        <Toggle label="Panel modesty penutup kaki" checked={config.modesty} onChange={(v) => apply({ modesty: v })} />
      </div>
    </div>
  );
}

function DoorStructure({ spec, config, apply }: Props) {
  return (
    <div className="divide-y divide-line space-y-3">
      <div className="py-2">
        <label className="block text-xs font-semibold text-ink mb-2">
          Pola & Motif Daun Pintu (Visual Grid)
        </label>
        <MotifGridPicker
          value={config.doorPattern || "classic-panel"}
          onChange={(pattern: DoorPattern) => apply({ doorPattern: pattern }, "door-motif")}
        />
      </div>

      <ControlGroup label="Material Kusen">
        <Segmented
          label="Kusen"
          options={[
            { value: "wood", label: "Kayu Solid (Jati/Sungkai)" },
            { value: "aluminum", label: "Aluminium Anodized" },
          ]}
          value={config.frameMaterial || "wood"}
          onChange={(v) => apply({ frameMaterial: v as "wood" | "aluminum" })}
        />
      </ControlGroup>

      <ControlGroup label="Kombinasi Jendela Samping">
        <Segmented
          label="Jendela Samping"
          options={[
            { value: "none", label: "Tanpa" },
            { value: "left", label: "Samping Kiri" },
            { value: "right", label: "Samping Kanan" },
            { value: "both", label: "Kiri & Kanan" },
          ]}
          value={config.hasSideWindow || "none"}
          onChange={(v) => apply({ hasSideWindow: v as "none" | "left" | "right" | "both" })}
        />
      </ControlGroup>

      <ControlGroup label="Handle Pintu">
        <Segmented label="Handle" options={HANDLE_OPTIONS} value={config.handle} onChange={(v) => apply({ handle: v })} />
      </ControlGroup>
    </div>
  );
}
