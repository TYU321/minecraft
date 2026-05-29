import { loadAssets } from './assets.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Inventory } from './inventory.js';
import { Input } from './input.js';
import { Renderer } from './render.js';
import { initCraftingUI, toggleCrafting, refreshCraftingUI } from './craftingUI.js';
import { MobManager } from './mobs.js';

const canvas = document.getElementById('game');
const loading = document.getElementById('loading');

const game = {
  world: null,
  player: null,
  inventory: null,
  input: null,
  renderer: null,
  camera: { x: 0, y: 0 },
  hoverTile: null,
  mineParticles: [],
  dt: 0,
  lastTime: 0,
};

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
  game.input.onToggleCraft = () => toggleCrafting();
  document.getElementById('craft-close')?.addEventListener('click', () => toggleCrafting());

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

  game.player.update(game.dt, game.world, game.input.keys);
  game.mobs.update(game.dt, game.world, game.player);
  game.input.update(game.dt, game);

  game.mineParticles = game.mineParticles.filter((p) => {
    p.life -= game.dt;
    return p.life > 0;
  });

  updateHpUI(game.player);
  game.renderer.draw(game);

  requestAnimationFrame(loop);
}

function updateHpUI(player) {
  const fill = document.getElementById('hp-fill');
  const text = document.getElementById('hp-text');
  if (fill) fill.style.width = `${(player.hp / player.maxHp) * 100}%`;
  if (text) text.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
}

init();
