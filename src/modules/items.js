/**
 * Equipment, Items, and Blacksmith module
 */

export const ITEM_TEMPLATES = {
  // --- KOPF (HEAD) ---
  cloth_hood: { id: 'cloth_hood', name: 'Stoffkapuze des Lehrlings', slot: 'head', armorType: 'cloth', armor: 3, stats: { intellect: 2, stamina: 1 }, cost: 20 },
  heavy_helm: { id: 'heavy_helm', name: 'Kettenhaube des Rekruten', slot: 'head', armorType: 'heavy', armor: 8, stats: { strength: 1, stamina: 2 }, cost: 35 },
  plate_helm: { id: 'plate_helm', name: 'Plattenhelm des Ritters', slot: 'head', armorType: 'plate', armor: 15, stats: { strength: 3, stamina: 4 }, cost: 65 },

  // --- BRUST (CHEST) ---
  cloth_robe: { id: 'cloth_robe', name: 'Stoffrobe des Adepten', slot: 'chest', armorType: 'cloth', armor: 6, stats: { intellect: 4, stamina: 2 }, cost: 40 },
  heavy_chest: { id: 'heavy_chest', name: 'Kettenhemd der Wache', slot: 'chest', armorType: 'heavy', armor: 18, stats: { strength: 3, stamina: 5 }, cost: 70 },
  plate_chest: { id: 'plate_chest', name: 'Stahlbrustplatte des Kommandanten', slot: 'chest', armorType: 'plate', armor: 32, stats: { strength: 6, stamina: 8 }, cost: 120 },

  // --- HÄNDE (HANDS) ---
  cloth_gloves: { id: 'cloth_gloves', name: 'Stoffhandschuhe des Magus', slot: 'hands', armorType: 'cloth', armor: 2, stats: { intellect: 2, agility: 1 }, cost: 15 },
  heavy_gloves: { id: 'heavy_gloves', name: 'Kettenhandschuhe des Soldaten', slot: 'hands', armorType: 'heavy', armor: 6, stats: { strength: 2, stamina: 1 }, cost: 25 },
  plate_gloves: { id: 'plate_gloves', name: 'Plattenhandschuhe des Champions', slot: 'hands', armorType: 'plate', armor: 12, stats: { strength: 4, stamina: 3 }, cost: 50 },

  // --- BEINE (LEGS) ---
  cloth_trousers: { id: 'cloth_trousers', name: 'Stoffhose des Gelehrten', slot: 'legs', armorType: 'cloth', armor: 4, stats: { intellect: 3, stamina: 2 }, cost: 30 },
  heavy_trousers: { id: 'heavy_trousers', name: 'Kettenbeinschützer', slot: 'legs', armorType: 'heavy', armor: 12, stats: { strength: 2, stamina: 4 }, cost: 55 },
  plate_trousers: { id: 'plate_trousers', name: 'Plattenbeinschienen des Paladins', slot: 'legs', armorType: 'plate', armor: 22, stats: { strength: 5, stamina: 6 }, cost: 95 },

  // --- FÜSSE (FEET) ---
  cloth_boots: { id: 'cloth_boots', name: 'Stoffstiefel des Wanderers', slot: 'feet', armorType: 'cloth', armor: 2, stats: { agility: 2, intellect: 1 }, cost: 15 },
  heavy_boots: { id: 'heavy_boots', name: 'Kettenstiefel des Milizionärs', slot: 'feet', armorType: 'heavy', armor: 5, stats: { strength: 1, stamina: 2 }, cost: 25 },
  plate_boots: { id: 'plate_boots', name: 'Plattenschuhe des Zerstörers', slot: 'feet', armorType: 'plate', armor: 10, stats: { strength: 3, stamina: 3 }, cost: 45 },

  // --- HAUPTHAND (MAIN HAND) ---
  dagger: { id: 'dagger', name: 'Stahldolch', slot: 'mainHand', armorType: 'none', damage: 6, stats: { agility: 2 }, cost: 25 },
  sword_1h: { id: 'sword_1h', name: 'Einhändiges Kurzschwert', slot: 'mainHand', armorType: 'none', damage: 10, stats: { strength: 2 }, cost: 40 },
  sword_2h: { id: 'sword_2h', name: 'Zweihändiges Großschwert', slot: 'mainHand', armorType: 'none', damage: 22, stats: { strength: 5, stamina: 3 }, cost: 90 },
  spell_staff: { id: 'spell_staff', name: 'Eibenholzstab des Lehrlings', slot: 'mainHand', armorType: 'none', damage: 5, stats: { intellect: 4 }, spellPower: 10, cost: 50 },

  // --- NEBENHAND (OFF HAND) ---
  wooden_shield: { id: 'wooden_shield', name: 'Holzschild des Knappen', slot: 'offHand', armorType: 'none', armor: 15, stats: { stamina: 3 }, cost: 30 },
  steel_shield: { id: 'steel_shield', name: 'Stahlschild des Kreuzfahrers', slot: 'offHand', armorType: 'none', armor: 35, stats: { strength: 2, stamina: 6 }, cost: 80 },
  off_sword: { id: 'off_sword', name: 'Kurzschwert für die Schildhand', slot: 'offHand', armorType: 'none', damage: 8, stats: { strength: 1, agility: 1 }, cost: 45 },
  magical_orb: { id: 'magical_orb', name: 'Kristallkugel des Fokus', slot: 'offHand', armorType: 'none', stats: { intellect: 3 }, spellPower: 12, cost: 40 },
  holy_relic: { id: 'holy_relic', name: 'Heiliges Buch des Gebets', slot: 'offHand', armorType: 'none', stats: { intellect: 2 }, spellPower: 8, healPower: 15, cost: 40 },

  // ── TIER 2 WAFFEN ───────────────────────────────────────────────────────────
  battle_axe:    { id: 'battle_axe',    name: 'Kampfaxt des Ork-Brechers',       slot: 'mainHand', armorType: 'none', damage: 20, stats: { strength: 4, stamina: 2 }, cost: 85 },
  war_mace:      { id: 'war_mace',      name: 'Kriegskeule des Templers',         slot: 'mainHand', armorType: 'none', damage: 16, stats: { strength: 3, stamina: 3 }, cost: 75 },
  elven_bow:     { id: 'elven_bow',     name: 'Elfenbogen des Waldläufers',       slot: 'mainHand', armorType: 'none', damage: 15, stats: { agility: 5, intellect: 1 }, cost: 80 },
  arcane_staff:  { id: 'arcane_staff',  name: 'Arkaner Stab des Weisen',          slot: 'mainHand', armorType: 'none', damage: 7,  stats: { intellect: 7 }, spellPower: 22, cost: 110 },
  dark_tome:     { id: 'dark_tome',     name: 'Schattentom des Nekromanten',      slot: 'offHand',  armorType: 'none', stats: { intellect: 5 }, spellPower: 20, cost: 90 },
  tower_shield:  { id: 'tower_shield',  name: 'Turmschild des Unerschütterlichen',slot: 'offHand',  armorType: 'none', armor: 50, stats: { stamina: 8, strength: 2 }, cost: 130 },

  // ── TIER 2 RÜSTUNGEN ────────────────────────────────────────────────────────
  plate_helm_t2:      { id: 'plate_helm_t2',      name: 'Kronenhelm des Kriegsherrn',       slot: 'head',  armorType: 'plate', armor: 22, stats: { strength: 5, stamina: 6 }, cost: 110 },
  heavy_chest_t2:     { id: 'heavy_chest_t2',     name: 'Kettenhemd des Kriegers',           slot: 'chest', armorType: 'heavy', armor: 28, stats: { strength: 5, stamina: 8 }, cost: 135 },
  cloth_robe_arcane:  { id: 'cloth_robe_arcane',  name: 'Arkane Robe des Hohen Magiers',    slot: 'chest', armorType: 'cloth', armor: 12, stats: { intellect: 8, stamina: 3 }, cost: 130 },
  sorcerer_gloves:    { id: 'sorcerer_gloves',    name: 'Zaubererhandschuhe des Fokus',     slot: 'hands', armorType: 'cloth', armor: 3,  stats: { intellect: 4, agility: 2 }, spellPower: 6, cost: 60 },
  heavy_trousers_t2:  { id: 'heavy_trousers_t2',  name: 'Kettenbeinhosen des Veteranen',    slot: 'legs',  armorType: 'heavy', armor: 20, stats: { strength: 4, stamina: 6 }, cost: 105 },
  plate_boots_t2:     { id: 'plate_boots_t2',     name: 'Platinstiefel des Hüters',         slot: 'feet',  armorType: 'plate', armor: 16, stats: { strength: 4, stamina: 5 }, cost: 90 }
};

