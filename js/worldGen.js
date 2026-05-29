import {
  BLOCK, WORLD_WIDTH, WORLD_HEIGHT, WORLD_BORDER_WIDTH, MAX_TERRAIN_SLOPE,
} from './constants.js';
import { ORE_DEFS } from './ores.js';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function smoothNoise(rand, x, scale) {
  const fx = x / scale;
  const i = Math.floor(fx);
  const f = fx - i;
  const a = rand() * 2 - 1;
  const b = rand() * 2 - 1;
  const t = f * f * (3 - 2 * f);
  return a * (1 - t) + b * t;
}

function getBiome(x) {
  const wave =
    Math.sin(x * 0.012) * 0.45 +
    Math.sin(x * 0.0045 + 2.1) * 0.35 +
    Math.sin(x * 0.028 + 0.7) * 0.2;
  return (wave + 1) * 0.5;
}

export function generateWorld(seed = Date.now()) {
  const rand = seededRandom(seed);
  const world = new Uint16Array(WORLD_WIDTH * WORLD_HEIGHT);
  const surfaceHeights = new Int32Array(WORLD_WIDTH);
  const biomes = new Float32Array(WORLD_WIDTH);

  const baseSurface = Math.floor(WORLD_HEIGHT * 0.35);

  for (let x = 0; x < WORLD_WIDTH; x++) {
    const biome = getBiome(x);
    biomes[x] = biome;
    let height = baseSurface;

    if (biome < 0.32) {
      height += smoothNoise(rand, x, 50) * 0.5;
    } else if (biome > 0.62) {
      const peak = (biome - 0.62) / 0.38;
      height += smoothNoise(rand, x, 20) * 1.5 * peak;
      height += Math.sin(x * 0.04) * 1.2 * peak;
    } else {
      const blend = (biome - 0.32) / 0.3;
      height += smoothNoise(rand, x, 28) * 1.2 * blend;
    }

    surfaceHeights[x] = Math.floor(height);
  }

  smoothSurfaceSelective(surfaceHeights, biomes);
  clampSurfaceSlopes(surfaceHeights, MAX_TERRAIN_SLOPE);

  for (let x = 0; x < WORLD_WIDTH; x++) {
    const surface = surfaceHeights[x];
    const biome = biomes[x];
    const isMountain = biome > 0.62;
    const isHighPeak = surface < baseSurface - 14;
    const isRockySlope = isMountain && surface < baseSurface - 5;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      const idx = y * WORLD_WIDTH + x;
      if (y < surface) {
        world[idx] = BLOCK.AIR;
      } else if (y === surface) {
        if (isHighPeak) {
          world[idx] = BLOCK.SNOW;
        } else if (isRockySlope) {
          world[idx] = BLOCK.STONE;
        } else {
          world[idx] = BLOCK.GRASS;
        }
      } else if (y < surface + 5) {
        world[idx] = BLOCK.DIRT;
      } else {
        world[idx] = BLOCK.STONE;
      }
    }
  }

  for (let i = 0; i < 120; i++) {
    const cx = Math.floor(rand() * (WORLD_WIDTH - 20)) + 10;
    const cy = surfaceHeights[cx] + 15 + Math.floor(rand() * 40);
    const radius = 3 + Math.floor(rand() * 5);
    carveCircle(world, cx, cy, radius);
  }

  scatterTrees(world, surfaceHeights, biomes, rand);

  for (let x = 0; x < WORLD_WIDTH; x++) {
    const surface = surfaceHeights[x];
    for (let y = surface + 10; y < WORLD_HEIGHT - 5; y++) {
      if (get(world, x, y) !== BLOCK.STONE) continue;
      const depth = y - surface;
      for (const ore of ORE_DEFS) {
        if (depth < ore.minDepth) continue;
        if (rand() < ore.chance) {
          set(world, x, y, ore.id);
          break;
        }
      }
    }
  }

  for (let x = WORLD_BORDER_WIDTH; x < WORLD_WIDTH - WORLD_BORDER_WIDTH; x++) {
    if (surfaceHeights[x] > WORLD_HEIGHT - 8) continue;
    for (let y = surfaceHeights[x] + 8; y < WORLD_HEIGHT - 3; y++) {
      if (rand() < 0.002 && get(world, x, y) === BLOCK.AIR) {
        let ok = true;
        for (let dy = 0; dy < 4 && ok; dy++) {
          if (get(world, x, y + dy) !== BLOCK.AIR) ok = false;
        }
        if (ok) {
          for (let dy = 0; dy < 3; dy++) set(world, x, y + dy, BLOCK.WATER);
        }
      }
    }
  }

  buildWorldBorders(world, surfaceHeights);

  return { data: world, surfaceHeights, seed };
}

