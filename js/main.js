import { loadAssets } from './assets.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Inventory } from './inventory.js';
import { Input } from './input.js';
import { Renderer } from './render.js';
import { initCraftingUI, toggleCrafting, refreshCraftingUI } from './craftingUI.js';
import { MobManager } from './mobs.js';
import { DeathEffect } from './deathEffect.js';
import { updateParticles } from './particles.js';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from './constants.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');
const gameOverEl = document.getElementById('game-over');

const game = {
  world: null,
  player: null,
  inventory: null,
  input: null,
  renderer: null,
  mobs: null,
  deathEffect: null,
  camera: { x: 0, y: 0 },
  hoverTile: null,
  mineParticles: [],
  dt: 0,
  lastTime: 0,
};

function showGameOver(show) {
  if (gameOverEl) gameOverEl.classList.toggle('hidden', !show);
}

function triggerDeath() {
  const p = game.player;
  p.die();
  game.deathEffect = new DeathEffect(
    p.x + PLAYER_WIDTH / 2,
    p.y + PLAYER_HEIGHT / 2
  );
  showGameOver(false);
  if (document.getElementById('craft-panel')) {
    document.getElementById('craft-panel').classList.add('hidden');
  }
}

function respawnPlayer() {
  const spawn = game.world.findSpawn();
  game.player.respawn(spawn.x, spawn.y);
  game.deathEffect = null;
  showGameOver(false);
  game.mobs.spawnForWorld(game.world);
}

async function init() {
  try {
    await loadAssets();
  } catch (err) {
    loading.textContent = 'Ошибка загрузки. Запустите через локальный сервер: npx serve .';
    console.error(err);
    return;
  }

  game.world = new World();
  game.mobs = new MobManager();
  game.mobs.spawnForWorld(game.world);

  const spawn = game.world.findSpawn();
  game.player = new Player(spawn.x, spawn.y);
  game.inventory = new Inventory();
  game.inventory.updateUI();
  initCraftingUI(game.inventory);
  game.onInventoryChange = () => refreshCraftingUI();

  game.input = new Input(canvas);
  game.input.onSlotSelect = (i) => game.inventory.select(i);
  game.input.onScroll = (dir) => {
    if (!document.getElementById('craft-panel')?.classList.contains('hidden')) return;
    game.inventory.scroll(dir);
  };
  game.input.onToggleCraft = () => {
    if (!game.player.dead) toggleCrafting();
  };
  game.input.onRespawn = () => {
    if (game.player.dead && game.deathEffect?.finished) {
      respawnPlayer();
    }
  };

  document.getElementById('craft-close')?.addEventListener('click', () => toggleCrafting());
  document.getElementById('respawn-btn')?.addEventListener('click', () => respawnPlayer());

  game.renderer = new Renderer(canvas);
  game.renderer.resize();
  window.addEventListener('resize', () => game.renderer.resize());

  loading.classList.add('hidden');
  canvas.focus();

  game.lastTime = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  game.dt = Math.min((now - game.lastTime) / 1000, 0.05);
  game.lastTime = now;

  if (game.player.hp <= 0 && !game.player.dead) {
    triggerDeath();
  }

  if (game.player.dead) {
    game.deathEffect?.update(game.dt);
    if (game.deathEffect?.finished) {
      showGameOver(true);
    }
  } else {
    game.player.update(game.dt, game.world, game.input.keys);
    game.mobs.update(game.dt, game.world, game.player);
    game.input.update(game.dt, game);
  }

  if (!game.mineParticles) game.mineParticles = [];
  updateParticles(game.mineParticles, game.dt, game.world);

  updateHpUI(game.player);
  game.renderer.draw(game);

  requestAnimationFrame(loop);
}

function updateHpUI(player) {
  const fill = document.getElementById('hp-fill');
  const text = document.getElementById('hp-text');
  const pct = Math.max(0, player.hp / player.maxHp);
  if (fill) fill.style.width = `${pct * 100}%`;
  if (text) {
    text.textContent = player.dead
      ? '0 / 100'
      : `${Math.ceil(player.hp)} / ${player.maxHp}`;
  }
}

init();
