const fs = require("fs");
const path = require("path");

const qrcodeLib = fs.readFileSync("/tmp/qrcode-gen.js", "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
<title>CruseQR Magic Tree — 3D Interactive QR Code</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{
    width:100%;height:100%;
    background:#f6f1e7;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    overflow:hidden;
    user-select:none;-webkit-user-select:none;
    -webkit-font-smoothing:antialiased;
  }
  #canvas-container{
    position:fixed;inset:0;width:100%;height:100%;
    cursor:grab;z-index:1;
  }
  #canvas-container:active{cursor:grabbing;}
  canvas{display:block;width:100%!important;height:100%!important;}

  /* Top Bar */
  #topbar{
    position:fixed;top:0;left:0;right:0;z-index:20;
    display:flex;align-items:flex-start;justify-content:space-between;
    padding:16px 20px;pointer-events:none;
  }
  .brand-group{
    pointer-events:auto;cursor:pointer;
    display:flex;flex-direction:column;align-items:flex-start;gap:4px;
  }
  .brand-logo{
    font-family:"Courier New",Courier,monospace,sans-serif;
    font-size:22px;font-weight:900;letter-spacing:3px;
    color:#262421;line-height:1;
    text-shadow:1px 1px 0px rgba(0,0,0,0.06);
  }
  .brand-pill{
    font-size:9px;font-weight:700;letter-spacing:0.04em;
    background:#fef08a;color:#854d0e;
    border:1px solid #fde047;border-radius:999px;
    padding:2px 8px;display:inline-block;
  }
  .info-btn{
    pointer-events:auto;width:28px;height:28px;
    border-radius:50%;border:1.5px solid #dcd5ca;background:rgba(255,255,255,0.7);
    color:#78716c;font-size:12px;font-weight:700;font-family:serif;font-style:italic;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;backdrop-filter:blur(8px);transition:all 0.15s;
  }
  .info-btn:hover{background:#fff;border-color:#a8a29e;color:#1c1917;}

  /* Floating View Toggle Pill */
  #toggle-pill{
    position:fixed;bottom:136px;left:50%;transform:translateX(-50%);
    z-index:20;cursor:pointer;
    background:rgba(255,255,255,0.88);
    border:1px solid rgba(0,0,0,0.06);
    box-shadow:0 2px 10px rgba(0,0,0,0.04);
    backdrop-filter:blur(10px);
    border-radius:999px;padding:7px 18px;
    font-size:12px;font-weight:500;color:#6b645b;
    transition:all 0.2s cubic-bezier(0.16,1,0.3,1);
    white-space:nowrap;
  }
  #toggle-pill:hover{
    background:#fff;color:#1c1917;
    box-shadow:0 4px 16px rgba(0,0,0,0.08);
    transform:translateX(-50%) translateY(-1px);
  }
  #toggle-pill:active{transform:translateX(-50%) scale(0.97);}

  /* Bottom Dock */
  #dock{
    position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
    width:calc(100% - 32px);max-width:440px;z-index:20;
    display:flex;flex-direction:column;gap:8px;
  }
  .url-bar{
    background:#ffffff;border-radius:14px;
    padding:4px 6px 4px 14px;
    box-shadow:0 2px 12px rgba(0,0,0,0.04),0 1px 2px rgba(0,0,0,0.03);
    border:1px solid rgba(0,0,0,0.04);
    display:flex;align-items:center;gap:8px;
  }
  .url-input{
    flex:1;border:none;outline:none;background:transparent;
    font-size:13px;font-weight:500;color:#292524;
    font-family:inherit;overflow:hidden;text-overflow:ellipsis;
  }
  .url-input::placeholder{color:#a8a29e;font-weight:400;}
  .action-btn{
    width:36px;height:36px;border-radius:10px;
    background:#c27d53;border:none;color:#ffffff;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:transform 0.15s,background 0.15s;
    box-shadow:0 2px 6px rgba(194,125,83,0.3);
  }
  .action-btn:hover{background:#b06c42;}
  .action-btn:active{transform:scale(0.93);}

  /* Season Selectors Row */
  .season-row{
    display:flex;align-items:center;gap:6px;
  }
  .season-btn{
    flex:1;padding:8px 8px;border-radius:12px;
    border:none;background:#ede7dc;
    font-size:12px;font-weight:600;color:#6b645b;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
    transition:all 0.15s ease;
  }
  .season-btn:hover{background:#e5ded2;}
  .season-btn.active{
    background:#e2d7c5;color:#292524;font-weight:700;
    box-shadow:0 1px 3px rgba(0,0,0,0.05);
  }
  .sound-btn{
    width:36px;height:36px;border-radius:12px;
    border:none;background:#ede7dc;color:#6b645b;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all 0.15s;flex-shrink:0;
  }
  .sound-btn:hover{background:#e5ded2;}
  .sound-btn.active{color:#c27d53;}

  /* Palette Swatches Row */
  .palette-row{
    display:flex;align-items:center;justify-content:center;gap:10px;
    padding-top:4px;
  }
  .swatch{
    width:22px;height:22px;border-radius:50%;
    border:none;cursor:pointer;
    transition:transform 0.15s,box-shadow 0.15s;
    opacity:0.9;
  }
  .swatch:hover{transform:scale(1.12);opacity:1;}
  .swatch.active{
    transform:scale(1.18);opacity:1;
    box-shadow:0 0 0 2px #f6f1e7,0 0 0 4px #292524;
  }

  /* Share Modal */
  #modal-bg{
    position:fixed;inset:0;z-index:50;background:rgba(0,0,0,0.35);
    backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:16px;
  }
  #modal-bg.open{display:flex;}
  #modal{
    background:#ffffff;border-radius:24px;padding:24px;
    max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,0.15);
  }
  .modal-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
  .modal-title{font-size:15px;font-weight:800;color:#1c1917;}
  .modal-close{font-size:18px;font-weight:700;color:#a8a29e;cursor:pointer;border:none;background:none;}
  .modal-desc{font-size:12px;color:#78716c;margin-bottom:14px;line-height:1.5;}
  .modal-url-row{display:flex;align-items:center;gap:6px;}
  #share-url{
    flex:1;padding:9px 12px;border-radius:10px;background:#f5f5f4;
    border:1px solid #e7e5e4;font-size:11px;font-family:monospace;color:#44403c;outline:none;
  }
  .copy-btn{
    padding:9px 14px;border-radius:10px;background:#c27d53;
    border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;
  }
</style>

<!-- Inlined QR Code generator -->
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
  <div class="brand-group" id="brand-group">
    <div class="brand-logo">CruseQR</div>
    <div class="brand-pill">Magic Tree</div>
  </div>
  <button class="info-btn" id="info-btn" title="About">i</button>
</header>

<!-- 3D Canvas -->
<div id="canvas-container"></div>

<!-- View Toggle Pill -->
<div id="toggle-pill">Tap the tree to see QR code</div>

<!-- Bottom Dock -->
<div id="dock">
  <div class="url-bar">
    <input type="text" id="url-input" class="url-input" placeholder="Type or paste any URL..." />
    <button class="action-btn" id="btn-share" title="Share & Update">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13M7 8l5-5 5 5"/>
      </svg>
    </button>
  </div>

  <div class="season-row">
    <button class="season-btn active" data-s="0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/>
      </svg>
      Spring
    </button>
    <button class="season-btn" data-s="1">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
      Summer
    </button>
    <button class="season-btn" data-s="2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 21v1M12 21v1M16 21v1"/>
      </svg>
      Autumn
    </button>
    <button class="sound-btn" id="btn-sound" title="Toggle Sound">
      <svg id="sound-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    </button>
  </div>

  <div class="palette-row" id="palette-row"></div>
</div>

<!-- Share Modal -->
<div id="modal-bg">
  <div id="modal" onclick="event.stopPropagation()">
    <div class="modal-top">
      <span class="modal-title">Share Your Magic Tree</span>
      <button class="modal-close" id="modal-close">✕</button>
    </div>
    <p class="modal-desc">Anyone who opens this link will see your customized 3D tree and scannable QR code.</p>
    <div class="modal-url-row">
      <input class="url-input" id="share-url" readonly />
      <button class="copy-btn" id="btn-copy">Copy</button>
    </div>
  </div>
</div>

<script>
(function () {
  'use strict';

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
    return (s.indexOf('http://') === 0 || s.indexOf('https://') === 0) ? s : ('https://' + s);
  }

  // ── Seasons Config ─────────────────────────────────────────────────────────
  var SEASONS = [
    {
      id: 'spring', name: 'Spring',
      groundColor: 0xe6e0d4, groundEdge: 0xb5ada0,
      trunkColor: 0x4a3425,
      leafColor: 0xf3a6ba, leafAlt: 0xfcd4e0, leafHighlight: 0xffffff,
      particleColor: 0xf7b7cb,
      grassColor: 0x6bb343, finderColor: 0x4da832,
      weatherType: 'petals'
    },
    {
      id: 'summer', name: 'Summer',
      groundColor: 0xe2ded2, groundEdge: 0xa8a194,
      trunkColor: 0x3d2b1e,
      leafColor: 0x5ea838, leafAlt: 0x76c24c, leafHighlight: 0x9be868,
      particleColor: 0x70be46,
      grassColor: 0x458b22, finderColor: 0x3d821e,
      weatherType: 'leaves'
    },
    {
      id: 'autumn', name: 'Autumn',
      groundColor: 0xe4ded3, groundEdge: 0xa59e92,
      trunkColor: 0x442c1c,
      leafColor: 0xeb9126, leafAlt: 0xf6b948, leafHighlight: 0xffdc73,
      particleColor: 0x948e84,
      grassColor: 0xd49b28, finderColor: 0xc48618,
      weatherType: 'rain'
    }
  ];

  var PALETTES = [
    { name: 'Sakura Pink',  hex: 0xf3a6ba, color: '#f3a6ba' },
    { name: 'Purple',       hex: 0x9b6bcf, color: '#9b6bcf' },
    { name: 'Berry Red',    hex: 0xe54b4b, color: '#e54b4b' },
    { name: 'Golden Amber', hex: 0xf0a500, color: '#f0a500' },
    { name: 'Sky Blue',     hex: 0x3b82f6, color: '#3b82f6' },
    { name: 'Slate Teal',   hex: 0x2d7a6b, color: '#2d7a6b' }
  ];

  var state = {
    url: getDefaultUrl(),
    season: 0,
    palette: 0,
    seed: 42,
    qrMode: false,
    muted: true
  };

  try {
    var q = new URLSearchParams(location.search).get('q');
    if (q) {
      var d = atob(q);
      if (d.length >= 2 && !isNaN(parseInt(d[0])) && !isNaN(parseInt(d[1]))) {
        state.season  = Math.min(2, Math.max(0, parseInt(d[0]) || 0));
        state.palette = Math.min(5, Math.max(0, parseInt(d[1]) || 0));
        state.url     = cleanUrl(d.slice(2));
      } else {
        state.url = cleanUrl(d);
      }
    }
  } catch(e) {}

  function makeRng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // ── Three.js Scene ─────────────────────────────────────────────────────────
  var scene, camera, renderer, clock;
  var rootGroup, platformGroup, qrGroup, treeGroup, particleMesh;
  var treeScale = 1.0;
  var cam = {
    pitch: 0.76, yaw: 0.785, dist: 40,
    tPitch: 0.76, tYaw: 0.785, tDist: 40,
    dragging: false, px: 0, py: 0
  };

  function initThree() {
    var THREE = window.THREE;
    var container = document.getElementById('canvas-container');

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f1e7);
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 500);

    // Warm, soft botanical illumination
    var ambLight = new THREE.AmbientLight(0xfffdf7, 0.95);
    scene.add(ambLight);

    var hemiLight = new THREE.HemisphereLight(0xfff5ea, 0xd0c8b8, 0.4);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xfff5e6, 1.45);
    dirLight.position.set(28, 48, 26);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left   = -22; dirLight.shadow.camera.right  = 22;
    dirLight.shadow.camera.top    =  22; dirLight.shadow.camera.bottom = -22;
    dirLight.shadow.camera.near   = 0.5; dirLight.shadow.camera.far    = 130;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    rootGroup     = new THREE.Group(); scene.add(rootGroup);
    platformGroup = new THREE.Group(); rootGroup.add(platformGroup);
    qrGroup       = new THREE.Group(); rootGroup.add(qrGroup);
    treeGroup     = new THREE.Group(); rootGroup.add(treeGroup);

    // Orbit controls
    container.addEventListener('mousedown', function (e) {
      cam.dragging = true; cam.px = e.clientX; cam.py = e.clientY;
    });
    window.addEventListener('mousemove', function (e) {
      if (!cam.dragging || state.qrMode) return;
      cam.tYaw   -= (e.clientX - cam.px) * 0.007;
      cam.tPitch  = Math.max(0.18, Math.min(1.4, cam.tPitch + (e.clientY - cam.py) * 0.007));
      cam.px = e.clientX; cam.py = e.clientY;
    });
    window.addEventListener('mouseup', function () { cam.dragging = false; });
    container.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (state.qrMode) return;
      cam.tDist = Math.max(22, Math.min(65, cam.tDist + e.deltaY * 0.03));
    }, { passive: false });

    // Touch
    container.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        cam.dragging = true; cam.px = e.touches[0].clientX; cam.py = e.touches[0].clientY;
      }
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!cam.dragging || e.touches.length !== 1 || state.qrMode) return;
      cam.tYaw   -= (e.touches[0].clientX - cam.px) * 0.009;
      cam.tPitch  = Math.max(0.18, Math.min(1.4, cam.tPitch + (e.touches[0].clientY - cam.py) * 0.009));
      cam.px = e.touches[0].clientX; cam.py = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function () { cam.dragging = false; });

    container.addEventListener('click', function () {
      setQRMode(!state.qrMode);
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

  // ── Isometric Stone Platform ───────────────────────────────────────────────
  function buildPlatform(seasonCfg, qrSize) {
    var THREE = window.THREE;
    clearGroup(platformGroup);

    var bs = 0.54;
    var platSize = (qrSize + 4) * bs;
    var half = platSize / 2;

    var slabGeo = new THREE.BoxGeometry(platSize, 1.2, platSize);
    var slabMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.groundColor,
      roughness: 0.88,
      metalness: 0.02
    });
    var slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = -0.6;
    slab.receiveShadow = true;
    platformGroup.add(slab);

    var rimGeo = new THREE.BoxGeometry(platSize + 0.3, 0.4, platSize + 0.3);
    var rimMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.groundEdge,
      roughness: 0.95
    });
    var rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = -0.8;
    platformGroup.add(rim);

    // 3D Grass clumps along borders
    var grassMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.grassColor,
      roughness: 0.7,
      flatShading: true
    });
    var rng = makeRng(1234);

    function addGrass(gx, gz) {
      var clump = new THREE.Group();
      clump.position.set(gx, 0.01, gz);
      var blades = 3 + Math.floor(rng() * 3);
      for (var b = 0; b < blades; b++) {
        var h = 0.45 + rng() * 0.55;
        var bladeGeo = new THREE.ConeGeometry(0.08 + rng() * 0.05, h, 4);
        var bladeMesh = new THREE.Mesh(bladeGeo, grassMat);
        bladeMesh.position.set((rng()-0.5)*0.25, h/2, (rng()-0.5)*0.25);
        bladeMesh.rotation.z = (rng()-0.5)*0.4;
        bladeMesh.rotation.x = (rng()-0.5)*0.4;
        clump.add(bladeMesh);
      }
      platformGroup.add(clump);
    }

    var edgeDist = half - 0.4;
    for (var x = -edgeDist; x <= edgeDist; x += 1.0) {
      if (rng() > 0.25) addGrass(x, -edgeDist);
      if (rng() > 0.25) addGrass(x,  edgeDist);
    }
    for (var z = -edgeDist; z <= edgeDist; z += 1.0) {
      if (rng() > 0.25) addGrass(-edgeDist, z);
      if (rng() > 0.25) addGrass( edgeDist, z);
    }
  }

  // ── Pavement QR Code ───────────────────────────────────────────────────────
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
      var geo = new THREE.BoxGeometry(bs * 0.95, blockH, bs * 0.95);

      var lightMat  = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.9 });
      var finderMat = new THREE.MeshStandardMaterial({ color: seasonCfg.finderColor, roughness: 0.65, flatShading: true });
      var dataMat   = new THREE.MeshStandardMaterial({ color: dataColorHex, roughness: 0.65, flatShading: true });

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
      console.warn("QR generation error:", e);
      return 29;
    }
  }

  // ── Realistic Multi-Tier Organic Tree ──────────────────────────────────────
  function buildRealisticTree(seasonCfg, leafColorHex, seed) {
    var THREE = window.THREE;
    clearGroup(treeGroup);

    var rng = makeRng(seed);

    // Realistic Bark Material
    var trunkMat = new THREE.MeshStandardMaterial({
      color: seasonCfg.trunkColor,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true
    });

    // 1. Organic Branching Trunk Network
    var branches = [];
    var leafClusterPositions = [];

    function addBranch(ox, oy, oz, dx, dy, dz, len, rad, depth) {
      var mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
      dx /= mag; dy /= mag; dz /= mag;

      var ex = ox + dx * len;
      var ey = oy + dy * len;
      var ez = oz + dz * len;

      var mx = (ox + ex) / 2;
      var my = (oy + ey) / 2;
      var mz = (oz + ez) / 2;

      // Curved cylinder branch
      var bGeo = new THREE.CylinderGeometry(rad * 0.72, rad, len, 7);
      var bMesh = new THREE.Mesh(bGeo, trunkMat);
      bMesh.position.set(mx, my, mz);
      bMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(dx,dy,dz).normalize());
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      treeGroup.add(bMesh);

      // Collect endpoints for dense foliage clusters
      if (depth >= 3 || len < 1.2) {
        var numLeaves = 6 + Math.floor(rng() * 8);
        for (var k = 0; k < numLeaves; k++) {
          leafClusterPositions.push({
            x: ex + (rng() - 0.5) * 1.4,
            y: ey + (rng() - 0.4) * 1.1,
            z: ez + (rng() - 0.5) * 1.4,
            scale: 0.45 + rng() * 0.45,
            tier: depth
          });
        }
      }

      if (depth >= 4 || rad < 0.07) return;

      var childCount = depth === 0 ? 4 : (rng() > 0.35 ? 3 : 2);
      for (var i = 0; i < childCount; i++) {
        var spread = 0.42 + rng() * 0.32;
        var angle = (i / childCount) * Math.PI * 2 + (rng() - 0.5) * 0.6;
        var ndx = dx + Math.cos(angle) * spread;
        var ndy = dy + 0.18 + rng() * 0.28;
        var ndz = dz + Math.sin(angle) * spread;
        addBranch(ex, ey, ez, ndx, ndy, ndz, len * (0.68 + rng()*0.08), rad * (0.64 + rng()*0.06), depth + 1);
      }
    }

    // Root trunk
    addBranch(0, 0, 0, 0, 1, 0, 3.4, 0.58, 0);

    // Additional crown fill positions for volumetric dome
    var crownCenterY = 6.2;
    for (var c = 0; c < 260; c++) {
      var theta = rng() * Math.PI * 2;
      var phi   = rng() * Math.PI * 0.6;
      var r     = 1.5 + rng() * 3.2;
      leafClusterPositions.push({
        x: Math.sin(phi) * Math.cos(theta) * r,
        y: crownCenterY + Math.cos(phi) * (r * 0.75) + (rng() - 0.5) * 1.2,
        z: Math.sin(phi) * Math.sin(theta) * r,
        scale: 0.55 + rng() * 0.5,
        tier: 5
      });
    }

    // Drooping weeping outer boughs (characteristic of authentic Sakura / willow)
    for (var w = 0; w < 120; w++) {
      var wTheta = rng() * Math.PI * 2;
      var wR = 3.2 + rng() * 1.8;
      leafClusterPositions.push({
        x: Math.cos(wTheta) * wR,
        y: 3.8 + rng() * 2.2,
        z: Math.sin(wTheta) * wR,
        scale: 0.35 + rng() * 0.4,
        tier: 6
      });
    }

    // 2. High-Density Instanced Botanical Foliage
    var totalClusters = leafClusterPositions.length;
    var clusterGeo = new THREE.DodecahedronGeometry(0.7, 1);

    var foliageMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // tinted via instanced colors
      roughness: 0.52,
      metalness: 0.02,
      flatShading: true
    });

    var foliageMesh = new THREE.InstancedMesh(clusterGeo, foliageMat, totalClusters);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;

    var dummy = new THREE.Object3D();
    var baseCol = new THREE.Color(leafColorHex);
    var altCol  = new THREE.Color(seasonCfg.leafAlt);
    var highCol = new THREE.Color(seasonCfg.leafHighlight);

    for (var idx = 0; idx < totalClusters; idx++) {
      var lp = leafClusterPositions[idx];
      dummy.position.set(lp.x, lp.y, lp.z);
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      dummy.scale.set(lp.scale, lp.scale * (0.85 + rng() * 0.3), lp.scale);
      dummy.updateMatrix();
      foliageMesh.setMatrixAt(idx, dummy.matrix);

      // Natural botanical color variation:
      var blend = rng();
      var cCol = new THREE.Color();
      if (blend < 0.6) {
        cCol.copy(baseCol).lerp(altCol, rng() * 0.45);
      } else if (blend < 0.88) {
        cCol.copy(altCol).lerp(baseCol, rng() * 0.3);
      } else {
        cCol.copy(highCol).lerp(altCol, 0.5);
      }
      foliageMesh.setColorAt(idx, cCol);
    }

    foliageMesh.instanceMatrix.needsUpdate = true;
    if (foliageMesh.instanceColor) foliageMesh.instanceColor.needsUpdate = true;
    treeGroup.add(foliageMesh);
  }

  // ── Weather Particles ──────────────────────────────────────────────────────
  function buildParticles(seasonCfg, particleColorHex) {
    var THREE = window.THREE;
    if (particleMesh) scene.remove(particleMesh);

    var isRain = seasonCfg.weatherType === 'rain';
    var count = isRain ? 280 : 160;
    var pos = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      pos[i*3]     = (Math.random() - 0.5) * 32;
      pos[i*3 + 1] = Math.random() * 24 + 1;
      pos[i*3 + 2] = (Math.random() - 0.5) * 32;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    var size = isRain ? 0.24 : 0.42;
    var mat = new THREE.PointsMaterial({
      color: particleColorHex,
      size: size,
      transparent: true,
      opacity: 0.85
    });

    particleMesh = new THREE.Points(geo, mat);
    scene.add(particleMesh);
  }

  // ── Rebuild Scene ──────────────────────────────────────────────────────────
  function rebuildScene() {
    if (!scene) return;
    var s = SEASONS[state.season];
    var dataColorHex = (PALETTES[state.palette] && PALETTES[state.palette].hex) || s.leafColor;

    var qrSize = buildQRPavement(state.url, s, dataColorHex);
    buildPlatform(s, qrSize);
    buildRealisticTree(s, dataColorHex, state.seed);
    buildParticles(s, s.particleColor);

    updateViewMode();
  }

  function setQRMode(active) {
    state.qrMode = active;
    updateViewMode();
  }

  function updateViewMode() {
    var pill = document.getElementById('toggle-pill');
    if (state.qrMode) {
      cam.tPitch = 0.001; // top-down
      cam.tYaw   = 0.0;
      cam.tDist  = 34;
      pill.textContent = 'Tap to see the tree';
    } else {
      cam.tPitch = 0.76;
      cam.tYaw   = 0.785; // isometric diamond
      cam.tDist  = 40;
      pill.textContent = 'Tap the tree to see QR code';
    }
  }

  // ── Animate Loop with Natural Organic Wind ─────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    // Smooth camera lerp
    cam.pitch += (cam.tPitch - cam.pitch) * 0.09;
    cam.yaw   += (cam.tYaw   - cam.yaw)   * 0.09;
    cam.dist  += (cam.tDist  - cam.dist)  * 0.09;

    camera.position.set(
      cam.dist * Math.sin(cam.pitch) * Math.sin(cam.yaw),
      cam.dist * Math.cos(cam.pitch),
      cam.dist * Math.sin(cam.pitch) * Math.cos(cam.yaw)
    );
    camera.lookAt(0, 1.8, 0);

    // Smooth Tree Growth / Collapse Transition
    var targetScale = state.qrMode ? 0.0001 : 1.0;
    treeScale += (targetScale - treeScale) * 0.12;

    if (treeGroup) {
      treeGroup.scale.set(treeScale, treeScale, treeScale);
      treeGroup.visible = treeScale > 0.01;

      // Realistic Bending Wind Sway (not rigid rotation!)
      if (!state.qrMode && treeScale > 0.8) {
        var swayZ = (Math.sin(t * 1.1) * 0.014 + Math.sin(t * 2.4) * 0.006);
        var swayX = (Math.cos(t * 0.85) * 0.012 + Math.cos(t * 1.9) * 0.005);
        treeGroup.rotation.z = swayZ;
        treeGroup.rotation.x = swayX;
      }
    }

    // Weather Particles Animation
    if (particleMesh) {
      var s = SEASONS[state.season];
      var pts = particleMesh.geometry.attributes.position.array;
      var n   = pts.length / 3;
      var isRain = s.weatherType === 'rain';

      for (var i = 0; i < n; i++) {
        if (isRain) {
          pts[i*3 + 1] -= 0.28; // falling rain
          pts[i*3]     += 0.025;
        } else {
          // Gentle floating petals / leaves drifting on wind vortex
          pts[i*3]     += Math.sin(t * 0.7 + i * 1.2) * 0.016 + 0.006;
          pts[i*3 + 1] -= 0.028 + Math.sin(t * 0.5 + i) * 0.006;
          pts[i*3 + 2] += Math.cos(t * 0.6 + i * 1.5) * 0.014;
        }

        if (pts[i*3 + 1] < 0) {
          pts[i*3]     = (Math.random() - 0.5) * 32;
          pts[i*3 + 1] = 18 + Math.random() * 6;
          pts[i*3 + 2] = (Math.random() - 0.5) * 32;
        }
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // ── UI Listeners ───────────────────────────────────────────────────────────
  var paletteContainer = document.getElementById('palette-row');
  PALETTES.forEach(function (p, i) {
    var b = document.createElement('button');
    b.className = 'swatch' + (i === state.palette ? ' active' : '');
    b.style.background = p.color;
    b.title = p.name;
    b.addEventListener('click', function () {
      state.palette = i;
      document.querySelectorAll('.swatch').forEach(function (s, j) {
        s.classList.toggle('active', j === i);
      });
      rebuildScene();
    });
    paletteContainer.appendChild(b);
  });

  document.querySelectorAll('.season-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sIdx = parseInt(btn.dataset.s);
      state.season = sIdx;
      document.querySelectorAll('.season-btn').forEach(function (b, j) {
        b.classList.toggle('active', j === sIdx);
      });
      rebuildScene();
    });
  });

  document.getElementById('toggle-pill').addEventListener('click', function () {
    setQRMode(!state.qrMode);
  });

  var urlInput = document.getElementById('url-input');
  urlInput.value = state.url;

  function handleUrlUpdate() {
    var v = urlInput.value.trim();
    if (!v) return;
    state.url = cleanUrl(v);
    urlInput.value = state.url;
    rebuildScene();
  }
  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleUrlUpdate();
  });

  function getShareUrl() {
    try {
      var q = btoa(state.season + '' + state.palette + (state.url || ''));
      return location.origin + location.pathname + '?q=' + q;
    } catch(e) { return location.href; }
  }

  document.getElementById('btn-share').addEventListener('click', function () {
    handleUrlUpdate();
    document.getElementById('share-url').value = getShareUrl();
    document.getElementById('modal-bg').classList.add('open');
  });
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
      setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
    }).catch(function () {
      document.getElementById('share-url').select();
      document.execCommand('copy');
    });
  });

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
        var f = audioCtx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 350; f.Q.value = 2.5;
        var g = audioCtx.createGain();         g.gain.value = 0.05;
        audioSrc.connect(f); f.connect(g); g.connect(audioCtx.destination);
        audioSrc.start();
        state.muted = false;
        btn.classList.add('active');
        btn.title = 'Sound On';
        document.getElementById('sound-icon').innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      } catch(e) {}
    } else {
      if (audioSrc) { try { audioSrc.stop(); } catch(e){} audioSrc = null; }
      state.muted = true;
      btn.classList.remove('active');
      btn.title = 'Sound Off';
      document.getElementById('sound-icon').innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    }
  });

  document.getElementById('info-btn').addEventListener('click', function () {
    alert("CruseQR Magic Tree\\n\\nTurn any URL into a living 3D procedural tree rooted in a scannable QR code pavement.\\n\\n• Tap the tree to switch to the flat top-down scanner\\n• Pick Spring, Summer, or Autumn themes\\n• Customize petal colors and share your unique tree!");
  });

  function waitInit() {
    if (window.THREE && window.qrcode) {
      initThree();
    } else {
      setTimeout(waitInit, 60);
    }
  }
  waitInit();

})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "../gh-pages/index.html"), html);
console.log("Successfully rebuilt realistic tree in gh-pages/index.html!");
