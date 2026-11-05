"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import QRCode from "qrcode";

// ─── Query Format & Dynamic URL Detection ───────────────────────────────────
function getDefaultUrl(): string {
  if (typeof window !== "undefined" && window.location.origin && window.location.origin !== "null") {
    return window.location.origin + window.location.pathname;
  }
  return "https://kaushalboii.github.io/cruseqr/";
}

function sanitizeUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return getDefaultUrl();
  const trimmed = rawUrl.trim();
  if (
    trimmed === "https://icqr.com/" ||
    trimmed === "https://icqr.com" ||
    trimmed === "http://icqr.com/" ||
    trimmed === "http://icqr.com" ||
    trimmed === "https://cruseqr.com/" ||
    trimmed === "https://cruseqr.com" ||
    trimmed === "http://cruseqr.com/" ||
    trimmed === "http://cruseqr.com" ||
    trimmed === ""
  ) {
    return getDefaultUrl();
  }
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function parseQ(raw: string | null) {
  if (!raw) return { url: getDefaultUrl(), season: 0, palette: 0 };
  try {
    const d = atob(raw);
    let s = 0;
    let p = 0;
    let target = d;

    if (d.length >= 2 && !isNaN(Number(d[0])) && !isNaN(Number(d[1]))) {
      s = Math.min(2, Math.max(0, parseInt(d[0]) || 0));
      p = Math.min(5, Math.max(0, parseInt(d[1]) || 0));
      target = d.slice(2);
    }
    return {
      url: sanitizeUrl(target),
      season: s,
      palette: p,
    };
  } catch {
    return { url: getDefaultUrl(), season: 0, palette: 0 };
  }
}

function encodeQ(url: string, season: number, palette: number) {
  try { return btoa(`${season}${palette}${url}`); } catch { return ""; }
}

// ─── Seasons Config ──────────────────────────────────────────────────────────
const SEASONS = [
  {
    id: "spring",
    name: "Spring",
    skyColor: 0xfaf4ec,
    groundColor: 0xeae3d8,
    groundEdge: 0xd8cebf,
    grassColor: 0x76a035,
    trunkColor: 0x4a2e1b,
    leafColor: 0xf48fb1,
    leafAlt: 0xffccd5,
    leafHighlight: 0xffffff,
    finderColor: 0x4d8c28,
    particleColor: 0xffb7c5,
    weatherType: "blossom"
  },
  {
    id: "summer",
    name: "Summer",
    skyColor: 0xf7f5eb,
    groundColor: 0xe8e2d4,
    groundEdge: 0xd6cbb8,
    grassColor: 0x4e8d24,
    trunkColor: 0x3e2716,
    leafColor: 0x4caf50,
    leafAlt: 0x81c784,
    leafHighlight: 0xc8e6c9,
    finderColor: 0x2e7d32,
    particleColor: 0x81c784,
    weatherType: "leaves"
  },
  {
    id: "autumn",
    name: "Autumn",
    skyColor: 0xf7f0e6,
    groundColor: 0xe5dcce,
    groundEdge: 0xd2c4b0,
    grassColor: 0x9b8332,
    trunkColor: 0x432818,
    leafColor: 0xd84315,
    leafAlt: 0xf4511e,
    leafHighlight: 0xffb74d,
    finderColor: 0xbf360c,
    particleColor: 0xef6c00,
    weatherType: "rain"
  }
];

const PALETTES = [
  { name: "Sakura Pink", color: "#f48fb1", hex: 0xf48fb1 },
  { name: "Wisteria Lavender", color: "#b39ddb", hex: 0xb39ddb },
  { name: "Crimson Maple", color: "#e57373", hex: 0xe57373 },
  { name: "Golden Gingko", color: "#ffb74d", hex: 0xffb74d },
  { name: "Cerulean Sky", color: "#64b5f6", hex: 0x64b5f6 },
  { name: "Emerald Pine", color: "#81c784", hex: 0x81c784 }
];

function makeRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function MagicTreeCanvas() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");

  const initial = useMemo(() => parseQ(qParam), [qParam]);

  const [url, setUrl] = useState<string>(initial.url);
  const [urlInput, setUrlInput] = useState<string>(initial.url);
  const [season, setSeason] = useState<number>(initial.season);
  const [palette, setPalette] = useState<number>(initial.palette);
  const [qrMode, setQrMode] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const platGroupRef = useRef<THREE.Group | null>(null);
  const qrGroupRef = useRef<THREE.Group | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const fallenPetalsRef = useRef<THREE.Group | null>(null);
  const particleRef = useRef<THREE.Points | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const cam = useRef({
    pitch: 0.78, yaw: 0.785, dist: 38,
    tPitch: 0.78, tYaw: 0.785, tDist: 38,
    dragging: false, px: 0, py: 0
  });
  const treeScaleRef = useRef(1.0);

  // ── Web Audio Nature Sound Chime ───────────────────────────────────────────
  const playOrganicChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const note = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch {}
  }, [soundEnabled]);

  // ── Init Three.js Scene ────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const s = SEASONS[season];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(s.skyColor);
    scene.fog = new THREE.FogExp2(s.skyColor, 0.012);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, 0.5, 200);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;
    el.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    // Natural Sun & Atmosphere Lighting
    const amb = new THREE.AmbientLight(0xfffdf7, 0.95);
    scene.add(amb);

    const hemi = new THREE.HemisphereLight(0xfff7ed, 0xdcd5c5, 0.5);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff5e6, 1.55);
    sun.position.set(24, 46, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left   = -24; sun.shadow.camera.right  = 24;
    sun.shadow.camera.top    =  24; sun.shadow.camera.bottom = -24;
    sun.shadow.camera.near   = 0.5; sun.shadow.camera.far    = 140;
    sun.shadow.bias = -0.0002;
    scene.add(sun);

    const rootGroup = new THREE.Group(); scene.add(rootGroup);
    const platGroup = new THREE.Group(); rootGroup.add(platGroup);
    const qrGroup   = new THREE.Group(); rootGroup.add(qrGroup);
    const treeGroup = new THREE.Group(); rootGroup.add(treeGroup);
    const fallenPetals = new THREE.Group(); rootGroup.add(fallenPetals);

    rootGroupRef.current = rootGroup;
    platGroupRef.current = platGroup;
    qrGroupRef.current   = qrGroup;
    treeGroupRef.current = treeGroup;
    fallenPetalsRef.current = fallenPetals;

    // Controls
    const onDown = (e: MouseEvent) => {
      cam.current.dragging = true;
      cam.current.px = e.clientX;
      cam.current.py = e.clientY;
    };
    const onMove = (e: MouseEvent) => {
      if (!cam.current.dragging || qrMode) return;
      cam.current.tYaw -= (e.clientX - cam.current.px) * 0.0065;
      cam.current.tPitch = Math.max(0.15, Math.min(1.4, cam.current.tPitch + (e.clientY - cam.current.py) * 0.0065));
      cam.current.px = e.clientX;
      cam.current.py = e.clientY;
    };
    const onUp = () => { cam.current.dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (qrMode) return;
      cam.current.tDist = Math.max(20, Math.min(65, cam.current.tDist + e.deltaY * 0.035));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        cam.current.dragging = true;
        cam.current.px = e.touches[0].clientX;
        cam.current.py = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!cam.current.dragging || e.touches.length !== 1 || qrMode) return;
      cam.current.tYaw -= (e.touches[0].clientX - cam.current.px) * 0.0085;
      cam.current.tPitch = Math.max(0.15, Math.min(1.4, cam.current.tPitch + (e.touches[0].clientY - cam.current.py) * 0.0085));
      cam.current.px = e.touches[0].clientX;
      cam.current.py = e.touches[0].clientY;
    };

    const onResize = () => {
      if (!el || !camera || !renderer) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    window.addEventListener("resize", onResize);

    // ── Animation Loop ───────────────────────────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const c = cam.current;

      c.pitch += (c.tPitch - c.pitch) * 0.085;
      c.yaw   += (c.tYaw   - c.yaw)   * 0.085;
      c.dist  += (c.tDist  - c.dist)  * 0.085;

      camera.position.set(
        c.dist * Math.sin(c.pitch) * Math.sin(c.yaw),
        c.dist * Math.cos(c.pitch),
        c.dist * Math.sin(c.pitch) * Math.cos(c.yaw)
      );
      camera.lookAt(0, 1.6, 0);

      // Smooth Botanical Tree Transition
      const targetScale = qrMode ? 0.0001 : 1.0;
      treeScaleRef.current += (targetScale - treeScaleRef.current) * 0.12;

      if (treeGroupRef.current) {
        treeGroupRef.current.scale.set(treeScaleRef.current, treeScaleRef.current, treeScaleRef.current);
        treeGroupRef.current.visible = treeScaleRef.current > 0.01;

        if (!qrMode && treeScaleRef.current > 0.75) {
          const swayZ = Math.sin(t * 1.05) * 0.012 + Math.sin(t * 2.3) * 0.005;
          const swayX = Math.cos(t * 0.8) * 0.01 + Math.cos(t * 1.8) * 0.004;
          treeGroupRef.current.rotation.z = swayZ;
          treeGroupRef.current.rotation.x = swayX;
        }
      }

      if (fallenPetalsRef.current) {
        fallenPetalsRef.current.visible = !qrMode;
      }

      // Dynamic Weather Particles Animation
      if (particleRef.current) {
        const pts = particleRef.current.geometry.attributes.position.array as Float32Array;
        const n = pts.length / 3;
        const isRain = SEASONS[season]?.weatherType === "rain";
        for (let i = 0; i < n; i++) {
          if (isRain) {
            pts[i * 3 + 1] -= 0.32;
            pts[i * 3]     += 0.025;
          } else {
            pts[i * 3]     += Math.sin(t * 0.75 + i * 1.1) * 0.018 + 0.008;
            pts[i * 3 + 1] -= 0.026 + Math.sin(t * 0.6 + i) * 0.006;
            pts[i * 3 + 2] += Math.cos(t * 0.65 + i * 1.4) * 0.016;
          }

          if (pts[i * 3 + 1] < 0) {
            pts[i * 3]     = (Math.random() - 0.5) * 32;
            pts[i * 3 + 1] = 20 + Math.random() * 6;
            pts[i * 3 + 2] = (Math.random() - 0.5) * 32;
          }
        }
        particleRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── Rebuild Scene Content when Settings Change ─────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const platGroup = platGroupRef.current;
    const qrGroup = qrGroupRef.current;
    const treeGroup = treeGroupRef.current;
    const fallenGroup = fallenPetalsRef.current;
    if (!scene || !platGroup || !qrGroup || !treeGroup || !fallenGroup) return;

    const s = SEASONS[season];
    const dataColorHex = PALETTES[palette]?.hex ?? s.leafColor;

    scene.background = new THREE.Color(s.skyColor);
    if (scene.fog) (scene.fog as THREE.FogExp2).color.set(s.skyColor);

    const clearGroup = (g: THREE.Group) => {
      while (g.children.length > 0) {
        const ch = g.children[0] as THREE.Mesh;
        ch.geometry?.dispose();
        if (ch.material) {
          if (Array.isArray(ch.material)) ch.material.forEach(m => m.dispose());
          else ch.material.dispose();
        }
        g.remove(ch);
      }
    };

    // 1. Build QR Pavement Mosaic
    clearGroup(qrGroup);
    let qrSize = 29;
    try {
      const qrData = QRCode.create(url, { errorCorrectionLevel: "M" });
      const { modules } = qrData;
      qrSize = modules.size;
      const bs = 0.54;
      const offset = (qrSize * bs) / 2;

      const isFinder = (r: number, c: number) => {
        if (r < 7 && c < 7) return true;
        if (r < 7 && c >= qrSize - 7) return true;
        if (r >= qrSize - 7 && c < 7) return true;
        return false;
      };

      let finderCount = 0, dataCount = 0, lightCount = 0;
      for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
          if (modules.get(r, c)) {
            if (isFinder(r, c)) finderCount++;
            else dataCount++;
          } else {
            lightCount++;
          }
        }
      }

      const blockH = 0.28;
      const geo = new THREE.BoxGeometry(bs * 0.94, blockH, bs * 0.94);

      const lightMat  = new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.92 });
      const finderMat = new THREE.MeshStandardMaterial({ color: s.finderColor, roughness: 0.55, flatShading: true });
      const dataMat   = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.55, flatShading: true });

      const lightMesh  = new THREE.InstancedMesh(geo, lightMat, lightCount);
      const finderMesh = new THREE.InstancedMesh(geo, finderMat, finderCount);
      const dataMesh   = new THREE.InstancedMesh(geo, dataMat, dataCount);

      lightMesh.receiveShadow = true;
      finderMesh.castShadow   = true; finderMesh.receiveShadow = true;
      dataMesh.castShadow     = true; dataMesh.receiveShadow   = true;

      const dummy = new THREE.Object3D();
      let fIdx = 0, dIdx = 0, lIdx = 0;

      for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
          const x = c * bs - offset + bs / 2;
          const z = r * bs - offset + bs / 2;
          dummy.position.set(x, blockH / 2, z);
          dummy.updateMatrix();

          if (modules.get(r, c)) {
            if (isFinder(r, c)) finderMesh.setMatrixAt(fIdx++, dummy.matrix);
            else dataMesh.setMatrixAt(dIdx++, dummy.matrix);
          } else {
            lightMesh.setMatrixAt(lIdx++, dummy.matrix);
          }
        }
      }

      lightMesh.instanceMatrix.needsUpdate  = true;
      finderMesh.instanceMatrix.needsUpdate = true;
      dataMesh.instanceMatrix.needsUpdate   = true;

      qrGroup.add(lightMesh);
      qrGroup.add(finderMesh);
      qrGroup.add(dataMesh);
    } catch {}

    // 2. Build Sculpted Platform with Beveled Edge & Wildflowers
    clearGroup(platGroup);
    const bs = 0.54;
    const platSize = (qrSize + 4) * bs;
    const half = platSize / 2;

    const slabGeo = new THREE.BoxGeometry(platSize, 1.25, platSize);
    const slabMat = new THREE.MeshStandardMaterial({ color: s.groundColor, roughness: 0.85, metalness: 0.03 });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = -0.625;
    slab.receiveShadow = true;
    platGroup.add(slab);

    const baseGeo = new THREE.BoxGeometry(platSize + 0.45, 0.4, platSize + 0.45);
    const baseMat = new THREE.MeshStandardMaterial({ color: s.groundEdge, roughness: 0.94 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.85;
    base.receiveShadow = true;
    platGroup.add(base);

    const grassMat = new THREE.MeshStandardMaterial({ color: s.grassColor, roughness: 0.68, flatShading: true });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const rng = makeRng(8821);

    const addGrassClump = (gx: number, gz: number) => {
      const clump = new THREE.Group();
      clump.position.set(gx, 0.01, gz);
      const blades = 4 + Math.floor(rng() * 4);
      for (let b = 0; b < blades; b++) {
        const h = 0.4 + rng() * 0.55;
        const bladeGeo = new THREE.ConeGeometry(0.06 + rng() * 0.04, h, 4);
        const blade = new THREE.Mesh(bladeGeo, grassMat);
        blade.position.set((rng()-0.5)*0.22, h/2, (rng()-0.5)*0.22);
        blade.rotation.z = (rng()-0.5)*0.45;
        blade.rotation.x = (rng()-0.5)*0.45;
        clump.add(blade);
      }
      if (rng() > 0.6) {
        const flGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const fl = new THREE.Mesh(flGeo, flowerMat);
        fl.position.set((rng()-0.5)*0.18, 0.48, (rng()-0.5)*0.18);
        clump.add(fl);
      }
      platGroup.add(clump);
    };

    const edgeDist = half - 0.45;
    for (let x = -edgeDist; x <= edgeDist; x += 0.95) {
      if (rng() > 0.2) addGrassClump(x, -edgeDist);
      if (rng() > 0.2) addGrassClump(x,  edgeDist);
    }
    for (let z = -edgeDist; z <= edgeDist; z += 0.95) {
      if (rng() > 0.2) addGrassClump(-edgeDist, z);
      if (rng() > 0.2) addGrassClump( edgeDist, z);
    }

    // 3. Build Hyper-Realistic Botanical Tree
    clearGroup(treeGroup);
    clearGroup(fallenGroup);

    const treeRng = makeRng(1337);
    const barkMat = new THREE.MeshStandardMaterial({
      color: s.trunkColor,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true
    });

    const leafClusterPositions: { x: number; y: number; z: number; scale: number; tier: number }[] = [];

    // Root buttresses
    const numRoots = 5;
    for (let ri = 0; ri < numRoots; ri++) {
      const rAngle = (ri / numRoots) * Math.PI * 2 + (treeRng() - 0.5) * 0.4;
      const rLen = 1.1 + treeRng() * 0.5;
      const rootGeo = new THREE.CylinderGeometry(0.18, 0.38, rLen, 6);
      const rootMesh = new THREE.Mesh(rootGeo, barkMat);
      rootMesh.position.set(Math.cos(rAngle) * (rLen * 0.38), 0.18, Math.sin(rAngle) * (rLen * 0.38));
      rootMesh.rotation.y = -rAngle;
      rootMesh.rotation.z = 0.55 + treeRng() * 0.15;
      rootMesh.castShadow = true; rootMesh.receiveShadow = true;
      treeGroup.add(rootMesh);
    }

    // Segmented curved trunk
    const trunkPoints = [
      { x: 0.00, y: 0.00, z: 0.00, r: 0.62 },
      { x: 0.12, y: 0.95, z: 0.08, r: 0.52 },
      { x: -0.08, y: 1.90, z: 0.14, r: 0.44 },
      { x: 0.06, y: 2.85, z: -0.06, r: 0.38 },
      { x: 0.00, y: 3.80, z: 0.00, r: 0.32 }
    ];

    for (let si = 0; si < trunkPoints.length - 1; si++) {
      const p1 = trunkPoints[si];
      const p2 = trunkPoints[si + 1];
      const segLen = Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2) + Math.pow(p2.z-p1.z,2));
      const segGeo = new THREE.CylinderGeometry(p2.r, p1.r, segLen, 8);
      const segMesh = new THREE.Mesh(segGeo, barkMat);
      segMesh.position.set((p1.x + p2.x)/2, (p1.y + p2.y)/2, (p1.z + p2.z)/2);

      const dir = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z).normalize();
      segMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      segMesh.castShadow = true; segMesh.receiveShadow = true;
      treeGroup.add(segMesh);
    }

    // Branching scaffold
    const addBough = (ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, len: number, rad: number, depth: number) => {
      const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      dx /= mag; dy /= mag; dz /= mag;

      const ex = ox + dx * len, ey = oy + dy * len, ez = oz + dz * len;

      const bGeo = new THREE.CylinderGeometry(rad * 0.72, rad, len, 6);
      const bMesh = new THREE.Mesh(bGeo, barkMat);
      bMesh.position.set((ox + ex)/2, (oy + ey)/2, (oz + ez)/2);
      bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(dx,dy,dz).normalize());
      bMesh.castShadow = true; bMesh.receiveShadow = true;
      treeGroup.add(bMesh);

      if (depth >= 2 || len < 1.1) {
        const clustersAtTip = 24 + Math.floor(treeRng() * 16);
        for (let k = 0; k < clustersAtTip; k++) {
          leafClusterPositions.push({
            x: ex + (treeRng() - 0.5) * 1.5,
            y: ey + (treeRng() - 0.45) * 1.3,
            z: ez + (treeRng() - 0.5) * 1.5,
            scale: 0.32 + treeRng() * 0.35,
            tier: depth
          });
        }
      }

      if (depth >= 4 || rad < 0.06) return;

      const childCount = depth === 0 ? 5 : (treeRng() > 0.3 ? 3 : 2);
      for (let c = 0; c < childCount; c++) {
        const spread = 0.45 + treeRng() * 0.35;
        const angle = (c / childCount) * Math.PI * 2 + (treeRng() - 0.5) * 0.5;
        const ndx = dx + Math.cos(angle) * spread;
        const ndy = dy + 0.15 + treeRng() * 0.32;
        const ndz = dz + Math.sin(angle) * spread;
        addBough(ex, ey, ez, ndx, ndy, ndz, len * (0.68 + treeRng()*0.08), rad * (0.64 + treeRng()*0.05), depth + 1);
      }
    };

    const forkOrigin = trunkPoints[trunkPoints.length - 1];
    for (let pi = 0; pi < 5; pi++) {
      const angle = (pi / 5) * Math.PI * 2 + (treeRng() - 0.5) * 0.4;
      const ldx = Math.cos(angle) * 0.72;
      const ldy = 0.55 + treeRng() * 0.35;
      const ldz = Math.sin(angle) * 0.72;
      addBough(forkOrigin.x, forkOrigin.y, forkOrigin.z, ldx, ldy, ldz, 2.2 + treeRng() * 0.5, 0.28, 0);
    }

    addBough(trunkPoints[2].x, trunkPoints[2].y, trunkPoints[2].z, -0.65, 0.45, 0.4, 1.8, 0.22, 1);
    addBough(trunkPoints[3].x, trunkPoints[3].y, trunkPoints[3].z, 0.55, 0.5, -0.5, 1.7, 0.2, 1);

    // Crown Dome & Weeping Sprays
    for (let v = 0; v < 750; v++) {
      const theta = treeRng() * Math.PI * 2;
      const phi   = treeRng() * Math.PI * 0.58;
      const rad   = 1.2 + treeRng() * 3.4;
      leafClusterPositions.push({
        x: Math.sin(phi) * Math.cos(theta) * rad,
        y: 5.6 + Math.cos(phi) * (rad * 0.7) + (treeRng() - 0.5) * 1.1,
        z: Math.sin(phi) * Math.sin(theta) * rad,
        scale: 0.35 + treeRng() * 0.35,
        tier: 5
      });
    }

    for (let w = 0; w < 420; w++) {
      const wTheta = treeRng() * Math.PI * 2;
      const wRad   = 2.8 + treeRng() * 2.2;
      leafClusterPositions.push({
        x: Math.cos(wTheta) * wRad,
        y: 3.4 + treeRng() * 2.4,
        z: Math.sin(wTheta) * wRad,
        scale: 0.28 + treeRng() * 0.32,
        tier: 6
      });
    }

    // Mid mantle clusters
    for (let m = 0; m < 380; m++) {
      const mTheta = treeRng() * Math.PI * 2;
      const mRad = 1.0 + treeRng() * 2.8;
      leafClusterPositions.push({
        x: Math.cos(mTheta) * mRad,
        y: 4.2 + (treeRng() - 0.5) * 1.8,
        z: Math.sin(mTheta) * mRad,
        scale: 0.30 + treeRng() * 0.30,
        tier: 4
      });
    }

    // Instanced Micro-Petal Blossom Cloud (3,500+ elements)
    const totalClusters = leafClusterPositions.length;
    const clusterGeo = new THREE.DodecahedronGeometry(0.24, 0);
    const blossomMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.02,
      flatShading: true
    });

    const blossomMesh = new THREE.InstancedMesh(clusterGeo, blossomMat, totalClusters);
    blossomMesh.castShadow = true; blossomMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const baseCol = new THREE.Color(dataColorHex);
    const altCol  = new THREE.Color(s.leafAlt);
    const highCol = new THREE.Color(s.leafHighlight);

    for (let idx = 0; idx < totalClusters; idx++) {
      const lp = leafClusterPositions[idx];
      dummy.position.set(lp.x, lp.y, lp.z);
      dummy.rotation.set(treeRng() * Math.PI, treeRng() * Math.PI, treeRng() * Math.PI);
      dummy.scale.set(lp.scale, lp.scale * (0.8 + treeRng() * 0.35), lp.scale);
      dummy.updateMatrix();
      blossomMesh.setMatrixAt(idx, dummy.matrix);

      const blend = treeRng();
      const cCol = new THREE.Color();
      if (blend < 0.55) cCol.copy(baseCol).lerp(altCol, treeRng() * 0.45);
      else if (blend < 0.85) cCol.copy(altCol).lerp(baseCol, treeRng() * 0.35);
      else cCol.copy(highCol).lerp(altCol, 0.4);

      blossomMesh.setColorAt(idx, cCol);
    }

    blossomMesh.instanceMatrix.needsUpdate = true;
    if (blossomMesh.instanceColor) blossomMesh.instanceColor.needsUpdate = true;
    treeGroup.add(blossomMesh);

    // Scattered fallen petals
    const numFallen = 90;
    const petalGeo = new THREE.CircleGeometry(0.12, 5);
    const petalMat = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.5, side: THREE.DoubleSide });
    const fallenMesh = new THREE.InstancedMesh(petalGeo, petalMat, numFallen);
    const fDummy = new THREE.Object3D();

    for (let f = 0; f < numFallen; f++) {
      const fRad = 0.8 + treeRng() * 4.2;
      const fAng = treeRng() * Math.PI * 2;
      fDummy.position.set(Math.cos(fAng) * fRad, 0.29, Math.sin(fAng) * fRad);
      fDummy.rotation.set(-Math.PI / 2, 0, treeRng() * Math.PI * 2);
      const sc = 0.5 + treeRng() * 0.6;
      fDummy.scale.set(sc, sc, sc);
      fDummy.updateMatrix();
      fallenMesh.setMatrixAt(f, fDummy.matrix);
    }
    fallenMesh.instanceMatrix.needsUpdate = true;
    fallenGroup.add(fallenMesh);

    // 4. Floating Weather Particles
    if (particleRef.current) scene.remove(particleRef.current);
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]     = (Math.random() - 0.5) * 32;
      pos[i*3 + 1] = Math.random() * 26 + 1;
      pos[i*3 + 2] = (Math.random() - 0.5) * 32;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: s.particleColor, size: 0.44, transparent: true, opacity: 0.88 });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);
    particleRef.current = pMesh;

  }, [url, season, palette]);

  // ── Mode Switch: 3D Tree vs Top-Down QR Scanner ────────────────────────────
  useEffect(() => {
    const c = cam.current;
    if (qrMode) {
      c.tPitch = 0.001;
      c.tYaw   = 0.0;
      c.tDist  = 34;
    } else {
      c.tPitch = 0.78;
      c.tYaw   = 0.785;
      c.tDist  = 38;
    }
  }, [qrMode]);

  // ── Share URL ──────────────────────────────────────────────────────────────
  const shareUrl = useMemo(() => {
    const q = encodeQ(url, season, palette);
    if (typeof window !== "undefined") return `${window.location.origin}/tree?q=${q}`;
    return `/tree?q=${q}`;
  }, [url, season, palette]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrl(sanitizeUrl(trimmed));
    playOrganicChime();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#f7f3eb] font-sans">
      {/* Subtle Sky Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(255,250,242,0.45)_0%,rgba(240,233,220,0.7)_100%)]" />

      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onClick={() => { setQrMode(v => !v); playOrganicChime(); }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto cursor-pointer inline-flex items-center gap-2.5 bg-white/75 border border-white/90 px-3.5 py-1.5 rounded-full backdrop-blur-xl shadow-sm hover:bg-white hover:-translate-y-0.5 transition">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#c27d53] to-[#e09f67] flex items-center justify-center text-white text-xs font-bold">
            🌸
          </div>
          <span className="font-extrabold text-sm text-stone-900 tracking-tight">CruseQR</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c27d53] bg-[#c27d53]/10 px-2 py-0.5 rounded-full">
            Magic Tree
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="w-9 h-9 rounded-full bg-white/75 border border-white/90 backdrop-blur-xl flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition shadow-sm hover:-translate-y-0.5"
            title="About Magic Tree"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="w-9 h-9 rounded-full bg-white/75 border border-white/90 backdrop-blur-xl flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-white transition shadow-sm hover:-translate-y-0.5"
            title="Share Magic Tree"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Center Floating Action Pill */}
      <button
        onClick={() => { setQrMode(v => !v); playOrganicChime(); }}
        className="absolute bottom-[146px] left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full bg-white/85 border border-white/95 text-stone-700 text-xs font-semibold shadow-lg backdrop-blur-2xl hover:bg-white hover:text-stone-900 hover:-translate-y-0.5 transition active:scale-95 flex items-center gap-2 whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
        <span>{qrMode ? "Tap to see 3D Magic Tree" : "Tap tree to view QR code"}</span>
      </button>

      {/* QR Scanner Reticle Overlay */}
      {qrMode && (
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center animate-fade-in">
          <div className="w-[280px] h-[280px] relative rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#c27d53] rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#c27d53] rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#c27d53] rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#c27d53] rounded-br-xl" />
          </div>
        </div>
      )}

      {/* Bottom Contemporary Floating Glass Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-36px)] max-w-[480px] z-20 flex flex-col gap-2.5">
        <div className="bg-white/80 border border-white/95 rounded-2xl p-3 shadow-xl backdrop-blur-2xl flex flex-col gap-2.5">
          {/* URL Input Row */}
          <div className="flex items-center gap-2 bg-[#f4ede3] rounded-xl px-3 py-1 border border-stone-200/40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUrlSubmit()}
              placeholder="Enter any URL..."
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-stone-800 placeholder-stone-400 truncate"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3.5 py-1.5 rounded-lg bg-[#c27d53] hover:bg-[#b06c42] text-white text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>Generate</span>
            </button>
          </div>

          {/* Season Segmented Slider & Sound */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#eae3d6] p-1 rounded-xl">
              {SEASONS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setSeason(i); playOrganicChime(); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${season === i ? "bg-white text-stone-900 font-bold shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
                >
                  <span>{i === 0 ? "🌸" : i === 1 ? "🌿" : "🍁"}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSoundEnabled(v => !v);
                if (!soundEnabled) playOrganicChime();
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${soundEnabled ? "bg-[#c27d53] text-white" : "bg-[#eae3d6] text-stone-600 hover:bg-[#dfd7c9]"}`}
              title={soundEnabled ? "Nature Sounds: ON" : "Nature Sounds: OFF"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {soundEnabled && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
              </svg>
            </button>
          </div>

          {/* Palette Swatches */}
          <div className="flex items-center justify-center gap-3 pt-0.5">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setPalette(i); playOrganicChime(); }}
                title={p.name}
                style={{ background: p.color }}
                className={`w-5 h-5 rounded-full transition-transform ${palette === i ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-stone-900" : "hover:scale-110 opacity-90"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">Share Magic Tree</h3>
              <button onClick={() => setShareOpen(false)} className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center font-bold">✕</button>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Anyone who opens this link will explore your interactive living botanical tree and scannable QR pavement.
            </p>
            <div className="flex items-center gap-2">
              <input readOnly value={shareUrl} className="flex-1 px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700 truncate" />
              <button
                onClick={copyLink}
                className="px-4 py-2 rounded-xl bg-[#c27d53] hover:bg-[#b06c42] text-white text-xs font-bold transition active:scale-95"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setInfoOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-stone-900">About CruseQR Magic Tree</h3>
              <button onClick={() => setInfoOpen(false)} className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center font-bold">✕</button>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              A state-of-the-art interactive 3D procedural botanical tree engineered directly into a fully scannable QR code mosaic.
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#c27d53]/10 text-[#c27d53] flex items-center justify-center text-xs flex-shrink-0">🌳</span>
                <div><strong>Botanical Branch Skeleton:</strong> Multi-tiered organic boughs, buttress roots, and natural weeping cherry blossom branches.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#c27d53]/10 text-[#c27d53] flex items-center justify-center text-xs flex-shrink-0">✨</span>
                <div><strong>1,600+ Blossom Clusters:</strong> Layered petal cloud with botanical color depth, translucency, and fallen petals.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#c27d53]/10 text-[#c27d53] flex items-center justify-center text-xs flex-shrink-0">📱</span>
                <div><strong>Dual Camera Modes:</strong> Seamlessly glide between 3D isometric view and overhead top-down view for 100% camera scanning.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#c27d53]/10 text-[#c27d53] flex items-center justify-center text-xs flex-shrink-0">🍃</span>
                <div><strong>Harmonic Wind Physics:</strong> Realistic multi-frequency wind swaying and dynamic floating seasonal particles.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
