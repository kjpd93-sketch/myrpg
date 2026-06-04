/**
 * Village logic, Merchants, Inn, and Market module
 */

import { createItem, ITEM_TEMPLATES } from './items.js';

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
    description: 'Heilt den Anwender sofort um 50 Lebenspunkte. Kann im Kampf genutzt werden.'
  },
  {
    id: 'potion_mana',
    name: 'Schwacher Manatrank',
    type: 'consumable',
    effectType: 'mana',
    value: 60,
    cost: 15,
    description: 'Stellt sofort 60 Mana wieder her. Kann im Kampf genutzt werden.'
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
        c.bonusStats.strength = (c.bonusStats.strength || 0) + 5;
        c.bonusStats.intellect = (c.bonusStats.intellect || 0) + 5;
      },
      text: 'Stärke & Intelligenz um 5 erhöht.'
    },
    cost: 30,
    description: 'Erhöht Stärke und Intelligenz für 5 Runden im Kampf um 5.'
  }
];

// Listet Gegenstände auf, die der Schmied aktuell verkauft (basierend auf Klasse)
export function getBlacksmithInventory(character) {
  const inventory = [];
  const templates = Object.values(ITEM_TEMPLATES);

  templates.forEach(tpl => {
    // Schließe unpassende Gegenstände aus
    let suitable = true;
    
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
      if ((tpl.id === 'magical_orb' || tpl.id === 'holy_relic') && (character.classKey !== 'MAGIER' && character.classKey !== 'PRIESTER')) {
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
export function buyMarketItem(character, itemId) {
  const item = MARKET_ITEMS.find(i => i.id === itemId);
  if (!item) return { error: 'Gegenstand existiert nicht!' };

  if (character.gold < item.cost) {
    return { error: 'Du hast nicht genug Gold!' };
  }

  character.gold -= item.cost;
  character.inventory.push({
    ...item,
    uniqueId: `${item.id}_${Date.now()}`
  });

  return { success: true };
}

// Führt Kauf einer Rüstung/Waffe beim Schmied aus
export function buyBlacksmithItem(character, templateId) {
  const tpl = ITEM_TEMPLATES[templateId];
  if (!tpl) return { error: 'Gegenstand existiert nicht!' };

  if (character.gold < tpl.cost) {
    return { error: 'Du hast nicht genug Gold!' };
  }

  character.gold -= tpl.cost;
  const item = createItem(templateId);
  character.inventory.push(item);

  return { success: true, item };
}

// Verkauft einen Gegenstand aus dem Inventar (gibt 40% des Kaufpreises zurück)
export function sellInventoryItem(character, itemUniqueId) {
  const index = character.inventory.findIndex(i => i.uniqueId === itemUniqueId);
  if (index === -1) return { error: 'Gegenstand nicht im Inventar!' };

  const item = character.inventory[index];
  let sellPrice = Math.round(item.cost * 0.40);
  if (item.upgradeLevel > 0) {
    sellPrice += Math.round(item.cost * item.upgradeLevel * 0.20); // Bonus für Upgrades
  }

  character.gold += sellPrice;
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
