import { TILE_SIZE } from './constants.js';
import { drawCharPart } from './assets.js';

const MOB_PART_SCALE = 0.52;
const MOB_DRAW_SCALE = (TILE_SIZE / 44) * 1.35;

function part(key, ctx, x, y, scale, legOff = 0) {
  drawCharPart(ctx, key, x, y + legOff, scale, MOB_PART_SCALE);
}

function drawHitSlash(ctx, scale, flash) {
  const t = Math.min(1, flash / 0.35);
  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${t * 0.95})`;
  ctx.lineWidth = Math.max(2, 4 * scale);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-28 * scale, -55 * scale);
  ctx.lineTo(18 * scale, -78 * scale);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 120, 100, ${t * 0.55})`;
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.beginPath();
  ctx.moveTo(-22 * scale, -48 * scale);
  ctx.lineTo(12 * scale, -68 * scale);
  ctx.stroke();
  ctx.restore();
}

export function drawMob(ctx, mob, camera) {
  if (mob.dead) return;

  const px = mob.x * TILE_SIZE - camera.x;
  const py = mob.y * TILE_SIZE - camera.y;
  const scale = MOB_DRAW_SCALE;
  const footY = py + mob.def.height * TILE_SIZE;
  const centerX = px + (mob.def.width * TILE_SIZE) / 2;

  const hitT = mob.hitTimer > 0 ? mob.hitTimer / 0.3 : 0;
  const knockPx = mob.hitKnockX * hitT * TILE_SIZE;
  const shake = hitT > 0
    ? Math.sin(mob.hitShake + (0.3 - mob.hitTimer) * 48) * 0.14 * hitT
    : 0;
  const squash = hitT > 0 ? 1 + 0.08 * hitT : 1;

  ctx.save();
  ctx.translate(centerX + knockPx, footY);
  ctx.rotate(shake);
  ctx.scale(squash, 2 - squash);
  if (mob.facing < 0) ctx.scale(-1, 1);

  if (mob.hitFlash > 0) {
    ctx.filter = 'brightness(1.75) saturate(0.7)';
  }

  const legOff = Math.sin(mob.walkAnim) * 4 * scale;
  const p = mob.def.parts?.prefix;

  switch (mob.typeId) {
    case 'hedgehog':
      part('hedgehog_body', ctx, -48 * scale, -36 * scale, scale * 1.15);
      break;

    case 'boar':
      part(`${p}_leg`, ctx, -16 * scale, -22 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 6 * scale, -22 * scale, scale, -legOff);
      part(`${p}_tail`, ctx, 26 * scale, -28 * scale, scale * 0.85);
      part(`${p}_body`, ctx, -52 * scale, -48 * scale, scale * 1.25);
      part(`${p}_head`, ctx, 24 * scale, -52 * scale, scale * 1.1);
      break;

    case 'fox':
      part(`${p}_leg`, ctx, -14 * scale, -18 * scale, scale * 0.95, legOff);
      part(`${p}_leg`, ctx, 8 * scale, -18 * scale, scale * 0.95, -legOff);
      part(`${p}_tail`, ctx, 28 * scale, -22 * scale, scale);
      part(`${p}_body`, ctx, -62 * scale, -36 * scale, scale * 1.2);
      part(`${p}_ear`, ctx, -10 * scale, -40 * scale, scale * 0.85);
      break;

    case 'gnome':
      part(`${p}_leg`, ctx, -14 * scale, -34 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 4 * scale, -34 * scale, scale, -legOff);
      part(`${p}_body`, ctx, -20 * scale, -46 * scale, scale);
      part(`${p}_arm`, ctx, 10 * scale, -44 * scale, scale * 0.9);
      part(`${p}_head`, ctx, -26 * scale, -62 * scale, scale * 1.05);
      break;

    case 'alien':
      part(`${p}_leg`, ctx, -16 * scale, -36 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 4 * scale, -36 * scale, scale, -legOff);
      part(`${p}_body`, ctx, -24 * scale, -52 * scale, scale * 1.05);
      part(`${p}_arm`, ctx, 12 * scale, -50 * scale, scale * 0.9);
      part(`${p}_head`, ctx, -50 * scale, -68 * scale, scale * 1.15);
      break;

    default:
      part(`${p}_leg`, ctx, -18 * scale, -42 * scale, scale, legOff);
      part(`${p}_leg`, ctx, 4 * scale, -42 * scale, scale, -legOff);
      part(`${p}_body`, ctx, -26 * scale, -58 * scale, scale * 1.05);
      part(`${p}_arm`, ctx, 14 * scale, -56 * scale, scale);
      part(`${p}_head`, ctx, -38 * scale, -82 * scale, scale * 1.05);
      break;
  }

  if (mob.hitFlash > 0.12) {
    drawHitSlash(ctx, scale, mob.hitFlash);
  }

  ctx.filter = 'none';
  ctx.restore();

  const hpW = mob.def.width * TILE_SIZE;
  const barX = px + knockPx;
  const barY = py - 6;
  const hpPct = mob.hp / mob.maxHp;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(barX, barY, hpW, 4);
  ctx.fillStyle = mob.def.hostile ? '#e74c3c' : '#2ecc71';
  ctx.fillRect(barX, barY, hpW * hpPct, 4);
}
