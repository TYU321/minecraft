import { PLAYER_WIDTH, PLAYER_HEIGHT } from './constants.js';

export function getAABB(px, py, w = PLAYER_WIDTH, h = PLAYER_HEIGHT, topLeft = false) {
  if (topLeft) {
    const inset = 0.04;
    return {
      left: px + inset,
      right: px + w - inset,
      top: py + inset,
      bottom: py + h - inset,
    };
  }
  const offsetX = (1 - w) / 2;
  const inset = 0.02;
  return {
    left: px + offsetX + inset,
    right: px + offsetX + w - inset,
    top: py + inset,
    bottom: py + h - inset,
  };
}

export function aabbOverlapsTile(aabb, tx, ty) {
  return (
    aabb.right > tx &&
    aabb.left < tx + 1 &&
    aabb.bottom > ty &&
    aabb.top < ty + 1
  );
}

export function collidesWithWorld(
  world, px, py, w = PLAYER_WIDTH, h = PLAYER_HEIGHT, topLeft = false
) {
  const aabb = getAABB(px, py, w, h, topLeft);
  const x0 = Math.floor(aabb.left);
  const x1 = Math.floor(aabb.right);
  const y0 = Math.floor(aabb.top);
  const y1 = Math.floor(aabb.bottom);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (world.isSolidAt(tx, ty) && aabbOverlapsTile(aabb, tx, ty)) {
        return true;
      }
    }
  }
  return false;
}

export function moveAxis(
  world, entity, dx, dy, w = PLAYER_WIDTH, h = PLAYER_HEIGHT, topLeft = false
) {
  const step = 0.008;
  let nx = entity.x;
  let ny = entity.y;

  if (dx !== 0) {
    const dir = Math.sign(dx);
    const dist = Math.abs(dx);
    let moved = 0;
    while (moved < dist) {
      const stepDist = Math.min(step, dist - moved);
      const testX = nx + dir * stepDist;
      if (!collidesWithWorld(world, testX, ny, w, h, topLeft)) {
        nx = testX;
        moved += stepDist;
      } else {
        entity.vx = 0;
        break;
      }
    }
  }

  if (dy !== 0) {
    const dir = Math.sign(dy);
    const dist = Math.abs(dy);
    let moved = 0;
    while (moved < dist) {
      const stepDist = Math.min(step, dist - moved);
      const testY = ny + dir * stepDist;
      if (!collidesWithWorld(world, nx, testY, w, h, topLeft)) {
        ny = testY;
        moved += stepDist;
      } else {
        if (dir > 0) entity.onGround = true;
        entity.vy = 0;
        break;
      }
    }
  }

  entity.x = nx;
  entity.y = ny;
}

export function resolveMobOverlap(world, entity, w, h) {
  for (let i = 0; i < 10; i++) {
    if (!collidesWithWorld(world, entity.x, entity.y, w, h, true)) return;
    entity.y -= 0.06;
  }
}

export function canMoveTo(world, x, y, w, h) {
  return !collidesWithWorld(world, x, y, w, h, true);
}

export function blockOverlapsPlayer(world, player, tx, ty) {
  const aabb = getAABB(player.x, player.y);
  return aabbOverlapsTile(aabb, tx, ty);
}
