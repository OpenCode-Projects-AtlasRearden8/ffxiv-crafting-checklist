// Consolidates parsed items and computes checklist totals.

const KEY_SEPARATOR = "::";

export function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function totalNeeded(mergedItems) {
  return mergedItems.reduce((sum, item) => sum + item.need, 0);
}

export function mergeItems(items) {
  const byKey = new Map();
  const order = [];

  for (const item of items) {
    const category = item.category || null;
    const key = normalizeName(item.name) + KEY_SEPARATOR + (category || "");
    if (!byKey.has(key)) {
      byKey.set(key, {
        name: item.name,
        need: 0,
        category,
      });
      order.push(key);
    }
    byKey.get(key).need += item.quantity || 0;
  }

  return order.map((key) => byKey.get(key));
}

export function groupBySource(mergedItems) {
  const groups = new Map();
  for (const item of mergedItems) {
    const group = item.category || "other";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(item);
  }
  return groups;
}

export function totalProgress(mergedItems, collectedMap) {
  let collected = 0;
  let needed = 0;
  for (const item of mergedItems) {
    needed += item.need;
    collected += Math.min(collectedMap?.[item.name] || 0, item.need);
  }
  return {
    collected,
    needed,
    percent: needed === 0 ? 0 : Math.round((collected / needed) * 100),
  };
}
