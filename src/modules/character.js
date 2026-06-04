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
        specialStats: { blockChance: 0.1, armorBonus: 0.15 }
      },
      FUROR: {
        name: 'Furor (Schaden)',
        description: 'Nutzt zwei Waffen gleichzeitig für schnellen, hohen Schaden.',
        specialStats: { dualWield: true, critChance: 0.05 }
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
        specialStats: { blockChance: 0.08, armorBonus: 0.1 }
      },
      VERGELTER: {
        name: 'Vergelter (Schaden & Heilung)',
        description: 'Teilt Schaden mit zweihändigen Waffen aus und unterstützt mit Heilzaubern.',
        specialStats: { healingPower: 0.1, critChance: 0.03 }
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
        specialStats: { armorBonus: 0.2, spellPower: 0.02 }
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
        specialStats: { shadowDamage: 0.1, lifeSteal: 0.05 }
      },
      HEILUNG: {
        name: 'Heilung',
        description: 'Hervorragender Heiler, der Verbündete schützt und Wunden schließt.',
        specialStats: { healingPower: 0.15, manaRegenRate: 2 }
      }
    }
  }
};

export class Character {
  constructor(name, gender, raceKey, classKey, specKey) {
    this.name = name;
    this.gender = gender; // 'm' or 'w'
    this.raceKey = raceKey;
    this.classKey = classKey;
    this.specKey = specKey;

    this.level = 1;
    this.xp = 0;
    this.gold = 100; // Startgold
    this.skillPoints = 0;
    this.party = []; // Companions Array

    // Ausrüstung initialisieren (leer)
    this.equipment = {
      head: null,
      chest: null,
      hands: null,
      legs: null,
      feet: null,
      mainHand: null,
      offHand: null
    };

    // Inventar (Startgegenstände)
    this.inventory = [];

    // Talentpunkte-Verteilung (Key: SkillId, Value: Level)
    this.talents = {};

    this.resetStats();
  }

  // Setzt die Werte basierend auf Level, Rasse und Ausrüstung neu auf
  resetStats() {
    const race = RACES[this.raceKey];
    const charClass = CLASSES[this.classKey];
    const spec = charClass.specs[this.specKey];

    // 1. Basiswerte der Klasse + Zuwachs pro Level
    const levelStats = {
      strength: charClass.baseStats.strength + (this.level - 1) * 2,
      agility: charClass.baseStats.agility + (this.level - 1) * 1.5,
      intellect: charClass.baseStats.intellect + (this.level - 1) * 2,
      stamina: charClass.baseStats.stamina + (this.level - 1) * 2.5
    };

    // 2. Rassenboni anwenden
    if (this.raceKey === 'MENSCH') {
      levelStats.strength += race.bonuses.stats;
      levelStats.agility += race.bonuses.stats;
      levelStats.intellect += race.bonuses.stats;
      levelStats.stamina += race.bonuses.stats;
    } else {
      for (const stat in race.bonuses.stats) {
        levelStats[stat] += race.bonuses.stats[stat];
      }
    }

    // 3. Ausrüstungswerte addieren
    this.stats = { ...levelStats };
    this.bonusStats = { strength: 0, agility: 0, intellect: 0, stamina: 0, armor: 0, damage: 0, spellPower: 0, healPower: 0 };

    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (item) {
        if (item.stats) {
          for (const stat in item.stats) {
            if (this.stats[stat] !== undefined) {
              this.stats[stat] += item.stats[stat];
              this.bonusStats[stat] += item.stats[stat];
            } else if (this.bonusStats[stat] !== undefined) {
              this.bonusStats[stat] += item.stats[stat];
            }
          }
        }
      }
    }

    // 4. Max HP berechnen
    let baseMaxHp = this.stats.stamina * 10;
    if (this.raceKey === 'ZWERG') {
      baseMaxHp = Math.round(baseMaxHp * race.bonuses.hpMultiplier);
    }
    this.maxHp = baseMaxHp;
    if (this.currentHp === undefined || this.currentHp > this.maxHp) {
      this.currentHp = this.maxHp;
    }

