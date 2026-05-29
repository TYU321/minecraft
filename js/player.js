import {
  GRAVITY, JUMP_FORCE, MAX_FALL,
  PLAYER_MAX_SPEED, GROUND_ACCEL, AIR_ACCEL,
  GROUND_FRICTION, AIR_FRICTION,
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
  }

  update(dt, world, keys) {
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

    if (Math.abs(this.vx) > 10) {
      this.walkAnim += dt * 10;
    } else {
      this.walkAnim = 0;
    }
  }
}
