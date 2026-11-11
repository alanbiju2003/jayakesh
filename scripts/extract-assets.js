const fs = require("fs");
const path = require("path");

const SOURCE_HTML = process.argv[2] || "C:\\Users\\Acer\\Downloads\\Jayakesh (5).html";
const OUT_DIR = path.join(__dirname, "..", "public", "assets");

fs.mkdirSync(OUT_DIR, { recursive: true });

if (!fs.existsSync(SOURCE_HTML)) {
  console.error("Source HTML not found:", SOURCE_HTML);
  process.exit(1);
}

const html = fs.readFileSync(SOURCE_HTML, "utf8");

const targets = [
  { key: "--paint-green", file: "paint-green.jpg" },
  { key: "--paint-pink", file: "paint-pink.jpg" },
  { key: "IMG", file: "bottle.png" },
  { key: "LOGO_SMALL", file: "logo-small.png" },
  { key: "LOGO_LEAF", file: "logo-leaf.png" },
  { key: "LOGO_REST", file: "logo-rest.png" },
  { key: "coconut", file: "coconut.jpg" },
  { key: "hibiscus", file: "hibiscus.jpg" },
  { key: "FAVICON", file: "favicon.png" },
];

const regex = /([\w-]+)\s*[:=]\s*(?:url\()?"data:image\/(\w+);base64,([A-Za-z0-9+/=]+)"/g;
const found = new Map();
let match;
while ((match = regex.exec(html)) !== null) {
  found.set(match[1], { ext: match[2], b64: match[3] });
}

let count = 0;
for (const t of targets) {
  const entry = found.get(t.key);
  if (!entry) {
    console.warn(`Warning: key "${t.key}" not found in HTML.`);
    continue;
  }
  const buf = Buffer.from(entry.b64, "base64");
  const outPath = path.join(OUT_DIR, t.file);
  fs.writeFileSync(outPath, buf);
  console.log(`Extracted ${t.file} (${(buf.length / 1024).toFixed(1)} KB)`);
  count++;
}

console.log(`Done! Extracted ${count}/${targets.length} assets to ${OUT_DIR}`);
