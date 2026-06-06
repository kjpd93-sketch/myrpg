/**
 * Character creation and management module
 */

export const RACES = {
  MENSCH: {
    name: 'Mensch',
    description: 'Vielseitig und zäh. +2 auf alle Primärwerte und +10% Goldfund.',
    bonuses: { stats: 2, goldMultiplier: 1.1 }
  },
  NACHTELF: {
    name: 'Nachtelf',
    description: 'Flink und mystisch. +3 Beweglichkeit, +2 Intelligenz und +5% Ausweichchance.',
    bonuses: { stats: { agility: 3, intellect: 2 }, dodgeChance: 0.05 }
  },
  GNOM: {
    name: 'Gnom',
    description: 'Genial und magisch. +4 Intelligenz, +15% maximales Mana.',
    bonuses: { stats: { intellect: 4 }, manaMultiplier: 1.15 }
  },
  ZWERG: {
    name: 'Zwerg',
    description: 'Robust und standhaft. +4 Ausdauer, +10% maximale Lebenspunkte.',
    bonuses: { stats: { stamina: 4 }, hpMultiplier: 1.10 }
  }
};

export const CLASSES = {
  KRIEGER: {
    name: 'Krieger',
    armorTypes: ['heavy', 'plate'],
    resourceType: 'WUT',
    baseStats: { strength: 12, agility: 7, intellect: 2, stamina: 14 },
    specs: {
      TANK: {
        name: 'Tank (Schutz)',
        description: 'Fokus auf Verteidigung, Schildnutzung und Schadensreduktion.',
        specialStats: { blockChance: 0.12, armorBonus: 0.15 }
      },
      FUROR: {
        name: 'Furor (Schaden)',
        description: 'Nutzt zwei Waffen gleichzeitig für schnellen, hohen Schaden.',
        specialStats: { dualWield: true, critChance: 0.06 }
      },
      WAFFEN: {
        name: 'Waffen (Meister)',
        description: 'Beherrscht jede Waffe zur Perfektion. +15% physischer Schaden, fokussierter Einzelziel-Burst.',
        specialStats: { weaponMastery: 0.15, critChance: 0.05 }
      }
    }
  },
  PALADIN: {
    name: 'Paladin',
    armorTypes: ['heavy', 'plate'],
    resourceType: 'MANA',
    baseStats: { strength: 9, agility: 5, intellect: 8, stamina: 11 },
    specs: {
      TANK: {
        name: 'Tank (Schutz)',
        description: 'Kombiniert schwere Rüstung und heilige Magie zur Verteidigung.',
        specialStats: { blockChance: 0.10, armorBonus: 0.10 }
      },
      VERGELTER: {
        name: 'Vergelter (Schaden & Heilung)',
        description: 'Teilt Schaden mit zweihändigen Waffen aus und unterstützt mit Heilzaubern.',
        specialStats: { healingPower: 0.10, critChance: 0.04 }
      },
      HEILIG: {
        name: 'Heilig (Licht)',
        description: 'Channeler heiliger Energie. Starke Gruppen-Heilung und Schutz-Auren für die gesamte Party.',
        specialStats: { healingPower: 0.20, spellPower: 0.03 }
      }
    }
  },
  MAGIER: {
    name: 'Magier',
    armorTypes: ['cloth'],
    resourceType: 'MANA',
    baseStats: { strength: 2, agility: 5, intellect: 14, stamina: 7 },
    specs: {
      FEUER: {
        name: 'Feuer',
        description: 'Verursacht massiven Schaden über Zeit und explosive kritische Treffer.',
        specialStats: { spellCrit: 0.08, spellPower: 0.05 }
      },
      EIS: {
        name: 'Eis',
        description: 'Kontrolliert Gegner durch Verlangsamung und schützt sich mit Eisschilden.',
        specialStats: { armorBonus: 0.20, spellPower: 0.02 }
      },
      ARKAN: {
        name: 'Arkan (Macht)',
        description: 'Meister reiner magischer Energie. Höchster Burst-Schaden, aber Mana-intensiv.',
        specialStats: { spellPower: 0.10, spellCrit: 0.05 }
      }
    }
  },
  PRIESTER: {
    name: 'Priester',
    armorTypes: ['cloth'],
    resourceType: 'MANA',
    baseStats: { strength: 3, agility: 4, intellect: 12, stamina: 9 },
    specs: {
      SCHATTEN: {
        name: 'Schatten',
        description: 'Nutzt Schattenmagie, um Lebenskraft zu entziehen und Schaden anzurichten.',
        specialStats: { shadowDamage: 0.10, lifeSteal: 0.05 }
      },
      HEILUNG: {
        name: 'Heilung',
        description: 'Hervorragender Heiler, der Verbündete schützt und Wunden schließt.',
        specialStats: { healingPower: 0.15, manaRegenRate: 2 }
      },
      DISZIPLIN: {
        name: 'Disziplin (Schild)',
        description: 'Schützt die Gruppe durch mächtige Absorptionsschilde. Hybrid aus Schaden und Schutz.',
        specialStats: { absorptionBonus: 0.25, healingPower: 0.10 }
      }
    }
  }
};

