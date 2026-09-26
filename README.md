# PixelSand

A browser-based falling-sand simulator with a working digital logic layer, built as a single self-contained HTML file.

It started as a particle sandbox and grew a computer. Sand, water and fire behave the way you would expect; alongside them are wires, gates, counters, serial buses and programmable chips, so a board can be a landscape, a circuit, a pinball table, or all three at once.

**Current version:** v13.244 · **Board:** 320 × 200 cells · **Elements:** 226 across 19 categories · **Single file:** ~13 MB, no build step, no dependencies to install.

---

## Running it

Open the `.html` file in a browser. That is the whole process — it is precompiled ES5 in one file, with no server, bundler or network access required.

Desktop and mobile are both supported, including touch placement, a floating side panel, and a probe tool for inspecting cells on a phone.

---

## What is in it

### Materials and physics
Powders, liquids and gases with density-based interaction, so oil floats on water and sand displaces both. Fire spreads and consumes, ice melts, plants grow toward light, and unsupported material collapses. Soil arches over a tunnel rather than filling it instantly, which is what makes underground structures hold.

### Life
27 creature simulations — birds, fish, bats, ants, spiders and more — each with its own movement, feeding and nesting behaviour. Ants dig real tunnels and pile the spoil outside the entrance. Birds perch, flee and scatter seed. A dollhouse mode adds residents with task chains, furniture affordances and multi-storey pathing.

### Electronics
A full electrical layer on its own grid: wires, diodes, capacitors, transistors, logic gates, counters, latches and oscillators, with power propagated by a breadth-first flood each frame. Complex enough that a PDP-11-style CPU has been attempted in it using gear primitives.

**Serial bus** — ports and taps carry six independent lines on any of 16 channels, letting distant parts of a board talk without wiring every connection by hand.

### Chips
Sixteen programmable chips, including:

| Chip | Purpose |
|---|---|
| `PINBALL_CHIP` | Score, ball count, tilt, game state — a whole table's logic |
| `VIDEO_CHIP` | Six text screens, selected by pin priority or latched |
| `SOUND` / `MUSIC` / `THEME` | Effects, one-shot cues and looping scores, four to five banks each |
| `SOUND_MANIFOLD` | Six isolated channels with per-channel pulse counts |
| `TIMER_CHIP` | Four outputs cycling over 5–60s, for rotating displays |
| `GAME_CHIP` | Reads the pinball game counter off a broadcast channel |
| `CASCADE` / `STEPPER` / `CALC` / `SCORE` | Sequencing, stepping and arithmetic |

Chips rotate and flip, carry their settings through copy and paste, and are configured in place by shift-clicking.

### Audio
A synthesised sound system — no samples. Effects, musical cues and looping multi-part themes, all generated through the Web Audio API and scheduled ahead of time so playback survives frame-rate dips.

### Pinball
Flippers, bumpers, slingshots, drop targets, ramps, one-way gates and a plunger, with real ball physics including spin, restitution per surface and tilt. Combined with the chips, a complete working table can be built on a board.

---

## Working on it

The project is a single compiled HTML file. Edits are applied to that file directly, and each change ships as a new numbered version with a changelog entry at the top of the file.

### House rules

These exist because breaking them has cost real debugging time:

- **Never add code inside `simulateMachines`.** It is the hot path and additions there have caused severe frame drops through JIT deoptimisation.
- **Keep the save format backward compatible.** Old boards must keep loading.
- **Follow the element registration checklist.** See `ELEMENT_TEMPLATE.js`.

### Adding an element

`ELEMENT_TEMPLATE.js` is a commented skeleton listing every registration point, organised by what the element actually does, with the silent-failure traps called out. The short version:

Always needed — id, registry entry, palette, placement, render, hover.
Then, depending on the element: physics class and density; `IS_SOLID` **and** `SMALL_CREATURE_BLOCKED` (they are separate lists); `ballBlocked` if pinballs hit it; **both** power predicates if it conducts; a BFS seed pass if it originates power; and for a configurable chip, save, load, stamp capture, all eight stamp passthroughs, and the mobile describer.

### Things that fail silently

Worth knowing before you spend an afternoon on one:

- `IS_SOLID` does **not** make an element block animals — that is a separate list.
- Registering power in one of the two predicates lights wires but leaves capacitors blind.
- A source without a seed pass never starts a flood, so its output looks dead.
- A chip that drives `lf` cannot also store its layout there — pack it into `cv`.
- A helper defined in one closure and called from another parses fine and throws at runtime. Check the enclosing **function**, not the brace depth.
- A new chip missing from `_pxsDescribeCell` shows nothing on mobile and reports no error.

### Verifying a change

Syntax checking catches almost none of the failures above. What works:

1. Parse the extracted script (`new Function(src)`) — catches typos only.
2. Confirm every new identifier exists.
3. Confirm each new helper is *reachable* from its call sites.
4. Run the actual logic against a synthetic board and check the behaviour, not just that the code is present.

Step 4 is the one that matters. A gate whose pass/block rule tested perfectly in isolation still failed on a real table, because balls rarely travel in a straight line.

---

## Saves

Boards save as `.pxs` files: JSON with run-length-encoded grid layers, plus per-chip configuration maps. Stamps (reusable copied regions) live in a separate library and carry chip settings through rotation and flipping.
