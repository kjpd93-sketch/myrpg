/**
 * Turn-based combat engine and Enemy definitions
 */

import { createItem, generateDungeonLoot, rollRarity } from './items.js';
import { SKILL_DATABASE, getAvailableSkills } from './skills.js';

// ─── Gegner-Definitionen ──────────────────────────────────────────────────────

export const ENEMY_TEMPLATES = {
  FLEDERMAUS: {
    name: 'Riesenfledermaus',
    image: 'assets/images/enemy_bat.png',
    level: 1,
    hp: 130, maxHp: 130,
    damage: 18,
    armor: 2,
    skills: [],
    xpReward: 35,
    goldRange: [4, 10],
    lootTable: []
  },
  SPINNE: {
    name: 'Riesenspinne',
    image: 'assets/images/enemy_spider.png',
    level: 1,
    hp: 180, maxHp: 180,
    damage: 24,
    armor: 4,
    skills: [
      { name: 'Giftbiss', chance: 0.30, dot: 8, duration: 3, text: 'beißt giftig zu' }
    ],
    xpReward: 45,
    goldRange: [6, 15],
    lootTable: [
      { id: 'Spinnenbein', chance: 0.6, isMaterial: true }
    ]
  },
  GOBLIN: {
    name: 'Goblin',
    image: 'assets/images/enemy_goblin.png',
    level: 2,
    hp: 240, maxHp: 240,
    damage: 28,
    armor: 6,
    skills: [
      { name: 'Fieser Trick', chance: 0.25, extraDamage: 8, text: 'wirft Sand in die Augen', hitChanceMod: -0.20, hitChanceDuration: 2 }
    ],
    xpReward: 70,
    goldRange: [15, 25],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.12 },
      { id: 'cloth_hood', chance: 0.12 },
      { id: 'Goblin-Ohr', chance: 0.45, isMaterial: true }
    ]
  },
  SKELETT: {
    name: 'Skelett-Beschwörer',
    image: 'assets/images/enemy_skeleton.png',
    level: 3,
    hp: 200, maxHp: 200,
    damage: 32,
    armor: 6,
    skills: [
      { name: 'Feuerblitz', chance: 0.35, extraDamage: 14, text: 'beschwört einen Feuerstoß', isSpell: true }
    ],
    xpReward: 90,
    goldRange: [20, 35],
    lootTable: [
      { id: 'magical_orb', chance: 0.12 },
      { id: 'cloth_trousers', chance: 0.12 },
      { id: 'Knochenstaub', chance: 0.45, isMaterial: true }
    ]
  },

  // ─── Dungeon 2: Orkfestung ────────────────────────────────────────────────
  ORK: {
    name: 'Ork-Krieger',
    image: 'assets/images/enemy_ork.png',
    level: 3,
    hp: 320, maxHp: 320,
    damage: 34,
    armor: 14,
    skills: [
      { name: 'Berserker-Schrei', chance: 0.20, selfBuff: true, buffMult: 1.35, effectText: 'Berserker (+35% Schaden)' },
      { name: 'Wuchtschlag',      chance: 0.25, extraDamage: 16, text: 'schlägt mit voller Wucht zu' }
    ],
    xpReward: 110,
    goldRange: [25, 45],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.15 },
      { id: 'war_mace',     chance: 0.10 },
      { id: 'Ork-Hauer', chance: 0.45, isMaterial: true }
    ]
  },
  DUNKELELF: {
    name: 'Dunkel-Elfe',
    image: 'assets/images/enemy_darkelf.png',
    level: 3,
    hp: 220, maxHp: 220,
    damage: 30,
    armor: 8,
    skills: [
      { name: 'Giftpfeil',    chance: 0.35, dot: 12, duration: 3, text: 'schießt einen vergifteten Pfeil' },
      { name: 'Schattenform', chance: 0.15, selfBuff: true, buffMult: 1.20, effectText: 'Schatten (+20% Schaden)' }
    ],
    xpReward: 95,
    goldRange: [20, 38],
    lootTable: [
      { id: 'elven_bow',  chance: 0.10 },
      { id: 'cloth_boots', chance: 0.15 }
    ]
  },

  // ─── Dungeon 3: Verfluchte Katakomben ────────────────────────────────────
  STEINGOLEM: {
    name: 'Stein-Golem',
    image: 'assets/images/enemy_golem.png',
    level: 4,
    hp: 420, maxHp: 420,
    damage: 36,
    armor: 32,
    skills: [
      { name: 'Erdstampfer',     chance: 0.25, extraDamage: 20, isAoe: true, text: 'erschüttert den Boden — alle spüren die Wucht' },
      { name: 'Gesteinsrüstung', chance: 0.15, selfBuff: true, buffMult: 1.10, effectText: 'Gestein verhärtet (+10% Schaden)' }
    ],
    xpReward: 130,
    goldRange: [30, 55],
    lootTable: [
      { id: 'plate_boots',  chance: 0.15 },
      { id: 'tower_shield', chance: 0.08 },
      { id: 'Runensplitter', chance: 0.40, isMaterial: true }
    ]
  },
  VAMPIR: {
    name: 'Vampir',
    image: 'assets/images/enemy_vampire.png',
    level: 4,
    hp: 280, maxHp: 280,
    damage: 38,
    armor: 10,
    skills: [
      { name: 'Blutdurst', chance: 0.30, extraDamage: 14, lifeSteal: 0.50, text: 'beißt und saugt das Blut des Opfers' },
      { name: 'Hypnose',   chance: 0.20, stun: true, stunChance: 0.55, text: 'blickt dem Ziel tief in die Augen' }
    ],
    xpReward: 120,
    goldRange: [30, 50],
    lootTable: [
      { id: 'dark_tome',  chance: 0.10 },
      { id: 'cloth_robe', chance: 0.12 },
      { id: 'Vampirasche', chance: 0.45, isMaterial: true }
    ]
  },

  // ═══ NEUE GEGNER MIT ROLLEN (DD / HEALER / BUFFER) ═════════════════════════
  // role: 'DD' (Standard) | 'HEALER' (heilt Verbündete) | 'BUFFER' (bufft Verbündete)

  // ── Spinnenhöhle ──
  SPINNENBRUT: {
    name: 'Spinnenbrut', image: 'assets/images/enemy_spiderling.png',
    level: 1, hp: 80, maxHp: 80, damage: 14, armor: 1, role: 'DD',
    skills: [
      { name: 'Schwarmbiss', chance: 0.30, extraDamage: 6, text: 'beißt blitzschnell mehrfach zu' }
    ],
    xpReward: 25, goldRange: [3, 8],
    lootTable: [ { id: 'Spinnenbein', chance: 0.4, isMaterial: true } ]
  },
  GIFTLAUERER: {
    name: 'Giftlauerer', image: 'assets/images/enemy_venom_lurker.png',
    level: 2, hp: 160, maxHp: 160, damage: 16, armor: 3, role: 'DD',
    skills: [
      { name: 'Säurespeien', chance: 0.40, dot: 11, duration: 3, text: 'speit ätzende Säure' },
      { name: 'Giftwolke', chance: 0.20, dot: 7, duration: 2, isAoe: true, text: 'verströmt eine giftige Wolke über die Gruppe' }
    ],
    xpReward: 55, goldRange: [8, 18],
    lootTable: [ { id: 'cloth_gloves', chance: 0.12 } ]
  },

  // ── Goblinfestung ──
  GOBLIN_SCHAMANE: {
    name: 'Goblin-Schamane', image: 'assets/images/enemy_goblin_shaman.png',
    level: 2, hp: 180, maxHp: 180, damage: 16, armor: 4, role: 'HEALER',
    healAmount: 45, // heilt verletzten Verbündeten pro Aktion
    skills: [
      { name: 'Hexenblitz', chance: 0.30, extraDamage: 10, isSpell: true, text: 'schleudert einen Hexenblitz' }
    ],
    xpReward: 80, goldRange: [18, 30],
    lootTable: [ { id: 'magical_orb', chance: 0.14 } ]
  },
  GOBLIN_BOMBER: {
    name: 'Goblin-Bombenwerfer', image: 'assets/images/enemy_goblin_bomber.png',
    level: 2, hp: 150, maxHp: 150, damage: 22, armor: 3, role: 'DD',
    skills: [
      { name: 'Bombenwurf', chance: 0.45, extraDamage: 12, isAoe: true, text: 'wirft eine Bombe in die Gruppe' }
    ],
    xpReward: 75, goldRange: [16, 28],
    lootTable: [ { id: 'heavy_gloves', chance: 0.12 } ]
  },

  // ── Orkfestung ──
  ORK_BERSERKER: {
    name: 'Ork-Berserker', image: 'assets/images/enemy_ork_berserker.png',
    level: 3, hp: 280, maxHp: 280, damage: 46, armor: 6, role: 'DD',
    skills: [
      { name: 'Blutrausch', chance: 0.30, selfBuff: true, buffMult: 1.40, effectText: 'Blutrausch (+40% Schaden)' },
      { name: 'Wilder Doppelhieb', chance: 0.30, extraDamage: 18, text: 'schlägt mit beiden Äxten zu' }
    ],
    xpReward: 120, goldRange: [26, 46],
    lootTable: [ { id: 'battle_axe', chance: 0.10 } ]
  },
  ORK_KRIEGSHAEUPTLING: {
    name: 'Ork-Kriegshäuptling', image: 'assets/images/enemy_ork_warchief.png',
    level: 4, hp: 380, maxHp: 380, damage: 32, armor: 18, role: 'BUFFER',
    buffMult: 1.30, // bufft Verbündeten-Schaden
    skills: [
      { name: 'Niederschlag', chance: 0.25, extraDamage: 14, stun: true, stunChance: 0.5, text: 'schmettert sein Banner herab' }
    ],
    xpReward: 150, goldRange: [35, 60],
    lootTable: [ { id: 'war_mace', chance: 0.12 }, { id: 'heavy_chest', chance: 0.12 } ]
  },

  // ── Katakomben ──
  GHUL: {
    name: 'Ghul', image: 'assets/images/enemy_ghoul.png',
    level: 4, hp: 300, maxHp: 300, damage: 38, armor: 8, role: 'DD',
    skills: [
      { name: 'Verschlingen', chance: 0.35, extraDamage: 12, lifeSteal: 0.50, text: 'reißt ein Stück heraus und frisst es' }
    ],
    xpReward: 115, goldRange: [25, 45],
    lootTable: [ { id: 'plate_gloves', chance: 0.12 }, { id: 'Vampirasche', chance: 0.45, isMaterial: true } ]
  },
  SCHATTENGEIST: {
    name: 'Schattengeist', image: 'assets/images/enemy_wraith.png',
    level: 4, hp: 240, maxHp: 240, damage: 34, armor: 6, role: 'DD',
    skills: [
      { name: 'Manaentzug', chance: 0.35, extraDamage: 8, manaDrain: 20, isSpell: true, text: 'entzieht dem Ziel Mana' },
      { name: 'Schattenschleier', chance: 0.20, selfBuff: true, buffMult: 1.15, effectText: 'Schattenschleier (schwer zu treffen)' }
    ],
    xpReward: 110, goldRange: [22, 42],
    lootTable: [ { id: 'dark_tome', chance: 0.10 }, { id: 'Geisteressenz', chance: 0.50, isMaterial: true } ]
  },

  // ── Elite-Varianten (optional, stärker) ──
  ELITE_ORK: {
    name: 'Ork-Champion', image: 'assets/images/enemy_elite_ork.png',
    level: 5, hp: 600, maxHp: 600, damage: 52, armor: 24, role: 'DD', isElite: true,
    skills: [
      { name: 'Champions Zorn', chance: 0.30, extraDamage: 24, isAoe: true, text: 'wirbelt die Axt durch die ganze Gruppe' },
      { name: 'Kampfschrei', chance: 0.20, selfBuff: true, buffMult: 1.35, effectText: 'Kampfschrei (+35% Schaden)' }
    ],
    xpReward: 260, goldRange: [70, 110],
    lootTable: [ { id: 'sword_2h', chance: 0.30 }, { id: 'plate_chest', chance: 0.25 } ]
  },
  ELITE_SKELETT: {
    name: 'Knochenlord', image: 'assets/images/enemy_elite_skeleton.png',
    level: 5, hp: 520, maxHp: 520, damage: 48, armor: 16, role: 'DD', isElite: true,
    skills: [
      { name: 'Nekrotischer Hieb', chance: 0.35, extraDamage: 18, dot: 12, duration: 3, text: 'schlägt mit nekrotischer Energie' },
      { name: 'Knochenwirbel', chance: 0.25, extraDamage: 14, isAoe: true, text: 'lässt Knochensplitter auf alle regnen' }
    ],
    xpReward: 240, goldRange: [65, 100],
    lootTable: [ { id: 'dark_tome', chance: 0.25 }, { id: 'plate_helm_t2', chance: 0.2 } ]
  },

  // ─── Bosse ─────────────────────────────────────────────────────────────────
  BOSS_SPIDER: {
    name: 'Spinnenkönigin',
    image: 'assets/images/boss_spider_queen.png',
    level: 3,
    hp: 600, maxHp: 600,
    damage: 30,
    armor: 12,
    isBoss: true,
    skills: [
      { name: 'Kokonwurf', chance: 0.20, stun: true, stunChance: 0.60, text: 'spinnt ein Ziel in ein klebriges Netz ein' },
      { name: 'Tödliches Toxin', chance: 0.30, dot: 9, duration: 3, text: 'injiziert ein schweres Gift' }
    ],
    phases: [
      {
        threshold: 0.60,
        triggered: false,
        message: '🕷️ Die Spinnenkönigin ist verletzt! Sie ruft ihre Brut zu Hilfe!',
        extraSkills: [
          { name: 'Giftspucker', chance: 0.40, dot: 7, duration: 2, text: 'spuckt Gift auf alle Helden', isAoe: true }
        ],
        damageMultiplier: 1.20
      },
      {
        threshold: 0.30,
        triggered: false,
        message: '💀 DIE SPINNENKÖNIGIN RAST! Ihre Augen leuchten blutrot!',
        extraSkills: [
          { name: 'Tödliche Umarmung', chance: 0.50, extraDamage: 18, dot: 12, duration: 3, text: 'reißt mit all ihren Beinen zu' }
        ],
        damageMultiplier: 1.30
      }
    ],
    xpReward: 400,
    goldRange: [100, 160],
    lootTable: [
      { id: 'steel_shield', chance: 0.55 },
      { id: 'plate_gloves', chance: 0.55 }
    ]
  },

  BOSS_GOBLIN: {
    name: 'Goblin-König Grak',
    image: 'assets/images/boss_goblin_king.png',
    level: 4,
    hp: 900, maxHp: 900,
    damage: 38,
    armor: 20,
    isBoss: true,
    skills: [
      { name: 'Königlicher Hieb', chance: 0.25, extraDamage: 14, stun: true, stunChance: 0.65, text: 'schlägt wild mit dem Zepter zu' },
      { name: 'Tollkühner Schrei', chance: 0.18, selfBuff: true, effectText: 'Wütend (+30% Schaden)' }
    ],
    phases: [
      {
        threshold: 0.65,
        triggered: false,
        message: '⚔️ Grak brüllt wütend! Er ruft seine Leibwächter — VERSTÄRKUNG EINGETROFFEN!',
        extraSkills: [
          { name: 'Befehle brüllen', chance: 0.35, extraDamage: 8, text: 'koordiniert seine Truppen für einen kombinierten Angriff' }
        ],
        damageMultiplier: 1.25
      },
      {
        threshold: 0.35,
        triggered: false,
        message: '💥 GRAKS LETZTE WUTATTACKE! Er wirft sein Zepter und greift mit bloßen Fäusten an!',
        extraSkills: [
          { name: 'Barbarischer Rausch', chance: 0.55, extraDamage: 20, text: 'schlägt wahllos auf alles ein', isAoe: true }
        ],
        damageMultiplier: 1.40
      }
    ],
    xpReward: 550,
    goldRange: [180, 260],
    lootTable: [
      { id: 'sword_2h',   chance: 0.45 },
      { id: 'plate_chest', chance: 0.45 },
      { id: 'holy_relic', chance: 0.45 }
    ]
  },

  // ─── Boss: Orkfestung ──────────────────────────────────────────────────────
  BOSS_ORK_WARLORD: {
    name: 'Ork-Warlord Gruum',
    image: 'assets/images/boss_ork_warlord.png',
    level: 5,
    hp: 1200, maxHp: 1200,
    damage: 48,
    armor: 26,
    isBoss: true,
    skills: [
      { name: 'Warlord-Hieb', chance: 0.25, extraDamage: 20, text: 'holt mit seiner Riesenklinge weit aus' },
      { name: 'Schlachtruf',  chance: 0.20, selfBuff: true, buffMult: 1.40, effectText: 'Kriegsbereitschaft (+40% Schaden)' }
    ],
    phases: [
      {
        threshold: 0.70,
        triggered: false,
        message: '⚔️ Gruum tobt! Er ruft seine Leibgarde und schmettert seinen Streitkolben auf den Boden!',
        extraSkills: [
          { name: 'Stampf-Angriff', chance: 0.30, extraDamage: 14, isAoe: true, text: 'erschüttert den Boden — alle Helden wanken' }
        ],
        damageMultiplier: 1.20
      },
      {
        threshold: 0.40,
        triggered: false,
        message: '💥 GRUUM BLUTET — ER RAST! Seine Augen leuchten rot, seine Kraft verdoppelt sich!',
        extraSkills: [
          { name: 'Berserkerwut', chance: 0.45, extraDamage: 25, isAoe: true, text: 'greift in rasender Wut wild um sich' }
        ],
        damageMultiplier: 1.35
      },
      {
        threshold: 0.15,
        triggered: false,
        message: '☠️ LETZTER ATEMZUG — Gruum wirft alles in einen einzigen verzweifelten Todesstoß!',
        extraSkills: [
          { name: 'Todesklinge', chance: 0.60, extraDamage: 40, text: 'schlägt mit allerletzter Kraft zu' }
        ],
        damageMultiplier: 1.50
      }
    ],
    xpReward: 750,
    goldRange: [250, 380],
    lootTable: [
      { id: 'battle_axe',    chance: 0.60 },
      { id: 'heavy_chest_t2', chance: 0.50 },
      { id: 'plate_helm_t2', chance: 0.45 },
      { id: 'legendary_thornaegis', chance: 0.12 } // ⭐ Legendär
    ]
  },

  // ─── Boss: Verfluchte Katakomben ──────────────────────────────────────────
  BOSS_VAMPIRFUERST: {
    name: 'Vampirfürst Mordecai',
    image: 'assets/images/boss_vampire_lord.png',
    level: 6,
    hp: 1500, maxHp: 1500,
    damage: 55,
    armor: 18,
    isBoss: true,
    skills: [
      { name: 'Lebensraub',       chance: 0.30, extraDamage: 15, lifeSteal: 0.60, text: 'entzieht dem Ziel die Lebensenergie mit einem Biss' },
      { name: 'Vampirischer Blick', chance: 0.20, stun: true, stunChance: 0.70, text: 'lähmt das Ziel mit seinem Todesblick' }
    ],
    phases: [
      {
        threshold: 0.65,
        triggered: false,
        message: '🦇 Mordecai lacht höhnisch! Er verwandelt sich — ein FLEDERMAUSSCHWARM umhüllt ihn!',
        extraSkills: [
          { name: 'Fledermaushagel', chance: 0.35, dot: 10, duration: 3, isAoe: true, text: 'lässt einen Schwarm Fledermäuse auf die Gruppe los' }
        ],
        damageMultiplier: 1.25
      },
      {
        threshold: 0.35,
        triggered: false,
        message: '💉 MORDECAI RAST — Er saugt Lebensenergie direkt aus der Luft selbst!',
        extraSkills: [
          { name: 'Blutbad', chance: 0.45, extraDamage: 22, lifeSteal: 0.80, isAoe: true, text: 'trinkt gierig von allen Lebewesen gleichzeitig' }
        ],
        damageMultiplier: 1.40
      },
      {
        threshold: 0.10,
        triggered: false,
        message: '☠️ UNSTERBLICHE RASEREI — Mordecai regeneriert sich mit erschreckender Geschwindigkeit!',
        extraSkills: [
          { name: 'Blutopfer', chance: 0.50, extraDamage: 30, lifeSteal: 1.00, text: 'opfert sein eigenes Blut für maximale Kraft' }
        ],
        damageMultiplier: 1.55,
        selfRegen: 30
      }
    ],
    xpReward: 950,
    goldRange: [320, 500],
    lootTable: [
      { id: 'arcane_staff',      chance: 0.55 },
      { id: 'cloth_robe_arcane', chance: 0.55 },
      { id: 'dark_tome',         chance: 0.50 },
      { id: 'legendary_bloodthirst', chance: 0.12 } // ⭐ Legendär
    ]
  },

  // ─── ENDBOSS (Akt III: Das Tor zum Abgrund) ────────────────────────────────
  BOSS_FALLEN_WARDEN: {
    name: 'Der Gefallene Wächter',
    image: 'assets/images/boss_fallen_warden.png',
    level: 8,
    hp: 2400, maxHp: 2400,
    damage: 70,
    armor: 25,
    isBoss: true,
    skills: [
      { name: 'Siegelbruch', chance: 0.30, extraDamage: 25, isAoe: true, text: 'entfesselt rohe Abgrund-Energie auf die ganze Gruppe' },
      { name: 'Wächterurteil', chance: 0.25, stun: true, stunChance: 0.65, text: 'spricht ein lähmendes Urteil über ein Ziel' }
    ],
    phases: [
      {
        threshold: 0.70,
        triggered: false,
        message: '🌀 "IHR HÄTTET NICHT KOMMEN SOLLEN!" — Der Wächter reißt einen Riss in die Realität!',
        extraSkills: [
          { name: 'Chaos-Welle', chance: 0.40, dot: 14, duration: 3, isAoe: true, text: 'lässt eine Welle aus reinem Chaos über die Gruppe rollen' }
        ],
        damageMultiplier: 1.25
      },
      {
        threshold: 0.40,
        triggered: false,
        message: '🩸 Mara erscheint als Schemen: "Tu es nicht, Liebes!" — doch der Wächter verschlingt ihre Stimme und RAST!',
        extraSkills: [
          { name: 'Verschlingende Leere', chance: 0.45, extraDamage: 32, lifeSteal: 0.5, isAoe: true, text: 'reißt die Lebenskraft aller Helden in die Leere' }
        ],
        damageMultiplier: 1.45
      },
      {
        threshold: 0.15,
        triggered: false,
        message: '💥 LETZTES AUFBÄUMEN — Das schlafende Auge öffnet sich ein letztes Mal!',
        extraSkills: [
          { name: 'Blick des Abgrunds', chance: 0.55, extraDamage: 45, stun: true, stunChance: 0.4, text: 'bündelt die ganze Macht des Auges in einem vernichtenden Blick' }
        ],
        damageMultiplier: 1.6,
        selfRegen: 25
      }
    ],
    xpReward: 1800,
    goldRange: [600, 900],
    lootTable: [
      { id: 'legendary_archmage_crown', chance: 0.30 }, // ⭐ Legendär
      { id: 'legendary_titan_heart',    chance: 0.30 }, // ⭐ Legendär
      { id: 'legendary_warden_seal',    chance: 0.30 }, // ⭐ Legendär
      { id: 'tower_shield', chance: 0.5 }
    ]
  }
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/**
 * Erstellt eine skalierte Gegner-Instanz.
 * Wenn der Spieler höher ist als das Basis-Level des Gegners:
 *   HP    +20% pro Level-Differenz
 *   Schaden +15% pro Level-Differenz
 * Wenn der Spieler niedriger ist (falscher Dungeon):
 *   HP    -15% pro Level-Differenz (min. 40% der Basis-HP)
 *   Schaden unverändert (Gegner sind immer gefährlich)
 */
