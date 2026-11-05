"use client";

import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import * as THREE from "three";
import {
  Sparkles,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Dices,
  Maximize2,
  Eye,
  Check,
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  QrCode as QrIcon,
} from "lucide-react";

// Decode ICQR query format: Base64 string of "[seasonIndex][paletteIndex][url]"
// E.g. "MDBodHRwczovL2ljcXIuY29tLw" -> season 0, palette 0, url "https://icqr.com/"
function parseQueryParam(qParam: string | null): { url: string; season: number; palette: number } {
  if (!qParam) {
    return { url: "https://icqr.com/", season: 0, palette: 0 };
  }
  try {
    const decoded = atob(qParam);
    const season = parseInt(decoded.charAt(0), 10) || 0;
    const palette = parseInt(decoded.charAt(1), 10) || 0;
    const url = decoded.substring(2) || "https://icqr.com/";
    return { url, season: Math.min(3, Math.max(0, season)), palette: Math.max(0, palette) };
  } catch {
    return { url: "https://icqr.com/", season: 0, palette: 0 };
  }
}

function encodeQueryParam(url: string, season: number, palette: number): string {
  try {
    return btoa(`${season}${palette}${url}`);
  } catch {
    return "";
  }
}

interface SeasonTheme {
  id: string;
  name: string;
  icon: string;
  skyColor: number;
  groundColor: number;
  blockColor: number;
  trunkColor: number;
  leavesColors: number[];
  petalColor: number;
}

const SEASONS: SeasonTheme[] = [
  {
    id: "spring",
    name: "Spring",
    icon: "🌸",
    skyColor: 0xf6f1e7,
    groundColor: 0xf0e9dc,
    blockColor: 0x3d2b27,
    trunkColor: 0x5a3e36,
    leavesColors: [0xffb7c5, 0xff9ebb, 0xffc0cb, 0xffe4e1],
    petalColor: 0xffb7c5,
  },
  {
    id: "summer",
    name: "Summer",
    icon: "🍃",
    skyColor: 0xeef6f1,
    groundColor: 0xe2eee6,
    blockColor: 0x1f3b2b,
    trunkColor: 0x4a3b32,
    leavesColors: [0x2e8b57, 0x3cb371, 0x66cdaa, 0x20b2aa],
    petalColor: 0x88d49e,
  },
  {
    id: "autumn",
    name: "Autumn",
    icon: "🍂",
    skyColor: 0xfdf4e7,
    groundColor: 0xf5e6d0,
    blockColor: 0x422212,
    trunkColor: 0x54331d,
    leavesColors: [0xd9531e, 0xeb8223, 0xf2a93b, 0xa63d11],
    petalColor: 0xeb8223,
  },
  {
    id: "winter",
    name: "Winter",
    icon: "❄️",
    skyColor: 0xedf3f8,
    groundColor: 0xdfe9f1,
    blockColor: 0x243342,
    trunkColor: 0x3b4b59,
    leavesColors: [0xdceefb, 0xb8d9f5, 0x90c2ea, 0xffffff],
    petalColor: 0xdceefb,
  },
];

const PALETTES = [
  { name: "Classic Sakura", color: "#FFB7C5", hex: 0xffb7c5 },
  { name: "Deep Rose", color: "#EC4899", hex: 0xec4899 },
  { name: "Emerald Glade", color: "#10B981", hex: 0x10b981 },
  { name: "Golden Amber", color: "#F59E0B", hex: 0xf59e0b },
  { name: "Electric Cyan", color: "#06B6D4", hex: 0x06b6d4 },
  { name: "Cosmic Violet", color: "#8B5CF6", hex: 0x8b5cf6 },
];

