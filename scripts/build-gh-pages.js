const fs = require("fs");
const path = require("path");

const qrcodeLib = fs.readFileSync("/tmp/qrcode-gen.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
<title>CruseQR Magic Tree — Next-Gen 3D Interactive Botanical QR</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%; height: 100%;
    background: #f7f3eb;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
    user-select: none; -webkit-user-select: none;
    -webkit-font-smoothing: antialiased;
    color: #1f1d1a;
  }

  #canvas-container {
    position: fixed; inset: 0; width: 100%; height: 100%;
    cursor: grab; z-index: 1;
  }
  #canvas-container:active { cursor: grabbing; }
  canvas { display: block; width: 100% !important; height: 100% !important; }

  /* Ambient Vignette & Sky Glow */
  .sky-ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 2;
    background: radial-gradient(circle at 50% 30%, rgba(255, 250, 242, 0.45) 0%, rgba(240, 233, 220, 0.7) 100%);
  }

  /* Top Minimalist Header */
  #header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; pointer-events: none;
  }
  .brand-chip {
    pointer-events: auto; cursor: pointer;
    display: inline-flex; align-items: center; gap: 10px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.9);
    padding: 6px 14px 6px 8px; border-radius: 999px;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .brand-chip:hover {
    background: rgba(255, 255, 255, 0.92);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .brand-badge {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, #c27d53, #e09f67);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 800;
  }
  .brand-name {
    font-weight: 800; font-size: 14px; letter-spacing: -0.02em; color: #1c1917;
  }
  .brand-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: #c27d53; background: rgba(194, 125, 83, 0.12); padding: 2px 7px; border-radius: 999px;
  }

  .header-actions {
    pointer-events: auto; display: flex; align-items: center; gap: 8px;
  }
  .btn-icon-round {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #57534e; transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(0,0,0,0.03);
  }
  .btn-icon-round:hover {
    background: #fff; color: #1c1917; transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.07);
  }

  /* Center Floating Tap Pill */
  #action-pill {
    position: fixed; bottom: 146px; left: 50%; transform: translateX(-50%);
    z-index: 20; cursor: pointer;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.03);
    border-radius: 999px; padding: 9px 20px;
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: #44403c;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
  }
  #action-pill:hover {
    background: #ffffff; color: #0c0a09;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  }
  #action-pill:active { transform: translateX(-50%) scale(0.96); }
  .pill-pulse {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25);
    animation: pulseDot 2s infinite ease-in-out;
  }
  @keyframes pulseDot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.6; }
  }

  /* Scan Reticle Overlay in QR Mode */
  #scan-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 10;
    display: none; align-items: center; justify-content: center;
    transition: opacity 0.4s ease; opacity: 0;
  }
  #scan-overlay.active {
    display: flex; opacity: 1;
  }
  .scan-reticle {
    width: 280px; height: 280px; position: relative;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.08);
    border-radius: 20px;
  }
  .reticle-corner {
    position: absolute; width: 24px; height: 24px;
    border-color: #c27d53; border-style: solid; border-width: 0;
  }
  .reticle-tl { top: -2px; left: -2px; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 12px; }
  .reticle-tr { top: -2px; right: -2px; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 12px; }
  .reticle-bl { bottom: -2px; left: -2px; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 12px; }
  .reticle-br { bottom: -2px; right: -2px; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 12px; }
  .reticle-beam {
    position: absolute; left: 6px; right: 6px; height: 2px;
    background: linear-gradient(90deg, transparent, #c27d53, #e09f67, #c27d53, transparent);
    top: 10%; box-shadow: 0 0 10px rgba(194, 125, 83, 0.6);
    animation: scanBeam 2.4s ease-in-out infinite alternate;
  }
  @keyframes scanBeam {
    0% { top: 8%; opacity: 0.3; }
    50% { opacity: 1; }
    100% { top: 92%; opacity: 0.3; }
  }

  /* Bottom Contemporary Floating Glass Dock */
  #dock {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 36px); max-width: 480px; z-index: 20;
    display: flex; flex-direction: column; gap: 10px;
  }

  .dock-card {
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
    border-radius: 20px; padding: 12px 14px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.02);
    display: flex; flex-direction: column; gap: 10px;
  }

  /* URL Bar Row */
  .url-row {
    display: flex; align-items: center; gap: 8px;
    background: #f4ede3; border-radius: 14px;
    padding: 5px 6px 5px 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
  .url-icon {
    color: #a8a29e; font-size: 14px; flex-shrink: 0;
  }
  .url-input {
    flex: 1; border: none; outline: none; background: transparent;
    font-size: 13px; font-weight: 600; color: #1c1917;
    font-family: inherit; overflow: hidden; text-overflow: ellipsis;
  }
  .url-input::placeholder { color: #a8a29e; font-weight: 400; }
  .btn-submit {
    padding: 8px 14px; border-radius: 10px;
    background: #c27d53; border: none; color: #ffffff;
    font-size: 12px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(194, 125, 83, 0.35);
    flex-shrink: 0;
  }
  .btn-submit:hover { background: #b06c42; transform: translateY(-1px); }
  .btn-submit:active { transform: scale(0.95); }

  /* Season & Audio Controls Row */
  .controls-row {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .season-segment {
    display: flex; align-items: center; background: #eae3d6;
    border-radius: 12px; padding: 3px; flex: 1;
  }
  .season-tab {
    flex: 1; padding: 7px 6px; border-radius: 9px; border: none;
    background: transparent; font-size: 12px; font-weight: 600; color: #78716c;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .season-tab:hover { color: #292524; }
  .season-tab.active {
    background: #ffffff; color: #1c1917; font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .btn-icon-dock {
    width: 36px; height: 36px; border-radius: 12px;
    background: #eae3d6; border: none; color: #78716c;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }
  .btn-icon-dock:hover { background: #dfd7c9; color: #1c1917; }
  .btn-icon-dock.active { background: #c27d53; color: #ffffff; }

  /* Color Palette Row */
  .palette-row {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding-top: 2px;
  }
  .swatch {
    width: 22px; height: 22px; border-radius: 50%;
    border: none; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    position: relative;
  }
  .swatch:hover { transform: scale(1.18); }
  .swatch.active {
    transform: scale(1.25);
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1c1917;
  }

  /* Share Modal */
  #modal-bg {
    position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.38);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    display: none; align-items: center; justify-content: center; padding: 20px;
  }
  #modal-bg.open { display: flex; }
  #modal {
    background: #ffffff; border-radius: 24px; padding: 26px;
    max-width: 400px; width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.8);
  }
  .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .modal-title { font-size: 16px; font-weight: 800; color: #1c1917; }
  .modal-close {
    width: 30px; height: 30px; border-radius: 50%; border: none;
    background: #f5f5f4; color: #78716c; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .modal-close:hover { background: #e7e5e4; color: #1c1917; }
  .modal-desc { font-size: 13px; color: #78716c; margin-bottom: 16px; line-height: 1.5; }
  .modal-input-row { display: flex; align-items: center; gap: 8px; }
  #share-url {
    flex: 1; padding: 10px 14px; border-radius: 12px; background: #f5f5f4;
    border: 1px solid #e7e5e4; font-size: 12px; font-family: "JetBrains Mono", monospace;
    color: #292524; outline: none;
  }
  .btn-modal-copy {
    padding: 10px 16px; border-radius: 12px; background: #c27d53;
    border: none; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer;
    white-space: nowrap; transition: all 0.2s;
  }
  .btn-modal-copy:hover { background: #b06c42; }

  /* Info Modal */
  #info-modal-bg {
    position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.38);
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    display: none; align-items: center; justify-content: center; padding: 20px;
  }
  #info-modal-bg.open { display: flex; }
  .info-modal {
    background: #ffffff; border-radius: 24px; padding: 26px;
    max-width: 420px; width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.2);
  }
  .info-feature-list {
    margin-top: 14px; display: flex; flex-direction: column; gap: 10px;
  }
  .info-feature-item {
    display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #44403c; line-height: 1.4;
  }
  .info-feature-icon {
    width: 22px; height: 22px; border-radius: 6px; background: rgba(194, 125, 83, 0.15);
    color: #c27d53; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;
  }
</style>

<!-- Inlined Verified QR Code Generator Engine -->
<script>
${qrcodeLib}
</script>

<!-- Three.js CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>

<div class="sky-ambient"></div>
<div id="canvas-container"></div>

<!-- Top Minimalist Bar -->
<header id="header">
  <div class="brand-chip" id="brand-chip" title="CruseQR Magic Tree">
    <div class="brand-badge">🌸</div>
    <span class="brand-name">CruseQR</span>
    <span class="brand-tag">Magic Tree</span>
  </div>

  <div class="header-actions">
    <button class="btn-icon-round" id="btn-info" title="About & Features">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </button>
    <button class="btn-icon-round" id="btn-share-top" title="Share Magic Tree">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
      </svg>
    </button>
  </div>
</header>

<!-- Floating Action Pill -->
<button id="action-pill">
  <span class="pill-pulse"></span>
  <span id="pill-label">Tap tree to view QR code</span>
</button>

<!-- Scan Overlay with Animated Reticle -->
<div id="scan-overlay">
  <div class="scan-reticle">
    <div class="reticle-corner reticle-tl"></div>
    <div class="reticle-corner reticle-tr"></div>
    <div class="reticle-corner reticle-bl"></div>
    <div class="reticle-corner reticle-br"></div>
    <div class="reticle-beam"></div>
  </div>
</div>

<!-- Bottom Floating Glass Island Dock -->
<div id="dock">
  <div class="dock-card">
    <!-- URL Input Row -->
    <div class="url-row">
      <span class="url-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </span>
      <input type="text" id="url-input" class="url-input" placeholder="Enter any URL..." autocomplete="off" spellcheck="false"/>
      <button class="btn-submit" id="btn-generate">
        <span>Generate</span>
      </button>
    </div>

    <!-- Controls Row: Season Slider + Audio -->
    <div class="controls-row">
      <div class="season-segment">
        <button class="season-tab active" data-season="0">
          <span>🌸</span> <span>Spring</span>
        </button>
        <button class="season-tab" data-season="1">
          <span>🌿</span> <span>Summer</span>
        </button>
        <button class="season-tab" data-season="2">
          <span>🍁</span> <span>Autumn</span>
        </button>
      </div>

      <button class="btn-icon-dock" id="btn-sound" title="Toggle Nature Sounds">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="sound-icon-on">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </button>
    </div>

    <!-- Palette Swatches Row -->
    <div class="palette-row" id="palette-row"></div>
  </div>
</div>

<!-- Share Modal -->
<div id="modal-bg">
  <div id="modal">
    <div class="modal-head">
      <span class="modal-title">Share Magic Tree</span>
      <button class="modal-close" id="modal-close">&times;</button>
    </div>
    <p class="modal-desc">Share your interactive 3D living QR tree with anyone. Works in any modern mobile or desktop browser.</p>
    <div class="modal-input-row">
      <input type="text" id="share-url" readonly />
      <button class="btn-modal-copy" id="btn-copy">Copy Link</button>
    </div>
  </div>
</div>

<!-- Info Modal -->
<div id="info-modal-bg">
  <div class="info-modal">
    <div class="modal-head">
      <span class="modal-title">About CruseQR Magic Tree</span>
      <button class="modal-close" id="info-modal-close">&times;</button>
    </div>
    <p class="modal-desc">A state-of-the-art interactive 3D procedural botanical tree engineered directly into a fully scannable QR code mosaic.</p>
    <div class="info-feature-list">
      <div class="info-feature-item">
        <div class="info-feature-icon">🌳</div>
        <div><strong>Botanical Branch Skeleton:</strong> Multi-tiered organic boughs, buttress roots, and natural weeping cherry blossom branches.</div>
      </div>
      <div class="info-feature-item">
        <div class="info-feature-icon">✨</div>
        <div><strong>1,600+ Blossom Clusters:</strong> Layered petal cloud with botanical color depth, translucency, and fallen petals.</div>
      </div>
      <div class="info-feature-item">
        <div class="info-feature-icon">📱</div>
        <div><strong>Dual Camera Modes:</strong> Seamlessly glide between 3D isometric view and overhead top-down view for 100% camera scanning.</div>
      </div>
      <div class="info-feature-item">
        <div class="info-feature-icon">🍃</div>
        <div><strong>Harmonic Wind Physics:</strong> Realistic multi-frequency wind swaying and dynamic floating seasonal particles.</div>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  // ── Color & Season Definitions ─────────────────────────────────────────────
  var PALETTES = [
    { name: "Sakura Pink", color: "#f48fb1", hex: 0xf48fb1 },
    { name: "Wisteria Lavender", color: "#b39ddb", hex: 0xb39ddb },
    { name: "Crimson Maple", color: "#e57373", hex: 0xe57373 },
    { name: "Golden Gingko", color: "#ffb74d", hex: 0xffb74d },
    { name: "Cerulean Sky", color: "#64b5f6", hex: 0x64b5f6 },
    { name: "Emerald Pine", color: "#81c784", hex: 0x81c784 }
  ];

  var SEASONS = [
    {
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
      weatherType: "autumnLeaves"
    }
  ];

  function cleanUrl(s) {
    if (!s) return location.href;
    var trimmed = s.trim();
    if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
      return trimmed;
    }
    return "https://" + trimmed;
  }

  function parseInitialQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        var raw = atob(q);
        var sIdx = parseInt(raw.charAt(0)) || 0;
        var pIdx = parseInt(raw.charAt(1)) || 0;
        var rest = raw.substring(2);
        return {
          url: cleanUrl(rest),
          season: Math.max(0, Math.min(2, sIdx)),
          palette: Math.max(0, Math.min(5, pIdx))
        };
      }
    } catch(e) {}
    return {
      url: window.location.href,
      season: 0,
      palette: 0
    };
  }

  var init = parseInitialQuery();
  var state = {
    url: init.url,
    season: init.season,
    palette: init.palette,
    qrMode: false,
    soundEnabled: false,
    seed: 1337
  };

  // Seeded PRNG for deterministic natural beauty
  function makeRng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // ── Web Audio Nature Synthesizer ───────────────────────────────────────────
  var audioCtx = null;
  function playOrganicChime() {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      var now = audioCtx.currentTime;
      var notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C pentatonic chime
      var note = notes[Math.floor(Math.random() * notes.length)];

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch(e) {}
  }

  // ── Three.js Scene Setup ───────────────────────────────────────────────────
  var container = document.getElementById('canvas-container');
  var scene, camera, renderer, clock;
  var rootGroup, platformGroup, qrGroup, treeGroup, particleMesh, fallenPetalsGroup;

  var cam = {
    pitch: 0.78, yaw: 0.785, dist: 38,
    tPitch: 0.78, tYaw: 0.785, tDist: 38,
    dragging: false, px: 0, py: 0
  };
  var treeScale = 1.0;

  function initThree() {
    var THREE = window.THREE;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(SEASONS[state.season].skyColor);
    scene.fog = new THREE.FogExp2(SEASONS[state.season].skyColor, 0.012);

    camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.5, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Natural Sun & Atmosphere Lighting
    var ambLight = new THREE.AmbientLight(0xfffdf7, 0.95);
    scene.add(ambLight);

    var hemiLight = new THREE.HemisphereLight(0xfff7ed, 0xdcd5c5, 0.5);
    scene.add(hemiLight);

    var sunLight = new THREE.DirectionalLight(0xfff5e6, 1.55);
    sunLight.position.set(24, 46, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left   = -24; sunLight.shadow.camera.right  = 24;
    sunLight.shadow.camera.top    =  24; sunLight.shadow.camera.bottom = -24;
    sunLight.shadow.camera.near   = 0.5; sunLight.shadow.camera.far    = 140;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    rootGroup          = new THREE.Group(); scene.add(rootGroup);
    platformGroup      = new THREE.Group(); rootGroup.add(platformGroup);
    qrGroup            = new THREE.Group(); rootGroup.add(qrGroup);
    treeGroup          = new THREE.Group(); rootGroup.add(treeGroup);
    fallenPetalsGroup  = new THREE.Group(); rootGroup.add(fallenPetalsGroup);

    // Orbit Drag Controls
    container.addEventListener('mousedown', function (e) {
      cam.dragging = true; cam.px = e.clientX; cam.py = e.clientY;
    });
    window.addEventListener('mousemove', function (e) {
      if (!cam.dragging || state.qrMode) return;
      cam.tYaw  -= (e.clientX - cam.px) * 0.0065;
      cam.tPitch = Math.max(0.15, Math.min(1.4, cam.tPitch + (e.clientY - cam.py) * 0.0065));
      cam.px = e.clientX; cam.py = e.clientY;
    });
    window.addEventListener('mouseup', function () { cam.dragging = false; });
    container.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (state.qrMode) return;
      cam.tDist = Math.max(20, Math.min(65, cam.tDist + e.deltaY * 0.035));
    }, { passive: false });

    // Mobile Touch Orbit Controls
    container.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        cam.dragging = true; cam.px = e.touches[0].clientX; cam.py = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!cam.dragging || e.touches.length !== 1 || state.qrMode) return;
      cam.tYaw  -= (e.touches[0].clientX - cam.px) * 0.0085;
      cam.tPitch = Math.max(0.15, Math.min(1.4, cam.tPitch + (e.touches[0].clientY - cam.py) * 0.0085));
      cam.px = e.touches[0].clientX; cam.py = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function () { cam.dragging = false; });

    // Tap to Toggle QR Mode
    container.addEventListener('click', function () {
      toggleQRView();
    });

    window.addEventListener('resize', function () {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    rebuildScene();
    animate();
  }

  function clearGroup(g) {
    while (g.children.length) {
      var c = g.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(function(m){ m.dispose(); });
        else c.material.dispose();
      }
      g.remove(c);
    }
  }

  // ── 1. Floating Zen Garden Platform with Chamfered Stone Edge ──────────────
  function buildPlatform(seasonCfg, qrSize) {
    var THREE = window.THREE;
    clearGroup(platformGroup);

    var bs = 0.54;
    var platSize = (qrSize + 4) * bs;
    var half = platSize / 2;

    // Main sculpted stone platform slab
    var slabGeo = new THREE.BoxGeometry(platSize, 1.25, platSize);
    var slabMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.groundColor,
      roughness: 0.85,
      metalness: 0.03
    });
    var slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = -0.625;
    slab.receiveShadow = true;
    platformGroup.add(slab);

    // Architectural beveled stone base pedestal
    var baseGeo = new THREE.BoxGeometry(platSize + 0.45, 0.4, platSize + 0.45);
    var baseMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.groundEdge,
      roughness: 0.94
    });
    var base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.85;
    base.receiveShadow = true;
    platformGroup.add(base);

    // Decorative Zen Garden Grass Clumps & Flowers around the perimeter
    var grassMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.grassColor,
      roughness: 0.68,
      flatShading: true
    });
    var flowerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4
    });

    var rng = makeRng(8821);

    function addGrassClump(gx, gz) {
      var clump = new THREE.Group();
      clump.position.set(gx, 0.01, gz);
      var blades = 4 + Math.floor(rng() * 4);
      for (var b = 0; b < blades; b++) {
        var h = 0.4 + rng() * 0.55;
        var bladeGeo = new THREE.ConeGeometry(0.06 + rng() * 0.04, h, 4);
        var blade = new THREE.Mesh(bladeGeo, grassMat);
        blade.position.set((rng()-0.5)*0.22, h/2, (rng()-0.5)*0.22);
        blade.rotation.z = (rng()-0.5)*0.45;
        blade.rotation.x = (rng()-0.5)*0.45;
        clump.add(blade);
      }
      // Occasional tiny wild garden flower
      if (rng() > 0.6) {
        var flGeo = new THREE.SphereGeometry(0.08, 6, 6);
        var fl = new THREE.Mesh(flGeo, flowerMat);
        fl.position.set((rng()-0.5)*0.18, 0.48, (rng()-0.5)*0.18);
        clump.add(fl);
      }
      platformGroup.add(clump);
    }

    var edgeDist = half - 0.45;
    for (var x = -edgeDist; x <= edgeDist; x += 0.95) {
      if (rng() > 0.2) addGrassClump(x, -edgeDist);
      if (rng() > 0.2) addGrassClump(x,  edgeDist);
    }
    for (var z = -edgeDist; z <= edgeDist; z += 0.95) {
      if (rng() > 0.2) addGrassClump(-edgeDist, z);
      if (rng() > 0.2) addGrassClump( edgeDist, z);
    }
  }

  // ── 2. Pavement QR Code Mosaic ─────────────────────────────────────────────
  function buildQRPavement(url, seasonCfg, dataColorHex) {
    var THREE = window.THREE;
    clearGroup(qrGroup);

    try {
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      var size = qr.getModuleCount();
      var bs   = 0.54;
      var offset = (size * bs) / 2;

      function isFinder(r, c) {
        if (r < 7 && c < 7) return true;
        if (r < 7 && c >= size - 7) return true;
        if (r >= size - 7 && c < 7) return true;
        return false;
      }

      var finderCount = 0, dataCount = 0, lightCount = 0;
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          if (qr.isDark(r, c)) {
            if (isFinder(r, c)) finderCount++;
            else dataCount++;
          } else {
            lightCount++;
          }
        }
      }

      var blockH = 0.28;
      // High-definition beveled stone tiles
      var geo = new THREE.BoxGeometry(bs * 0.94, blockH, bs * 0.94);

      var lightMat  = new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.92 });
      var finderMat = new THREE.MeshStandardMaterial({ color: seasonCfg.finderColor, roughness: 0.55, flatShading: true });
      var dataMat   = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.55, flatShading: true });

      var lightMesh  = new THREE.InstancedMesh(geo, lightMat, lightCount);
      var finderMesh = new THREE.InstancedMesh(geo, finderMat, finderCount);
      var dataMesh   = new THREE.InstancedMesh(geo, dataMat, dataCount);

      lightMesh.receiveShadow  = true;
      finderMesh.castShadow    = true; finderMesh.receiveShadow = true;
      dataMesh.castShadow      = true; dataMesh.receiveShadow   = true;

      var dummy = new THREE.Object3D();
      var fIdx = 0, dIdx = 0, lIdx = 0;

      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          var x = c * bs - offset + bs / 2;
          var z = r * bs - offset + bs / 2;
          dummy.position.set(x, blockH / 2, z);
          dummy.updateMatrix();

          if (qr.isDark(r, c)) {
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

      return size;
    } catch(e) {
      console.warn("QR pavement error:", e);
      return 29;
    }
  }

  // ── 3. Photorealistic Botanical Tree with Natural Gesture & 1,600+ Petals ──
  function buildHyperRealisticTree(seasonCfg, leafColorHex, seed) {
    var THREE = window.THREE;
    clearGroup(treeGroup);
    clearGroup(fallenPetalsGroup);

    var rng = makeRng(seed);

    // High quality organic bark material with subtle wood specular
    var barkMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.trunkColor,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true
    });

    var leafClusterPositions = [];

    // 1. Organic Root Flare Buttresses gripping the stone ground
    var numRoots = 5;
    for (var ri = 0; ri < numRoots; ri++) {
      var rAngle = (ri / numRoots) * Math.PI * 2 + (rng() - 0.5) * 0.4;
      var rLen   = 1.1 + rng() * 0.5;
      var rootGeo = new THREE.CylinderGeometry(0.18, 0.38, rLen, 6);
      var rootMesh = new THREE.Mesh(rootGeo, barkMat);
      rootMesh.position.set(
        Math.cos(rAngle) * (rLen * 0.38),
        0.18,
        Math.sin(rAngle) * (rLen * 0.38)
      );
      rootMesh.rotation.y = -rAngle;
      rootMesh.rotation.z = 0.55 + rng() * 0.15;
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      treeGroup.add(rootMesh);
    }

    // 2. Segmented Curved Trunk with Natural Bonsai / Sakura Gesture
    var trunkPoints = [
      { x: 0.00, y: 0.00, z: 0.00, r: 0.62 },
      { x: 0.12, y: 0.95, z: 0.08, r: 0.52 },
      { x: -0.08, y: 1.90, z: 0.14, r: 0.44 },
      { x: 0.06, y: 2.85, z: -0.06, r: 0.38 },
      { x: 0.00, y: 3.80, z: 0.00, r: 0.32 }
    ];

    for (var si = 0; si < trunkPoints.length - 1; si++) {
      var p1 = trunkPoints[si];
      var p2 = trunkPoints[si + 1];
      var segLen = Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2) + Math.pow(p2.z-p1.z,2));
      var segGeo = new THREE.CylinderGeometry(p2.r, p1.r, segLen, 8);
      var segMesh = new THREE.Mesh(segGeo, barkMat);
      segMesh.position.set((p1.x + p2.x)/2, (p1.y + p2.y)/2, (p1.z + p2.z)/2);

      var dir = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z).normalize();
      segMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      treeGroup.add(segMesh);
    }

    // 3. Multi-Tiered Organic Branching Scaffold
    function addBough(ox, oy, oz, dx, dy, dz, len, rad, depth) {
      var mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      dx /= mag; dy /= mag; dz /= mag;

      var ex = ox + dx * len;
      var ey = oy + dy * len;
      var ez = oz + dz * len;

      var bGeo = new THREE.CylinderGeometry(rad * 0.72, rad, len, 6);
      var bMesh = new THREE.Mesh(bGeo, barkMat);
      bMesh.position.set((ox + ex)/2, (oy + ey)/2, (oz + ez)/2);
      bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(dx,dy,dz).normalize());
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      treeGroup.add(bMesh);

      // Collect endpoints for dense micro-petal spray clusters
      if (depth >= 2 || len < 1.1) {
        var clustersAtTip = 16 + Math.floor(rng() * 14);
        for (var k = 0; k < clustersAtTip; k++) {
          leafClusterPositions.push({
            x: ex + (rng() - 0.5) * 1.5,
            y: ey + (rng() - 0.45) * 1.3,
            z: ez + (rng() - 0.5) * 1.5,
            scale: 0.32 + rng() * 0.35,
            tier: depth
          });
        }
      }

      if (depth >= 4 || rad < 0.06) return;

      var childCount = depth === 0 ? 5 : (rng() > 0.3 ? 3 : 2);
      for (var c = 0; c < childCount; c++) {
        var spread = 0.45 + rng() * 0.35;
        var angle = (c / childCount) * Math.PI * 2 + (rng() - 0.5) * 0.5;
        var ndx = dx + Math.cos(angle) * spread;
        var ndy = dy + 0.15 + rng() * 0.32;
        var ndz = dz + Math.sin(angle) * spread;
        addBough(ex, ey, ez, ndx, ndy, ndz, len * (0.68 + rng()*0.08), rad * (0.64 + rng()*0.05), depth + 1);
      }
    }

    // 5 primary scaffold limbs branching outward and upward from the top of the trunk
    var forkOrigin = trunkPoints[trunkPoints.length - 1];
    var primaryLimbs = 5;
    for (var pi = 0; pi < primaryLimbs; pi++) {
      var angle = (pi / primaryLimbs) * Math.PI * 2 + (rng() - 0.5) * 0.4;
      var ldx = Math.cos(angle) * 0.72;
      var ldy = 0.55 + rng() * 0.35;
      var ldz = Math.sin(angle) * 0.72;
      addBough(forkOrigin.x, forkOrigin.y, forkOrigin.z, ldx, ldy, ldz, 2.2 + rng() * 0.5, 0.28, 0);
    }

    // Secondary mid-trunk bough for lush volumetric fullness
    addBough(trunkPoints[2].x, trunkPoints[2].y, trunkPoints[2].z, -0.65, 0.45, 0.4, 1.8, 0.22, 1);
    addBough(trunkPoints[3].x, trunkPoints[3].y, trunkPoints[3].z, 0.55, 0.5, -0.5, 1.7, 0.2, 1);

    // 4. Volumetric Crown Dome & Weeping Outer Cherry Blossom Sprays
    var crownCenterY = 5.8;
    for (var v = 0; v < 420; v++) {
      var theta = rng() * Math.PI * 2;
      var phi   = rng() * Math.PI * 0.58;
      var rad   = 1.2 + rng() * 3.4;
      leafClusterPositions.push({
        x: Math.sin(phi) * Math.cos(theta) * rad,
        y: crownCenterY + Math.cos(phi) * (rad * 0.7) + (rng() - 0.5) * 1.1,
        z: Math.sin(phi) * Math.sin(theta) * rad,
        scale: 0.35 + rng() * 0.35,
        tier: 5
      });
    }

    // Weeping outer boughs cascading gently downward (authentic Sakura feature)
    for (var w = 0; w < 220; w++) {
      var wTheta = rng() * Math.PI * 2;
      var wRad   = 2.8 + rng() * 2.2;
      leafClusterPositions.push({
        x: Math.cos(wTheta) * wRad,
        y: 3.4 + rng() * 2.4,
        z: Math.sin(wTheta) * wRad,
        scale: 0.28 + rng() * 0.32,
        tier: 6
      });
    }

    // 5. Instanced Micro-Petal Blossom Cloud (1,600+ elements)
    var totalClusters = leafClusterPositions.length;
    // Multi-faceted soft botanical blossom geometry
    var clusterGeo = new THREE.IcosahedronGeometry(0.52, 1);

    var blossomMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.02,
      flatShading: true
    });

    var blossomMesh = new THREE.InstancedMesh(clusterGeo, blossomMat, totalClusters);
    blossomMesh.castShadow = true;
    blossomMesh.receiveShadow = true;

    var dummy = new THREE.Object3D();
    var baseCol = new THREE.Color(leafColorHex);
    var altCol  = new THREE.Color(seasonCfg.leafAlt);
    var highCol = new THREE.Color(seasonCfg.leafHighlight);

    for (var idx = 0; idx < totalClusters; idx++) {
      var lp = leafClusterPositions[idx];
      dummy.position.set(lp.x, lp.y, lp.z);
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      dummy.scale.set(lp.scale, lp.scale * (0.8 + rng() * 0.35), lp.scale);
      dummy.updateMatrix();
      blossomMesh.setMatrixAt(idx, dummy.matrix);

      // Natural gradient variation across depth & sun exposure
      var blend = rng();
      var cCol = new THREE.Color();
      if (blend < 0.55) {
        cCol.copy(baseCol).lerp(altCol, rng() * 0.45);
      } else if (blend < 0.85) {
        cCol.copy(altCol).lerp(baseCol, rng() * 0.35);
      } else {
        cCol.copy(highCol).lerp(altCol, 0.4);
      }
      blossomMesh.setColorAt(idx, cCol);
    }

    blossomMesh.instanceMatrix.needsUpdate = true;
    if (blossomMesh.instanceColor) blossomMesh.instanceColor.needsUpdate = true;
    treeGroup.add(blossomMesh);

    // 6. Scattered Fallen Petals around the tree base on the pavement
    var numFallen = 90;
    var petalGeo = new THREE.CircleGeometry(0.12, 5);
    var petalMat = new THREE.MeshStandardMaterial({
      color: leafColorHex,
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    var fallenMesh = new THREE.InstancedMesh(petalGeo, petalMat, numFallen);
    var fDummy = new THREE.Object3D();

    for (var f = 0; f < numFallen; f++) {
      var fRad = 0.8 + rng() * 4.2;
      var fAng = rng() * Math.PI * 2;
      fDummy.position.set(Math.cos(fAng) * fRad, 0.29, Math.sin(fAng) * fRad);
      fDummy.rotation.set(-Math.PI / 2, 0, rng() * Math.PI * 2);
      var sc = 0.5 + rng() * 0.6;
      fDummy.scale.set(sc, sc, sc);
      fDummy.updateMatrix();
      fallenMesh.setMatrixAt(f, fDummy.matrix);
    }
    fallenMesh.instanceMatrix.needsUpdate = true;
    fallenPetalsGroup.add(fallenMesh);
  }

  // ── 4. Weather Particles (Drifting Cherry Petals / Summer Leaves / Rain) ─────
  function buildParticles(seasonCfg, particleColorHex) {
    var THREE = window.THREE;
    if (particleMesh) scene.remove(particleMesh);

    var isRain = seasonCfg.weatherType === 'rain';
    var count = isRain ? 320 : 180;
    var pos = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      pos[i*3]     = (Math.random() - 0.5) * 32;
      pos[i*3 + 1] = Math.random() * 26 + 1;
      pos[i*3 + 2] = (Math.random() - 0.5) * 32;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    var size = isRain ? 0.22 : 0.44;
    var mat = new THREE.PointsMaterial({
      color: particleColorHex,
      size: size,
      transparent: true,
      opacity: 0.88
    });

    particleMesh = new THREE.Points(geo, mat);
    scene.add(particleMesh);
  }

  // ── 5. Rebuild Scene ───────────────────────────────────────────────────────
  function rebuildScene() {
    if (!scene) return;
    var s = SEASONS[state.season];
    var dataColorHex = (PALETTES[state.palette] && PALETTES[state.palette].hex) || s.leafColor;

    scene.background.set(s.skyColor);
    scene.fog.color.set(s.skyColor);

    var qrSize = buildQRPavement(state.url, s, dataColorHex);
    buildPlatform(s, qrSize);
    buildHyperRealisticTree(s, dataColorHex, state.seed);
    buildParticles(s, s.particleColor);

    updateViewMode();
  }

  function toggleQRView() {
    state.qrMode = !state.qrMode;
    playOrganicChime();
    updateViewMode();
  }

  function updateViewMode() {
    var pillLabel = document.getElementById('pill-label');
    var scanOverlay = document.getElementById('scan-overlay');

    if (state.qrMode) {
      cam.tPitch = 0.001; // direct 90 deg overhead
      cam.tYaw   = 0.0;
      cam.tDist  = 34;
      pillLabel.textContent = 'Tap to see 3D Magic Tree';
      scanOverlay.classList.add('active');
    } else {
      cam.tPitch = 0.78;  // isometric diamond
      cam.tYaw   = 0.785;
      cam.tDist  = 38;
      pillLabel.textContent = 'Tap tree to view QR code';
      scanOverlay.classList.remove('active');
    }
  }

  // ── 6. Animate Loop with Multi-Harmonic Wind Bending ────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    // Smooth camera glide
    cam.pitch += (cam.tPitch - cam.pitch) * 0.085;
    cam.yaw   += (cam.tYaw   - cam.yaw)   * 0.085;
    cam.dist  += (cam.tDist  - cam.dist)  * 0.085;

    camera.position.set(
      cam.dist * Math.sin(cam.pitch) * Math.sin(cam.yaw),
      cam.dist * Math.cos(cam.pitch),
      cam.dist * Math.sin(cam.pitch) * Math.cos(cam.yaw)
    );
    camera.lookAt(0, 1.6, 0);

    // Smooth Botanical Tree Transition (Grows / Shrinks gracefully)
    var targetScale = state.qrMode ? 0.0001 : 1.0;
    treeScale += (targetScale - treeScale) * 0.12;

    if (treeGroup) {
      treeGroup.scale.set(treeScale, treeScale, treeScale);
      treeGroup.visible = treeScale > 0.01;

      // Realistic Multi-Harmonic Wind Swaying (Anchored at root)
      if (!state.qrMode && treeScale > 0.75) {
        var swayZ = Math.sin(t * 1.05) * 0.012 + Math.sin(t * 2.3) * 0.005;
        var swayX = Math.cos(t * 0.8) * 0.01 + Math.cos(t * 1.8) * 0.004;
        treeGroup.rotation.z = swayZ;
        treeGroup.rotation.x = swayX;
      }
    }

    if (fallenPetalsGroup) {
      fallenPetalsGroup.visible = !state.qrMode;
    }

    // Dynamic Weather Particles Animation
    if (particleMesh) {
      var s = SEASONS[state.season];
      var pts = particleMesh.geometry.attributes.position.array;
      var n   = pts.length / 3;
      var isRain = s.weatherType === 'rain';

      for (var i = 0; i < n; i++) {
        if (isRain) {
          pts[i*3 + 1] -= 0.32;
          pts[i*3]     += 0.025;
        } else {
          // Drifting floating cherry blossom petals in gentle breeze
          pts[i*3]     += Math.sin(t * 0.75 + i * 1.1) * 0.018 + 0.008;
          pts[i*3 + 1] -= 0.026 + Math.sin(t * 0.6 + i) * 0.006;
          pts[i*3 + 2] += Math.cos(t * 0.65 + i * 1.4) * 0.016;
        }

        if (pts[i*3 + 1] < 0) {
          pts[i*3]     = (Math.random() - 0.5) * 32;
          pts[i*3 + 1] = 20 + Math.random() * 6;
          pts[i*3 + 2] = (Math.random() - 0.5) * 32;
        }
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // ── 7. UI Controls & Interactive Listeners ─────────────────────────────────
  var paletteContainer = document.getElementById('palette-row');
  PALETTES.forEach(function (p, i) {
    var b = document.createElement('button');
    b.className = 'swatch' + (i === state.palette ? ' active' : '');
    b.style.background = p.color;
    b.title = p.name;
    b.addEventListener('click', function () {
      state.palette = i;
      playOrganicChime();
      document.querySelectorAll('.swatch').forEach(function (s, j) {
        s.classList.toggle('active', j === i);
      });
      rebuildScene();
    });
    paletteContainer.appendChild(b);
  });

  document.querySelectorAll('.season-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sIdx = parseInt(btn.dataset.season);
      state.season = sIdx;
      playOrganicChime();
      document.querySelectorAll('.season-tab').forEach(function (b, j) {
        b.classList.toggle('active', j === sIdx);
      });
      rebuildScene();
    });
  });

  document.getElementById('action-pill').addEventListener('click', function () {
    toggleQRView();
  });

  var urlInput = document.getElementById('url-input');
  urlInput.value = state.url;

  function handleUrlUpdate() {
    var v = urlInput.value.trim();
    if (!v) return;
    state.url = cleanUrl(v);
    urlInput.value = state.url;
    playOrganicChime();
    rebuildScene();
  }

  document.getElementById('btn-generate').addEventListener('click', handleUrlUpdate);
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleUrlUpdate();
  });

  // Sound Toggle Button
  var soundBtn = document.getElementById('btn-sound');
  soundBtn.addEventListener('click', function () {
    state.soundEnabled = !state.soundEnabled;
    soundBtn.classList.toggle('active', state.soundEnabled);
    if (state.soundEnabled) playOrganicChime();
  });

  // Share URL Generator
  function getShareUrl() {
    try {
      var q = btoa(state.season + '' + state.palette + (state.url || ''));
      return location.origin + location.pathname + '?q=' + q;
    } catch(e) { return location.href; }
  }

  function openShareModal() {
    handleUrlUpdate();
    document.getElementById('share-url').value = getShareUrl();
    document.getElementById('modal-bg').classList.add('open');
  }

  document.getElementById('btn-share-top').addEventListener('click', openShareModal);
  document.getElementById('modal-bg').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
  document.getElementById('modal-close').addEventListener('click', function () {
    document.getElementById('modal-bg').classList.remove('open');
  });
  document.getElementById('btn-copy').addEventListener('click', function () {
    var val = document.getElementById('share-url').value;
    var btn = this;
    navigator.clipboard.writeText(val).then(function () {
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = 'Copy Link'; }, 2000);
    }).catch(function () {
      document.getElementById('share-url').select();
      document.execCommand('copy');
    });
  });

  // Info Modal
  document.getElementById('btn-info').addEventListener('click', function () {
    document.getElementById('info-modal-bg').classList.add('open');
  });
  document.getElementById('info-modal-bg').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
  document.getElementById('info-modal-close').addEventListener('click', function () {
    document.getElementById('info-modal-bg').classList.remove('open');
  });

  // Launch Three.js when loaded
  if (window.THREE) {
    initThree();
  } else {
    window.addEventListener('load', function() {
      if (window.THREE) initThree();
    });
  }
})();
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "../gh-pages/index.html"), html, "utf8");
console.log("Successfully rebuilt hyper-realistic tree in gh-pages/index.html!");
