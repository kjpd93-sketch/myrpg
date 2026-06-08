/**
 * Equipment, Items, and Blacksmith module
 */

export const ITEM_TEMPLATES = {
  // --- KOPF (HEAD) ---
  cloth_hood: { id: 'cloth_hood', name: 'Stoffkapuze des Lehrlings', slot: 'head', armorType: 'cloth', armor: 3, stats: { intellect: 2, stamina: 1 }, cost: 20, icon: 'assets/images/items/icon_cloth_hood.png' },
  heavy_helm: { id: 'heavy_helm', name: 'Kettenhaube des Rekruten', slot: 'head', armorType: 'heavy', armor: 8, stats: { strength: 1, stamina: 2 }, cost: 35, icon: 'assets/images/items/icon_heavy_helm.png' },
  plate_helm: { id: 'plate_helm', name: 'Plattenhelm des Ritters', slot: 'head', armorType: 'plate', armor: 15, stats: { strength: 3, stamina: 4 }, cost: 65, icon: 'assets/images/items/icon_plate_helm.png' },

  // --- BRUST (CHEST) ---
  cloth_robe: { id: 'cloth_robe', name: 'Stoffrobe des Adepten', slot: 'chest', armorType: 'cloth', armor: 6, stats: { intellect: 4, stamina: 2 }, cost: 40, icon: 'assets/images/items/icon_cloth_robe.png' },
  heavy_chest: { id: 'heavy_chest', name: 'Kettenhemd der Wache', slot: 'chest', armorType: 'heavy', armor: 18, stats: { strength: 3, stamina: 5 }, cost: 70, icon: 'assets/images/items/icon_plate_chest.png' },
  plate_chest: { id: 'plate_chest', name: 'Stahlbrustplatte des Kommandanten', slot: 'chest', armorType: 'plate', armor: 32, stats: { strength: 6, stamina: 8 }, cost: 120, icon: 'assets/images/items/icon_plate_chest.png' },

  // --- HÄNDE (HANDS) ---
  cloth_gloves: { id: 'cloth_gloves', name: 'Stoffhandschuhe des Magus', slot: 'hands', armorType: 'cloth', armor: 2, stats: { intellect: 2, agility: 1 }, cost: 15, icon: 'assets/images/items/icon_cloth_gloves.png' },
  heavy_gloves: { id: 'heavy_gloves', name: 'Kettenhandschuhe des Soldaten', slot: 'hands', armorType: 'heavy', armor: 6, stats: { strength: 2, stamina: 1 }, cost: 25, icon: 'assets/images/items/icon_heavy_gloves.png' },
  plate_gloves: { id: 'plate_gloves', name: 'Plattenhandschuhe des Champions', slot: 'hands', armorType: 'plate', armor: 12, stats: { strength: 4, stamina: 3 }, cost: 50, icon: 'assets/images/items/icon_plate_gloves.png' },

  // --- BEINE (LEGS) ---
  cloth_trousers: { id: 'cloth_trousers', name: 'Stoffhose des Gelehrten', slot: 'legs', armorType: 'cloth', armor: 4, stats: { intellect: 3, stamina: 2 }, cost: 30, icon: 'assets/images/items/icon_cloth_trousers.png' },
  heavy_trousers: { id: 'heavy_trousers', name: 'Kettenbeinschützer', slot: 'legs', armorType: 'heavy', armor: 12, stats: { strength: 2, stamina: 4 }, cost: 55, icon: 'assets/images/items/icon_heavy_trousers.png' },
  plate_trousers: { id: 'plate_trousers', name: 'Plattenbeinschienen des Paladins', slot: 'legs', armorType: 'plate', armor: 22, stats: { strength: 5, stamina: 6 }, cost: 95, icon: 'assets/images/items/icon_plate_trousers.png' },

  // --- FÜSSE (FEET) ---
  cloth_boots: { id: 'cloth_boots', name: 'Stoffstiefel des Wanderers', slot: 'feet', armorType: 'cloth', armor: 2, stats: { agility: 2, intellect: 1 }, cost: 15, icon: 'assets/images/items/icon_cloth_boots.png' },
  heavy_boots: { id: 'heavy_boots', name: 'Kettenstiefel des Milizionärs', slot: 'feet', armorType: 'heavy', armor: 5, stats: { strength: 1, stamina: 2 }, cost: 25, icon: 'assets/images/items/icon_heavy_boots.png' },
  plate_boots: { id: 'plate_boots', name: 'Plattenschuhe des Zerstörers', slot: 'feet', armorType: 'plate', armor: 10, stats: { strength: 3, stamina: 3 }, cost: 45, icon: 'assets/images/items/icon_plate_boots.png' },

  // --- HAUPTHAND (MAIN HAND) ---
  dagger: { id: 'dagger', name: 'Stahldolch', slot: 'mainHand', armorType: 'none', damage: 6, stats: { agility: 2 }, cost: 25, icon: 'assets/images/items/icon_dagger.png' },
  sword_1h: { id: 'sword_1h', name: 'Einhändiges Kurzschwert', slot: 'mainHand', armorType: 'none', damage: 10, stats: { strength: 2 }, cost: 40, icon: 'assets/images/items/icon_sword_1h.png' },
  sword_2h: { id: 'sword_2h', name: 'Zweihändiges Großschwert', slot: 'mainHand', armorType: 'none', damage: 22, stats: { strength: 5, stamina: 3 }, cost: 90, icon: 'assets/images/items/icon_sword_2h.png' },
  spell_staff: { id: 'spell_staff', name: 'Eibenholzstab des Lehrlings', slot: 'mainHand', armorType: 'none', damage: 5, stats: { intellect: 4 }, spellPower: 10, cost: 50, icon: 'assets/images/items/icon_staff.png' },

  // --- NEBENHAND (OFF HAND) ---
  wooden_shield: { id: 'wooden_shield', name: 'Holzschild des Knappen', slot: 'offHand', armorType: 'none', armor: 15, stats: { stamina: 3 }, cost: 30, icon: 'assets/images/items/icon_shield.png' },
  steel_shield: { id: 'steel_shield', name: 'Stahlschild des Kreuzfahrers', slot: 'offHand', armorType: 'none', armor: 35, stats: { strength: 2, stamina: 6 }, cost: 80, icon: 'assets/images/items/icon_shield.png' },
  off_sword: { id: 'off_sword', name: 'Kurzschwert für die Schildhand', slot: 'offHand', armorType: 'none', damage: 8, stats: { strength: 1, agility: 1 }, cost: 45, icon: 'assets/images/items/icon_sword_1h.png' },
  magical_orb: { id: 'magical_orb', name: 'Kristallkugel des Fokus', slot: 'offHand', armorType: 'none', stats: { intellect: 3 }, spellPower: 12, cost: 40, icon: 'assets/images/items/icon_orb.png' },
  holy_relic: { id: 'holy_relic', name: 'Heiliges Buch des Gebets', slot: 'offHand', armorType: 'none', stats: { intellect: 2 }, spellPower: 8, healPower: 15, cost: 40, icon: 'assets/images/items/icon_relic.png' },

  // ── TIER 2 WAFFEN ───────────────────────────────────────────────────────────
  battle_axe:    { id: 'battle_axe',    name: 'Kampfaxt des Ork-Brechers',       slot: 'mainHand', armorType: 'none', damage: 20, stats: { strength: 4, stamina: 2 }, cost: 85, icon: 'assets/images/items/icon_battle_axe.png' },
  war_mace:      { id: 'war_mace',      name: 'Kriegskeule des Templers',         slot: 'mainHand', armorType: 'none', damage: 16, stats: { strength: 3, stamina: 3 }, cost: 75, icon: 'assets/images/items/icon_mace.png' },
  elven_bow:     { id: 'elven_bow',     name: 'Elfenbogen des Waldläufers',       slot: 'mainHand', armorType: 'none', damage: 15, stats: { agility: 5, intellect: 1 }, cost: 80, icon: 'assets/images/items/icon_sword_1h.png' },
  arcane_staff:  { id: 'arcane_staff',  name: 'Arkaner Stab des Weisen',          slot: 'mainHand', armorType: 'none', damage: 7,  stats: { intellect: 7 }, spellPower: 22, cost: 110, icon: 'assets/images/items/icon_arcane_staff.png', setId: 'hochmagier' },
  dark_tome:     { id: 'dark_tome',     name: 'Schattentom des Nekromanten',      slot: 'offHand',  armorType: 'none', stats: { intellect: 5 }, spellPower: 20, cost: 90, icon: 'assets/images/items/icon_tome.png', setId: 'hochmagier' },
  tower_shield:  { id: 'tower_shield',  name: 'Turmschild des Unerschütterlichen',slot: 'offHand',  armorType: 'none', armor: 50, stats: { stamina: 8, strength: 2 }, cost: 130, icon: 'assets/images/items/icon_tower_shield.png' },

  // ── TIER 2 RÜSTUNGEN ────────────────────────────────────────────────────────
  plate_helm_t2:      { id: 'plate_helm_t2',      name: 'Kronenhelm des Kriegsherrn',       slot: 'head',  armorType: 'plate', armor: 22, stats: { strength: 5, stamina: 6 }, cost: 110, icon: 'assets/images/items/icon_plate_helm.png', setId: 'kriegsherr' },
  heavy_chest_t2:     { id: 'heavy_chest_t2',     name: 'Kettenhemd des Kriegers',           slot: 'chest', armorType: 'heavy', armor: 28, stats: { strength: 5, stamina: 8 }, cost: 135, icon: 'assets/images/items/icon_plate_chest.png', setId: 'kriegsherr' },
  cloth_robe_arcane:  { id: 'cloth_robe_arcane',  name: 'Arkane Robe des Hohen Magiers',    slot: 'chest', armorType: 'cloth', armor: 12, stats: { intellect: 8, stamina: 3 }, cost: 130, icon: 'assets/images/items/icon_cloth_robe.png', setId: 'hochmagier' },
  sorcerer_gloves:    { id: 'sorcerer_gloves',    name: 'Zaubererhandschuhe des Fokus',     slot: 'hands', armorType: 'cloth', armor: 3,  stats: { intellect: 4, agility: 2 }, spellPower: 6, cost: 60, icon: 'assets/images/items/icon_cloth_gloves.png', setId: 'hochmagier' },
  heavy_trousers_t2:  { id: 'heavy_trousers_t2',  name: 'Kettenbeinhosen des Veteranen',    slot: 'legs',  armorType: 'heavy', armor: 20, stats: { strength: 4, stamina: 6 }, cost: 105, icon: 'assets/images/items/icon_heavy_trousers.png', setId: 'kriegsherr' },
  plate_boots_t2:     { id: 'plate_boots_t2',     name: 'Platinstiefel des Hüters',         slot: 'feet',  armorType: 'plate', armor: 16, stats: { strength: 4, stamina: 5 }, cost: 90, icon: 'assets/images/items/icon_plate_boots.png', setId: 'kriegsherr' },

  // ── EINZIGARTIGE / LEGENDÄRE ITEMS (unique = handgetunt, immer legendär) ────
  // Spezialfelder: lifesteal, thorns (Combat-Procs) · itemEffect(c) (Passiv in resetStats)
  legendary_bloodthirst: {
    id: 'legendary_bloodthirst', unique: true,
    name: 'Durstklinge', slot: 'mainHand', armorType: 'none',
    damage: 32, stats: { strength: 7, agility: 3 }, cost: 600,
    icon: 'assets/images/items/icon_sword_2h.png',
    lifesteal: 0.20,
    procDesc: '🩸 Lebensraub: Heilt 20% des verursachten Schadens.'
  },
  legendary_thornaegis: {
    id: 'legendary_thornaegis', unique: true,
    name: 'Dornenaegis', slot: 'offHand', armorType: 'none',
    armor: 48, stats: { stamina: 9, strength: 3 }, cost: 600,
    icon: 'assets/images/items/icon_tower_shield.png',
    thorns: 0.30,
    procDesc: '🌵 Dornen: Reflektiert 30% des erlittenen Schadens an den Angreifer.'
  },
  legendary_archmage_crown: {
    id: 'legendary_archmage_crown', unique: true,
    name: 'Krone des Erzmagiers', slot: 'head', armorType: 'cloth',
    armor: 10, stats: { intellect: 12, stamina: 4 }, spellPower: 25, cost: 650,
    icon: 'assets/images/items/icon_cloth_hood.png',
    itemEffect: (c) => { c.bonusSpellCrit = (c.bonusSpellCrit || 0) + 0.08; },
    procDesc: '✨ Arkane Brillanz: +8% Zauber-Krit.'
  },
  legendary_titan_heart: {
    id: 'legendary_titan_heart', unique: true,
    name: 'Herz des Titanen', slot: 'chest', armorType: 'plate',
    armor: 38, stats: { stamina: 14, strength: 5 }, cost: 700,
    icon: 'assets/images/items/icon_plate_chest.png',
    itemEffect: (c) => { c.damageTakenMultiplier = (c.damageTakenMultiplier || 1.0) * 0.88; },
    procDesc: '🛡️ Titanenhaut: −12% erlittener Schaden.'
  },
  legendary_warden_seal: {
    id: 'legendary_warden_seal', unique: true,
    name: 'Siegelsplitter des Wächters', slot: 'offHand', armorType: 'none',
    stats: { intellect: 6 }, spellPower: 18, healPower: 20, cost: 750,
    icon: 'assets/images/items/icon_orb.png',
    itemEffect: (c) => { c.manaRegenPassive = (c.manaRegenPassive || 0) + 4; },
    procDesc: '🔵 Wächtersegen: +4 Mana pro Runde.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  AUSRÜSTUNGS-SETS — Boni für das Tragen mehrerer Teile eines Sets
//  apply(c) modifiziert den Charakter NACH der Ausrüstung in resetStats().
// ═══════════════════════════════════════════════════════════════════════════
export const ITEM_SETS = {
  kriegsherr: {
    name: 'Rüstung des Kriegsherrn',
    color: '#0070dd',
    pieces: ['plate_helm_t2', 'heavy_chest_t2', 'heavy_trousers_t2', 'plate_boots_t2'],
    bonuses: {
      2: { desc: '+6 Stärke, +6 Ausdauer', apply: (c) => { c.stats.strength += 6; c.stats.stamina += 6; } },
      4: { desc: '+10% physischer Schaden, +6% Blockchance', apply: (c) => { c.physDmgMultiplier += 0.10; c.bonusBlockChance += 0.06; } }
    }
  },
  hochmagier: {
    name: 'Gewänder des Hochmagiers',
    color: '#a335ee',
    pieces: ['cloth_robe_arcane', 'sorcerer_gloves', 'arcane_staff', 'dark_tome'],
    bonuses: {
      2: { desc: '+8 Intelligenz, +12 Zaubermacht', apply: (c) => { c.stats.intellect += 8; c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + 12; } },
      4: { desc: '+10% Zauber-Krit, +20 Zaubermacht', apply: (c) => { c.bonusSpellCrit = (c.bonusSpellCrit || 0) + 0.10; c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + 20; } }
    }
  }
};

/** Zählt ausgerüstete Set-Teile pro Set und gibt aktive Boni zurück. */
export function getActiveSetBonuses(character) {
  const counts = {};
  for (const slot in character.equipment) {
    const item = character.equipment[slot];
    if (item && item.setId) counts[item.setId] = (counts[item.setId] || 0) + 1;
  }
  const active = [];
  for (const [setId, count] of Object.entries(counts)) {
    const set = ITEM_SETS[setId];
    if (!set) continue;
    for (const threshold of Object.keys(set.bonuses).map(Number).sort((a, b) => a - b)) {
      if (count >= threshold) active.push({ setId, set, threshold, count, bonus: set.bonuses[threshold] });
    }
  }
  return active;
}

// Verbrauchsitems die nicht im ITEM_TEMPLATES stehen (kein Slot/Upgrade)
export const CONSUMABLE_TEMPLATES = {
  ration: {
    id: 'ration', name: 'Feldration', type: 'consumable', effectType: 'ration',
    value: 30, cost: 20,
    description: 'Lager aufschlagen. Regeneriert 30% HP der ganzen Gruppe. Nur in leeren Räumen nutzbar.',
    icon: 'assets/images/items/icon_potion_heal.png'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// RARITY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
export const RARITIES = {
  common:    { id: 'common',    name: 'Gewöhnlich',   color: '#9d9d9d', statMult: 1.0,  dropWeight: 50 },
  uncommon:  { id: 'uncommon',  name: 'Ungewöhnlich', color: '#1eff00', statMult: 1.2,  dropWeight: 30 },
  rare:      { id: 'rare',      name: 'Selten',       color: '#0070dd', statMult: 1.5,  dropWeight: 14 },
  epic:      { id: 'epic',      name: 'Episch',       color: '#a335ee', statMult: 1.9,  dropWeight: 5  },
  legendary: { id: 'legendary', name: 'Legendär',     color: '#ff8000', statMult: 2.5,  dropWeight: 1  }
};

// Suffix-Namen nach Rarität für Flavor
const RARITY_SUFFIXES = {
  uncommon:  ['des Abenteurers', 'der Stärke', 'des Willens', 'der Ausdauer', 'des Mutes'],
  rare:      ['des Champions', 'der Macht', 'des Hüters', 'der Bestimmung', 'des Siegels'],
  epic:      ['des Wächters', 'der Uralten', 'des Abgrunds', 'der Ewigkeit', 'des Schicksals'],
  legendary: ['der Götter', 'des Ersten Wächters', 'von Aethermoor', 'der zerbrochenen Siegel', 'des Chaos']
};

/**
 * Rollt eine Rarität basierend auf Gewichtung + optionalem Luck-Bonus
 */
export function rollRarity(luckBonus = 0) {
  const entries = Object.values(RARITIES);
  // Luck verschiebt Gewichte zugunsten seltener Items
  const weights = entries.map(r => {
    if (r.id === 'common') return Math.max(5, r.dropWeight - luckBonus * 10);
    if (r.id === 'legendary') return r.dropWeight + luckBonus * 2;
    return r.dropWeight + luckBonus * 3;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < entries.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return entries[i].id;
  }
  return 'common';
}

// Generiert ein neues Item-Objekt aus dem Template (erlaubt Instanziierung für Upgrades)
export function createItem(templateId, forcedRarity = null) {
  const tpl = ITEM_TEMPLATES[templateId];
  if (!tpl) return null;

  // Einzigartige (legendäre) Items: handgetunte Werte, KEINE Raritäts-Skalierung
  const isUnique = !!tpl.unique;
  const rarity = isUnique ? 'legendary' : (forcedRarity || (tpl.rarity || 'common'));
  const rarityData = RARITIES[rarity] || RARITIES.common;
  const mult = isUnique ? 1 : rarityData.statMult;

  // Stats mit Rarität skalieren
  const scaledStats = {};
  if (tpl.stats) {
    for (const [key, val] of Object.entries(tpl.stats)) {
      scaledStats[key] = Math.round(val * mult);
    }
  }

  // Name mit Rarität-Suffix (bei uncommon+, aber NICHT bei Uniques — die haben eigene Namen)
  let name = tpl.name;
  if (!isUnique && rarity !== 'common' && RARITY_SUFFIXES[rarity]) {
    const suffixes = RARITY_SUFFIXES[rarity];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    // Nur Suffix anhängen wenn der Name nicht bereits einen hat
    if (!name.includes(' des ') && !name.includes(' der ') && !name.includes(' von ')) {
      name = name + ' ' + suffix;
    }
  }

  return {
    ...tpl,
    name,
    rarity,
    rarityColor: rarityData.color,
    rarityName: rarityData.name,
    uniqueId: `${tpl.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    upgradeLevel: 0,
    stats: scaledStats,
    damage: Math.round((tpl.damage || 0) * mult),
    armor: Math.round((tpl.armor || 0) * mult),
    spellPower: Math.round((tpl.spellPower || 0) * mult),
    healPower: Math.round((tpl.healPower || 0) * mult)
  };
}

/**
 * Generiert zufälliges Dungeon-Loot mit Raritäts-Roll
 */
export function generateDungeonLoot(dungeonLevel = 1, isBoss = false) {
  // Einzigartige Items aus dem Zufallspool ausschließen (nur explizite Drops)
  const templateKeys = Object.keys(ITEM_TEMPLATES).filter(k => !ITEM_TEMPLATES[k].unique);
  const randomKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];

  // Boss = garantiert mindestens rare, Luck-Bonus basierend auf Dungeon-Level
  const luckBonus = (dungeonLevel * 0.3) + (isBoss ? 2 : 0);
  let rarity = rollRarity(luckBonus);

  // Boss garantiert mindestens rare
  if (isBoss && (rarity === 'common' || rarity === 'uncommon')) {
    rarity = 'rare';
  }

  return createItem(randomKey, rarity);
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
export function getUpgradeCost(item, discount = 0) {
  // Kostet: Basispreis * (UpgradeLevel + 1) * 0.8, abzüglich Schmiede-Rabatt
  const base = item.cost * (item.upgradeLevel + 1) * 0.8;
  return Math.max(1, Math.round(base * (1 - discount)));
}

export function upgradeItem(character, itemUniqueId, discount = 0) {
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

  const cost = getUpgradeCost(item, discount);
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
