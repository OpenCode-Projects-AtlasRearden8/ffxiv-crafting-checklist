// Dependency-free contract tests: the browser UI files must stay in sync.
// These pin app.js to index.html (element ids) and styles.css (classes), keep
// index.html free of any external network references, and guard the parse
// against drift (another ReferenceError class of bug). Runs in plain node:test.

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url).pathname;

const [html, app, styles] = await Promise.all([
  readFile(`${ROOT}index.html`, "utf8"),
  readFile(`${ROOT}app.js`, "utf8"),
  readFile(`${ROOT}styles.css`, "utf8"),
]);

test("every element id app.js reads exists in index.html", () => {
  const needed = [
    "inputArea",
    "buildBtn",
    "sampleBtn",
    "clearBtn",
    "outputCard",
    "groups",
    "progressPill",
    "progressText",
    "progressFill",
  ];
  for (const id of needed) {
    assert.ok(
      html.includes(`id="${id}"`),
      `index.html is missing id="${id}" used by app.js`,
    );
  }
});

test("index.html wires the same ids app.js reads", () => {
  const htmlIds = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const wanted = ["inputArea", "buildBtn", "sampleBtn", "clearBtn", "outputCard", "groups", "progressPill", "progressText", "progressFill"];
  for (const id of wanted) {
    assert.ok(htmlIds.includes(id), `index.html no longer wires id="${id}"`);
  }
});

test("classes app.js creates are styled in styles.css", () => {
  const used = ["group", "group-title", "group-name", "group-count", "item-list", "cat-select", "btn", "bar", "fill", "wrap"];
  for (const cls of used) {
    assert.ok(
      styles.includes(cls),
      `styles.css does not style .${cls} created by app.js`,
    );
  }
});

test("index.html loads only local assets (no network references in resource tags)", () => {
  const resourceTags = [...html.matchAll(/<(?:link|script|img|iframe|source)\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(resourceTags.length > 0);
  for (const tag of resourceTags) {
    const url = (tag.match(/(?:src|href)="([^"]+)"/) || [])[1];
    if (!url) continue;
    assert.ok(
      !url.startsWith("http") && !url.startsWith("//"),
      `index.html loads an external asset: ${url}`,
    );
  }
});

test("app.js has no dead getElementById lookups", () => {
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const lookedUp = [...app.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(lookedUp.length > 0);
  for (const id of lookedUp) {
    assert.ok(ids.has(id), `app.js getElementById("${id}") has no matching element`);
  }
});
