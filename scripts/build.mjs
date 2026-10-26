// Builds the standalone app (www/) from src/seben-notes.html, the same file published inside Claude.
// Libraries are copied locally so the app also works offline.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const out = root + "www/";
rmSync(out, { recursive: true, force: true });
mkdirSync(out + "vendor", { recursive: true });

const libs = {
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js": "pdfjs-dist/build/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js": "pdfjs-dist/build/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js": "html2canvas/dist/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js": "jspdf/dist/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js": "jszip/dist/jszip.min.js",
  "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js": "pptxgenjs/dist/pptxgen.bundle.js",
};

let app = readFileSync(root + "src/seben-notes.html", "utf8");
for (const [url, file] of Object.entries(libs)) {
  const name = file.split("/").pop();
  cpSync(root + "node_modules/" + file, out + "vendor/" + name);
  if (!app.includes(url)) throw new Error("Library URL not found in app: " + url);
  app = app.split(url).join("vendor/" + name);
}
app = app.replace(/<title>[^<]*<\/title>\s*/, "").replace(/<meta name="claude:[^>]*>\s*/g, "");

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Seben Notes</title>
<meta name="description" content="Bloc-notes intelligent : notes, écriture à la main, listes, rappels et PDF.">
<meta name="theme-color" content="#0C7A63">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
${app}
<script src="native.js"></script>
</body>
</html>
`;
writeFileSync(out + "index.html", html);
cpSync(root + "public", out, { recursive: true });

// Precache list for the service worker
const version = Date.now().toString(36);
const files = ["./", "index.html", "native.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", ...Object.values(libs).map(f => "vendor/" + f.split("/").pop())];
const sw = readFileSync(out + "sw.js", "utf8").replace("__VERSION__", version).replace("__FILES__", JSON.stringify(files));
writeFileSync(out + "sw.js", sw);
console.log("Built www/ (" + version + ")");
