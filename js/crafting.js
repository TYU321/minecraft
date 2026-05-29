import { BLOCK } from './constants.js';
import { CRAFT_TIERS, TOOL_KINDS, EXTRA_TOOLS } from './tools.js';

function buildRecipes() {
  const recipes = [];

  for (const kind of TOOL_KINDS) {
    recipes.push({
      id: `${kind.tool}_wood`,
      name: `Деревянный ${kind.label.toLowerCase()}`,
      result: { tool: kind.tool, tier: 'wood', icon: `${kind.prefix}_bronze` },
      cost: [{ blockId: BLOCK.WOOD, count: kind.woodOnly }],
    });

    for (const tier of CRAFT_TIERS) {
      recipes.push({
        id: `${kind.tool}_${tier.id}`,
        name: `${tier.label.charAt(0).toUpperCase() + tier.label.slice(1)} ${kind.label.toLowerCase()}`,
        result: {
          tool: kind.tool,
          tier: tier.id,
          icon: `${kind.prefix}_${tier.id}`,
        },
        cost: [
          { blockId: tier.ore, count: tier.oreCount },
          { blockId: BLOCK.WOOD, count: tier.wood },
        ],
      });
    }
  }

  return [...recipes, ...EXTRA_TOOLS];
}

export const RECIPES = buildRecipes();

export function canCraft(inventory, recipe) {
  return recipe.cost.every((c) => inventory.countBlock(c.blockId) >= c.count);
}

export function craftItem(inventory, recipe) {
  if (!canCraft(inventory, recipe)) return false;
  if (!inventory.hasEmptySlot()) return false;

  for (const c of recipe.cost) {
    inventory.removeBlock(c.blockId, c.count);
  }

  inventory.addTool(recipe.result);
  return true;
}
