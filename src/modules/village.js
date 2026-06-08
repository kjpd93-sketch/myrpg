/**
 * Village logic, Merchants, Inn, and Market module
 */

import { createItem, ITEM_TEMPLATES } from './items.js';
import { getReputation, getReputationTier } from './story.js';

/** Ruf-basierter Preismodifikator für einen NPC (negativ = günstiger) */
function repPriceMod(player, npcId) {
  return getReputationTier(getReputation(player, npcId)).priceMod || 0;
}

// ═══════════════════════════════════════════════════════════════════════════
//  DORF-GEBÄUDE & META-PROGRESSION
//  Spieler kann Gebäude mit Gold aufwerten → dauerhafte Vorteile.
//  buildings-Stufen liegen auf player.buildings = { inn, market, blacksmith }
// ═══════════════════════════════════════════════════════════════════════════
export const BUILDINGS = {
  inn: {
    id: 'inn', name: 'Gasthaus', icon: '🍺', maxLevel: 5,
    desc: 'Günstigere Rast und stärkere Regeneration nach dem Schlafen.',
    // Effekt pro Stufe: -10% Rastkosten & +5% Regen pro Stufe über 1
    effect: (lvl) => ({ restDiscount: (lvl - 1) * 0.10, regenBonus: (lvl - 1) * 0.05 }),
    benefitText: (lvl) => lvl <= 1
      ? 'Standard-Rast.'
      : `−${(lvl - 1) * 10}% Rastkosten · +${(lvl - 1) * 5}% Regeneration`
  },
  market: {
    id: 'market', name: 'Marktplatz', icon: '⚖️', maxLevel: 5,
    desc: 'Günstigere Tränke und bessere Verkaufspreise für Beute.',
    effect: (lvl) => ({ buyDiscount: (lvl - 1) * 0.08, sellBonus: (lvl - 1) * 0.07 }),
    benefitText: (lvl) => lvl <= 1
      ? 'Standard-Preise.'
      : `−${(lvl - 1) * 8}% Trankpreise · +${(lvl - 1) * 7}% Verkaufswert`
  },
  blacksmith: {
    id: 'blacksmith', name: 'Schmiede', icon: '🔨', maxLevel: 5,
    desc: 'Günstigere Ausrüstung und billigere Aufwertungen.',
    effect: (lvl) => ({ buyDiscount: (lvl - 1) * 0.08, upgradeDiscount: (lvl - 1) * 0.10 }),
    benefitText: (lvl) => lvl <= 1
      ? 'Standard-Preise.'
      : `−${(lvl - 1) * 8}% Ausrüstungspreise · −${(lvl - 1) * 10}% Aufwertungskosten`
  }
};

/** Aktuelle Stufe eines Gebäudes (Default 1) */
export function getBuildingLevel(player, id) {
  return (player && player.buildings && player.buildings[id]) || 1;
}

/** Effekt-Objekt eines Gebäudes für den aktuellen Spielerstand */
export function getBuildingEffect(player, id) {
  const def = BUILDINGS[id];
  if (!def) return {};
  return def.effect(getBuildingLevel(player, id));
}

/** Kosten um ein Gebäude von der aktuellen Stufe auf die nächste zu bringen */
export function getBuildingUpgradeCost(currentLevel) {
  return Math.round(200 * Math.pow(1.85, currentLevel - 1));
}

/** Wertet ein Gebäude auf (zieht Gold vom Spieler ab) */
export function upgradeBuilding(player, id) {
  const def = BUILDINGS[id];
  if (!def) return { error: 'Unbekanntes Gebäude.' };
  const lvl = getBuildingLevel(player, id);
  if (lvl >= def.maxLevel) return { error: 'Maximale Stufe bereits erreicht!' };
  const cost = getBuildingUpgradeCost(lvl);
  if (player.gold < cost) return { error: 'Nicht genug Gold!' };
  player.gold -= cost;
  player.buildings = player.buildings || {};
  player.buildings[id] = lvl + 1;
  return { success: true, newLevel: lvl + 1, cost };
}

