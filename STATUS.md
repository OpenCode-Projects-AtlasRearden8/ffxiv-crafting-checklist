# STATUS.md — FFXIV Crafting Checklist

## Project status

**Complete.** The interrupted build was finished and verified: one runtime bug
fixed, one security hardening, one parser improvement, a new contract-test
suite added, README expanded, all 35 tests green.

## What was built

A dependency-free static web app (`index.html` + `app.js` + `styles.css`) that
turns a pasted FFXIV crafting materials list into a gathering/purchase
checklist:

- **Parsing** (`src/parse.js`): handles `12 Fire Shard`, `Oak Log x18`,
  `3x Iron Ore`, `×`/`*` separators, tab- or multi-space-separated name/quantity,
  comma thousands (`1,250`), bullets, `# comments`, header-colon lines, and
  ignores timestamps/level lines. Bare lowercase lines (no quantity) are
  skipped so freeform text stays out of the checklist. When a line has both a
  leading count and an explicit trailing ×N (`1 Oak Lumber x 6`), the explicit
  ×N wins and the lead number is treated as a stack count.
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
  `path.relative` root-containment guard (strict substitution check, not a
  prefix match); `npm start` → `http://localhost:5173` (`PORT` env overrides).

No game data scraping anywhere: the app only reads what the user pastes.

## What changed while finishing

- **Bug fix (`app.js`)**: the category-dropdown handler called a nonexistent
  `categorize()` function — picking a bucket threw a `ReferenceError` and left
  the stale UI hanging. Renamed to the existing `contextualize()`, and the
  overrides + re-categorized items are now merged into state in a single save.
- **Security hardening (`server.mjs`)**: replaced the `filePath.startsWith(ROOT)`
  prefix check (defeat-able by a sibling directory such as `...-checklist-x`)
  with `path.relative` + `isAbsolute` root containment.
- **Parser improvement (`src/parse.js`)**: `1 Oak Lumber x 6` previously parsed
  as quantity 1 named "Oak Lumber x 6"; the explicit trailing ×N now wins.
  Matches the placeholder example shipped in `index.html`.
- **New tests (`test/wiring.test.mjs`)**: dependency-free contract tests
  pinning `app.js` → `index.html` ids, `app.js` → `styles.css` classes, plus a
  guard that `index.html` loads only local assets (no external scripts/cdn).
- **README**: added supported-formats table (documenting the ×N-wins rule),
  `PORT` configuration, keyboard shortcut, test-suite breakdown, repository
  layout including LICENSE/STATUS.md, and a troubleshooting section.

## How to run

```bash
npm start            # Node 18+, then open http://localhost:5173
                     # or: PORT=3000 npm start
# or: python3 -m http.server 5173
npm test             # 35 tests, node:test, zero dependencies
```

## Verification results

- `npm test` → **35/35 tests pass** (parse: 14, math: 9, sources: 7,
  wiring: 5) via `node --test`.
- `node --check` → syntax OK for `app.js`, `server.mjs`, and all `src/*.js`.
- Server smoke test (curl): `/`, `/app.js`, `/styles.css` → 200 with correct
  MIME types; `/nope` → 404; hostile traversal paths (`/..%2fetc%2fpasswd`,
  `/../../etc/passwd` variants) → 403/404, root never escaped (WHATWG URL
  parsing collapses dot segments before they reach the filesystem).
- Manual end-to-end pipeline: the 14-line sample list parses with no warnings →
  14 merged items (3 mining / 4 botany / 3 vendor / 1 fishing / 3 other) →
  capped progress math returns 0/2596 with an empty collected map.
- LICENSE verified: MIT, copyright line exactly
  `Copyright (c) 2026 Asdale Dynamics, LLC`; README credits Asdale Dynamics,
  LLC with a link to dylanasdale.github.io.
- Browser surface (DOM events, localStorage) is now covered by the wiring
  contract tests for file-level integrity; no live-browser/E2E run was
  performed (no browser automation dependency added, by design).

## Known gaps

- Category guessing is keyword-based, so it must be treated as a hint:
  obscure item names can land in "Your Call (Edit Me)" until the user picks a
  bucket (persisted per item; overrides are stored per exact name string, so
  renamed/re-spelled entries re-prompt).
- No crafting-tree expansion (sub-combines) — input is a flat materials list,
  by design.
- No automated browser/E2E test (no framework dependency added on purpose);
  UI verified by wiring contract tests, code review, and the manual pipeline
  smoke test above.
- Single-locale (English keyword heuristics); i18n not attempted.
- Checkbox checked <=> item fully collected (no partial-count entry per item);
  partial woods-gathered tracking would need a stepper UI.
