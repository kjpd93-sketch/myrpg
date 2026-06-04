/**
 * Turn-based combat engine and Enemy definitions
 */

import { createItem } from './items.js';

export const ENEMY_TEMPLATES = {
  FLEDERMAUS: {
    name: 'Riesenfledermaus',
    level: 1,
    hp: 25,
    maxHp: 25,
    damage: 4,
    skills: [],
    xpReward: 25,
    goldRange: [3, 8],
    lootTable: []
  },
  SPINNE: {
    name: 'Riesenspinne',
    level: 1,
    hp: 38,
    maxHp: 38,
    damage: 6,
    skills: [
      { name: 'Giftbiss', chance: 0.35, dot: 3, duration: 3, text: 'beißt giftig zu' }
    ],
    xpReward: 35,
    goldRange: [5, 12],
    lootTable: [
      { id: 'Spinnenbein', chance: 0.6, isMaterial: true }
    ]
  },
  GOBLIN: {
    name: 'Goblin',
    level: 2,
    hp: 55,
    maxHp: 55,
    damage: 8,
    skills: [
      { name: 'Fieser Trick', chance: 0.3, extraDamage: 4, text: 'wirft Sand in die Augen' }
    ],
    xpReward: 60,
    goldRange: [12, 22],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.15 },
      { id: 'cloth_hood', chance: 0.15 }
    ]
  },
  SKELETT: {
    name: 'Skelett-Beschwörer',
    level: 3,
    hp: 50,
    maxHp: 50,
    damage: 13,
    skills: [
      { name: 'Feuerblitz', chance: 0.4, extraDamage: 6, text: 'beschwört einen kleinen Feuerstoß' }
    ],
    xpReward: 80,
    goldRange: [18, 30],
    lootTable: [
      { id: 'magical_orb', chance: 0.15 },
      { id: 'cloth_trousers', chance: 0.15 }
    ]
  },
  BOSS_SPIDER: {
    name: 'Spinnenkönigin (Boss)',
    level: 3,
    hp: 140,
    maxHp: 140,
    damage: 12,
    isBoss: true,
    skills: [
      { name: 'Kokonwurf', chance: 0.25, stun: true, text: 'spinnt den Helden in ein klebriges Netz ein' },
      { name: 'Tödliches Toxin', chance: 0.35, dot: 6, duration: 3, text: 'injiziert ein schweres Gift DoT' }
    ],
    xpReward: 250,
    goldRange: [80, 120],
    lootTable: [
      { id: 'steel_shield', chance: 0.5 },
      { id: 'plate_gloves', chance: 0.5 }
    ]
  },
  BOSS_GOBLIN: {
    name: 'Goblin-König (Boss)',
    level: 4,
    hp: 210,
    maxHp: 210,
    damage: 16,
    isBoss: true,
    skills: [
      { name: 'Königlicher Hieb', chance: 0.3, extraDamage: 10, stun: true, text: 'schlägt wild mit dem Zepter zu' },
      { name: 'Tollkühner Schrei', chance: 0.2, selfBuff: true, effectText: 'Wütend (Schaden +30%)' }
    ],
    xpReward: 400,
    goldRange: [150, 220],
    lootTable: [
      { id: 'sword_2h', chance: 0.4 },
      { id: 'plate_chest', chance: 0.4 },
      { id: 'holy_relic', chance: 0.4 }
    ]
  }
};

export class Combat {
  constructor(player, enemyKey) {
    this.player = player;
    
    // Gegner klonen für den Kampf
    const template = ENEMY_TEMPLATES[enemyKey];
    this.enemy = {
      ...template,
      currentHp: template.hp,
      buffs: [],
      debuffs: [],
      stunned: false,
      damageModifier: 1.0
    };

    // Spieler-Zustand für den Kampf vorbereiten
    this.player.buffs = [];
    this.player.debuffs = [];
    this.player.shield = 0;
    this.player.stunned = false;
    this.player.skipNextTurn = false;

    // Krieger Wut startet bei 0, andere behalten aktuelles Mana
    if (this.player.classKey === 'KRIEGER') {
      this.player.currentResource = 0;
    }

    this.turn = 0; // 0 = Spieler, 1 = Gegner
    this.logs = [`Kampf gegen ${this.enemy.name} (Stufe ${this.enemy.level}) beginnt!`];
    this.isOver = false;
    this.victory = false;
  }

