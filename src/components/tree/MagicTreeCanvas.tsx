"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";
import QRCode from "qrcode";

// ─── ICQR Query Format ────────────────────────────────────────────────────────
// ?q=MDBodHRwczovL2ljcXIuY29tLw  =>  atob("MDB...") = "00https://icqr.com/"
// char[0] = seasonIndex (0-3), char[1] = paletteIndex, rest = URL
function parseQ(raw: string | null) {
  if (!raw) return { url: "https://icqr.com/", season: 0, palette: 0 };
  try {
    const d = atob(raw);
    return {
      url: d.slice(2) || "https://icqr.com/",
      season: Math.min(3, Math.max(0, parseInt(d[0]) || 0)),
      palette: Math.min(5, Math.max(0, parseInt(d[1]) || 0)),
    };
  } catch {
    return { url: "https://icqr.com/", season: 0, palette: 0 };
  }
}
function encodeQ(url: string, season: number, palette: number) {
  try { return btoa(`${season}${palette}${url}`); } catch { return ""; }
}

// ─── Seasons ──────────────────────────────────────────────────────────────────
const SEASONS = [
  {
    id: "spring", name: "Spring", icon: "🌸",
    bg: 0xf5ede2, ground: 0xede0d4, block: 0x2b1a13, trunk: 0x5c3d2e,
    leaves: [0xffb7c5, 0xffc0cb, 0xff9eb5, 0xffcdd8], petal: 0xffb7c5,
    fog: 0xf5ede2,
  },
  {
    id: "summer", name: "Summer", icon: "🍃",
    bg: 0xe8f5ec, ground: 0xd8ead8, block: 0x0f2a1a, trunk: 0x3b2d20,
    leaves: [0x2d8a50, 0x3aad60, 0x57c97a, 0x1b6e35], petal: 0x7dd49a,
    fog: 0xe8f5ec,
  },
  {
    id: "autumn", name: "Autumn", icon: "🍂",
    bg: 0xfbf0e2, ground: 0xf0e0c8, block: 0x3a1508, trunk: 0x52301a,
    leaves: [0xd9531e, 0xe88a1a, 0xf0a830, 0xa8390f], petal: 0xe07828,
    fog: 0xfbf0e2,
  },
  {
    id: "winter", name: "Winter", icon: "❄️",
    bg: 0xe8f0f8, ground: 0xd8e4f0, block: 0x162638, trunk: 0x344558,
    leaves: [0xc8def0, 0xb0cce8, 0x8cb4d8, 0xffffff], petal: 0xd8eaf8,
    fog: 0xe8f0f8,
  },
];

