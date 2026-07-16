---
name: update-system-design
description: Edit the DCB hand-drawn system-design diagrams (public/dcb-system.html, public/dcb-{copilot,practice,research,public}-system.html, public/dcb-practice-workflow.html). Use whenever adding, removing, resizing, or relabeling nodes/arrows in these SVG diagrams. Covers the file structure, coordinate conventions, the box/arrow/label patterns, the rules that bite, and how to verify + ship.
---

# Updating the DCB system-design diagrams

## Where they live
- `public/dcb-system.html`, the whole-suite "how it fits together" diagram. Embedded at `/dcb-system`, on `/dcb`, and in case studies.
- `public/dcb-{copilot,practice,research,public}-system.html`, per-product diagrams, embedded in each `/work/<slug>` case study.
- `public/dcb-practice-workflow.html`, the "workflow, made reviewable" diagram.

They are hand-authored SVG with an Excalidraw look (a `#rough` feTurbulence filter + a hand font stack). They are **not** `.excalidraw` files, you edit SVG coordinates directly. (If the user wants drag-to-edit, that is a separate migration to real Excalidraw exports; this skill is for the current hand-SVG files.)

## Structure of each file (read before editing)
`<html data-theme="dark">` → a `<style>` block (theme tokens + `.t-*` text classes + `.pill`) → the SVG. The SVG has three parts:
1. `<defs>`, the `#rough` filter and arrowhead `<marker>`s: `arrow` (ink), `arrowGreen`, `arrowMuted`, `arrowPink`.
2. **ROUGHENED SHAPES** `<g filter="url(#rough)" fill="none">`, every box `<rect>`, zone container, and connector `<path>` arrow. The filter gives the hand-drawn wobble.
3. **CRISP TEXT** `<g>`, all `<text>` labels and the label pills (`<g transform="translate(cx,cy)"><rect class="pill">…<text>…</g>`). Text is kept OUT of the rough filter so it stays legible.

## Coordinates
- Fixed `viewBox="0 0 W H"` (suite is `1560 1080`). Coordinates are absolute; the SVG scales to container width.
- Box: `<rect x y width height rx …>`. A box's four edges are the anchor points for arrows.
- Arrow: `<path d="Mx y C …" … marker-end="url(#arrowGreen)"/>`. It should start and end on box EDGES.
- Label: a `<text x y>` or a pill centered at `translate(cx,cy)` sitting ON its arrow.

## Colors (theme tokens, never hardcode)
Product colors: **Research = yellow**, **Public = blue**, **Practice = green**, **Copilot = violet**. **Human = pink**, **External service/source = grey**. Tokens: `--{color}-s` (stroke), `--{color}-f` (fill), plus `--ink`, `--muted`, `--edge`. Arrow color usually matches the source node.

## Rules that bite (all learned the hard way)
1. **Arrows anchor to box edges.** Resize or move a box and every arrow touching it must be re-pointed to the new edge, or it dangles in empty space. To find them, grep the file for the box's old edge coordinate.
2. **Edge-to-edge connector = short straight arrow, label in the middle.** The reference is the entitlement arrow: `M912 516 C 912 500 912 486 912 472`, a short line from one box edge to the neighbor's edge, its pill centered on it. Copy this for any box→box connector. Do NOT route long diagonals through other boxes or text.
3. **Nested elements sit inside their box's rect.** A store/label drawn "in" a product is at coordinates within that box, so deleting it just leaves whitespace, the box does not shrink itself.
4. **Shrinking a box opens a gap.** Connector arrows to neighbors get longer; re-point them to the new edge and move their labels to the middle of the longer arrow.
5. **Em-dash-free.** Use commas / colons / `·` in diagram text, no long dashes, matching the rest of the site.

## Common operations
- **Add a node:** add a `<rect>` in ROUGHENED SHAPES (copy an existing grey external rect, or use the product color) + its `<text>` in CRISP TEXT. Place it in verified-empty space (check no rect/text occupies those coords).
- **Add an edge-to-edge arrow:** short `<path>` in the connectors block, source-box edge → target-box edge, `marker-end` matching the source color, label pill centered. Mirror the entitlement arrow.
- **Remove an element:** delete its `<rect>`/`<text>`/`<path>` AND any arrow that pointed at it (or re-point that arrow to a surviving box). Unused `.t-*` CSS rules can be left; they are harmless.
- **Resize a box:** change the rect `height`/`width`, reflow the `<text>` inside, then re-point every arrow anchored to the changed edge and move affected labels.

## Verify (do not skip, this is a pixel-perfect artifact)
- `npm run build`, then screenshot the **standalone** file at `http://localhost:4321/<file>.html`, NOT the embedded iframe (the site uses Lenis smooth-scroll that tears screenshots).
- To see a tall diagram whole: in the page, `document.querySelector('header').style.display='none'` and shrink `.stage` width, then screenshot.
- If the browser extension is disconnected, verify by coordinates instead: confirm each arrow's start/end lands inside its intended box's rect bounds and that no two elements overlap. State clearly that you could not screenshot.

## Ship
- Never push straight to `main`: branch → PR → squash-merge (the Pages workflow deploys on merge).
- `npm run build` must be clean; then `git`-ship and `curl` the live `.html` to confirm the change is present.