function MagicTreeCanvas() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q");

  const initialData = useMemo(() => parseQueryParam(qParam), [qParam]);

  const [url, setUrl] = useState(initialData.url);
  const [seasonIdx, setSeasonIdx] = useState(initialData.season);
  const [paletteIdx, setPaletteIdx] = useState(initialData.palette);
  const [isFlat, setIsFlat] = useState(false); // false = 3D Tree perspective, true = Top-Down QR Scan view
  const [treeSeed, setTreeSeed] = useState(42);
  const [muted, setMuted] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<{
    targetPitch: number;
    targetYaw: number;
    targetDistance: number;
    currentPitch: number;
    currentYaw: number;
    currentDistance: number;
    isDragging: boolean;
    prevX: number;
    prevY: number;
  }>({
    targetPitch: 0.75, // Isometric tilt
    targetYaw: 0.65,
    targetDistance: 45,
    currentPitch: 0.75,
    currentYaw: 0.65,
    currentDistance: 45,
    isDragging: false,
    prevX: 0,
    prevY: 0,
  });

  const petalsGroupRef = useRef<THREE.Group | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const qrBlocksGroupRef = useRef<THREE.Group | null>(null);

  // Ambient wind audio synthesizer
  const toggleAudio = () => {
    if (muted) {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Simple relaxing ambient white noise / wind breeze filter
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();
      } else {
        audioContextRef.current.resume();
      }
      setMuted(false);
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
      setMuted(true);
    }
  };

  // Switch between 3D Isometric View and Flat Scan Mode
  useEffect(() => {
    const c = controlsRef.current;
    if (isFlat) {
      // Look straight down from above to scan QR code
      c.targetPitch = 0.001;
      c.targetYaw = 0;
      c.targetDistance = 38;
    } else {
      // Isometric 3D angle
      c.targetPitch = 0.85;
      c.targetYaw = 0.78;
      c.targetDistance = 45;
    }
  }, [isFlat]);

  // Main Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const currentSeason = SEASONS[seasonIdx];
    scene.background = new THREE.Color(currentSeason.skyColor);
    scene.fog = new THREE.FogExp2(currentSeason.skyColor, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(30, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Ground Island
    const groundGeo = new THREE.CylinderGeometry(22, 24, 2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: currentSeason.groundColor,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Groups
    const qrBlocksGroup = new THREE.Group();
    scene.add(qrBlocksGroup);
    qrBlocksGroupRef.current = qrBlocksGroup;

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    treeGroupRef.current = treeGroup;

    const petalsGroup = new THREE.Group();
    scene.add(petalsGroup);
    petalsGroupRef.current = petalsGroup;

    // Generate falling petals particle system
    const petalCount = 70;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalSpeeds = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 36;
      petalPositions[i * 3 + 1] = Math.random() * 25 + 5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 36;

      petalSpeeds[i * 3] = (Math.random() - 0.5) * 0.04; // sway X
      petalSpeeds[i * 3 + 1] = -(Math.random() * 0.05 + 0.03); // fall Y
      petalSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.04; // sway Z
    }

    petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: PALETTES[paletteIdx]?.hex || currentSeason.petalColor,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
    });
    const petalParticles = new THREE.Points(petalGeo, petalMat);
    petalsGroup.add(petalParticles);

    // Mouse / Touch Interaction Listeners
    const onMouseDown = (e: MouseEvent) => {
      controlsRef.current.isDragging = true;
      controlsRef.current.prevX = e.clientX;
      controlsRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current.isDragging) return;
      const dx = e.clientX - controlsRef.current.prevX;
      const dy = e.clientY - controlsRef.current.prevY;
      controlsRef.current.targetYaw -= dx * 0.008;
      controlsRef.current.targetPitch = Math.max(
        0.001,
        Math.min(Math.PI / 2 - 0.05, controlsRef.current.targetPitch + dy * 0.008)
      );
      controlsRef.current.prevX = e.clientX;
      controlsRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      controlsRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsRef.current.targetDistance = Math.max(
        15,
        Math.min(80, controlsRef.current.targetDistance + e.deltaY * 0.04)
      );
    };

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        controlsRef.current.isDragging = true;
        controlsRef.current.prevX = e.touches[0].clientX;
        controlsRef.current.prevY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!controlsRef.current.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - controlsRef.current.prevX;
      const dy = e.touches[0].clientY - controlsRef.current.prevY;
      controlsRef.current.targetYaw -= dx * 0.01;
      controlsRef.current.targetPitch = Math.max(
        0.001,
        Math.min(Math.PI / 2 - 0.05, controlsRef.current.targetPitch + dy * 0.01)
      );
      controlsRef.current.prevX = e.touches[0].clientX;
      controlsRef.current.prevY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      controlsRef.current.isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      const c = controlsRef.current;
      c.currentPitch += (c.targetPitch - c.currentPitch) * 0.08;
      c.currentYaw += (c.targetYaw - c.currentYaw) * 0.08;
      c.currentDistance += (c.targetDistance - c.currentDistance) * 0.08;

      const p = c.currentPitch;
      const y = c.currentYaw;
      const dist = c.currentDistance;

      camera.position.x = dist * Math.sin(p) * Math.sin(y);
      camera.position.y = dist * Math.cos(p);
      camera.position.z = dist * Math.sin(p) * Math.cos(y);
      camera.lookAt(0, 3, 0);

      // Animate falling petals
      const positions = petalGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        positions[i * 3] += petalSpeeds[i * 3] + Math.sin(elapsedTime + i) * 0.015;
        positions[i * 3 + 1] += petalSpeeds[i * 3 + 1];
        positions[i * 3 + 2] += petalSpeeds[i * 3 + 2] + Math.cos(elapsedTime + i) * 0.015;

        // Reset petal to top when it reaches ground
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 32;
          positions[i * 3 + 1] = 22 + Math.random() * 5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 32;
        }
      }
      petalGeo.attributes.position.needsUpdate = true;

      // Subtle foliage wind sway
      if (treeGroupRef.current) {
        treeGroupRef.current.rotation.y = Math.sin(elapsedTime * 0.5) * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Re-generate QR Code Blocks & 3D Tree when URL, Season, Palette, or Seed changes
  useEffect(() => {
    if (!sceneRef.current || !qrBlocksGroupRef.current || !treeGroupRef.current) return;

    const currentSeason = SEASONS[seasonIdx];
    const selectedPaletteColor = PALETTES[paletteIdx]?.hex || currentSeason.leavesColors[0];

    // 1. Generate 2D QR Matrix
    let qr: any;
    try {
      qr = QRCode.create(url || "https://icqr.com/", { errorCorrectionLevel: "H" });
    } catch {
      qr = QRCode.create("https://icqr.com/", { errorCorrectionLevel: "H" });
    }

    const matrix = qr.modules;
    const size = matrix.size;
    const blockSize = 0.58;
    const gridOffset = (size * blockSize) / 2;

    // Clear old QR blocks
    const qrGroup = qrBlocksGroupRef.current;
    while (qrGroup.children.length > 0) {
      qrGroup.remove(qrGroup.children[0]);
    }

    // Material for QR 3D Blocks
    const blockMat = new THREE.MeshStandardMaterial({
      color: currentSeason.blockColor,
      roughness: 0.6,
      metalness: 0.1,
    });

    const boxGeo = new THREE.BoxGeometry(blockSize * 0.92, 0.45, blockSize * 0.92);

    // Create instanced or individual block meshes
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!matrix.get(r, c)) continue;

        // Skip center modules where tree trunk roots emerge
        const centerDist = Math.hypot(r - size / 2, c - size / 2);
        if (centerDist < 3.2 && !isFlat) continue;

        const x = c * blockSize - gridOffset;
        const z = r * blockSize - gridOffset;

        const mesh = new THREE.Mesh(boxGeo, blockMat);
        mesh.position.set(x, 0.22, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        qrGroup.add(mesh);
      }
    }

    // 2. Build 3D Tree Structure
    const treeGroup = treeGroupRef.current;
    while (treeGroup.children.length > 0) {
      treeGroup.remove(treeGroup.children[0]);
    }

    // Pseudo-random generator using treeSeed
    let s = treeSeed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const trunkMat = new THREE.MeshStandardMaterial({
      color: currentSeason.trunkColor,
      roughness: 0.85,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: selectedPaletteColor,
      roughness: 0.5,
      metalness: 0.1,
    });

    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });

    // Recursive procedural 3D branch generator
    function buildBranch(
      startPos: THREE.Vector3,
      direction: THREE.Vector3,
      length: number,
      radius: number,
      depth: number
    ) {
      if (depth > 4 || radius < 0.08) {
        // Spawn foliage / flower clusters at tips
        const clusterCount = 3 + Math.floor(random() * 3);
        for (let i = 0; i < clusterCount; i++) {
          const sphereGeo = new THREE.SphereGeometry(0.35 + random() * 0.3, 8, 8);
          const fMesh = new THREE.Mesh(sphereGeo, random() > 0.3 ? leafMat : flowerMat);
          fMesh.position.copy(startPos);
          fMesh.position.x += (random() - 0.5) * 0.9;
          fMesh.position.y += (random() - 0.5) * 0.9;
          fMesh.position.z += (random() - 0.5) * 0.9;
          fMesh.castShadow = true;
          treeGroup.add(fMesh);
        }
        return;
      }

      const endPos = startPos.clone().add(direction.clone().multiplyScalar(length));

      // Branch Cylinder
      const branchGeo = new THREE.CylinderGeometry(radius * 0.75, radius, length, 8);
      const branchMesh = new THREE.Mesh(branchGeo, trunkMat);

      // Position & Orient Cylinder along direction
      const midpoint = startPos.clone().add(endPos).multiplyScalar(0.5);
      branchMesh.position.copy(midpoint);
      branchMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      branchMesh.castShadow = true;
      branchMesh.receiveShadow = true;
      treeGroup.add(branchMesh);

      // Child branches
      const branchCount = depth === 0 ? 4 : 2 + (random() > 0.5 ? 1 : 0);
      for (let b = 0; b < branchCount; b++) {
        const spreadAngle = 0.4 + random() * 0.35;
        const rotAngle = (b / branchCount) * Math.PI * 2 + (random() - 0.5) * 0.4;

        const nextDir = direction.clone();
        // Perturb direction
        nextDir.x += Math.cos(rotAngle) * spreadAngle;
        nextDir.z += Math.sin(rotAngle) * spreadAngle;
        nextDir.y += 0.2 + random() * 0.3;
        nextDir.normalize();

        buildBranch(endPos, nextDir, length * 0.75, radius * 0.68, depth + 1);
      }
    }

    // Grow the tree starting from ground center
    buildBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 3.8, 0.7, 0);

    // Update scene background and fog
    sceneRef.current.background = new THREE.Color(currentSeason.skyColor);
    if (sceneRef.current.fog) {
      (sceneRef.current.fog as THREE.FogExp2).color.setHex(currentSeason.skyColor);
    }
  }, [url, seasonIdx, paletteIdx, treeSeed, isFlat]);

  // Snapshot PNG Download
  const downloadSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `cruseqr-magic-tree-${SEASONS[seasonIdx].id}.png`;
    a.click();
  };

  // Share URL Generator (matches ICQR ?q=MDB... format)
  const shareUrl = useMemo(() => {
    const encoded = encodeQueryParam(url, seasonIdx, paletteIdx);
    if (typeof window !== "undefined") {
      return `${window.location.origin}/tree?q=${encoded}`;
    }
    return `https://tree.icqr.com/?q=${encoded}`;
  }, [url, seasonIdx, paletteIdx]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f6f1e7] font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Header & Action Icons */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all active:scale-95"
            title="Return to CruseQR"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="px-3.5 py-2 rounded-2xl bg-white/90 border border-stone-200 shadow-md backdrop-blur-md flex items-center gap-2">
            <span className="text-sm font-bold text-stone-800 tracking-tight">
              CruseQR <span className="text-amber-600 font-extrabold">Magic Tree</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              3D QR
            </span>
          </div>
        </div>

        {/* Top-Right Quick Tool Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Ambient Nature Sound */}
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all active:scale-95"
            title={muted ? "Enable Ambient Breeze" : "Mute Sound"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Randomize Tree Shape Seed */}
          <button
            onClick={() => setTreeSeed(Math.floor(Math.random() * 100000))}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all active:scale-95"
            title="Randomize Tree Seed"
          >
            <Dices className="w-4 h-4 text-amber-600" />
          </button>

          {/* Camera Perspective Toggle: 3D Tree vs Flat Scan */}
          <button
            onClick={() => setIsFlat(!isFlat)}
            className={`px-3.5 h-10 rounded-2xl border shadow-md backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
              isFlat
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white/90 text-stone-700 hover:text-stone-900 border-stone-200"
            }`}
            title="Toggle between 3D Tree View and Top-Down Flat Camera Scan"
          >
            <QrIcon className="w-4 h-4 text-amber-500" />
            <span>{isFlat ? "3D Tree View" : "Scan Mode (Flat)"}</span>
          </button>

          {/* Download Snapshot PNG */}
          <button
            onClick={downloadSnapshot}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white border border-stone-200 shadow-md backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-stone-900 transition-all active:scale-95"
            title="Download 4K Snapshot PNG"
          >
            <Download className="w-4 h-4 text-stone-700" />
          </button>

          {/* Share Modal */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-3.5 h-10 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Tree</span>
          </button>
        </div>
      </header>

      {/* Bottom Floating Control Dock (Exact replica of ICQR Magic Tree Dock) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none z-20">
        <div className="w-full bg-white/90 border border-stone-200/90 rounded-[28px] p-4 sm:p-5 shadow-2xl backdrop-blur-xl pointer-events-auto space-y-3.5">
          {/* Target URL Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any link (https://...)"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={() => setIsFlat(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Test Scan</span>
            </button>
          </div>

          {/* Season Selector Row */}
          <div className="flex items-center justify-between gap-2">
            {SEASONS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSeasonIdx(idx)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  seasonIdx === idx
                    ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                    : "bg-stone-100/80 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Palette Swatches Row */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500">Color Palette:</span>
            <div className="flex items-center gap-2">
              {PALETTES.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => setPaletteIdx(idx)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    paletteIdx === idx
                      ? "scale-125 ring-2 ring-stone-900 ring-offset-2 ring-offset-white"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Share Your 3D Magic Tree</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Anyone with this link will open your exact 3D tree, seasonal theme, and scannable QR code!
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-700 truncate"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MagicTreePage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#f6f1e7] flex items-center justify-center text-xs font-bold text-stone-600">Loading Magic Tree 3D Scene...</div>}>
      <MagicTreeCanvas />
    </Suspense>
  );
}

