import { BLOCK, HOTBAR_SIZE, STACK_SIZE } from './constants.js';
import { TILE_DEFS, BLOCK_ICON } from './tiles.js';
import { assets } from './assets.js';

export class Inventory {
  constructor() {
    this.slots = Array.from({ length: HOTBAR_SIZE }, () => ({
      blockId: null,
      tool: null,
      tier: null,
      icon: null,
      count: 0,
    }));
    this.selected = 0;
  }

  getSelected() {
    return this.slots[this.selected];
  }

  getToolType() {
    const slot = this.getSelected();
    return slot.tool || null;
  }

  getToolTier() {
    const slot = this.getSelected();
    return slot.tier || null;
  }

  getPlaceBlockId() {
    const slot = this.getSelected();
    return slot.blockId;
  }

  getHeldItem() {
    const slot = this.getSelected();

    if (slot.tool) {
      let iconKey = slot.icon;
      if (!iconKey) {
        iconKey = slot.tool === 'bow' ? 'bow' : `${slot.tool}_${slot.tier}`;
      }
      let image = assets.items?.[iconKey];
      if (!image && slot.tier === 'wood' && slot.tool !== 'bow') {
        image = assets.items[`${slot.tool}_bronze`];
      }
      return image ? { image, kind: 'tool', tool: slot.tool } : null;
    }

    if (slot.blockId && slot.count > 0) {
      const iconKey = BLOCK_ICON[slot.blockId] || 'dirt';
      const image = assets.items?.[iconKey];
      return image ? { image, kind: 'block' } : null;
    }

    return null;
  }

  hasEmptySlot() {
    return this.slots.some((s) => !s.blockId && !s.tool);
  }

  countBlock(blockId) {
    return this.slots.reduce(
      (sum, s) => sum + (s.blockId === blockId ? s.count : 0),
      0
    );
  }

  removeBlock(blockId, amount) {
    let left = amount;
    for (const slot of this.slots) {
      if (slot.blockId !== blockId || left <= 0) continue;
      const take = Math.min(slot.count, left);
      slot.count -= take;
      left -= take;
      if (slot.count <= 0) slot.blockId = null;
    }
    this.updateUI();
  }

  select(index) {
    if (index >= 0 && index < HOTBAR_SIZE) {
      this.selected = index;
      this.updateUI();
    }
  }

  scroll(dir) {
    this.selected = (this.selected + dir + HOTBAR_SIZE) % HOTBAR_SIZE;
    this.updateUI();
  }

  addBlock(blockId, amount = 1) {
    for (const slot of this.slots) {
      if (slot.blockId === blockId && slot.count < STACK_SIZE) {
        const add = Math.min(amount, STACK_SIZE - slot.count);
        slot.count += add;
        amount -= add;
        if (amount <= 0) break;
      }
    }
    if (amount > 0) {
      for (const slot of this.slots) {
        if (!slot.blockId && !slot.tool) {
          slot.blockId = blockId;
          slot.count = Math.min(amount, STACK_SIZE);
          amount -= Math.min(amount, STACK_SIZE);
          if (amount <= 0) break;
        }
      }
    }
    this.updateUI();
  }

  addTool({ tool, tier, icon }) {
    for (const slot of this.slots) {
      if (!slot.blockId && !slot.tool) {
        slot.tool = tool;
        slot.tier = tier;
        slot.icon = icon;
        slot.count = 1;
        slot.blockId = null;
        this.updateUI();
        return true;
      }
    }
    return false;
  }

  consumeBlock() {
    const slot = this.getSelected();
    if (!slot.blockId || slot.count <= 0) return false;
    slot.count--;
    if (slot.count <= 0) slot.blockId = null;
    this.updateUI();
    return true;
  }

  updateUI() {
    const hotbar = document.getElementById('hotbar');
    if (!hotbar) return;
    hotbar.innerHTML = '';

    for (let i = 0; i < HOTBAR_SIZE; i++) {
      const slot = this.slots[i];
      const el = document.createElement('div');
      el.className = 'hotbar-slot' + (i === this.selected ? ' active' : '');

      const num = document.createElement('span');
      num.className = 'slot-num';
      num.textContent = i + 1;
      el.appendChild(num);

      if (slot.tool) {
        const img = document.createElement('img');
        const iconKey =
          slot.icon || (slot.tool === 'pick' ? 'pick_iron' : 'axe_iron');
        img.src = assets.items?.[iconKey]?.src || '';
        img.alt = slot.tool;
        el.appendChild(img);
      } else if (slot.blockId) {
        const iconKey = BLOCK_ICON[slot.blockId] || 'dirt';
        const img = document.createElement('img');
        const src = assets.items?.[iconKey]?.src;
        if (src) {
          img.src = src;
          img.alt = TILE_DEFS[slot.blockId]?.name || '';
        }
        el.appendChild(img);
        if (slot.count > 0) {
          const count = document.createElement('span');
          count.className = 'count';
          count.textContent = slot.count;
          el.appendChild(count);
        }
      }

      hotbar.appendChild(el);
    }
  }
}
