const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicTreeDir = path.join(rootDir, "public", "tree-engine");
const ghPagesDir = path.join(rootDir, "gh-pages");
const ghPagesAssetsDir = path.join(ghPagesDir, "assets");

fs.mkdirSync(ghPagesAssetsDir, { recursive: true });

// Copy engine files from public/tree-engine to gh-pages
const bundle = fs.readFileSync(path.join(publicTreeDir, "main.js"), "utf8");
const css = fs.readFileSync(path.join(publicTreeDir, "main.css"), "utf8");
const logo = fs.readFileSync(path.join(publicTreeDir, "logo-dark.svg"), "utf8");

fs.writeFileSync(path.join(ghPagesAssetsDir, "main.js"), bundle);
fs.writeFileSync(path.join(ghPagesAssetsDir, "main.css"), css);
fs.writeFileSync(path.join(ghPagesDir, "logo-dark.svg"), logo);

const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
    <title>CruseQR Magic Tree — 3D Botanical QR Code Generator</title>
    <meta name="description" content="Turn any link into a stunning 3D tree that doubles as a scannable QR code. Pick a season, customize colors, and share your unique tree." />
    <meta name="theme-color" content="#f6f1e7" />
    <link rel="icon" type="image/svg+xml" href="./logo-dark.svg" />
    <link rel="stylesheet" crossorigin href="./assets/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="./assets/main.js"></script>
  </body>
</html>`;

fs.writeFileSync(path.join(ghPagesDir, "index.html"), htmlContent);
console.log("Successfully built authentic CruseQR WebGPU Magic Tree in gh-pages/!");
