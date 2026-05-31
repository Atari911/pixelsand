#!/usr/bin/env node
/**
 * PixelSand precompile build  (v4 — browser-exact)
 * -------------------------------------------------------------
 * Emits the SAME bytes @babel/standalone produces in the browser
 * (presets ["react","env"]), just at build time. No runtime Babel,
 * no in-browser transpile — and byte-for-byte identical execution,
 * so performance matches the dev file exactly (it IS the dev file's
 * compiled output).
 *
 * Why not a leaner esbuild/native-let build: the per-frame loop and
 * its enclosing useEffect are very large hot functions. With native
 * const/let they run slower in V8's interpreter (TDZ hole checks +
 * per-iteration bindings) than env's all-var ES5 output. Reproducing
 * env exactly is what keeps the sim at full FPS.
 *
 * React / ReactDOM stay as UMD globals. _asyncToGenerator and all
 * other helpers are inlined by babel-standalone (no regenerator,
 * no external runtime needed).
 *
 * Usage: node build.js input.html [-o output.html]
 * (Build takes ~30s — it's the same transpile the browser was doing
 *  on every page load, now done once.)
 */
const fs = require("fs");
const path = require("path");
const Babel = require("@babel/standalone");

function arg(f){ const i = process.argv.indexOf(f); return i !== -1 ? process.argv[i+1] : null; }
const inputPath = process.argv[2];
if (!inputPath || inputPath.startsWith("-")) {
  console.error("Usage: node build.js <input.html> [-o output.html]");
  process.exit(1);
}
const outPath = arg("-o") || inputPath.replace(/\.html?$/i, "") + "-compiled.html";

const html = fs.readFileSync(inputPath, "utf8");

// 1. Drop the @babel/standalone CDN <script> tag.
let out = html.replace(/[ \t]*<script[^>]*@babel\/standalone[^>]*>\s*<\/script>\s*\n?/i, "");
if (out === html) console.warn("WARN: no @babel/standalone script tag found.");

// 2. Locate the JSX block.
const re = /<script\b[^>]*type=["']text\/babel["'][^>]*>([\s\S]*?)<\/script>/i;
const m = out.match(re);
if (!m){ console.error('ERROR: no <script type="text/babel"> block found.'); process.exit(1); }
const jsx = m[1];

// 3. Transform with the SAME presets babel-standalone uses for
//    <script type="text/babel"> by default: ["react","env"].
console.log("Transpiling (react + env, browser-exact)… this takes ~30s.");
const t0 = Date.now();
const compiled = Babel.transform(jsx, { presets: ["react", "env"] }).code;
console.log(`  done in ${((Date.now()-t0)/1000).toFixed(0)}s`);

// 4. Inject. Function replacer avoids $&/$`/$' interpretation in code.
const replaced = out.replace(re, () => `<script>\n${compiled}\n</script>`);
fs.writeFileSync(outPath, replaced);
console.log(`${path.basename(outPath)}  ${(Buffer.byteLength(replaced)/1024/1024).toFixed(2)} MB (source ${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB, no runtime Babel)`);