    // 5. Max Ressource berechnen
    if (charClass.resourceType === 'MANA') {
      let baseMaxMana = 100 + (this.level - 1) * 15 + this.stats.intellect * 5;
      if (this.raceKey === 'GNOM') {
        baseMaxMana = Math.round(baseMaxMana * race.bonuses.manaMultiplier);
      }
      this.maxResource = baseMaxMana;
      if (this.currentResource === undefined) {
        this.currentResource = this.maxResource;
      } else if (this.currentResource > this.maxResource) {
        this.currentResource = this.maxResource;
      }
    } else {
      // Krieger Wut ist immer maximal 100
      this.maxResource = 100;
      if (this.currentResource === undefined) {
        this.currentResource = 0; // Wut startet bei 0
      }
    }
  }

  // Berechnet die XP, die für das nächste Level benötigt wird
  getXpNeeded() {
    return this.level * 100 + (this.level - 1) * 50;
  }

  // Fügt XP hinzu und führt ggf. Level-Up durch
  addXp(amount) {
    this.xp += amount;
    let leveledUp = false;
    let xpNeeded = this.getXpNeeded();

    while (this.xp >= xpNeeded) {
      this.xp -= xpNeeded;
      this.level++;
      this.skillPoints++;
      leveledUp = true;
      xpNeeded = this.getXpNeeded();
    }

    if (leveledUp) {
      this.resetStats();
      this.currentHp = this.maxHp; // Heilen beim Level-Up
      if (CLASSES[this.classKey].resourceType === 'MANA') {
        this.currentResource = this.maxResource;
      }
    }

    return leveledUp;
  }

  // Berechnet physischen Schaden basierend auf Waffe & Stärke/Beweglichkeit
  getPhysicalDamage() {
    const mainHandItem = this.equipment.mainHand;
    let baseDmg = 3; // Faustschaden
    if (mainHandItem && mainHandItem.damage) {
      baseDmg = mainHandItem.damage;
    }

    // Skalierung: Krieger/Paladin mit Stärke, andere mit Stärke/Beweglichkeit
    const scalingStat = (this.classKey === 'KRIEGER' || this.classKey === 'PALADIN') 
      ? this.stats.strength 
      : this.stats.agility;

    return Math.round(baseDmg + scalingStat * 0.5);
  }

  // Berechnet Zaubermacht basierend auf Intelligenz und Relikten/Waffen
  getSpellPower() {
    const offHandItem = this.equipment.offHand;
    let itemBonus = 0;
    if (offHandItem && offHandItem.spellPower) {
      itemBonus += offHandItem.spellPower;
    }
    if (this.equipment.mainHand && this.equipment.mainHand.spellPower) {
      itemBonus += this.equipment.mainHand.spellPower;
    }

    // Spezifische Spec-Multiplikatoren
    let specBonus = 1.0;
    if (this.classKey === 'MAGIER') {
      const spec = CLASSES.MAGIER.specs[this.specKey];
      if (spec.specialStats.spellPower) {
        specBonus += spec.specialStats.spellPower;
      }
    }

    return Math.round((this.stats.intellect * 0.8 + itemBonus) * specBonus);
  }

  // Berechnet Rüstungswert
  getArmor() {
    let totalArmor = 0;
    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (item && item.armor) {
        totalArmor += item.armor;
      }
    }

    // Rüstungsbonus durch Agilität
    totalArmor += Math.floor(this.stats.agility * 0.2);

    // Spezialisierungs-Bonus (z.B. Krieger/Paladin Tank, Eis-Magier)
    const charClass = CLASSES[this.classKey];
    const spec = charClass.specs[this.specKey];
    if (spec.specialStats.armorBonus) {
      totalArmor = Math.round(totalArmor * (1 + spec.specialStats.armorBonus));
    }

    return totalArmor;
  }

  // Berechnet Schadensreduktion in % basierend auf Rüstung
  getDamageReduction() {
    const armor = this.getArmor();
    // Formel für Schadensreduktion: armor / (armor + level * 20 + 100)
    const reduction = armor / (armor + this.level * 20 + 100);
    return Math.min(reduction, 0.75); // Cap bei 75%
  }

  // Rasten im Gasthaus
  rest(cost, regenerationPercent) {
    if (this.gold < cost) return false;
    this.gold -= cost;
    
    this.healPercent(regenerationPercent);

    // Companions auch heilen
    if (this.party) {
      this.party.forEach(comp => comp.healPercent(regenerationPercent));
    }
    return true;
  }

  healPercent(regenerationPercent) {
    const hpRegen = Math.round(this.maxHp * regenerationPercent);
    this.currentHp = Math.min(this.maxHp, this.currentHp + hpRegen);

    if (CLASSES[this.classKey].resourceType === 'MANA') {
      const manaRegen = Math.round(this.maxResource * regenerationPercent);
      this.currentResource = Math.min(this.maxResource, this.currentResource + manaRegen);
    }
  }
}

export class Companion extends Character {
  constructor(name, gender, raceKey, classKey, specKey, role) {
    super(name, gender, raceKey, classKey, specKey);
    this.role = role; // 'HEALER', 'TANK', 'DAMAGE'
    this.gold = 0; // Companions use player's gold
  }

  // Companions get auto-leveled based on player
  syncLevel(playerLevel) {
    while (this.level < playerLevel) {
      this.level++;
      this.skillPoints++;
      this.resetStats();
      this.currentHp = this.maxHp;
      if (CLASSES[this.classKey].resourceType === 'MANA') {
        this.currentResource = this.maxResource;
      }
    }
  }
}

