import type { BuildResult, DesignConfig, MaterialOption } from "@/lib/configurator/types";

interface Props {
  result: BuildResult;
  config: DesignConfig;
  materials: MaterialOption[];
  className?: string;
  title?: string;
}

const INK = "#1d2320";
const INK_MUTED = "#7a8178";
const WALL_FILL = "#dcd5c7";
const ACCENT_RED = "#c2562f";

/** Gambar Denah Arsitektural 2D Tampak Atas (Top Plan View) dengan busur ayunan pintu (Swing Arc). */
export function PlanSvg({ result, config, materials, className, title }: Props) {
  const W = config.width;
  const D = config.depth;
  const isDoorKind = !config.columns || config.columns.length === 0;

  // Viewport setup
  const padL = 36;
  const padR = 36;
  const padT = 36;
  const padB = 44;
  const vbW = W + padL + padR;
  const vbH = (isDoorKind ? D + 70 : D + 50) + padT + padB;

  const originX = padL + W / 2;
  const originY = padT + D / 2;

  // Koordinat denah: X = originX + x, Y = originY - z (z depan mengarah ke bawah layar)
  const mapX = (x: number) => originX + x;
  const mapY = (z: number) => originY - z;

  const openDeg = config.doorOpenAngle || 0;
  const openRad = (openDeg * Math.PI) / 180;

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className={className || "w-full max-h-[380px] select-none"}
        role="img"
        aria-label={title || "Denah tampak atas dan ayunan pintu"}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="plan-wall-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke={INK_MUTED} strokeWidth="0.8" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. Gambar Potongan Dinding Arsitektural (Kiri & Kanan) */}
        {isDoorKind && (
          <>
            <rect
              x={mapX(-W / 2 - 25)}
              y={mapY(D / 2)}
              width={25}
              height={D}
              fill="url(#plan-wall-hatch)"
              stroke={INK}
              strokeWidth={1.2}
            />
            <rect
              x={mapX(W / 2)}
              y={mapY(D / 2)}
              width={25}
              height={D}
              fill="url(#plan-wall-hatch)"
              stroke={INK}
              strokeWidth={1.2}
            />
          </>
        )}

        {/* 2. Gambar Rangka Carcass / Kusen Tampak Atas */}
        <rect
          x={mapX(-W / 2)}
          y={mapY(D / 2)}
          width={W}
          height={D}
          fill="#ebe5d8"
          stroke={INK}
          strokeWidth={1.4}
        />

        {/* Divider Kolom Lemari */}
        {result.columns.map((col, idx) => (
          <line
            key={`col-line-${idx}`}
            x1={mapX(col.x0)}
            x2={mapX(col.x0)}
            y1={mapY(D / 2)}
            y2={mapY(-D / 2)}
            stroke={INK_MUTED}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        ))}

        {/* 3. Daun Pintu & Busur Ayunan (Swing Arc) */}
        {result.columns.map((col, idx) => {
          const colW = col.x1 - col.x0;
          if (config.doors === "none") return null;

          const isSliding = config.doors === "sliding";
          if (isSliding) {
            // Pintu Geser (Garis Ganda)
            return (
              <g key={`slide-leaf-${idx}`}>
                <line
                  x1={mapX(col.x0)}
                  x2={mapX(col.x1)}
                  y1={mapY(D / 2 + 1.5)}
                  y2={mapY(D / 2 + 1.5)}
                  stroke={ACCENT_RED}
                  strokeWidth={2.4}
                />
              </g>
            );
          }

          // Pintu Berengsel (Hinged Door with Arc)
          const hingeLeft = idx % 2 === 0;
          const hingeX = hingeLeft ? col.x0 : col.x1;
          const leafLen = colW > 60 ? colW / 2 : colW;
          const leafAngle = hingeLeft ? openRad : Math.PI - openRad;

          // Ujung daun pintu saat terbuka
          const endX = hingeX + Math.cos(leafAngle) * leafLen;
          const endZ = D / 2 + Math.sin(leafAngle) * leafLen;

          // Path busur ayunan (Swing Arc Dotted Line)
          const startX = hingeLeft ? hingeX + leafLen : hingeX - leafLen;
          const startZ = D / 2;

          const arcPath = `M ${mapX(startX)} ${mapY(startZ)} A ${leafLen} ${leafLen} 0 0 ${
            hingeLeft ? 0 : 1
          } ${mapX(endX)} ${mapY(endZ)}`;

          return (
            <g key={`swing-leaf-${idx}`}>
              {/* Busur Ayunan Pintu */}
              <path
                d={arcPath}
                fill="none"
                stroke={ACCENT_RED}
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />
              {/* Titik Engsel */}
              <circle cx={mapX(hingeX)} cy={mapY(D / 2)} r={2.4} fill={INK} />
              {/* Daun Pintu Terbuka */}
              <line
                x1={mapX(hingeX)}
                y1={mapY(D / 2)}
                x2={mapX(endX)}
                y2={mapY(endZ)}
                stroke={INK}
                strokeWidth={2.5}
              />
            </g>
          );
        })}

        {/* 4. Garis Ukuran Dimensi (Dimension Annotations) */}
        {/* Dimensi Lebar Total W (Atas) */}
        <g transform={`translate(0, ${mapY(D / 2) - 16})`}>
          <line x1={mapX(-W / 2)} x2={mapX(W / 2)} y1={0} y2={0} stroke={INK} strokeWidth={1} />
          <line x1={mapX(-W / 2)} x2={mapX(-W / 2)} y1={-4} y2={4} stroke={INK} strokeWidth={1} />
          <line x1={mapX(W / 2)} x2={mapX(W / 2)} y1={-4} y2={4} stroke={INK} strokeWidth={1} />
          <text
            x={originX}
            y={-5}
            textAnchor="middle"
            fill={INK}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {W} cm
          </text>
        </g>

        {/* Dimensi Kedalaman Total D (Samping Kiri) */}
        <g transform={`translate(${mapX(-W / 2) - 16}, 0)`}>
          <line x1={0} x2={0} y1={mapY(D / 2)} y2={mapY(-D / 2)} stroke={INK} strokeWidth={1} />
          <line x1={-4} x2={4} y1={mapY(D / 2)} y2={mapY(D / 2)} stroke={INK} strokeWidth={1} />
          <line x1={-4} x2={4} y1={mapY(-D / 2)} y2={mapY(-D / 2)} stroke={INK} strokeWidth={1} />
          <text
            x={-6}
            y={originY}
            textAnchor="middle"
            transform={`rotate(-90 ${-6} ${originY})`}
            fill={INK}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {D} cm
          </text>
        </g>

        {/* Keterangan Teknis Denah */}
        <text
          x={originX}
          y={vbH - 12}
          textAnchor="middle"
          fill={INK_MUTED}
          fontSize="9"
          fontFamily="monospace"
        >
          DENAH ARSITEKTURAL & BENTANG AYUNAN PINTU ({openDeg}°)
        </text>
      </svg>
    </div>
  );
}
