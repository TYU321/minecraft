import { TILE_SIZE } from './constants.js';
import { getMineSpeed, TILE_DEFS } from './tiles.js';
import { BLOCK } from './constants.js';
import { blockOverlapsPlayer } from './collision.js';
import { isCraftingOpen } from './craftingUI.js';
import { canMineBlock, canPlaceBlock } from './mining.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = { left: false, right: false, jump: false };
    this.mouse = { x: 0, y: 0, down: false, rightDown: false };
    this.mineTarget = null;
    this.mineProgress = 0;

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    canvas.addEventListener('mousedown', (e) => this.onMouse(e, true));
    window.addEventListener('mouseup', (e) => this.onMouse(e, false));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('mousemove', (e) => this.onMove(e));
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  onKey(e, down) {
    const k = e.key.toLowerCase();
    if (k === 'a' || k === 'arrowleft') this.keys.left = down;
    if (k === 'd' || k === 'arrowright') this.keys.right = down;
    if (k === ' ' || k === 'w' || k === 'arrowup') {
      this.keys.jump = down;
      if (down) e.preventDefault();
    }
    if (down && k >= '1' && k <= '9') {
      this.onSlotSelect?.(+k - 1);
    }
    if (down && k === 'c') {
      this.onToggleCraft?.();
    }
  }

  onMouse(e, down) {
    if (e.button === 0) this.mouse.down = down;
    if (e.button === 2) this.mouse.rightDown = down;
    if (!down) {
      this.mineProgress = 0;
      this.mineTarget = null;
    }
  }

  onMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  onWheel(e) {
    e.preventDefault();
    this.onScroll?.(e.deltaY > 0 ? 1 : -1);
  }

  screenToWorld(camera, sx, sy) {
    const tx = Math.floor((sx + camera.x) / TILE_SIZE);
    const ty = Math.floor((sy + camera.y) / TILE_SIZE);
    return { tx, ty };
  }

  update(dt, game) {
    const { inventory, camera, world, player } = game;
    const { tx, ty } = this.screenToWorld(camera, this.mouse.x, this.mouse.y);

    const mobHere = game.mobs?.getAtTile(tx, ty);
    const canMine = mobHere || canMineBlock(world, player, tx, ty);
    game.hoverTile = { tx, ty, canMine, isMob: !!mobHere };

    if (isCraftingOpen()) return;

    if (this.mouse.down) {
      this.handleMine(dt, game, tx, ty);
    } else if (this.mouse.rightDown) {
      this.handlePlace(game, tx, ty);
      this.mouse.rightDown = false;
    }
  }

  handleMine(dt, game, tx, ty) {
    const { world, inventory, player, mobs } = game;

    const mob = mobs?.getAtTile(tx, ty);
    if (mob) {
      this.handleMobAttack(dt, game, mob);
      return;
    }

    if (!canMineBlock(world, player, tx, ty)) {
      this.mineTarget = null;
      this.mineProgress = 0;
      return;
    }

    const tile = world.getTile(tx, ty);

    const key = `${tx},${ty}`;
    if (this.mineTarget !== key) {
      this.mineTarget = key;
      this.mineProgress = 0;
    }

    const speed = getMineSpeed(
      tile,
      inventory.getToolType(),
      inventory.getToolTier()
    );
    this.mineProgress += dt * speed;

    if (this.mineProgress >= 1) {
      const def = TILE_DEFS[tile];
      world.setTile(tx, ty, BLOCK.AIR);
      if (def.drop) {
        game.inventory.addBlock(def.drop);
        game.onInventoryChange?.();
      }
      this.mineProgress = 0;
      this.mineTarget = null;
      game.mineParticles?.push({ x: tx, y: ty, life: 0.3 });
    }
  }

  handleMobAttack(dt, game, mob) {
    const { inventory } = game;
    const key = `mob_${mob.typeId}_${Math.floor(mob.x)}_${Math.floor(mob.y)}`;
    if (this.mineTarget !== key) {
      this.mineTarget = key;
      this.mineProgress = 0;
    }

    const tool = inventory.getToolType();
    let speed = 1.2;
    if (tool === 'sword') speed = 3.5;
    else if (tool === 'flail') speed = 2.8;
    else if (tool === 'axe') speed = 2;
    const tierMult = { wood: 1, bronze: 1.2, iron: 1.5, silver: 1.8, gold: 2, diamond: 2.5 }[
      inventory.getToolTier()
    ] || 1;
    speed *= tierMult;

    this.mineProgress += dt * speed;
    if (this.mineProgress >= 1) {
      const dmg = tool === 'sword' ? 20 : tool === 'flail' ? 15 : 8;
      mob.takeDamage(dmg);
      this.mineProgress = 0;
      this.mineTarget = null;
      game.mineParticles?.push({
        x: Math.floor(mob.x),
        y: Math.floor(mob.y),
        life: 0.25,
      });
    }
  }

  handlePlace(game, tx, ty) {
    const { world, player, inventory } = game;
    const blockId = inventory.getPlaceBlockId();
    if (!blockId) return;
    if (world.getTile(tx, ty) !== BLOCK.AIR) return;
    if (!canPlaceBlock(world, player, tx, ty)) return;
    if (blockOverlapsPlayer(world, player, tx, ty)) return;
    if (!inventory.consumeBlock()) return;
    world.setTile(tx, ty, blockId);
  }
}
