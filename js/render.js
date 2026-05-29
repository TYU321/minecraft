import {
  TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, DAY_LENGTH,
} from './constants.js';
import { TILE_DEFS } from './tiles.js';
import { assets, drawTile } from './assets.js';
import { drawMob } from './mobRender.js';
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0 };
    this.gameTime = 0;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  updateCamera(player) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    this.camera.x = px - w / 2;
    this.camera.y = py - h / 2;

    const maxX = WORLD_WIDTH * TILE_SIZE - w;
    const maxY = WORLD_HEIGHT * TILE_SIZE - h;
    this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
  }

  getDayPhase() {
    return (this.gameTime % DAY_LENGTH) / DAY_LENGTH;
  }

  drawSky() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const phase = this.getDayPhase();
    const night = Math.abs(phase - 0.5) * 2;
    const dayBright = 1 - night * 0.75;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const r = Math.floor(100 + 35 * dayBright);
    const g = Math.floor(160 + 60 * dayBright);
    const b = Math.floor(220 + 20 * dayBright);
    grad.addColorStop(0, `rgb(${r},${g},${b})`);
    grad.addColorStop(1, `rgb(${Math.floor(r * 0.6)},${Math.floor(g * 0.7)},${Math.floor(b * 0.9)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (assets.clouds) {
      const cloudY = (this.camera.y * 0.2) % 128;
      for (let i = -1; i < 4; i++) {
        ctx.globalAlpha = 0.5 + dayBright * 0.3;
        ctx.drawImage(
          assets.clouds,
          ((i * 300 - this.camera.x * 0.15) % (w + 300)) - 150,
          40 + i * 30 + cloudY * 0.1,
          200, 80
        );
      }
      ctx.globalAlpha = 1;
    }

    if (night > 0.4 && assets.moon) {
      const moonX = w - 120 + Math.sin(phase * Math.PI * 2) * 30;
      const moonY = 60 + Math.cos(phase * Math.PI * 2) * 20;
      ctx.globalAlpha = night;
      ctx.drawImage(assets.moon, moonX, moonY, 64, 64);
      ctx.globalAlpha = 1;
    }

    if (night > 0.1) {
      ctx.fillStyle = `rgba(10, 10, 40, ${night * 0.45})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawWorld(world) {
    const ctx = this.ctx;
    const cam = this.camera;
    const startX = Math.max(0, Math.floor(cam.x / TILE_SIZE));
    const endX = Math.min(world.width, Math.ceil((cam.x + this.canvas.width) / TILE_SIZE));
    const startY = Math.max(0, Math.floor(cam.y / TILE_SIZE));
    const endY = Math.min(world.height, Math.ceil((cam.y + this.canvas.height) / TILE_SIZE));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const id = world.getTile(x, y);
        const def = TILE_DEFS[id];
        if (!def?.texture) continue;

        const sx = x * TILE_SIZE - cam.x;
        const sy = y * TILE_SIZE - cam.y;

        if (def.liquid) {
          ctx.globalAlpha = 0.75;
        } else if (def.foliage) {
          ctx.globalAlpha = 0.82;
        }
        drawTile(ctx, def.texture, sx, sy);
        ctx.globalAlpha = 1;
      }
    }
  }

  drawPlayer(player) {
    const ctx = this.ctx;
    const cam = this.camera;
    const px = player.x * TILE_SIZE - cam.x;
    const py = player.y * TILE_SIZE - cam.y;
    const scale = TILE_SIZE / 44;

    ctx.save();
    ctx.translate(px + TILE_SIZE * 0.5, py + TILE_SIZE * 1.75);
    if (player.facing < 0) ctx.scale(-1, 1);

    const legOff = Math.sin(player.walkAnim) * 3;
    const parts = assets.player;

    if (parts.male_leg) {
      ctx.drawImage(parts.male_leg, -14 * scale, -36 * scale + legOff, 28 * scale, 36 * scale);
      ctx.drawImage(parts.male_leg, 2 * scale, -36 * scale - legOff, 28 * scale, 36 * scale);
    }
    if (parts.male_body) {
      ctx.drawImage(parts.male_body, -22 * scale, -50 * scale, 44 * scale, 47 * scale);
    }
    if (parts.male_arm) {
      ctx.drawImage(parts.male_arm, 12 * scale, -48 * scale, 28 * scale, 66 * scale);
    }
    if (parts.male_head) {
      ctx.drawImage(parts.male_head, -32 * scale, -72 * scale, 64 * scale, 64 * scale);
    }

    if (player.hurtFlash > 0) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(-40 * scale, -80 * scale, 80 * scale, 90 * scale);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  drawMobs(mobs, player) {
    if (!mobs?.list?.length) return;
    const ctx = this.ctx;
    const sorted = [...mobs.list].sort((a, b) => a.y - b.y);
    const cam = this.camera;

    for (const mob of sorted) {
      if (mob.y < player.y) drawMob(ctx, mob, cam);
    }
    this.drawPlayer(player);
    for (const mob of sorted) {
      if (mob.y >= player.y) drawMob(ctx, mob, cam);
    }
  }

  drawHover(hoverTile, mineProgress, mineTarget) {
    if (!hoverTile) return;
    const { tx, ty, canMine } = hoverTile;
    const ctx = this.ctx;
    const sx = tx * TILE_SIZE - this.camera.x;
    const sy = ty * TILE_SIZE - this.camera.y;

    ctx.strokeStyle = canMine
      ? 'rgba(255, 255, 255, 0.65)'
      : 'rgba(255, 80, 80, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    if (canMine && mineProgress > 0 && mineTarget === `${tx},${ty}`) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(255, 200, 50, 0.7)';
      ctx.fillRect(sx, sy + TILE_SIZE * (1 - mineProgress), TILE_SIZE, TILE_SIZE * mineProgress);
    }
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    const cam = this.camera;
    for (const p of particles) {
      const alpha = p.life / 0.3;
      ctx.fillStyle = `rgba(180, 140, 80, ${alpha})`;
      const sx = p.x * TILE_SIZE - cam.x + TILE_SIZE / 2;
      const sy = p.y * TILE_SIZE - cam.y + TILE_SIZE / 2;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
    }
  }

  draw(game) {
    this.gameTime += game.dt;
    this.updateCamera(game.player);
    game.camera = this.camera;

    this.drawSky();
    this.drawWorld(game.world);
    if (game.mobs) {
      this.drawMobs(game.mobs, game.player);
    } else {
      this.drawPlayer(game.player);
    }
    this.drawParticles(game.mineParticles || []);
    this.drawHover(
      game.hoverTile,
      game.input.mineProgress,
      game.input.mineTarget
    );
  }
}