  // Hilfsfunktion für Kampflogs
  addLog(text) {
    this.logs.push(text);
  }

  // Ticks für Buffs und Debuffs am Rundenstart
  tickEffects(target, isPlayer) {
    // 1. Schilde abbauen, falls abgelaufen (wir verwalten die Dauer in Buffs)
    
    // 2. HoTs und DoTs ausführen
    if (target.buffs && target.buffs.length > 0) {
      target.buffs.forEach(buff => {
        // Temporäre Stat-Resets (werden jede Runde durch resetStats() neu berechnet)
        if (buff.effect) buff.effect(target);

        if (buff.hot) {
          const actualHeal = Math.min(target.maxHp - target.currentHp, buff.hot);
          target.currentHp += actualHeal;
          if (actualHeal > 0) {
            this.addLog(`[Buff] ${target.name} regeneriert ${actualHeal} Leben durch '${buff.name}'.`);
          }
        }
        buff.duration--;
      });
      target.buffs = target.buffs.filter(b => b.duration > 0);
    }

    if (target.debuffs && target.debuffs.length > 0) {
      target.debuffs.forEach(debuff => {
        if (debuff.effect) debuff.effect(target);

        if (debuff.dot) {
          // Schadensreduktion anwenden, wenn es physisch ist (Gift umgeht typischerweise Rüstung, aber wir reduzieren um 30% bei Rüstung, falls gewünscht. Hier: DoTs umgehen Rüstung direkt für Nervenkitzel)
          let finalDot = debuff.dot;
          
          // Schild absorbiert Schaden zuerst
          if (isPlayer && target.shield && target.shield > 0) {
            const absorbed = Math.min(target.shield, finalDot);
            target.shield -= absorbed;
            finalDot -= absorbed;
            this.addLog(`[Debuff] ${target.name} fängt ${absorbed} Schaden von '${debuff.name}' mit Schild ab.`);
          }

          if (finalDot > 0) {
            target.currentHp = Math.max(0, target.currentHp - finalDot);
            this.addLog(`[Debuff] ${target.name} erleidet ${finalDot} periodischen Schaden durch '${debuff.name}'.`);
          }
        }
        debuff.duration--;
      });
      target.debuffs = target.debuffs.filter(d => d.duration > 0);
    }

    // Spieler/Gegner Werte neu berechnen, da Buffs verflogen sein können
    if (isPlayer) {
      target.resetStats();
    }
  }

  // Führt den Spielerzug aus
  executePlayerTurn(skill) {
    if (this.isOver) return;

    // Buffs/Debuffs vor der Aktion berechnen
    this.player.bonusStats = { strength: 0, agility: 0, intellect: 0, stamina: 0, armor: 0, damage: 0, spellPower: 0, healPower: 0 };
    this.player.bonusCritChance = 0;
    this.player.damageDebuff = 0;
    this.tickEffects(this.player, true);

    if (this.player.currentHp <= 0) {
      this.checkDefeat();
      return;
    }

    // Wenn der Spieler betäubt ist
    if (this.player.stunned) {
      this.addLog(`${this.player.name} ist betäubt und kann nicht handeln!`);
      this.player.stunned = false;
      this.endPlayerTurn();
      return;
    }

    // Wenn der Spieler durch Hervorrufung o.ä. blockiert ist
    if (this.player.skipNextTurn) {
      this.addLog(`${this.player.name} sammelt Kräfte für diese Runde.`);
      this.player.skipNextTurn = false;
      this.endPlayerTurn();
      return;
    }

    // Skill ausführen
    const result = skill.execute(this.player, this.enemy);
    if (result.error) {
      return result; // Gibt Fehler an UI weiter (z.B. "Nicht genug Mana")
    }

    this.addLog(result.text);

    // Wut-Aufbau für Krieger durch Angriffe (falls nicht Auto-Angriff, der generiert selbst)
    if (this.player.classKey === 'KRIEGER' && skill.id !== 'KRIEGER_AUTO') {
      // Normale Fähigkeiten generieren keine Wut, sondern verbrauchen sie
    }

    this.checkVictory();
    if (!this.isOver) {
      this.endPlayerTurn();
    }
  }

