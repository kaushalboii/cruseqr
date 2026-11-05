"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import QRCode from "qrcode";

// ─── Query Format & URL Handling ─────────────────────────────────────────────
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
    trimmed === "https://cruseqr.com/" ||
    trimmed === "https://cruseqr.com" ||
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

// ─── Seasons Config (Exact ICQR Palette) ──────────────────────────────────────
const SEASONS = [
  {
    id: "spring", name: "Spring",
    groundColor: 0xe6e0d4, groundEdge: 0xb5ada0,
    trunkColor: 0x543c2c,
    leafColor: 0xf2a4b8, leafAlt: 0xf8bcd0,
    particleColor: 0xf7b7cb,
    grassColor: 0x6bb343, finderColor: 0x4da832,
    weatherType: "petals"
  },
  {
    id: "summer", name: "Summer",
    groundColor: 0xe2ded2, groundEdge: 0xa8a194,
    trunkColor: 0x483222,
    leafColor: 0x5fa838, leafAlt: 0x76c24c,
    particleColor: 0x70be46,
    grassColor: 0x458b22, finderColor: 0x3d821e,
    weatherType: "leaves"
  },
  {
    id: "autumn", name: "Autumn",
    groundColor: 0xe4ded3, groundEdge: 0xa59e92,
    trunkColor: 0x4c3321,
    leafColor: 0xf09c2a, leafAlt: 0xf6b948,
    particleColor: 0x948e84,
    grassColor: 0xd49b28, finderColor: 0xc48618,
    weatherType: "rain"
  }
];

