import { GRAVITY, MAX_FALL, WORLD_WIDTH, WORLD_BORDER_WIDTH } from './constants.js';
import { MOB_TYPES, MOB_TYPE_IDS } from './mobDefs.js';
import {
  moveAxis, resolveMobOverlap, collidesWithWorld, canMoveTo,
} from './collision.js';

function pickWeighted(rand) {
  let total = 0;
  for (const id of MOB_TYPE_IDS) total += MOB_TYPES[id].spawnWeight;
  let r = rand() * total;
  for (const id of MOB_TYPE_IDS) {
    r -= MOB_TYPES[id].spawnWeight;
    if (r <= 0) return id;
  }
  return MOB_TYPE_IDS[0];
}

export class Mob {
  constructor(typeId, x, y) {
    const def = MOB_TYPES[typeId];
    this.typeId = typeId;
    this.def = def;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = Math.random() < 0.5 ? -1 : 1;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.onGround = false;
    this.walkAnim = 0;
    this.wanderTimer = 1 + Math.random() * 3;
    this.moveDir = this.facing;
    this.stuckTimer = 0;
    this.attackTimer = 0;
    this.dead = false;
    this.hitFlash = 0;
    this.hitTimer = 0;
    this.hitKnockX = 0;
    this.hitShake = 0;
  }

  get centerX() {
    return this.x + this.def.width / 2;
  }

  takeDamage(amount, attackerX) {
    if (this.dead) return;
    this.hp -= amount;
    this.hitFlash = 0.35;
    this.hitTimer = 0.3;
    this.hitShake = Math.random() * Math.PI * 2;
    if (attackerX != null) {
      let dir = Math.sign(this.centerX - attackerX);
      if (dir === 0) dir = this.facing;
      this.hitKnockX = dir * 0.4;
    }
    if (this.hp <= 0) this.dead = true;
  }

  pickNewWanderDir(world) {
    const options = [];
    for (const dir of [-1, 1]) {
      const testX = this.x + dir * 0.5;
      if (canMoveTo(world, testX, this.y, this.def.width, this.def.height)) {
        options.push(dir);
      }
    }
    if (options.length > 0) {
      this.moveDir = options[Math.floor(Math.random() * options.length)];
    } else {
      this.moveDir = -this.moveDir;
    }
    this.facing = this.moveDir;
    this.wanderTimer = 1.5 + Math.random() * 3;
    this.stuckTimer = 0;
  }

  update(dt, world, player) {
    if (this.dead) return;

    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.hitTimer = Math.max(0, this.hitTimer - dt);
    if (this.hitTimer <= 0) {
      this.hitKnockX *= 0.85;
      if (Math.abs(this.hitKnockX) < 0.02) this.hitKnockX = 0;
    }
    this.attackTimer = Math.max(0, this.attackTimer - dt);

    const def = this.def;
    const hdx = player.x + 0.5 - this.centerX;
    const hdist = Math.abs(hdx);
    const vdist = Math.abs(player.y - this.y);
    const dist = Math.sqrt(hdx * hdx + vdist * vdist);

    let targetVx = 0;

    if (def.hostile && dist < def.chaseRange) {
      targetVx = (hdist > 0.2 ? Math.sign(hdx) : this.facing) * def.speed;
      if (hdist > 0.25) this.facing = hdx > 0 ? 1 : -1;
      this.moveDir = this.facing;
    } else if (def.flee && dist < def.fleeRange) {
      targetVx = (hdist > 0.2 ? -Math.sign(hdx) : -this.facing) * def.speed;
      if (hdist > 0.25) this.facing = targetVx > 0 ? 1 : -1;
      this.moveDir = this.facing;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.pickNewWanderDir(world);
      }
      targetVx = this.moveDir * def.speed * 0.5;
      this.facing = this.moveDir;
    }

    this.vx = targetVx;
    this.onGround = false;
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    const prevX = this.x;
    const w = def.width;
    const h = def.height;

    moveAxis(world, this, this.vx * dt, 0, w, h, true);
    moveAxis(world, this, 0, this.vy * dt, w, h, true);

    if (collidesWithWorld(world, this.x, this.y, w, h, true)) {
      resolveMobOverlap(world, this, w, h);
    }

    const moved = Math.abs(this.x - prevX);
    const wantedMove = Math.abs(targetVx) > 0.5;

    if (wantedMove && moved < 0.008) {
      this.stuckTimer += dt;
      if (this.stuckTimer > 0.35) {
        this.pickNewWanderDir(world);
      }
    } else {
      this.stuckTimer = 0;
    }

    const border = WORLD_BORDER_WIDTH + 1;
    if (this.x < border) {
      this.x = border;
      this.pickNewWanderDir(world);
    } else if (this.x > world.width - border - w) {
      this.x = world.width - border - w;
      this.pickNewWanderDir(world);
    }

    if (Math.abs(this.vx) > 3 && moved > 0.01) {
      this.walkAnim += dt * 8;
    } else {
      this.walkAnim *= 0.85;
    }

    if (player.dead) return;

    if (def.hostile && dist < 1.2 && hdist < 1.2 && this.attackTimer <= 0 && vdist < 2.5) {
      player.hp = Math.max(0, player.hp - def.damage);
      player.hurtFlash = 0.4;
      this.attackTimer = def.attackCooldown;
    } else if (!def.hostile && def.damage > 0 && dist < 1.0 && this.attackTimer <= 0) {
      player.hp = Math.max(0, player.hp - def.damage);
      player.hurtFlash = 0.3;
      this.attackTimer = def.attackCooldown;
    }
  }

  snapToGround(world) {
    const def = this.def;
    const tx = Math.floor(this.x + def.width / 2);
    let ground = world.height - 1;
    for (let y = 0; y < world.height; y++) {
      if (world.isSolidAt(tx, y)) {
        ground = y;
        break;
      }
    }
    this.y = ground - def.height;
    if (collidesWithWorld(world, this.x, this.y, def.width, def.height, true)) {
      resolveMobOverlap(world, this, def.width, def.height);
    }
  }
}

export class MobManager {
  constructor() {
    this.list = [];
  }

  spawnForWorld(world, seed = Date.now()) {
    this.list = [];
    let s = seed;
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const count = 20;

    for (let i = 0; i < count; i++) {
      const tx =
        WORLD_BORDER_WIDTH +
        2 +
        Math.floor(rand() * (world.width - WORLD_BORDER_WIDTH * 2 - 4));
      const typeId = pickWeighted(rand);
      const def = MOB_TYPES[typeId];
      const surface = world.surfaceHeights[tx];
      const y = surface - def.height;
      if (y < 2) continue;

      const mob = new Mob(typeId, tx + 0.15, y);
      if (!collidesWithWorld(world, mob.x, mob.y, def.width, def.height, true)) {
        mob.snapToGround(world);
        this.list.push(mob);
      }
    }
  }

  update(dt, world, player) {
    for (const mob of this.list) {
      mob.update(dt, world, player);
    }
    this.list = this.list.filter((m) => !m.dead);
  }

  getAtTile(tx, ty) {
    for (const mob of this.list) {
      if (mob.dead) continue;
      const x0 = Math.floor(mob.x);
      const x1 = Math.ceil(mob.x + mob.def.width) - 1;
      const y0 = Math.floor(mob.y);
      const y1 = Math.ceil(mob.y + mob.def.height) - 1;
      if (tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1) return mob;
    }
    return null;
  }

  damageAtTile(tx, ty, amount) {
    const mob = this.getAtTile(tx, ty);
    if (mob) mob.takeDamage(amount);
    return mob;
  }
}