// ─── Palettes (leaf / petal tint override) ────────────────────────────────────
const PALETTES = [
  { name: "Sakura",   hex: 0xffb7c5, color: "#ffb7c5" },
  { name: "Rose",     hex: 0xf43f7e, color: "#f43f7e" },
  { name: "Emerald",  hex: 0x10b981, color: "#10b981" },
  { name: "Amber",    hex: 0xf59e0b, color: "#f59e0b" },
  { name: "Sky",      hex: 0x38bdf8, color: "#38bdf8" },
  { name: "Violet",   hex: 0x8b5cf6, color: "#8b5cf6" },
];

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ─── Build Instanced QR Blocks ───────────────────────────────────────────────
async function buildQRBlocks(
  url: string,
  blockColor: number,
  scanMode: boolean
): Promise<THREE.InstancedMesh | null> {
  try {
    const qrData = await QRCode.create(url, { errorCorrectionLevel: "M" });
    const { modules } = qrData;
    const size = modules.size;
    const bs = 0.56; // block size
    const offset = (size * bs) / 2;

    // Count dark modules
    let count = 0;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (modules.get(r, c)) count++;

    const geo = new THREE.BoxGeometry(bs * 0.9, 0.42, bs * 0.9);
    const mat = new THREE.MeshStandardMaterial({
      color: blockColor, roughness: 0.55, metalness: 0.08,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!modules.get(r, c)) continue;
        const x = c * bs - offset + bs / 2;
        const z = r * bs - offset + bs / 2;
        // In 3D tree mode, slightly lower the center area where trunk grows
        const dist = Math.sqrt(x * x + z * z);
        const h = !scanMode && dist < 1.8 ? 0.22 : 0.42;
        dummy.position.set(x, h / 2, z);
        dummy.scale.set(1, h / 0.42, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  } catch {
    return null;
  }
}

// ─── Build Procedural Tree ────────────────────────────────────────────────────
function buildTree(
  group: THREE.Group,
  trunkColor: number,
  leafColors: number[],
  paletteHex: number,
  seed: number
) {
  const rng = makeRng(seed);
  const trunkMat = new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.88 });
  const leafMat  = new THREE.MeshStandardMaterial({ color: paletteHex,  roughness: 0.6, flatShading: true });
  const leaf2Mat = new THREE.MeshStandardMaterial({ color: leafColors[1] ?? leafColors[0], roughness: 0.6, flatShading: true });

  // ── Recursive branch function ──────────────────────────────────────────────
  function branch(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    depth: number
  ) {
    if (depth > 5 || r < 0.04) {
      // Leaf cluster at tip
      const n = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < n; i++) {
        const geo = new THREE.DodecahedronGeometry(0.28 + rng() * 0.26, 0);
        const m = new THREE.Mesh(geo, rng() > 0.5 ? leafMat : leaf2Mat);
        m.position.copy(origin).add(
          new THREE.Vector3((rng() - 0.5) * 0.8, rng() * 0.5, (rng() - 0.5) * 0.8)
        );
        m.castShadow = true;
        group.add(m);
      }
      return;
    }

    const end = origin.clone().addScaledVector(dir, len);
    const mid = origin.clone().lerp(end, 0.5);

    // Cylinder aligned along dir
    const geo = new THREE.CylinderGeometry(r * 0.72, r, len, 7);
    const mesh = new THREE.Mesh(geo, trunkMat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);

    // Bigger foliage puffs at mid-high depth
    if (depth >= 3) {
      const geo2 = new THREE.DodecahedronGeometry(0.5 + rng() * 0.5, 1);
      const m = new THREE.Mesh(geo2, rng() > 0.4 ? leafMat : leaf2Mat);
      m.position.copy(end);
      m.castShadow = true;
      group.add(m);
    }

    const kids = depth === 0 ? 4 : (rng() > 0.4 ? 3 : 2);
    for (let i = 0; i < kids; i++) {
      const spread = 0.35 + rng() * 0.4;
      const rot    = (i / kids) * Math.PI * 2 + (rng() - 0.5) * 0.6;
      const nd = dir.clone();
      nd.x += Math.cos(rot) * spread;
      nd.z += Math.sin(rot) * spread;
      nd.y += 0.15 + rng() * 0.35;
      nd.normalize();
      branch(end, nd, len * (0.68 + rng() * 0.08), r * (0.62 + rng() * 0.08), depth + 1);
    }
  }

  // Main trunk root
  branch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 4.2, 0.72, 0);

  // Large canopy crown at top
  const crownGeo = new THREE.DodecahedronGeometry(2.8 + rng() * 0.8, 1);
  const crown = new THREE.Mesh(crownGeo, leafMat);
  crown.position.set(0, 10.5, 0);
  crown.castShadow = true;
  group.add(crown);
}

