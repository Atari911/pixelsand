# PixelSand

A browser-based falling-sand / physics sandbox. Everything runs client-side in a single HTML file — no server, no backend, no install. Drop in powders, liquids, fire, plants, creatures, machines and wiring on a 320×200 cellular-automaton grid and watch them interact.

![version](https://img.shields.io/badge/version-9.0-4ade80)
![single file](https://img.shields.io/badge/build-single--file-9d50e6)
![runtime](https://img.shields.io/badge/runtime-React%20(UMD)-f0b460)

## Features

- **~180 elements** across Materials, Life, Machines, Electrical, and Decor categories.
- **Material physics** — density-driven powders, liquids, gases and solids (sand, water, oil, lava, acid, steam, smoke, ice, gunpowder, metals, and more) with melting, burning, dissolving, freezing and mixing interactions.
- **Life & flora** — growing plants and trees (oak, pine, birch, cherry, willow, palm, redwood), mushrooms, grass, and a large cast of creatures (fish, birds, ants, bees, frogs, spiders, and others) with their own movement and behavior.
- **Machines** — pipes, valves, pumps, gears, axles, pistons, conveyors, fans and turbines that route and act on materials.
- **Electrical / logic** — switches, lamps, transistors and logic gates, up to a working RAM demonstration harness.
- **Pinball physics** — ball/track traversal with flippers and related parts.
- **Tools** — stamps (capture and place regions), brush sizes, eraser, zoom/pan, pause, adjustable sim speed, a day/night sky, and picture-in-picture.

## Running it

### Use it (production build)

Open **`pixelsand-v9_0-compiled.html`** in any modern browser — double-click it or drag it into a tab. Nothing to install.

The compiled file loads React and ReactDOM from a CDN, so the first load needs an internet connection. Hosting it on a static web server (or any static host) works the same way.

### Develop it (source build)

**`pixelsand-v9_0.html`** is the editable source. It transpiles JSX in the browser via `@babel/standalone`, so you can just open it, edit, and reload — no toolchain required while iterating.

That convenience costs startup time: every page load downloads Babel and transpiles the whole app (~33k lines). For the shipped build, that step is done ahead of time instead.

## Build

The build step compiles the in-browser JSX source into the production file. It requires [Node.js](https://nodejs.org) (v16+).

```bash
npm install @babel/standalone
node build.js pixelsand-v9_0.html
```

This emits `pixelsand-v9_0-compiled.html` next to the source. The output filename follows the input automatically, so bumping the version is just: edit the `<title>`, add a changelog entry, save as the new `pixelsand-vX_Y.html`, and rerun.

### What the build does

- Removes the `@babel/standalone` CDN script.
- Compiles the `<script type="text/babel">` block ahead of time using the exact presets the browser applied by default (`["react", "env"]`), then injects it as a plain `<script>`.
- Leaves React/ReactDOM as UMD globals (no bundling). Helpers such as `_asyncToGenerator` are inlined, so the output is self-contained — no regenerator runtime needed.

The result is **byte-for-byte the same code the browser was producing at runtime**, just generated once. Load time drops dramatically with no change to behavior or frame rate.

> **Why `env` and not a leaner modern transform?** The per-frame `loop()` and its enclosing `useEffect` are very large hot functions that V8 runs in the interpreter. With native `const`/`let` they pay per-access dead-zone checks and per-iteration binding costs that plain `var` does not; `env` lowers everything to `var`/ES5, which the interpreter runs much faster. A native/esbuild build measured 60 → ~15 FPS on the same scene, so matching the `env` output is intentional.

## Project structure

| File | Role |
| --- | --- |
| `pixelsand-v9_0.html` | Editable source (in-browser Babel). Edit and double-click to develop. |
| `pixelsand-v9_0-compiled.html` | Production build emitted by `build.js`. This is the one to ship/run. |
| `build.js` | Precompile step (Node). Strips runtime Babel and compiles the JSX ahead of time. |

## Technical notes

- Single React component rendered via React 18 UMD; no bundler.
- The simulation grid is three parallel typed arrays (element id, per-cell variant/state, and lifespan/state), with per-cell state bit-packed into the spare bytes to avoid per-cell object allocation.
- Rendering writes directly to a canvas `ImageData` buffer rather than through DOM/React, which is what keeps a 64,000-cell grid running at full frame rate.
- The `VERSION` constant is parsed from the document `<title>`, so the title is the single source of truth for the version shown in the UI.

## Versioning

Versions are bumped across the source, the changelog block, and the output filename together. The full, detailed changelog lives at the top of the source HTML.

---

PixelSand v9.0
