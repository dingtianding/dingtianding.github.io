# Portfolio redesign — "The Books" concept spec

Status: proposed, awaiting approval.
Author: Dean + Claude.
Branch target: `feat/showcase-motion` (or a fresh `feat/the-books`).

---

## 1. The unifying idea

The whole site is a set of **books being kept and then closed** — a financial system that audits itself.

Today the site already uses a ledger/diff aesthetic, but the sections are conventional (About, Work, Stack…).
This redesign makes the metaphor *structural*: every section becomes an operation in an accounting cycle, the projects become **posted, verified transactions pulled live from GitHub**, navigation becomes a **chart of accounts / command palette**, and there is one deliberately **off-book human entry** so the site reads as a person, not a spreadsheet.

Design principle, stated once so it governs everything below: **metaphor is the garnish, content is the meal.**
Every accounting label is a quiet mono eyebrow; the real headline, blurb, and proof stay front-and-center and scannable in ~20 seconds.
If the concept ever fights readability, readability wins.

Why this fits both the research and the brand:

- It is the "personal brand as a *system*" pattern that the top-ranked 2026 portfolios use, instead of a section stack.
- It fuses the two most recruiter-respected engineer-portfolio styles: the terminal/IDE aesthetic and scroll-scrubbed narrative.
- It leads with the career change as the hook (CPA → engineer), which both Awwwards-tier sites and the dev-subreddit consensus reward.
- It is *true*: deterministic, auditable, reviewable — the exact thing Dean says his products are.

---

## 2. Section → ledger mapping

The account codes reuse the existing `01 / … 05 /` numbering, restyled as account numbers.

| Current section | New framing | Eyebrow label | What changes |
|---|---|---|---|
| Nav | Chart of accounts | `chart of accounts` | Numbers become account codes; adds ⌘K palette (§4). |
| Hero | The reconciliation | `journal entry · career.diff` | Keep the animated diff — it is already the strongest asset. |
| About | Opening balance | `01 · opening balance` | Same copy; ledger sidebar reframed as "balances carried forward". |
| Building (Xelsius) | Work in progress | `02 · WIP / accrued` | Terminal mock stays; labeled as an un-posted, in-progress entry. |
| Work | Posted transactions | `03 · posted · verified` | **Rebuilt from live GitHub data as audited line-items (§3).** |
| Stack | Assets on the books | `04 · assets` | Tools framed as capitalized assets; minor copy only. |
| Off the clock | Non-billable hours | `05 · off-book` | **New human beat (§5).** |
| Contact | Close the books | `06 · close` | "Close the books" CTA; sign-off line. |
| Footer | Audit trail | `— signed off` | Timestamp + "reconciled" note; keep dynamic year. |

---

## 3. Live GitHub → verified ledger line-items (Work)

Goal: projects render as posted, **verified** transactions with real figures, so the aesthetic is backed by real proof.

**Data source & timing.**
Fetch public repo data from the GitHub REST API for `dingtianding` at **build time**, inside Astro frontmatter (or a small `src/data/github.ts` loader).
Build-time fetch means: no client rate limits, no token for public data, no runtime JS cost, and a fully static, deterministic page — on brand.
A scheduled GitHub Action (e.g. daily `workflow_dispatch` + cron) re-triggers the Pages build so figures stay current.
Curated `projects.ts` remains the source of truth for *which* projects show and their human blurb; GitHub supplies the live *figures* and is merged in by repo name.
Fallback: if the API is unavailable at build, render the last-known/curated values — never a broken card.

**Per line-item fields.**

- Repo name + one-line blurb (from `projects.ts`).
- Primary language, stars, last-commit date, and "hand-coded ✓" where applicable — rendered as ledger columns.
- A `verified ✓` stamp = "links to a real, public repo" (skipped for private repos, which show `private · on file`).
- Optional running total in the section header (e.g. "n repositories · reconciled").

**Motion.** Line-items "post" in on scroll with a brief figure count-up and a verified stamp that lands last (builds on the existing card batch).

Open decision: include stars/last-commit, or keep it to language + verified only if the numbers feel small?
Recommendation: show language + verified + hand-coded; show stars only when ≥ a threshold so a `0` never reads as weak.

---

## 4. Command palette (⌘K) — the chart of accounts

