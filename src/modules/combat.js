/**
 * Turn-based combat engine and Enemy definitions
 */

import { createItem } from './items.js';
import { SKILL_DATABASE } from './skills.js';

// ─── Gegner-Definitionen ──────────────────────────────────────────────────────

export const ENEMY_TEMPLATES = {
  FLEDERMAUS: {
    name: 'Riesenfledermaus',
    level: 1,
    hp: 55, maxHp: 55,
    damage: 7,
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
    hp: 80, maxHp: 80,
    damage: 10,
    armor: 3,
    skills: [
      { name: 'Giftbiss', chance: 0.30, dot: 5, duration: 3, text: 'beißt giftig zu' }
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
    hp: 110, maxHp: 110,
    damage: 13,
    armor: 5,
    skills: [
      { name: 'Fieser Trick', chance: 0.25, extraDamage: 6, text: 'wirft Sand in die Augen', hitChanceMod: -0.15, hitChanceDuration: 2 }
    ],
    xpReward: 70,
    goldRange: [15, 25],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.12 },
      { id: 'cloth_hood', chance: 0.12 }
    ]
  },
  SKELETT: {
    name: 'Skelett-Beschwörer',
    image: 'assets/images/enemy_skeleton.png',
    level: 3,
    hp: 95, maxHp: 95,
    damage: 17,
    armor: 4,
    skills: [
      { name: 'Feuerblitz', chance: 0.35, extraDamage: 10, text: 'beschwört einen Feuerstoß', isSpell: true }
    ],
    xpReward: 90,
    goldRange: [20, 35],
    lootTable: [
      { id: 'magical_orb', chance: 0.12 },
      { id: 'cloth_trousers', chance: 0.12 }
    ]
  },

  // ─── Dungeon 2: Orkfestung ────────────────────────────────────────────────
  ORK: {
    name: 'Ork-Krieger',
    image: 'assets/images/enemy_ork.png',
    level: 3,
    hp: 160, maxHp: 160,
    damage: 18,
    armor: 12,
    skills: [
      { name: 'Berserker-Schrei', chance: 0.20, selfBuff: true, buffMult: 1.35, effectText: 'Berserker (+35% Schaden)' },
      { name: 'Wuchtschlag',      chance: 0.25, extraDamage: 12, text: 'schlägt mit voller Wucht zu' }
    ],
    xpReward: 110,
    goldRange: [25, 45],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.15 },
      { id: 'war_mace',     chance: 0.10 }
    ]
  },
  DUNKELELF: {
    name: 'Dunkel-Elfe',
    level: 3,
    hp: 100, maxHp: 100,
    damage: 15,
    armor: 6,
    skills: [
      { name: 'Giftpfeil',    chance: 0.35, dot: 8, duration: 3, text: 'schießt einen vergifteten Pfeil' },
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
    level: 4,
    hp: 240, maxHp: 240,
    damage: 20,
    armor: 30,
    skills: [
      { name: 'Erdstampfer',     chance: 0.25, extraDamage: 15, isAoe: true, text: 'erschüttert den Boden — alle spüren die Wucht' },
      { name: 'Gesteinsrüstung', chance: 0.15, selfBuff: true, buffMult: 1.10, effectText: 'Gestein verhärtet (+10% Schaden)' }
    ],
    xpReward: 130,
    goldRange: [30, 55],
    lootTable: [
      { id: 'plate_boots',  chance: 0.15 },
      { id: 'tower_shield', chance: 0.08 }
    ]
  },
  VAMPIR: {
    name: 'Vampir',
    image: 'assets/images/enemy_skeleton.png',
    level: 4,
    hp: 140, maxHp: 140,
    damage: 22,
    armor: 8,
    skills: [
      { name: 'Blutdurst', chance: 0.30, extraDamage: 10, lifeSteal: 0.50, text: 'beißt und saugt das Blut des Opfers' },
      { name: 'Hypnose',   chance: 0.20, stun: true, text: 'blickt dem Ziel tief in die Augen' }
    ],
    xpReward: 120,
    goldRange: [30, 50],
    lootTable: [
      { id: 'dark_tome',  chance: 0.10 },
      { id: 'cloth_robe', chance: 0.12 }
    ]
  },

  // ─── Bosse ─────────────────────────────────────────────────────────────────
  BOSS_SPIDER: {
    name: 'Spinnenkönigin',
    image: 'assets/images/enemy_spider.png',
    level: 3,
    hp: 320, maxHp: 320,
    damage: 18,
    armor: 10,
    isBoss: true,
    skills: [
      { name: 'Kokonwurf', chance: 0.20, stun: true, text: 'spinnt ein Ziel in ein klebriges Netz ein' },
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
    image: 'assets/images/enemy_ork.png',
    level: 4,
    hp: 480, maxHp: 480,
    damage: 22,
    armor: 18,
    isBoss: true,
    skills: [
      { name: 'Königlicher Hieb', chance: 0.25, extraDamage: 14, stun: true, text: 'schlägt wild mit dem Zepter zu' },
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
    image: 'assets/images/enemy_ork.png',
    level: 5,
    hp: 700, maxHp: 700,
    damage: 30,
    armor: 22,
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
      { id: 'plate_helm_t2', chance: 0.45 }
    ]
  },

  // ─── Boss: Verfluchte Katakomben ──────────────────────────────────────────
  BOSS_VAMPIRFUERST: {
    name: 'Vampirfürst Mordecai',
    image: 'assets/images/enemy_skeleton.png',
    level: 6,
    hp: 850, maxHp: 850,
    damage: 32,
    armor: 15,
    isBoss: true,
    skills: [
      { name: 'Lebensraub',       chance: 0.30, extraDamage: 15, lifeSteal: 0.60, text: 'entzieht dem Ziel die Lebensenergie mit einem Biss' },
      { name: 'Vampirischer Blick', chance: 0.20, stun: true, text: 'lähmt das Ziel mit seinem Todesblick' }
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
      { id: 'dark_tome',         chance: 0.50 }
    ]
  }
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/**
 * Erstellt eine skalierte Gegner-Instanz.
 * HP skaliert mit +35% pro Leveldifferenz, Schaden mit +25%.
 */
function createEnemy(key, targetLevel = null) {
  const tpl = ENEMY_TEMPLATES[key];
  const levelDiff = targetLevel && targetLevel > tpl.level ? targetLevel - tpl.level : 0;

  const scaledHp   = Math.round(tpl.hp     * (1 + levelDiff * 0.35));
  const scaledDmg  = Math.round(tpl.damage * (1 + levelDiff * 0.25));

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
      if (h.classKey === 'KRIEGER') h.currentResource = 0;
    });

    this.enemies = enemyKeys.map(key => createEnemy(key, encounterLevel));

    this.turn = 0;
    const enemyNames = this.enemies.map(e => e.name).join(', ');
    this.logs = [`Kampf gegen ${enemyNames} beginnt!`];
    this.isOver  = false;
    this.victory = false;
    this.fled    = false;

    this.getAliveHeroes  = () => this.heroes.filter(h => h.currentHp > 0);
    this.getAliveEnemies = () => this.enemies.filter(e => e.currentHp > 0);

    this.turnQueue = [];
    this.currentTurnIndex = 0;
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

  nextTurn() {
    if (this.isOver) return;
    this.checkVictory();
    this.checkDefeat();
    if (this.isOver) return;

    if (this.currentTurnIndex >= this.turnQueue.length) {
      this.currentTurnIndex = 0;
      this.addLog('─── Neue Runde ───');
    }

    const { entity, type } = this.turnQueue[this.currentTurnIndex];

    if (entity.currentHp <= 0) {
      this.currentTurnIndex++;
      this.nextTurn();
      return;
    }

    if (type === 'hero' && entity === this.player) {
      this.tickEffects(entity, true);
      if (entity.currentHp <= 0) { this.checkDefeat(); this.currentTurnIndex++; if (!this.isOver) this.nextTurn(); return; }
      if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt und setzt aus!`);
        entity.stunned = false; this.currentTurnIndex++; this.nextTurn(); return;
      }
      if (entity.skipNextTurn) {
        this.addLog(`${entity.name} sammelt Kräfte.`);
        entity.skipNextTurn = false; this.currentTurnIndex++; this.nextTurn(); return;
      }
      return; // Warte auf executePlayerTurn()

    } else if (type === 'hero') {
      this.tickEffects(entity, true);
      if (entity.currentHp > 0 && !entity.stunned) {
        this.executeCompanionAI(entity);
      } else if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt!`);
        entity.stunned = false;
      }
      this.currentTurnIndex++;
      this.nextTurn();

    } else {
      this.tickEffects(entity, false);
      if (entity.currentHp > 0 && !entity.stunned) {
        this.executeEnemyAI(entity);
      } else if (entity.stunned) {
        this.addLog(`${entity.name} ist betäubt!`);
        entity.stunned = false;
      }
      this.currentTurnIndex++;
      this.nextTurn();
    }
  }

  addLog(text) { this.logs.push(text); }

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
      target.debuffs = target.debuffs.filter(d => d.duration > 0);
    }
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
      // 1. Treffercheck (Base 87%, modifiziert durch Debuffs des Casters)
      const hitChance = 0.87 + (caster.hitChanceModifier || 0);
      if (Math.random() > hitChance) {
        return { text: `${caster.name} greift ${target.name} an — verfehlt!`, damage: 0, miss: true };
      }
    }

    const result = skill.execute(caster, target);
    if (result.error) return result;

    if (isDmgVsEnemy && result.damage > 0) {
      // 2. Crit-Check
      const isSpell = skill.costType === 'MANA' &&
        caster.classKey !== 'KRIEGER' && caster.classKey !== 'PALADIN';
      const critChance = isSpell
        ? (caster.getSpellCritChance ? caster.getSpellCritChance() : 0.05)
        : (caster.getCritChance      ? caster.getCritChance()      : 0.05);

      if (Math.random() < critChance) {
        const extra = Math.round(result.damage * 0.75);
        target.currentHp = Math.max(0, target.currentHp - extra);

        // Proc: Blutfieber (KRIEGER/FUROR) → +8 Wut bei Crit
        if (caster.hasTalent?.('KRIEGER_BLOOD_FRENZY')) {
          caster.currentResource = Math.min(100, (caster.currentResource || 0) + 8);
        }

        return {
          ...result,
          text: result.text + ` 💥 KRIT! (+${extra})`,
          damage: result.damage + extra,
          isCrit: true
        };
      }
    }

    return result;
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

    if (!this.isOver) { this.currentTurnIndex++; this.nextTurn(); }
    return { success: true, result };
  }

  // ─── Companion-KI ────────────────────────────────────────────────────────────

  /** Gibt klassenspezifische Basis-Skills zurück (unabhängig vom Talentsystem). */
  getCompanionSkills(comp) {
    const { classKey, specKey, role } = comp;

    if (classKey === 'PRIESTER') {
      if (role === 'HEALER' || specKey === 'HEILUNG') {
        return [SKILL_DATABASE.PRIESTER_FLASH_HEAL, SKILL_DATABASE.PRIESTER_RENEW,
                SKILL_DATABASE.PRIESTER_SHIELD, SKILL_DATABASE.PRIESTER_SMITE, SKILL_DATABASE.PRIESTER_AUTO];
      }
      return [SKILL_DATABASE.PRIESTER_MIND_BLAST, SKILL_DATABASE.PRIESTER_SW_PAIN,
              SKILL_DATABASE.PRIESTER_AUTO];
    }
    if (classKey === 'PALADIN') {
      if (role === 'TANK' || specKey === 'TANK') {
        return [SKILL_DATABASE.PALADIN_AVENGERS_SHIELD, SKILL_DATABASE.PALADIN_HOLY_SHIELD,
                SKILL_DATABASE.PALADIN_FLASH_OF_LIGHT, SKILL_DATABASE.PALADIN_AUTO];
      }
      return [SKILL_DATABASE.PALADIN_CRUSADER_STRIKE, SKILL_DATABASE.PALADIN_JUDGEMENT,
              SKILL_DATABASE.PALADIN_WORD_OF_GLORY, SKILL_DATABASE.PALADIN_AUTO];
    }
    if (classKey === 'KRIEGER') {
      if (role === 'TANK' || specKey === 'TANK') {
        return [SKILL_DATABASE.KRIEGER_SHIELD_SLAM, SKILL_DATABASE.KRIEGER_DEMO_SHOUT,
                SKILL_DATABASE.KRIEGER_LAST_STAND, SKILL_DATABASE.KRIEGER_AUTO];
      }
      return [SKILL_DATABASE.KRIEGER_BLOODTHIRST, SKILL_DATABASE.KRIEGER_WHIRLWIND,
              SKILL_DATABASE.KRIEGER_AUTO];
    }
    if (classKey === 'MAGIER') {
      if (specKey === 'ARKAN') {
        return [SKILL_DATABASE.MAGIER_ARCANE_BLAST, SKILL_DATABASE.MAGIER_ARCANE_MISSILES,
                SKILL_DATABASE.MAGIER_COUNTERSPELL, SKILL_DATABASE.MAGIER_AUTO];
      }
      return [SKILL_DATABASE.MAGIER_FIREBALL, SKILL_DATABASE.MAGIER_FROSTBOLT,
              SKILL_DATABASE.MAGIER_ICE_BARRIER, SKILL_DATABASE.MAGIER_AUTO];
    }
    if (classKey === 'KRIEGER' && specKey === 'WAFFEN') {
      return [SKILL_DATABASE.KRIEGER_MORTAL_STRIKE, SKILL_DATABASE.KRIEGER_HEROIC_STRIKE,
              SKILL_DATABASE.KRIEGER_BLADESTORM, SKILL_DATABASE.KRIEGER_AUTO];
    }
    if (classKey === 'PALADIN' && specKey === 'HEILIG') {
      return [SKILL_DATABASE.PALADIN_HOLY_LIGHT, SKILL_DATABASE.PALADIN_BEACON,
              SKILL_DATABASE.PALADIN_CONSECRATION, SKILL_DATABASE.PALADIN_AUTO];
    }
    if (classKey === 'PRIESTER' && specKey === 'DISZIPLIN') {
      return [SKILL_DATABASE.PRIESTER_PENANCE, SKILL_DATABASE.PRIESTER_DIVINE_AEGIS,
              SKILL_DATABASE.PRIESTER_PAIN_SUPRESSION, SKILL_DATABASE.PRIESTER_AUTO];
    }
    return [];
  }

  /**
   * Heilt einen Verbündeten direkt (Companions heilen andere Helden, nicht sich selbst).
   * Basiert auf SpellPower des Companions.
   */
  applyCompanionHeal(comp, target, isHoT = false) {
    const sp = comp.getSpellPower ? comp.getSpellPower() : 10;
    if (isHoT) {
      const cost = 15;
      if (comp.currentResource < cost) return null;
      comp.currentResource -= cost;
      const hotVal = Math.round(5 + sp * 0.35);
      target.buffs = target.buffs || [];
      target.buffs.push({ name: 'Erneuerung', duration: 3, hot: hotVal });
      return `${comp.name} wirkt Erneuerung auf ${target.name} (+${hotVal} LP/Runde).`;
    } else {
      const cost = 20;
      if (comp.currentResource < cost) return null;
      comp.currentResource -= cost;
      const heal = Math.round(20 + sp * 1.3);
      target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
      return `${comp.name} heilt ${target.name} um ${heal} LP.`;
    }
  }

  executeCompanionAI(comp) {
    if (this.isOver) return;
    const aliveHeroes  = this.getAliveHeroes();
    const aliveEnemies = this.getAliveEnemies();
    const skills       = this.getCompanionSkills(comp);

    const heroHpPct = h => h.currentHp / h.maxHp;

    // Priorität 1: Notfall-Heilung — irgendein Held < 25% HP
    const critHero = aliveHeroes.find(h => heroHpPct(h) < 0.25);
    if (critHero) {
      const log = this.applyCompanionHeal(comp, critHero);
      if (log) { this.addLog(`[Comp] ${log}`); return; }
    }

    // Priorität 2: Vorsorge-Heilung für Heiler — niedrigster Held < 55% HP
    if (comp.role === 'HEALER') {
      const lowest = aliveHeroes.reduce((a, b) => heroHpPct(a) < heroHpPct(b) ? a : b);
      if (heroHpPct(lowest) < 0.55) {
        // Versuche HoT wenn kein direkter Schaden, sonst direkte Heilung
        const hotUsed = !lowest.buffs?.some(b => b.name === 'Erneuerung')
          ? this.applyCompanionHeal(comp, lowest, true)
          : null;
        const log = hotUsed || this.applyCompanionHeal(comp, lowest);
        if (log) { this.addLog(`[Comp] ${log}`); return; }
      }
    }

    // Priorität 3: Selbstschutz (Schild/Buff) wenn comp < 40% HP
    if (heroHpPct(comp) < 0.40) {
      const shieldSkill = skills.find(s => s.type === 'buff' && comp.currentResource >= s.cost);
      if (shieldSkill) {
        const res = shieldSkill.execute(comp, comp);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }

    // Priorität 4: Debuff auf stärksten Feind
    if (aliveEnemies.length > 0) {
      const debuffSkill = skills.find(s => s.type === 'debuff' && comp.currentResource >= s.cost);
      if (debuffSkill) {
        const target = aliveEnemies.reduce((a, b) => a.currentHp > b.currentHp ? a : b);
        const res = debuffSkill.execute(comp, target);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }

    // Priorität 5: Schaden
    if (aliveEnemies.length > 0) {
      // Tank fokussiert stärksten Feind; DPS/Healer killt schwächsten zuerst
      const target = comp.role === 'TANK'
        ? aliveEnemies.reduce((a, b) => a.currentHp > b.currentHp ? a : b)
        : aliveEnemies.reduce((a, b) => a.currentHp < b.currentHp ? a : b);

      const dmgSkill =
        skills.find(s => s.type === 'damage' && s.cost > 0 && comp.currentResource >= s.cost) ||
        skills.find(s => s.type === 'damage' && s.cost === 0);

      if (dmgSkill) {
        const res = this.executeAttack(comp, target, dmgSkill);
        if (!res.error) { this.addLog(`[Comp] ${res.text}`); return; }
      }
    }

    // Fallback
    this.addLog(`[Comp] ${comp.name} wartet ab.`);
  }

  // ─── Feind-KI ────────────────────────────────────────────────────────────────

  executeEnemyAI(enemy) {
    if (this.isOver) return;
    const aliveHeroes = this.getAliveHeroes();
    if (!aliveHeroes.length) return;

    // Zielwahl: 30% Chance auf Tank/Krieger, sonst zufällig
    let target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    if (Math.random() < 0.30) {
      const frontline = aliveHeroes.filter(h => h.role === 'TANK' || h.classKey === 'KRIEGER' || h.classKey === 'PALADIN');
      if (frontline.length) target = frontline[Math.floor(Math.random() * frontline.length)];
    }

    // Skill auswählen
    const allSkills = enemy.skills || [];
    const usedSkill = allSkills.find(s => Math.random() < s.chance);

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
    if (skill?.stun) hero.stunned = true;
    if (skill?.hitChanceMod) {
      hero.buffs = hero.buffs || [];
      hero.buffs.push({
        name: 'Geblendet', duration: skill.hitChanceDuration || 2,
        effect: (h) => { h.hitChanceModifier = (h.hitChanceModifier || 0) + skill.hitChanceMod; }
      });
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
    // XP
    this.xpEarned = this.enemies.reduce((s, e) => s + e.xpReward, 0);
    const leveledUp = this.player.addXp(this.xpEarned);
    if (leveledUp) {
      this.addLog(`⭐ LEVEL UP! ${this.player.name} erreicht Stufe ${this.player.level}!`);
      if (this.player.party) this.player.party.forEach(c => c.syncLevel(this.player.level));
    }

    // Gold
    let gold = 0;
    this.enemies.forEach(e => {
      gold += Math.floor(Math.random() * (e.goldRange[1] - e.goldRange[0] + 1) + e.goldRange[0]);
    });
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
            const item = createItem(entry.id);
            if (item) { this.player.inventory.push(item); this.lootEarned.push(item); }
          }
        }
      });
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
