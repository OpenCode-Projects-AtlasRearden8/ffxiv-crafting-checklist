// Best-effort keyword guesses for where a listed item comes from.

export const GROUP_ORDER = [
  "mining",
  "botany",
  "fishing",
  "drops",
  "vendor",
  "other",
];

export const GROUP_LABELS = {
  mining: "Gathering: Mining",
  botany: "Gathering: Botany",
  fishing: "Gathering: Fishing",
  drops: "Monster Drops",
  vendor: "Vendor / Market Board",
  other: "Your Call (Edit Me)",
};

const MINING_HINTS = [
  "ore", "stone", "sand", "clay", "chunk", "sediment", "gravel",
  "gloomstone", "bluestone", "silver", "copper", "iron ore", "gold ore",
];

const BOTANY_HINTS = [
  "log", "branch", "flower", "fruit", "leaf", "grass", "seed", "sprout",
  "nut", "herb", "hemp", "cotton", "corn", "wheat", "radish", "onion",
  "tomato", "potato", "carrot", "turnip", "reed", "sap", "resin", "spice",
];

const FISHING_HINTS = [
  "fish", "roe", "shrimp", "crab", "squid", "eel", "oyster", "clam",
  "mussel", "mollusk", "krill", "prawn", "scampi", "bony", "piscine",
];

const DROPS_HINTS = [
  "fang", "horn", "bone", "hide", "feather", "scale", "tail", "wing",
  "sinew", "cara", "sac", "blood", "leather", "skull", "shell", "claw",
  "spine", "heart", "meat", "fillet", "dung", "silk",
];

const VENDOR_HINTS = [
  "shard", "crystal", "glass", "ceramic", "scrip", "poison potion",
  "potion", "watered paste", "flax", "antidote",
];

function matchesAny(nameLower, hints) {
  return hints.some((hint) => nameLower.includes(hint));
}

export function guessSource(name) {
  const nameLower = String(name || "").toLowerCase();

  if (matchesAny(nameLower, FISHING_HINTS)) {
    return "fishing";
  }
  if (matchesAny(nameLower, VENDOR_HINTS)) {
    return "vendor";
  }
  if (matchesAny(nameLower, MINING_HINTS)) {
    return "mining";
  }
  if (matchesAny(nameLower, BOTANY_HINTS)) {
    return "botany";
  }
  if (matchesAny(nameLower, DROPS_HINTS)) {
    return "drops";
  }
  return "other";
}
