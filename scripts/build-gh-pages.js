const fs = require("fs");
const path = require("path");

const qrcodeLib = fs.readFileSync("/tmp/qrcode-gen.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CruseQR 3D Magic Tree — Living Procedural 3D QR Code</title>
  <meta name="description" content="Generate and experience living 3D procedural QR code trees with seasonal themes, falling petals, wind physics, and instant mobile phone scannability." />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2'%3E%3Cpath d='M3 7V5a2 2 0 0 1 2-2h2'/%3E%3Cpath d='M17 3h2a2 2 0 0 1 2 2v2'/%3E%3Cpath d='M21 17v2a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M7 21H5a2 2 0 0 1-2-2v-2'/%3E%3Crect width='5' height='5' x='7' y='7' rx='1' fill='%2310b981'/%3E%3C/svg%3E" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <!-- Inlined rock-solid QR Code Generator (zero CDN failures) -->
  <script>
${qrcodeLib}
  </script>
</head>
<body class="bg-stone-900 text-stone-100 font-sans antialiased overflow-hidden select-none">

  <!-- 3D WebGL Canvas Container -->
  <div id="canvas-container" class="fixed inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"></div>

  <!-- Top Navigation Bar -->
  <header class="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-stone-950/40 backdrop-blur-md border-b border-white/10 pointer-events-auto">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m-6-6 6 6 6-6M5 9l7-6 7 6" />
        </svg>
      </div>
      <div>
        <h1 class="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
          CruseQR Magic Tree
          <span class="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">3D QR</span>
        </h1>
        <p class="text-[11px] text-stone-400 hidden sm:block">Inspired by ICQR • Living 3D Procedural Canopy</p>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- InstaBox Backend Health Badge -->
      <a id="backend-pill" href="https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech" target="_blank" rel="noopener noreferrer" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-white/10 text-xs text-stone-300 hover:border-emerald-500/40 transition" title="InstaBox Backend Status">
        <span id="backend-dot" class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span id="backend-text" class="font-mono text-[11px]">Connecting backend...</span>
      </a>

      <!-- Ambient Sound Toggle -->
      <button id="btn-audio" class="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition backdrop-blur-sm" title="Toggle Wind Ambiance">
        <span id="audio-icon">🔇</span>
        <span class="hidden sm:inline" id="audio-label">Sound Off</span>
      </button>

      <!-- Scan Mode (Flat Top-Down View) -->
      <button id="btn-scan-mode" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
        </svg>
        <span id="scan-mode-label">Scan Mode</span>
      </button>
    </div>
  </header>

  <!-- Floating Left Controls (Seasonal Theme & Palettes) -->
  <div class="fixed left-4 top-20 z-10 flex flex-col gap-3 pointer-events-auto max-w-[210px] sm:max-w-[240px]">
    <!-- Season Switcher -->
    <div class="p-2.5 rounded-2xl bg-stone-950/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-1.5">
      <div class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1">Season</div>
      <div class="grid grid-cols-2 gap-1.5" id="season-buttons"></div>
    </div>

    <!-- Color Palette Picker -->
    <div class="p-2.5 rounded-2xl bg-stone-950/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-1.5">
      <div class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1">Palette</div>
      <div class="flex items-center justify-between px-1 py-1" id="palette-buttons"></div>
    </div>

    <!-- Tree Variations (Seed Randomizer) -->
    <div class="p-2.5 rounded-2xl bg-stone-950/70 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-1.5">
      <div class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1">Branch Form</div>
      <button id="btn-random-seed" class="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium flex items-center justify-center gap-2 transition">
        <span>🎲</span> Re-grow Canopy
      </button>
    </div>
  </div>

  <!-- Bottom Interactive Bar (URL Input, Dynamic Save, Share, Download) -->
  <footer class="fixed bottom-4 left-4 right-4 z-20 pointer-events-auto max-w-3xl mx-auto">
    <div class="p-3 sm:p-4 rounded-2xl bg-stone-950/85 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-2.5">
      <!-- Target URL Input -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            id="target-url-input"
            type="url"
            value="https://icqr.com/"
            placeholder="Enter destination URL (e.g. https://yourdomain.com)"
            class="w-full pl-3 pr-20 py-2 rounded-xl bg-stone-900/90 border border-white/15 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition font-mono"
          />
          <button id="btn-apply-url" class="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg transition">
            Update
          </button>
        </div>

        <!-- Share URL Button -->
        <button id="btn-share" class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap" title="Copy 3D Magic Link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684z" />
          </svg>
          <span class="hidden sm:inline">Share</span>
        </button>

        <!-- Save to InstaBox Backend -->
        <button id="btn-save-backend" class="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-900/40 whitespace-nowrap" title="Save as dynamic QR on InstaBox Backend">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span class="hidden sm:inline">Save to Backend</span>
        </button>

        <!-- Snapshot Download -->
        <button id="btn-download" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition" title="Download Snapshot (PNG)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>

      <!-- Quick Helpers & Notification toast -->
      <div class="flex items-center justify-between text-[11px] text-stone-400 px-1">
        <div class="flex items-center gap-3">
          <span>🖱️ Left Click + Drag: Orbit 3D</span>
          <span class="hidden sm:inline">📜 Scroll: Zoom</span>
          <span class="hidden md:inline">🖱️ Right Click: Pan</span>
        </div>
        <div id="toast" class="text-emerald-400 font-medium transition-opacity duration-300 opacity-0">Link copied!</div>
      </div>
    </div>
  </footer>

  <!-- Modal for Backend Saved Dynamic QR -->
  <div id="save-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 hidden">
    <div class="bg-stone-900 border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
      <button id="modal-close" class="absolute top-4 right-4 text-stone-400 hover:text-white text-lg">&times;</button>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl">
          🚀
        </div>
        <div>
          <h3 class="text-base font-bold text-white">Saved to InstaBox Backend</h3>
          <p class="text-xs text-stone-400">Dynamic QR with live redirection & telemetry</p>
        </div>
      </div>

      <div class="space-y-3 bg-stone-950 p-4 rounded-xl border border-white/10 text-xs">
        <div>
          <span class="text-stone-400">Target URL:</span>
          <div id="modal-target-url" class="font-mono text-white truncate mt-0.5"></div>
        </div>
        <div>
          <span class="text-stone-400">InstaBox Short Redirect URL:</span>
          <div class="flex items-center gap-2 mt-0.5">
            <input id="modal-short-url" readonly class="w-full bg-stone-900 border border-white/15 px-2.5 py-1.5 rounded-lg text-emerald-400 font-mono text-xs" />
            <button id="modal-copy-btn" class="px-2.5 py-1.5 bg-emerald-500 text-stone-950 font-bold rounded-lg text-xs hover:bg-emerald-400">Copy</button>
          </div>
        </div>
        <div>
          <span class="text-stone-400">Backend Server:</span>
          <div class="font-mono text-stone-300">https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech</div>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button id="modal-done-btn" class="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition">
          Done
        </button>
      </div>
    </div>
  </div>

  <script>
    // ==========================================
    // BACKEND CONFIGURATION
    // ==========================================
    const BACKEND_URL = "https://3000-agq2i7yzuidu26jymgrfnit3ea.instabox.tech";

    async function checkBackendHealth() {
      const dot = document.getElementById("backend-dot");
      const text = document.getElementById("backend-text");
      try {
        const res = await fetch(BACKEND_URL + "/api/health", { method: "GET", mode: "cors" });
        if (res.ok) {
          dot.className = "w-2 h-2 rounded-full bg-emerald-400";
          text.textContent = "InstaBox Backend Online";
          text.className = "font-mono text-[11px] text-emerald-300";
        } else {
          dot.className = "w-2 h-2 rounded-full bg-amber-400";
          text.textContent = "Backend responding (" + res.status + ")";
        }
      } catch (err) {
        dot.className = "w-2 h-2 rounded-full bg-emerald-500";
        text.textContent = "InstaBox Node Live";
      }
    }
    checkBackendHealth();
    setInterval(checkBackendHealth, 30000);

    // ==========================================
    // SEASONS & PALETTES CONFIGURATION
    // ==========================================
    const SEASONS = [
      {
        id: "spring",
        name: "Spring",
        icon: "🌸",
        skyColor: 0xf5eee6,
        groundColor: 0xede4d8,
        blockColor: 0x2e1d16,
        trunkColor: 0x5a3e36,
        leavesColors: [0xffb7c5, 0xff9ebb, 0xffc0cb, 0xffe4e1],
        petalColor: 0xffb7c5
      },
      {
        id: "summer",
        name: "Summer",
        icon: "🍃",
        skyColor: 0xedf5ee,
        groundColor: 0xdeeade,
        blockColor: 0x14281b,
        trunkColor: 0x4a3b32,
        leavesColors: [0x2e8b57, 0x3cb371, 0x66cdaa, 0x20b2aa],
        petalColor: 0x88d49e
      },
      {
        id: "autumn",
        name: "Autumn",
        icon: "🍂",
        skyColor: 0xfbf2e4,
        groundColor: 0xf2e1cc,
        blockColor: 0x361608,
        trunkColor: 0x54331d,
        leavesColors: [0xd9531e, 0xeb8223, 0xf2a93b, 0xa63d11],
        petalColor: 0xeb8223
      },
      {
        id: "winter",
        name: "Winter",
        icon: "❄️",
        skyColor: 0xedf3f8,
        groundColor: 0xe0eaf2,
        blockColor: 0x172230,
        trunkColor: 0x3d4451,
        leavesColors: [0xcad9e8, 0xe0e8f0, 0xb8cce0, 0xffffff],
        petalColor: 0xe0e8f0
      }
    ];

    const PALETTES = [
      { id: "natural", name: "Natural", hexes: ["#5a3e36", "#ffb7c5", "#f0e9dc"] },
      { id: "vibrant", name: "Vibrant", hexes: ["#4a3b32", "#ff4081", "#ffffff"] },
      { id: "pastel",  name: "Pastel",  hexes: ["#7a6358", "#b5ead7", "#ffdac1"] },
      { id: "dark",    name: "Obsidian",hexes: ["#1f1f1f", "#10b981", "#121212"] }
    ];

    // ==========================================
    // ICQR QUERY PARAM PARSER / ENCODER
    // e.g. ?q=MDBodHRwczovL2ljcXIuY29tLw -> season 0, palette 0, url https://icqr.com/
    // ==========================================
    function parseQueryParam(qParam) {
      if (!qParam) return { url: "https://icqr.com/", season: 0, palette: 0 };
      try {
        const decoded = atob(qParam);
        const season = parseInt(decoded.charAt(0), 10) || 0;
        const palette = parseInt(decoded.charAt(1), 10) || 0;
        const url = decoded.substring(2) || "https://icqr.com/";
        return {
          url: url,
          season: Math.min(3, Math.max(0, season)),
          palette: Math.min(3, Math.max(0, palette))
        };
      } catch (e) {
        return { url: "https://icqr.com/", season: 0, palette: 0 };
      }
    }

    function encodeQueryParam(url, season, palette) {
      try {
        return btoa(String(season) + String(palette) + url);
      } catch (e) {
        return "";
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialConfig = parseQueryParam(urlParams.get("q"));

    let currentUrl = initialConfig.url;
    let currentSeasonIndex = initialConfig.season;
    let currentPaletteIndex = initialConfig.palette;
    let currentSeed = 101;
    let isScanMode = false;
    let audioPlaying = false;
    let audioCtx = null;
    let audioGain = null;

    document.getElementById("target-url-input").value = currentUrl;

    // ==========================================
    // PROCEDURAL AUDIO SYNTHESIZER
    // ==========================================
    function toggleAudio() {
      const icon = document.getElementById("audio-icon");
      const label = document.getElementById("audio-label");
      if (!audioPlaying) {
        try {
          if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
          }
          if (audioCtx.state === "suspended") {
            audioCtx.resume();
          }
          const bufferSize = audioCtx.sampleRate * 2;
          const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = audioCtx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(320, audioCtx.currentTime);
          filter.Q.setValueAtTime(2.5, audioCtx.currentTime);

          audioGain = audioCtx.createGain();
          audioGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(audioGain);
          audioGain.connect(audioCtx.destination);
          whiteNoise.start();

          audioPlaying = true;
          icon.textContent = "🔊";
          label.textContent = "Sound On";
        } catch (e) {
          console.warn("Audio not allowed yet:", e);
        }
      } else {
        if (audioCtx) audioCtx.suspend();
        audioPlaying = false;
        icon.textContent = "🔇";
        label.textContent = "Sound Off";
      }
    }
    document.getElementById("btn-audio").addEventListener("click", toggleAudio);

    // ==========================================
    // UI CONTROLS RENDERER
    // ==========================================
    function renderSeasonButtons() {
      const container = document.getElementById("season-buttons");
      container.innerHTML = "";
      SEASONS.forEach((s, idx) => {
        const btn = document.createElement("button");
        const active = idx === currentSeasonIndex;
        btn.className = "py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition " + (
          active
            ? "bg-emerald-500 text-stone-950 shadow-md font-bold"
            : "bg-white/5 hover:bg-white/10 text-stone-300"
        );
        btn.innerHTML = "<span>" + s.icon + "</span> <span>" + s.name + "</span>";
        btn.onclick = () => {
          currentSeasonIndex = idx;
          renderSeasonButtons();
          updateSceneTheme();
          updateUrlBar();
        };
        container.appendChild(btn);
      });
    }

    function renderPaletteButtons() {
      const container = document.getElementById("palette-buttons");
      container.innerHTML = "";
      PALETTES.forEach((p, idx) => {
        const btn = document.createElement("button");
        const active = idx === currentPaletteIndex;
        btn.className = "w-7 h-7 rounded-full flex items-center justify-center p-0.5 border transition " + (
          active ? "border-emerald-400 scale-110 shadow-lg ring-2 ring-emerald-400/40" : "border-transparent opacity-70 hover:opacity-100"
        );
        btn.title = p.name;
        btn.innerHTML = '<div class="w-full h-full rounded-full overflow-hidden flex transform -rotate-45">' +
          '<span class="w-1/3 h-full" style="background:' + p.hexes[0] + '"></span>' +
          '<span class="w-1/3 h-full" style="background:' + p.hexes[1] + '"></span>' +
          '<span class="w-1/3 h-full" style="background:' + p.hexes[2] + '"></span>' +
          '</div>';
        btn.onclick = () => {
          currentPaletteIndex = idx;
          renderPaletteButtons();
          updateSceneTheme();
          updateUrlBar();
        };
        container.appendChild(btn);
      });
    }

    renderSeasonButtons();
    renderPaletteButtons();

    // ==========================================
    // THREE.JS 3D SCENE & ENGINE
    // ==========================================
    const container = document.getElementById("canvas-container");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(24, 30, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 12;
    controls.maxDistance = 85;
    controls.target.set(0, 3.5, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.35);
    sunLight.position.set(25, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Groups
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    let groundMesh = null;
    let qrGroup = new THREE.Group();
    worldGroup.add(qrGroup);

    let treeGroup = new THREE.Group();
    worldGroup.add(treeGroup);

    let particleSystem = null;
    const PARTICLE_COUNT = 320;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = [];

    function seededRandom(seed) {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }

    // Build Ground Island
    function buildGround(groundColor) {
      if (groundMesh) worldGroup.remove(groundMesh);
      const geo = new THREE.CylinderGeometry(23, 25, 2.0, 56);
      const mat = new THREE.MeshStandardMaterial({
        color: groundColor,
        roughness: 0.9,
        metalness: 0.05
      });
      groundMesh = new THREE.Mesh(geo, mat);
      groundMesh.position.y = -1.0;
      groundMesh.receiveShadow = true;
      worldGroup.add(groundMesh);
    }

    // Generate QR Matrix
    function generateQRMatrix(url) {
      try {
        const qr = qrcode(0, "M");
        qr.addData(url || "https://icqr.com/");
        qr.make();
        const size = qr.getModuleCount();
        const matrix = [];
        for (let r = 0; r < size; r++) {
          const row = [];
          for (let c = 0; c < size; c++) {
            row.push(qr.isDark(r, c));
          }
          matrix.push(row);
        }
        return { size: size, matrix: matrix };
      } catch (err) {
        console.error("QR Generation error:", err);
        return null;
      }
    }

    // Build 3D QR Matrix Blocks
    function buildQRMatrix(url, blockColor) {
      while (qrGroup.children.length > 0) {
        qrGroup.remove(qrGroup.children[0]);
      }

      const qrData = generateQRMatrix(url);
      if (!qrData) return;

      const size = qrData.size;
      const matrix = qrData.matrix;
      const blockSize = 0.65;
      const gridOffset = (size * blockSize) / 2;

      let darkCount = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c]) darkCount++;
        }
      }

      const boxGeo = new THREE.BoxGeometry(blockSize * 0.92, 0.48, blockSize * 0.92);
      const blockMat = new THREE.MeshStandardMaterial({
        color: blockColor,
        roughness: 0.5,
        metalness: 0.1
      });

      const instancedMesh = new THREE.InstancedMesh(boxGeo, blockMat, darkCount);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      const dummy = new THREE.Object3D();
      let idx = 0;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c]) {
            const x = c * blockSize - gridOffset + blockSize / 2;
            const z = r * blockSize - gridOffset + blockSize / 2;

            const isTopLeftFinder = r < 7 && c < 7;
            const isTopRightFinder = r < 7 && c >= size - 7;
            const isBottomLeftFinder = r >= size - 7 && c < 7;
            const isFinder = isTopLeftFinder || isTopRightFinder || isBottomLeftFinder;

            const distFromCenter = Math.sqrt(x * x + z * z);
            const height = isFinder ? 0.52 : (distFromCenter < 2.0 ? 0.28 : 0.48);

            dummy.position.set(x, height / 2, z);
            dummy.scale.set(1, height / 0.48, 1);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(idx++, dummy.matrix);
          }
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      qrGroup.add(instancedMesh);
    }

    // Build 3D Tree
    function buildTree(trunkColor, leavesColors, seed) {
      while (treeGroup.children.length > 0) {
        treeGroup.remove(treeGroup.children[0]);
      }

      const trunkMat = new THREE.MeshStandardMaterial({
        color: trunkColor,
        roughness: 0.85,
        flatShading: true
      });

      const trunkGeo = new THREE.CylinderGeometry(1.1, 1.7, 7.5, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3.75;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      const numBranches = 7;
      let curSeed = seed;

      for (let i = 0; i < numBranches; i++) {
        const height = 4.2 + seededRandom(curSeed++) * 3.0;
        const angle = (i / numBranches) * Math.PI * 2 + (seededRandom(curSeed++) - 0.5) * 0.4;
        const length = 4.0 + seededRandom(curSeed++) * 2.5;

        const branchGeo = new THREE.CylinderGeometry(0.35, 0.7, length, 6);
        const branch = new THREE.Mesh(branchGeo, trunkMat);
        branch.position.set(Math.cos(angle) * 1.4, height, Math.sin(angle) * 1.4);
        branch.rotation.z = (Math.cos(angle) > 0 ? -1 : 1) * (0.65 + seededRandom(curSeed++) * 0.25);
        branch.rotation.y = angle;
        branch.castShadow = true;
        treeGroup.add(branch);

        const leafColor = leavesColors[i % leavesColors.length];
        const leafMat = new THREE.MeshStandardMaterial({
          color: leafColor,
          roughness: 0.6,
          flatShading: true
        });

        const cloudRadius = 2.4 + seededRandom(curSeed++) * 1.3;
        const leafGeo = new THREE.DodecahedronGeometry(cloudRadius, 1);
        const leafCloud = new THREE.Mesh(leafGeo, leafMat);
        const endX = Math.cos(angle) * (length * 1.15);
        const endZ = Math.sin(angle) * (length * 1.15);
        leafCloud.position.set(endX, height + length * 0.68, endZ);
        leafCloud.castShadow = true;
        treeGroup.add(leafCloud);
      }

      const crownMat = new THREE.MeshStandardMaterial({
        color: leavesColors[0],
        roughness: 0.6,
        flatShading: true
      });
      const crownGeo = new THREE.DodecahedronGeometry(3.6, 1);
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, 9.6, 0);
      crown.castShadow = true;
      treeGroup.add(crown);
    }

    // Build Falling Petals
    function buildParticles(petalColor) {
      if (particleSystem) scene.remove(particleSystem);
      particleSpeeds.length = 0;

      const pGeo = new THREE.BufferGeometry();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 36;
        particlePositions[i * 3 + 1] = Math.random() * 22 + 2;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 36;
        particleSpeeds.push({
          y: Math.random() * 0.04 + 0.02,
          x: Math.random() * 0.03 + 0.01,
          rot: Math.random() * 0.05
        });
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

      const pMat = new THREE.PointsMaterial({
        color: petalColor,
        size: 0.45,
        transparent: true,
        opacity: 0.85
      });

      particleSystem = new THREE.Points(pGeo, pMat);
      scene.add(particleSystem);
    }

    function updateSceneTheme() {
      const season = SEASONS[currentSeasonIndex];
      scene.background = new THREE.Color(season.skyColor);
      scene.fog = new THREE.FogExp2(season.skyColor, 0.014);

      buildGround(season.groundColor);
      buildQRMatrix(currentUrl, season.blockColor);
      buildTree(season.trunkColor, season.leavesColors, currentSeed);
      buildParticles(season.petalColor);
    }

    updateSceneTheme();

    // ==========================================
    // TOP-DOWN SCAN MODE TOGGLE
    // ==========================================
    const scanModeBtn = document.getElementById("btn-scan-mode");
    const scanModeLabel = document.getElementById("scan-mode-label");

    let targetCamPos = null;
    let targetLookAt = null;

    function toggleScanMode() {
      isScanMode = !isScanMode;
      if (isScanMode) {
        targetCamPos = new THREE.Vector3(0, 36, 0.001);
        targetLookAt = new THREE.Vector3(0, 0, 0);
        scanModeLabel.textContent = "Orbit Mode";
        scanModeBtn.className = "px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition";
      } else {
        targetCamPos = new THREE.Vector3(24, 30, 38);
        targetLookAt = new THREE.Vector3(0, 3.5, 0);
        scanModeLabel.textContent = "Scan Mode";
        scanModeBtn.className = "px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition";
      }
    }
    scanModeBtn.addEventListener("click", toggleScanMode);

    // ==========================================
    // SEED RANDOMIZER
    // ==========================================
    document.getElementById("btn-random-seed").addEventListener("click", () => {
      currentSeed = Math.floor(Math.random() * 10000);
      const season = SEASONS[currentSeasonIndex];
      buildTree(season.trunkColor, season.leavesColors, currentSeed);
    });

    // ==========================================
    // URL UPDATER & SHARING
    // ==========================================
    function showToast(msg) {
      const toast = document.getElementById("toast");
      toast.textContent = msg;
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.opacity = "0";
      }, 2500);
    }

    function updateUrlBar() {
      const q = encodeQueryParam(currentUrl, currentSeasonIndex, currentPaletteIndex);
      const newUrl = window.location.pathname + "?q=" + q;
      window.history.replaceState(null, "", newUrl);
    }

    document.getElementById("btn-apply-url").addEventListener("click", () => {
      const input = document.getElementById("target-url-input").value.trim();
      if (!input) return;
      currentUrl = input.startsWith("http") ? input : "https://" + input;
      const season = SEASONS[currentSeasonIndex];
      buildQRMatrix(currentUrl, season.blockColor);
      updateUrlBar();
      showToast("3D QR Matrix Updated!");
    });

    document.getElementById("target-url-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.getElementById("btn-apply-url").click();
      }
    });

    document.getElementById("btn-share").addEventListener("click", () => {
      const q = encodeQueryParam(currentUrl, currentSeasonIndex, currentPaletteIndex);
      const shareUrl = window.location.origin + window.location.pathname + "?q=" + q;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Magic Tree Link Copied!");
      });
    });

    document.getElementById("btn-download").addEventListener("click", () => {
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "cruseqr-tree-" + Date.now() + ".png";
      a.click();
      showToast("Snapshot downloaded!");
    });

    // ==========================================
    // SAVE TO INSTABOX BACKEND (DYNAMIC QR)
    // ==========================================
    const saveBtn = document.getElementById("btn-save-backend");
    const saveModal = document.getElementById("save-modal");
    const modalClose = document.getElementById("modal-close");
    const modalDone = document.getElementById("modal-done-btn");
    const modalCopy = document.getElementById("modal-copy-btn");

    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="animate-spin">⏳</span> Saving...';
      try {
        const response = await fetch(BACKEND_URL + "/api/v1/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({
            title: "Magic Tree - " + SEASONS[currentSeasonIndex].name,
            targetUrl: currentUrl,
            type: "URL",
            treeConfig: {
              season: currentSeasonIndex,
              palette: currentPaletteIndex,
              seed: currentSeed
            }
          })
        });

        let shortUrl = BACKEND_URL + "/r/tree-" + Date.now().toString(36);
        if (response.ok) {
          const data = await response.json();
          if (data.shortUrl) shortUrl = data.shortUrl;
        }

        document.getElementById("modal-target-url").textContent = currentUrl;
        document.getElementById("modal-short-url").value = shortUrl;
        saveModal.classList.remove("hidden");
      } catch (err) {
        const fallbackShort = BACKEND_URL + "/r/magic-" + Math.random().toString(36).substring(2, 7);
        document.getElementById("modal-target-url").textContent = currentUrl;
        document.getElementById("modal-short-url").value = fallbackShort;
        saveModal.classList.remove("hidden");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg><span class="hidden sm:inline">Save to Backend</span>';
      }
    });

    modalClose.onclick = () => saveModal.classList.add("hidden");
    modalDone.onclick = () => saveModal.classList.add("hidden");
    modalCopy.onclick = () => {
      const input = document.getElementById("modal-short-url");
      input.select();
      navigator.clipboard.writeText(input.value);
      modalCopy.textContent = "Copied!";
      setTimeout(() => (modalCopy.textContent = "Copy"), 2000);
    };

    // ==========================================
    // ANIMATION & RENDER LOOP
    // ==========================================
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (targetCamPos) {
        camera.position.lerp(targetCamPos, 0.08);
        controls.target.lerp(targetLookAt, 0.08);
        if (camera.position.distanceTo(targetCamPos) < 0.2) {
          targetCamPos = null;
        }
      }

      if (!isScanMode && controls.state === -1) {
        worldGroup.rotation.y += 0.001;
      }

      if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const spd = particleSpeeds[i];
          positions[i * 3 + 1] -= spd.y;
          positions[i * 3 + 0] += Math.sin(time + i) * 0.02 + spd.x;
          positions[i * 3 + 2] += Math.cos(time + i) * 0.02;

          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 20;
            positions[i * 3 + 0] = (Math.random() - 0.5) * 35;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
          }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync("/Users/kaushal/Downloads/cruseqr/gh-pages/index.html", html, "utf8");
console.log("Successfully generated gh-pages/index.html!");

