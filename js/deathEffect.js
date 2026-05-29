export const DEATH_FRAME_DURATION = 0.11;
export const DEATH_FRAME_COUNT = 5;

export class DeathEffect {
  constructor(worldX, worldY) {
    this.x = worldX;
    this.y = worldY;
    this.time = 0;
    this.finished = false;
  }

  update(dt) {
    if (this.finished) return;
    this.time += dt;
    if (this.time >= DEATH_FRAME_DURATION * DEATH_FRAME_COUNT) {
      this.finished = true;
    }
  }

  getFrameIndex() {
    return Math.min(
      DEATH_FRAME_COUNT - 1,
      Math.floor(this.time / DEATH_FRAME_DURATION)
    );
  }
}