/** Effektiver Trankpreis am Markt (Gebäude-Rabatt + Ruf beim Händler Rufus) */
export function getMarketBuyPrice(baseCost, player) {
  const e = getBuildingEffect(player, 'market');
  const factor = (1 - (e.buyDiscount || 0)) * (1 + repPriceMod(player, 'haendler'));
  return Math.max(1, Math.round(baseCost * factor));
}
/** Effektiver Ausrüstungspreis beim Schmied (Gebäude-Rabatt + Ruf bei Grimjaw) */
export function getSmithBuyPrice(baseCost, player) {
  const e = getBuildingEffect(player, 'blacksmith');
  const factor = (1 - (e.buyDiscount || 0)) * (1 + repPriceMod(player, 'schmied'));
  return Math.max(1, Math.round(baseCost * factor));
}

export const INN_OPTIONS = [
  { id: 'inn_cheap', name: 'Stroh-Lager im Gemeinschaftssaal', cost: 10, regen: 0.30, description: 'Einfaches Bett auf Stroh. Regeneriert 30% Leben und Mana.' },
  { id: 'inn_medium', name: 'Gemütliches Einzelzimmer', cost: 25, regen: 0.60, description: 'Ein sauberes Bett und ein warmes Kaminfeuer. Regeneriert 60% Leben und Mana.' },
  { id: 'inn_luxury', name: 'Kaiserliche Luxus-Suite', cost: 50, regen: 1.00, description: 'Feinste Daunenbetten und reichhaltiges Frühstück. Regeneriert 100% Leben und Mana.' }
];
export const MARKET_ITEMS = [
  {
    id: 'potion_heal',
    name: 'Schwacher Heiltrank',
    type: 'consumable',
    effectType: 'heal',
    value: 50,
    cost: 15,
    description: 'Heilt den Anwender sofort um 50 Lebenspunkte. Kann im Kampf genutzt werden.',
    icon: 'assets/images/items/icon_potion_heal.png'
  },
  {
    id: 'antitoxin',
    name: 'Antitoxin',
    type: 'consumable',
    effectType: 'antitoxin',
    value: 30,
    cost: 25,
    description: 'Neutralisiert alle Gift- und DoT-Effekte und heilt 30 Leben. Im Kampf nutzbar.',
    icon: 'assets/images/items/icon_potion_heal.png'
  },
  {
    id: 'potion_mana',
    name: 'Schwacher Manatrank',
    type: 'consumable',
    effectType: 'mana',
    value: 60,
    cost: 15,
    description: 'Stellt sofort 60 Mana wieder her. Kann im Kampf genutzt werden.',
    icon: 'assets/images/items/icon_potion_mana.png'
  },
  {
    id: 'elixir_might',
    name: 'Elixier der Macht',
    type: 'consumable',
    effectType: 'buff',
    buff: {
      name: 'Macht-Elixier',
      duration: 5,
      effect: (c) => {
        c.stats.strength  = (c.stats.strength  || 0) + 5;
        c.stats.intellect = (c.stats.intellect || 0) + 5;
      },
      text: 'Stärke & Intelligenz um 5 erhöht.'
    },
    cost: 30,
    description: 'Erhöht Stärke und Intelligenz für 5 Runden im Kampf um 5.',
    icon: 'assets/images/items/icon_potion_elixir.png'
  },
  {
    id: 'potion_heal_strong',
    name: 'Starker Heiltrank',
    type: 'consumable',
    effectType: 'heal',
    value: 120,
    cost: 35,
    description: 'Heilt den Anwender sofort um 120 Lebenspunkte. Kann im Kampf genutzt werden.',
    icon: 'assets/images/items/icon_potion_heal.png'
  },
  {
    id: 'potion_mana_strong',
    name: 'Starker Manatrank',
    type: 'consumable',
    effectType: 'mana',
    value: 120,
    cost: 35,
    description: 'Stellt sofort 120 Mana wieder her. Kann im Kampf genutzt werden.',
    icon: 'assets/images/items/icon_potion_mana.png'
  },
  {
    id: 'elixir_swiftness',
    name: 'Elixier der Schnelligkeit',
    type: 'consumable',
    effectType: 'buff',
    buff: {
      name: 'Flinkheit',
      duration: 5,
      effect: (c) => { c.bonusCritChance = (c.bonusCritChance || 0) + 0.08; },
      text: 'Krit-Chance um 8% erhöht.'
    },
    cost: 28,
    description: 'Erhöht die Krit-Chance für 5 Runden um 8%.',
    icon: 'assets/images/items/icon_potion_elixir.png'
  },
  {
    id: 'scroll_iron_skin',
    name: 'Schriftrolle: Eisenhaut',
    type: 'consumable',
    effectType: 'buff',
    buff: {
      name: 'Eisenhaut',
      duration: 4,
      effect: (c) => {
        c.stats.stamina = (c.stats.stamina || 0) + 8;
        const newMaxHp = Math.round(c.stats.stamina * 11);
        if (newMaxHp > c.maxHp) {
          const diff = newMaxHp - c.maxHp;
          c.maxHp = newMaxHp;
          c.currentHp = Math.min(c.maxHp, c.currentHp + diff);
        }
      },
      text: 'Ausdauer um 8 erhöht (+88 max. LP, mehr Schadensreduktion).'
    },
    cost: 32,
    description: 'Erhöht Ausdauer für 4 Runden um 8. Das gibt ~+88 max. Lebenspunkte.',
    icon: 'assets/images/items/icon_potion_elixir.png'
  },
  {
    id: 'ration',
    name: 'Feldration',
    type: 'consumable',
    effectType: 'ration',
    value: 30,
    cost: 20,
    description: 'Lager aufschlagen im Dungeon. Regeneriert 30% HP der ganzen Gruppe. Nur in leeren Räumen nutzbar.',
    icon: 'assets/images/items/icon_potion_heal.png'
  }
];