export class Character {
  constructor(name, gender, raceKey, classKey, specKey) {
    this.name = name;
    this.gender = gender;
    this.raceKey = raceKey;
    this.classKey = classKey;
    this.specKey = specKey;

    this.level = 1;
    this.xp = 0;
    this.gold = 100;
    this.skillPoints = 0;
    this.party = [];

    this.equipment = {
      head: null, chest: null, hands: null,
      legs: null, feet: null, mainHand: null, offHand: null
    };

    this.inventory = [];
    this.talents = {};
    this.passiveEffects = {}; // Registrierte Passiv-Talenteffekte → werden in resetStats angewendet

    this.resetStats();
  }

  resetStats() {
    const race = RACES[this.raceKey];
    const charClass = CLASSES[this.classKey];
    const spec = charClass.specs[this.specKey];

    // 1. Basiswerte + Levelzuwachs
    const levelStats = {
      strength:  charClass.baseStats.strength  + (this.level - 1) * 2,
      agility:   charClass.baseStats.agility   + (this.level - 1) * 1.5,
      intellect: charClass.baseStats.intellect + (this.level - 1) * 2,
      stamina:   charClass.baseStats.stamina   + (this.level - 1) * 2.5
    };

    // 2. Rassenboni
    if (this.raceKey === 'MENSCH') {
      levelStats.strength  += race.bonuses.stats;
      levelStats.agility   += race.bonuses.stats;
      levelStats.intellect += race.bonuses.stats;
      levelStats.stamina   += race.bonuses.stats;
    } else {
      for (const stat in race.bonuses.stats) {
        levelStats[stat] += race.bonuses.stats[stat];
      }
    }

    // 3. Ausrüstungswerte addieren
    this.stats = { ...levelStats };
    this.bonusStats = { strength: 0, agility: 0, intellect: 0, stamina: 0, armor: 0, damage: 0, spellPower: 0, healPower: 0 };
    this.bonusCritChance = 0;
    this.bonusBlockChance = 0;
    this.damageTakenMultiplier = 1.0;
    this.physDmgMultiplier = 1.0;
    this.bonusHealPower = 0;
    this.manaRegenPassive = 0; // Mana pro Runde durch Passiv-Talente

    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (item && item.stats) {
        for (const stat in item.stats) {
          if (this.stats[stat] !== undefined) {
            this.stats[stat] += item.stats[stat];
            this.bonusStats[stat] = (this.bonusStats[stat] || 0) + item.stats[stat];
          } else if (this.bonusStats[stat] !== undefined) {
            this.bonusStats[stat] += item.stats[stat];
          }
        }
      }
    }

    // 3b. Passive Talenteffekte anwenden (NACH Ausrüstung, BEVOR HP/Mana berechnet wird)
    for (const effectFn of Object.values(this.passiveEffects || {})) {
      if (typeof effectFn === 'function') effectFn(this);
    }

    // 4. Max HP — Ausdauer * 11, Zwerg +10%
    let baseMaxHp = Math.round(this.stats.stamina * 11);
    if (this.raceKey === 'ZWERG') baseMaxHp = Math.round(baseMaxHp * race.bonuses.hpMultiplier);
    this.maxHp = baseMaxHp;
    if (this.currentHp === undefined || this.currentHp > this.maxHp) this.currentHp = this.maxHp;

