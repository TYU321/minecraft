import {
  GRAVITY, JUMP_FORCE, MAX_FALL,
  PLAYER_MAX_SPEED, GROUND_ACCEL, AIR_ACCEL,
  GROUND_FRICTION, AIR_FRICTION, PLAYER_WIDTH,
} from './constants.js';
import { moveAxis } from './collision.js';

function moveToward(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.hp = 100;
    this.maxHp = 100;
    this.walkAnim = 0;
    this.hurtFlash = 0;
    this.attackAnim = 0;
    this.dead = false;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.vx = 0;
    this.vy = 0;
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.dead = false;
    this.hurtFlash = 0;
    this.attackAnim = 0;
    this.onGround = false;
  }

  update(dt, world, keys) {
    if (this.dead) return;

    this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    const wasOnGround = this.onGround;
    this.onGround = false;

    const accel = wasOnGround ? GROUND_ACCEL : AIR_ACCEL;
    const friction = wasOnGround ? GROUND_FRICTION : AIR_FRICTION;

    let targetVx = 0;
    if (keys.left) {
      targetVx = -PLAYER_MAX_SPEED;
      this.facing = -1;
    } else if (keys.right) {
      targetVx = PLAYER_MAX_SPEED;
      this.facing = 1;
    }

    if (targetVx !== 0) {
      this.vx = moveToward(this.vx, targetVx, accel * dt);
    } else {
      this.vx = moveToward(this.vx, 0, friction * dt);
    }

    if (keys.jump && wasOnGround) {
      this.vy = JUMP_FORCE;
    }

    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    moveAxis(world, this, this.vx * dt, 0);
    moveAxis(world, this, 0, this.vy * dt);

    const border = world.borderWidth ?? 3;
    const minX = border;
    const maxX = world.width - border - PLAYER_WIDTH - 0.1;
    if (this.x < minX) {
      this.x = minX;
      this.vx = 0;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx = 0;
    }

    if (this.y > world.height - 2) {
      this.y = world.height - 3;
      this.vy = 0;
    }

    if (Math.abs(this.vx) > 10) {
      this.walkAnim += dt * 10;
    } else {
      this.walkAnim = 0;
    }
  }
}
