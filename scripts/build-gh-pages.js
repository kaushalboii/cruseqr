const fs = require("fs");
const path = require("path");

const qrcodeLib = fs.readFileSync("/tmp/qrcode-gen.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CruseQR Magic Tree — 3D Interactive QR</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;background:#f5ede2;user-select:none;-webkit-user-select:none;}
  #canvas-container{position:fixed;inset:0;cursor:grab;}
  #canvas-container:active{cursor:grabbing;}
  canvas{display:block;width:100%!important;height:100%!important;}

  /* Top bar */
  #topbar{position:fixed;top:0;left:0;right:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;pointer-events:none;}
  .logo-pill{pointer-events:auto;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.92);border:1px solid #e7e5e4;border-radius:18px;padding:8px 14px;box-shadow:0 2px 12px rgba(0,0,0,0.08);backdrop-filter:blur(12px);}
  .logo-pill .brand{font-size:14px;font-weight:900;letter-spacing:-0.3px;color:#1c1917;}
  .logo-pill .accent{color:#d97706;}
  .logo-pill .badge{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:999px;padding:2px 8px;}
  .topbar-actions{pointer-events:auto;display:flex;align-items:center;gap:8px;}
  .icon-btn{width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.92);border:1px solid #e7e5e4;box-shadow:0 2px 8px rgba(0,0,0,0.08);backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.1s,background 0.15s;color:#57534e;}
  .icon-btn:hover{background:#fff;}
  .icon-btn:active{transform:scale(0.9);}
  .scan-btn{height:36px;padding:0 14px;border-radius:12px;background:rgba(255,255,255,0.92);border:1px solid #e7e5e4;box-shadow:0 2px 8px rgba(0,0,0,0.08);backdrop-filter:blur(12px);cursor:pointer;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#44403c;transition:all 0.15s;}
  .scan-btn:hover{background:#fff;}
  .scan-btn.active{background:#1c1917;color:#fff;border-color:#1c1917;}
  .scan-btn svg{color:#f59e0b;}
  .share-btn{height:36px;padding:0 14px;border-radius:12px;background:#d97706;border:none;box-shadow:0 2px 8px rgba(217,119,6,0.3);cursor:pointer;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;transition:all 0.15s;}
  .share-btn:hover{background:#b45309;}
  .share-btn:active{transform:scale(0.95);}

  /* Bottom dock */
  #dock{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:520px;z-index:30;pointer-events:none;}
  .dock-inner{background:rgba(255,255,255,0.93);border:1px solid #e7e5e4;border-radius:26px;padding:16px;box-shadow:0 8px 40px rgba(0,0,0,0.12);backdrop-filter:blur(20px);pointer-events:auto;}
  .url-row{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  .url-input{flex:1;padding:10px 14px;border-radius:14px;background:#f5f5f4;border:1px solid #e7e5e4;font-size:12px;font-weight:600;color:#1c1917;outline:none;transition:border-color 0.15s,box-shadow 0.15s;}
  .url-input::placeholder{color:#a8a29e;font-weight:400;}
  .url-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.15);}
  .gen-btn{padding:10px 16px;border-radius:14px;background:#1c1917;border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:background 0.15s;}
  .gen-btn:hover{background:#000;}
  .gen-btn:active{transform:scale(0.95);}
  .seasons{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;}
  .season-btn{padding:8px 4px;border-radius:12px;background:#f5f5f4;border:1px solid transparent;font-size:12px;font-weight:600;color:#57534e;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.15s;}
  .season-btn:hover{background:#e7e5e4;}
  .season-btn.active{background:#fef3c7;border-color:#fcd34d;color:#78350f;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .palette-row{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid #e7e5e4;}
  .palette-label{font-size:11px;font-weight:600;color:#78716c;letter-spacing:0.05em;}
  .swatches{display:flex;align-items:center;gap:8px;}
  .swatch{width:20px;height:20px;border-radius:50%;cursor:pointer;transition:transform 0.15s,opacity 0.15s;border:none;opacity:0.8;}
  .swatch:hover{transform:scale(1.1);opacity:1;}
  .swatch.active{transform:scale(1.25);box-shadow:0 0 0 2px #fff,0 0 0 4px #1c1917;opacity:1;}

  /* Hint */
  #hint{position:fixed;bottom:116px;left:50%;transform:translateX(-50%);font-size:11px;color:rgba(0,0,0,0.38);font-weight:500;pointer-events:none;white-space:nowrap;}

  /* Share modal */
  #modal-bg{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:16px;}
  #modal-bg.open{display:flex;}
  #modal{background:#fff;border-radius:28px;padding:24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.25);}
  .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
  .modal-title{font-size:15px;font-weight:900;color:#1c1917;}
  .modal-close{font-size:20px;font-weight:700;color:#a8a29e;cursor:pointer;border:none;background:none;line-height:1;padding:0;}
  .modal-desc{font-size:12px;color:#78716c;margin-bottom:16px;line-height:1.6;}
  .modal-url-row{display:flex;align-items:center;gap:8px;}
  #share-url-display{flex:1;padding:10px 12px;border-radius:12px;background:#f5f5f4;border:1px solid #e7e5e4;font-size:11px;font-family:monospace;color:#44403c;outline:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .copy-btn{padding:10px 14px;border-radius:12px;background:#d97706;border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:background 0.15s;}
  .copy-btn:hover{background:#b45309;}
</style>

<!-- Inlined standalone QR Code generator (no CDN dependency, zero errors) -->
<script>
${qrcodeLib}
</script>
<!-- Three.js r128 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
if (!window.THREE) {
  document.write('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\\\\/script>');
}
</script>
</head>
<body>

<!-- Top Bar -->
<header id="topbar">
  <div class="logo-pill">
    <span class="brand">Cruse<span class="accent">QR</span></span>
    <span class="badge">Magic Tree</span>
  </div>
  <div class="topbar-actions">
    <button class="icon-btn" id="btn-sound" title="Ambient Wind">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0 2-2m-2 2-2-2m2 2 2 2"/></svg>
    </button>
    <button class="icon-btn" id="btn-reseed" title="Grow New Tree">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
    </button>
    <button class="icon-btn" id="btn-download" title="Download PNG">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
    </button>
    <button class="scan-btn" id="btn-scan" title="Toggle Scan View">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"/></svg>
      <span id="scan-label">Scan QR</span>
    </button>
    <button class="share-btn" id="btn-share">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
      Share
    </button>
  </div>
</header>

<!-- 3D Canvas -->
<div id="canvas-container"></div>

<!-- Hint -->
<div id="hint">Left Click &amp; Drag: Orbit 3D &nbsp;|&nbsp; Scroll: Zoom</div>

<!-- Bottom Dock -->
<div id="dock">
  <div class="dock-inner">
    <div class="url-row">
      <input class="url-input" id="url-input" type="text" placeholder="Type or paste any URL..."/>
      <button class="gen-btn" id="btn-gen">
        <svg width="13" height="13" fill="none" stroke="#f59e0b" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
        Generate
      </button>
    </div>
    <div class="seasons" id="seasons">
      <button class="season-btn active" data-i="0">🌸 Spring</button>
      <button class="season-btn" data-i="1">🍃 Summer</button>
      <button class="season-btn" data-i="2">🍂 Autumn</button>
      <button class="season-btn" data-i="3">❄️ Winter</button>
    </div>
    <div class="palette-row">
      <span class="palette-label">COLOUR</span>
      <div class="swatches" id="swatches"></div>
    </div>
  </div>
</div>

<!-- Share Modal -->
<div id="modal-bg">
  <div id="modal" onclick="event.stopPropagation()">
    <div class="modal-header">
      <span class="modal-title">Share Your Magic Tree 🌸</span>
      <button class="modal-close" id="modal-close">✕</button>
    </div>
    <p class="modal-desc">Anyone who opens this link will see your exact 3D tree with your custom QR code destination.</p>
    <div class="modal-url-row">
      <input class="url-input" id="share-url-display" readonly/>
      <button class="copy-btn" id="copy-btn">
        <svg id="copy-icon" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>
        <span id="copy-label">Copy</span>
      </button>
    </div>
  </div>
</div>

<script>
(function () {
  'use strict';

  // ── Helper: Get clean dynamic default URL ──────────────────────────────────
  function getDefaultUrl() {
    try {
      if (location.origin && location.origin !== 'null' && location.origin !== 'file://') {
        return location.origin + location.pathname;
      }
    } catch(e) {}
    return 'https://kaushalboii.github.io/cruseqr/';
  }

  function cleanUrl(u) {
    if (!u) return getDefaultUrl();
    var s = u.trim();
    if (s === 'https://icqr.com/' || s === 'https://icqr.com' || s === 'https://cruseqr.com/' || s === 'https://cruseqr.com' || s === '') {
      return getDefaultUrl();
    }
    return s.match(/^https?:\\\\/\\\\//) ? s : ('https://' + s);
  }

  // ── Seasons ────────────────────────────────────────────────────────────────
  var SEASONS = [
    { name:'Spring', bgHex:0xf5ede2, bg:'#f5ede2', ground:0xede0d4, block:0x2b1a13, trunk:0x5c3d2e, leaf1:0xffb7c5, leaf2:0xffc0cb, petal:0xffb7c5 },
    { name:'Summer', bgHex:0xe8f5ec, bg:'#e8f5ec', ground:0xd8ead8, block:0x0f2a1a, trunk:0x3b2d20, leaf1:0x2d8a50, leaf2:0x57c97a, petal:0x7dd49a },
    { name:'Autumn', bgHex:0xfbf0e2, bg:'#fbf0e2', ground:0xf0e0c8, block:0x3a1508, trunk:0x52301a, leaf1:0xd9531e, leaf2:0xf0a830, petal:0xe07828 },
    { name:'Winter', bgHex:0xe8f0f8, bg:'#e8f0f8', ground:0xd8e4f0, block:0x162638, trunk:0x344558, leaf1:0xc8def0, leaf2:0xffffff, petal:0xd8eaf8 }
  ];

  // ── Palettes ───────────────────────────────────────────────────────────────
  var PALETTES = [
    { name:'Sakura',  hex:0xffb7c5, color:'#ffb7c5' },
    { name:'Rose',    hex:0xf43f7e, color:'#f43f7e' },
    { name:'Emerald', hex:0x10b981, color:'#10b981' },
    { name:'Amber',   hex:0xf59e0b, color:'#f59e0b' },
    { name:'Sky',     hex:0x38bdf8, color:'#38bdf8' },
    { name:'Violet',  hex:0x8b5cf6, color:'#8b5cf6' }
  ];

  // ── App State ──────────────────────────────────────────────────────────────
  var state = { url: getDefaultUrl(), season: 0, palette: 0, seed: 42, scanMode: false, muted: true };

  // Parse ?q= query param
  try {
    var qParam = new URLSearchParams(location.search).get('q');
    if (qParam) {
      var d = atob(qParam);
      if (d.length >= 2 && !isNaN(parseInt(d[0])) && !isNaN(parseInt(d[1]))) {
        state.season  = Math.min(3, Math.max(0, parseInt(d[0]) || 0));
        state.palette = Math.min(5, Math.max(0, parseInt(d[1]) || 0));
        state.url     = cleanUrl(d.slice(2));
      } else {
        state.url = cleanUrl(d);
      }
    }
  } catch(e) {}

  // ── Three.js scene refs ───────────────────────────────────────────────────
  var scene, camera, renderer, clock;
  var qrGroup, treeGroup, petalMesh, groundMesh, qrBasePlate;
  var cam = { pitch: 0.78, yaw: 0.6, dist: 46, tPitch: 0.78, tYaw: 0.6, tDist: 46, dragging: false, px: 0, py: 0 };

  // Seeded RNG
  function makeRng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // ── Build Instanced QR Blocks ──────────────────────────────────────────────
  function buildQRMesh(url, blockColor, scanMode) {
    if (!url) return null;
    try {
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      var size   = qr.getModuleCount();
      var bs     = 0.56;
      var offset = (size * bs) / 2;

      var count = 0;
      for (var r = 0; r < size; r++)
        for (var c = 0; c < size; c++)
          if (qr.isDark(r, c)) count++;

      if (count === 0) return null;

      var THREE = window.THREE;
      var geo   = new THREE.BoxGeometry(bs * 0.9, 0.42, bs * 0.9);
      var mat   = new THREE.MeshStandardMaterial({ color: blockColor, roughness: 0.5, metalness: 0.05 });
      var mesh  = new THREE.InstancedMesh(geo, mat, count);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      var dummy = new THREE.Object3D();
      var idx   = 0;
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          if (!qr.isDark(r, c)) continue;
          var x    = c * bs - offset + bs / 2;
          var z    = r * bs - offset + bs / 2;
          var dist = Math.sqrt(x * x + z * z);
          var h    = (!scanMode && dist < 1.8) ? 0.22 : 0.42;
          dummy.position.set(x, h / 2, z);
          dummy.scale.set(1, h / 0.42, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      return mesh;
    } catch (e) {
      console.warn('QR build error:', e);
      return null;
    }
  }

  // ── Build Procedural Tree ──────────────────────────────────────────────────
  function buildTree(group, trunkColor, leaf1, leaf2, paletteHex, seed) {
    var THREE   = window.THREE;
    var rng     = makeRng(seed);
    var trunkMat = new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.88 });
    var leafMatA = new THREE.MeshStandardMaterial({ color: paletteHex, roughness: 0.6, flatShading: true });
    var leafMatB = new THREE.MeshStandardMaterial({ color: leaf2,      roughness: 0.6, flatShading: true });

    function branch(ox, oy, oz, dx, dy, dz, len, rad, depth) {
      var mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      dx /= mag; dy /= mag; dz /= mag;

      if (depth > 5 || rad < 0.04) {
        var n = 2 + Math.floor(rng() * 3);
        for (var i = 0; i < n; i++) {
          var lg = new THREE.DodecahedronGeometry(0.28 + rng() * 0.26, 0);
          var lm = new THREE.Mesh(lg, rng() > 0.5 ? leafMatA : leafMatB);
          lm.position.set(ox + (rng()-0.5)*0.8, oy + rng()*0.5, oz + (rng()-0.5)*0.8);
          lm.castShadow = true;
          group.add(lm);
        }
        return;
      }

      var ex = ox + dx * len, ey = oy + dy * len, ez = oz + dz * len;
      var mx = (ox+ex)/2,     my = (oy+ey)/2,     mz = (oz+ez)/2;

      var cg = new THREE.CylinderGeometry(rad * 0.72, rad, len, 7);
      var cm = new THREE.Mesh(cg, trunkMat);
      cm.position.set(mx, my, mz);
      cm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(dx,dy,dz).normalize());
      cm.castShadow = true;
      cm.receiveShadow = true;
      group.add(cm);

      if (depth >= 3) {
        var fg = new THREE.DodecahedronGeometry(0.5 + rng() * 0.5, 1);
        var fm = new THREE.Mesh(fg, rng() > 0.4 ? leafMatA : leafMatB);
        fm.position.set(ex, ey, ez);
        fm.castShadow = true;
        group.add(fm);
      }

      var kids = depth === 0 ? 4 : (rng() > 0.4 ? 3 : 2);
      for (var i = 0; i < kids; i++) {
        var spread = 0.35 + rng() * 0.4;
        var rot    = (i / kids) * Math.PI * 2 + (rng()-0.5) * 0.6;
        var ndx    = dx + Math.cos(rot) * spread;
        var ndy    = dy + 0.15 + rng() * 0.35;
        var ndz    = dz + Math.sin(rot) * spread;
        branch(ex, ey, ez, ndx, ndy, ndz, len * (0.68 + rng()*0.08), rad * (0.62 + rng()*0.08), depth+1);
      }
    }

    branch(0, 0, 0, 0, 1, 0, 4.2, 0.72, 0);

    var crownG = new THREE.DodecahedronGeometry(2.8 + rng() * 0.8, 1);
    var crownM = new THREE.Mesh(crownG, leafMatA);
    crownM.position.set(0, 10.5, 0);
    crownM.castShadow = true;
    group.add(crownM);
  }

  // ── Clear group ────────────────────────────────────────────────────────────
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

  // ── Rebuild Scene ──────────────────────────────────────────────────────────
  function rebuildScene() {
    if (!scene) return;
    var THREE = window.THREE;
    var s     = SEASONS[state.season];
    var pHex  = PALETTES[state.palette].hex;

    // Background + fog
    scene.background = new THREE.Color(s.bgHex);
    scene.fog        = new THREE.FogExp2(s.bgHex, 0.011);
    document.body.style.background = s.bg;

    // Ground disc
    if (groundMesh) scene.remove(groundMesh);
    var gGeo = new THREE.CylinderGeometry(21, 23, 2.2, 56);
    var gMat = new THREE.MeshStandardMaterial({ color: s.ground, roughness: 0.92 });
    groundMesh = new THREE.Mesh(gGeo, gMat);
    groundMesh.position.y = -1.1;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // QR blocks
    clearGroup(qrGroup);
    var qrMesh = buildQRMesh(state.url, s.block, state.scanMode);
    if (qrMesh) qrGroup.add(qrMesh);

    // Tree (hidden in scan mode for 100% scannability)
    clearGroup(treeGroup);
    buildTree(treeGroup, s.trunk, s.leaf1, s.leaf2, pHex, state.seed);
    treeGroup.visible = !state.scanMode;

    // Petals
    if (petalMesh) scene.remove(petalMesh);
    var N   = 180;
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i*3]   = (Math.random()-0.5) * 34;
      pos[i*3+1] = Math.random() * 22 + 1;
      pos[i*3+2] = (Math.random()-0.5) * 34;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pMat  = new THREE.PointsMaterial({ color: pHex, size: 0.44, transparent: true, opacity: 0.85 });
    petalMesh = new THREE.Points(pGeo, pMat);
    scene.add(petalMesh);
  }

  // ── Init Three.js ──────────────────────────────────────────────────────────
  function initThree() {
    var THREE     = window.THREE;
    var container = document.getElementById('canvas-container');

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene  = new THREE.Scene();
    clock  = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 500);

    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    var sun = new THREE.DirectionalLight(0xfff8e8, 1.45);
    sun.position.set(28, 55, 32);
    sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left   = -28; sun.shadow.camera.right  = 28;
    sun.shadow.camera.top    =  28; sun.shadow.camera.bottom = -28;
    sun.shadow.camera.near   = 0.5; sun.shadow.camera.far    = 160;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    qrGroup   = new THREE.Group(); scene.add(qrGroup);
    treeGroup = new THREE.Group(); scene.add(treeGroup);

    // Orbit controls
    container.addEventListener('mousedown', function (e) { cam.dragging=true; cam.px=e.clientX; cam.py=e.clientY; });
    window.addEventListener('mousemove', function (e) {
      if (!cam.dragging) return;
      cam.tYaw   -= (e.clientX - cam.px) * 0.007;
      cam.tPitch  = Math.max(0.05, Math.min(Math.PI/2 - 0.02, cam.tPitch + (e.clientY - cam.py) * 0.007));
      cam.px = e.clientX; cam.py = e.clientY;
    });
    window.addEventListener('mouseup', function () { cam.dragging = false; });
    container.addEventListener('wheel', function (e) {
      e.preventDefault();
      cam.tDist = Math.max(14, Math.min(85, cam.tDist + e.deltaY * 0.04));
    }, { passive: false });
    container.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      cam.dragging=true; cam.px=e.touches[0].clientX; cam.py=e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!cam.dragging || e.touches.length !== 1) return;
      cam.tYaw   -= (e.touches[0].clientX - cam.px) * 0.009;
      cam.tPitch  = Math.max(0.05, Math.min(Math.PI/2 - 0.02, cam.tPitch + (e.touches[0].clientY - cam.py) * 0.009));
      cam.px=e.touches[0].clientX; cam.py=e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function () { cam.dragging = false; });

    window.addEventListener('resize', function () {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    rebuildScene();
    animate();
  }

  // ── Animate loop ───────────────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    cam.pitch += (cam.tPitch - cam.pitch) * 0.09;
    cam.yaw   += (cam.tYaw   - cam.yaw)   * 0.09;
    cam.dist  += (cam.tDist  - cam.dist)  * 0.09;
    camera.position.set(
      cam.dist * Math.sin(cam.pitch) * Math.sin(cam.yaw),
      cam.dist * Math.cos(cam.pitch),
      cam.dist * Math.sin(cam.pitch) * Math.cos(cam.yaw)
    );
    camera.lookAt(0, 3.5, 0);

    if (petalMesh) {
      var pts = petalMesh.geometry.attributes.position.array;
      var n   = pts.length / 3;
      for (var i = 0; i < n; i++) {
        pts[i*3]   += Math.sin(t * 0.4 + i * 1.3)  * 0.012;
        pts[i*3+1] -= 0.028 + Math.sin(t * 0.3 + i) * 0.006;
        pts[i*3+2] += Math.cos(t * 0.4 + i * 1.7)  * 0.012;
        if (pts[i*3+1] < -1) {
          pts[i*3]   = (Math.random()-0.5)*34;
          pts[i*3+1] = 20 + Math.random() * 8;
          pts[i*3+2] = (Math.random()-0.5)*34;
        }
      }
      petalMesh.geometry.attributes.position.needsUpdate = true;
    }

    if (treeGroup && !state.scanMode) treeGroup.rotation.y = Math.sin(t * 0.4) * 0.012;

    renderer.render(scene, camera);
  }

  // ── Palette Swatches ───────────────────────────────────────────────────────
  var swatchContainer = document.getElementById('swatches');
  PALETTES.forEach(function (p, i) {
    var b = document.createElement('button');
    b.className = 'swatch' + (i === state.palette ? ' active' : '');
    b.style.background = p.color;
    b.title = p.name;
    b.addEventListener('click', function () {
      state.palette = i;
      document.querySelectorAll('.swatch').forEach(function (s, j) { s.classList.toggle('active', j===i); });
      rebuildScene();
    });
    swatchContainer.appendChild(b);
  });

  // ── Season Buttons ─────────────────────────────────────────────────────────
  document.querySelectorAll('.season-btn').forEach(function (btn) {
    var i = parseInt(btn.dataset.i);
    btn.classList.toggle('active', i === state.season);
    btn.addEventListener('click', function () {
      state.season = i;
      document.querySelectorAll('.season-btn').forEach(function (b, j) { b.classList.toggle('active', j===i); });
      rebuildScene();
    });
  });

  // ── URL input & Generate ───────────────────────────────────────────────────
  var urlInput = document.getElementById('url-input');
  urlInput.value = state.url;

  function generate() {
    var v = urlInput.value.trim();
    if (!v) return;
    state.url = cleanUrl(v);
    urlInput.value = state.url;
    rebuildScene();
  }
  document.getElementById('btn-gen').addEventListener('click', generate);
  urlInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(); });

  // ── Re-seed ────────────────────────────────────────────────────────────────
  document.getElementById('btn-reseed').addEventListener('click', function () {
    state.seed = Math.floor(Math.random() * 999999);
    rebuildScene();
  });

  // ── Scan Mode Toggle ───────────────────────────────────────────────────────
  document.getElementById('btn-scan').addEventListener('click', function () {
    state.scanMode = !state.scanMode;
    document.getElementById('btn-scan').classList.toggle('active', state.scanMode);
    document.getElementById('scan-label').textContent = state.scanMode ? '3D View' : 'Scan QR';
    if (state.scanMode) {
      cam.tPitch = 0.001; cam.tDist = 36;
    } else {
      cam.tPitch = 0.78;  cam.tDist = 46;
    }
    rebuildScene();
  });

  // ── Download PNG ───────────────────────────────────────────────────────────
  document.getElementById('btn-download').addEventListener('click', function () {
    if (!renderer) return;
    renderer.render(scene, camera);
    var a = document.createElement('a');
    a.href     = renderer.domElement.toDataURL('image/png');
    a.download = 'cruseqr-magic-tree-' + SEASONS[state.season].name.toLowerCase() + '.png';
    a.click();
  });

  // ── Ambient Wind Sound ─────────────────────────────────────────────────────
  var audioCtx = null, audioSrc = null;
  document.getElementById('btn-sound').addEventListener('click', function () {
    var btn = this;
    if (state.muted) {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var buf  = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        audioSrc = audioCtx.createBufferSource();
        audioSrc.buffer = buf; audioSrc.loop = true;
        var f = audioCtx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=400; f.Q.value=3;
        var g = audioCtx.createGain();         g.gain.value = 0.06;
        audioSrc.connect(f); f.connect(g); g.connect(audioCtx.destination);
        audioSrc.start();
        state.muted = false;
        btn.style.color = '#10b981';
        btn.title = 'Mute';
      } catch (e) {}
    } else {
      if (audioSrc) { try { audioSrc.stop(); } catch(e){} audioSrc = null; }
      state.muted = true;
      btn.style.color = '';
      btn.title = 'Ambient Wind';
    }
  });

  // ── Share Modal ────────────────────────────────────────────────────────────
  function getShareUrl() {
    try {
      var q = btoa(state.season + '' + state.palette + (state.url || ''));
      return location.origin + location.pathname + '?q=' + q;
    } catch (e) { return location.href; }
  }
  document.getElementById('btn-share').addEventListener('click', function () {
    document.getElementById('share-url-display').value = getShareUrl();
    document.getElementById('modal-bg').classList.add('open');
  });
  document.getElementById('modal-bg').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
  document.getElementById('modal-close').addEventListener('click', function () {
    document.getElementById('modal-bg').classList.remove('open');
  });
  document.getElementById('copy-btn').addEventListener('click', function () {
    var val = document.getElementById('share-url-display').value;
    navigator.clipboard.writeText(val).then(function () {
      document.getElementById('copy-label').textContent = 'Copied!';
      setTimeout(function () { document.getElementById('copy-label').textContent = 'Copy'; }, 2000);
    }).catch(function () {
      document.getElementById('share-url-display').select();
      document.execCommand('copy');
    });
  });

  // ── Wait for Three.js then initialize ──────────────────────────────────────
  function waitThree() {
    if (window.THREE && window.qrcode) {
      initThree();
    } else {
      setTimeout(waitThree, 80);
    }
  }
  waitThree();

})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "../gh-pages/index.html"), html);
console.log("Successfully built gh-pages/index.html with inlined qrcode generator!");
