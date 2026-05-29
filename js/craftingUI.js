import { RECIPES, canCraft, craftItem } from './crafting.js';
import { assets } from './assets.js';
import { BLOCK_LABELS } from './ores.js';
import { TOOL_KINDS } from './tools.js';

let panel = null;
let listEl = null;
let inventoryRef = null;
let visible = false;

const GROUP_LABELS = {
  pick: 'Кирки',
  axe: 'Топоры',
  shovel: 'Лопаты',
  hoe: 'Мотыги',
  hammer: 'Молоты',
  sword: 'Мечи',
  flail: 'Цепы',
  bow: 'Луки',
};

export function initCraftingUI(inventory) {
  inventoryRef = inventory;
  panel = document.getElementById('craft-panel');
  listEl = document.getElementById('craft-list');
  if (!panel || !listEl) return;

  renderRecipes();
}

export function toggleCrafting() {
  if (!panel) return;
  visible = !visible;
  panel.classList.toggle('hidden', !visible);
  if (visible) renderRecipes();
}

export function isCraftingOpen() {
  return visible;
}

function getBlockLabel(blockId) {
  return BLOCK_LABELS[blockId] || '?';
}

function createRecipeRow(recipe) {
  const row = document.createElement('div');
  row.className = 'craft-recipe';

  const info = document.createElement('div');
  info.className = 'craft-recipe-info';

  const icon = document.createElement('img');
  icon.className = 'craft-result-icon';
  icon.src = assets.items[recipe.result.icon]?.src || '';
  icon.alt = recipe.name;
  info.appendChild(icon);

  const text = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = recipe.name;
  text.appendChild(title);

  const cost = document.createElement('p');
  cost.className = 'craft-cost';
  cost.textContent = recipe.cost
    .map((c) => {
      const have = inventoryRef.countBlock(c.blockId);
      return `${getBlockLabel(c.blockId)} ${have}/${c.count}`;
    })
    .join(' · ');
  text.appendChild(cost);
  info.appendChild(text);
  row.appendChild(info);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Создать';
  btn.disabled = !canCraft(inventoryRef, recipe) || !inventoryRef.hasEmptySlot();
  btn.addEventListener('click', () => {
    if (craftItem(inventoryRef, recipe)) {
      renderRecipes();
      inventoryRef.updateUI();
    }
  });
  row.appendChild(btn);

  return row;
}

function renderRecipes() {
  if (!listEl || !inventoryRef) return;
  listEl.innerHTML = '';

  const order = [...TOOL_KINDS.map((k) => k.tool), 'bow'];
  const grouped = new Map();
  for (const id of order) grouped.set(id, []);

  for (const recipe of RECIPES) {
    const key = recipe.result.tool;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(recipe);
  }

  for (const toolId of order) {
    const recipes = grouped.get(toolId);
    if (!recipes?.length) continue;

    const header = document.createElement('h3');
    header.className = 'craft-group-title';
    header.textContent = GROUP_LABELS[toolId] || toolId;
    listEl.appendChild(header);

    for (const recipe of recipes) {
      listEl.appendChild(createRecipeRow(recipe));
    }
  }
}

export function refreshCraftingUI() {
  if (visible) renderRecipes();
}
