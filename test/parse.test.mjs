import test from "node:test";
import assert from "node:assert/strict";
import { parseList } from "../src/parse.js";

test("parses 'Qty Name' lines", () => {
  const { items } = parseList("12 Fire Shard\n3 Iron Ore");
  assert.deepEqual(items, [
    { name: "Fire Shard", quantity: 12 },
    { name: "Iron Ore", quantity: 3 },
  ]);
});

test("parses 'Name x Qty' lines", () => {
  const { items } = parseList("Oak Log x18\nHematite x 8");
  assert.deepEqual(items, [
    { name: "Oak Log", quantity: 18 },
    { name: "Hematite", quantity: 8 },
  ]);
});

test("parses 'Qty x Name' lines", () => {
  const { items } = parseList("2x Yew Log");
  assert.deepEqual(items, [{ name: "Yew Log", quantity: 2 }]);
});

test("parses multiplication sign and asterisk separators", () => {
  const { items } = parseList("Iron Ore × 3\nSilver Ore*2");
  assert.deepEqual(items, [
    { name: "Iron Ore", quantity: 3 },
    { name: "Silver Ore", quantity: 2 },
  ]);
});

test("parses tab-separated name and quantity", () => {
  const { items } = parseList("Fire Shard\t12");
  assert.deepEqual(items, [{ name: "Fire Shard", quantity: 12 }]);
});

test("parses multi-space separated name and quantity", () => {
  const { items } = parseList("Fire Shard  12");
  assert.deepEqual(items, [{ name: "Fire Shard", quantity: 12 }]);
});

test("explicit trailing xN wins over a leading stack count", () => {
  const { items } = parseList("1 Oak Lumber x 6\n3x Iron Ore × 2");
  assert.deepEqual(items, [
    { name: "Oak Lumber", quantity: 6 },
    { name: "Iron Ore", quantity: 2 },
  ]);
});

test("plain item line defaults to quantity 1", () => {
  const { items } = parseList("Cloud Clump");
  assert.deepEqual(items, [{ name: "Cloud Clump", quantity: 1 }]);
});

test("handles thousand separators in quantities", () => {
  const { items } = parseList("1,250 Gil Bond");
  assert.deepEqual(items, [{ name: "Gil Bond", quantity: 1250 }]);
});

test("strips bullets and decorations", () => {
  const { items } = parseList("- 3 Iron Ore\n* Oak Log x2\n• Cloud Clump");
  assert.equal(items.length, 3);
  assert.equal(items[0].name, "Iron Ore");
  assert.equal(items[1].quantity, 2);
  assert.equal(items[2].name, "Cloud Clump");
});

test("skips blank, comment, and unrelated lines without warning", () => {
  const { items, warnings } = parseList("# Shopping trip\n\n12 Fire Shard\nGuests hosted: 3");
  assert.deepEqual(items, [{ name: "Fire Shard", quantity: 12 }]);
  assert.deepEqual(warnings, []);
});

test("returns warnings when nothing valid is found", () => {
  const { items, warnings } = parseList("hello world\nsee you later");
  assert.deepEqual(items, []);
  assert.equal(warnings.length, 1);
});

test("does not treat time or title-like lines as items", () => {
  const { items } = parseList("Gathered 12:30 today");
  assert.deepEqual(items, []);
});

test("collapses empty input", () => {
  const { items, warnings } = parseList("   \n  ");
  assert.deepEqual(items, []);
  assert.deepEqual(warnings, []);
});