const PALETTES = [
  { name: "Sakura Pink",  hex: 0xf2a4b8, color: "#f2a4b8" },
  { name: "Purple",       hex: 0x9b6bcf, color: "#9b6bcf" },
  { name: "Berry Red",    hex: 0xe54b4b, color: "#e54b4b" },
  { name: "Golden Amber", hex: 0xf0a500, color: "#f0a500" },
  { name: "Sky Blue",     hex: 0x3b82f6, color: "#3b82f6" },
  { name: "Slate Teal",   hex: 0x2d7a6b, color: "#2d7a6b" }
];

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export default function MagicTreeCanvas() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");
  const init = useMemo(() => parseQ(qParam), [qParam]);

  const [url, setUrl]           = useState(init.url);
  const [urlInput, setUrlInput] = useState(init.url);
  const [season, setSeason]     = useState(init.season);
  const [palette, setPalette]   = useState(init.palette);
  const [qrMode, setQrMode]     = useState(false); // false = 3D tree, true = flat top-down scanner
  const [muted, setMuted]       = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied]     = useState(false);

  const containerRef  = useRef<HTMLDivElement>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const camRef        = useRef<THREE.PerspectiveCamera | null>(null);
  const rendRef       = useRef<THREE.WebGLRenderer | null>(null);
  const platGroupRef  = useRef<THREE.Group | null>(null);
  const qrGroupRef    = useRef<THREE.Group | null>(null);
  const treeGroupRef  = useRef<THREE.Group | null>(null);
  const particleRef   = useRef<THREE.Points | null>(null);
  const clockRef      = useRef(new THREE.Clock());
  const rafRef        = useRef<number>(0);
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const audioSrcRef   = useRef<AudioBufferSourceNode | null>(null);

  // Smooth camera orbit
  const cam = useRef({
    pitch: 0.76, yaw: 0.785, dist: 40,
    tPitch: 0.76, tYaw: 0.785, tDist: 40,
    dragging: false, px: 0, py: 0
  });

  // ── Init Three.js Scene ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendRef.current = renderer;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f1e7);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 500);
    camRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xfffdf7, 0.9));
    const sun = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sun.position.set(30, 48, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24;   sun.shadow.camera.bottom = -24;
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 140;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    // Groups
    const platGroup = new THREE.Group(); scene.add(platGroup); platGroupRef.current = platGroup;
    const qrGroup   = new THREE.Group(); scene.add(qrGroup);   qrGroupRef.current   = qrGroup;
    const treeGroup = new THREE.Group(); scene.add(treeGroup); treeGroupRef.current = treeGroup;

    // Orbit controls
    const c = cam.current;
    const onDown = (e: MouseEvent) => { c.dragging = true; c.px = e.clientX; c.py = e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!c.dragging) return;
      c.tYaw   -= (e.clientX - c.px) * 0.007;
      c.tPitch  = Math.max(0.18, Math.min(1.4, c.tPitch + (e.clientY - c.py) * 0.007));
      c.px = e.clientX; c.py = e.clientY;
    };
    const onUp = () => { c.dragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      c.tDist = Math.max(22, Math.min(65, c.tDist + e.deltaY * 0.03));
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) { c.dragging = true; c.px = e.touches[0].clientX; c.py = e.touches[0].clientY; }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!c.dragging || e.touches.length !== 1) return;
      c.tYaw   -= (e.touches[0].clientX - c.px) * 0.009;
      c.tPitch  = Math.max(0.18, Math.min(1.4, c.tPitch + (e.touches[0].clientY - c.py) * 0.009));
      c.px = e.touches[0].clientX; c.py = e.touches[0].clientY;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);

    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth, h = containerRef.current.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();

      // Smooth camera lerp
      c.pitch += (c.tPitch - c.pitch) * 0.09;
      c.yaw   += (c.tYaw   - c.yaw)   * 0.09;
      c.dist  += (c.tDist  - c.dist)  * 0.09;

      camera.position.set(
        c.dist * Math.sin(c.pitch) * Math.sin(c.yaw),
        c.dist * Math.cos(c.pitch),
        c.dist * Math.sin(c.pitch) * Math.cos(c.yaw)
      );
      camera.lookAt(0, 1.8, 0);

      // Animate particles
      if (particleRef.current) {
        const pts = particleRef.current.geometry.attributes.position.array as Float32Array;
        const n = pts.length / 3;
        for (let i = 0; i < n; i++) {
          pts[i * 3]     += Math.sin(t * 0.5 + i * 1.3) * 0.012;
          pts[i * 3 + 1] -= 0.032 + Math.sin(t * 0.4 + i) * 0.008;
          pts[i * 3 + 2] += Math.cos(t * 0.5 + i * 1.7) * 0.012;
          if (pts[i * 3 + 1] < 0) {
            pts[i * 3]     = (Math.random() - 0.5) * 30;
            pts[i * 3 + 1] = 18 + Math.random() * 6;
            pts[i * 3 + 2] = (Math.random() - 0.5) * 30;
          }
        }
        particleRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Tree sway
      if (treeGroupRef.current && treeGroupRef.current.visible) {
        treeGroupRef.current.rotation.y = Math.sin(t * 0.6) * 0.018;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
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
    if (!scene || !platGroup || !qrGroup || !treeGroup) return;

    const s = SEASONS[season];
    const dataColorHex = PALETTES[palette]?.hex ?? s.leafColor;

    // Helper: Clear Group
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

    // 1. Build QR Pavement
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
      const geo = new THREE.BoxGeometry(bs * 0.95, blockH, bs * 0.95);

      const lightMat  = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.9 });
      const finderMat = new THREE.MeshStandardMaterial({ color: s.finderColor, roughness: 0.65, flatShading: true });
      const dataMat   = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.65, flatShading: true });

      const lightMesh  = new THREE.InstancedMesh(geo, lightMat, lightCount);
      const finderMesh = new THREE.InstancedMesh(geo, finderMat, finderCount);
      const dataMesh   = new THREE.InstancedMesh(geo, dataMat, dataCount);

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

      lightMesh.instanceMatrix.needsUpdate = true;
      finderMesh.instanceMatrix.needsUpdate = true;
      dataMesh.instanceMatrix.needsUpdate = true;

      qrGroup.add(lightMesh);
      qrGroup.add(finderMesh);
      qrGroup.add(dataMesh);
    } catch {}

    // 2. Build Platform & Grass
    clearGroup(platGroup);
    const bs = 0.54;
    const platSize = (qrSize + 4) * bs;
    const half = platSize / 2;

    const slabGeo = new THREE.BoxGeometry(platSize, 1.2, platSize);
    const slabMat = new THREE.MeshStandardMaterial({ color: s.groundColor, roughness: 0.88 });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = -0.6;
    platGroup.add(slab);

    const rimGeo = new THREE.BoxGeometry(platSize + 0.3, 0.4, platSize + 0.3);
    const rimMat = new THREE.MeshStandardMaterial({ color: s.groundEdge, roughness: 0.95 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -0.8;
    platGroup.add(rim);

    // Perimeter grass
    const grassMat = new THREE.MeshStandardMaterial({ color: s.grassColor, roughness: 0.7, flatShading: true });
    const rng = makeRng(1234);
    const edgeDist = half - 0.4;

    const addGrass = (gx: number, gz: number) => {
      const clump = new THREE.Group();
      clump.position.set(gx, 0.01, gz);
      const blades = 3 + Math.floor(rng() * 3);
      for (let b = 0; b < blades; b++) {
        const h = 0.45 + rng() * 0.55;
        const bladeGeo = new THREE.ConeGeometry(0.08 + rng() * 0.05, h, 4);
        const bladeMesh = new THREE.Mesh(bladeGeo, grassMat);
        bladeMesh.position.set((rng()-0.5)*0.25, h/2, (rng()-0.5)*0.25);
        bladeMesh.rotation.z = (rng()-0.5)*0.4;
        bladeMesh.rotation.x = (rng()-0.5)*0.4;
        clump.add(bladeMesh);
      }
      platGroup.add(clump);
    };

    for (let x = -edgeDist; x <= edgeDist; x += 1.0) {
      if (rng() > 0.25) addGrass(x, -edgeDist);
      if (rng() > 0.25) addGrass(x,  edgeDist);
    }
    for (let z = -edgeDist; z <= edgeDist; z += 1.0) {
      if (rng() > 0.25) addGrass(-edgeDist, z);
      if (rng() > 0.25) addGrass( edgeDist, z);
    }

    // 3. Build Procedural Tree
    clearGroup(treeGroup);
    const trunkMat = new THREE.MeshStandardMaterial({ color: s.trunkColor, roughness: 0.9, flatShading: true });
    const leafMatA = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.6, flatShading: true });
    const leafMatB = new THREE.MeshStandardMaterial({ color: s.leafAlt, roughness: 0.6, flatShading: true });

    const trunkH = 3.6;
    const trunkGeo = new THREE.CylinderGeometry(0.48, 0.72, trunkH, 7);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    treeGroup.add(trunk);

    const branch = (ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, len: number, rad: number, depth: number) => {
      const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      dx /= mag; dy /= mag; dz /= mag;

      if (depth > 4 || rad < 0.05) {
        const puffCount = 2 + Math.floor(rng() * 3);
        for (let p = 0; p < puffCount; p++) {
          const pr = 0.55 + rng() * 0.45;
          const pGeo = new THREE.DodecahedronGeometry(pr, 1);
          const pMesh = new THREE.Mesh(pGeo, rng() > 0.4 ? leafMatA : leafMatB);
          pMesh.position.set(ox + (rng()-0.5)*0.9, oy + (rng()-0.5)*0.6, oz + (rng()-0.5)*0.9);
          treeGroup.add(pMesh);
        }
        return;
      }

      const ex = ox + dx * len, ey = oy + dy * len, ez = oz + dz * len;
      const mx = (ox+ex)/2,     my = (oy+ey)/2,     mz = (oz+ez)/2;

      const bGeo = new THREE.CylinderGeometry(rad * 0.72, rad, len, 6);
      const bMesh = new THREE.Mesh(bGeo, trunkMat);
      bMesh.position.set(mx, my, mz);
      bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(dx,dy,dz).normalize());
      treeGroup.add(bMesh);

      if (depth >= 2) {
        const clGeo = new THREE.DodecahedronGeometry(0.7 + rng() * 0.5, 1);
        const clMesh = new THREE.Mesh(clGeo, rng() > 0.5 ? leafMatA : leafMatB);
        clMesh.position.set(ex, ey, ez);
        treeGroup.add(clMesh);
      }

      const kids = depth === 0 ? 4 : (rng() > 0.4 ? 3 : 2);
      for (let i = 0; i < kids; i++) {
        const spread = 0.4 + rng() * 0.35;
        const rot = (i / kids) * Math.PI * 2 + (rng()-0.5) * 0.5;
        const ndx = dx + Math.cos(rot) * spread;
        const ndy = dy + 0.2 + rng() * 0.3;
        const ndz = dz + Math.sin(rot) * spread;
        branch(ex, ey, ez, ndx, ndy, ndz, len * (0.68 + rng()*0.08), rad * (0.62 + rng()*0.08), depth+1);
      }
    };

    branch(0, trunkH, 0, 0, 1, 0, 3.2, 0.48, 0);

    const crownGeo = new THREE.DodecahedronGeometry(2.4 + rng() * 0.5, 1);
    const crown = new THREE.Mesh(crownGeo, leafMatA);
    crown.position.set(0, trunkH + 3.8, 0);
    treeGroup.add(crown);

    // 4. Particles
    if (particleRef.current) scene.remove(particleRef.current);
    const count = 130;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]     = (Math.random() - 0.5) * 30;
      pos[i*3 + 1] = Math.random() * 22 + 1;
      pos[i*3 + 2] = (Math.random() - 0.5) * 30;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: s.particleColor, size: 0.45, transparent: true, opacity: 0.85 });
    const pMesh = new THREE.Points(pGeo, pMat);
    scene.add(pMesh);
    particleRef.current = pMesh;

  }, [url, season, palette]);

  // ── Mode Switch: 3D Tree vs Top-Down QR Scanner ────────────────────────────
  useEffect(() => {
    const c = cam.current;
    if (qrMode) {
      c.tPitch = 0.001; // top-down 90 deg
      c.tYaw   = 0.0;   // square alignment
      c.tDist  = 34;
      if (treeGroupRef.current) treeGroupRef.current.visible = false;
    } else {
      c.tPitch = 0.76;  // ~45 deg isometric
      c.tYaw   = 0.785; // isometric diamond
      c.tDist  = 40;
      if (treeGroupRef.current) treeGroupRef.current.visible = true;
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

  // ── Audio Toggle ───────────────────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    if (muted) {
      try {
        const ctx = audioCtxRef.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") ctx.resume();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 350; f.Q.value = 2.5;
        const g = ctx.createGain(); g.gain.value = 0.05;
        src.connect(f); f.connect(g); g.connect(ctx.destination);
        src.start();
        audioSrcRef.current = src;
        setMuted(false);
      } catch {}
    } else {
      audioSrcRef.current?.stop();
      audioSrcRef.current = null;
      setMuted(true);
    }
  }, [muted]);

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrl(sanitizeUrl(trimmed));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#f6f1e7] font-sans">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        onClick={() => setQrMode(v => !v)}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4 sm:p-5 pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex flex-col items-start gap-1">
          <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-stone-900 leading-none">
            CruseQR
          </div>
          <span className="text-[9px] font-bold tracking-wider bg-yellow-200 text-yellow-900 border border-yellow-300 rounded-full px-2 py-0.5">
            Magic Tree
          </span>
        </div>
        <button
          onClick={() => alert("CruseQR Magic Tree\n\nTurn any link into a living 3D tree rooted in a scannable QR code.\n\n• Tap the tree to toggle between 3D view and top-down QR scanner\n• Pick seasonal themes & custom petal colors\n• Click the upload button to share your tree!")}
          className="pointer-events-auto w-7 h-7 rounded-full border border-stone-300 bg-white/70 text-stone-500 font-serif italic text-xs flex items-center justify-center backdrop-blur-md hover:bg-white transition"
          title="About"
        >
          i
        </button>
      </header>

      {/* View Toggle Pill */}
      <button
        onClick={() => setQrMode(v => !v)}
        className="absolute bottom-[136px] left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-white/90 border border-stone-200 text-stone-600 text-xs font-medium shadow-sm backdrop-blur-md hover:bg-white hover:text-stone-900 transition active:scale-95"
      >
        {qrMode ? "Tap to see the tree" : "Tap the tree to see QR code"}
      </button>

      {/* Bottom Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[440px] z-20 flex flex-col gap-2">
        {/* URL Bar */}
        <div className="bg-white rounded-2xl p-1 pl-3.5 shadow-sm border border-stone-100 flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUrlSubmit()}
            placeholder="Type or paste any URL..."
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-stone-800 placeholder-stone-400 truncate"
          />
          <button
            onClick={() => { handleUrlSubmit(); setShareOpen(true); }}
            className="w-9 h-9 rounded-xl bg-[#c27d53] hover:bg-[#b06c42] text-white flex items-center justify-center shadow transition active:scale-95"
            title="Update & Share"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13M7 8l5-5 5 5"/>
            </svg>
          </button>
        </div>

        {/* Season Row */}
        <div className="flex items-center gap-1.5">
          {SEASONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSeason(i)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${season === i ? "bg-[#e2d7c5] text-stone-900 font-bold shadow-sm" : "bg-[#ede7dc] text-stone-600 hover:bg-[#e5ded2]"}`}
            >
              {i === 0 && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/>
                </svg>
              )}
              {i === 1 && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              )}
              {i === 2 && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 21v1M12 21v1M16 21v1"/>
                </svg>
              )}
              {s.name}
            </button>
          ))}
          <button
            onClick={toggleSound}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${!muted ? "bg-[#ede7dc] text-[#c27d53]" : "bg-[#ede7dc] text-stone-500 hover:bg-[#e5ded2]"}`}
            title={muted ? "Sound Off" : "Sound On"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              {!muted ? <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/> : <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}
            </svg>
          </button>
        </div>

        {/* Palette Row */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {PALETTES.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setPalette(i)}
              title={p.name}
              style={{ background: p.color }}
              className={`w-5 h-5 rounded-full transition ${palette === i ? "scale-125 ring-2 ring-stone-900 ring-offset-2 ring-offset-[#f6f1e7]" : "hover:scale-110 opacity-90"}`}
            />
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-stone-900">Share Your Magic Tree</h3>
              <button onClick={() => setShareOpen(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Anyone who opens this link will see your exact custom 3D tree rooted in this scannable QR code.
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
    </div>
  );
}
