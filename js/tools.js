import { BLOCK } from './constants.js';

export const TOOL_TIER_MULT = {
  wood: 1.1,
  bronze: 1.45,
  iron: 1.95,
  silver: 2.45,
  gold: 2.95,
  diamond: 3.55,
};

export const CRAFT_TIERS = [
  { id: 'bronze', label: 'бронзовый', ore: BLOCK.COAL_ORE, oreCount: 3, wood: 2 },
  { id: 'iron', label: 'железный', ore: BLOCK.IRON_ORE, oreCount: 3, wood: 2 },
  { id: 'silver', label: 'серебряный', ore: BLOCK.SILVER_ORE, oreCount: 3, wood: 2 },
  { id: 'gold', label: 'золотой', ore: BLOCK.GOLD_ORE, oreCount: 3, wood: 2 },
  { id: 'diamond', label: 'алмазный', ore: BLOCK.DIAMOND_ORE, oreCount: 2, wood: 2 },
];

export const TOOL_KINDS = [
  { tool: 'pick', label: 'Кирка', prefix: 'pick', woodOnly: 8 },
  { tool: 'axe', label: 'Топор', prefix: 'axe', woodOnly: 5 },
  { tool: 'shovel', label: 'Лопата', prefix: 'shovel', woodOnly: 4 },
  { tool: 'hoe', label: 'Мотыга', prefix: 'hoe', woodOnly: 4 },
  { tool: 'hammer', label: 'Молот', prefix: 'hammer', woodOnly: 6 },
  { tool: 'sword', label: 'Меч', prefix: 'sword', woodOnly: 6 },
  { tool: 'flail', label: 'Цеп', prefix: 'flail', woodOnly: 7 },
];

export const EXTRA_TOOLS = [
  {
    id: 'bow_bronze',
    name: 'Лук',
    result: { tool: 'bow', tier: 'bronze', icon: 'bow' },
    cost: [{ blockId: BLOCK.WOOD, count: 5 }, { blockId: BLOCK.COAL_ORE, count: 1 }],
  },
  {
    id: 'bow_iron',
    name: 'Лук (железный)',
    result: { tool: 'bow', tier: 'iron', icon: 'bow' },
    cost: [{ blockId: BLOCK.WOOD, count: 4 }, { blockId: BLOCK.IRON_ORE, count: 2 }],
  },
];
