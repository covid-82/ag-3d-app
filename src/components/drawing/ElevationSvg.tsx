import type { BuildResult, DesignConfig, MaterialOption, PartRole } from "@/lib/configurator/types";

interface Props {
  result: BuildResult;
  config: DesignConfig;
  materials: MaterialOption[];
  annotate?: boolean;
  className?: string;
  title?: string;
}

const INK = "#1d2320";

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** Gambar teknis tampak depan, dibuat dari model yang sama dengan 3D. Dipakai untuk kartu katalog dan cadangan bila WebGL tidak tersedia. */
export function ElevationSvg({ result, config, materials, annotate = true, className, title }: Props) {
  const hex = (slug: string) => materials.find((m) => m.slug === slug)?.hex ?? "#cfc7b8";
  const fills: Record<PartRole, string> = {
    body: hex(config.bodyMaterial),
    front: hex(config.frontMaterial),
    shade: shade(hex(config.bodyMaterial), 0.8),
    hardware: "#2a2b2b",
    glass: "rgba(190,215,225,0.55)",
    rattan: "#d4a76a",
    accent: "#3a3a3a",
  };

  const W = config.width;
  const H = config.height;
  const padL = 14;
  const padR = annotate ? 30 : 14;
  const padT = 14;
  const padB = annotate ? 34 : 14;
  const vbW = W + padL + padR;
  const vbH = H + padT + padB;
  const X = (x: number) => padL + x + W / 2;
  const Y = (y: number) => padT + H - y;

  // Gambar dari belakang ke depan
  const parts = [...result.parts].sort((a, b) => a.pos[2] + a.size[2] / 2 - (b.pos[2] + b.size[2] / 2));

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label={title ?? "Gambar tampak depan"}
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1={0} x2={vbW} y1={Y(0)} y2={Y(0)} stroke={INK} strokeWidth={0.6} opacity={0.5} />
      {parts.map((p) => {
        if (p.role === "hardware" && p.shape === "box" && p.pos[2] < 0) return null;
        const x = X(p.pos[0] - p.size[0] / 2);
        const y = Y(p.pos[1] + p.size[1] / 2);
        return (
          <rect
            key={p.id}
            x={x}
            y={y}
            width={p.size[0]}
            height={p.size[1]}
            fill={fills[p.role]}
            stroke={INK}
            strokeWidth={p.role === "hardware" ? 0.2 : 0.55}
            strokeOpacity={p.role === "hardware" ? 0.5 : 0.85}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {annotate && (
        <g fill={INK} fontFamily="var(--f-mono), monospace" fontSize={Math.max(5, Math.min(W, H) * 0.045)}>
          <path
            d={`M${X(-W / 2)} ${Y(0) + 14} H${X(W / 2)} M${X(-W / 2)} ${Y(0) + 10} v8 M${X(W / 2)} ${Y(0) + 10} v8`}
            stroke={INK}
            strokeWidth={0.7}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <text x={X(0)} y={Y(0) + 27} textAnchor="middle">
            {W} cm
          </text>
          <path
            d={`M${X(W / 2) + 14} ${Y(0)} V${Y(H)} M${X(W / 2) + 10} ${Y(0)} h8 M${X(W / 2) + 10} ${Y(H)} h8`}
            stroke={INK}
            strokeWidth={0.7}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <text x={X(W / 2) + 18} y={Y(H / 2)} dominantBaseline="middle" transform={`rotate(90 ${X(W / 2) + 18} ${Y(H / 2)})`} textAnchor="middle">
            {H} cm
          </text>
        </g>
      )}
    </svg>
  );
}
