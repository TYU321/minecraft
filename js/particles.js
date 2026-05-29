import { GRAVITY, TILE_SIZE } from './constants.js';
import { TILE_DEFS } from './tiles.js';

export function isTreeBlock(blockId) {
  const def = TILE_DEFS[blockId];
  if (!def) return false;
  return def.tool === 'axe' || def.foliage === true;
}

export function spawnWoodChips(game, tx, ty, count = 5) {
  if (!game.mineParticles) game.mineParticles = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 2.5;
    game.mineParticles.push({
      kind: 'wood',
      x: tx + 0.15 + Math.random() * 0.7,
      y: ty + 0.15 + Math.random() * 0.7,
      vx: Math.cos(angle) * speed,
      vy: -2 - Math.random() * 2.5,
      size: 3 + Math.random() * 4,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
    });
  }
}

export function spawnHitParticles(game, mob) {
  if (!game.mineParticles) game.mineParticles = [];

  const cx = mob.centerX;
  const cy = mob.y + mob.def.height * 0.45;
  const count = 6 + Math.floor(Math.random() * 5);
  const color = mob.def.hostile ? '#ff6655' : '#ffdd88';

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    game.mineParticles.push({
      kind: 'hit',
      color,
      x: cx + (Math.random() - 0.5) * mob.def.width * 0.5,
      y: cy + (Math.random() - 0.5) * mob.def.height * 0.35,
      vx: Math.cos(angle) * speed,
      vy: -1.8 - Math.random() * 2.2,
      size: 2 + Math.random() * 3,
      life: 0.18 + Math.random() * 0.2,
      maxLife: 0.38,
    });
  }
}

export function spawnBreakParticles(game, tx, ty, blockId) {
  if (isTreeBlock(blockId)) {
    spawnWoodChips(game, tx, ty, 8 + Math.floor(Math.random() * 6));
    return;
  }
  game.mineParticles.push({
    kind: 'dust',
    x: tx + 0.5,
    y: ty + 0.5,
    vx: 0,
    vy: 0,
    size: 6,
    life: 0.25,
    maxLife: 0.25,
  });
}

export function updateParticles(particles, dt, world) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    if (p.kind === 'wood' || p.kind === 'dust' || p.kind === 'hit') {
      p.vy += GRAVITY * 0.35 * dt;
      p.vx *= 0.98;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      if (p.kind !== 'hit' && world.isSolidAt(tx, ty)) {
        p.vy *= -0.3;
        p.vx *= 0.5;
        p.y = ty - 0.05;
      }
    }
  }
}

export function drawParticles(ctx, particles, camera, woodChipImg) {
  for (const p of particles) {
    const alpha = Math.min(1, p.life / (p.maxLife || p.life));
    const sx = p.x * TILE_SIZE - camera.x;
    const sy = p.y * TILE_SIZE - camera.y;
    const size = p.size || 6;

    if (p.kind === 'wood' && woodChipImg) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(woodChipImg, sx - size / 2, sy - size / 2, size, size);
      ctx.restore();
    } else if (p.kind === 'hit') {
      ctx.fillStyle = p.color || '#ff6655';
      ctx.globalAlpha = alpha;
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = `rgba(180, 140, 80, ${alpha})`;
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    }
  }
}
