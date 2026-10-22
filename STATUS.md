# STATUS.md — FFXIV Crafting Checklist

## What was built

A dependency-free static web app (`index.html` + `app.js` + `styles.css`) that
turns a pasted FFXIV crafting materials list into a gathering/purchase
checklist:

- **Parsing** (`src/parse.js`): handles `12 Fire Shard`, `Oak Log x18`,
  `3x Iron Ore`, `×`/`*` separators, tab- or multi-space-separated name/quantity,
  comma thousands (`1,250`), bullets, `# comments`, header-colon lines, and
  ignores timestamps/level lines. Lines without quantities are treated as items
  only when Title-Case (kept as conversational-text guard).
- **Quantity math** (`src/math.js`): merges duplicates by normalized name,
  sums quantities, groups by source, computes capped overall progress
  (collected vs. needed and percent).
- **Source grouping** (`src/sources.js`): keyword-based best guess into
  Mining / Botany / Fishing / Monster Drops / Vendor-Market Board / "Your Call".
  Unknowns go to "Your Call", where a dropdown lets the user pick — the choice
  is persisted (category overrides).
- **UI**: grouped checklist cards with per-item checkboxes, per-group collected
  counts, an overall progress bar, sample list loader, clear-progress button,
  `Ctrl/Cmd+Enter` to build, friendly empty/warning states.
- **Persistence**: list text, items, checkbox state, and category overrides are
  saved in `localStorage` (`ffxiv-crafting-checklist-v1`).
- **Server** (`server.mjs`): tiny Node static server with MIME types and a
  path-traversal guard; `npm start` → `http://localhost:5173`.

No game data scraping anywhere: the app only reads what the user pastes.

## How to run

```bash
npm start        # Node 18+, then open http://localhost:5173
# or: python3 -m http.server 5173
```

## Verification results

- `npm test` → **29/29 tests pass** (parse: 12, math: 8, sources: 9) via
  `node --test`.
- `node --check` → syntax OK for `app.js`, `server.mjs`, and all `src/*.js`.
- Server smoke test → `200`s with correct MIME types for `/`, `styles.css`,
  `app.js`, `src/parse.js`, `src/math.js`, `src/sources.js`; 404 and traversal
  guard paths return proper errors.
- Manual pipeline smoke test with a sample list → items parse, merge, group
  into expected buckets, and progress math returns capped numbers (e.g. 3/90).
- Browser surface (DOM events, localStorage) is wired but not covered by an
  automated browser test (see gaps).

## Known gaps

- Category guessing is keyword-based, so it must be treated as a hint:
  obscure item names can land in "Your Call (Edit Me)" until the user picks a
  bucket (persisted per item).
- Bare lowercase lines (no quantity) are skipped to avoid junk from freeform
  text; FFXIV has a few lowercase item names this would miss.
- Floating client-side assets: no automated browser/E2E test yet (no test
  framework dependency added on purpose); UI was verified by code review and
  the manual pipeline smoke test above.
- No crafting-tree expansion (sub-combines) — input is a flat materials list,
  by design.
- Single-locale (English keyword heuristics); i18n not attempted.