// ─── Main Canvas Component ────────────────────────────────────────────────────
export default function MagicTreeCanvas() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");
  const init = useMemo(() => parseQ(qParam), [qParam]);

  const [url,       setUrl]       = useState(init.url);
  const [urlInput,  setUrlInput]  = useState(init.url);
  const [season,    setSeason]    = useState(init.season);
  const [palette,   setPalette]   = useState(init.palette);
  const [seed,      setSeed]      = useState(42);
  const [scanMode,  setScanMode]  = useState(false);
  const [muted,     setMuted]     = useState(true);
  const [copied,    setCopied]    = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const canvasRef   = useRef<HTMLDivElement>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const camRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const rendRef     = useRef<THREE.WebGLRenderer | null>(null);
  const qrGroupRef  = useRef<THREE.Group | null>(null);
  const treeGroupRef= useRef<THREE.Group | null>(null);
  const petalRef    = useRef<THREE.Points | null>(null);
  const groundRef   = useRef<THREE.Mesh | null>(null);
  const rafRef      = useRef<number>(0);
  const clockRef    = useRef(new THREE.Clock());
  const audioRef    = useRef<AudioContext | null>(null);

  // Camera orbit state
  const cam = useRef({
    pitch: 0.78, yaw: 0.6, dist: 46,
    tPitch: 0.78, tYaw: 0.6, tDist: 46,
    dragging: false, px: 0, py: 0,
  });

  // ── Init Three.js scene (once) ─────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    const el = canvasRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendRef.current = renderer;
    el.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 500);
    camRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const sun = new THREE.DirectionalLight(0xfff8e8, 1.45);
    sun.position.set(28, 55, 32);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 160;
    Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    // Groups
    const qrGroup   = new THREE.Group(); scene.add(qrGroup); qrGroupRef.current = qrGroup;
    const treeGroup = new THREE.Group(); scene.add(treeGroup); treeGroupRef.current = treeGroup;

    // ── Pointer orbit controls ────────────────────────────────────────────────
    const c = cam.current;
    const onDown  = (e: MouseEvent)   => { c.dragging = true;  c.px = e.clientX; c.py = e.clientY; };
    const onMove  = (e: MouseEvent)   => {
      if (!c.dragging) return;
      c.tYaw   -= (e.clientX - c.px) * 0.007;
      c.tPitch  = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, c.tPitch + (e.clientY - c.py) * 0.007));
      c.px = e.clientX; c.py = e.clientY;
    };
    const onUp    = ()                => { c.dragging = false; };
    const onWheel = (e: WheelEvent)   => {
      e.preventDefault();
      c.tDist = Math.max(14, Math.min(85, c.tDist + e.deltaY * 0.04));
    };
    const onTD = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      c.dragging = true; c.px = e.touches[0].clientX; c.py = e.touches[0].clientY;
    };
    const onTM = (e: TouchEvent) => {
      if (!c.dragging || e.touches.length !== 1) return;
      c.tYaw  -= (e.touches[0].clientX - c.px) * 0.009;
      c.tPitch = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, c.tPitch + (e.touches[0].clientY - c.py) * 0.009));
      c.px = e.touches[0].clientX; c.py = e.touches[0].clientY;
    };
    el.addEventListener("mousedown",  onDown);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseup",    onUp);
    el.addEventListener("wheel",      onWheel, { passive: false });
    el.addEventListener("touchstart", onTD, { passive: true });
    window.addEventListener("touchmove",  onTM, { passive: true });
    window.addEventListener("touchend",   onUp);

    const onResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth, h = canvasRef.current.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────────────────────
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();
      const c = cam.current;

      // Smooth camera lerp
      c.pitch += (c.tPitch - c.pitch) * 0.09;
      c.yaw   += (c.tYaw   - c.yaw)   * 0.09;
      c.dist  += (c.tDist  - c.dist)  * 0.09;

      camera.position.set(
        c.dist * Math.sin(c.pitch) * Math.sin(c.yaw),
        c.dist * Math.cos(c.pitch),
        c.dist * Math.sin(c.pitch) * Math.cos(c.yaw)
      );
      camera.lookAt(0, 3.5, 0);

      // Animate petals
      if (petalRef.current) {
        const pts = petalRef.current.geometry.attributes.position.array as Float32Array;
        const n = pts.length / 3;
        for (let i = 0; i < n; i++) {
          pts[i * 3]     += Math.sin(t * 0.4 + i * 1.3) * 0.012;
          pts[i * 3 + 1] -= 0.028 + Math.sin(t * 0.3 + i) * 0.006;
          pts[i * 3 + 2] += Math.cos(t * 0.4 + i * 1.7) * 0.012;
          if (pts[i * 3 + 1] < -1) {
            pts[i * 3]     = (Math.random() - 0.5) * 32;
            pts[i * 3 + 1] = 20 + Math.random() * 8;
            pts[i * 3 + 2] = (Math.random() - 0.5) * 32;
          }
        }
        petalRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Gentle tree sway
      if (treeGroupRef.current)
        treeGroupRef.current.rotation.y = Math.sin(t * 0.4) * 0.012;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("resize",    onResize);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend",  onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild scene content when settings change ─────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    const qrGroup   = qrGroupRef.current;
    const treeGroup = treeGroupRef.current;
    if (!scene || !qrGroup || !treeGroup) return;

    const s = SEASONS[season];
    const paletteHex = PALETTES[palette]?.hex ?? s.petal;

    // Background + fog
    scene.background = new THREE.Color(s.bg);
    scene.fog = new THREE.FogExp2(s.fog, 0.011);

    // Ground
    if (groundRef.current) scene.remove(groundRef.current);
    const groundGeo = new THREE.CylinderGeometry(21, 23, 2.2, 56);
    const groundMat = new THREE.MeshStandardMaterial({ color: s.ground, roughness: 0.92, metalness: 0.03 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.1;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;

    // Clear + rebuild QR blocks
    while (qrGroup.children.length > 0) {
      const c = qrGroup.children[0] as THREE.Mesh;
      c.geometry?.dispose();
      qrGroup.remove(c);
    }
    buildQRBlocks(url, s.block, scanMode).then(mesh => {
      if (mesh && qrGroupRef.current) qrGroupRef.current.add(mesh);
    });

    // Clear + rebuild tree
    while (treeGroup.children.length > 0) {
      const c = treeGroup.children[0] as THREE.Mesh;
      c.geometry?.dispose();
      treeGroup.remove(c);
    }
    buildTree(treeGroup, s.trunk, s.leaves, paletteHex, seed);

    // Rebuild petals
    if (petalRef.current) scene.remove(petalRef.current);
    const petalCount = 180;
    const positions = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = Math.random() * 22 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 34;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: paletteHex, size: 0.42, transparent: true, opacity: 0.88 });
    const petals = new THREE.Points(pGeo, pMat);
    scene.add(petals);
    petalRef.current = petals;

  }, [url, season, palette, seed, scanMode]);

  // ── Scan mode camera snap ──────────────────────────────────────────────────
  useEffect(() => {
    const c = cam.current;
    if (scanMode) {
      c.tPitch = 0.001; c.tDist = 38;   // top-down
    } else {
      c.tPitch = 0.78;  c.tDist = 46;   // isometric
    }
  }, [scanMode]);

  // ── Share URL ─────────────────────────────────────────────────────────────
  const shareUrl = useMemo(() => {
    const q = encodeQ(url, season, palette);
    if (typeof window !== "undefined") return `${window.location.origin}/tree?q=${q}`;
    return `/tree?q=${encodeQ(url, season, palette)}`;
  }, [url, season, palette]);

  // Update browser URL bar silently
  useEffect(() => {
    const q = encodeQ(url, season, palette);
    if (typeof window !== "undefined")
      window.history.replaceState(null, "", `/tree?q=${q}`);
  }, [url, season, palette]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const downloadPNG = useCallback(() => {
    const rend = rendRef.current;
    if (!rend) return;
    const url2 = rend.domElement.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url2;
    a.download = `cruseqr-magic-tree-${SEASONS[season].id}.png`; a.click();
  }, [season]);

  const toggleSound = useCallback(() => {
    if (muted) {
      try {
        const ctx = audioRef.current ?? new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        audioRef.current = ctx;
        if (ctx.state === "suspended") ctx.resume();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const f = ctx.createBiquadFilter(); f.type = "bandpass";
        f.frequency.value = 300; f.Q.value = 2;
        const g = ctx.createGain(); g.gain.value = 0.07;
        src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
        setMuted(false);
      } catch {}
    } else {
      audioRef.current?.suspend();
      setMuted(true);
    }
  }, [muted]);

  const applyUrl = useCallback(() => {
    const v = urlInput.trim();
    setUrl(v.startsWith("http") ? v : `https://${v}`);
  }, [urlInput]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none">
      {/* WebGL Canvas */}
      <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Logo */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="bg-white/90 backdrop-blur-md border border-stone-200 rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-stone-900">
              Cruse<span className="text-amber-600">QR</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2 py-0.5">
              Magic Tree
            </span>
          </div>
        </div>

        {/* Top-right actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Sound */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center transition active:scale-90"
            title={muted ? "Enable Ambient Wind" : "Mute"}
          >
            {muted
              ? <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0 2-2m-2 2-2-2m2 2 2 2" /></svg>
              : <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 0 1 0 7.072M5.586 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15Z" /></svg>
            }
          </button>

          {/* Re-seed */}
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 999999))}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center transition active:scale-90"
            title="Grow New Tree"
          >
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          </button>

          {/* Download */}
          <button
            onClick={downloadPNG}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center transition active:scale-90"
            title="Download PNG"
          >
            <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          </button>

          {/* Scan Mode Toggle */}
          <button
            onClick={() => setScanMode(v => !v)}
            className={`px-3.5 h-9 rounded-xl border shadow-md backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition active:scale-90 ${scanMode ? "bg-stone-900 text-white border-stone-900" : "bg-white/90 text-stone-700 border-stone-200 hover:bg-white"}`}
            title="Toggle scan mode (top-down view)"
          >
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" /></svg>
            {scanMode ? "3D View" : "Scan QR"}
          </button>

          {/* Share */}
          <button
            onClick={() => setShareOpen(true)}
            className="px-3.5 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
            Share
          </button>
        </div>
      </header>

      {/* ── Bottom Dock (identical to ICQR layout) ───────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[520px] px-4 z-30 pointer-events-none">
        <div className="bg-white/92 border border-stone-200 rounded-[26px] p-4 shadow-2xl backdrop-blur-xl pointer-events-auto space-y-3">

          {/* URL input row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyUrl()}
              placeholder="https://your-link.com"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <button
              onClick={applyUrl}
              className="px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow flex items-center gap-1 transition active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Generate
            </button>
          </div>

          {/* Season selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {SEASONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSeason(i)}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition active:scale-95 ${season === i ? "bg-amber-100 border border-amber-400 text-amber-900 shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                <span>{s.icon}</span>
                <span className="hidden xs:inline">{s.name}</span>
              </button>
            ))}
          </div>

          {/* Palette row */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 tracking-wide">Colour</span>
            <div className="flex items-center gap-2">
              {PALETTES.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setPalette(i)}
                  title={p.name}
                  style={{ background: p.color }}
                  className={`w-5 h-5 rounded-full transition ${palette === i ? "scale-125 ring-2 ring-stone-900 ring-offset-2 ring-offset-white" : "hover:scale-110 opacity-80 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Share Modal ───────────────────────────────────────────────────────── */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-stone-900">Share Your Magic Tree 🌸</h3>
              <button onClick={() => setShareOpen(false)} className="text-stone-400 hover:text-stone-700 text-lg font-bold">✕</button>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Anyone who opens this link will see your exact 3D tree with the same season, palette, and QR code destination.
            </p>
            <div className="flex items-center gap-2">
              <input readOnly value={shareUrl} className="flex-1 px-3 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700 truncate" />
              <button
                onClick={copyLink}
                className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copied
                  ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                }
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
