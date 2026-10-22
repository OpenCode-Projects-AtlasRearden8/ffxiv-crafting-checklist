// Parses pasted FFXIV crafting material lists into structured items.

const BULLET = /^\s*(?:[-*o>+]\s+|[\u2022\u25aa\u25a0\u25cf]\s*)+/;

const COMMENT = /^\s*#/;
const TIME_OR_LEVEL = /\b\d{1,2}:\d{2}\b|\b(?:xp|lv\.?|level)\s*\d+\b/i;

const QTY_BEFORE = /^(\d[\d,.]*)\s*[x\u00d7*]?\s+(.+)$/;
const QTY_AFTER = /^(.+?)\s*[x\u00d7*]\s*(\d[\d,.]*)$/;
const NUMERIC = /^\d[\d,.]*$/;

function normalizeNumber(raw) {
  const value = Number.parseInt(String(raw).replace(/,/g, ""), 10);
  return Number.isNaN(value) ? 1 : value;
}

function cleanName(raw) {
  return raw
    .replace(/^["'\u201c\u201d-]+\s*/, "")
    .replace(/["'\u201c\u201d-]+$/, "")
    .replace(/[,;:.]+$/, "")
    .trim();
}

function lineToItem(line) {
  const text = line.trim();
  if (!text || COMMENT.test(text) || TIME_OR_LEVEL.test(text)) {
    return null;
  }

  const bare = text.replace(BULLET, "").trim();
  if (!bare || bare.endsWith(":") || /^[a-z][a-z !?#]*:\s/i.test(bare)) {
    return null;
  }

  let match = QTY_BEFORE.exec(bare);
  if (match) {
    const rest = match[2].trim();
    // "1 Oak Lumber x 6" — an explicit trailing ×N is the real per-craft count;
    // a number that ties to a list entry is only a stack count.
    const nested = QTY_AFTER.exec(rest);
    return nested
      ? { name: cleanName(nested[1]), quantity: normalizeNumber(nested[2]) }
      : { name: cleanName(rest), quantity: normalizeNumber(match[1]) };
  }

  match = QTY_AFTER.exec(bare);
  if (match) {
    return { name: cleanName(match[1]), quantity: normalizeNumber(match[2]) };
  }

  const tabSplit = bare.match(/^(.+?)\t+(.+)$/);
  const gapSplit = tabSplit ? tabSplit : bare.match(/^(.+)\s{2,}(.+)$/);
  if (gapSplit) {
    const left = gapSplit[1].trim();
    const right = gapSplit[2].trim();
    if (NUMERIC.test(left)) {
      return { name: cleanName(right), quantity: normalizeNumber(left) };
    }
    if (NUMERIC.test(right)) {
      return { name: cleanName(left), quantity: normalizeNumber(right) };
    }
  }

  // Bare item name with no quantity: accept Capitalized-ish names only,
  // so stray conversational text does not become checklist noise.
  if (/^[A-Z]/.test(bare)) {
    return { name: cleanName(bare), quantity: 1 };
  }
  return null;
}

export function parseList(text) {
  const lines = String(text || "").split(/\r?\n/);
  const items = [];
  const warnings = [];

  for (const line of lines) {
    const item = lineToItem(line);
    if (item && item.name) {
      items.push(item);
    }
  }

  if (items.length === 0 && lines.map((l) => l.trim()).some(Boolean)) {
    warnings.push(
      "No valid item lines found. Try formats like: 3x Iron Ore, Iron Ingot x 5, 12 Fire Shard, or 12<tab>Fire Shard.",
    );
  }

  return { items, warnings };
}