function clampSurfaceSlopes(heights, maxStep) {
  for (let pass = 0; pass < 5; pass++) {
    for (let x = 1; x < heights.length; x++) {
      if (heights[x] > heights[x - 1] + maxStep) {
        heights[x] = heights[x - 1] + maxStep;
      }
      if (heights[x] < heights[x - 1] - maxStep) {
        heights[x] = heights[x - 1] - maxStep;
      }
    }
    for (let x = heights.length - 2; x >= 0; x--) {
      if (heights[x] > heights[x + 1] + maxStep) {
        heights[x] = heights[x + 1] + maxStep;
      }
      if (heights[x] < heights[x + 1] - maxStep) {
        heights[x] = heights[x + 1] - maxStep;
      }
    }
  }
}

function buildWorldBorders(world, surfaceHeights) {
  for (let bx = 0; bx < WORLD_BORDER_WIDTH; bx++) {
    const leftX = bx;
    const rightX = WORLD_WIDTH - 1 - bx;
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      set(world, leftX, y, BLOCK.STONE);
      set(world, rightX, y, BLOCK.STONE);
    }
    surfaceHeights[leftX] = Math.min(surfaceHeights[leftX], surfaceHeights[WORLD_BORDER_WIDTH]);
    surfaceHeights[rightX] = Math.min(
      surfaceHeights[rightX],
      surfaceHeights[WORLD_WIDTH - 1 - WORLD_BORDER_WIDTH]
    );
  }
}

function scatterTrees(world, surfaceHeights, biomes, rand) {
  const attempts = Math.floor(WORLD_WIDTH * 0.35);

  for (let i = 0; i < attempts; i++) {
    const x = 5 + Math.floor(rand() * (WORLD_WIDTH - 10));
    const biome = biomes[x];
    const surface = surfaceHeights[x];
    const idx = surface * WORLD_WIDTH + x;

    if (world[idx] !== BLOCK.GRASS && world[idx] !== BLOCK.DIRT) continue;

    let chance = 0.22;
    if (biome < 0.32) chance = 0.38;
    else if (biome > 0.62) chance = 0.08;

    if (rand() > chance) continue;

    const type = Math.floor(rand() * 5);
    const offsetX = rand() > 0.55 ? (rand() > 0.5 ? 1 : -1) : 0;
    const tx = x + offsetX;
    if (tx < 2 || tx >= WORLD_WIDTH - 2) continue;

    const treeSurface = surfaceHeights[tx];
    const treeIdx = treeSurface * WORLD_WIDTH + tx;
    if (world[treeIdx] !== BLOCK.GRASS) continue;

    placeTreeByType(world, tx, treeSurface, type, rand);
  }
}

function smoothSurfaceSelective(heights, biomes) {
  const smoothed = new Int32Array(heights.length);
  for (let x = 0; x < heights.length; x++) {
    const biome = biomes[x];
    const radius = biome < 0.32 ? 10 : biome < 0.55 ? 4 : 1;
    let sum = 0;
    let count = 0;
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      if (nx < 0 || nx >= heights.length) continue;
      sum += heights[nx];
      count++;
    }
    smoothed[x] = Math.round(sum / count);
  }
  for (let x = 0; x < heights.length; x++) {
    heights[x] = smoothed[x];
  }
}

