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
    id: 'KRIEGER_BLADESTORM',
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
    id: 'PALADIN_CONSECRATION',
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
    id: 'PALADIN_DIVINE_STORM',
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
    description: 'Unterbricht den Feind. Ziel überspringt nächste Runde + erleidet 3 Runden Magieschaden (DoT).',
    execute: (caster, target, talentLevel = 1) => {
      if (caster.currentResource < 25) return { error: 'Nicht genug Mana!' };
      caster.currentResource -= 25;
      const mult = 1 + (talentLevel - 1) * 0.20;
      target.stunned = true;
      const dotDmg = Math.round((6 + caster.getSpellPower() * 0.30) * mult);
      target.debuffs = target.debuffs || [];
      target.debuffs.push({ name: 'Magieunterdrückung', duration: 3, dot: dotDmg });
      return { text: `${caster.name} wirkt Gegenzauber! Ziel betäubt + ${dotDmg} Magieschaden/Runde.`, damage: 0, healing: 0 };
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
    id: 'MAGIER_FLAMESTRIKE',
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
    id: 'MAGIER_FROZEN_ORB',
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
      const spec = CLASSES[caster.classKey]?.specs[caster.specKey];
      const absBonus = spec?.specialStats?.absorptionBonus || 0;
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
      const spec = CLASSES[caster.classKey]?.specs[caster.specKey];
      const absBonus = spec?.specialStats?.absorptionBonus || 0;
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
      c.physDmgMultiplier = (c.physDmgMultiplier || 1.0) + 0.10 * level;
    }
  },
  PRIESTER_VOID_ERUPTION: {
    id: 'PRIESTER_VOID_ERUPTION',
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
// requires: { talent: 'ID', level: N } — Voraussetzung
// levelRequired: N — Charakter-Level das benötigt wird
// type: 'passive' — wird nur gelernt, nicht aktiv eingesetzt
export const TALENT_TREES = {
  KRIEGER: {
    TANK: [
      { id: 'KRIEGER_SHIELD_SLAM', maxLevel: 3, name: 'Schildschlag', desc: 'Schaltet Schildschlag frei. +20% Schaden pro Stufe.' },
      { id: 'KRIEGER_LAST_STAND',  maxLevel: 3, name: 'Letztes Gefecht', desc: '+20% Selbstheilung pro Stufe.' },
      { id: 'KRIEGER_DEMO_SHOUT',  maxLevel: 3, name: 'Demoralisierender Ruf', desc: '+5% Schadensreduktion pro Stufe.' },
      { id: 'KRIEGER_IRON_FORTRESS', maxLevel: 3, name: '⚙ Eisenfestung [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+20 Rüstung pro Stufe. Geblockte Angriffe → +8 Wut.',
        requires: { talent: 'KRIEGER_SHIELD_SLAM', level: 1 } },
      { id: 'KRIEGER_LAST_BASTION', maxLevel: 3, name: '★ Letzte Bastion [Ultimate]', levelRequired: 5,
        desc: '50% weniger Schaden für 3+ Runden + 30 Wut. (Benötigt: Eisenfestung Stufe 1)',
        requires: { talent: 'KRIEGER_IRON_FORTRESS', level: 1 } }
    ],
    FUROR: [
      { id: 'KRIEGER_BLOODTHIRST',  maxLevel: 3, name: 'Blutdurst', desc: 'Schaden + Selbstheilung. +25% pro Stufe.' },
      { id: 'KRIEGER_RECKLESSNESS', maxLevel: 3, name: 'Tollkühnheit', desc: '+10% Krit-Chance pro Stufe.' },
      { id: 'KRIEGER_WHIRLWIND',    maxLevel: 3, name: 'Wirbelwind', desc: 'AoE + Blutungseffekt. +20% Schaden pro Stufe.' },
      { id: 'KRIEGER_BLOOD_FRENZY', maxLevel: 3, name: '⚙ Blutfieber [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+6% Krit-Chance pro Stufe. Crits → +8 Wut.',
        requires: { talent: 'KRIEGER_BLOODTHIRST', level: 1 } },
      { id: 'KRIEGER_EXECUTE', maxLevel: 3, name: '★ Hinrichten [Ultimate]', levelRequired: 5,
        desc: '4× Schaden wenn Feind <30% HP. (Benötigt: Blutfieber Stufe 1)',
        requires: { talent: 'KRIEGER_BLOOD_FRENZY', level: 1 } }
    ],
    WAFFEN: [
      { id: 'KRIEGER_HEROIC_STRIKE', maxLevel: 3, name: 'Heroischer Hieb', desc: '1.8× physisch. +25% pro Stufe.' },
      { id: 'KRIEGER_MORTAL_STRIKE', maxLevel: 3, name: 'Tödlicher Hieb', desc: '2.0× physisch + Heilungs-Unterdrückung.',
        requires: { talent: 'KRIEGER_HEROIC_STRIKE', level: 1 } },
      { id: 'KRIEGER_BLADESTORM',    maxLevel: 3, name: 'Klingensturm', desc: 'AoE 1.3× auf alle Feinde.' },
      { id: 'KRIEGER_WEAPON_MASTERY', maxLevel: 3, name: '⚙ Waffenmeisterschaft [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+8% physischer Gesamtschaden pro Stufe.' },
      { id: 'KRIEGER_AVATAR', maxLevel: 3, name: '★ Avatar des Kriegers [Ultimate]', levelRequired: 5,
        desc: '3 Angriffe à 100% Schaden. (Benötigt: Klingensturm Stufe 1)',
        requires: { talent: 'KRIEGER_BLADESTORM', level: 1 } }
    ]
  },
  PALADIN: {
    TANK: [
      { id: 'PALADIN_AVENGERS_SHIELD', maxLevel: 3, name: 'Schild des Rächers', desc: 'Betäubung + Heiligschaden. +20% pro Stufe.' },
      { id: 'PALADIN_HOLY_SHIELD',     maxLevel: 3, name: 'Heiliger Schild', desc: '+5% Blockchance + Vergeltungsschaden pro Stufe.' },
      { id: 'PALADIN_FLASH_OF_LIGHT',  maxLevel: 3, name: 'Lichtblitz', desc: 'Schnelle Selbstheilung. +30% pro Stufe.' },
      { id: 'PALADIN_SACRED_DUTY', maxLevel: 3, name: '⚙ Heilige Pflicht [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+8% Blockchance pro Stufe. Block → +10 LP Heilung.',
        requires: { talent: 'PALADIN_HOLY_SHIELD', level: 1 } },
      { id: 'PALADIN_DIVINE_PROTECTION', maxLevel: 3, name: '★ Göttlicher Schutz [Ultimate]', levelRequired: 5,
        desc: 'Party unverwundbar für 1 Runde. (Benötigt: Heilige Pflicht Stufe 1)',
        requires: { talent: 'PALADIN_SACRED_DUTY', level: 1 } }
    ],
    VERGELTER: [
      { id: 'PALADIN_CRUSADER_STRIKE', maxLevel: 3, name: 'Kreuzfahrerstoß', desc: '1.4× physisch. +25% pro Stufe.' },
      { id: 'PALADIN_JUDGEMENT',       maxLevel: 3, name: 'Richturteil', desc: 'Heiligschaden + +15% Schadensanfälligkeit.' },
      { id: 'PALADIN_WORD_OF_GLORY',   maxLevel: 3, name: 'Wort der Herrlichkeit', desc: 'Heilung + Schild. +30% pro Stufe.' },
      { id: 'PALADIN_SEAL_OF_COMMAND', maxLevel: 3, name: '⚙ Siegel des Befehls [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+8% physischer Schaden pro Stufe.',
        requires: { talent: 'PALADIN_CRUSADER_STRIKE', level: 1 } },
      { id: 'PALADIN_AVENGING_WRATH', maxLevel: 3, name: '★ Rächer-Zorn [Ultimate]', levelRequired: 5,
        desc: '+50% Schaden 3 Runden + Party-Heilung. (Benötigt: Siegel Stufe 1)',
        requires: { talent: 'PALADIN_SEAL_OF_COMMAND', level: 1 } }
    ],
    HEILIG: [
      { id: 'PALADIN_HOLY_LIGHT',  maxLevel: 3, name: 'Heiliges Licht', desc: 'Starke Direktheilung. +30% pro Stufe.' },
      { id: 'PALADIN_BEACON',      maxLevel: 3, name: 'Leuchtfeuer der Hoffnung', desc: 'Party-HoT 4 Runden.',
        requires: { talent: 'PALADIN_HOLY_LIGHT', level: 1 } },
      { id: 'PALADIN_CONSECRATION', maxLevel: 3, name: 'Weihe', desc: 'AoE Heiligschaden + Party-Heilung 50% davon.' },
      { id: 'PALADIN_HOLY_AURA', maxLevel: 3, name: '⚙ Heilige Aura [Passiv]', type: 'passive', levelRequired: 3,
        desc: 'Party −5% Schaden pro Stufe. Dauerhaft aktiv.' },
      { id: 'PALADIN_DIVINE_STORM', maxLevel: 3, name: '★ Göttlicher Sturm [Ultimate]', levelRequired: 5,
        desc: 'AoE Heiligschaden + Party-Heilung. (Benötigt: Aura Stufe 1)',
        requires: { talent: 'PALADIN_HOLY_AURA', level: 1 } }
    ]
  },
  MAGIER: {
    FEUER: [
      { id: 'MAGIER_FIREBALL',   maxLevel: 3, name: 'Feuerball', desc: 'Feuer + Brand-DoT. +20% pro Stufe.' },
      { id: 'MAGIER_FIRE_BLAST', maxLevel: 3, name: 'Feuerschlag', desc: 'Sofortiger Feuer-Burst mit Crit-Bonus.' },
      { id: 'MAGIER_PYROBLAST',  maxLevel: 3, name: 'Pyroschlag', desc: 'Massiver Feuerschaden. +30% pro Stufe.' },
      { id: 'MAGIER_IGNITE', maxLevel: 3, name: '⚙ Entzünden [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+5% Spell-Crit pro Stufe.',
        requires: { talent: 'MAGIER_FIREBALL', level: 1 } },
      { id: 'MAGIER_FLAMESTRIKE', maxLevel: 3, name: '★ Flammeneinschlag [Ultimate]', levelRequired: 5,
        desc: 'AoE Feuer + Brand auf alle. (Benötigt: Entzünden Stufe 1)',
        requires: { talent: 'MAGIER_IGNITE', level: 1 } }
    ],
    EIS: [
      { id: 'MAGIER_FROSTBOLT',   maxLevel: 3, name: 'Frostblitz', desc: 'Schaden + −Trefferchance Debuff.' },
      { id: 'MAGIER_ICE_BARRIER', maxLevel: 3, name: 'Eisbarriere', desc: 'Absorptionsschild. +30% pro Stufe.' },
      { id: 'MAGIER_DEEP_FREEZE', maxLevel: 3, name: 'Tieffrieren', desc: 'Schaden + Betäubung. +25% pro Stufe.' },
      { id: 'MAGIER_SHATTER', maxLevel: 3, name: '⚙ Zersplittern [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+6% Spell-Crit pro Stufe.',
        requires: { talent: 'MAGIER_FROSTBOLT', level: 1 } },
      { id: 'MAGIER_FROZEN_ORB', maxLevel: 3, name: '★ Gefrorene Kugel [Ultimate]', levelRequired: 5,
        desc: 'AoE Eis + Slow alle. (Benötigt: Zersplittern Stufe 1)',
        requires: { talent: 'MAGIER_SHATTER', level: 1 } }
    ],
    ARKAN: [
      { id: 'MAGIER_ARCANE_MISSILES', maxLevel: 3, name: 'Arkane Geschosse', desc: '3 Treffer, jeder kann krittisch.' },
      { id: 'MAGIER_ARCANE_BLAST',    maxLevel: 3, name: 'Arkaner Einschlag', desc: 'Massiver Einzel-Burst 2.2× SP.' },
      { id: 'MAGIER_COUNTERSPELL',    maxLevel: 3, name: 'Gegenzauber', desc: 'Betäubt + Magie-DoT 3 Runden.' },
      { id: 'MAGIER_ARCANE_POWER', maxLevel: 3, name: '⚙ Arkane Macht [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+6% Spell-Crit + SpellPower-Bonus pro Stufe.',
        requires: { talent: 'MAGIER_ARCANE_MISSILES', level: 1 } },
      { id: 'MAGIER_ARCANE_SURGE', maxLevel: 3, name: '★ Arkaner Ausbruch [Ultimate]', levelRequired: 5,
        desc: '4 Arkane Einschläge, jeder kann krit. (Benötigt: Arkane Macht Stufe 1)',
        requires: { talent: 'MAGIER_ARCANE_POWER', level: 1 } }
    ]
  },
  PRIESTER: {
    SCHATTEN: [
      { id: 'PRIESTER_MIND_BLAST', maxLevel: 3, name: 'Gedankenschlag', desc: 'Hoher Schattenschaden. +25% pro Stufe.' },
      { id: 'PRIESTER_SW_PAIN',   maxLevel: 3, name: 'Schattenwort: Schmerz', desc: 'Schatten-DoT + Selbstheilung.' },
      { id: 'PRIESTER_MIND_FLAY', maxLevel: 3, name: 'Gedankenschinder', desc: 'Lebensraub: Schaden = Heilung.' },
      { id: 'PRIESTER_SHADOWFORM', maxLevel: 3, name: '⚙ Schattenform [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+8% Krit + +10% Schaden pro Stufe.',
        requires: { talent: 'PRIESTER_MIND_BLAST', level: 1 } },
      { id: 'PRIESTER_VOID_ERUPTION', maxLevel: 3, name: '★ Leerenausbruch [Ultimate]', levelRequired: 5,
        desc: 'AoE Schattenschaden + DoT alle. (Benötigt: Schattenform Stufe 1)',
        requires: { talent: 'PRIESTER_SHADOWFORM', level: 1 } }
    ],
    HEILUNG: [
      { id: 'PRIESTER_FLASH_HEAL', maxLevel: 3, name: 'Blitzheilung', desc: 'Schnelle starke Heilung. +35% pro Stufe.' },
      { id: 'PRIESTER_SHIELD',     maxLevel: 3, name: 'Machtwort: Schild', desc: 'Absorptionsschild. +30% pro Stufe.' },
      { id: 'PRIESTER_PRAYER',     maxLevel: 3, name: 'Gebet der Besserung', desc: 'Heilung + 50% Schadensreduktion.' },
      { id: 'PRIESTER_HOLY_CONCENTRATION', maxLevel: 3, name: '⚙ Heilige Konzentration [Passiv]', type: 'passive', levelRequired: 3,
        desc: '+10 Mana/Runde pro Stufe.',
        requires: { talent: 'PRIESTER_FLASH_HEAL', level: 1 } },
      { id: 'PRIESTER_DIVINE_HYMN', maxLevel: 3, name: '★ Göttliche Hymne [Ultimate]', levelRequired: 5,
        desc: 'Heilt gesamte Party um 50% maxHP. (Benötigt: Konzentration Stufe 1)',
        requires: { talent: 'PRIESTER_HOLY_CONCENTRATION', level: 1 } }
    ],
    DISZIPLIN: [
      { id: 'PRIESTER_PENANCE',        maxLevel: 3, name: 'Buße', desc: '2× Schaden + 60% Selbstheilung.' },
      { id: 'PRIESTER_PAIN_SUPRESSION', maxLevel: 3, name: 'Schmerzunterdrückung', desc: '−40% Schaden für Ziel, 3 Runden.' },
      { id: 'PRIESTER_DIVINE_AEGIS',   maxLevel: 3, name: 'Göttliche Ägide', desc: 'Großes Absorptionsschild SP-skaliert.' },
      { id: 'PRIESTER_DISC_PASSIVE', maxLevel: 3, name: '⚙ Disziplin-Aura [Passiv]', type: 'passive', levelRequired: 3,
        desc: 'Party −4% Schaden pro Stufe. Schilde +15% stärker.',
        requires: { talent: 'PRIESTER_DIVINE_AEGIS', level: 1 } },
      { id: 'PRIESTER_SPIRIT_SHELL', maxLevel: 3, name: '★ Geistesschale [Ultimate]', levelRequired: 5,
        desc: 'Party-Schild = 40% maxHP. (Benötigt: Disziplin-Aura Stufe 1)',
        requires: { talent: 'PRIESTER_DISC_PASSIVE', level: 1 } }
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

  // 1. Standardangriffe hinzufügen (immer verfügbar)
  if (charClass === 'KRIEGER') {
    skills.push(SKILL_DATABASE.KRIEGER_AUTO);
    skills.push(SKILL_DATABASE.KRIEGER_SMASH); // zweites SMASH am Ende der DB (Stufe 1 kosten)
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

  // 2. Talente hinzufügen, sofern gelernt (TalentLevel >= 1) — Passive werden NICHT angezeigt
  const learnedTalents = character.talents || {};
  const possibleTalents = TALENT_TREES[charClass]?.[spec] || [];

  for (const talent of possibleTalents) {
    if (talent.type === 'passive') continue; // Passive sind immer aktiv, nicht im Kampf einsetzbar
    const level = learnedTalents[talent.id] || 0;
    if (level > 0) {
      const skillTemplate = SKILL_DATABASE[talent.id];
      if (skillTemplate) {
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
 * Lernt oder verbessert ein Talent (inkl. Voraussetzungen und Level-Gating)
 */
export function learnTalent(character, talentId) {
  if (character.skillPoints <= 0) return { error: 'Keine Skillpunkte übrig!' };

  const charClass = character.classKey;
  const spec = character.specKey;
  const possibleTalents = TALENT_TREES[charClass]?.[spec] || [];
  const talentMeta = possibleTalents.find(t => t.id === talentId);

  if (!talentMeta) return { error: 'Dieses Talent existiert nicht für deine Spezialisierung!' };

  // Level-Voraussetzung prüfen
  if (talentMeta.levelRequired && character.level < talentMeta.levelRequired) {
    return { error: `Benötigt Charakterstufe ${talentMeta.levelRequired}! (Du bist Stufe ${character.level})` };
  }

  // Talent-Voraussetzung prüfen
  if (talentMeta.requires) {
    const reqLevel = character.talents[talentMeta.requires.talent] || 0;
    if (reqLevel < talentMeta.requires.level) {
      const reqMeta = possibleTalents.find(t => t.id === talentMeta.requires.talent);
      return { error: `Voraussetzung: '${reqMeta?.name || talentMeta.requires.talent}' muss mindestens Stufe ${talentMeta.requires.level} sein!` };
    }
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

  character.resetStats(); // Werte neu kalkulieren (wendet passiveEffects an)

  return { success: true, newLevel: character.talents[talentId], isPassive: !!talentMeta.type?.includes('passive') };
}
