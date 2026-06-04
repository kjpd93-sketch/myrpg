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
    description: 'Ein wuchtiger Hieb. Verursacht hohen physischen Schaden.',
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
    description: 'Schlägt mit dem Schild zu. Verursacht Schaden und erhöht die Rüstung um 30% für 2 Runden.',
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
    description: 'Heilt den Krieger um 30% der maximalen Lebenspunkte.',
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
    description: 'Schwächt den Gegner. Verringert seinen Schaden um 25% für 3 Runden.',
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
        text: `${caster.name} ruft demoralisierend. Der Schaden des Gegners wird verringert.`,
        damage: 0,
        healing: 0
      };
    }
  },
  KRIEGER_SMASH: {
    id: 'KRIEGER_SMASH',
    name: 'Zerschmettern',
    cost: 15,
    costType: 'WUT',
    type: 'damage',
    description: 'Ein wuchtiger Schlag mit der Waffe.',
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
    description: 'Ein brutaler Schlag, der Schaden verursacht und den Krieger um 6% seiner maximalen Lebenspunkte heilt.',
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
    description: 'Erhöht die Chance auf kritische Treffer um 40% für 3 Runden.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 40) return { error: 'Nicht genug Wut!' };
      caster.currentResource -= 40;
      
      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Tollkühnheit',
        duration: 3,
        effect: (c) => { c.bonusCritChance = 0.40 + (talentLevel - 1) * 0.10; },
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
    id: 'KRIEGER_WHIRLWIND',
    name: 'Wirbelwind',
    cost: 30,
    costType: 'WUT',
    type: 'damage',
    description: 'Wirbelt im Kreis. Verursacht Schaden und hinterlässt eine Blutung (DoT) für 3 Runden.',
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
        text: `${caster.name} wirbelt herum: ${dmg} Schaden. Das Ziel blutet!`,
        damage: dmg,
        healing: 0
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
    description: 'Wirft einen Schild, der Heiligschaden verursacht und den Gegner betäubt (lässt nächste Runde aus).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.2;
      const dmg = Math.round((caster.getPhysicalDamage() * 0.6 + caster.getSpellPower() * 0.4) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.stunned = true;

      return {
        text: `${caster.name} wirft Schild des Rächers: ${dmg} Heiligschaden. Ziel ist BETÄUBT!`,
        damage: dmg,
        healing: 0
      };
    }
  },
  PALADIN_HOLY_SHIELD: {
    id: 'PALADIN_HOLY_SHIELD',
    name: 'Heiliger Schild',
    cost: 25,
    costType: 'MANA',
    type: 'buff',
    description: 'Erhöht die Blockchance um 25% und fügt Angreifern Heiligschaden zu, wenn geblockt wird (3 Runden).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;

      caster.buffs = caster.buffs || [];
      caster.buffs.push({
        name: 'Heiliger Schild',
        duration: 3,
        effect: (c) => { 
          c.bonusBlockChance = 0.25 + (talentLevel - 1) * 0.05;
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
    description: 'Ein schneller Heilzauber, der Lebenspunkte regeneriert.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 15) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 15;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const heal = Math.round((20 + caster.getSpellPower() * 0.8) * mult);
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
    description: 'Ein mächtiger Nahkampfhieb, der hohen physischen Schaden verursacht.',
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
    description: 'Eine kraftvolle Heilung, die zusätzlich einen Schild erzeugt.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 30) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 30;
      const mult = 1 + (talentLevel - 1) * 0.3;
      const heal = Math.round((35 + caster.getSpellPower() * 1.2) * mult);
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
    description: 'Schießt einen Feuerball. Verursacht Feuerschaden und verbrennt das Ziel (DoT) für 3 Runden.',
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
    description: 'Entfesselt einen riesigen brennenden Felsbrocken, der enormen Feuerschaden verursacht.',
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
    description: 'Umhüllt den Magier mit einem Schild, der Schaden absorbiert (3 Runden).',
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
    description: 'Friert den Gegner tief ein. Verursacht Schaden und betäubt das Ziel für 1 Runde.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 35) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 35;
      const mult = 1 + (talentLevel - 1) * 0.25;
      const dmg = Math.round((20 + caster.getSpellPower() * 0.9) * mult);
      target.currentHp = Math.max(0, target.currentHp - dmg);

      target.stunned = true;

      return {
        text: `${caster.name} wirkt Tieffrieren: ${dmg} Eisschaden und das Ziel ist EINGEFROREN!`,
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
    description: 'Trifft den Geist des Ziels für hohen Schattenschaden.',
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
    description: 'Eine extrem schnelle und starke Heilung.',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 20) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 20;
      const mult = 1 + (talentLevel - 1) * 0.35;
      const heal = Math.round((30 + caster.getSpellPower() * 1.4) * mult);
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
    description: 'Umgibt den Priester mit einem Machtschild, der jeglichen Schaden absorbiert (4 Runden).',
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
      const heal = Math.round((40 + caster.getSpellPower() * 1.5) * mult);
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
  }
};

// Talentbaum-Konfigurationen pro Klasse und Spezialisierung
export const TALENT_TREES = {
  KRIEGER: {
    TANK: [
      { id: 'KRIEGER_SHIELD_SLAM', maxLevel: 3, name: 'Schildschlag', desc: 'Schaltet Schildschlag frei oder verbessert dessen Schaden um +20% pro Stufe.' },
      { id: 'KRIEGER_LAST_STAND', maxLevel: 3, name: 'Letztes Gefecht', desc: 'Schaltet eine starke Selbstheilung frei. +20% Heilung pro Stufe.' },
      { id: 'KRIEGER_DEMO_SHOUT', maxLevel: 3, name: 'Demoralisierender Ruf', desc: 'Verringert den Schaden des Gegners. +5% Schadensreduktion pro Stufe.' }
    ],
    FUROR: [
      { id: 'KRIEGER_BLOODTHIRST', maxLevel: 3, name: 'Blutdurst', desc: 'Schaltet Blutdurst frei (Schaden + Heilung). +25% Effektivität pro Stufe.' },
      { id: 'KRIEGER_RECKLESSNESS', maxLevel: 3, name: 'Tollkühnheit', desc: 'Erhöht Crit-Chance massiv. +10% Crit-Chance pro Stufe.' },
      { id: 'KRIEGER_WHIRLWIND', maxLevel: 3, name: 'Wirbelwind', desc: 'Schaltet einen Wirbelangriff mit Blutungseffekt frei. +20% Schaden pro Stufe.' }
    ]
  },
  PALADIN: {
    TANK: [
      { id: 'PALADIN_AVENGERS_SHIELD', maxLevel: 3, name: 'Schild des Rächers', desc: 'Schaltet Schildwurf mit Betäubung frei. +20% Schaden pro Stufe.' },
      { id: 'PALADIN_HOLY_SHIELD', maxLevel: 3, name: 'Heiliger Schild', desc: 'Erhöht die Blockchance und fügt Rückschaden zu. +5% Blockchance pro Stufe.' },
      { id: 'PALADIN_FLASH_OF_LIGHT', maxLevel: 3, name: 'Lichtblitz', desc: 'Schaltet eine schnelle Heilung frei. +30% Heilung pro Stufe.' }
    ],
    VERGELTER: [
      { id: 'PALADIN_CRUSADER_STRIKE', maxLevel: 3, name: 'Kreuzfahrerstoß', desc: 'Schaltet Kreuzfahrerstoß frei. +25% Schaden pro Stufe.' },
      { id: 'PALADIN_JUDGEMENT', maxLevel: 3, name: 'Richturteil', desc: 'Fügt Schaden zu und schwächt gegnerische Rüstung. +5% Schadenseffekt pro Stufe.' },
      { id: 'PALADIN_WORD_OF_GLORY', maxLevel: 3, name: 'Wort der Herrlichkeit', desc: 'Schaltet Heilung + Schild frei. +30% Effektivität pro Stufe.' }
    ]
  },
  MAGIER: {
    FEUER: [
      { id: 'MAGIER_FIREBALL', maxLevel: 3, name: 'Feuerball', desc: 'Hauptzauber mit Verbrennungsschaden über Zeit. +20% Schaden pro Stufe.' },
      { id: 'MAGIER_FIRE_BLAST', maxLevel: 3, name: 'Feuerschlag', desc: 'Spontanzauber mit hoher Crit-Chance. +5% Crit-Chance pro Stufe.' },
      { id: 'MAGIER_PYROBLAST', maxLevel: 3, name: 'Pyroschlag', desc: 'Extrem mächtiger Zauber mit langer Zauberzeit. +30% Schaden pro Stufe.' }
    ],
    EIS: [
      { id: 'MAGIER_FROSTBOLT', maxLevel: 3, name: 'Frostblitz', desc: 'Fügt Schaden zu und verringert gegnerische Trefferchance. +5% Debuff pro Stufe.' },
      { id: 'MAGIER_ICE_BARRIER', maxLevel: 3, name: 'Eisbarriere', desc: 'Umgibt den Magier mit einem Schadensschild. +30% Schildwert pro Stufe.' },
      { id: 'MAGIER_DEEP_FREEZE', maxLevel: 3, name: 'Tieffrieren', desc: 'Eiszauber mit Betäubungseffekt. +25% Schaden pro Stufe.' }
    ]
  },
  PRIESTER: {
    SCHATTEN: [
      { id: 'PRIESTER_MIND_BLAST', maxLevel: 3, name: 'Gedankenschlag', desc: 'Verursacht sehr hohen Schattenschaden. +25% Schaden pro Stufe.' },
      { id: 'PRIESTER_SW_PAIN', maxLevel: 3, name: 'Schattenwort: Schmerz', desc: 'Verursacht Schattenschaden über Zeit und heilt. +20% Effektivität pro Stufe.' },
      { id: 'PRIESTER_MIND_FLAY', maxLevel: 3, name: 'Gedankenschinder', desc: 'Entzieht Leben und heilt den Priester. +20% Schaden/Heilung pro Stufe.' }
    ],
    HEILUNG: [
      { id: 'PRIESTER_FLASH_HEAL', maxLevel: 3, name: 'Blitzheilung', desc: 'Sehr schnelle und starke Direktheilung. +35% Heilung pro Stufe.' },
      { id: 'PRIESTER_SHIELD', maxLevel: 3, name: 'Machtwort: Schild', desc: 'Absorbiert eingehenden Schaden. +30% Schildstärke pro Stufe.' },
      { id: 'PRIESTER_PRAYER', maxLevel: 3, name: 'Gebet der Besserung', desc: 'Hohe Heilung + 50% Schadensreduktion für 2 Runden. +30% Effektivität pro Stufe.' }
    ]
  }
};

/**
 * Gibt die verfügbaren Zauber eines Charakters zurück (inkl. Standardangriffen und erlernten Talenten)
 */
export function getAvailableSkills(character) {
  const skills = [];
  const charClass = character.classKey;
  const spec = character.specKey;

  // 1. Standardangriffe hinzufügen
  if (charClass === 'KRIEGER') {
    skills.push(SKILL_DATABASE.KRIEGER_AUTO);
    skills.push(SKILL_DATABASE.KRIEGER_SMASH);
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

  // 2. Talente hinzufügen, sofern gelernt (TalentLevel >= 1)
  const learnedTalents = character.talents || {};
  const possibleTalents = TALENT_TREES[charClass][spec] || [];

  for (const talent of possibleTalents) {
    const level = learnedTalents[talent.id] || 0;
    if (level > 0) {
      const skillTemplate = SKILL_DATABASE[talent.id];
      if (skillTemplate) {
        // Verpacken des Skills mit dem spezifischen Level des Charakters
        skills.push({
          ...skillTemplate,
          talentLevel: level,
          execute: (c, t) => skillTemplate.execute(c, t, level)
        });
      }
    }
  }

  return skills;
}

/**
 * Lernt oder verbessert ein Talent
 */
export function learnTalent(character, talentId) {
  if (character.skillPoints <= 0) return { error: 'Keine Skillpunkte übrig!' };

  const charClass = character.classKey;
  const spec = character.specKey;
  const possibleTalents = TALENT_TREES[charClass][spec] || [];
  const talentMeta = possibleTalents.find(t => t.id === talentId);

  if (!talentMeta) return { error: 'Dieses Talent existiert nicht für deine Spezialisierung!' };

  const currentLevel = character.talents[talentId] || 0;
  if (currentLevel >= talentMeta.maxLevel) return { error: 'Talent hat bereits die maximale Stufe erreicht!' };

  character.talents[talentId] = currentLevel + 1;
  character.skillPoints--;
  character.resetStats(); // Werte ggf. neu kalkulieren

  return { success: true, newLevel: character.talents[talentId] };
}
