import { TILE_SIZE } from './constants.js';
import { assets, drawCharPart } from './assets.js';

function part(key, ctx, x, y, scale, legOff = 0) {
  drawCharPart(ctx, key, x, y + legOff, scale);
}

export function drawMob(ctx, mob, camera) {
  if (mob.dead) return;

  const px = mob.x * TILE_SIZE - camera.x;
  const py = mob.y * TILE_SIZE - camera.y;
  const scale = TILE_SIZE / 44;
  const footY = py + mob.def.height * TILE_SIZE;
  const centerX = px + (mob.def.width * TILE_SIZE) / 2;

  ctx.save();
  ctx.translate(centerX, footY);
  if (mob.facing < 0) ctx.scale(-1, 1);

  if (mob.hitFlash > 0) {
    ctx.globalAlpha = 0.85;
    ctx.filter = 'brightness(1.6)';
  }

  const legOff = Math.sin(mob.walkAnim) * 3 * scale;
  const p = mob.def.parts?.prefix;

  switch (mob.typeId) {
    case 'hedgehog':
      part('hedgehog_body', ctx, -36 * scale, -28 * scale, scale * 1.1);
      break;

    case 'boar':
      part(`${p}_leg`, ctx, -12 * scale, -18 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 4 * scale, -18 * scale, scale, -legOff);
      part(`${p}_tail`, ctx, 20 * scale, -22 * scale, scale * 0.7);
      part(`${p}_body`, ctx, -40 * scale, -38 * scale, scale * 1.2);
      part(`${p}_head`, ctx, 18 * scale, -42 * scale, scale);
      break;

    case 'fox':
      part(`${p}_leg`, ctx, -10 * scale, -14 * scale, scale * 0.7, legOff);
      part(`${p}_leg`, ctx, 6 * scale, -14 * scale, scale * 0.7, -legOff);
      part(`${p}_tail`, ctx, 22 * scale, -16 * scale, scale * 0.8);
      part(`${p}_body`, ctx, -50 * scale, -28 * scale, scale * 1.1);
      part(`${p}_ear`, ctx, -8 * scale, -32 * scale, scale * 0.6);
      break;

    case 'gnome':
      part(`${p}_leg`, ctx, -10 * scale, -28 * scale, scale * 0.85, legOff);
      part(`${p}_leg`, ctx, 2 * scale, -28 * scale, scale * 0.85, -legOff);
      part(`${p}_body`, ctx, -16 * scale, -38 * scale, scale * 0.85);
      part(`${p}_arm`, ctx, 8 * scale, -36 * scale, scale * 0.7);
      part(`${p}_head`, ctx, -20 * scale, -52 * scale, scale * 0.9);
      break;

    case 'alien':
      part(`${p}_leg`, ctx, -12 * scale, -30 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 2 * scale, -30 * scale, scale, -legOff);
      part(`${p}_body`, ctx, -20 * scale, -44 * scale, scale);
      part(`${p}_arm`, ctx, 10 * scale, -42 * scale, scale * 0.65);
      part(`${p}_head`, ctx, -42 * scale, -58 * scale, scale * 1.05);
      break;

    default:
      part(`${p}_leg`, ctx, -14 * scale, -36 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 2 * scale, -36 * scale, scale, -legOff);
      part(`${p}_body`, ctx, -22 * scale, -50 * scale, scale);
      part(`${p}_arm`, ctx, 12 * scale, -48 * scale, scale);
      part(`${p}_head`, ctx, -32 * scale, -72 * scale, scale);
      break;
  }

  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.restore();

  const hpW = mob.def.width * TILE_SIZE;
  const barX = px;
  const barY = py - 6;
  const hpPct = mob.hp / mob.maxHp;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(barX, barY, hpW, 4);
  ctx.fillStyle = mob.def.hostile ? '#e74c3c' : '#2ecc71';
  ctx.fillRect(barX, barY, hpW * hpPct, 4);
}