  endPlayerTurn() {
    this.turn = 1;
    this.executeEnemyTurn();
  }

  // Führt den Gegnerzug aus
  executeEnemyTurn() {
    if (this.isOver) return;

    // Buffs/Debuffs ticken
    this.enemy.damageDebuff = 0;
    this.enemy.damageTakenMultiplier = 1.0;
    this.enemy.hitChanceModifier = 0.0;
    this.tickEffects(this.enemy, false);

    if (this.enemy.currentHp <= 0) {
      this.checkVictory();
      return;
    }

    // Wenn der Gegner betäubt ist
    if (this.enemy.stunned) {
      this.addLog(`${this.enemy.name} ist betäubt und setzt eine Runde aus!`);
      this.enemy.stunned = false;
      this.turn = 0;
      return;
    }

    // KI-Entscheidung: Nutzt der Gegner eine Fähigkeit oder greift er normal an?
    let actionText = '';
    let dmg = this.enemy.damage;

    // Schadensmodifikatoren auf Feindseite anwenden (z.B. Demoralisierender Ruf)
    if (this.enemy.damageDebuff) {
      dmg = Math.round(dmg * (1 - this.enemy.damageDebuff));
    }
    if (this.enemy.damageModifier > 1.0) {
      dmg = Math.round(dmg * this.enemy.damageModifier);
    }

    // Trefferwahrscheinlichkeit berechnen (Standard 90%)
    let hitChance = 0.90 + (this.enemy.hitChanceModifier || 0);
    const dodged = Math.random() > hitChance;

    if (dodged) {
      this.addLog(`${this.enemy.name} greift an, aber ${this.player.name} weicht geschickt aus!`);
    } else {
      // Hat der Gegner Spezialfähigkeiten?
      const usableSkills = this.enemy.skills || [];
      const skill = usableSkills.find(s => Math.random() < s.chance);

      if (skill) {
        actionText = `${this.enemy.name} wirkt '${skill.name}': ${skill.text}. `;
        
        if (skill.extraDamage) {
          dmg += skill.extraDamage;
        }

        if (skill.dot) {
          this.player.debuffs.push({
            name: skill.name,
            duration: skill.duration,
            dot: skill.dot,
            text: `Leidet unter ${skill.name}.`
          });
        }

        if (skill.stun) {
          this.player.stunned = true;
        }

        if (skill.selfBuff) {
          this.enemy.damageModifier = 1.30;
          this.enemy.buffs.push({
            name: 'Wütend',
            duration: 3,
            effect: (e) => { e.damageModifier = 1.30; },
            text: 'Schaden um 30% erhöht.'
          });
        }
      } else {
        actionText = `${this.enemy.name} schlägt heftig zu. `;
      }

      // Rüstung und Schilde des Spielers anwenden
      const reduction = this.player.getDamageReduction();
      let finalDamage = Math.max(1, Math.round(dmg * (1 - reduction)));

      // Falls Richturteil oder ähnliches debufft
      if (this.enemy.damageTakenMultiplier) {
        // Gilt nur für Schaden am Gegner, Spieler hat eigene Multiplikatoren
      }

      let logPrefix = '';
      
      // Schild-Absorption
      if (this.player.shield && this.player.shield > 0) {
        const absorbed = Math.min(this.player.shield, finalDamage);
        this.player.shield -= absorbed;
        finalDamage -= absorbed;
        logPrefix += `(Schild fängt ${absorbed} Schaden ab) `;
      }

      if (finalDamage > 0) {
        this.player.currentHp = Math.max(0, this.player.currentHp - finalDamage);
        
        // Krieger Wut-Generierung durch erlittenen Schaden
        if (this.player.classKey === 'KRIEGER') {
          // Generiert 1 Wut pro 3 Schadenspunkte
          const rageGen = Math.min(50, Math.floor(finalDamage * 0.4));
          if (rageGen > 0) {
            this.player.currentResource = Math.min(100, this.player.currentResource + rageGen);
            logPrefix += `(+${rageGen} Wut) `;
          }
        }
      }

      this.addLog(`${actionText}${logPrefix}Verursacht ${finalDamage} Schaden an ${this.player.name}.`);
    }

    this.checkDefeat();
    if (!this.isOver) {
      this.turn = 0;
    }
  }

