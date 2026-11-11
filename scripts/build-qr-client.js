const fs = require("fs");
const path = require("path");

const seen = new Map();
function collect(file) {
  const abs = require.resolve(file);
  if (seen.has(abs)) {
    const existing = seen.get(abs);
    return typeof existing === "number" ? existing : existing.id;
  }
  const id = seen.size;
  seen.set(abs, id);
  let code = fs.readFileSync(abs, "utf8");
  code = code.replace(/require\(['"]([^'"]+)['"]\)/g, (_m, req) => {
    const target = req.startsWith(".") ? path.resolve(path.dirname(abs), req) : req;
    const childId = collect(target);
    return `__req(${childId})`;
  });
  seen.set(abs, { id, code });
  return id;
}

const entry = collect(path.resolve(__dirname, "../node_modules/qrcode/lib/core/qrcode.js"));
const svgEntry = collect(path.resolve(__dirname, "../node_modules/qrcode/lib/renderer/svg-tag.js"));

const mods = [];
for (const v of seen.values()) {
  mods[v.id] = `function(module, exports, __req){\n${v.code}\n}`;
}

const out = `(function(){var M=[${mods.join(",")}],C={};function R(i){if(C[i])return C[i].exports;var m=C[i]={exports:{}};M[i](m,m.exports,R);return m.exports;}var Q=R(${entry}),S=R(${svgEntry});window.jkQrSvg=function(txt){return S.render(Q.create(txt,{errorCorrectionLevel:"M"}),{margin:1,width:200,color:{dark:"#06210d",light:"#ffffff"}});};})();`;

const outPath = path.resolve(__dirname, "../public/qr-gen.js");
fs.writeFileSync(outPath, out);

const w = {};
Function("window", out)(w);
const svg = w.jkQrSvg("upi://pay?pa=jayakesh@upi&am=399.00&cu=INR");
console.log("Generated public/qr-gen.js:", (out.length / 1024).toFixed(1), "KB | Valid SVG:", svg.startsWith("<svg"));