An operator-grade navigation layer that signals "this person builds tools."

- Trigger: `⌘K` / `Ctrl-K`, plus a subtle always-visible hint in the nav (`⌘K`).
- Behavior: modal overlay, fuzzy filter, arrow-key navigation, `Enter` to act, `Esc`/backdrop to close; focus-trapped and fully keyboard-operable.
- Items (grouped): **Jump to** (each account/section) · **Actions** (download résumé, copy email, open GitHub, open LinkedIn) · **Meta** (view source on GitHub, toggle reduced-motion respected).
- Aesthetic: same terminal panel as the Building mock; each result prefixed with its account code.
- Tech: one small Astro island with vanilla TS (no new framework dep); ~2–3 KB. Progressive enhancement — if JS is off, normal nav links still work.
- A11y: `role="dialog"`, labelled, restores focus to trigger on close; honors `prefers-reduced-motion` for the open/close transition.

---

## 5. "Off the clock" — the human entry (05 · off-book)

One short, warm, personal section so the site remembers to be a person.
Framed as **non-billable hours / off-book entries**: lifting and K-pop dance.
Tone: dry-funny, self-aware, brief — a single ledger-style aside, not a life story.

Draft copy (placeholder, to refine):
> `05 · off-book`
> **Non-billable hours.**
> Entries that don't reconcile to revenue and don't need to — heavy compound lifts and K-pop choreography.
> Both are just deterministic systems you debug with your body.

Motion: minimal — a quiet reveal; this beat earns attention by contrast with the dense sections, not by more animation.
Optional: a couple of small, tasteful photos if Dean wants a face/personality; otherwise text-only keeps it sharp.

---

## 6. Motion & consistency

Everything inherits the existing GSAP + Lenis + reduced-motion + no-JS discipline already in the codebase.

- Reuse: hero diff timeline, ledger canvas, scrubbed terminal, clip-wipe titles, magnetic buttons, active-nav (all built).
- Add: figure count-ups + verified stamps (Work), palette open/close, off-book reveal.
- Guardrail: no new effect may delay first paint or hurt the ~20-second scan; the hero and each section's real content must be legible immediately.

---

## 7. Technical notes

- Stays Astro, static, GitHub Pages — no SSR, no backend.
- New/changed files (estimate): `src/data/github.ts` (loader), `src/components/Work.astro` (rebuild), `src/components/CommandPalette.astro` (new island), `src/components/OffClock.astro` (new), small edits to `Nav.astro`, `Contact.astro`, `About.astro`, `Building.astro`, `Stack.astro` for labels, plus a scheduled build workflow in `.github/workflows/`.
- No secrets: public GitHub API only; if we later want higher rate limits, a read-only `GITHUB_TOKEN` is already available inside Actions at build time (never shipped to the client).
- Accessibility and reduced-motion parity maintained throughout.

---

## 8. Risks & how we mitigate

- **Concept over content (the Reddit failure mode).** Mitigation: metaphor-as-garnish rule; real content and repo links stay dominant; scan test after each section.
- **Gimmick fatigue.** Mitigation: labels are subtle; only Work and the palette are structurally new — the rest is reframing, not rebuilding.
- **Stale/failed data.** Mitigation: build-time fetch with curated fallback; scheduled rebuild.
- **Palette as decoration only.** Mitigation: it must be genuinely faster than scrolling (real jump + actions), or we cut it.

---

## 9. Proposed rollout order

1. GitHub data loader + Work rebuilt as verified line-items (biggest proof-of-value; independent).
2. Command palette island.
3. Section relabeling to the audit-cycle spine (low risk, high cohesion).
4. Off-the-clock human beat.
5. Scheduled rebuild workflow + final scan/perf/a11y pass.

Each step ships behind the branch and is reviewable on its own.

---

## 10. Decisions needed from Dean

1. New branch `feat/the-books`, or continue on `feat/showcase-motion`?
2. Work figures: language + verified + hand-coded only, or also stars/last-commit?
3. Off-the-clock: text-only, or include a photo or two?
4. Résumé/contact actions in the palette — confirm the exact links (résumé PDF path, email, GitHub `dingtianding`, LinkedIn).
5. Any section you'd rather *not* rename (e.g. keep "About" literal for recruiter clarity)?
