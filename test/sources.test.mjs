import test from "node:test";
import assert from "node:assert/strict";
import { guessSource, GROUP_ORDER, GROUP_LABELS } from "../src/sources.js";

test("ores and stones guess as mining", () => {
  assert.equal(guessSource("Iron Ore"), "mining");
  assert.equal(guessSource("granite sand"), "mining");
  assert.equal(guessSource("Bluestone Clay"), "mining");
});

test("logs and flowers guess as botany", () => {
  assert.equal(guessSource("Oak Log"), "botany");
  assert.equal(guessSource("Shroud Cotton"), "botany");
  assert.equal(guessSource("Yuma Corn"), "botany");
});

test("sea life guesses as fishing", () => {
  assert.equal(guessSource("Quaggy Squid"), "fishing");
  assert.equal(guessSource("Prawn Roe"), "fishing");
  assert.equal(guessSource("Bonytongue"), "fishing");
});

test("shards and crystals guess as vendor", () => {
  assert.equal(guessSource("Fire Shard"), "vendor");
  assert.equal(guessSource("Water Crystal"), "vendor");
});

test("hides, fangs, and feathers guess as monster drops", () => {
  assert.equal(guessSource("Ala Mhigan Goat Hide"), "drops");
  assert.equal(guessSource("Raptor Fang"), "drops");
  assert.equal(guessSource("Crow Feather"), "drops");
});

test("unknown names land in 'other'", () => {
  assert.equal(guessSource("Chaos Flame"), "other");
  assert.equal(guessSource(""), "other");
});

test("every group has an ORDER entry and a label", () => {
  for (const key of GROUP_ORDER) {
    assert.ok(GROUP_LABELS[key], `missing label for ${key}`);
  }
});
