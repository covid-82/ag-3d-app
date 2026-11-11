"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { BuildResult, DesignConfig, MaterialOption, Part } from "@/lib/configurator/types";
import { getProceduralMaterialTexture } from "@/lib/three/procedural-textures";
import {
  Ruler,
  DoorOpen,
  DoorClosed,
  RotateCcw,
  Camera,
  Eye,
  UserCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Props {
  result: BuildResult;
  config: DesignConfig;
  materials: MaterialOption[];
  mode?: "editor" | "showcase";
  isInteractiveDefault?: boolean;
  onOpenAngleChange?: (angle: number) => void;
  captureRef?: React.MutableRefObject<(() => string | null) | null>;
  className?: string;
}

interface AnimatedObject {
  group: THREE.Group;
  type: "hinge" | "slide";
  pivot?: [number, number, number];
  targetAngle?: number;
  slideOffset?: [number, number, number];
}

export function Viewport({
  result,
  config,
  materials,
  mode = "editor",
  isInteractiveDefault = false,
  onOpenAngleChange,
  captureRef,
  className,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const furnitureGroupRef = useRef<THREE.Group | null>(null);
  const dimensionGroupRef = useRef<THREE.Group | null>(null);
  const humanGroupRef = useRef<THREE.Group | null>(null);
  const animatedObjectsRef = useRef<AnimatedObject[]>([]);

  const [isInteractive, setIsInteractive] = useState(
    mode === "editor" || Boolean(isInteractiveDefault)
  );
  const [showDimensions, setShowDimensions] = useState(mode === "editor");
  const [showHuman, setShowHuman] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(config.doorOpenAngle > 10);
  const [hudLabels, setHudLabels] = useState<
    { id: string; text: string; x: number; y: number; visible: boolean }[]
  >([]);

  // Toggle buka/tutup pintu
  const handleToggleDoors = () => {
    const next = !doorsOpen;
    setDoorsOpen(next);
    if (onOpenAngleChange) {
      onOpenAngleChange(next ? 90 : 0);
    }
  };

  // Preset Kamera
  const setCameraPreset = (preset: "perspective" | "front" | "side" | "top") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const maxDim = Math.max(config.width, config.height, config.depth) / 100;
    const targetY = (result.totalHeight || config.height) / 200;

    ctrl.target.set(0, targetY, 0);

    if (preset === "front") {
      cam.position.set(0, targetY, maxDim * 2.5);
    } else if (preset === "side") {
      cam.position.set(maxDim * 2.5, targetY, 0);
    } else if (preset === "top") {
      cam.position.set(0, maxDim * 3.2, 0.01);
    } else {
      cam.position.set(maxDim * 1.5, targetY + maxDim * 0.8, maxDim * 1.9);
    }
    ctrl.update();
  };

  // Reset View
  const handleResetCamera = () => {
    setCameraPreset("perspective");
  };

  // High-Res Snapshot Export
  useEffect(() => {
    if (!captureRef) return;
    captureRef.current = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL("image/png");
    };
  }, [captureRef]);

  // Inisialisasi Three.js Canvas
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f6f4f0");
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(2.4, 1.8, 2.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const initialTouch = mode === "editor" || isInteractiveDefault ? "none" : "pan-y";
    renderer.domElement.style.touchAction = initialTouch;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls (Optimized for Mobile Touch)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = mode === "showcase";
    controls.autoRotateSpeed = 1.4;
    controls.minDistance = 0.6;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI / 2 + 0.04; // Jangan tembus ke bawah lantai
    controls.target.set(0, 0.9, 0);
    controls.enabled = mode === "editor" || Boolean(isInteractiveDefault);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xdcebf5, 0.9);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const softFloorLight = new THREE.DirectionalLight(0xffffff, 0.4);
    softFloorLight.position.set(0, -3, 0);
    scene.add(softFloorLight);

    // 6. Ground Shadow Plane & Studio Backdrop
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(16, 32, 0xdcd6c8, 0xeee9de);
    grid.position.y = -0.002;
    scene.add(grid);

    // Holders
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);
    furnitureGroupRef.current = furnitureGroup;

    const dimensionGroup = new THREE.Group();
    scene.add(dimensionGroup);
    dimensionGroupRef.current = dimensionGroup;

    const humanGroup = new THREE.Group();
    scene.add(humanGroup);
    humanGroupRef.current = humanGroup;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Proyeksikan 3D HUD coordinates ke layar 2D
      if (sceneRef.current && cameraRef.current && mountRef.current) {
        updateScreenHud(cameraRef.current, mountRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sinkronisasi status interaktivitas (Touch Guard pada mode showcase)
  useEffect(() => {
    const isControlActive = mode === "editor" || Boolean(isInteractiveDefault) || isInteractive;
    if (controlsRef.current) {
      controlsRef.current.enabled = isControlActive;
    }
    if (rendererRef.current?.domElement) {
      rendererRef.current.domElement.style.touchAction = isControlActive ? "none" : "pan-y";
    }
  }, [mode, isInteractiveDefault, isInteractive]);

  // Update Mesh & Animasi saat config/result berubah
  useEffect(() => {
    const furnitureGroup = furnitureGroupRef.current;
    const humanGroup = humanGroupRef.current;
    if (!furnitureGroup || !humanGroup) return;

    // Bersihkan objek lama
    while (furnitureGroup.children.length > 0) {
      const child = furnitureGroup.children[0];
      furnitureGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
    while (humanGroup.children.length > 0) {
      humanGroup.remove(humanGroup.children[0]);
    }
    animatedObjectsRef.current = [];

    // Resolve material definitions
    const bodyMatOpt = materials.find((m) => m.slug === config.bodyMaterial);
    const frontMatOpt = materials.find((m) => m.slug === config.frontMaterial);

    const bodyHex = bodyMatOpt?.hex || "#9C6B3B";
    const frontHex = frontMatOpt?.hex || "#B88E58";
    const hardwareHex = config.hardware === "brass" ? "#b08a4a" : config.hardware === "steel" ? "#9ca3af" : "#262626";

    // PBR Textures
    const bodyTex = getProceduralMaterialTexture("teak", bodyHex, "#5C3D28");
    const frontTex = getProceduralMaterialTexture(
      config.doorPattern === "rattan" ? "rattan" : "teak",
      frontHex,
      "#7A4F26"
    );
    const rattanTex = getProceduralMaterialTexture("rattan", "#D1B38A", "#6E5033");

    // Three.js Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bodyHex),
      map: bodyTex || undefined,
      roughness: 0.52,
      metalness: 0.05,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(frontHex),
      map: frontTex || undefined,
      roughness: 0.55,
      metalness: 0.05,
    });

    const rattanMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e2d2b8"),
      map: rattanTex || undefined,
      roughness: 0.85,
      metalness: 0.02,
    });

    const shadeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bodyHex).multiplyScalar(0.78),
      roughness: 0.75,
      metalness: 0.05,
    });

    const hardwareMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hardwareHex),
      roughness: config.hardware === "brass" ? 0.32 : 0.45,
      metalness: config.hardware === "brass" ? 0.85 : 0.75,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#dbeef5"),
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.82,
    });

    // Bangun setiap Part ke Three.js
    const openAngle = config.doorOpenAngle || 0;
    const openRad = (openAngle * Math.PI) / 180;

    result.parts.forEach((p) => {
      // Satuan cm ke meter
      const sx = p.size[0] / 100;
      const sy = p.size[1] / 100;
      const sz = p.size[2] / 100;
      const px = p.pos[0] / 100;
      const py = p.pos[1] / 100;
      const pz = p.pos[2] / 100;

      let geo: THREE.BufferGeometry;
      if (p.shape === "rod") {
        geo = new THREE.CylinderGeometry(sy / 2, sy / 2, sx, 16);
        geo.rotateZ(Math.PI / 2);
      } else {
        geo = new THREE.BoxGeometry(sx, sy, sz);
      }

      let mat: THREE.Material = bodyMaterial;
      if (p.role === "front") mat = p.pattern === "rattan" ? rattanMaterial : frontMaterial;
      else if (p.role === "rattan") mat = rattanMaterial;
      else if (p.role === "hardware") mat = hardwareMaterial;
      else if (p.role === "glass") mat = glassMaterial;
      else if (p.role === "shade") mat = shadeMaterial;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = p.role !== "glass";
      mesh.receiveShadow = true;

      // Handle Motion (Hinge atau Slide)
      if (p.motion) {
        const holder = new THREE.Group();

        if (p.motion.type === "hinge") {
          const pivotM: [number, number, number] = [
            p.motion.pivot[0] / 100,
            p.motion.pivot[1] / 100,
            p.motion.pivot[2] / 100,
          ];
          holder.position.set(pivotM[0], py, pivotM[2]);
          mesh.position.set(px - pivotM[0], 0, pz - pivotM[2]);
          holder.add(mesh);

          // Rotasi bukaan engsel
          const targetRot = p.motion.angle * (openRad / 1.57);
          holder.rotation.y = targetRot;

          furnitureGroup.add(holder);
          animatedObjectsRef.current.push({
            group: holder,
            type: "hinge",
            targetAngle: p.motion.angle,
          });
        } else if (p.motion.type === "slide") {
          const offsetZ = (p.motion.offset[2] / 100) * (openAngle > 5 ? 1 : 0);
          mesh.position.set(px, py, pz + offsetZ);
          furnitureGroup.add(mesh);
        }
      } else {
        mesh.position.set(px, py, pz);
        furnitureGroup.add(mesh);
      }
    });

    // Human Scale Silhouette Reference
    const humanH = 1.72; // tinggi orang 172cm
    const humanW = 0.44;
    const humanGeo = new THREE.PlaneGeometry(humanW, humanH);
    const humanMat = new THREE.MeshBasicMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    const humanMesh = new THREE.Mesh(humanGeo, humanMat);
    humanMesh.position.set(-config.width / 200 - 0.35, humanH / 2, 0);
    humanGroup.add(humanMesh);
  }, [result, config, materials]);

  // Update 3D HUD Screen Coordinates
  const updateScreenHud = (camera: THREE.Camera, mount: HTMLDivElement) => {
    if (!showDimensions) {
      setHudLabels([]);
      return;
    }

    const labels: { id: string; text: string; x: number; y: number; visible: boolean }[] = [];
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    const D = config.depth / 100;

    // Dimensi per Sekat / Kolom (hanya tampilkan detail internal jika rak terbuka atau pintu dibuka agar HUD rapi)
    const shelvesAreVisible = config.doors === "none" || (config.doorOpenAngle || 0) > 15;

    if (result.bayHuds && shelvesAreVisible) {
      result.bayHuds.forEach((bay) => {
        const bx = bay.x / 100;

        // Label Lebar Kolom jika ada lebih dari 1 kolom
        if (result.bayHuds && result.bayHuds.length > 1) {
          const v = new THREE.Vector3(bx, (bay.bottomY + 4) / 100, D / 2 + 0.05);
          v.project(camera);
          if (v.z < 1) {
            labels.push({
              id: `bay-w-${bay.colIndex}`,
              text: `${bay.widthCm} cm`,
              x: ((v.x + 1) * w) / 2,
              y: ((-v.y + 1) * h) / 2,
              visible: true,
            });
          }
        }

        // Label Tinggi Tiap Celah Rak (hanya saat pintu dibuka)
        if (bay.shelfHeightsCm && bay.shelfHeightsCm.length > 1) {
          const spanH = (bay.topY - bay.bottomY) / 100;
          const stepH = spanH / bay.shelfHeightsCm.length;
          bay.shelfHeightsCm.forEach((sh, sIdx) => {
            const sy = bay.bottomY / 100 + stepH * (sIdx + 0.5);
            const sv = new THREE.Vector3(bx, sy, D / 2 + 0.05);
            sv.project(camera);
            if (sv.z < 1) {
              labels.push({
                id: `shelf-${bay.colIndex}-${sIdx}`,
                text: `${sh} cm`,
                x: ((sv.x + 1) * w) / 2,
                y: ((-sv.y + 1) * h) / 2,
                visible: true,
              });
            }
          });
        }
      });
    }

    setHudLabels(labels);
  };

  return (
    <div
      className={`relative w-full h-full bg-[#f6f4f0] select-none overflow-hidden ${
        className || ""
      }`}
    >
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D HUD Dynamic Dimension Labels Overlay */}
      {showDimensions && mode === "editor" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {hudLabels.map((l) => (
            <div
              key={l.id}
              style={{
                transform: `translate3d(${l.x}px, ${l.y}px, 0) translate(-50%, -50%)`,
              }}
              className="absolute pointer-events-none transition-transform duration-75 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono tracking-tight shadow-md backdrop-blur-xs whitespace-nowrap border border-white/20"
            >
              {l.text}
            </div>
          ))}

          {/* Dimensi Utama (Pojok Kiri Bawah Canvas) */}
          <div className="absolute bottom-16 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-line shadow-sm text-xs font-mono text-ink">
            <span className="font-semibold text-moss">
              {config.width} × {result.totalHeight || config.height} × {config.depth} cm
            </span>
            <span className="text-ink-mute ml-2">
              (~{result.stats.woodVolumeM3} m³ · {result.stats.estimatedWeightKg} kg)
            </span>
          </div>
        </div>
      )}

      {/* Touch Guard Overlay for Showcase Mode on Mobile */}
      {mode === "showcase" && !isInteractive && (
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsInteractive(true);
            }}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper/95 backdrop-blur-md border border-line text-xs font-medium text-ink shadow-sm hover:border-clay hover:text-clay active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-clay" />
            <span>Ketuk untuk memutar 3D</span>
          </button>
        </div>
      )}

      {/* Interactive Mode Badge for Showcase */}
      {mode === "showcase" && isInteractive && !isInteractiveDefault && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper/95 backdrop-blur-md border border-line text-[11px] font-medium text-moss shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
            <span>3D Aktif</span>
          </div>
          <button
            type="button"
            onClick={() => setIsInteractive(false)}
            className="px-2.5 py-1 rounded-md bg-paper-2 border border-line text-[11px] font-medium text-ink hover:bg-paper-3 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Kunci kembali agar bisa scroll halaman"
          >
            Selesai
          </button>
        </div>
      )}

      {/* Floating Viewport Toolbar (Mobile Ergonomic Control Pill) */}
      {mode === "editor" && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Preset Kamera */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-line shadow-sm pointer-events-auto">
          <button
            type="button"
            onClick={() => setCameraPreset("perspective")}
            className="px-2 py-1 text-xs rounded-lg font-medium text-ink hover:bg-paper-2 active:scale-95 transition-all"
            title="Kamera 3D Perspektif"
          >
            3D
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("front")}
            className="px-2 py-1 text-xs rounded-lg font-medium text-ink hover:bg-paper-2 active:scale-95 transition-all"
            title="Kamera Tampak Depan"
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset("top")}
            className="px-2 py-1 text-xs rounded-lg font-medium text-ink hover:bg-paper-2 active:scale-95 transition-all"
            title="Kamera Tampak Atas (Denah)"
          >
            Atas
          </button>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-line shadow-sm pointer-events-auto">
          {/* Buka/Tutup Pintu */}
          <button
            type="button"
            onClick={handleToggleDoors}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
              doorsOpen
                ? "bg-moss text-white shadow-xs"
                : "text-ink hover:bg-paper-2"
            }`}
            title={doorsOpen ? "Tutup Pintu" : "Buka Pintu Lemari"}
          >
            {doorsOpen ? <DoorOpen className="w-4 h-4" /> : <DoorClosed className="w-4 h-4" />}
            <span className="hidden sm:inline">{doorsOpen ? "Terbuka" : "Buka"}</span>
          </button>

          {/* Toggle HUD Dimensi */}
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`p-2 rounded-lg transition-all active:scale-95 ${
              showDimensions
                ? "bg-moss/10 text-moss"
                : "text-ink-mute hover:bg-paper-2"
            }`}
            title="Tampilkan / Sembunyikan Dimensi"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Toggle Siluet Manusia */}
          <button
            type="button"
            onClick={() => {
              const next = !showHuman;
              setShowHuman(next);
              if (humanGroupRef.current) humanGroupRef.current.visible = next;
            }}
            className={`p-2 rounded-lg transition-all active:scale-95 ${
              showHuman
                ? "bg-moss/10 text-moss"
                : "text-ink-mute hover:bg-paper-2"
            }`}
            title="Siluet Skala Manusia"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          {/* Reset Kamera */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-2 rounded-lg text-ink-mute hover:text-ink hover:bg-paper-2 transition-all active:scale-95"
            title="Reset Sudut Kamera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