// Listet Gegenstände auf, die der Schmied aktuell verkauft (basierend auf Klasse)
export function getBlacksmithInventory(character) {
  const inventory = [];
  const templates = Object.values(ITEM_TEMPLATES);

  templates.forEach(tpl => {
    // Schließe unpassende Gegenstände aus
    let suitable = true;

    // Einzigartige/legendäre Items sind NICHT käuflich (nur Boss-Drops)
    if (tpl.unique) return;

    // Rüstungsausschlüsse
    if (tpl.slot !== 'mainHand' && tpl.slot !== 'offHand') {
      if (tpl.armorType === 'plate' || tpl.armorType === 'heavy') {
        if (character.classKey !== 'KRIEGER' && character.classKey !== 'PALADIN') {
          suitable = false;
        }
      }
      if (tpl.armorType === 'cloth') {
        if (character.classKey !== 'MAGIER' && character.classKey !== 'PRIESTER') {
          suitable = false;
        }
      }
    } else {
      // Waffenausschlüsse
      if (tpl.id.includes('shield') && (character.classKey !== 'KRIEGER' && character.classKey !== 'PALADIN')) {
        suitable = false;
      }
      if (tpl.id === 'off_sword' && (character.classKey !== 'KRIEGER' || character.specKey !== 'FUROR')) {
        suitable = false;
      }
      if ((tpl.id === 'magical_orb' || tpl.id === 'holy_relic' || tpl.id === 'dark_tome') && (character.classKey !== 'MAGIER' && character.classKey !== 'PRIESTER')) {
        suitable = false;
      }
    }

    if (suitable) {
      inventory.push(tpl);
    }
  });

  return inventory;
}

// Führt Kauf einer Ware am Markt aus
// goldOwner: optionaler separater Charakter dessen Gold abgezogen wird (für geteilten Goldpool)
export function buyMarketItem(character, itemId, goldOwner = null) {
  const item = MARKET_ITEMS.find(i => i.id === itemId);
  if (!item) return { error: 'Gegenstand existiert nicht!' };

  const payer = goldOwner || character;
  const price = getMarketBuyPrice(item.cost, payer);
  if (payer.gold < price) {
    return { error: 'Du hast nicht genug Gold!' };
  }

  payer.gold -= price;
  character.inventory.push({
    ...item,
    uniqueId: `${item.id}_${Date.now()}`
  });

  return { success: true };
}