    // 5. Max Ressource
    if (charClass.resourceType === 'MANA') {
      let baseMaxMana = 80 + (this.level - 1) * 12 + this.stats.intellect * 5;
      if (this.raceKey === 'GNOM') baseMaxMana = Math.round(baseMaxMana * race.bonuses.manaMultiplier);
      this.maxResource = baseMaxMana;
      if (this.currentResource === undefined) this.currentResource = this.maxResource;
      else if (this.currentResource > this.maxResource) this.currentResource = this.maxResource;
    } else {
      this.maxResource = 100;
      if (this.currentResource === undefined) this.currentResource = 0;
    }
  }

  // ─── Sekundärwerte ────────────────────────────────────────────────────────

  /** Physischer Schaden: Waffenschaden + Stärke (oder Agility) × 0.5 */
  getPhysicalDamage() {
    const mainHand = this.equipment.mainHand;
    let baseDmg = 3;
    if (mainHand && mainHand.damage) baseDmg = mainHand.damage;

    const scalingStat = (this.classKey === 'KRIEGER' || this.classKey === 'PALADIN')
      ? this.stats.strength
      : this.stats.agility;

    let dmg = Math.round(baseDmg + scalingStat * 0.5);

    // Furor Krieger: Nebenhand gibt 50% Schaden zusätzlich
    if (this.classKey === 'KRIEGER' && this.specKey === 'FUROR' && this.equipment.offHand?.damage) {
      dmg += Math.round(this.equipment.offHand.damage * 0.5);
    }

    // Waffenmeister: passiver Schadensbonus via specialStats.weaponMastery
    const specData = CLASSES[this.classKey]?.specs[this.specKey];
    if (specData?.specialStats?.weaponMastery) {
      dmg = Math.round(dmg * (1 + specData.specialStats.weaponMastery));
    }
    // Passives Schadensbonus-Flag (z.B. aus Passiv-Talenten via passiveEffects)
    if (this.physDmgMultiplier && this.physDmgMultiplier !== 1.0) {
      dmg = Math.round(dmg * this.physDmgMultiplier);
    }

    return dmg;
  }

  /** Zaubermacht: Intelligenz × 0.70 + Item-Boni */
  getSpellPower() {
    let itemBonus = 0;
    if (this.equipment.offHand?.spellPower) itemBonus += this.equipment.offHand.spellPower;
    if (this.equipment.mainHand?.spellPower) itemBonus += this.equipment.mainHand.spellPower;

    let specBonus = 1.0;
    const spec = CLASSES[this.classKey].specs[this.specKey];
    if (spec.specialStats.spellPower) specBonus += spec.specialStats.spellPower;

    return Math.round((this.stats.intellect * 0.70 + itemBonus) * specBonus);
  }

  /** Krit-Chance (physisch): 5% Base + 0.1% pro Agility-Punkt + Spec-Bonus */
  getCritChance() {
    let base = 0.05 + this.stats.agility * 0.001;
    const spec = CLASSES[this.classKey].specs[this.specKey];
    if (spec.specialStats.critChance) base += spec.specialStats.critChance;
    return Math.min(base + (this.bonusCritChance || 0), 0.75);
  }

  /** Krit-Chance (Zauber): 3% Base + 0.1% pro Intelligenz-Punkt + Spec-Bonus */
  getSpellCritChance() {
    let base = 0.03 + this.stats.intellect * 0.001;
    const spec = CLASSES[this.classKey].specs[this.specKey];
    if (spec.specialStats.spellCrit) base += spec.specialStats.spellCrit;
    return Math.min(base + (this.bonusCritChance || 0), 0.75);
  }

  /** Ausweichchance: 4% Base + 0.15% pro Agility + Rassenboni */
  getDodgeChance() {
    let base = 0.04 + this.stats.agility * 0.0015;
    if (this.raceKey === 'NACHTELF') base += RACES.NACHTELF.bonuses.dodgeChance;
    return Math.min(base, 0.40);
  }

  /** Blockchance: nur mit Schild; Spec-Basis + Buff-Boni */
  getBlockChance() {
    if (!this.equipment.offHand?.armor) return 0;
    const spec = CLASSES[this.classKey].specs[this.specKey];
    return Math.min((spec.specialStats.blockChance || 0) + (this.bonusBlockChance || 0), 0.60);
  }

  /** Heilmacht-Multiplikator: spec-basiert + Passiv-Boni */
  getHealPower() {
    let mult = 1.0;
    const spec = CLASSES[this.classKey]?.specs[this.specKey];
    if (spec?.specialStats?.healingPower) mult += spec.specialStats.healingPower;
    if (this.bonusHealPower) mult += this.bonusHealPower;
    return mult;
  }

  /** Prüft ob ein Talent auf mindestens minLevel gelernt wurde */
  hasTalent(talentId, minLevel = 1) {
    return (this.talents?.[talentId] || 0) >= minLevel;
  }

  /** Blockwert: Stärke × 0.3 + Schild-Rüstung × 0.15 */
  getBlockValue() {
    if (!this.equipment.offHand?.armor) return 0;
    return Math.round(this.stats.strength * 0.3 + this.equipment.offHand.armor * 0.15);
  }

  /** Rüstungswert gesamt (inkl. Buff-Boni aus bonusStats.armor) */
  getArmor() {
    let totalArmor = 0;
    for (const slot in this.equipment) {
      if (this.equipment[slot]?.armor) totalArmor += this.equipment[slot].armor;
    }
    totalArmor += Math.floor(this.stats.agility * 0.2);
    // Buff-Boni (z.B. Schildschlag) die über bonusStats.armor gesetzt werden
    if (this.bonusStats?.armor) totalArmor += this.bonusStats.armor;

    const spec = CLASSES[this.classKey].specs[this.specKey];
    if (spec.specialStats.armorBonus) totalArmor = Math.round(totalArmor * (1 + spec.specialStats.armorBonus));

    return totalArmor;
  }

  /**
   * Schadensreduktion in % durch Rüstung.
   * Formel: armor / (armor + level×25 + 150), cap 75%
   * Entspricht ~12% bei Level-1-Startrüstung, ~35% bei vollständigem Plattenset Level 5.
   */
  getDamageReduction() {
    const armor = this.getArmor();
    const reduction = armor / (armor + this.level * 25 + 150);
    return Math.min(reduction, 0.75);
  }

  // ─── Progression ─────────────────────────────────────────────────────────

  /**
   * XP-Kurve: 100 × level^1.75
   * Level 1→2: 100 XP | 2→3: 336 | 3→4: 684 | 4→5: 1131 | 5→6: 1660
   */
  getXpNeeded() {
    return Math.round(100 * Math.pow(this.level, 1.75));
  }

  addXp(amount) {
    this.xp += amount;
    let leveledUp = false;

    while (this.xp >= this.getXpNeeded()) {
      this.xp -= this.getXpNeeded();
      this.level++;
      this.skillPoints++;
      leveledUp = true;
    }

    if (leveledUp) {
      this.resetStats();
      this.currentHp = this.maxHp;
      if (CLASSES[this.classKey].resourceType === 'MANA') this.currentResource = this.maxResource;
    }

    return leveledUp;
  }

  // ─── Sonstiges ───────────────────────────────────────────────────────────

  rest(cost, regenerationPercent) {
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.healPercent(regenerationPercent);
    if (this.party) this.party.forEach(c => c.healPercent(regenerationPercent));
    return true;
  }

  healPercent(pct) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + Math.round(this.maxHp * pct));
    if (CLASSES[this.classKey].resourceType === 'MANA') {
      this.currentResource = Math.min(this.maxResource, this.currentResource + Math.round(this.maxResource * pct));
    }
  }
}

export class Companion extends Character {
  constructor(name, gender, raceKey, classKey, specKey, role) {
    super(name, gender, raceKey, classKey, specKey);
    this.role = role; // 'HEALER' | 'TANK' | 'DAMAGE'
    this.gold = 0;
  }

  syncLevel(playerLevel) {
    while (this.level < playerLevel) {
      this.level++;
      this.skillPoints++;
      this.resetStats();
      this.currentHp = this.maxHp;
      if (CLASSES[this.classKey].resourceType === 'MANA') this.currentResource = this.maxResource;
    }
  }
}
