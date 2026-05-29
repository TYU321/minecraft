import {
  BLOCK, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_HEIGHT, WORLD_BORDER_WIDTH,
} from './constants.js';
import { isSolid } from './tiles.js';
import { generateWorld } from './worldGen.js';
import { collidesWithWorld } from './collision.js';

export class World {
  constructor() {
    const generated = generateWorld();
    this.data = generated.data;
    this.surfaceHeights = generated.surfaceHeights;
    this.width = WORLD_WIDTH;
    this.height = WORLD_HEIGHT;
    this.borderWidth = WORLD_BORDER_WIDTH;
  }

  index(x, y) {
    return y * this.width + x;
  }

  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getTile(x, y) {
    if (!this.inBounds(x, y)) return BLOCK.AIR;
    return this.data[this.index(x, y)];
  }

  setTile(x, y, id) {
    if (!this.inBounds(x, y)) return;
    this.data[this.index(x, y)] = id;
  }

  isSolidAt(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
    return isSolid(this.getTile(x, y));
  }

  findSpawn() {
    const centerX = Math.floor(this.width / 2);
    const searchOrder = [0];
    for (let i = 1; i <= 40; i++) {
      searchOrder.push(i, -i);
    }

    for (const offset of searchOrder) {
      const tx = centerX + offset;
      if (tx < 2 || tx >= this.width - 2) continue;

      const topSolidY = this.getTopSolidY(tx);
      if (topSolidY === null) continue;

      const spawnX = tx + 0.5;
      const spawnY = topSolidY - PLAYER_HEIGHT;

      if (spawnY < 1) continue;
      if (!collidesWithWorld(this, spawnX, spawnY)) {
        return { x: spawnX, y: spawnY };
      }
    }

    const surface = this.surfaceHeights[centerX];
    return { x: centerX + 0.5, y: Math.max(1, surface - PLAYER_HEIGHT - 3) };
  }

  getTopSolidY(tx) {
    for (let y = 0; y < this.height; y++) {
      if (this.isSolidAt(tx, y)) return y;
    }
    return null;
  }
}
