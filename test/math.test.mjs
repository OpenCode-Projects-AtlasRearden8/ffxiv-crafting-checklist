import test from "node:test";
import assert from "node:assert/strict";
import { normalizeName, totalNeeded, mergeItems, groupBySource, totalProgress } from "../src/math.js";

const cat = (name, quantity, category) => ({ name, quantity, category });

test("normalizeName is case and whitespace insensitive", () => {
  assert.equal(normalizeName("  Iron   Ore "), "iron ore");
  assert.equal(normalizeName("IRON ORE"), "iron ore");
});

test("mergeItems sums duplicates of the same item", () => {
  const merged = mergeItems([
    cat("Iron Ore", 3, "mining"),
    cat("iron ore", 2, "mining"),
    cat("  IRON ORE ", 1, "mining"),
  ]);
  assert.deepEqual(merged, [{ name: "Iron Ore", need: 6, category: "mining" }]);
});

test("mergeItems keeps distinct items apart", () => {
  const merged = mergeItems([
    cat("Iron Ore", 3, "mining"),
    cat("Iron Steel", 2, "mining"),
    cat("Fire Shard", 12, "vendor"),
  ]);
  assert.equal(merged.length, 3);
  assert.equal(totalNeeded(merged), 17);
});

test("mergeItems keeps items with the same name but different categories apart", () => {
  const merged = mergeItems([
    cat("Fire Shard", 12, "vendor"),
    cat("Fire Shard", 12, "other"),
  ]);
  assert.equal(merged.length, 2);
  assert.equal(totalNeeded(merged), 24);
});

test("items without categories land in 'other' group and merge together", () => {
  const merged = mergeItems([
    { name: "Mystery Item", quantity: 2 },
    { name: "mystery item", quantity: 3 },
  ]);
  const groups = groupBySource(merged);
  assert.equal(merged[0].category, null);
  assert.equal(groups.get("other")[0].need, 5);
});

test("groupBySource buckets merged items by category", () => {
  const groups = groupBySource(mergeItems([
    cat("Iron Ore", 2, "mining"),
    cat("Oak Log", 5, "botany"),
    cat("Fire Shard", 12, "vendor"),
    cat("Quaggy Squid", 4, "fishing"),
    cat("Chaos Flame", 1, "other"),
  ]));
  assert.deepEqual([...groups.keys()], ["mining", "botany", "vendor", "fishing", "other"]);
  assert.equal(groups.get("vendor")[0].need, 12);
});

test("totalProgress counts capped collected amounts", () => {
  const merged = mergeItems([
    cat("Iron Ore", 5, "mining"),
    cat("Oak Log", 4, "botany"),
  ]);
  const progress = totalProgress(merged, { "Iron Ore": 3, "Oak Log": 99 });
  assert.deepEqual(progress, { collected: 7, needed: 9, percent: 78 });
});

test("totalProgress with nothing collected is zero", () => {
  const merged = mergeItems([cat("Iron Ore", 5, "mining")]);
  assert.deepEqual(totalProgress(merged, {}), { collected: 0, needed: 5, percent: 0 });
});

test("totalProgress with an empty checklist has no percent", () => {
  assert.deepEqual(totalProgress([], {}), { collected: 0, needed: 0, percent: 0 });
});
