import { BLOCK } from './constants.js';
import { TOOL_TIER_MULT } from './tools.js';
import { ORE_DEFS } from './ores.js';

export const TILE_DEFS = {
  [BLOCK.AIR]: {
    name: 'air',
    solid: false,
    hardness: 0,
    texture: null,
    drop: null,
  },
  [BLOCK.GRASS]: {
    name: 'grass',
    solid: true,
    hardness: 0.4,
    texture: 'dirt_grass',
    drop: BLOCK.GRASS,
    tool: 'shovel',
  },
  [BLOCK.DIRT]: {
    name: 'dirt',
    solid: true,
    hardness: 0.35,
    texture: 'dirt',
    drop: BLOCK.DIRT,
    tool: 'shovel',
  },
  [BLOCK.STONE]: {
    name: 'stone',
    solid: true,
    hardness: 1.2,
    texture: 'stone',
    drop: BLOCK.STONE,
    tool: 'pick',
  },
  [BLOCK.SAND]: {
    name: 'sand',
    solid: true,
    hardness: 0.3,
    texture: 'sand',
    drop: BLOCK.SAND,
    tool: 'shovel',
  },
  [BLOCK.WOOD]: {
    name: 'wood',
    solid: false,
    foliage: true,
    hardness: 0.5,
    texture: 'trunk_side',
    drop: BLOCK.WOOD,
    tool: 'axe',
  },
  [BLOCK.LEAVES]: {
    name: 'leaves',
    solid: false,
    foliage: true,
    hardness: 0.2,
    texture: 'leaves',
    drop: BLOCK.LEAVES,
    tool: 'axe',
  },
  [BLOCK.WATER]: {
    name: 'water',
    solid: true,
    hardness: Infinity,
    texture: 'water',
    drop: null,
    liquid: true,
  },
  [BLOCK.LEAVES_ORANGE]: {
    name: 'leaves_orange',
    solid: false,
    foliage: true,
    hardness: 0.2,
    texture: 'leaves_orange',
    drop: BLOCK.LEAVES_ORANGE,
    tool: 'axe',
  },
  [BLOCK.BIRCH_WOOD]: {
    name: 'birch',
    solid: false,
    foliage: true,
    hardness: 0.5,
    texture: 'trunk_white_side',
    drop: BLOCK.WOOD,
    tool: 'axe',
  },
  [BLOCK.SNOW]: {
    name: 'snow',
    solid: true,
    hardness: 0.35,
    texture: 'snow',
    drop: BLOCK.SNOW,
    tool: 'shovel',
  },
};

for (const ore of ORE_DEFS) {
  TILE_DEFS[ore.id] = {
    name: ore.name,
    solid: true,
    hardness: ore.hardness,
    texture: ore.texture,
    drop: ore.id,
    tool: 'pick',
  };
}

export function isSolid(id) {
  return TILE_DEFS[id]?.solid ?? false;
}

export function isBreakable(id) {
  const def = TILE_DEFS[id];
  return def && def.hardness > 0 && def.hardness < Infinity;
}

export function getMineSpeed(id, toolType, toolTier) {
  const def = TILE_DEFS[id];
  if (!def) return 0;
  let speed = 1 / def.hardness;
  const tierMult = TOOL_TIER_MULT[toolTier] ?? 1;

  const match =
    (def.tool === 'pick' && (toolType === 'pick' || toolType === 'hammer')) ||
    (def.tool === 'axe' && (toolType === 'axe' || toolType === 'sword' || toolType === 'flail')) ||
    (def.tool === 'shovel' && (toolType === 'shovel' || toolType === 'hoe'));

  if (match) speed *= 2 * tierMult;

  if (def.foliage && (toolType === 'axe' || toolType === 'sword' || toolType === 'flail')) {
    speed *= 2.2 * tierMult;
  }

  if (toolType === 'hammer' && def.tool === 'pick') speed *= 1.15;

  return speed;
}

export const BLOCK_ICON = {
  [BLOCK.GRASS]: 'grass_top',
  [BLOCK.DIRT]: 'dirt',
  [BLOCK.STONE]: 'stone',
  [BLOCK.SAND]: 'sand',
  [BLOCK.WOOD]: 'wood',
  [BLOCK.LEAVES]: 'leaves',
  [BLOCK.LEAVES_ORANGE]: 'leaves',
  [BLOCK.BIRCH_WOOD]: 'wood',
  [BLOCK.SNOW]: 'stone',
};

for (const ore of ORE_DEFS) {
  BLOCK_ICON[ore.id] = ore.icon;
}
