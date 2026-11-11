import { PANEL, type KindSpec } from "../kinds";
import type { BuildResult, ColumnBounds, DesignConfig, Motion } from "../types";
import { addHandle, box, finalize, newBuilder, type Builder } from "./shared";

const { t, front: ft } = PANEL;

/** Generator Pintu & Kusen Parametrik Arsitektural (Door Studio style). */
export function buildDoor(spec: KindSpec, c: DesignConfig): BuildResult {
  const b = newBuilder();
  const W = c.width;
  const H = c.height;
  const wallT = c.wallThickness || 14;
  const frameT = 5.0; // lebar muka profil kusen (cm)
  const zB = -wallT / 2;
  const zF = wallT / 2;
  const openDeg = c.doorOpenAngle || 0;
  const openRad = (openDeg * Math.PI) / 180;

  // 1. Kusen Pintu Utama
  const jambLeftX = -W / 2;
  const jambRightX = W / 2;
  b.parts.push(
    // Kusen Tiang Kiri
    box("jamb-l", "body", [jambLeftX, jambLeftX + frameT, 0, H, zB, zF]),
    // Kusen Tiang Kanan
    box("jamb-r", "body", [jambRightX - frameT, jambRightX, 0, H, zB, zF]),
    // Kusen Ambang Atas
    box("jamb-top", "body", [jambLeftX, jambRightX, H - frameT, H, zB, zF]),
  );

  // 2. Daun Pintu
  const doorW = W - frameT * 2 - 0.8;
  const doorH = H - frameT - 1.2;
  const doorX0 = jambLeftX + frameT + 0.4;
  const doorX1 = doorX0 + doorW;
  const doorY0 = 0.6;
  const doorY1 = doorY0 + doorH;
  const doorZ = zF - ft - 1.2; // sedikit masuk di coakan sponeng kusen

  const pivotX = doorX0 + 0.5;
  const motion: Motion = {
    type: "hinge",
    pivot: [pivotX, 0, doorZ + ft / 2],
    angle: -(1.55 * (openRad / 1.57 || 1)),
  };

  const extra = { motion, pattern: c.doorPattern };
  const pattern = c.doorPattern;

  if (pattern === "rattan") {
    const fw = 8.5;
    b.parts.push(
      box("door-fl", "front", [doorX0, doorX0 + fw, doorY0, doorY1, doorZ, doorZ + ft], extra),
      box("door-fr", "front", [doorX1 - fw, doorX1, doorY0, doorY1, doorZ, doorZ + ft], extra),
      box("door-ft", "front", [doorX0 + fw, doorX1 - fw, doorY1 - fw, doorY1, doorZ, doorZ + ft], extra),
      box("door-fb", "front", [doorX0 + fw, doorX1 - fw, doorY0, doorY0 + fw, doorZ, doorZ + ft], extra),
      box("door-rattan", "rattan", [doorX0 + fw, doorX1 - fw, doorY0 + fw, doorY1 - fw, doorZ + 0.4, doorZ + ft - 0.4], extra),
    );
  } else if (pattern === "glass-strip") {
    const stripW = Math.min(18, doorW * 0.25);
    const sideW = (doorW - stripW) / 2;
    b.parts.push(
      box("door-sl", "front", [doorX0, doorX0 + sideW, doorY0, doorY1, doorZ, doorZ + ft], extra),
      box("door-sr", "front", [doorX1 - sideW, doorX1, doorY0, doorY1, doorZ, doorZ + ft], extra),
      box("door-gl", "glass", [doorX0 + sideW, doorX1 - sideW, doorY0, doorY1, doorZ + ft / 2 - 0.3, doorZ + ft / 2 + 0.3], extra),
    );
  } else if (pattern === "classic-panel") {
    const midX = (doorX0 + doorX1) / 2;
    const border = 7;
    // Base door plate
    b.parts.push(box("door-base", "front", [doorX0, doorX1, doorY0, doorY1, doorZ, doorZ + ft * 0.75], extra));
    // 2 Panel klasik timbul
    const p1Y0 = doorY0 + border;
    const p1Y1 = (doorY0 + doorY1) * 0.42;
    const p2Y0 = (doorY0 + doorY1) * 0.48;
    const p2Y1 = doorY1 - border;
    b.parts.push(
      box("panel-bot", "front", [doorX0 + border, doorX1 - border, p1Y0, p1Y1, doorZ + ft * 0.75, doorZ + ft], extra),
      box("panel-top", "front", [doorX0 + border, doorX1 - border, p2Y0, p2Y1, doorZ + ft * 0.75, doorZ + ft], extra),
    );
  } else {
    // Polos / Flush
    b.parts.push(box("door-leaf", "front", [doorX0, doorX1, doorY0, doorY1, doorZ, doorZ + ft], extra));
  }

  b.tally.hingedDoors++;

  // Handle Pintu Batang Panjang Elegan
  addHandle(b, {
    id: "door-handle",
    style: c.handle,
    kind: "door",
    x0: doorX0,
    x1: doorX1,
    yb: doorY0,
    yt: doorY1,
    zFront: doorZ + ft,
    edge: "right",
    motion,
  });

  // 3. Jendela Samping Opsional (Side Windows)
  if (c.hasSideWindow && c.hasSideWindow !== "none") {
    const winW = c.sideWindowWidth || 45;
    const addSideWindow = (isLeft: boolean) => {
      const wx0 = isLeft ? jambLeftX - winW : jambRightX;
      const wx1 = isLeft ? jambLeftX : jambRightX + winW;
      const idPrefix = isLeft ? "win-l" : "win-r";

      // Kusen jendela
      b.parts.push(
        box(`${idPrefix}-outer`, "body", [isLeft ? wx0 : wx1 - frameT, isLeft ? wx0 + frameT : wx1, 0, H, zB, zF]),
        box(`${idPrefix}-top`, "body", [wx0, wx1, H - frameT, H, zB, zF]),
        box(`${idPrefix}-bot`, "body", [wx0, wx1, 0, frameT, zB, zF]),
        // Kaca Jendela
        box(`${idPrefix}-glass`, "glass", [wx0 + frameT, wx1 - frameT, frameT, H - frameT, zB + wallT / 2 - 0.25, zB + wallT / 2 + 0.25]),
      );
    };

    if (c.hasSideWindow === "left" || c.hasSideWindow === "both") addSideWindow(true);
    if (c.hasSideWindow === "right" || c.hasSideWindow === "both") addSideWindow(false);
  }

  const columns: ColumnBounds[] = [{ x0: doorX0, x1: doorX1 }];
  b.bayHuds.push({
    colIndex: 0,
    x: (doorX0 + doorX1) / 2,
    bottomY: doorY0,
    topY: doorY1,
    widthCm: Number(doorW.toFixed(1)),
    shelfHeightsCm: [Number(doorH.toFixed(1))],
  });

  return finalize(b, columns, 0, H);
}
