# FFXIV Crafting Checklist

Paste a crafting materials list, get a tidy shopping & gathering plan — grouped
by where each item comes from, with quantity math done for you and checkboxes
that remember your progress. Everything runs in your browser; nothing is
uploaded, scraped, or tracked.

Made by [Asdale Dynamics, LLC](https://dylanasdale.github.io) — AI explained
like a friend would: plain English, step by step, never condescending.

## What it does

- **Parses what you paste.** End-of-craft material lists, inventories, or your
  own notes in formats like `12 Fire Shard`, `Oak Log x18`, `3x Iron Ore`, tab
  or multi-space separated quantities, commas in numbers (`1,250`), bullet
  points, `# comments`, and more.
- **Grouped sources.** Items are bucketed into Gathering (Mining / Botany /
  Fishing), Monster Drops, Vendor / Market Board, and "Your Call (Edit Me)".
  Unknown names land in "Your Call" where you can pick the right bucket — the
  choice is saved.
- **Quantity math.** The same material listed twice is merged and its counts
  are summed, so the checklist shows one line per item with the real total.
- **Progress that sticks.** Check items off as you gather; your progress is
  stored in this browser's local storage, with an overall percentage up top.
- **Local-first.** No accounts, no servers, no game data scraping. Users paste
  their own lists; nothing leaves your machine.

Final Fantasy XIV is a trademark of Square Enix; this is an unofficial player
tool.

## How to run it

Any of these works — pick the one you already use:

```bash
# Option 1: no extra install, just Node
npm start            # then open http://localhost:5173

# Option 2: plain Python
python3 -m http.server 5173   # then open http://localhost:5173

# Option 3: open index.html with a static file server of your choice
```

No dependencies to install; the only "requirement" is Node.js 18+ or Python 3
if you want a local server (browsers block ES modules on `file://`, so use one
of the above rather than double-clicking the HTML).

## How to use it

1. Run the app and paste your materials list into the big text box.
2. Click **Build checklist** (or press `Ctrl+Enter` inside the box). Tip: the
   **Load sample list** button shows a valid example.
3. Work through the groups; check things off as you collect them.
4. Items in **Your Call (Edit Me)** need a bucket — pick one from the dropdown
   and it is remembered.
5. **Clear progress** resets the checkmarks; editing the input and rebuilding
   starts a fresh list (progress resets when the list text changes).

## Tests

Parsing and quantity math are pure modules tested with Node's built-in test
runner:

```bash
npm test
```

## Repository layout

```
index.html   app page
styles.css   styling
app.js       browser UI wiring
server.mjs   tiny dependency-free dev server (npm start)
src/         parse.js, math.js, sources.js (tested core logic)
test/        node:test suites
```

## Privacy

Your pasted list, checkbox state, and grouping choices live in this browser's
local storage on your device. There are no secrets, no accounts, no network
calls.

## Credits

Built and maintained by Asdale Dynamics, LLC. MIT licensed — see
[LICENSE](LICENSE).
