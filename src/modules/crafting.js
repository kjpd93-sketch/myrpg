/**
 * Crafting-Modul — Materialien & Rezepte
 * Materialien droppen von Gegnern und werden in player.materials (Name → Anzahl) gelagert.
 */

// ─── Material-Katalog ───────────────────────────────────────────────────────
export const MATERIALS = {
  'Spinnenbein':     { name: 'Spinnenbein',     icon: '🦴', tier: 1, desc: 'Chitinöses Bein einer Riesenspinne. Alchemisten schätzen das Sekret.' },
  'Goblin-Ohr':      { name: 'Goblin-Ohr',      icon: '👂', tier: 1, desc: 'Trophäe eines erlegten Goblins.' },
  'Knochenstaub':    { name: 'Knochenstaub',    icon: '🦴', tier: 2, desc: 'Fein gemahlene Gebeine. Basis für nekrotische Tränke.' },
  'Ork-Hauer':       { name: 'Ork-Hauer',       icon: '🦷', tier: 2, desc: 'Massiver Eckzahn eines Orks. Hart wie Eisen.' },
  'Vampirasche':     { name: 'Vampirasche',     icon: '🌑', tier: 3, desc: 'Asche eines verbrannten Untoten. Pulsiert mit dunkler Macht.' },
  'Geisteressenz':   { name: 'Geisteressenz',   icon: '💠', tier: 3, desc: 'Kristallisierte Essenz eines Schattengeistes. Voller Mana.' },
  'Runensplitter':   { name: 'Runensplitter',   icon: '🔷', tier: 3, desc: 'Bruchstück eines Golem-Runensteins. Verstärkt Verzauberungen.' }
};

// ─── Rezepte ────────────────────────────────────────────────────────────────
// output.kind: 'consumable' (aus MARKET_ITEMS) | 'equipment' (aus ITEM_TEMPLATES) | 'material'
export const CRAFTING_RECIPES = [
  {
    id: 'craft_heal_bundle', name: 'Heiltrank-Bündel', icon: '🧪',
    desc: 'Braut 2 Heiltränke aus Spinnensekret.',
    materials: { 'Spinnenbein': 3 }, gold: 25,
    output: { kind: 'consumable', id: 'potion_heal', count: 2 }
  },
  {
    id: 'craft_mana_bundle', name: 'Manatrank-Bündel', icon: '🔵',
    desc: 'Destilliert 2 Manatränke aus Geisteressenz.',
    materials: { 'Geisteressenz': 2 }, gold: 30,
    output: { kind: 'consumable', id: 'potion_mana', count: 2 }
  },
  {
    id: 'craft_antitoxin', name: 'Antitoxin', icon: '💚',
    desc: 'Ein Gegengift, das Gift-Effekte neutralisiert. (3×)',
    materials: { 'Knochenstaub': 2, 'Spinnenbein': 2 }, gold: 20,
    output: { kind: 'consumable', id: 'antitoxin', count: 3 }
  },
  {
    id: 'craft_might_elixir', name: 'Elixier der Macht', icon: '⚗️',
    desc: 'Ein Stärketrank, gebraut aus Ork-Hauern.',
    materials: { 'Ork-Hauer': 2, 'Knochenstaub': 1 }, gold: 50,
    output: { kind: 'consumable', id: 'elixir_might', count: 1 }
  },
  {
    id: 'craft_reinforce_stone', name: 'Verstärkungsstein', icon: '🪨',
    desc: 'Ein Aufwertungs-Katalysator (Material für künftige Verzauberung & Crafting).',
    materials: { 'Runensplitter': 1, 'Ork-Hauer': 2 }, gold: 60,
    output: { kind: 'material', id: 'Verstärkungsstein', count: 1 }
  },
  {
    id: 'craft_tower_shield', name: 'Turmschild des Unerschütterlichen', icon: '🛡️',
    desc: 'Schmiede ein mächtiges Turmschild aus Ork-Hauern und Runensplittern.',
    materials: { 'Ork-Hauer': 4, 'Runensplitter': 2 }, gold: 120,
    output: { kind: 'equipment', id: 'tower_shield', count: 1 }
  },
  {
    id: 'craft_dark_tome', name: 'Schattentom des Nekromanten', icon: '📕',
    desc: 'Binde ein dunkles Grimoire aus Vampirasche.',
    materials: { 'Vampirasche': 3, 'Geisteressenz': 2 }, gold: 110,
    output: { kind: 'equipment', id: 'dark_tome', count: 1 }
  }
];

// Verstärkungsstein als Material-Eintrag ergänzen (Output von craft_reinforce_stone)
MATERIALS['Verstärkungsstein'] = { name: 'Verstärkungsstein', icon: '🪨', tier: 4, desc: 'Ein gehärteter Katalysator für mächtiges Handwerk.' };

/** Prüft, ob der Spieler ein Rezept herstellen kann (Materialien + Gold). */
export function canCraft(player, recipe) {
  if (!recipe) return false;
  const mats = player.materials || {};
  for (const [name, count] of Object.entries(recipe.materials)) {
    if ((mats[name] || 0) < count) return false;
  }
  return (player.gold || 0) >= recipe.gold;
}

/** Liste fehlender Anforderungen (für UI-Anzeige). */
export function missingForRecipe(player, recipe) {
  const missing = [];
  const mats = player.materials || {};
  for (const [name, count] of Object.entries(recipe.materials)) {
    const have = mats[name] || 0;
    if (have < count) missing.push(`${name} (${have}/${count})`);
  }
  if ((player.gold || 0) < recipe.gold) missing.push(`Gold (${player.gold}/${recipe.gold})`);
  return missing;
}

/** Fügt ein Material zum Lager hinzu. */
export function addMaterial(player, name, amount = 1) {
  player.materials = player.materials || {};
  player.materials[name] = (player.materials[name] || 0) + amount;
}