  // Prüft auf Sieg
  checkVictory() {
    if (this.enemy.currentHp <= 0) {
      this.isOver = true;
      this.victory = true;
      this.addLog(`Sieg! ${this.enemy.name} wurde bezwungen.`);
      this.distributeRewards();
    }
  }

  // Prüft auf Niederlage
  checkDefeat() {
    if (this.player.currentHp <= 0) {
      this.isOver = true;
      this.victory = false;
      this.addLog(`Niederlage! ${this.player.name} ist im Kampf gefallen...`);
    }
  }

  // Verteilt XP, Gold und Beute nach dem Kampf
  distributeRewards() {
    // XP berechnen
    this.xpEarned = this.enemy.xpReward;
    const leveledUp = this.player.addXp(this.xpEarned);
    if (leveledUp) {
      this.addLog(`★ LEVEL UP! ${this.player.name} erreicht Stufe ${this.player.level}! ★ (+1 Skillpunkt)`);
    }

    // Gold berechnen
    const goldGained = Math.floor(
      Math.random() * (this.enemy.goldRange[1] - this.enemy.goldRange[0] + 1) + this.enemy.goldRange[0]
    );
    let finalGold = goldGained;
    if (this.player.raceKey === 'MENSCH') {
      finalGold = Math.round(finalGold * 1.1); // 10% Bonus
    }
    this.player.gold += finalGold;
    this.goldEarned = finalGold;

    // Loot würfeln
    this.lootEarned = [];
    
    // Quest-Spezifischer Loot (z.B. Kopf für Bosse)
    if (this.enemy.isBoss) {
      if (this.enemy.name.includes('Spinnenkönigin')) {
        this.lootEarned.push({ name: 'Spinnenkönigin (Boss) Kopf', isQuestItem: true, id: 'Spinnenkönigin (Boss)' });
      } else if (this.enemy.name.includes('Goblin-König')) {
        this.lootEarned.push({ name: 'Goblin-König (Boss) Kopf', isQuestItem: true, id: 'Goblin-König (Boss)' });
      }
    }

    // Normaler Beutetabellen-Loot
    const table = this.enemy.lootTable || [];
    table.forEach(entry => {
      if (Math.random() < entry.chance) {
        if (entry.isMaterial) {
          this.lootEarned.push({ name: entry.id, isMaterial: true });
        } else {
          const item = createItem(entry.id);
          if (item) {
            this.player.inventory.push(item);
            this.lootEarned.push(item);
          }
        }
      }
    });
  }

  // Flucht-Versuch
  flee() {
    if (this.enemy.isBoss) {
      this.addLog('Aus einem Bosskampf kann man nicht fliehen!');
      return false;
    }

    const success = Math.random() < 0.4; // 40% Fluchtchance
    if (success) {
      this.isOver = true;
      this.victory = false;
      this.fled = true;
      this.addLog(`${this.player.name} flieht panisch aus dem Kampf!`);
    } else {
      this.addLog(`${this.player.name} versucht zu fliehen, scheitert jedoch!`);
      this.endPlayerTurn();
    }
    return success;
  }
}
