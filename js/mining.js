import { PLAYER_HEIGHT, MINE_REACH } from './constants.js';
import { isBreakable } from './tiles.js';

export function getPlayerMineOrigin(player) {
  return {
    x: player.x + 0.5,
    y: player.y + PLAYER_HEIGHT * 0.55,
  };
}

export function isWithinMineReach(player, tx, ty) {
  const o = getPlayerMineOrigin(player);
  const dx = tx + 0.5 - o.x;
  const dy = ty + 0.5 - o.y;
  return dx * dx + dy * dy <= MINE_REACH * MINE_REACH;
}

function bresenhamLine(x0, y0, x1, y1) {
  const points = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return points;
}

export function hasLineOfSight(world, player, tx, ty) {
  const o = getPlayerMineOrigin(player);
  const x0 = Math.floor(o.x);
  const y0 = Math.floor(o.y);
  const line = bresenhamLine(x0, y0, tx, ty);

  for (let i = 0; i < line.length - 1; i++) {
    const [cx, cy] = line[i];
    if (!world.inBounds(cx, cy)) continue;
    if (world.isSolidAt(cx, cy)) return false;
  }
  return true;
}

export function isBlockExposed(world, tx, ty) {
  const neighbors = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];
  for (const [dx, dy] of neighbors) {
    const nx = tx + dx;
    const ny = ty + dy;
    if (!world.inBounds(nx, ny)) return true;
    if (!world.isSolidAt(nx, ny)) return true;
  }
  return false;
}

export function canMineBlock(world, player, tx, ty) {
  const tile = world.getTile(tx, ty);
  if (!isBreakable(tile)) return false;
  if (!isWithinMineReach(player, tx, ty)) return false;
  if (!isBlockExposed(world, tx, ty)) return false;
  if (!hasLineOfSight(world, player, tx, ty)) return false;
  return true;
}

export function canPlaceBlock(world, player, tx, ty) {
  if (!isWithinMineReach(player, tx, ty)) return false;
  if (!hasLineOfSight(world, player, tx, ty)) return false;
  return true;
}