// Führt Kauf einer Rüstung/Waffe beim Schmied aus
export function buyBlacksmithItem(character, templateId, goldOwner = null) {
  const tpl = ITEM_TEMPLATES[templateId];
  if (!tpl) return { error: 'Gegenstand existiert nicht!' };

  const payer = goldOwner || character;
  const price = getSmithBuyPrice(tpl.cost, payer);
  if (payer.gold < price) {
    return { error: 'Du hast nicht genug Gold!' };
  }

  payer.gold -= price;
  const item = createItem(templateId);
  character.inventory.push(item);

  return { success: true, item };
}

// Verkauft einen Gegenstand aus dem Inventar (gibt 40% des Kaufpreises zurück, Gold geht an goldOwner)
export function sellInventoryItem(character, itemUniqueId, goldOwner = null) {
  const index = character.inventory.findIndex(i => i.uniqueId === itemUniqueId);
  if (index === -1) return { error: 'Gegenstand nicht im Inventar!' };

  const item = character.inventory[index];
  const receiverForBonus = goldOwner || character;
  const sellBonus = (getBuildingEffect(receiverForBonus, 'market').sellBonus || 0);
  let sellPrice = Math.round(item.cost * (0.40 + sellBonus));
  if (item.upgradeLevel > 0) {
    sellPrice += Math.round(item.cost * item.upgradeLevel * 0.20);
  }

  const receiver = goldOwner || character;
  receiver.gold += sellPrice;
  character.inventory.splice(index, 1);

  return { success: true, sellPrice };
}

// Verwendet ein Consumable (Heiltrank / Manatrank) im oder außerhalb des Kampfes
export function useConsumable(character, itemUniqueId, isInCombat = false) {
  const index = character.inventory.findIndex(i => i.uniqueId === itemUniqueId);
  if (index === -1) return { error: 'Trank nicht im Inventar!' };

  const item = character.inventory[index];
  if (item.type !== 'consumable') return { error: 'Dies ist kein Verbrauchsgut!' };

  if (item.effectType === 'heal') {
    if (character.currentHp >= character.maxHp) {
      return { error: 'Lebenspunkte sind bereits voll!' };
    }
    const healed = Math.min(character.maxHp - character.currentHp, item.value);
    character.currentHp += healed;
    character.inventory.splice(index, 1);
    return { success: true, text: `Du trinkst '${item.name}' und heilst dich um ${healed} Leben.` };
  } 
  
  if (item.effectType === 'antitoxin') {
    // Entfernt alle schädlichen DoT-Debuffs + kleine Heilung
    const had = (character.debuffs || []).length;
    character.debuffs = (character.debuffs || []).filter(d => !d.dot);
    const cured = had - character.debuffs.length;
    const healed = Math.min(character.maxHp - character.currentHp, item.value || 30);
    character.currentHp += healed;
    character.inventory.splice(index, 1);
    return { success: true, text: `Du trinkst '${item.name}': ${cured > 0 ? `${cured} Gifteffekt(e) neutralisiert, ` : ''}+${healed} Leben.` };
  }

  if (item.effectType === 'mana') {
    const charClass = character.classKey;
    if (charClass === 'KRIEGER') {
      return { error: 'Krieger nutzen kein Mana!' };
    }
    if (character.currentResource >= character.maxResource) {
      return { error: 'Mana ist bereits voll!' };
    }
    const manaRestored = Math.min(character.maxResource - character.currentResource, item.value);
    character.currentResource += manaRestored;
    character.inventory.splice(index, 1);
    return { success: true, text: `Du trinkst '${item.name}' und regenerierst ${manaRestored} Mana.` };
  }

  if (item.effectType === 'buff') {
    if (!isInCombat) {
      return { error: 'Elixiere können nur im Kampf eingenommen werden!' };
    }
    
    character.buffs = character.buffs || [];
    character.buffs.push({
      ...item.buff,
      uniqueId: `${item.id}_buff`
    });

    character.inventory.splice(index, 1);
    character.resetStats();
    return { success: true, text: `Du trinkst '${item.name}'. Deine Werte sind vorübergehend erhöht!` };
  }

  return { error: 'Unbekannter Trank-Effekt.' };
}
