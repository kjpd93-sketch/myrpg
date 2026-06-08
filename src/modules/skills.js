/**
 * Skills and Talent tree module
 */

export const SKILL_DATABASE = {
  // --- KRIEGER BASICS ---
  KRIEGER_AUTO: {
    id: 'KRIEGER_AUTO',
    name: 'Standardangriff',
    cost: 0,
    costType: 'WUT',
    type: 'damage',
    description: 'Führt einen physischen Angriff aus. Generiert 10 Wut.',
    execute: (caster, target) => {
      const dmg = caster.getPhysicalDamage();
      target.currentHp = Math.max(0, target.currentHp - dmg);
      caster.currentResource = Math.min(100, caster.currentResource + 10);
      return {
        text: `${caster.name} greift an und verursacht ${dmg} physischen Schaden. (+10 Wut)`,
        damage: dmg,
        healing: 0,
        rageGenerated: 10
      };
    }
  },
  KRIEGER_SMASH: {
    id: 'KRIEGER_SMASH',
    name: 'Zerschmettern',
    cost: 20,
    costType: 'WUT',
    type: 'damage',
    description: '1.25× physischer Schaden. Basisangriff des Kriegers.',
    execute: (caster, target) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 20;
      const baseDmg = caster.getPhysicalDamage() * 1.5;
      const dmg = Math.round(baseDmg);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} zerschmettert das Ziel für ${dmg} physischen Schaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },

  // --- KRIEGER TANK SKILLS ---
  KRIEGER_SHIELD_SLAM: {
    id: 'KRIEGER_SHIELD_SLAM',
    name: 'Schildschlag',
    cost: 15,
    costType: 'WUT',
    type: 'damage',
    description: 'Schlägt mit dem Schild zu (0.8× Waffenschaden). Erhöht eigene Rüstung um 30% für 2 Runden. +20% Schaden pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 15;
      const multiplier = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round(caster.getPhysicalDamage() * 0.8 * multiplier);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      
      // Buff hinzufügen
      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Schildblock',
        duration: 2,
        effect: (c) => { c.bonusStats.armor = (c.bonusStats.armor || 0) + Math.round(c.getArmor() * 0.3); },
        text: 'Rüstung um 30% erhöht.'
      });

      return {
        text: `${caster.name} führt Schildschlag aus: ${dmg} Schaden. Rüstung erhöht!`,
        damage: dmg,
        healing: 0
      };
    }
  },
  KRIEGER_LAST_STAND: {
    id: 'KRIEGER_LAST_STAND',
    name: 'Letztes Gefecht',
    cost: 30,
    costType: 'WUT',
    type: 'heal',
    description: 'Heilt den Krieger um 30% der maximalen Lebenspunkte. +20% Heilmenge pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 30;
      const multiplier = 1 + (talentLevel - 1) * 0.2;
      const heal = Math.round(caster.maxHp * 0.3 * multiplier);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);
      return {
        text: `${caster.name} nutzt Letztes Gefecht und heilt sich um ${heal} Leben.`,
        damage: 0,
        healing: heal
      };
    }
  },
  KRIEGER_DEMO_SHOUT: {
    id: 'KRIEGER_DEMO_SHOUT',
    name: 'Demoralisierender Ruf',
    cost: 10,
    costType: 'WUT',
    type: 'debuff',
    description: '🎯 SPOTT: Zwingt alle Gegner 2 Runden, dich anzugreifen. Verringert zudem ihren Schaden um 25% für 3 Runden. +5% pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 10) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 10;

      target.debuffs = target.debuffs || [];
      target.debuffs.push({
        name: 'Demoralisiert',
        duration: 3,
        effect: (t) => { t.damageDebuff = 0.25 + (talentLevel - 1) * 0.05; },
        text: 'Schaden verringert.'
      });

      return {
        text: `${caster.name} brüllt herausfordernd! Die Gegner richten ihre Wut auf ihn.`,
        damage: 0,
        healing: 0,
        taunt: true,
        tauntDuration: 2
      };
    }
  },
  KRIEGER_SMASH: {
    id: 'KRIEGER_SMASH',
    name: 'Zerschmettern',
    cost: 15,
    costType: 'WUT',
    type: 'damage',
    description: '1.5× physischer Schaden. Kein Skalieren mit Talentniveau.',
    execute: (caster, target) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 15;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.5);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} nutzt Zerschmettern: ${dmg} Schaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },

  // --- KRIEGER FUROR SKILLS ---
  KRIEGER_BLOODTHIRST: {
    id: 'KRIEGER_BLOODTHIRST',
    name: 'Blutdurst',
    cost: 20,
    costType: 'WUT',
    type: 'damage',
    description: '1.3× physischer Schaden + heilt den Krieger um 6% seiner maximalen LP. +25% Schaden & Heilung pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.3 * mult);
      const heal = Math.round(caster.maxHp * 0.06 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);
      return {
        text: `${caster.name} nutzt Blutdurst: ${dmg} Schaden. Heilt sich um ${heal} Leben.`,
        damage: dmg,
        healing: heal
      };
    }
  },
  KRIEGER_RECKLESSNESS: {
    id: 'KRIEGER_RECKLESSNESS',
    name: 'Tollkühnheit',
    cost: 40,
    costType: 'WUT',
    type: 'buff',
    description: 'Erhöht Krit-Chance für 3 Runden: +40% (Stufe 1) / +50% (Stufe 2) / +60% (Stufe 3).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 40;
      
      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Tollkühnheit',
        duration: 3,
        // additiv — überschreibt NICHT den Bonus aus Passiv-Talenten (Blutfieber etc.)
        effect: (c) => { c.bonusCritChance = (c.bonusCritChance || 0) + 0.40 + (talentLevel - 1) * 0.10; },
        text: 'Kritische Trefferchance erhöht.'
      });

      return {
        text: `${caster.name} verfällt in Tollkühnheit! Kritische Trefferchance massiv erhöht.`,
        damage: 0,
        healing: 0
      };
    }
  },
  KRIEGER_WHIRLWIND: {
    id: 'KRIEGER_WHIRLWIND', aoe: true,
    name: 'Wirbelwind',
    cost: 30,
    costType: 'WUT',
    type: 'damage',
    description: 'Trifft alle Gegner (1.1× Schaden) + Blutung (DoT) für 3 Runden. +20% Schaden pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.1 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.debuffs = target.debuffs || [];
      const dotDmg = Math.round(caster.getPhysicalDamage() * 0.3 * mult);
      target.debuffs.push({
        name: 'Tiefe Wunden',
        duration: 3,
        dot: dotDmg,
        text: `Blutet für ${dotDmg} pro Runde.`
      });

      return {
        text: `${caster.name} wirbelt herum: ${dmg} Schaden. Gegner bluten!`,
        damage: dmg,
        healing: 0,
        isAoe: true
      };
    }
  },

  // --- PALADIN BASICS ---
  PALADIN_AUTO: {
    id: 'PALADIN_AUTO',
    name: 'Standardangriff',
    cost: 0,
    costType: 'MANA',
    type: 'damage',
    description: 'Führt einen physischen Angriff aus. Siegel des Lichts heilt passiv um 4 Leben.',
    execute: (caster, target) => {
      const dmg = caster.getPhysicalDamage();
      target.currentHp = Math.max(0, target.currentHp - dmg);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + 4);
      return {
        text: `${caster.name} greift an: ${dmg} physischer Schaden. Heilt sich passiv um 4 Leben.`,
        damage: dmg,
        healing: 4
      };
    }
  },

  // --- PALADIN TANK SKILLS ---
  PALADIN_AVENGERS_SHIELD: {
    id: 'PALADIN_AVENGERS_SHIELD',
    name: 'Schild des Rächers',
    cost: 20,
    costType: 'MANA',
    type: 'damage',
    description: '🎯 SPOTT: Zieht 2 Runden die Aggro aller Gegner. Verursacht Heiligschaden, Betäubungschance 65% (+10% pro Talentniveau).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((caster.getPhysicalDamage() * 0.6 + caster.getSpellPower() * 0.4) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      const stunChance = 0.65 + (talentLevel - 1) * 0.10; // 65% / 75% / 85%
      const stunned = Math.random() < stunChance;
      if (stunned) target.stunned = true;

      return {
        text: stunned
          ? `${caster.name} wirft Schild des Rächers: ${dmg} Heiligschaden. 💫 Ziel ist BETÄUBT! (${Math.round(stunChance*100)}%)`
          : `${caster.name} wirft Schild des Rächers: ${dmg} Heiligschaden. Ziel widersteht der Betäubung!`,
        damage: dmg,
        healing: 0,
        taunt: true,
        tauntDuration: 2
      };
    }
  },
  PALADIN_HOLY_SHIELD: {
    id: 'PALADIN_HOLY_SHIELD',
    name: 'Heiliger Schild',
    cost: 25,
    costType: 'MANA',
    type: 'buff',
    description: 'Blockchance +25% für 3 Runden. Geblockte Angriffe verursachen Heilig-Vergeltungsschaden. +5% Block pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;

      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Heiliger Schild',
        duration: 3,
        effect: (c) => {
          // additiv — überschreibt NICHT den Bonus aus Heilige Pflicht [Passiv]
          c.bonusBlockChance = (c.bonusBlockChance || 0) + 0.25 + (talentLevel - 1) * 0.05;
          c.blockRetaliation = Math.round(c.getSpellPower() * 0.3);
        },
        text: 'Blockchance erhöht, Vergeltungsschaden aktiv.'
      });

      return {
        text: `${caster.name} aktiviert Heiligen Schild!`,
        damage: 0,
        healing: 0
      };
    }
  },
  PALADIN_FLASH_OF_LIGHT: {
    id: 'PALADIN_FLASH_OF_LIGHT',
    name: 'Lichtblitz',
    cost: 15,
    costType: 'MANA',
    type: 'heal',
    description: 'Schnelle Selbstheilung basierend auf Heilmacht. +30% Heilmenge pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const heal = Math.round((20 + caster.getSpellPower() * 0.8) * mult * (caster.getHealPower?.() || 1));
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);
      return {
        text: `${caster.name} wirkt Lichtblitz und heilt sich um ${heal} Leben.`,
        damage: 0,
        healing: heal
      };
    }
  },

  // --- PALADIN DAMAGE/HEAL (VERGELTER) SKILLS ---
  PALADIN_CRUSADER_STRIKE: {
    id: 'PALADIN_CRUSADER_STRIKE',
    name: 'Kreuzfahrerstoß',
    cost: 15,
    costType: 'MANA',
    type: 'damage',
    description: '1.4× physischer Schaden. +25% Schaden pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.4 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} führt Kreuzfahrerstoß aus: ${dmg} physischer Schaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },
  PALADIN_JUDGEMENT: {
    id: 'PALADIN_JUDGEMENT',
    name: 'Richturteil',
    cost: 20,
    costType: 'MANA',
    type: 'damage',
    description: 'Wirft ein Richturteil auf den Feind, das Heiligschaden verursacht und den erlittenen Schaden des Ziels um 15% erhöht (2 Runden).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((15 + caster.getSpellPower() * 0.6) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.debuffs = target.debuffs || [];
      target.debuffs.push({
        name: 'Verurteilt',
        duration: 2,
        effect: (t) => { t.damageTakenMultiplier = 1.15 + (talentLevel - 1) * 0.05; },
        text: 'Erlittener Schaden um 15% erhöht.'
      });

      return {
        text: `${caster.name} wirkt Richturteil: ${dmg} Heiligschaden. Schadensanfälligkeit des Ziels erhöht!`,
        damage: dmg,
        healing: 0
      };
    }
  },
  PALADIN_WORD_OF_GLORY: {
    id: 'PALADIN_WORD_OF_GLORY',
    name: 'Wort der Herrlichkeit',
    cost: 30,
    costType: 'MANA',
    type: 'heal',
    description: 'Starke Heilung auf ein Ziel + Absorptionsschild basierend auf Heilmacht. +30% Heilung & Schild pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const heal = Math.round((35 + caster.getSpellPower() * 1.2) * mult * (caster.getHealPower?.() || 1));
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);

      // Schild-Effekt
      caster.shield = (caster.shield || 0) + Math.round(heal * 0.3);

      return {
        text: `${caster.name} wirkt Wort der Herrlichkeit: ${heal} Heilung und ${Math.round(heal * 0.3)} Absorptionsschild.`,
        damage: 0,
        healing: heal
      };
    }
  },

  // --- MAGIER BASICS ---
  MAGIER_AUTO: {
    id: 'MAGIER_AUTO',
    name: 'Zauberstab-Angriff',
    cost: 0,
    costType: 'MANA',
    type: 'damage',
    description: 'Verschießt magische Energie. Verursacht geringen Zauberschaden.',
    execute: (caster, target) => {
      const dmg = Math.round(5 + caster.getSpellPower() * 0.25);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} wirft Magiegeschoss: ${dmg} Zauberschaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },
  MAGIER_EVOCATION: {
    id: 'MAGIER_EVOCATION',
    name: 'Hervorrufung',
    cost: 0,
    costType: 'MANA',
    type: 'buff',
    description: 'Konzentriert sich eine Runde lang und stellt 50 Mana wieder her.',
    execute: (caster, target) => {
      caster.currentResource = Math.min(caster.maxResource, caster.currentResource + 50);
      caster.skipNextTurn = true; // Kostet die nächste Runde
      return {
        text: `${caster.name} kanalisiert Hervorrufung und stellt 50 Mana wieder her (Muss nächste Runde aussetzen).`,
        damage: 0,
        healing: 0
      };
    }
  },

  // --- MAGIER FEUER SKILLS ---
  MAGIER_FIREBALL: {
    id: 'MAGIER_FIREBALL',
    name: 'Feuerball',
    cost: 20,
    costType: 'MANA',
    type: 'damage',
    description: 'Feuerschaden + Verbrennung-DoT (3 Runden). +20% Schaden & DoT pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((20 + caster.getSpellPower() * 1.0) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.debuffs = target.debuffs || [];
      const burnDmg = Math.round((5 + caster.getSpellPower() * 0.2) * mult);
      target.debuffs.push({
        name: 'Brand',
        duration: 3,
        dot: burnDmg,
        text: `Verbrennt für ${burnDmg} pro Runde.`
      });

      return {
        text: `${caster.name} schießt Feuerball: ${dmg} Feuerschaden. Ziel brennt!`,
        damage: dmg,
        healing: 0
      };
    }
  },
  MAGIER_FIRE_BLAST: {
    id: 'MAGIER_FIRE_BLAST',
    name: 'Feuerschlag',
    cost: 25,
    costType: 'MANA',
    type: 'damage',
    description: 'Ein sofortiger Hitzeausbruch mit einer um 30% erhöhten Chance auf kritische Treffer.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      
      const isCrit = Math.random() < (0.35 + (talentLevel - 1) * 0.05);
      const mult = (1 + (talentLevel - 1) * 0.2) * (isCrit ? 2.0 : 1.0);
      const dmg = Math.round((15 + caster.getSpellPower() * 0.8) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      return {
        text: `${caster.name} wirkt Feuerschlag: ${dmg} Feuerschaden.${isCrit ? ' (KRITISCHER TREFFER!)' : ''}`,
        damage: dmg,
        healing: 0,
        isCrit
      };
    }
  },
  MAGIER_PYROBLAST: {
    id: 'MAGIER_PYROBLAST',
    name: 'Pyroschlag',
    cost: 40,
    costType: 'MANA',
    type: 'damage',
    description: 'Massiver Feuerschaden (1.6× SpellPower). +30% Schaden pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 40;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const dmg = Math.round((45 + caster.getSpellPower() * 1.8) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      return {
        text: `${caster.name} entfesselt Pyroschlag für spektakuläre ${dmg} Feuerschaden!`,
        damage: dmg,
        healing: 0
      };
    }
  },

  // --- MAGIER EIS SKILLS ---
  MAGIER_FROSTBOLT: {
    id: 'MAGIER_FROSTBOLT',
    name: 'Frostblitz',
    cost: 20,
    costType: 'MANA',
    type: 'damage',
    description: 'Feuert einen Frostblitz ab. Verursacht Eisschaden und verringert die gegnerische Trefferchance um 20% für 2 Runden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((15 + caster.getSpellPower() * 0.8) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.debuffs = target.debuffs || [];
      target.debuffs.push({
        name: 'Unterkühlt',
        duration: 2,
        effect: (t) => { t.hitChanceModifier = -0.20 - (talentLevel - 1) * 0.05; },
        text: 'Trefferchance um 20% verringert.'
      });

      return {
        text: `${caster.name} schießt Frostblitz: ${dmg} Eisschaden. Ziel ist unterkühlt!`,
        damage: dmg,
        healing: 0
      };
    }
  },
  MAGIER_ICE_BARRIER: {
    id: 'MAGIER_ICE_BARRIER',
    name: 'Eisbarriere',
    cost: 30,
    costType: 'MANA',
    type: 'buff',
    description: 'Absorptionsschild (SpellPower × 1.5) für 3 Runden. +30% Schildstärke pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const shieldValue = Math.round((30 + caster.getSpellPower() * 1.5) * mult);
      caster.shield = (caster.shield || 0) + shieldValue;

      return {
        text: `${caster.name} beschwört Eisbarriere und absorbiert die nächsten ${shieldValue} Schaden.`,
        damage: 0,
        healing: 0
      };
    }
  },
  MAGIER_DEEP_FREEZE: {
    id: 'MAGIER_DEEP_FREEZE',
    name: 'Tieffrieren',
    cost: 35,
    costType: 'MANA',
    type: 'damage',
    description: 'Friert den Gegner tief ein. Verursacht Eisschaden. Einfrierchance: 60% (+10% pro Talentniveau).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 35) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 35;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((20 + caster.getSpellPower() * 0.9) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      const stunChance = 0.60 + (talentLevel - 1) * 0.10; // 60% / 70% / 80%
      const stunned = Math.random() < stunChance;
      if (stunned) target.stunned = true;

      return {
        text: stunned
          ? `${caster.name} wirkt Tieffrieren: ${dmg} Eisschaden. 🧊 Ziel ist EINGEFROREN! (${Math.round(stunChance*100)}%)`
          : `${caster.name} wirkt Tieffrieren: ${dmg} Eisschaden. Ziel widersteht dem Frost!`,
        damage: dmg,
        healing: 0
      };
    }
  },

  // --- PRIESTER BASICS ---
  PRIESTER_AUTO: {
    id: 'PRIESTER_AUTO',
    name: 'Zauberstab-Angriff',
    cost: 0,
    costType: 'MANA',
    type: 'damage',
    description: 'Geringer Magieschaden auf Distanz.',
    execute: (caster, target) => {
      const dmg = Math.round(4 + caster.getSpellPower() * 0.2);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} greift mit Zauberstab an: ${dmg} Schaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },
  PRIESTER_RENEW: {
    id: 'PRIESTER_RENEW',
    name: 'Erneuerung',
    cost: 15,
    costType: 'MANA',
    type: 'heal',
    description: 'Heilt den Priester über Zeit (HoT) für 3 Runden.',
    execute: (caster, target) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;

      caster.buffs = caster.buffs || [];
      const hotValue = Math.round(5 + caster.getSpellPower() * 0.3);
      caster.buffs.push({
        name: 'Erneuerung',
        duration: 3,
        hot: hotValue,
        text: `Heilt um ${hotValue} pro Runde.`
      });

      return {
        text: `${caster.name} wirkt Erneuerung (Heilung über Zeit gestartet).`,
        damage: 0,
        healing: 0
      };
    }
  },
  PRIESTER_SMITE: {
    id: 'PRIESTER_SMITE',
    name: 'Heilige Pein',
    cost: 10,
    costType: 'MANA',
    type: 'damage',
    description: 'Zerschmettert den Feind mit heiligem Licht.',
    execute: (caster, target) => {
      if (caster.currentResource < 10) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 10;
      const dmg = Math.round(10 + caster.getSpellPower() * 0.8);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} wirkt Heilige Pein: ${dmg} Heiligschaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },

  // --- PRIESTER SCHATTEN SKILLS ---
  PRIESTER_MIND_BLAST: {
    id: 'PRIESTER_MIND_BLAST',
    name: 'Gedankenschlag',
    cost: 20,
    costType: 'MANA',
    type: 'damage',
    description: 'Hoher Schattenschaden (SpellPower × 1.3). +25% Schaden pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((22 + caster.getSpellPower() * 1.1) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return {
        text: `${caster.name} wirkt Gedankenschlag: ${dmg} Schattenschaden.`,
        damage: dmg,
        healing: 0
      };
    }
  },
  PRIESTER_SW_PAIN: {
    id: 'PRIESTER_SW_PAIN',
    name: 'Schattenwort: Schmerz',
    cost: 15,
    costType: 'MANA',
    type: 'damage',
    description: 'Hinterlässt einen Schatten-DoT (3 Runden). Heilt den Priester um 50% des angerichteten Initialschadens.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const initialDmg = Math.round((10 + caster.getSpellPower() * 0.4) * mult);
      const heal = Math.round(initialDmg * 0.5);
      
      target.currentHp = Math.max(0, target.currentHp - initialDmg);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);

      target.debuffs = target.debuffs || [];
      const dotDmg = Math.round((5 + caster.getSpellPower() * 0.2) * mult);
      target.debuffs.push({
        name: 'Schattenwort: Schmerz',
        duration: 3,
        dot: dotDmg,
        text: `Nimmt ${dotDmg} Schattenschaden pro Runde.`
      });

      return {
        text: `${caster.name} wirkt Schattenwort: Schmerz: ${initialDmg} Schaden. Heilt sich um ${heal} Leben.`,
        damage: initialDmg,
        healing: heal
      };
    }
  },
  PRIESTER_MIND_FLAY: {
    id: 'PRIESTER_MIND_FLAY',
    name: 'Gedankenschinder',
    cost: 25,
    costType: 'MANA',
    type: 'damage',
    description: 'Entzieht dem Ziel Lebensenergie. Verursacht Schattenschaden und heilt den Priester um den gleichen Betrag.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((15 + caster.getSpellPower() * 0.7) * mult);
      
      target.currentHp = Math.max(0, target.currentHp - dmg);
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + dmg);

      return {
        text: `${caster.name} entzieht Lebenskraft mit Gedankenschinder: ${dmg} Schaden absorbiert und geheilt.`,
        damage: dmg,
        healing: dmg
      };
    }
  },

  // --- PRIESTER HEILUNG SKILLS ---
  PRIESTER_FLASH_HEAL: {
    id: 'PRIESTER_FLASH_HEAL',
    name: 'Blitzheilung',
    cost: 20,
    costType: 'MANA',
    type: 'heal',
    description: 'Schnelle, starke Sofort-Heilung (SpellPower × 1.4). +35% Heilung pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.35;
      const heal = Math.round((30 + caster.getSpellPower() * 1.4) * mult * (caster.getHealPower?.() || 1));
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);
      return {
        text: `${caster.name} wirkt Blitzheilung und regeneriert ${heal} Leben.`,
        damage: 0,
        healing: heal
      };
    }
  },
  PRIESTER_SHIELD: {
    id: 'PRIESTER_SHIELD',
    name: 'Machtwort: Schild',
    cost: 25,
    costType: 'MANA',
    type: 'buff',
    description: 'Absorptionsschild (SpellPower × 1.8) für 4 Runden. +30% Schildstärke pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const shieldValue = Math.round((25 + caster.getSpellPower() * 1.2) * mult);
      caster.shield = (caster.shield || 0) + shieldValue;

      return {
        text: `${caster.name} errichtet Machtwort: Schild und fängt ${shieldValue} Schaden ab.`,
        damage: 0,
        healing: 0
      };
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // KRIEGER — NEUE 3. SPEC: WAFFEN (Waffenmeister)
  // ═══════════════════════════════════════════════════════════════════════════
  KRIEGER_HEROIC_STRIKE: {
    id: 'KRIEGER_HEROIC_STRIKE',
    name: 'Heroischer Hieb',
    cost: 15, costType: 'WUT', type: 'damage',
    description: 'Ein präziser, schwerer Hieb mit vollem Waffenpotenzial. 1.8× physischer Schaden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.8 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return { text: `${caster.name} führt Heroischen Hieb aus: ${dmg} physischer Schaden.`, damage: dmg, healing: 0 };
    }
  },
  KRIEGER_MORTAL_STRIKE: {
    id: 'KRIEGER_MORTAL_STRIKE',
    name: 'Tödlicher Hieb',
    cost: 25, costType: 'WUT', type: 'damage',
    description: 'Fügt massive Wunden zu. 2.0× physischer Schaden + Heilungsunterdrückung (−50%, 2 Runden).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round(caster.getPhysicalDamage() * 2.0 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Offene Wunde', duration: 2 + (talentLevel - 1), effect: (t) => { t.healingReduction = 0.50; }, text: 'Heilung um 50% reduziert.' });
      return { text: `${caster.name} schlägt tödlich zu: ${dmg} Schaden! Heilungsunterdrückung aktiv!`, damage: dmg, healing: 0 };
    }
  },
  KRIEGER_BLADESTORM: {
    id: 'KRIEGER_BLADESTORM', aoe: true,
    name: 'Klingensturm',
    cost: 35, costType: 'WUT', type: 'damage',
    description: 'Wirbelt die Klinge durch alle Feinde. 1.3× physischer Schaden auf ALLE Gegner.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 35) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 35;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.3 * mult);
      // AoE: wird in combat.js als isAoe behandelt wenn wir es markieren
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return { text: `${caster.name} entfesselt den Klingensturm: ${dmg} physischer Schaden!`, damage: dmg, healing: 0, isAoe: true };
    }
  },
  // ─── KRIEGER WAFFEN: Passiv ────────────────────────────────────────────────
  KRIEGER_WEAPON_MASTERY: {
    id: 'KRIEGER_WEAPON_MASTERY',
    name: 'Waffenmeisterschaft',
    type: 'passive',
    description: '[PASSIV] +8% physischer Gesamtschaden pro Stufe.',
    execute: () => ({ text: '[Passiv] Waffenmeisterschaft ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.physDmgMultiplier = (c.physDmgMultiplier || 1.0) + 0.08 * level; }
  },

  KRIEGER_AVATAR: {
    id: 'KRIEGER_AVATAR',
    name: 'Avatar des Kriegers',
    cost: 60, costType: 'WUT', type: 'damage',
    description: '★ ULTIMATE ★ Drei Angriffe in einer Runde. Jeder trifft für 100% physischen Schaden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 60) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 60;
      const mult = 1 + (talentLevel - 1) * 0.15;
      let totalDmg = 0;
      const hits = [];
      for (let i = 0; i < 3; i++) {
        const dmg = Math.round(caster.getPhysicalDamage() * 1.0 * mult);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        totalDmg += dmg;
        hits.push(dmg);
      }
      return { text: `${caster.name} wird zum AVATAR! Drei Schläge: ${hits.join(' / ')} = ${totalDmg} Gesamtschaden!`, damage: totalDmg, healing: 0 };
    }
  },

  // ─── KRIEGER TANK: Passiv + Ultimate ──────────────────────────────────────
  KRIEGER_IRON_FORTRESS: {
    id: 'KRIEGER_IRON_FORTRESS',
    name: 'Eisenfestung',
    type: 'passive',
    description: '[PASSIV] +20 Rüstung pro Stufe. Geblockte Angriffe generieren 8 Wut.',
    execute: () => ({ text: '[Passiv] Eisenfestung ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusStats.armor = (c.bonusStats.armor || 0) + 20 * level; }
  },
  KRIEGER_LAST_BASTION: {
    id: 'KRIEGER_LAST_BASTION',
    name: 'Letzte Bastion',
    cost: 50, costType: 'WUT', type: 'buff',
    description: '★ ULTIMATE ★ Reduziert erlittenen Schaden für 3 Runden um 50% und generiert sofort 30 Wut.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 50) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 50;
      caster.currentResource = Math.min(100, caster.currentResource + 30);
      caster.buffs = caster.buffs || [];
      caster.buffs.push({ name: 'Letzte Bastion', duration: 3 + (talentLevel - 1), effect: (c) => { c.damageTakenMultiplier = 0.50; }, text: 'Schaden um 50% reduziert.' });
      return { text: `${caster.name} hält die LETZTE BASTION! Schaden halbiert für ${3 + (talentLevel-1)} Runden (+30 Wut)!`, damage: 0, healing: 0 };
    }
  },

  // ─── KRIEGER FUROR: Passiv + Ultimate ─────────────────────────────────────
  KRIEGER_BLOOD_FRENZY: {
    id: 'KRIEGER_BLOOD_FRENZY',
    name: 'Blutfieber',
    type: 'passive',
    description: '[PASSIV] +6% Krit-Chance pro Stufe. Kritische Treffer generieren 8 extra Wut.',
    execute: () => ({ text: '[Passiv] Blutfieber ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusCritChance = (c.bonusCritChance || 0) + 0.06 * level; }
  },
  KRIEGER_EXECUTE: {
    id: 'KRIEGER_EXECUTE',
    name: 'Hinrichten',
    cost: 40, costType: 'WUT', type: 'damage',
    description: '★ ULTIMATE ★ Vernichtender Schlag. Wenn Feind <30% HP: +300% physischer Schaden!',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 40;
      const mult = 1 + (talentLevel - 1) * 0.30;
      const isExecute = (target.currentHp / (target.maxHp || target.hp)) <= 0.30;
      const dmgMult = isExecute ? 4.0 * mult : 1.5 * mult;
      const dmg = Math.round(caster.getPhysicalDamage() * dmgMult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const tag = isExecute ? ' ⚡ HINRICHTEN!' : '';
      return { text: `${caster.name} Hinrichten: ${dmg} physischer Schaden!${tag}`, damage: dmg, healing: 0 };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PALADIN — NEUE 3. SPEC: HEILIG (Licht)
  // ═══════════════════════════════════════════════════════════════════════════
  PALADIN_HOLY_LIGHT: {
    id: 'PALADIN_HOLY_LIGHT',
    name: 'Heiliges Licht',
    cost: 20, costType: 'MANA', type: 'heal',
    description: 'Starke Direktheilung auf einen Verbündeten. Skaliert stark mit Heilmacht.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.30;
      const heal = Math.round((40 + caster.getSpellPower() * 1.5) * mult * (caster.getHealPower?.() || 1));
      target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
      return { text: `${caster.name} wirkt Heiliges Licht auf ${target.name}: +${heal} Lebenspunkte.`, damage: 0, healing: heal };
    }
  },
  PALADIN_BEACON: {
    id: 'PALADIN_BEACON',
    name: 'Leuchtfeuer der Hoffnung',
    cost: 25, costType: 'MANA', type: 'heal',
    description: 'Heilt die gesamte Party über 4 Runden (HoT). Starker Gruppen-Support.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const hotVal = Math.round((8 + caster.getSpellPower() * 0.35) * mult * (caster.getHealPower?.() || 1));
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => {
        h.buffs = h.buffs || [];
        if (!h.buffs.some(b => b.name === 'Leuchtfeuer')) {
          h.buffs.push({ name: 'Leuchtfeuer', duration: 4 + (talentLevel - 1), hot: hotVal });
        }
      });
      return { text: `${caster.name} entfacht Leuchtfeuer der Hoffnung! Gesamte Party regeneriert ${hotVal} LP/Runde.`, damage: 0, healing: 0 };
    }
  },
  PALADIN_CONSECRATION: {
    id: 'PALADIN_CONSECRATION', aoe: true,
    name: 'Weihe',
    cost: 30, costType: 'MANA', type: 'damage',
    description: 'Weiht den Boden. Heiligschaden an allen Feinden + heilt Party um 50% davon.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round((18 + caster.getSpellPower() * 0.7) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const healPerHero = Math.round(dmg * 0.5 * (caster.getHealPower?.() || 1));
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => { h.currentHp = Math.min(h.maxHp, h.currentHp + healPerHero); });
      return { text: `${caster.name} wirkt Weihe: ${dmg} Heiligschaden. Party heilt ${healPerHero} LP.`, damage: dmg, healing: healPerHero * allHeroes.length, isAoe: true };
    }
  },
  PALADIN_HOLY_AURA: {
    id: 'PALADIN_HOLY_AURA',
    name: 'Heilige Aura',
    type: 'passive',
    description: '[PASSIV] Dauerhafte Aura: gesamte Party erleidet 5% weniger Schaden pro Stufe.',
    execute: () => ({ text: '[Passiv] Heilige Aura schützt die Party.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.holyAuraLevel = level; } // Wird in combat.js geprüft
  },
  PALADIN_DIVINE_STORM: {
    id: 'PALADIN_DIVINE_STORM', aoe: true,
    name: 'Göttlicher Sturm',
    cost: 55, costType: 'MANA', type: 'damage',
    description: '★ ULTIMATE ★ Heiligschaden auf alle Feinde + heilt Party um 40% des Gesamtschadens.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 55) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 55;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((35 + caster.getSpellPower() * 1.2) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const healPerHero = Math.round(dmg * 0.40 * (caster.getHealPower?.() || 1));
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => { h.currentHp = Math.min(h.maxHp, h.currentHp + healPerHero); });
      return { text: `${caster.name} entfesselt GÖTTLICHEN STURM! ${dmg} Heiligschaden. Party +${healPerHero} LP!`, damage: dmg, healing: healPerHero * allHeroes.length, isAoe: true };
    }
  },

  // ─── PALADIN TANK: Passiv + Ultimate ──────────────────────────────────────
  PALADIN_SACRED_DUTY: {
    id: 'PALADIN_SACRED_DUTY',
    name: 'Heilige Pflicht',
    type: 'passive',
    description: '[PASSIV] +8% Blockchance pro Stufe. Geblockte Angriffe: heilt für 10 LP.',
    execute: () => ({ text: '[Passiv] Heilige Pflicht ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusBlockChance = (c.bonusBlockChance || 0) + 0.08 * level; }
  },
  PALADIN_DIVINE_PROTECTION: {
    id: 'PALADIN_DIVINE_PROTECTION',
    name: 'Göttlicher Schutz',
    cost: 60, costType: 'MANA', type: 'buff',
    description: '★ ULTIMATE ★ Gesamte Party nimmt 1 Runde lang NULL Schaden. Danach 2 Runden +20% Rüstung.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 60) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 60;
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => {
        h.buffs = h.buffs || [];
        h.buffs.push({ name: 'Göttlicher Schutz', duration: 1 + (talentLevel - 1), effect: (c) => { c.damageTakenMultiplier = 0.0; } });
      });
      return { text: `${caster.name} ruft GÖTTLICHEN SCHUTZ! Party ist 1 Runde unverwundbar!`, damage: 0, healing: 0 };
    }
  },

  // ─── PALADIN VERGELTER: Passiv + Ultimate ─────────────────────────────────
  PALADIN_SEAL_OF_COMMAND: {
    id: 'PALADIN_SEAL_OF_COMMAND',
    name: 'Siegel des Befehls',
    type: 'passive',
    description: '[PASSIV] +8% physischer Schaden pro Stufe. Siegel verleiht Stärke bei jedem Angriff.',
    execute: () => ({ text: '[Passiv] Siegel des Befehls ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.physDmgMultiplier = (c.physDmgMultiplier || 1.0) + 0.08 * level; }
  },
  PALADIN_AVENGING_WRATH: {
    id: 'PALADIN_AVENGING_WRATH',
    name: 'Rächer-Zorn',
    cost: 50, costType: 'MANA', type: 'buff',
    description: '★ ULTIMATE ★ +50% Schaden für 3 Runden. Heilt Party um 25% des verursachten Schadens.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 50) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 50;
      caster.buffs = caster.buffs || [];
      caster.buffs.push({ name: 'Rächer-Zorn', duration: 3 + (talentLevel - 1), effect: (c) => { c.physDmgMultiplier = (c.physDmgMultiplier || 1.0) + 0.50; } });
      return { text: `${caster.name} entfesselt RÄCHER-ZORN! +50% Schaden für ${3+(talentLevel-1)} Runden!`, damage: 0, healing: 0 };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAGIER — NEUE 3. SPEC: ARKAN (Macht)
  // ═══════════════════════════════════════════════════════════════════════════
  MAGIER_ARCANE_MISSILES: {
    id: 'MAGIER_ARCANE_MISSILES',
    name: 'Arkane Geschosse',
    cost: 20, costType: 'MANA', type: 'damage',
    description: 'Feuert 3 arkane Geschosse. Jedes trifft separat und kann krit. treffen.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.20;
      let totalDmg = 0;
      const hits = [];
      for (let i = 0; i < 3; i++) {
        let dmg = Math.round((5 + caster.getSpellPower() * 0.45) * mult);
        const isCrit = Math.random() < (caster.getSpellCritChance?.() || 0.05);
        if (isCrit) dmg = Math.round(dmg * 1.75);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        totalDmg += dmg;
        hits.push(isCrit ? `${dmg}★` : `${dmg}`);
      }
      return { text: `${caster.name} feuert Arkane Geschosse: ${hits.join(' + ')} = ${totalDmg} arkan. Schaden.`, damage: totalDmg, healing: 0 };
    }
  },
  MAGIER_ARCANE_BLAST: {
    id: 'MAGIER_ARCANE_BLAST',
    name: 'Arkaner Einschlag',
    cost: 40, costType: 'MANA', type: 'damage',
    description: 'Massiver Burst-Zauber. 2.2× SpellPower Arkaner Schaden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 40;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((25 + caster.getSpellPower() * 2.2) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return { text: `${caster.name} entfesselt Arkanen Einschlag: ${dmg} arkaner Schaden!`, damage: dmg, healing: 0 };
    }
  },
  MAGIER_COUNTERSPELL: {
    id: 'MAGIER_COUNTERSPELL',
    name: 'Gegenzauber',
    cost: 25, costType: 'MANA', type: 'debuff',
    description: 'Unterbricht den Feind. Unterbrechungschance: 75% (+8% pro Talentniveau). Außerdem 3 Runden Magieschaden (DoT).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dotDmg = Math.round((6 + caster.getSpellPower() * 0.30) * mult);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Magieunterdrückung', duration: 3, dot: dotDmg });

      const stunChance = 0.75 + (talentLevel - 1) * 0.08; // 75% / 83% / 91%
      const stunned = Math.random() < stunChance;
      if (stunned) target.stunned = true;

      return {
        text: stunned
          ? `${caster.name} wirkt Gegenzauber! 🔇 Ziel unterbrochen (${Math.round(stunChance*100)}%) + ${dotDmg} Magieschaden/Runde.`
          : `${caster.name} wirkt Gegenzauber! Ziel widersteht der Unterbrechung, aber ${dotDmg} Magieschaden/Runde wirkt!`,
        damage: 0, healing: 0
      };
    }
  },
  MAGIER_ARCANE_POWER: {
    id: 'MAGIER_ARCANE_POWER',
    name: 'Arkane Macht',
    type: 'passive',
    description: '[PASSIV] +6% Spell-Crit und +8% SpellPower-Bonus pro Stufe.',
    execute: () => ({ text: '[Passiv] Arkane Macht ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => {
      c.bonusCritChance = (c.bonusCritChance || 0) + 0.06 * level;
      // SpellPower-Bonus via additiven Wert der in getSpellPower() addiert wird
      c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + Math.round(c.stats.intellect * 0.08 * level);
    }
  },
  MAGIER_ARCANE_SURGE: {
    id: 'MAGIER_ARCANE_SURGE',
    name: 'Arkaner Ausbruch',
    cost: 65, costType: 'MANA', type: 'damage',
    description: '★ ULTIMATE ★ Vier arkane Einschläge in einer Runde. Jeder kann krit. treffen.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 65) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 65;
      const mult = 1 + (talentLevel - 1) * 0.20;
      let totalDmg = 0;
      const hits = [];
      for (let i = 0; i < 4; i++) {
        let dmg = Math.round((10 + caster.getSpellPower() * 0.90) * mult);
        const isCrit = Math.random() < (caster.getSpellCritChance?.() || 0.05);
        if (isCrit) dmg = Math.round(dmg * 1.75);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        totalDmg += dmg;
        hits.push(isCrit ? `${dmg}★` : `${dmg}`);
      }
      return { text: `${caster.name} ARKANER AUSBRUCH! ${hits.join(' + ')} = ${totalDmg} arkan. Schaden!`, damage: totalDmg, healing: 0 };
    }
  },

  // ─── MAGIER FEUER: Passiv + Ultimate ──────────────────────────────────────
  MAGIER_IGNITE: {
    id: 'MAGIER_IGNITE',
    name: 'Entzünden',
    type: 'passive',
    description: '[PASSIV] +5% Spell-Crit pro Stufe. Crit-Treffer hinterlassen verstärkten Brand.',
    execute: () => ({ text: '[Passiv] Entzünden ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusCritChance = (c.bonusCritChance || 0) + 0.05 * level; }
  },
  MAGIER_FLAMESTRIKE: {
    id: 'MAGIER_FLAMESTRIKE', aoe: true,
    name: 'Flammeneinschlag',
    cost: 65, costType: 'MANA', type: 'damage',
    description: '★ ULTIMATE ★ Massiver Feuer-AoE auf alle Feinde. Brand-DoT auf alle (3 Runden).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 65) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 65;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((40 + caster.getSpellPower() * 1.8) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const burnDmg = Math.round((8 + caster.getSpellPower() * 0.25) * mult);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Inferno-Brand', duration: 3, dot: burnDmg });
      return { text: `${caster.name} regnet FLAMMENEINSCHLAG! ${dmg} Feuerschaden + Brand!`, damage: dmg, healing: 0, isAoe: true };
    }
  },

  // ─── MAGIER EIS: Passiv + Ultimate ────────────────────────────────────────
  MAGIER_SHATTER: {
    id: 'MAGIER_SHATTER',
    name: 'Zersplittern',
    type: 'passive',
    description: '[PASSIV] +6% Spell-Crit pro Stufe. Krit auf unterkühlte Feinde +40% Bonus.',
    execute: () => ({ text: '[Passiv] Zersplittern ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusCritChance = (c.bonusCritChance || 0) + 0.06 * level; }
  },
  MAGIER_FROZEN_ORB: {
    id: 'MAGIER_FROZEN_ORB', aoe: true,
    name: 'Gefrorene Kugel',
    cost: 65, costType: 'MANA', type: 'damage',
    description: '★ ULTIMATE ★ AoE Eisschaden auf alle Feinde. Slow-Debuff (−25% Trefferchance) für 3 Runden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 65) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 65;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((35 + caster.getSpellPower() * 1.6) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Tiefer Frost', duration: 3, effect: (t) => { t.hitChanceModifier = -0.25 - (talentLevel - 1) * 0.05; } });
      return { text: `${caster.name} schleudert GEFRORENE KUGEL! ${dmg} Eisschaden. Alle Feinde verlangsamt!`, damage: dmg, healing: 0, isAoe: true };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIESTER — NEUE 3. SPEC: DISZIPLIN (Schild)
  // ═══════════════════════════════════════════════════════════════════════════
  PRIESTER_PENANCE: {
    id: 'PRIESTER_PENANCE',
    name: 'Buße',
    cost: 20, costType: 'MANA', type: 'damage',
    description: 'Kanalisiert Schattenlicht. 2 Treffer Schaden + heilt sich um 60% davon.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.25;
      let totalDmg = 0;
      for (let i = 0; i < 2; i++) {
        const dmg = Math.round((12 + caster.getSpellPower() * 0.55) * mult);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        totalDmg += dmg;
      }
      const heal = Math.round(totalDmg * 0.60 * (caster.getHealPower?.() || 1));
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);
      return { text: `${caster.name} wirkt Buße: ${totalDmg} Schaden, heilt sich um ${heal} LP.`, damage: totalDmg, healing: heal };
    }
  },
  PRIESTER_PAIN_SUPRESSION: {
    id: 'PRIESTER_PAIN_SUPRESSION',
    name: 'Schmerzunterdrückung',
    cost: 25, costType: 'MANA', type: 'buff',
    description: 'Schützt ein Ziel: −40% Schaden für 3 Runden. Kann auf Verbündete gewirkt werden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const t = target || caster;
      t.buffs = t.buffs || [];
      t.buffs.push({ name: 'Schmerzunterdrückung', duration: 3 + (talentLevel - 1), effect: (c) => { c.damageTakenMultiplier = 0.60; }, text: 'Schaden um 40% reduziert.' });
      return { text: `${caster.name} wirkt Schmerzunterdrückung auf ${t.name}: 40% weniger Schaden!`, damage: 0, healing: 0 };
    }
  },
  PRIESTER_DIVINE_AEGIS: {
    id: 'PRIESTER_DIVINE_AEGIS',
    name: 'Göttliche Ägide',
    cost: 30, costType: 'MANA', type: 'buff',
    description: 'Großes Absorptionsschild basierend auf SpellPower. Schützt vor nächstem Schaden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.30;
      const absBonus = caster.getAbsorptionBonus?.() || 0;
      const shieldVal = Math.round((35 + caster.getSpellPower() * 1.8) * mult * (1 + absBonus));
      caster.shield = (caster.shield || 0) + shieldVal;
      return { text: `${caster.name} errichtet Göttliche Ägide: ${shieldVal} Schaden absorbiert.`, damage: 0, healing: 0 };
    }
  },
  PRIESTER_DISC_PASSIVE: {
    id: 'PRIESTER_DISC_PASSIVE',
    name: 'Disziplin-Aura',
    type: 'passive',
    description: '[PASSIV] Schilde 15% stärker pro Stufe. Party erleidet dauerhaft 4% weniger Schaden.',
    execute: () => ({ text: '[Passiv] Disziplin-Aura schützt die Party.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.discAuraLevel = level; } // Wird in combat.js geprüft
  },
  PRIESTER_SPIRIT_SHELL: {
    id: 'PRIESTER_SPIRIT_SHELL',
    name: 'Geistesschale',
    cost: 70, costType: 'MANA', type: 'buff',
    description: '★ ULTIMATE ★ Gesamte Party erhält Schild = 40% ihres maximalen HP.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 70) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 70;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const absBonus = caster.getAbsorptionBonus?.() || 0;
      const allHeroes = [caster, ...(caster.party || [])];
      let totalShield = 0;
      allHeroes.forEach(h => {
        const shieldVal = Math.round(h.maxHp * 0.40 * mult * (1 + absBonus));
        h.shield = (h.shield || 0) + shieldVal;
        totalShield += shieldVal;
      });
      return { text: `${caster.name} hüllt alle in die GEISTESSCHALE! Jeder absorb. bis zu ${Math.round(totalShield/allHeroes.length)} Schaden!`, damage: 0, healing: 0 };
    }
  },

  // ─── PRIESTER SCHATTEN: Passiv + Ultimate ─────────────────────────────────
  PRIESTER_SHADOWFORM: {
    id: 'PRIESTER_SHADOWFORM',
    name: 'Schattenform',
    type: 'passive',
    description: '[PASSIV] +10% Schaden und +8% Krit-Chance pro Stufe. Schattenschmerz heilt stärker.',
    execute: () => ({ text: '[Passiv] Schattenform ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => {
      c.bonusCritChance = (c.bonusCritChance || 0) + 0.08 * level;
      // Priester greift mit Zaubern an → SpellPower-Bonus statt physDmgMultiplier
      c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + Math.round(c.stats.intellect * 0.10 * level);
    }
  },
  PRIESTER_VOID_ERUPTION: {
    id: 'PRIESTER_VOID_ERUPTION', aoe: true,
    name: 'Leerenausbruch',
    cost: 60, costType: 'MANA', type: 'damage',
    description: '★ ULTIMATE ★ Massiver Schattenschaden + Schatten-DoT auf alle Feinde (3 Runden).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 60) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 60;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((38 + caster.getSpellPower() * 2.2) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const dotDmg = Math.round((8 + caster.getSpellPower() * 0.30) * mult);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Leeren-DoT', duration: 3, dot: dotDmg });
      return { text: `${caster.name} öffnet die LEERE! ${dmg} Schattenschaden + DoT auf alle!`, damage: dmg, healing: 0, isAoe: true };
    }
  },

  // ─── PRIESTER HEILUNG: Passiv + Ultimate ──────────────────────────────────
  PRIESTER_HOLY_CONCENTRATION: {
    id: 'PRIESTER_HOLY_CONCENTRATION',
    name: 'Heilige Konzentration',
    type: 'passive',
    description: '[PASSIV] +10 Mana-Regeneration pro Runde pro Stufe. Heilen als Berufung.',
    execute: () => ({ text: '[Passiv] Heilige Konzentration ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.manaRegenPassive = (c.manaRegenPassive || 0) + 10 * level; }
  },
  PRIESTER_DIVINE_HYMN: {
    id: 'PRIESTER_DIVINE_HYMN',
    name: 'Göttliche Hymne',
    cost: 75, costType: 'MANA', type: 'heal',
    description: '★ ULTIMATE ★ Heilt gesamte Party um 50% der maximalen Lebenspunkte.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 75) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 75;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const allHeroes = [caster, ...(caster.party || [])];
      let totalHeal = 0;
      allHeroes.forEach(h => {
        const heal = Math.round(h.maxHp * 0.50 * mult * (caster.getHealPower?.() || 1));
        h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
        totalHeal += heal;
      });
      return { text: `${caster.name} singt GÖTTLICHE HYMNE! Gesamte Party geheilt (je ~${Math.round(totalHeal/allHeroes.length)} LP)!`, damage: 0, healing: totalHeal };
    }
  },

  PRIESTER_PRAYER: {
    id: 'PRIESTER_PRAYER',
    name: 'Gebet der Besserung',
    cost: 30,
    costType: 'MANA',
    type: 'heal',
    description: 'Heilt den Priester voll und hinterlässt eine Barriere, die den nächsten erlittenen Schaden halbiert.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const heal = Math.round((40 + caster.getSpellPower() * 1.5) * mult * (caster.getHealPower?.() || 1));
      caster.currentHp = Math.min(caster.maxHp, caster.currentHp + heal);

      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Gebetsschutz',
        duration: 2,
        effect: (c) => { c.damageTakenMultiplier = 0.5; },
        text: 'Erlittener Schaden um 50% verringert.'
      });

      return {
        text: `${caster.name} wirkt Gebet der Besserung: Heilt ${heal} Leben und halbiert erlittenen Schaden für 2 Runden.`,
        damage: 0,
        healing: heal
      };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUE SKILLS FÜR 7er-TALENTBÄUME
  // ═══════════════════════════════════════════════════════════════════════════

  // ── KRIEGER SCHUTZ: Schildwall ──────────────────────────────────────────
  KRIEGER_SHIELD_WALL: {
    id: 'KRIEGER_SHIELD_WALL', name: 'Schildwall',
    cost: 25, costType: 'WUT', type: 'buff',
    description: 'Gesamte Party erleidet 20% weniger Schaden für 3 Runden. +5% pro Talentniveau.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 25;
      const reduction = 0.80 - (talentLevel - 1) * 0.05; // 0.80 / 0.75 / 0.70
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => {
        h.buffs = h.buffs || [];
        h.buffs.push({ name: 'Schildwall', duration: 3, effect: (c) => { c.damageTakenMultiplier = Math.min(c.damageTakenMultiplier || 1.0, reduction); }, text: `Schaden um ${Math.round((1-reduction)*100)}% reduziert.` });
      });
      return { text: `${caster.name} errichtet den Schildwall! Party nimmt ${Math.round((1-reduction)*100)}% weniger Schaden.`, damage: 0, healing: 0 };
    }
  },
  // ── KRIEGER SCHUTZ: Unnachgiebigkeit (Passiv) ──────────────────────────
  KRIEGER_TENACITY: {
    id: 'KRIEGER_TENACITY', name: 'Unnachgiebigkeit', type: 'passive',
    description: '[PASSIV] +5% maximale Lebenspunkte pro Stufe.',
    execute: () => ({ text: '[Passiv] Unnachgiebigkeit ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.maxHp = Math.round(c.maxHp * (1 + 0.05 * level)); }
  },

  // ── KRIEGER FUROR: Rampage ──────────────────────────────────────────────
  KRIEGER_RAMPAGE: {
    id: 'KRIEGER_RAMPAGE', name: 'Amoklauf',
    cost: 30, costType: 'WUT', type: 'damage',
    description: '3 schnelle Schläge à 0.6× Waffenschaden. Jeder Treffer generiert 5 Wut. +15% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.15;
      let total = 0; const hits = [];
      for (let i = 0; i < 3; i++) {
        const dmg = Math.round(caster.getPhysicalDamage() * 0.6 * mult);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        total += dmg; hits.push(dmg);
        caster.currentResource = Math.min(100, caster.currentResource + 5);
      }
      return { text: `${caster.name} geht Amok: ${hits.join(' + ')} = ${total} Schaden! (+15 Wut)`, damage: total, healing: 0 };
    }
  },
  // ── KRIEGER FUROR: Enrage (Passiv) ──────────────────────────────────────
  KRIEGER_ENRAGE: {
    id: 'KRIEGER_ENRAGE', name: 'Raserei', type: 'passive',
    description: '[PASSIV] Unter 50% HP: +12% physischer Schaden pro Stufe.',
    execute: () => ({ text: '[Passiv] Raserei ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => {
      // Wird in resetStats gesetzt; im Kampf prüft combat.js den HP-Stand
      c.enrageLevel = level;
    }
  },

  // ── KRIEGER WAFFEN: Überlegenheit ───────────────────────────────────────
  KRIEGER_OVERPOWER: {
    id: 'KRIEGER_OVERPOWER', name: 'Überlegenheit',
    cost: 10, costType: 'WUT', type: 'damage',
    description: 'Garantierter kritischer Treffer. 1.5× Waffenschaden. +20% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 10) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 10;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round(caster.getPhysicalDamage() * 1.5 * mult * 2.0); // garantierter Krit
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return { text: `${caster.name} nutzt Überlegenheit: ${dmg} KRITISCHER Schaden!`, damage: dmg, healing: 0, isCrit: true };
    }
  },
  // ── KRIEGER WAFFEN: Tiefe Wunden (Passiv) ──────────────────────────────
  KRIEGER_DEEP_WOUNDS: {
    id: 'KRIEGER_DEEP_WOUNDS', name: 'Tiefe Wunden', type: 'passive',
    description: '[PASSIV] Kritische Treffer hinterlassen Blutung: 8% Waffenschaden pro Runde, 3 Runden. Pro Stufe +4%.',
    execute: () => ({ text: '[Passiv] Tiefe Wunden ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.deepWoundsLevel = level; }
  },

  // ── MAGIER FEUER: Lebende Bombe ─────────────────────────────────────────
  MAGIER_LIVING_BOMB: {
    id: 'MAGIER_LIVING_BOMB', name: 'Lebende Bombe',
    cost: 30, costType: 'MANA', type: 'damage',
    description: 'Belegt Ziel mit Feuerbombe: 4 Runden DoT, dann Explosion für 2× SpellPower AoE-Schaden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dotDmg = Math.round((8 + caster.getSpellPower() * 0.30) * mult);
      target.debuffs = target.debuffs || [];
      const explosionDmg = Math.round(caster.getSpellPower() * 2 * mult);
      target.debuffs.push({ name: 'Lebende Bombe', duration: 4, dot: dotDmg, explosionDmg, text: `Brennt für ${dotDmg}/Runde, explodiert dann für ${explosionDmg} AoE.` });
      const initialDmg = Math.round((10 + caster.getSpellPower() * 0.4) * mult);
      target.currentHp = Math.max(0, target.currentHp - initialDmg);
      return { text: `${caster.name} belegt ${target.name} mit Lebender Bombe: ${initialDmg} Feuerschaden + ${dotDmg}/Runde DoT!`, damage: initialDmg, healing: 0 };
    }
  },
  // ── MAGIER FEUER: Feuermeister (Passiv) ─────────────────────────────────
  MAGIER_FIRE_MASTERY: {
    id: 'MAGIER_FIRE_MASTERY', name: 'Feuermeister', type: 'passive',
    description: '[PASSIV] Alle Feuerzauber +10% Schaden pro Stufe. Brand-DoTs +15% stärker.',
    execute: () => ({ text: '[Passiv] Feuermeister ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.fireMasteryLevel = level; c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + Math.round(c.stats.intellect * 0.06 * level); }
  },

  // ── MAGIER EIS: Frostnova ───────────────────────────────────────────────
  MAGIER_FROST_NOVA: {
    id: 'MAGIER_FROST_NOVA', aoe: true, name: 'Frostnova',
    cost: 25, costType: 'MANA', type: 'damage',
    description: 'AoE Eisexplosion: Eisschaden + 50% Betäubungschance auf alle Feinde. +8% Chance pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round((12 + caster.getSpellPower() * 0.5) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const stunChance = 0.50 + (talentLevel - 1) * 0.08;
      const stunned = Math.random() < stunChance;
      if (stunned) target.stunned = true;
      return { text: stunned ? `${caster.name} wirkt Frostnova: ${dmg} Eisschaden. 🧊 EINGEFROREN!` : `${caster.name} wirkt Frostnova: ${dmg} Eisschaden.`, damage: dmg, healing: 0, isAoe: true };
    }
  },
  // ── MAGIER EIS: Kälteschutz (Passiv) ────────────────────────────────────
  MAGIER_COLD_SNAP: {
    id: 'MAGIER_COLD_SNAP', name: 'Kälteschutz', type: 'passive',
    description: '[PASSIV] Absorptionsschilde +12% stärker pro Stufe. Frostblitz verlangsamt +5% stärker.',
    execute: () => ({ text: '[Passiv] Kälteschutz ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.coldSnapLevel = level; c.bonusShieldMult = (c.bonusShieldMult || 0) + 0.12 * level; }
  },

  // ── MAGIER ARKAN: Nether-Sturm ─────────────────────────────────────────
  MAGIER_NETHER_TEMPEST: {
    id: 'MAGIER_NETHER_TEMPEST', name: 'Nether-Sturm',
    cost: 35, costType: 'MANA', type: 'damage',
    description: 'Arkaner Sturm: Schaden + stellt 20 Mana wieder her. +20% Schaden pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 35) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 35;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round((20 + caster.getSpellPower() * 1.1) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      caster.currentResource = Math.min(caster.maxResource, caster.currentResource + 20);
      return { text: `${caster.name} entfesselt Nether-Sturm: ${dmg} arkaner Schaden! (+20 Mana zurück)`, damage: dmg, healing: 0 };
    }
  },
  // ── MAGIER ARKAN: Mana-Adept (Passiv) ───────────────────────────────────
  MAGIER_MANA_ADEPT: {
    id: 'MAGIER_MANA_ADEPT', name: 'Mana-Adept', type: 'passive',
    description: '[PASSIV] +8 Mana-Regeneration pro Runde pro Stufe. +3% max Mana pro Stufe.',
    execute: () => ({ text: '[Passiv] Mana-Adept ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.manaRegenPassive = (c.manaRegenPassive || 0) + 8 * level; c.maxResource = Math.round(c.maxResource * (1 + 0.03 * level)); }
  },

  // ── PALADIN SCHUTZ: Reckoning ───────────────────────────────────────────
  PALADIN_RECKONING: {
    id: 'PALADIN_RECKONING', name: 'Vergeltungsschlag',
    cost: 15, costType: 'MANA', type: 'damage',
    description: 'Kontert den nächsten Angriff mit 2× Waffenschaden. Buff hält 2 Runden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round(caster.getPhysicalDamage() * 2.0 * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      return { text: `${caster.name} schlägt vergeltend zu: ${dmg} Schaden!`, damage: dmg, healing: 0 };
    }
  },
  // ── PALADIN SCHUTZ: Unerschütterlich (Passiv) ──────────────────────────
  PALADIN_ARDENT_DEFENDER: {
    id: 'PALADIN_ARDENT_DEFENDER', name: 'Unerschütterlich', type: 'passive',
    description: '[PASSIV] Unter 35% HP: erlittener Schaden −10% pro Stufe.',
    execute: () => ({ text: '[Passiv] Unerschütterlich ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.ardentDefenderLevel = level; }
  },

  // ── PALADIN VERGELTER: Tempelritter-Urteil ──────────────────────────────
  PALADIN_TEMPLARS_VERDICT: {
    id: 'PALADIN_TEMPLARS_VERDICT', name: 'Tempelritter-Urteil',
    cost: 25, costType: 'MANA', type: 'damage',
    description: 'Heiliger Schlag: physisch + Heiligschaden. Hoher Single-Target-Burst. +25% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const physDmg = Math.round(caster.getPhysicalDamage() * 1.2 * mult);
      const holyDmg = Math.round(caster.getSpellPower() * 0.8 * mult);
      const total = physDmg + holyDmg;
      target.currentHp = Math.max(0, target.currentHp - total);
      return { text: `${caster.name} fällt Tempelritter-Urteil: ${physDmg} phys. + ${holyDmg} heilig = ${total} Schaden!`, damage: total, healing: 0 };
    }
  },
  // ── PALADIN VERGELTER: Heilige Stärke (Passiv) ─────────────────────────
  PALADIN_SANCTITY: {
    id: 'PALADIN_SANCTITY', name: 'Heilige Stärke', type: 'passive',
    description: '[PASSIV] +6% Heiligschaden und physischer Schaden pro Stufe.',
    execute: () => ({ text: '[Passiv] Heilige Stärke ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.physDmgMultiplier = (c.physDmgMultiplier || 1.0) + 0.06 * level; c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + Math.round(c.stats.intellect * 0.04 * level); }
  },

  // ── PALADIN HEILIG: Handauflegung ───────────────────────────────────────
  PALADIN_LAY_ON_HANDS: {
    id: 'PALADIN_LAY_ON_HANDS', name: 'Handauflegung',
    cost: 40, costType: 'MANA', type: 'heal',
    description: 'Massive Heilung auf ein Ziel: 60% maxHP + Absorptionsschild. +15% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 40;
      const mult = 1 + (talentLevel - 1) * 0.15;
      const t = target || caster;
      const heal = Math.round(t.maxHp * 0.60 * mult * (caster.getHealPower?.() || 1));
      t.currentHp = Math.min(t.maxHp, t.currentHp + heal);
      const shieldVal = Math.round(heal * 0.25);
      t.shield = (t.shield || 0) + shieldVal;
      return { text: `${caster.name} legt ${t.name} die Hände auf: +${heal} HP + ${shieldVal} Schild!`, damage: 0, healing: heal };
    }
  },
  // ── PALADIN HEILIG: Erleuchtung (Passiv) ────────────────────────────────
  PALADIN_ILLUMINATION: {
    id: 'PALADIN_ILLUMINATION', name: 'Erleuchtung', type: 'passive',
    description: '[PASSIV] Heilzauber +8% stärker pro Stufe. +5 Mana-Regeneration pro Runde.',
    execute: () => ({ text: '[Passiv] Erleuchtung ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusHealPower = (c.bonusHealPower || 0) + 0.08 * level; c.manaRegenPassive = (c.manaRegenPassive || 0) + 5 * level; }
  },

  // ── PRIESTER SCHATTEN: Vampirische Umarmung ─────────────────────────────
  PRIESTER_VAMPIRIC_EMBRACE: {
    id: 'PRIESTER_VAMPIRIC_EMBRACE', name: 'Vampirische Umarmung',
    cost: 20, costType: 'MANA', type: 'damage',
    description: 'Schattenangriff: Schaden + Party heilt 25% des Schadens. +20% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round((18 + caster.getSpellPower() * 0.9) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const healPer = Math.round(dmg * 0.25);
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => { h.currentHp = Math.min(h.maxHp, h.currentHp + healPer); });
      return { text: `${caster.name} wirkt Vampirische Umarmung: ${dmg} Schattenschaden. Party heilt je ${healPer} LP!`, damage: dmg, healing: healPer * allHeroes.length };
    }
  },
  // ── PRIESTER SCHATTEN: Dunkelheit (Passiv) ──────────────────────────────
  PRIESTER_DARKNESS: {
    id: 'PRIESTER_DARKNESS', name: 'Dunkelheit', type: 'passive',
    description: '[PASSIV] Schatten-DoTs +15% Schaden pro Stufe. Lebensraub +5% pro Stufe.',
    execute: () => ({ text: '[Passiv] Dunkelheit ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.darknessLevel = level; c.bonusStats.spellPower = (c.bonusStats.spellPower || 0) + Math.round(c.stats.intellect * 0.05 * level); }
  },

  // ── PRIESTER HEILUNG: Kreis der Heilung ─────────────────────────────────
  PRIESTER_CIRCLE_OF_HEALING: {
    id: 'PRIESTER_CIRCLE_OF_HEALING', name: 'Kreis der Heilung',
    cost: 30, costType: 'MANA', type: 'heal',
    description: 'AoE-Heilung auf gesamte Party. +25% Heilung pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const allHeroes = [caster, ...(caster.party || [])];
      let totalHeal = 0;
      allHeroes.forEach(h => {
        const heal = Math.round((20 + caster.getSpellPower() * 0.7) * mult * (caster.getHealPower?.() || 1));
        h.currentHp = Math.min(h.maxHp, h.currentHp + heal);
        totalHeal += heal;
      });
      return { text: `${caster.name} wirkt Kreis der Heilung: Party heilt je ${Math.round(totalHeal/allHeroes.length)} LP!`, damage: 0, healing: totalHeal };
    }
  },
  // ── PRIESTER HEILUNG: Innerer Fokus (Passiv) ───────────────────────────
  PRIESTER_INNER_FOCUS: {
    id: 'PRIESTER_INNER_FOCUS', name: 'Innerer Fokus', type: 'passive',
    description: '[PASSIV] +8% Heilung pro Stufe. Kritische Heilung +5% Chance pro Stufe.',
    execute: () => ({ text: '[Passiv] Innerer Fokus ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.bonusHealPower = (c.bonusHealPower || 0) + 0.08 * level; c.bonusCritChance = (c.bonusCritChance || 0) + 0.05 * level; }
  },

  // ── PRIESTER DISZIPLIN: Sühne ───────────────────────────────────────────
  PRIESTER_ATONEMENT: {
    id: 'PRIESTER_ATONEMENT', name: 'Sühne',
    cost: 20, costType: 'MANA', type: 'damage',
    description: 'Heiligschaden auf Feind + Party erhält Schild = 40% des Schadens. +20% pro Stufe.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.20;
      const dmg = Math.round((15 + caster.getSpellPower() * 0.7) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const shieldPer = Math.round(dmg * 0.40);
      const allHeroes = [caster, ...(caster.party || [])];
      allHeroes.forEach(h => { h.shield = (h.shield || 0) + shieldPer; });
      return { text: `${caster.name} wirkt Sühne: ${dmg} Heiligschaden. Party +${shieldPer} Schild!`, damage: dmg, healing: 0 };
    }
  },
  // ── PRIESTER DISZIPLIN: Schutzgeist (Passiv) ──────────────────────────
  PRIESTER_SPIRIT_OF_REDEMPTION: {
    id: 'PRIESTER_SPIRIT_OF_REDEMPTION', name: 'Schutzgeist', type: 'passive',
    description: '[PASSIV] Schilde +10% stärker pro Stufe. Wenn Schild bricht: Heilt Träger um 15% maxHP pro Stufe.',
    execute: () => ({ text: '[Passiv] Schutzgeist ist dauerhaft aktiv.', damage: 0, healing: 0 }),
    passiveEffect: (c, level) => { c.spiritOfRedemptionLevel = level; c.bonusShieldMult = (c.bonusShieldMult || 0) + 0.10 * level; }
  }
};

// Talentbaum-Konfigurationen pro Klasse und Spezialisierung
// requires: { talent: 'ID', level: N } — Voraussetzung
// levelRequired: N — Charakter-Level das benötigt wird
// type: 'passive' — wird nur gelernt, nicht aktiv eingesetzt
// ═══════════════════════════════════════════════════════════════════════════════
// TALENT TREES — 7 Einträge pro Baum, Tier-Gates via treePointsRequired
// Reihe 1 (0 Punkte): 2 Skills | Reihe 2 (3 Punkte): 2 Skills
// Reihe 3 (6 Punkte): 2 Skills | Ultimate (10 Punkte): 1 Skill
// ═══════════════════════════════════════════════════════════════════════════════
export const TALENT_TREES = {
  KRIEGER: {
    SCHUTZ: [
      // --- Reihe 1 (0 Punkte) ---
      { id: 'KRIEGER_SHIELD_SLAM', maxLevel: 3, name: 'Schildschlag', treePointsRequired: 0,
        desc: 'Schaltet Schildschlag frei. +20% Schaden pro Stufe.' },
      { id: 'KRIEGER_DEMO_SHOUT', maxLevel: 3, name: 'Demoralisierender Ruf', treePointsRequired: 0,
        desc: 'Feind −5% Schaden pro Stufe.' },
      // --- Reihe 2 (3 Punkte) ---
      { id: 'KRIEGER_LAST_STAND', maxLevel: 3, name: 'Letztes Gefecht', treePointsRequired: 3,
        desc: '+20% Selbstheilung pro Stufe.' },
      { id: 'KRIEGER_SHIELD_WALL', maxLevel: 3, name: 'Schildwall', treePointsRequired: 3,
        desc: 'Party −20% Schaden für 3 Runden. +5% pro Stufe.' },
      // --- Reihe 3 (6 Punkte) ---
      { id: 'KRIEGER_IRON_FORTRESS', maxLevel: 3, name: '⚙ Eisenfestung [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+20 Rüstung pro Stufe. Geblockte Angriffe → +8 Wut.' },
      { id: 'KRIEGER_TENACITY', maxLevel: 3, name: '⚙ Unnachgiebigkeit [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+5% maximale Lebenspunkte pro Stufe.' },
      // --- Ultimate (10 Punkte) ---
      { id: 'KRIEGER_LAST_BASTION', maxLevel: 3, name: '★ Letzte Bastion [Ultimate]', treePointsRequired: 10,
        desc: '50% weniger Schaden für 3+ Runden + 30 Wut.' }
    ],
    FUROR: [
      { id: 'KRIEGER_BLOODTHIRST', maxLevel: 3, name: 'Blutdurst', treePointsRequired: 0,
        desc: 'Schaden + Selbstheilung. +25% pro Stufe.' },
      { id: 'KRIEGER_WHIRLWIND', maxLevel: 3, name: 'Wirbelwind', treePointsRequired: 0,
        desc: 'AoE + Blutungseffekt. +20% Schaden pro Stufe.' },
      { id: 'KRIEGER_RECKLESSNESS', maxLevel: 3, name: 'Tollkühnheit', treePointsRequired: 3,
        desc: '+10% Krit-Chance pro Stufe.' },
      { id: 'KRIEGER_RAMPAGE', maxLevel: 3, name: 'Amoklauf', treePointsRequired: 3,
        desc: '3 Schläge à 0.6× Schaden. +15% pro Stufe.' },
      { id: 'KRIEGER_BLOOD_FRENZY', maxLevel: 3, name: '⚙ Blutfieber [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+6% Krit-Chance pro Stufe. Crits → +8 Wut.' },
      { id: 'KRIEGER_ENRAGE', maxLevel: 3, name: '⚙ Raserei [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Unter 50% HP: +12% physischer Schaden pro Stufe.' },
      { id: 'KRIEGER_EXECUTE', maxLevel: 3, name: '★ Hinrichten [Ultimate]', treePointsRequired: 10,
        desc: '4× Schaden wenn Feind <30% HP.' }
    ],
    WAFFEN: [
      { id: 'KRIEGER_HEROIC_STRIKE', maxLevel: 3, name: 'Heroischer Hieb', treePointsRequired: 0,
        desc: '1.8× physisch. +25% pro Stufe.' },
      { id: 'KRIEGER_BLADESTORM', maxLevel: 3, name: 'Klingensturm', treePointsRequired: 0,
        desc: 'AoE 1.3× auf alle Feinde.' },
      { id: 'KRIEGER_MORTAL_STRIKE', maxLevel: 3, name: 'Tödlicher Hieb', treePointsRequired: 3,
        desc: '2.0× physisch + Heilungs-Unterdrückung.' },
      { id: 'KRIEGER_OVERPOWER', maxLevel: 3, name: 'Überlegenheit', treePointsRequired: 3,
        desc: 'Garantierter Krit. 1.5× Waffenschaden. +20% pro Stufe.' },
      { id: 'KRIEGER_WEAPON_MASTERY', maxLevel: 3, name: '⚙ Waffenmeisterschaft [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8% physischer Gesamtschaden pro Stufe.' },
      { id: 'KRIEGER_DEEP_WOUNDS', maxLevel: 3, name: '⚙ Tiefe Wunden [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Crits hinterlassen Blutung: 8% Waffenschaden/Runde, 3 Runden. +4% pro Stufe.' },
      { id: 'KRIEGER_AVATAR', maxLevel: 3, name: '★ Avatar des Kriegers [Ultimate]', treePointsRequired: 10,
        desc: '3 Angriffe à 100% Schaden.' }
    ]
  },
  PALADIN: {
    SCHUTZ: [
      { id: 'PALADIN_AVENGERS_SHIELD', maxLevel: 3, name: 'Schild des Rächers', treePointsRequired: 0,
        desc: 'Betäubung + Heiligschaden. +20% pro Stufe.' },
      { id: 'PALADIN_HOLY_SHIELD', maxLevel: 3, name: 'Heiliger Schild', treePointsRequired: 0,
        desc: '+5% Blockchance + Vergeltungsschaden pro Stufe.' },
      { id: 'PALADIN_FLASH_OF_LIGHT', maxLevel: 3, name: 'Lichtblitz', treePointsRequired: 3,
        desc: 'Schnelle Selbstheilung. +30% pro Stufe.' },
      { id: 'PALADIN_RECKONING', maxLevel: 3, name: 'Vergeltungsschlag', treePointsRequired: 3,
        desc: 'Konterschlag: 2× Waffenschaden. +25% pro Stufe.' },
      { id: 'PALADIN_SACRED_DUTY', maxLevel: 3, name: '⚙ Heilige Pflicht [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8% Blockchance pro Stufe. Block → +10 LP.' },
      { id: 'PALADIN_ARDENT_DEFENDER', maxLevel: 3, name: '⚙ Unerschütterlich [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Unter 35% HP: −10% erlittener Schaden pro Stufe.' },
      { id: 'PALADIN_DIVINE_PROTECTION', maxLevel: 3, name: '★ Göttlicher Schutz [Ultimate]', treePointsRequired: 10,
        desc: 'Party unverwundbar für 1 Runde.' }
    ],
    VERGELTER: [
      { id: 'PALADIN_CRUSADER_STRIKE', maxLevel: 3, name: 'Kreuzfahrerstoß', treePointsRequired: 0,
        desc: '1.4× physisch. +25% pro Stufe.' },
      { id: 'PALADIN_JUDGEMENT', maxLevel: 3, name: 'Richturteil', treePointsRequired: 0,
        desc: 'Heiligschaden + +15% Schadensanfälligkeit.' },
      { id: 'PALADIN_WORD_OF_GLORY', maxLevel: 3, name: 'Wort der Herrlichkeit', treePointsRequired: 3,
        desc: 'Heilung + Schild. +30% pro Stufe.' },
      { id: 'PALADIN_TEMPLARS_VERDICT', maxLevel: 3, name: 'Tempelritter-Urteil', treePointsRequired: 3,
        desc: 'Physisch + Heiligschaden Burst. +25% pro Stufe.' },
      { id: 'PALADIN_SEAL_OF_COMMAND', maxLevel: 3, name: '⚙ Siegel des Befehls [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8% physischer Schaden pro Stufe.' },
      { id: 'PALADIN_SANCTITY', maxLevel: 3, name: '⚙ Heilige Stärke [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+6% Heilig- und physischer Schaden pro Stufe.' },
      { id: 'PALADIN_AVENGING_WRATH', maxLevel: 3, name: '★ Rächer-Zorn [Ultimate]', treePointsRequired: 10,
        desc: '+50% Schaden 3 Runden + Party-Heilung.' }
    ],
    HEILIG: [
      { id: 'PALADIN_HOLY_LIGHT', maxLevel: 3, name: 'Heiliges Licht', treePointsRequired: 0,
        desc: 'Starke Direktheilung. +30% pro Stufe.' },
      { id: 'PALADIN_CONSECRATION', maxLevel: 3, name: 'Weihe', treePointsRequired: 0,
        desc: 'AoE Heiligschaden + Party-Heilung 50% davon.' },
      { id: 'PALADIN_BEACON', maxLevel: 3, name: 'Leuchtfeuer der Hoffnung', treePointsRequired: 3,
        desc: 'Party-HoT 4 Runden.' },
      { id: 'PALADIN_LAY_ON_HANDS', maxLevel: 3, name: 'Handauflegung', treePointsRequired: 3,
        desc: 'Massive Heilung: 60% maxHP + Absorptionsschild. +15% pro Stufe.' },
      { id: 'PALADIN_HOLY_AURA', maxLevel: 3, name: '⚙ Heilige Aura [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Party −5% Schaden pro Stufe. Dauerhaft aktiv.' },
      { id: 'PALADIN_ILLUMINATION', maxLevel: 3, name: '⚙ Erleuchtung [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Heilzauber +8% stärker pro Stufe. +5 Mana-Regen pro Runde.' },
      { id: 'PALADIN_DIVINE_STORM', maxLevel: 3, name: '★ Göttlicher Sturm [Ultimate]', treePointsRequired: 10,
        desc: 'AoE Heiligschaden + Party-Heilung.' }
    ]
  },
  MAGIER: {
    FEUER: [
      { id: 'MAGIER_FIREBALL', maxLevel: 3, name: 'Feuerball', treePointsRequired: 0,
        desc: 'Feuer + Brand-DoT. +20% pro Stufe.' },
      { id: 'MAGIER_FIRE_BLAST', maxLevel: 3, name: 'Feuerschlag', treePointsRequired: 0,
        desc: 'Sofortiger Feuer-Burst mit Crit-Bonus.' },
      { id: 'MAGIER_PYROBLAST', maxLevel: 3, name: 'Pyroschlag', treePointsRequired: 3,
        desc: 'Massiver Feuerschaden. +30% pro Stufe.' },
      { id: 'MAGIER_LIVING_BOMB', maxLevel: 3, name: 'Lebende Bombe', treePointsRequired: 3,
        desc: 'Feuerbombe: DoT 4 Runden + Explosion. +20% pro Stufe.' },
      { id: 'MAGIER_IGNITE', maxLevel: 3, name: '⚙ Entzünden [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+5% Spell-Crit pro Stufe.' },
      { id: 'MAGIER_FIRE_MASTERY', maxLevel: 3, name: '⚙ Feuermeister [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Alle Feuerzauber +10% Schaden pro Stufe.' },
      { id: 'MAGIER_FLAMESTRIKE', maxLevel: 3, name: '★ Flammeneinschlag [Ultimate]', treePointsRequired: 10,
        desc: 'AoE Feuer + Brand auf alle.' }
    ],
    EIS: [
      { id: 'MAGIER_FROSTBOLT', maxLevel: 3, name: 'Frostblitz', treePointsRequired: 0,
        desc: 'Schaden + −Trefferchance Debuff.' },
      { id: 'MAGIER_ICE_BARRIER', maxLevel: 3, name: 'Eisbarriere', treePointsRequired: 0,
        desc: 'Absorptionsschild. +30% pro Stufe.' },
      { id: 'MAGIER_DEEP_FREEZE', maxLevel: 3, name: 'Tieffrieren', treePointsRequired: 3,
        desc: 'Schaden + Betäubung. +25% pro Stufe.' },
      { id: 'MAGIER_FROST_NOVA', maxLevel: 3, name: 'Frostnova', treePointsRequired: 3,
        desc: 'AoE Eisexplosion + 50% Betäubungschance. +8% pro Stufe.' },
      { id: 'MAGIER_SHATTER', maxLevel: 3, name: '⚙ Zersplittern [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+6% Spell-Crit pro Stufe.' },
      { id: 'MAGIER_COLD_SNAP', maxLevel: 3, name: '⚙ Kälteschutz [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Absorptionsschilde +12% stärker pro Stufe.' },
      { id: 'MAGIER_FROZEN_ORB', maxLevel: 3, name: '★ Gefrorene Kugel [Ultimate]', treePointsRequired: 10,
        desc: 'AoE Eis + Slow alle.' }
    ],
    ARKAN: [
      { id: 'MAGIER_ARCANE_MISSILES', maxLevel: 3, name: 'Arkane Geschosse', treePointsRequired: 0,
        desc: '3 Treffer, jeder kann kritisch.' },
      { id: 'MAGIER_ARCANE_BLAST', maxLevel: 3, name: 'Arkaner Einschlag', treePointsRequired: 0,
        desc: 'Massiver Einzel-Burst 2.2× SP.' },
      { id: 'MAGIER_COUNTERSPELL', maxLevel: 3, name: 'Gegenzauber', treePointsRequired: 3,
        desc: 'Betäubt + Magie-DoT 3 Runden.' },
      { id: 'MAGIER_NETHER_TEMPEST', maxLevel: 3, name: 'Nether-Sturm', treePointsRequired: 3,
        desc: 'Arkaner Sturm: Schaden + 20 Mana zurück. +20% pro Stufe.' },
      { id: 'MAGIER_ARCANE_POWER', maxLevel: 3, name: '⚙ Arkane Macht [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+6% Spell-Crit + SpellPower-Bonus pro Stufe.' },
      { id: 'MAGIER_MANA_ADEPT', maxLevel: 3, name: '⚙ Mana-Adept [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8 Mana-Regen/Runde pro Stufe. +3% max Mana.' },
      { id: 'MAGIER_ARCANE_SURGE', maxLevel: 3, name: '★ Arkaner Ausbruch [Ultimate]', treePointsRequired: 10,
        desc: '4 Arkane Einschläge, jeder kann krit.' }
    ]
  },
  PRIESTER: {
    SCHATTEN: [
      { id: 'PRIESTER_MIND_BLAST', maxLevel: 3, name: 'Gedankenschlag', treePointsRequired: 0,
        desc: 'Hoher Schattenschaden. +25% pro Stufe.' },
      { id: 'PRIESTER_SW_PAIN', maxLevel: 3, name: 'Schattenwort: Schmerz', treePointsRequired: 0,
        desc: 'Schatten-DoT + Selbstheilung.' },
      { id: 'PRIESTER_MIND_FLAY', maxLevel: 3, name: 'Gedankenschinder', treePointsRequired: 3,
        desc: 'Lebensraub: Schaden = Heilung.' },
      { id: 'PRIESTER_VAMPIRIC_EMBRACE', maxLevel: 3, name: 'Vampirische Umarmung', treePointsRequired: 3,
        desc: 'Schatten + Party heilt 25% des Schadens. +20% pro Stufe.' },
      { id: 'PRIESTER_SHADOWFORM', maxLevel: 3, name: '⚙ Schattenform [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8% Krit + +10% Schaden pro Stufe.' },
      { id: 'PRIESTER_DARKNESS', maxLevel: 3, name: '⚙ Dunkelheit [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Schatten-DoTs +15% stärker. Lebensraub +5% pro Stufe.' },
      { id: 'PRIESTER_VOID_ERUPTION', maxLevel: 3, name: '★ Leerenausbruch [Ultimate]', treePointsRequired: 10,
        desc: 'AoE Schattenschaden + DoT alle.' }
    ],
    HEILUNG: [
      { id: 'PRIESTER_FLASH_HEAL', maxLevel: 3, name: 'Blitzheilung', treePointsRequired: 0,
        desc: 'Schnelle starke Heilung. +35% pro Stufe.' },
      { id: 'PRIESTER_SHIELD', maxLevel: 3, name: 'Machtwort: Schild', treePointsRequired: 0,
        desc: 'Absorptionsschild. +30% pro Stufe.' },
      { id: 'PRIESTER_PRAYER', maxLevel: 3, name: 'Gebet der Besserung', treePointsRequired: 3,
        desc: 'Heilung + 50% Schadensreduktion.' },
      { id: 'PRIESTER_CIRCLE_OF_HEALING', maxLevel: 3, name: 'Kreis der Heilung', treePointsRequired: 3,
        desc: 'AoE-Heilung auf gesamte Party. +25% pro Stufe.' },
      { id: 'PRIESTER_HOLY_CONCENTRATION', maxLevel: 3, name: '⚙ Heilige Konzentration [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+10 Mana/Runde pro Stufe.' },
      { id: 'PRIESTER_INNER_FOCUS', maxLevel: 3, name: '⚙ Innerer Fokus [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: '+8% Heilung pro Stufe. +5% krit. Heilung pro Stufe.' },
      { id: 'PRIESTER_DIVINE_HYMN', maxLevel: 3, name: '★ Göttliche Hymne [Ultimate]', treePointsRequired: 10,
        desc: 'Heilt gesamte Party um 50% maxHP.' }
    ],
    DISZIPLIN: [
      { id: 'PRIESTER_PENANCE', maxLevel: 3, name: 'Buße', treePointsRequired: 0,
        desc: '2× Schaden + 60% Selbstheilung.' },
      { id: 'PRIESTER_PAIN_SUPRESSION', maxLevel: 3, name: 'Schmerzunterdrückung', treePointsRequired: 0,
        desc: '−40% Schaden für Ziel, 3 Runden.' },
      { id: 'PRIESTER_DIVINE_AEGIS', maxLevel: 3, name: 'Göttliche Ägide', treePointsRequired: 3,
        desc: 'Großes Absorptionsschild SP-skaliert.' },
      { id: 'PRIESTER_ATONEMENT', maxLevel: 3, name: 'Sühne', treePointsRequired: 3,
        desc: 'Heiligschaden → Party erhält Schild = 40% des Schadens.' },
      { id: 'PRIESTER_DISC_PASSIVE', maxLevel: 3, name: '⚙ Disziplin-Aura [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Party −4% Schaden pro Stufe. Schilde +15% stärker.' },
      { id: 'PRIESTER_SPIRIT_OF_REDEMPTION', maxLevel: 3, name: '⚙ Schutzgeist [Passiv]', type: 'passive', treePointsRequired: 6,
        desc: 'Schilde +10% stärker. Schildbruch → Heilt 15% maxHP pro Stufe.' },
      { id: 'PRIESTER_SPIRIT_SHELL', maxLevel: 3, name: '★ Geistesschale [Ultimate]', treePointsRequired: 10,
        desc: 'Party-Schild = 40% maxHP.' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Hilfsfunktion: Punkte in einem Baum zählen
// ═══════════════════════════════════════════════════════════════════════════════
function getTreeInvestedPoints(character, treeTalents) {
  let pts = 0;
  for (const t of treeTalents) pts += (character.talents?.[t.id] || 0);
  return pts;
}

/**
 * Gibt die verfügbaren Zauber eines Charakters zurück (inkl. Standardangriffen und erlernten Talenten).
 * Scannt ALLE 3 Talentbäume der Klasse — nicht nur den aktiven Spec.
 */
export function getAvailableSkills(character) {
  const skills = [];
  const charClass = character.classKey;

  // 1. Standardfähigkeiten (immer verfügbar, kosten kein Talent):
  //    Auto-Angriff + eine Basis-Utility. Echte Spec-Skills (Feuerball, etc.)
  //    kommen ausschließlich über Talentpunkte aus den Bäumen.
  if (charClass === 'KRIEGER') {
    skills.push(SKILL_DATABASE.KRIEGER_AUTO);
  } else if (charClass === 'PALADIN') {
    skills.push(SKILL_DATABASE.PALADIN_AUTO);
  } else if (charClass === 'MAGIER') {
    skills.push(SKILL_DATABASE.MAGIER_AUTO);
    skills.push(SKILL_DATABASE.MAGIER_EVOCATION);
  } else if (charClass === 'PRIESTER') {
    skills.push(SKILL_DATABASE.PRIESTER_AUTO);
    skills.push(SKILL_DATABASE.PRIESTER_SMITE);
    skills.push(SKILL_DATABASE.PRIESTER_RENEW);
  }

  // 2. ALLE 3 Bäume scannen — jeder gelernte aktive Skill wird hinzugefügt.
  //    Ist die Fähigkeit bereits als Basis vorhanden, wird sie durch die
  //    talent-skalierte Version ERSETZT (kein Duplikat).
  const learnedTalents = character.talents || {};
  const classTrees = TALENT_TREES[charClass];
  if (!classTrees) return skills;

  for (const [specName, treeTalents] of Object.entries(classTrees)) {
    for (const talent of treeTalents) {
      if (talent.type === 'passive') continue; // Passive sind dauerhaft, nicht manuell einsetzbar
      const level = learnedTalents[talent.id] || 0;
      if (level > 0) {
        const skillTemplate = SKILL_DATABASE[talent.id];
        if (skillTemplate) {
          const scaled = {
            ...skillTemplate,
            talentLevel: level,
            execute: (c, t) => skillTemplate.execute(c, t, level)
          };
          const existingIdx = skills.findIndex(s => s.id === talent.id);
          if (existingIdx >= 0) skills[existingIdx] = scaled; // Basis → talent-skalierte Version
          else skills.push(scaled);
        }
      }
    }
  }

  return skills;
}

/**
 * Lernt oder verbessert ein Talent.
 * Sucht in ALLEN 3 Bäumen der Klasse, erzwingt treePointsRequired-Gates,
 * und aktualisiert den dynamischen specKey.
 */
export function learnTalent(character, talentId) {
  if (character.skillPoints <= 0) return { error: 'Keine Skillpunkte übrig!' };

  const charClass = character.classKey;
  const classTrees = TALENT_TREES[charClass];
  if (!classTrees) return { error: 'Keine Talentbäume für diese Klasse!' };

  // Talent in ALLEN Bäumen suchen
  let talentMeta = null;
  let foundTreeName = null;
  let foundTreeTalents = null;

  for (const [treeName, treeTalents] of Object.entries(classTrees)) {
    const found = treeTalents.find(t => t.id === talentId);
    if (found) {
      talentMeta = found;
      foundTreeName = treeName;
      foundTreeTalents = treeTalents;
      break;
    }
  }

  if (!talentMeta) return { error: 'Dieses Talent existiert nicht für deine Klasse!' };

  // Tier-Gate: genug Punkte im SELBEN Baum?
  const treePts = getTreeInvestedPoints(character, foundTreeTalents);
  if (talentMeta.treePointsRequired && treePts < talentMeta.treePointsRequired) {
    return { error: `Benötigt ${talentMeta.treePointsRequired} Punkte im ${foundTreeName}-Baum! (Du hast ${treePts})` };
  }

  const currentLevel = character.talents[talentId] || 0;
  if (currentLevel >= talentMeta.maxLevel) return { error: 'Talent hat bereits die maximale Stufe erreicht!' };

  character.talents[talentId] = currentLevel + 1;
  character.skillPoints--;

  // Passiv-Talent: Effekt sofort in passiveEffects registrieren
  const skillDef = SKILL_DATABASE[talentId];
  if (skillDef?.passiveEffect) {
    character.passiveEffects = character.passiveEffects || {};
    const passiveEffectFn = skillDef.passiveEffect;
    character.passiveEffects[talentId] = (c) => passiveEffectFn(c, c.talents[talentId] || 0);
  }

  // Dynamischen Spec aktualisieren (Baum mit meisten Punkten bestimmt specKey)
  character.updateActiveSpec(TALENT_TREES);

  character.resetStats(); // Werte neu kalkulieren (wendet passiveEffects an)

  return { success: true, newLevel: character.talents[talentId], treeName: foundTreeName, isPassive: !!talentMeta.type?.includes('passive') };
}
