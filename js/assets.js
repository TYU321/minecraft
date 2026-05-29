import { TILE_SIZE } from './constants.js';

const BASE = 'Assets';

const ITEM_FILES = [
  'pick_bronze', 'pick_iron', 'pick_silver', 'pick_gold', 'pick_diamond',
  'axe_bronze', 'axe_iron', 'axe_silver', 'axe_gold', 'axe_diamond',
  'shovel_bronze', 'shovel_iron', 'shovel_silver', 'shovel_gold', 'shovel_diamond',
  'hoe_bronze', 'hoe_iron', 'hoe_silver', 'hoe_gold', 'hoe_diamond',
  'hammer_bronze', 'hammer_iron', 'hammer_silver', 'hammer_gold', 'hammer_diamond',
  'sword_bronze', 'sword_iron', 'sword_silver', 'sword_gold', 'sword_diamond',
  'flail_bronze', 'flail_iron', 'flail_silver', 'flail_gold', 'flail_diamond',
  'bow', 'bowArrow', 'arrow',
  'ore_coal', 'ore_iron', 'ore_silver', 'ore_gold', 'ore_emerald', 'ore_ruby', 'ore_diamond',
];

const TILE_ICONS = [
  'dirt', 'stone', 'sand', 'wood', 'grass_top', 'leaves', 'snow',
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

async function parseAtlas(xmlPath) {
  const res = await fetch(xmlPath);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const atlas = {};
  for (const sub of doc.querySelectorAll('SubTexture')) {
    const name = sub.getAttribute('name').replace('.png', '');
    atlas[name] = {
      x: +sub.getAttribute('x'),
      y: +sub.getAttribute('y'),
      w: +sub.getAttribute('width'),
      h: +sub.getAttribute('height'),
    };
  }
  return atlas;
}

export const assets = {
  tilesSheet: null,
  tileAtlas: {},
  charsSheet: null,
  charAtlas: {},
  player: {},
  items: {},
  sky: {},
  clouds: null,
  moon: null,
};

export async function loadAssets() {
  const [tilesSheet, tileAtlas, charsSheet, charAtlas, clouds, moon, skyTop, skyBottom] =
    await Promise.all([
      loadImage(`${BASE}/Spritesheets/spritesheet_tiles.png`),
      parseAtlas(`${BASE}/Spritesheets/spritesheet_tiles.xml`),
      loadImage(`${BASE}/Spritesheets/spritesheet_characters.png`),
      parseAtlas(`${BASE}/Spritesheets/spritesheet_characters.xml`),
      loadImage(`${BASE}/PNG/Other/clouds.png`),
      loadImage(`${BASE}/PNG/Other/moon.png`),
      loadImage(`${BASE}/PNG/Other/skybox_top.png`),
      loadImage(`${BASE}/PNG/Other/skybox_bottom.png`),
    ]);

  assets.tilesSheet = tilesSheet;
  assets.tileAtlas = tileAtlas;
  assets.charsSheet = charsSheet;
  assets.charAtlas = charAtlas;
  assets.clouds = clouds;
  assets.moon = moon;
  assets.sky.top = skyTop;
  assets.sky.bottom = skyBottom;

  const playerParts = ['male_body', 'male_head', 'male_leg', 'male_arm'];
  for (const part of playerParts) {
    assets.player[part] = await loadImage(
      `${BASE}/PNG/Characters/Player male/${part}.png`
    );
  }

  for (const name of ITEM_FILES) {
    assets.items[name] = await loadImage(`${BASE}/PNG/Items/${name}.png`);
  }

  assets.items.wood = await loadImage(`${BASE}/PNG/Tiles/trunk_side.png`);

  for (const name of TILE_ICONS) {
    if (!assets.items[name]) {
      assets.items[name] = await loadImage(`${BASE}/PNG/Tiles/${name}.png`);
    }
  }
}

export function drawTile(ctx, textureKey, screenX, screenY) {
  const frame = assets.tileAtlas[textureKey];
  if (!frame || !assets.tilesSheet) return;
  ctx.drawImage(
    assets.tilesSheet,
    frame.x, frame.y, frame.w, frame.h,
    screenX, screenY, TILE_SIZE, TILE_SIZE
  );
}

export function drawCharPart(ctx, partKey, dx, dy, scale) {
  const frame = assets.charAtlas[partKey];
  if (!frame || !assets.charsSheet) return;
  const s = scale * 0.28;
  const w = frame.w * s;
  const h = frame.h * s;
  ctx.drawImage(
    assets.charsSheet,
    frame.x, frame.y, frame.w, frame.h,
    dx, dy, w, h
  );
}
