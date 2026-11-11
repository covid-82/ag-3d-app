import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getProceduralMaterialTexture(
  grainType: string,
  primaryHex: string,
  secondaryHex: string
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const cacheKey = `${grainType}-${primaryHex}-${secondaryHex}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 512, 512);

  if (grainType === "teak" || grainType === "walnut" || grainType === "oak" || grainType === "sungkai") {
    // Base gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, primaryHex);
    grad.addColorStop(0.5, secondaryHex);
    grad.addColorStop(1, primaryHex);
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, 0, 512, 512);

    // Draw organic wood fiber streaks
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = secondaryHex;
    for (let i = 0; i < 160; i++) {
      const y = (i / 160) * 512;
      ctx.lineWidth = (i % 5 === 0) ? 2.2 : 1.0;
      ctx.beginPath();
      ctx.moveTo(0, y);
      const waveAmp = grainType === "walnut" ? 10 : grainType === "teak" ? 7 : 4;
      const freq = 0.015 + (i % 7) * 0.003;
      for (let x = 0; x <= 512; x += 16) {
        const offset = Math.sin(x * freq + i * 0.4) * waveAmp;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }

    // Fine wood pores
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#1E140C";
    for (let p = 0; p < 450; p++) {
      const px = (p * 73) % 512;
      const py = (p * 139) % 512;
      ctx.fillRect(px, py, 10 + (p % 18), 1.2);
    }
  } else if (grainType === "rattan") {
    // Octagonal Indonesian Rattan Cane Webbing (Anyaman Rotan Mata Ayam)
    ctx.fillStyle = "#4A3823"; // dark backing shadow
    ctx.fillRect(0, 0, 512, 512);

    const step = 32;
    ctx.strokeStyle = primaryHex;
    ctx.lineWidth = 6.5;
    ctx.globalAlpha = 0.95;

    // Horizontal and vertical strips
    for (let i = 0; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }

    // Diagonal woven cane strips
    ctx.strokeStyle = secondaryHex;
    ctx.lineWidth = 4.5;
    for (let i = -512; i <= 1024; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 512, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 512);
      ctx.lineTo(i + 512, 0);
      ctx.stroke();
    }
  } else if (grainType === "glass") {
    // Fluted Ribbed Glass vertical ridges
    for (let x = 0; x < 512; x += 16) {
      const g = ctx.createLinearGradient(x, 0, x + 16, 0);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.45, primaryHex);
      g.addColorStop(0.85, secondaryHex);
      g.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.65;
      ctx.fillRect(x, 0, 16, 512);
    }
  } else if (grainType === "metal") {
    // Brushed metallic micro-lines
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = secondaryHex;
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
