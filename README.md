# FFXIV Crafting Checklist

Paste a crafting materials list, get a tidy shopping & gathering plan — grouped
by where each item comes from, with quantity math done for you and checkboxes
that remember your progress. It is a single static page: everything runs in
your browser, and nothing is uploaded, scraped, or tracked.

Made by [Asdale Dynamics, LLC](https://dylanasdale.github.io) — AI explained
like a friend would: plain English, step by step, never condescending.

## Who it's for

Crafters who copy a materials list out of the game (or their guild notes) and
end up with a messy wall of names and numbers. Paste it in, and this app:

1. **Parses what you pasted.** Handles the common list shapes people actually
   write — see [Supported formats](#supported-formats).
2. **Merges duplicates.** `Iron Ore ×3` plus another `Iron Ore x2` becomes one
   line: Iron Ore, ×5.
3. **Groups by source.** Items are bucketed into Mining / Botany / Fishing /
   Monster Drops / Vendor–Market Board, and anything baffling lands in
   "Your Call (Edit Me)" where a dropdown lets you set the bucket (your choice
   is saved).
4. **Tracks progress.** Check items off as you gather; an overall bar shows how
   far along you are, and your checkmarks survive a page reload.
5. **Stays local.** No accounts, no servers, no game data scraping. You paste
   your own list; nothing ever leaves your machine.

## Supported formats

| Example | Parsed as | Quantity |
| --- | --- | --- |
| `12 Fire Shard` | Fire Shard | 12 |
| `Oak Log x18` | Oak Log | 18 |
| `3x Iron Ore` | Iron Ore | 3 |
| `Iron Ore × 3` (`×` or `*` separator) | Iron Ore | 3 |
| `Fire Shard<TAB>12` | Fire Shard | 12 |
| `Fire Shard__12` (two+ spaces) | Fire Shard | 12 |
| `1,250 Gil Bond` (comma thousands) | Gil Bond | 1,250 |
| `- 3 Iron Ore` / `• Oak Log x2` (bullets) | as above | as above |
| `1 Oak Lumber x 6` (count + explicit ×N) | Oak Lumber | 6 — the explicit ×N wins; the leading number is treated as a stack count |
| `Cloud Clump` (bare, capitalized item) | Cloud Clump | 1 |

Lines that are **skipped on purpose**: `# comments`, blank lines, timestamps
(`12:30`), level/XP notes (`lv. 90`), and `Title:`/`name:` header lines. Bare
lowercase lines without a quantity are ignored too — that's what keeps stray
chat log text out of your checklist. When a valid list parses but nothing is
found, you get a friendly warning with format examples.

If an item's name alone isn't enough to guess its source, it goes to
**Your Call (Edit Me)** — the group label says it plainly: the app is honest
about guessing, and one dropdown click fixes it forever.

Final Fantasy XIV is a trademark of Square Enix; this is an unofficial player
tool. No game data is scraped — the app only reads what you paste.

## How to run it

Any of these works — pick the one you already use:

```bash
# Option 1: no extra install, just Node
npm start            # then open http://localhost:5173

# Option 2: plain Python
python3 -m http.server 5173   # then open http://localhost:5173

# Option 3: any static file server pointed at this folder
```

The only real requirements are **Node.js 18+** or **Python 3** for a local
server: browsers block ES modules on `file://`, so use one of the above rather
than double-clicking the HTML. To run on a different port, set `PORT` first
(`PORT=3000 npm start`) or pass it to Python (`-p 3000`).

## How to use it

1. Paste your materials list into the big text box.
2. Click **Build checklist** — or press `Ctrl+Enter` (`Cmd+Enter` on a Mac)
   inside the box. The **Load sample list** button shows a valid example.
3. Work through the groups; tick items as you collect them.
4. Items in **Your Call (Edit Me)** need a bucket — pick one from the dropdown
   and it is remembered for that item.
5. **Clear progress** resets the checkmarks but keeps the list. Editing the
   input and rebuilding starts fresh (progress resets when the list text
   changes, so you never carry old checkmarks onto a new recipe).

## Tests

The parsing and quantity-math modules are pure and tested with Node's built-in
test runner — zero test dependencies:

```bash
npm test
```

35 tests across four suites:

- `test/parse.test.mjs` — line formats, separators, bullets, comments, warnings.
- `test/math.test.mjs` — duplicate merging, grouping, capped progress math.
- `test/sources.test.mjs` — source-keyword guesses and group ordering.
- `test/wiring.test.mjs` — contract tests pinning `app.js` ↔ `index.html` ↔
  `styles.css`: every element id `app.js` reads exists in the HTML, every class
  it creates is styled, and the page loads only local assets.

## Repository layout

```
index.html    app page
styles.css    styling
app.js        browser UI wiring (parsing lives in src/)
server.mjs    tiny dependency-free dev server (npm start)
src/parse.js        list → items
src/math.js         merge, group, progress math
src/sources.js      source-label guesses
test/         node:test suites (see Tests above)
LICENSE       MIT
STATUS.md     build state and verification notes
```

## Privacy

Your pasted list, checkbox state, and grouping choices live in this browser's
local storage, on your device. There are no secrets to feed the app, no
accounts to make, no network calls to make them.

## Troubleshooting

- **"No valid item lines found."** Your format may be unusual. Try `3x Iron
  Ore`, `Iron Ingot x 5`, `12 Fire Shard`, or a tab between name and quantity.
- **Everything lands in "Your Call."** The guesses are honest keyword hints on
  the item *name* only — set the bucket with the dropdown and it sticks.
- **Checkmarks vanished after rebuilding.** Progress resets when the list text
  changes — that's on purpose, so old recipes don't bleed into new ones.
- **Blank page from double-clicking the HTML.** Browsers block ES modules on
  `file://`; serve the folder (`npm start`, Python `http.server`, etc.).

## Credits

Built and maintained by [Asdale Dynamics, LLC](https://dylanasdale.github.io)
and released under the MIT license — see [LICENSE](LICENSE). Friendly to fork,
friendly to patch, friendly to sell (the license gives you every right to it).
