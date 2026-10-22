// UI wiring for the checklist app. Browser-only; parsing lives in ./src/.

import { parseList } from "./src/parse.js";
import { mergeItems, groupBySource, totalProgress } from "./src/math.js";
import { GROUP_ORDER, GROUP_LABELS, guessSource } from "./src/sources.js";

const STORE_KEY = "ffxiv-crafting-checklist-v1";

const els = {
  inputArea: document.getElementById("inputArea"),
  buildBtn: document.getElementById("buildBtn"),
  sampleBtn: document.getElementById("sampleBtn"),
  clearBtn: document.getElementById("clearBtn"),
  outputCard: document.getElementById("outputCard"),
  groups: document.getElementById("groups"),
  progressPill: document.getElementById("progressPill"),
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
};

const SAMPLE_LIST = `Hematite x8
3 Iron Ore
Oak Log x18
Yew Log x6
Maple Sap x3
Fire Shard x24
Ice Shard x12
Water Crystal x6
2,500 Gil worth of Talan's Little Discounts
Stormblood Gunmetal Spruce Log x2
Quaggy Squid x4
Cloud Clump x2
Granite Whetstone x5
Gleaming Gold Silver Ore x3`;

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function mergeState(state, patch) {
  const next = { ...state, ...patch };
  saveState(next);
  return next;
}

let state = loadState();

function render() {
  const text = state.text || "";
  els.inputArea.value = text;

  if (!state.items || state.items.length === 0) {
    els.outputCard.hidden = true;
    els.progressPill.hidden = !state.collected || Object.keys(state.collected).length === 0;
    return;
  }

  const merged = mergeItems(state.items);
  const groups = groupBySource(merged);
  const progress = totalProgress(merged, state.collected || {});

  els.outputCard.hidden = false;
  els.groups.innerHTML = "";

  const orderedGroups = GROUP_ORDER.filter((g) => groups.has(g)).concat(
    [...groups.keys()].filter((g) => !GROUP_ORDER.includes(g)),
  );

  for (const groupKey of orderedGroups) {
    const items = groups.get(groupKey);
    const card = document.createElement("li");
    card.className = "group";

    const title = document.createElement("div");
    title.className = "group-title";
    const label = GROUP_LABELS[groupKey] || groupKey;
    const doneInGroup = items.filter((item) => (state.collected?.[item.name] || 0) >= item.need).length;
    title.innerHTML = `<span class="group-name">${escapeHtml(label)}</span><span class="group-count">${doneInGroup}/${items.length} collected</span>`;

    const list = document.createElement("ul");
    list.className = "item-list";

    for (const item of items) {
      const li = document.createElement("li");
      const id = `cb-${slug(item.name)}`;
      const checked = (state.collected?.[item.name] || 0) >= item.need;

      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = checked;
      check.dataset.item = item.name;
      check.dataset.need = item.need;
      check.id = id;
      check.addEventListener("change", () => {
        const collected = { ...(state.collected || {}) };
        if (check.checked) collected[item.name] = item.need;
        else delete collected[item.name];
        state = mergeState(state, { collected });
        render();
      });

      if (groupKey === "other") {
        const catSelect = document.createElement("select");
        catSelect.className = "cat-select";
        catSelect.dataset.item = item.name;
        for (const key of GROUP_ORDER) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = GROUP_LABELS[key];
          if (key === state.categoryOverrides?.[item.name] || key === groupKey) option.selected = true;
          catSelect.appendChild(option);
        }
        catSelect.addEventListener("change", () => {
          const overrides = { ...(state.categoryOverrides || {}), [item.name]: catSelect.value };
          state = mergeState(state, { categoryOverrides: overrides });
          state = mergeState(state, { items: categorize(els.inputArea.value) });
          render();
        });
        li.appendChild(catSelect);
      }

      const labelEl = document.createElement("label");
      labelEl.htmlFor = id;
      labelEl.innerHTML = `<strong>${escapeHtml(item.name)}</strong> <span class="qty">x ${item.need}</span>`;

      li.appendChild(check);
      li.appendChild(labelEl);
      list.appendChild(li);
    }

    card.appendChild(title);
    card.appendChild(list);
    els.groups.appendChild(card);
  }

  els.progressPill.hidden = false;
  els.progressText.textContent = `${progress.collected} / ${progress.needed} materials collected (${progress.percent}%)`;
  els.progressFill.style.width = `${progress.percent}%`;
}

function contextualize(text) {
  const { items, warnings } = parseList(text);
  const categorized = items.map((item) => ({
    ...item,
    category: state.categoryOverrides?.[item.name] || guessSource(item.name),
  }));
  return { items: categorized, warnings };
}

function build() {
  const text = els.inputArea.value;
  const textChanged = (state.text || "") !== text;
  const previousCollected = textChanged ? {} : state.collected;
  const { items, warnings } = contextualize(text);

  state = mergeState(state, { text, items, collected: previousCollected });

  if (warnings.length > 0) {
    alert(warnings.join("\n"));
  }

  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

els.buildBtn.addEventListener("click", build);
els.sampleBtn.addEventListener("click", () => {
  els.inputArea.value = SAMPLE_LIST;
  build();
});
els.clearBtn.addEventListener("click", () => {
  state = mergeState(state, { collected: {} });
  render();
});
els.inputArea.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    build();
  }
});

render();
