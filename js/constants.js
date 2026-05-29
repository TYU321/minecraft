export const TILE_SIZE = 32;
export const SOURCE_TILE = 128;
export const TILE_SCALE = TILE_SIZE / SOURCE_TILE;

export const WORLD_WIDTH = 320;
export const WORLD_HEIGHT = 120;

export const GRAVITY = 1200;
export const JUMP_HEIGHT_BLOCKS = 3;
export const JUMP_FORCE = -Math.sqrt(2 * GRAVITY * JUMP_HEIGHT_BLOCKS);

export const PLAYER_MAX_SPEED = 48;
export const GROUND_ACCEL = 380;
export const AIR_ACCEL = 240;
export const GROUND_FRICTION = 520;
export const AIR_FRICTION = 140;

export const MAX_FALL = 600;

export const PLAYER_WIDTH = 0.55;
export const PLAYER_HEIGHT = 1.75;

export const MINE_REACH = 5;

export const DAY_LENGTH = 180;
export const STACK_SIZE = 99;
export const HOTBAR_SIZE = 9;

export const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  WOOD: 5,
  LEAVES: 6,
  WATER: 7,
  COAL_ORE: 8,
  IRON_ORE: 9,
  GOLD_ORE: 10,
  LEAVES_ORANGE: 11,
  BIRCH_WOOD: 12,
  SNOW: 13,
  SILVER_ORE: 14,
  DIAMOND_ORE: 15,
  EMERALD_ORE: 16,
  RUBY_ORE: 17,
};