const TREE_TYPES = {
  OAK: 0,
  PINE: 1,
  BUSH: 2,
  AUTUMN: 3,
  BIRCH: 4,
};

function placeTreeByType(world, x, surface, type, rand) {
  switch (type) {
    case TREE_TYPES.PINE:
      placePine(world, x, surface, rand);
      break;
    case TREE_TYPES.BUSH:
      placeBush(world, x, surface, rand);
      break;
    case TREE_TYPES.AUTUMN:
      placeOak(world, x, surface, rand, BLOCK.LEAVES_ORANGE);
      break;
    case TREE_TYPES.BIRCH:
      placeBirch(world, x, surface, rand);
      break;
    default:
      placeOak(world, x, surface, rand, BLOCK.LEAVES);
  }
}

function fillLeaves(world, lx, ly, leafId) {
  if (!inBounds(lx, ly)) return;
  if (get(world, lx, ly) === BLOCK.AIR) {
    set(world, lx, ly, leafId);
  }
}

function placeOak(world, x, surface, rand, leafId = BLOCK.LEAVES) {
  const trunkH = 5 + Math.floor(rand() * 4);
  for (let h = 1; h <= trunkH; h++) {
    const ty = surface - h;
    if (ty >= 0) set(world, x, ty, BLOCK.WOOD);
  }
  const crownY = surface - trunkH - 1;
  const r = 2 + Math.floor(rand() * 2);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > (r + 0.5) * (r + 0.5)) continue;
      fillLeaves(world, x + dx, crownY + dy, leafId);
    }
  }
  fillLeaves(world, x, crownY - r - 1, leafId);
}

function placePine(world, x, surface, rand) {
  const trunkH = 8 + Math.floor(rand() * 5);
  for (let h = 1; h <= trunkH; h++) {
    const ty = surface - h;
    if (ty >= 0) set(world, x, ty, BLOCK.WOOD);
  }
  const top = surface - trunkH - 1;
  for (let layer = 0; layer < 3; layer++) {
    const ly = top - layer;
    const spread = 2 - layer;
    for (let dx = -spread; dx <= spread; dx++) {
      fillLeaves(world, x + dx, ly, BLOCK.LEAVES);
    }
  }
}

function placeBush(world, x, surface, rand) {
  const trunkH = 1 + Math.floor(rand() * 2);
  for (let h = 1; h <= trunkH; h++) {
    const ty = surface - h;
    if (ty >= 0) set(world, x, ty, BLOCK.WOOD);
  }
  const crownY = surface - trunkH;
  const w = 2 + Math.floor(rand() * 2);
  for (let dy = -1; dy <= w; dy++) {
    for (let dx = -w; dx <= w; dx++) {
      if (Math.abs(dx) === w && Math.abs(dy) === w && rand() > 0.5) continue;
      fillLeaves(world, x + dx, crownY - dy, BLOCK.LEAVES);
    }
  }
}

function placeBirch(world, x, surface, rand) {
  const trunkH = 6 + Math.floor(rand() * 3);
  for (let h = 1; h <= trunkH; h++) {
    const ty = surface - h;
    if (ty >= 0) set(world, x, ty, BLOCK.BIRCH_WOOD);
  }
  const crownY = surface - trunkH - 1;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;
      fillLeaves(world, x + dx, crownY + dy, BLOCK.LEAVES);
    }
  }
  fillLeaves(world, x, crownY - 3, BLOCK.LEAVES);
}

function inBounds(x, y) {
  return x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT;
}

function get(world, x, y) {
  return world[y * WORLD_WIDTH + x];
}

function set(world, x, y, id) {
  world[y * WORLD_WIDTH + x] = id;
}

function carveCircle(world, cx, cy, r) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if (!inBounds(x, y)) continue;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        set(world, x, y, BLOCK.AIR);
      }
    }
  }
}
