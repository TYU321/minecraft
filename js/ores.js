import { BLOCK } from './constants.js';

export const BLOCK_LABELS = {
  [BLOCK.WOOD]: 'Дерево',
  [BLOCK.STONE]: 'Камень',
  [BLOCK.DIRT]: 'Земля',
  [BLOCK.GRASS]: 'Трава',
};

export const ORE_DEFS = [
  {
    id: BLOCK.COAL_ORE,
    name: 'coal',
    label: 'Уголь',
    texture: 'stone_coal',
    icon: 'ore_coal',
    hardness: 1.4,
    minDepth: 12,
    chance: 0.016,
  },
  {
    id: BLOCK.IRON_ORE,
    name: 'iron',
    label: 'Железо',
    texture: 'stone_iron',
    icon: 'ore_iron',
    hardness: 1.9,
    minDepth: 22,
    chance: 0.01,
  },
  {
    id: BLOCK.SILVER_ORE,
    name: 'silver',
    label: 'Серебро',
    texture: 'stone_silver',
    icon: 'ore_silver',
    hardness: 2.1,
    minDepth: 30,
    chance: 0.007,
  },
  {
    id: BLOCK.GOLD_ORE,
    name: 'gold',
    label: 'Золото',
    texture: 'stone_gold',
    icon: 'ore_gold',
    hardness: 2.4,
    minDepth: 38,
    chance: 0.005,
  },
  {
    id: BLOCK.EMERALD_ORE,
    name: 'emerald',
    label: 'Изумруд',
    texture: 'redstone_emerald',
    icon: 'ore_emerald',
    hardness: 2.6,
    minDepth: 45,
    chance: 0.0035,
  },
  {
    id: BLOCK.RUBY_ORE,
    name: 'ruby',
    label: 'Рубин',
    texture: 'greystone_ruby',
    icon: 'ore_ruby',
    hardness: 2.7,
    minDepth: 50,
    chance: 0.003,
  },
  {
    id: BLOCK.DIAMOND_ORE,
    name: 'diamond',
    label: 'Алмаз',
    texture: 'stone_diamond',
    icon: 'ore_diamond',
    hardness: 3,
    minDepth: 55,
    chance: 0.0025,
  },
];

for (const ore of ORE_DEFS) {
  BLOCK_LABELS[ore.id] = ore.label;
}