// Generiert ein neues Item-Objekt aus dem Template (erlaubt Instanziierung für Upgrades)
export function createItem(templateId) {
  const tpl = ITEM_TEMPLATES[templateId];
  if (!tpl) return null;
  return {
    ...tpl,
    uniqueId: `${tpl.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    upgradeLevel: 0,
    stats: tpl.stats ? { ...tpl.stats } : {},
    damage: tpl.damage || 0,
    armor: tpl.armor || 0,
    spellPower: tpl.spellPower || 0,
    healPower: tpl.healPower || 0
  };
}

// Prüft, ob ein Charakter ein bestimmtes Item ausrüsten darf
export function canEquipItem(character, item) {
  // 1. Rüstungsklassen-Prüfung
  if (item.armorType !== 'none') {
    if (item.armorType === 'plate' || item.armorType === 'heavy') {
      if (character.classKey !== 'KRIEGER' && character.classKey !== 'PALADIN') {
        return { allowed: false, reason: 'Deine Klasse kann keine Schwere Rüstung oder Platte tragen!' };
      }
    }
    if (item.armorType === 'cloth') {
      if (character.classKey !== 'MAGIER' && character.classKey !== 'PRIESTER') {
        return { allowed: false, reason: 'Diese Stoffrüstung ist nur für Magier und Priester gedacht!' };
      }
    }
  }

  // 2. Slot-spezifische Prüfung (OffHand)
  if (item.slot === 'offHand') {
    // Krieger / Paladin können Schilde oder Einhandwaffen (Krieger-Furor) in die OffHand nehmen
    if (item.id.includes('shield')) {
      if (character.classKey !== 'KRIEGER' && character.classKey !== 'PALADIN') {
        return { allowed: false, reason: 'Schilde können nur von Kriegern und Paladinen getragen werden!' };
      }
    }
    if (item.id === 'off_sword') {
      if (character.classKey !== 'KRIEGER' || character.specKey !== 'FUROR') {
        return { allowed: false, reason: 'Nur Krieger mit der Spezialisierung Furor können eine zweite Waffe in der Nebenhand tragen!' };
      }
    }
    // Relikte und Fokusse nur für Magier und Priester
    if (item.id === 'magical_orb' || item.id === 'holy_relic' || item.id === 'dark_tome') {
      if (character.classKey !== 'MAGIER' && character.classKey !== 'PRIESTER') {
        return { allowed: false, reason: 'Relikte und Zauberfokusse können nur von Magiern und Priestern getragen werden!' };
      }
    }
  }

  // 3. Zweihandwaffen-Prüfung
  if (item.id === 'sword_2h') {
    // Wenn Zweihänder ausgerüstet wird, darf nichts in der Schildhand sein (bzw. wird abgelegt)
    // Außer bei bestimmten Klassen, aber hier halten wir es klassisch: Zweihänder blockiert OffHand.
    // Furor Krieger nutzt typischerweise zwei Einhänder.
  }

  return { allowed: true };
}

// Rüstet ein Item aus
export function equipItem(character, itemUniqueId) {
  const itemIndex = character.inventory.findIndex(i => i.uniqueId === itemUniqueId);
  if (itemIndex === -1) return { error: 'Gegenstand nicht im Inventar!' };

  const item = character.inventory[itemIndex];
  const validation = canEquipItem(character, item);
  if (!validation.allowed) return { error: validation.reason };

  // Falls es eine Zweihandwaffe ist, legen wir die Schildhand ab
  if (item.id === 'sword_2h') {
    if (character.equipment.offHand) {
      unequipItem(character, 'offHand');
    }
  }
  // Falls wir etwas in die Schildhand legen wollen, aber eine Zweihandwaffe tragen, legen wir die Haupthand ab
  if (item.slot === 'offHand' && character.equipment.mainHand && character.equipment.mainHand.id === 'sword_2h') {
    unequipItem(character, 'mainHand');
  }

  // Bereits ausgerüstetes Item in diesem Slot ablegen
  if (character.equipment[item.slot]) {
    unequipItem(character, item.slot);
  }

  // Item ausrüsten und aus dem Inventar entfernen
  character.equipment[item.slot] = item;
  character.inventory.splice(itemIndex, 1);

  character.resetStats();
  return { success: true };
}

// Legt ein Item ab
export function unequipItem(character, slot) {
  const item = character.equipment[slot];
  if (!item) return { error: 'Dieser Slot ist bereits leer!' };

  character.equipment[slot] = null;
  character.inventory.push(item);
  character.resetStats();

  return { success: true };
}

// Schmied-Upgrades für Waffen und Rüstung
export function getUpgradeCost(item) {
  // Kostet: Basispreis * (UpgradeLevel + 1) * 0.8
  return Math.round(item.cost * (item.upgradeLevel + 1) * 0.8);
}

export function upgradeItem(character, itemUniqueId) {
  // Suchen im Inventar oder in der Ausrüstung
  let item = null;
  let inEquip = false;
  let equipSlot = '';

  for (const slot in character.equipment) {
    if (character.equipment[slot] && character.equipment[slot].uniqueId === itemUniqueId) {
      item = character.equipment[slot];
      inEquip = true;
      equipSlot = slot;
      break;
    }
  }

  if (!item) {
    item = character.inventory.find(i => i.uniqueId === itemUniqueId);
  }

  if (!item) return { error: 'Gegenstand nicht gefunden!' };

  const cost = getUpgradeCost(item);
  if (character.gold < cost) return { error: 'Nicht genug Gold für dieses Upgrade!' };

  character.gold -= cost;
  item.upgradeLevel++;

  // Stat-Steigerungen
  if (item.damage) item.damage = Math.round(item.damage * 1.25);
  if (item.armor) item.armor = Math.round(item.armor * 1.25);
  if (item.spellPower) item.spellPower = Math.round(item.spellPower * 1.25);
  if (item.healPower) item.healPower = Math.round(item.healPower * 1.25);

  if (item.stats) {
    for (const stat in item.stats) {
      item.stats[stat] = Math.round(item.stats[stat] * 1.25 + 1);
    }
  }

  // Name aktualisieren
  const baseName = ITEM_TEMPLATES[item.id].name;
  item.name = `${baseName} (+${item.upgradeLevel})`;

  character.resetStats();
  return { success: true, item };
}

// Starter-Ausrüstung je nach Klasse generieren
export function getStarterEquipment(classKey) {
  const equip = {
    head: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
    mainHand: null,
    offHand: null
  };

  if (classKey === 'KRIEGER') {
    equip.mainHand = createItem('sword_1h');
    equip.offHand = createItem('wooden_shield');
    equip.chest = createItem('heavy_chest');
    equip.feet = createItem('heavy_boots');
  } else if (classKey === 'PALADIN') {
    equip.mainHand = createItem('sword_1h');
    equip.offHand = createItem('wooden_shield');
    equip.chest = createItem('heavy_chest');
    equip.feet = createItem('heavy_boots');
  } else if (classKey === 'MAGIER') {
    equip.mainHand = createItem('spell_staff');
    equip.chest = createItem('cloth_robe');
    equip.feet = createItem('cloth_boots');
  } else if (classKey === 'PRIESTER') {
    equip.mainHand = createItem('dagger');
    equip.offHand = createItem('holy_relic');
    equip.chest = createItem('cloth_robe');
    equip.feet = createItem('cloth_boots');
  }

  return equip;
}