function createEnemy(key, targetLevel = null) {
  const tpl = ENEMY_TEMPLATES[key];
  const diff = targetLevel ? targetLevel - tpl.level : 0;

  let hpMult, dmgMult;
  if (diff >= 0) {
    hpMult  = 1 + diff * 0.20;
    dmgMult = 1 + diff * 0.15;
  } else {
    hpMult  = Math.max(0.40, 1 + diff * 0.15); // Unterlevelig: weniger HP
    dmgMult = 1.0;                              // Schaden bleibt — schwache Gegner können noch treffen
  }

  const scaledHp   = Math.round(tpl.hp     * hpMult);
  const scaledDmg  = Math.round(tpl.damage * dmgMult);

  // Boss-Phasen tief kopieren damit jeder Kampf frische triggered-Flags hat
  const phases = tpl.phases
    ? tpl.phases.map(p => ({ ...p, triggered: false,
        extraSkills: p.extraSkills ? p.extraSkills.map(s => ({ ...s })) : [] }))
    : null;

  return {
    ...tpl,
    hp: scaledHp, maxHp: scaledHp, currentHp: scaledHp,
    damage: scaledDmg,
    phases,
    id: `enemy_${key}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    buffs: [], debuffs: [],
    stunned: false,
    damageModifier: 1.0,
    damageDebuff: 0,
    damageTakenMultiplier: 1.0,
    hitChanceModifier: 0.0
  };
}

// ─── Combat-Klasse ────────────────────────────────────────────────────────────

export class Combat {
  /**
   * @param {Character} player
   * @param {string[]}  enemyKeys  — Keys aus ENEMY_TEMPLATES
   * @param {number}    [encounterLevel] — Optional: skaliert Gegner auf dieses Level
   */
  constructor(player, enemyKeys, encounterLevel = null) {
    this.player = player;

    // Party: Spieler + Companions
    this.heroes = [player, ...(player.party || [])];
    this.heroes.forEach(h => {
      h.buffs  = [];
      h.debuffs = [];
      h.shield = 0;
      h.stunned = false;
      h.skipNextTurn = false;
      h.bonusCritChance = 0;
      h.bonusBlockChance = 0;
      h.damageTakenMultiplier = 1.0;
      h.threat = 0; // Bedrohungswert (Aggro) — bestimmt, wen Gegner angreifen
      if (h.classKey === 'KRIEGER') h.currentResource = 0;
    });

    this.enemies = enemyKeys.map(key => createEnemy(key, encounterLevel));
    // Taunt-Zustand initialisieren (wird durch Spott-Fähigkeiten gesetzt)
    this.enemies.forEach(e => { e.tauntedBy = null; e.tauntTurns = 0; });

    this.turn = 0;
    const enemyNames = this.enemies.map(e => e.name).join(', ');
    this.logs = [`Kampf gegen ${enemyNames} beginnt!`];
    this.isOver  = false;
    this.victory = false;
    this.fled    = false;

    // stepMode = true → nextTurn() stoppt nach jedem NPC-Zug statt zu recursieren.
    // app.js treibt dann die Züge einzeln mit Delay an.
    this._stepMode = true;

    this.getAliveHeroes  = () => this.heroes.filter(h => h.currentHp > 0);
    this.getAliveEnemies = () => this.enemies.filter(e => e.currentHp > 0);

    this.turnQueue = [];
    this.currentTurnIndex = 0;
    this.round = 1;

    // Heilungsanforderung: wenn gesetzt, heilt der nächste Heiler-Companion diesen Helden zuerst
    this.healRequest = null; // { target: hero, priority: 'urgent' | 'normal' }
  }

  // ─── Kampfablauf ────────────────────────────────────────────────────────────

  startCombat() {
    const roll = (entity, isHero) => {
      const agi = isHero ? (entity.stats?.agility ?? 5) : entity.level * 2;
      return Math.floor(Math.random() * 20) + 1 + agi;
    };

    this.heroes.forEach(h  => this.turnQueue.push({ entity: h, type: 'hero',  initiative: roll(h,  true)  }));
    this.enemies.forEach(e => this.turnQueue.push({ entity: e, type: 'enemy', initiative: roll(e, false) }));
    this.turnQueue.sort((a, b) => b.initiative - a.initiative);

    const order = this.turnQueue.map(t => `${t.entity.name} (${t.initiative})`).join(', ');
    this.addLog(`🎲 Initiative: ${order}`);
    this.nextTurn();
  }

  /**
   * Verarbeitet den nächsten Zug.
   * Rückgabewert (nur in stepMode relevant):
   *   'player'    — Spieler ist dran, wartet auf Input
   *   'npc'       — Ein NPC/Companion hat agiert (→ delay vor nächstem Aufruf)
   *   'skip'      — Toter Eintrag oder Betäubung übersprungen (→ kein delay)
   *   'round_end' — Rundenende erreicht, Index zurückgesetzt (→ kein delay)
   *   'over'      — Kampf beendet
   */
  nextTurn() {
    if (this.isOver) return 'over';
    this.checkVictory();
    this.checkDefeat();
    if (this.isOver) return 'over';

    // Rundenende: Index zurücksetzen, NICHT weiterprozessieren (stepMode-freundlich)
    if (this.currentTurnIndex >= this.turnQueue.length) {
      this.currentTurnIndex = 0;
      this.round++;
      this.addLog(`─── Runde ${this.round} ───`);
      if (!this._stepMode) this.nextTurn();
      return 'round_end';
    }

    const { entity, type } = this.turnQueue[this.currentTurnIndex];

    // Tote Einheit: sofort überspringen (kein Delay nötig)
    if (entity.currentHp <= 0) {
      this.currentTurnIndex++;
      this.nextTurn(); // Tote immer instant überspringen
      return 'skip';
    }

    if (type === 'hero' && entity === this.player) {
      this.tickEffects(entity, true);
      if (entity.currentHp <= 0) {
        this.checkDefeat();
        this.currentTurnIndex++;
        if (!this.isOver) this.nextTurn();
        return 'over';
      }
      if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt und setzt aus!`);
        entity.stunned = false;
        this.currentTurnIndex++;
        if (!this._stepMode) this.nextTurn();
        return 'skip';
      }
      if (entity.skipNextTurn) {
        this.addLog(`${entity.name} sammelt Kräfte.`);
        entity.skipNextTurn = false;
        this.currentTurnIndex++;
        if (!this._stepMode) this.nextTurn();
        return 'skip';
      }
      return 'player'; // Warte auf executePlayerTurn()

    } else if (type === 'hero') {
      this.tickEffects(entity, true);
      if (entity.currentHp > 0 && !entity.stunned) {
        this.executeCompanionAI(entity);
      } else if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt und setzt aus!`);
        entity.stunned = false;
      }
      this.currentTurnIndex++;
      if (!this._stepMode) this.nextTurn();
      return 'npc';

    } else {
      this.tickEffects(entity, false);
      if (entity.currentHp > 0 && !entity.stunned) {
        this.executeEnemyAI(entity);
      } else if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt und setzt aus!`);
        entity.stunned = false;
      }
      this.currentTurnIndex++;
      if (!this._stepMode) this.nextTurn();
      return 'npc';
    }
  }

  addLog(text) { this.logs.push(text); }

  // ─── Bedrohungs-/Aggro-System ──────────────────────────────────────────────

  /**
   * Erzeugt Bedrohung für einen Helden. Positionsbasiert:
   *  - SCHUTZ-Tank / Rolle TANK: ×2.6 (will Aggro)
   *  - Nahkampf-Frontlinie (Krieger/Paladin): ×1.6 (steht vorne, zieht Blicke)
   *  - Backline-Caster (Magier/Priester): ×0.6 (hält sich zurück)
   * So schützt die Frontlinie automatisch die verwundbaren Zauberer.
   */
  _addThreat(hero, amount) {
    if (!hero || !(amount > 0)) return;
    let mult = 1.0;
    if (hero.specKey === 'SCHUTZ' || hero.role === 'TANK') mult = 2.6;
    else if (hero.classKey === 'KRIEGER' || hero.classKey === 'PALADIN') mult = 1.6;
    else if (hero.classKey === 'MAGIER' || hero.classKey === 'PRIESTER') mult = 0.6;
    hero.threat = (hero.threat || 0) + amount * mult;
  }

  /** Setzt Spott: alle Gegner greifen für duration Runden den taunter an. */
  applyTaunt(taunter, duration = 2) {
    this.enemies.forEach(e => {
      if (e.currentHp > 0) { e.tauntedBy = taunter; e.tauntTurns = duration; }
    });
    // Spott gibt zusätzlich einen Bedrohungs-Schub
    this._addThreat(taunter, 40);
    this.addLog(`  🎯 ${taunter.name} verhöhnt die Gegner — sie fokussieren ihn!`);
  }

  // ─── Effekte ticken ─────────────────────────────────────────────────────────

  tickEffects(target, isHeroSide) {
    // 1. Zuerst resetStats — setzt alle Stats auf Basis + Ausrüstung zurück
    //    (bonusCritChance, bonusBlockChance, damageTakenMultiplier werden dabei genullt)
    if (isHeroSide && target.resetStats) target.resetStats();

    // Passiv-Mana-Regen (z.B. Heilige Konzentration für Priester/Heilung)
    if (isHeroSide && target.manaRegenPassive > 0 && target.currentResource !== undefined) {
      target.currentResource = Math.min(target.maxResource, target.currentResource + target.manaRegenPassive);
    }

    // 2. DANN Buff-Effekte anwenden — so bleiben ihre Werte für den Zug erhalten
    if (target.buffs?.length) {
      target.buffs.forEach(buff => {
        if (buff.effect) buff.effect(target);
        if (buff.hot) {
          const heal = Math.min(target.maxHp - target.currentHp, buff.hot);
          if (heal > 0) { target.currentHp += heal; this.addLog(`[Buff] ${target.name} regeneriert ${heal} LP durch '${buff.name}'.`); }
        }
        buff.duration--;
      });
      target.buffs = target.buffs.filter(b => b.duration > 0);
    }

    // 3. Debuffs ticken
    if (target.debuffs?.length) {
      target.debuffs.forEach(debuff => {
        if (debuff.effect) debuff.effect(target);
        if (debuff.dot) {
          let dot = debuff.dot;
          if (isHeroSide && target.shield > 0) {
            const abs = Math.min(target.shield, dot);
            target.shield -= abs; dot -= abs;
            if (abs > 0) this.addLog(`[Schild] ${target.name} fängt ${abs} DoT-Schaden ab.`);
          }
          if (dot > 0) {
            target.currentHp = Math.max(0, target.currentHp - dot);
            this.addLog(`[DoT] ${target.name} erleidet ${dot} Schaden durch '${debuff.name}'.`);
          }
        }
        debuff.duration--;
      });
      // 'Lebende Bombe' & Co.: explodiert beim Ablauf (oder beim Tod des Trägers)
      const expiring = target.debuffs.filter(
        d => d.explosionDmg && (d.duration <= 0 || target.currentHp <= 0)
      );
      if (expiring.length && !isHeroSide) {
        expiring.forEach(d => this.triggerExplosion(target, d.explosionDmg));
      }
      target.debuffs = target.debuffs.filter(
        d => d.duration > 0 && !(d.explosionDmg && target.currentHp <= 0)
      );
    }
  }

  /**
   * AoE-Explosion (z.B. Lebende Bombe): Feuerschaden auf alle lebenden Gegner.
   */
  triggerExplosion(source, dmg) {
    this.addLog(`💥 Lebende Bombe explodiert an ${source.name} für ${dmg} Feuerschaden (AoE)!`);
    this.getAliveEnemies().forEach(enemy => {
      enemy.currentHp = Math.max(0, enemy.currentHp - dmg);
      this.addLog(`[Explosion] ${enemy.name} erleidet ${dmg} Feuerschaden.`);
    });
  }

  // ─── Treffer-/Crit-/Dodge-/Block-System ─────────────────────────────────────

  /**
   * Wrapper für alle Angriffe.
   * Für Schadens-Skills gegen Feinde: Treffercheck → Skill-Ausführung → Crit-Prüfung.
   * Für Heils-/Buff-Skills: direkte Ausführung.
   */
  executeAttack(caster, target, skill) {
    const isDmgVsEnemy = skill.type === 'damage' && !target.classKey;

    if (isDmgVsEnemy) {
      // D&D-Treffercheck: Basis 75%, Agility verbessert Treffersicherheit
      // Caster.hitChanceModifier < 0 wenn geblendet (Goblin Fieser Trick etc.)
      const agiBonus = caster.stats ? Math.min(0.20, (caster.stats.agility - 10) * 0.008) : 0;
      const hitChance = Math.min(0.95, Math.max(0.20,
        0.75 + agiBonus + (caster.hitChanceModifier || 0)
      ));
      if (Math.random() > hitChance) {
        return {
          text: `✗ ${caster.name} verfehlt ${target.name}! (${Math.round(hitChance * 100)}% Treffer-Chance)`,
          damage: 0, healing: 0, miss: true
        };
      }
    }

    // Debuff-Stand des Primärziels VOR der Ausführung merken (für AoE-Verteilung)
    const dbBefore = (target.debuffs || []).length;

    const result = skill.execute(caster, target);
    if (result.error) return result;

    let out = result;

    if (isDmgVsEnemy && result.damage > 0) {
      // 2. Crit-Check
      const isSpell = skill.costType === 'MANA' &&
        caster.classKey !== 'KRIEGER' && caster.classKey !== 'PALADIN';
      const critChance = isSpell
        ? (caster.getSpellCritChance ? caster.getSpellCritChance() : 0.05)
        : (caster.getCritChance      ? caster.getCritChance()      : 0.05);

      let finalDamage = result.damage;
      let extraText = '';
      let isCrit = false;

      if (Math.random() < critChance) {
        const extra = Math.round(result.damage * 0.75);
        target.currentHp = Math.max(0, target.currentHp - extra);
        // Proc: Blutfieber (KRIEGER/FUROR) → +8 Wut bei Crit
        if (caster.hasTalent?.('KRIEGER_BLOOD_FRENZY')) {
          caster.currentResource = Math.min(100, (caster.currentResource || 0) + 8);
        }
        finalDamage += extra;
        extraText += ` 💥 KRIT! (+${extra})`;
        isCrit = true;
      }

      // Legendärer Proc: Lebensraub (Waffe/Nebenhand mit lifesteal)
      const ls = (caster.equipment?.mainHand?.lifesteal || 0) + (caster.equipment?.offHand?.lifesteal || 0);
      if (ls > 0 && caster.currentHp !== undefined && caster.maxHp) {
        const healed = Math.min(caster.maxHp - caster.currentHp, Math.round(finalDamage * ls));
        if (healed > 0) { caster.currentHp += healed; extraText += ` 🩸 +${healed} LP`; }
      }

      if (extraText) {
        out = { ...result, text: result.text + extraText, damage: finalDamage, isCrit };
      }
    }

    // ── FLÄCHENSCHADEN (AoE) ──────────────────────────────────────────────────
    // Skills mit isAoe schädigen im execute() nur das Primärziel — denselben
    // Schaden + die neu zugefügten Debuffs auf ALLE anderen lebenden Gegner legen.
    if (isDmgVsEnemy && out.isAoe) {
      const newDebuffs = (target.debuffs || []).slice(dbBefore);
      const others = this.getAliveEnemies().filter(e => e !== target);
      for (const e of others) {
        if (out.damage > 0) e.currentHp = Math.max(0, e.currentHp - out.damage);
        if (newDebuffs.length) {
          e.debuffs = e.debuffs || [];
          newDebuffs.forEach(d => e.debuffs.push({ ...d }));
        }
      }
      if (others.length > 0) {
        out = { ...out, text: out.text + ` 💥 (Flächenschaden trifft ${others.length} weitere${others.length > 1 ? ' Gegner' : 'n Gegner'})` };
      }
    }

    // ── BEDROHUNG / AGGRO ─────────────────────────────────────────────────────
    // Schaden an Gegnern und Heilung erzeugen Bedrohung beim Verursacher.
    if (isDmgVsEnemy && out.damage > 0) this._addThreat(caster, out.damage);
    if (out.healing > 0) this._addThreat(caster, out.healing * 0.5);
    // Spott-Fähigkeit (Skill mit taunt:true) → alle Gegner fokussieren den Caster
    if (out.taunt) this.applyTaunt(caster, out.tauntDuration || 2);

    return out;
  }

  // ─── Spielerzug ─────────────────────────────────────────────────────────────

  executePlayerTurn(skill, targetId = null) {
    if (this.isOver) return { error: 'Kampf ist beendet.' };

    const { entity } = this.turnQueue[this.currentTurnIndex] || {};
    if (entity !== this.player) return { error: 'Du bist nicht am Zug!' };

    // Zielbestimmung
    let target = null;
    if (targetId) {
      target = this.enemies.find(e => e.id === targetId) ||
               this.heroes.find(h => h.name === targetId);
    } else {
      if (skill.isHeal || skill.type === 'heal' || skill.type === 'buff') {
        target = this.player;
      } else {
        target = this.getAliveEnemies()[0];
      }
    }

    if (!target) { this.checkVictory(); return { error: 'Kein gültiges Ziel.' }; }

    const result = this.executeAttack(this.player, target, skill);
    if (result.error) return result;

    this.addLog(result.text);
    this.checkBossPhaseTransition();
    this.checkVictory();

    if (!this.isOver) {
      this.currentTurnIndex++;
      // stepMode: Nicht automatisch weiter — app.js übernimmt mit Delay
      if (!this._stepMode) this.nextTurn();
    }
    return { success: true, result };
  }

  // ─── Companion-KI ────────────────────────────────────────────────────────────

  /**
   * Skills für die Companion-KI — IDENTISCHES System wie der Spieler:
   * Basisfähigkeiten + tatsächlich gelernte Talente. So werden die Talente,
   * die der Spieler dem Companion zuweist, im Kampf auch genutzt, und beide
   * folgen denselben Regeln (kein verstecktes Gratis-Kit mehr).
   */
  getCompanionSkills(comp) {
    return getAvailableSkills(comp);
  }

  /**
   * Heilt einen Verbündeten direkt (Companions heilen andere Helden, nicht sich selbst).
   * Basiert auf SpellPower des Companions.
   */
  applyCompanionHeal(comp, target, isHoT = false) {
    const sp = comp.getSpellPower ? comp.getSpellPower() : 10;
    const hp = comp.getHealPower ? comp.getHealPower() : 0;
    const totalHealPower = sp + hp;

    if (isHoT) {
      // HoT (Erneuerung / Heiliges Gebet) — günstiger, konstant
      const cost = 12;
      if (comp.currentResource < cost) return null;
      comp.currentResource -= cost;
      const hotVal = Math.round(4 + totalHealPower * 0.30);
      target.buffs = target.buffs || [];
      target.buffs.push({ name: 'Erneuerung', duration: 3, hot: hotVal });
      this._addThreat(comp, hotVal * 1.5); // Heilung erzeugt Bedrohung
      return `${comp.name} wirkt Erneuerung auf ${target.name} (+${hotVal} LP/Runde, 3 Runden).`;
    } else {
      // Direktheilung — skaliert mit HealPower + SpellPower
      // Kosten abhängig vom Dringlichkeit (comp kann sich auch selbst heilen)
      const isSelf = comp === target;
      const cost = isSelf ? 15 : 20;
      if (comp.currentResource < cost) return null;
      comp.currentResource -= cost;
      const heal = Math.round(18 + totalHealPower * 1.4);
      const actual = Math.min(target.maxHp - target.currentHp, heal);
      target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
      this._addThreat(comp, actual * 0.5); // Heilung erzeugt Bedrohung
      return `${comp.name} heilt ${target.name} um ${actual} LP. (${target.currentHp}/${target.maxHp})`;
    }
  }

  executeCompanionAI(comp) {
    if (this.isOver) return;
    const aliveHeroes  = this.getAliveHeroes();
    const aliveEnemies = this.getAliveEnemies();
    const skills       = this.getCompanionSkills(comp);

    const hpPct  = h => h.currentHp / h.maxHp;
    const manaPct = c => (c.maxResource > 0) ? c.currentResource / c.maxResource : 1;
    const hasResource = (skill) => comp.currentResource >= (skill.cost || 0);

    // ── Hilfsfunktion: besten Schaden-Skill wählen ──────────────────────────
    // Bei 2+ Gegnern AoE bevorzugen, sonst gezielten Single-Target-Skill.
    const bestDmgSkill = () => {
      if (aliveEnemies.length >= 2) {
        const aoe = skills.find(s => s.type === 'damage' && s.aoe && hasResource(s));
        if (aoe) return aoe;
      }
      return skills.find(s => s.type === 'damage' && !s.aoe && s.cost > 0 && hasResource(s)) ||
             skills.find(s => s.type === 'damage' && s.cost > 0 && hasResource(s)) ||
             skills.find(s => s.type === 'damage' && (s.cost || 0) === 0);
    };

    // ── Hilfsfunktion: Trank aus Inventar trinken ────────────────────────────
    const usePotion = (effectType) => {
      const pot = comp.inventory?.find(i => i.type === 'consumable' && i.effectType === effectType);
      if (!pot) return false;
      if (effectType === 'heal') {
        const healed = Math.min(comp.maxHp - comp.currentHp, pot.value);
        comp.currentHp += healed;
        this.addLog(`[Comp] 🧪 ${comp.name} trinkt ${pot.name} und heilt sich um ${healed} LP!`);
      } else if (effectType === 'mana') {
        const restored = Math.min(comp.maxResource - comp.currentResource, pot.value);
        comp.currentResource += restored;
        this.addLog(`[Comp] 🧪 ${comp.name} trinkt ${pot.name} und erhält ${restored} Mana zurück!`);
      } else if (effectType === 'ration') {
        // Ration heilt die ganze Gruppe
        aliveHeroes.forEach(h => {
          const healed = Math.round(h.maxHp * (pot.value / 100));
          h.currentHp = Math.min(h.maxHp, h.currentHp + healed);
        });
        this.addLog(`[Comp] 🧪 ${comp.name} verteilt Feldrationen (+${pot.value}% HP für alle).`);
      }
      comp.inventory.splice(comp.inventory.indexOf(pot), 1);
      return true;
    };

    // Kann dieser Companion überhaupt heilen? Nur Priester/Paladin/Rolle HEALER.
    // Ein Magier oder Krieger heilt NIEMALS (war ein Bug).
    const canHeal = comp.classKey === 'PRIESTER' || comp.classKey === 'PALADIN' || comp.role === 'HEALER';

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 0: Heilungsanforderung durch Spieler (höchste Prio für Heiler)
    // ════════════════════════════════════════════════════════════════════════
    const isHealer = comp.role === 'HEALER' || comp.classKey === 'PRIESTER';
    if (isHealer && this.healRequest) {
      const reqTarget = this.healRequest.target;
      if (reqTarget && reqTarget.currentHp > 0) {
        // Mana-Trank zuerst wenn Mana zu knapp
        if (comp.currentResource < 20) { usePotion('mana') || usePotion('elixir'); }
        const log = this.applyCompanionHeal(comp, reqTarget);
        if (log) {
          this.addLog(`[Comp] 💚 ${log} (auf Anforderung)`);
          this.healRequest = null; // Anforderung erfüllt
          return;
        }
      }
      this.healRequest = null; // Ziel nicht mehr gültig oder kein Mana
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 1: Notfall-Heiltrank (HP < 30%)
    // ════════════════════════════════════════════════════════════════════════
    if (hpPct(comp) < 0.30) {
      if (usePotion('heal')) return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 2: Mana-Trank wenn Mana sehr niedrig & wichtige Rolle
    // ════════════════════════════════════════════════════════════════════════
    const needsMana = comp.maxResource > 0 && manaPct(comp) < 0.20;
    const isSpellcaster = ['PRIESTER', 'MAGIER', 'PALADIN'].includes(comp.classKey);
    if (needsMana && isSpellcaster) {
      if (usePotion('mana')) return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 3: Notfall-Heilung — ein Held < 25% HP
    // Heiler bevorzugen Companions als Ziel (Spieler kann sich selbst helfen)
    // ════════════════════════════════════════════════════════════════════════
    const critHeroes = aliveHeroes
      .filter(h => hpPct(h) < 0.25)
      .sort((a, b) => hpPct(a) - hpPct(b)); // Kritischsten zuerst

    if (canHeal && critHeroes.length > 0) {
      // Heiler: Companions zuerst, dann Spieler
      const critTarget = isHealer
        ? (critHeroes.find(h => h !== this.player) || critHeroes[0])
        : critHeroes[0];
      const log = this.applyCompanionHeal(comp, critTarget);
      if (log) { this.addLog(`[Comp] ${log}`); return; }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 4: Heiler-spezifische Logik — proaktiv heilen
    // Companions haben Vorrang vor dem Spieler (Spieler kann selbst Tränke nutzen)
    // ════════════════════════════════════════════════════════════════════════
    if (isHealer) {
      // Companions nach HP sortieren, Spieler ans Ende
      const companions = aliveHeroes.filter(h => h !== this.player);
      const healCandidates = [
        ...companions.sort((a, b) => hpPct(a) - hpPct(b)),
        this.player
      ].filter(h => hpPct(h) < 0.75); // nur heilen wenn unter 75%

      if (comp.currentResource >= 12 && healCandidates.length > 0) {
        const healTarget = healCandidates[0]; // niedrigster Companion zuerst
        const targetPct = hpPct(healTarget);

        // HoT wenn noch keiner läuft und zwischen 50-75% HP
        if (!healTarget.buffs?.some(b => b.name === 'Erneuerung') && targetPct < 0.75 && targetPct > 0.45) {
          const hotLog = this.applyCompanionHeal(comp, healTarget, true);
          if (hotLog) { this.addLog(`[Comp] ${hotLog}`); return; }
        }
        // Direktheilung wenn unter 65%
        if (targetPct < 0.65 && comp.currentResource >= 20) {
          const healLog = this.applyCompanionHeal(comp, healTarget);
          if (healLog) { this.addLog(`[Comp] ${healLog}`); return; }
        }
      } else if (comp.currentResource < 20) {
        // Zu wenig Mana → Trank
        if (usePotion('mana')) return;
        if (usePotion('elixir')) return;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 4: Tank — Buff/Schild wenn HP < 45%
    // ════════════════════════════════════════════════════════════════════════
    if ((comp.role === 'TANK' || comp.classKey === 'KRIEGER' || comp.classKey === 'PALADIN') && hpPct(comp) < 0.45) {
      const shieldSkill = skills.find(s => s.type === 'buff' && hasResource(s));
      if (shieldSkill) {
        const res = shieldSkill.execute(comp, comp);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 5: Debuff auf stärksten Feind (nur wenn genug Mana)
    // ════════════════════════════════════════════════════════════════════════
    if (aliveEnemies.length > 0 && manaPct(comp) > 0.30) {
      const debuffSkill = skills.find(s => s.type === 'debuff' && hasResource(s));
      if (debuffSkill && !debuffSkill._cooldown) {
        const target = aliveEnemies.reduce((a, b) => a.currentHp > b.currentHp ? a : b);
        const res = debuffSkill.execute(comp, target);
        if (!res.error) {
          if (res.taunt) this.applyTaunt(comp, res.tauntDuration || 2); // Spott (z.B. Demo-Ruf)
          this.addLog(`[Comp] ${res.text}`);
          return;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIORITÄT 6: Schaden — Skill-Auswahl nach Kontext
    // ════════════════════════════════════════════════════════════════════════
    if (aliveEnemies.length > 0) {
      // Zielwahl: Tank → stärkster Feind, DPS → schwächster Feind, Healer → stärkster (spart Mana)
      const target = comp.role === 'TANK'
        ? aliveEnemies.reduce((a, b) => a.currentHp > b.currentHp ? a : b)
        : comp.role === 'HEALER'
          ? aliveEnemies.reduce((a, b) => a.currentHp < b.currentHp ? a : b) // schwächsten um Mana zu sparen
          : aliveEnemies.reduce((a, b) => a.currentHp < b.currentHp ? a : b);

      // Mana-Bewusstsein: bei < 30% Mana nur kostenlosen Skill
      const dmgSkill = (manaPct(comp) < 0.30)
        ? skills.find(s => s.type === 'damage' && (s.cost || 0) === 0)  // kein Mana verschwenden
        : bestDmgSkill();

      if (dmgSkill) {
        const res = this.executeAttack(comp, target, dmgSkill);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // FALLBACK: Kein sinnvoller Zug möglich
    // ════════════════════════════════════════════════════════════════════════
    // Letzter Versuch: kostenloser Skill
    if (aliveEnemies.length > 0) {
      const freeSkill = skills.find(s => s.type === 'damage' && (s.cost || 0) === 0);
      if (freeSkill) {
        const target = aliveEnemies[0];
        const res = this.executeAttack(comp, target, freeSkill);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }
    this.addLog(`[Comp] ${comp.name} wartet ab.`);
  }

  // ─── Feind-KI ────────────────────────────────────────────────────────────────

  /**
   * Plant den nächsten Zug eines Gegners VORAB (Ziel + Skill).
   * Wird in der Telegraph-Phase aufgerufen, damit die UI das anvisierte Ziel
   * anzeigen kann, BEVOR die Aktion ausgeführt wird. Das Ergebnis wird auf
   * enemy._plan gespeichert und von executeEnemyAI konsumiert (kein Doppel-Roll).
   *
   * @returns {{ target, usedSkill, isAoe }|null}
   */
  planEnemyTurn(enemy) {
    const aliveHeroes = this.getAliveHeroes();
    if (!aliveHeroes.length) { enemy._plan = null; return null; }

    let target = null;

    // 1. SPOTT: aktiver Spott zwingt den Gegner auf den Verhöhner (wenn er lebt)
    if (enemy.tauntTurns > 0 && enemy.tauntedBy && enemy.tauntedBy.currentHp > 0) {
      target = enemy.tauntedBy;
    }
    // Spott-Dauer herunterzählen (eine Aktion ≈ eine Runde)
    if (enemy.tauntTurns > 0) enemy.tauntTurns--;
    if (enemy.tauntTurns <= 0) enemy.tauntedBy = null;

    // 2. BEDROHUNG: gewichtete Zufallswahl — höhere Bedrohung = klar höhere Chance.
    //    Kleines Basisgewicht (8) + quadratische Betonung lassen den Aggro-Halter
    //    deutlich häufiger getroffen werden, schützen aber Squishies nicht zu 100%.
    if (!target) {
      const weights = aliveHeroes.map(h => Math.pow(8 + (h.threat || 0), 1.7));
      const total = weights.reduce((s, w) => s + w, 0);
      let roll = Math.random() * total;
      target = aliveHeroes[0];
      for (let i = 0; i < aliveHeroes.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { target = aliveHeroes[i]; break; }
      }
    }

    // Skill auswählen
    const allSkills = enemy.skills || [];
    const usedSkill = allSkills.find(s => Math.random() < s.chance);

    enemy._plan = { target, usedSkill, isAoe: !!usedSkill?.isAoe };
    return enemy._plan;
  }

  executeEnemyAI(enemy) {
    if (this.isOver) return;
    const aliveHeroes = this.getAliveHeroes();
    if (!aliveHeroes.length) return;

    // ── ROLLEN-VERHALTEN: Heiler/Buffer agieren auf VERBÜNDETE ──────────────
    const allies = this.getAliveEnemies().filter(e => e !== enemy);

    // HEILER: heilt den am stärksten verletzten Verbündeten (oder sich selbst)
    if (enemy.role === 'HEALER') {
      const pool = [...allies, enemy].filter(a => a.currentHp / a.maxHp < 0.70);
      if (pool.length) {
        const patient = pool.reduce((a, b) => (a.currentHp / a.maxHp) < (b.currentHp / b.maxHp) ? a : b);
        const healAmt = enemy.healAmount || 40;
        const actual = Math.min(patient.maxHp - patient.currentHp, healAmt);
        patient.currentHp = Math.min(patient.maxHp, patient.currentHp + healAmt);
        enemy._plan = null;
        this.addLog(`✨ ${enemy.name} kanalisiert dunkle Heilung auf ${patient === enemy ? 'sich selbst' : patient.name} (+${actual} LP).`);
        return;
      }
    }

    // BUFFER: verstärkt einen noch ungebufften Verbündeten (Schadensbonus)
    if (enemy.role === 'BUFFER') {
      const target = allies.find(a => !a._buffedByChief && a.currentHp > 0);
      if (target && Math.random() < 0.7) {
        target.damageModifier = (target.damageModifier || 1.0) * (enemy.buffMult || 1.25);
        target._buffedByChief = true;
        enemy._plan = null;
        this.addLog(`📯 ${enemy.name} brüllt einen Schlachtruf — ${target.name} kämpft nun mit ${Math.round((enemy.buffMult || 1.25) * 100 - 100)}% mehr Wucht!`);
        return;
      }
    }

    // Vorberechneten Plan nutzen (aus Telegraph-Phase), sonst frisch planen
    const plan = enemy._plan || this.planEnemyTurn(enemy);
    enemy._plan = null; // Plan verbrauchen
    if (!plan) return;

    let target = plan.target;
    const usedSkill = plan.usedSkill;

    // Ziel könnte zwischen Planung und Ausführung gefallen sein → neu wählen
    if (!target || target.currentHp <= 0) {
      target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    }

    // Basisschaden berechnen
    let dmg = Math.round(enemy.damage * (enemy.damageModifier || 1.0));
    if (enemy.damageDebuff) dmg = Math.round(dmg * (1 - enemy.damageDebuff));

    // AoE-Angriff?
    const targetsAll = usedSkill?.isAoe;
    const targets = targetsAll ? aliveHeroes : [target];

    let actionText = '';
    if (usedSkill) {
      actionText = `${enemy.name} wirkt '${usedSkill.name}': ${usedSkill.text}. `;
      if (usedSkill.extraDamage) dmg += usedSkill.extraDamage;
      if (usedSkill.selfBuff) {
        enemy.damageModifier = usedSkill.buffMult || 1.30;
        actionText += `(${usedSkill.effectText || ''}) `;
      }
    } else {
      actionText = `${enemy.name} greift ${targetsAll ? 'die Gruppe' : target.name} an. `;
    }

    this.addLog(actionText);

    // Angriff auf jedes Ziel anwenden
    for (const t of targets) {
      this.applyEnemyDamageToHero(enemy, t, dmg, usedSkill);
    }
  }

  applyEnemyDamageToHero(enemy, hero, rawDmg, skill) {
    // Dodge-Check
    const dodgeChance = hero.getDodgeChance ? hero.getDodgeChance() : 0.05;
    if (Math.random() < dodgeChance) {
      this.addLog(`  ${hero.name} weicht aus! ✨`);
      return;
    }

    // DoT/Stun anwenden (unabhängig von Schaden)
    if (skill?.dot) {
      hero.debuffs = hero.debuffs || [];
      hero.debuffs.push({ name: skill.name, duration: skill.duration || 3, dot: skill.dot });
    }
    if (skill?.stun) {
      // Stun-Chance: Standard 60%, oder explizit per stunChance im Skill definiert
      const sc = skill.stunChance ?? 0.60;
      if (Math.random() < sc) {
        hero.stunned = true;
        this.addLog(`  💫 ${hero.name} ist BETÄUBT! (${Math.round(sc * 100)}% Chance)`);
      } else {
        this.addLog(`  🛡 ${hero.name} widersteht der Betäubung!`);
      }
    }
    if (skill?.hitChanceMod) {
      hero.buffs = hero.buffs || [];
      hero.buffs.push({
        name: 'Geblendet', duration: skill.hitChanceDuration || 2,
        effect: (h) => { h.hitChanceModifier = (h.hitChanceModifier || 0) + skill.hitChanceMod; }
      });
    }
    // Mana-Entzug (z.B. Schattengeist) — zieht Ressource ab
    if (skill?.manaDrain && hero.maxResource > 0) {
      const drained = Math.min(hero.currentResource || 0, skill.manaDrain);
      if (drained > 0) {
        hero.currentResource -= drained;
        this.addLog(`  🔮 ${hero.name} verliert ${drained} Mana durch ${enemy.name}.`);
      }
    }

    // Party-Aura Schadensreduktion prüfen (Heilige Aura / Disziplin-Aura)
    let auraReduction = 0;
    this.heroes.forEach(h => {
      if (h.currentHp > 0) {
        if (h.hasTalent?.('PALADIN_HOLY_AURA')) auraReduction = Math.max(auraReduction, 0.05 * (h.holyAuraLevel || 1));
        if (h.hasTalent?.('PRIESTER_DISC_PASSIVE')) auraReduction = Math.max(auraReduction, 0.04 * (h.discAuraLevel || 1));
      }
    });

    // Schadensberechnung
    const reduction = hero.getDamageReduction ? hero.getDamageReduction() : 0.10;
    let finalDmg = Math.max(1, Math.round(rawDmg * (1 - reduction) * (1 - auraReduction)));

    // damageTakenMultiplier (z.B. Gebet der Besserung)
    if (hero.damageTakenMultiplier && hero.damageTakenMultiplier !== 1.0) {
      finalDmg = Math.round(finalDmg * hero.damageTakenMultiplier);
    }

    // Block-Check
    const blockChance = hero.getBlockChance ? hero.getBlockChance() : 0;
    let logSuffix = '';
    if (blockChance > 0 && Math.random() < blockChance) {
      const blockVal = hero.getBlockValue ? hero.getBlockValue() : 5;
      const blocked  = Math.min(finalDmg, blockVal);
      finalDmg -= blocked;
      logSuffix += ` [🛡 Geblockt ${blocked}]`;

      // Proc: Eisenfestung (+8 Wut bei Block)
      if (hero.hasTalent?.('KRIEGER_IRON_FORTRESS') && hero.classKey === 'KRIEGER') {
        hero.currentResource = Math.min(100, (hero.currentResource || 0) + 8);
      }
      // Proc: Heilige Pflicht (+10 LP bei Block)
      if (hero.hasTalent?.('PALADIN_SACRED_DUTY') && hero.classKey === 'PALADIN') {
        hero.currentHp = Math.min(hero.maxHp, hero.currentHp + 10);
      }

      // Heiliger Schild: Vergeltungsschaden
      if (hero.blockRetaliation) {
        enemy.currentHp = Math.max(0, enemy.currentHp - hero.blockRetaliation);
        logSuffix += ` [Vergeltung ${hero.blockRetaliation}]`;
      }
    }

    // Schild absorbiert
    if (hero.shield > 0) {
      const abs = Math.min(hero.shield, finalDmg);
      hero.shield -= abs; finalDmg -= abs;
      if (abs > 0) logSuffix += ` [Schild −${abs}]`;
    }

    // HP abziehen
    if (finalDmg > 0) {
      hero.currentHp = Math.max(0, hero.currentHp - finalDmg);

      // Legendärer Proc: Dornen (Schild/Item reflektiert Schaden an Angreifer)
      const thorns = (hero.equipment?.offHand?.thorns || 0) + (hero.equipment?.chest?.thorns || 0);
      if (thorns > 0 && enemy.currentHp > 0) {
        const reflected = Math.max(1, Math.round(finalDmg * thorns));
        enemy.currentHp = Math.max(0, enemy.currentHp - reflected);
        logSuffix += ` [🌵 Dornen ${reflected}]`;
      }

      // Life-Steal (Vampir / Boss)
      if (skill?.lifeSteal) {
        const stolen = Math.round(finalDmg * skill.lifeSteal);
        if (stolen > 0) {
          enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + stolen);
          this.addLog(`  🩸 ${enemy.name} saugt ${stolen} LP zurück.`);
        }
      }

      // Wut-Generierung für Krieger
      if (hero.classKey === 'KRIEGER') {
        const rage = Math.min(50, Math.floor(finalDmg * 0.4));
        if (rage > 0) {
          hero.currentResource = Math.min(100, hero.currentResource + rage);
          logSuffix += ` [+${rage} Wut]`;
        }
      }
    }

    this.addLog(`  → ${hero.name}: ${finalDmg} Schaden (${Math.round(reduction * 100)}% Red.)${logSuffix}`);
  }

  // ─── Boss-Phasen ─────────────────────────────────────────────────────────────

  checkBossPhaseTransition() {
    this.enemies.forEach(enemy => {
      if (!enemy.isBoss || !enemy.phases) return;
      enemy.phases.forEach(phase => {
        if (phase.triggered) return;
        if (enemy.currentHp / enemy.maxHp <= phase.threshold) {
          phase.triggered = true;
          this.addLog(`\n⚠️  ${phase.message}\n`);

          if (phase.extraSkills?.length) {
            enemy.skills = [...(enemy.skills || []), ...phase.extraSkills];
          }
          if (phase.damageMultiplier) {
            enemy.damage = Math.round(enemy.damage * phase.damageMultiplier);
            this.addLog(`  ⚔️  ${enemy.name} Schaden erhöht auf ${enemy.damage}!`);
          }
          if (phase.selfRegen) {
            enemy.buffs = enemy.buffs || [];
            enemy.buffs.push({ name: 'Unsterbliche Regeneration', duration: 20, hot: phase.selfRegen });
            this.addLog(`  💊 ${enemy.name} beginnt zu regenerieren! (+${phase.selfRegen} LP/Runde)`);
          }
        }
      });
    });
  }

  // ─── Sieg / Niederlage ───────────────────────────────────────────────────────

  checkVictory() {
    if (this.getAliveEnemies().length === 0) {
      this.isOver  = true;
      this.victory = true;
      this.addLog('🏆 Sieg! Alle Feinde wurden bezwungen.');
      this.distributeRewards();
    }
  }

  checkDefeat() {
    if (this.player.currentHp <= 0) {
      this.isOver  = true;
      this.victory = false;
      this.addLog(`💀 Niederlage! ${this.player.name} ist gefallen...`);
    }
  }

  distributeRewards() {
    // XP (mit Modifier-Multiplikator)
    const rMult = this.rewardMult || 1.0;
    this.xpEarned = Math.round(this.enemies.reduce((s, e) => s + e.xpReward, 0) * rMult);
    const leveledUp = this.player.addXp(this.xpEarned);
    this.leveledUp = leveledUp;
    if (leveledUp) {
      this.addLog(`⭐ LEVEL UP! ${this.player.name} erreicht Stufe ${this.player.level}!`);
      if (this.player.party) this.player.party.forEach(c => c.syncLevel(this.player.level));
    }

    // Gold
    let gold = 0;
    this.enemies.forEach(e => {
      gold += Math.floor(Math.random() * (e.goldRange[1] - e.goldRange[0] + 1) + e.goldRange[0]);
    });
    gold = Math.round(gold * rMult);
    if (this.player.raceKey === 'MENSCH') gold = Math.round(gold * 1.1);
    this.player.gold += gold;
    this.goldEarned = gold;

    // Loot
    this.lootEarned = [];
    this.enemies.forEach(e => {
      if (e.isBoss) {
        if (e.name.includes('Spinnenkönigin')) this.lootEarned.push({ name: 'Kopf der Spinnenkönigin', isQuestItem: true, id: e.name });
        else if (e.name.includes('Goblin-König')) this.lootEarned.push({ name: 'Kopf des Goblin-Königs', isQuestItem: true, id: e.name });
        else if (e.name.includes('Gruum')) this.lootEarned.push({ name: 'Kopf des Ork-Warlords', isQuestItem: true, id: e.name });
        else if (e.name.includes('Mordecai')) this.lootEarned.push({ name: 'Reißzahn des Vampirfürsten', isQuestItem: true, id: e.name });
      }
      (e.lootTable || []).forEach(entry => {
        if (Math.random() < entry.chance) {
          if (entry.isMaterial) {
            this.lootEarned.push({ name: entry.id, isMaterial: true });
          } else {
            // Raritäts-Roll für Equipment-Drops (mit Dungeon-Modifier Luck)
            const modLuck = this.luckBonus || 0;
            const rarity = rollRarity((e.isBoss ? 2 : 0) + modLuck);
            const item = createItem(entry.id, rarity);
            if (item) { this.player.inventory.push(item); this.lootEarned.push(item); }
          }
        }
      });

      // Boss-Bonus: Garantiertes Item mit mindestens Rare
      if (e.isBoss && !e.lootTable?.length) {
        const bossLoot = generateDungeonLoot(this.player.level, true);
        if (bossLoot) { this.player.inventory.push(bossLoot); this.lootEarned.push(bossLoot); }
      }
    });
  }

  // ─── Flucht ──────────────────────────────────────────────────────────────────

  flee() {
    if (this.enemies.some(e => e.isBoss)) {
      this.addLog('Aus einem Bosskampf kann man nicht fliehen!');
      return false;
    }
    if (Math.random() < 0.40) {
      this.isOver = true; this.victory = false; this.fled = true;
      this.addLog('Die Gruppe flieht aus dem Kampf!');
      return true;
    }
    this.addLog('Flucht fehlgeschlagen!');
    this.currentTurnIndex++;
    this.nextTurn();
    return false;
  }
}
