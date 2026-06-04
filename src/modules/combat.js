/**
 * Turn-based combat engine and Enemy definitions
 */

import { createItem } from './items.js';

export const ENEMY_TEMPLATES = {
  FLEDERMAUS: {
    name: 'Riesenfledermaus',
    level: 1,
    hp: 35,
    maxHp: 35,
    damage: 6,
    skills: [],
    xpReward: 35,
    goldRange: [4, 10],
    lootTable: []
  },
  SPINNE: {
    name: 'Riesenspinne',
    image: 'assets/images/enemy_spider.png',
    level: 1,
    hp: 48,
    maxHp: 48,
    damage: 9,
    skills: [
      { name: 'Giftbiss', chance: 0.35, dot: 4, duration: 3, text: 'beißt giftig zu' }
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
    hp: 65,
    maxHp: 65,
    damage: 12,
    skills: [
      { name: 'Fieser Trick', chance: 0.3, extraDamage: 5, text: 'wirft Sand in die Augen' }
    ],
    xpReward: 70,
    goldRange: [15, 25],
    lootTable: [
      { id: 'heavy_gloves', chance: 0.15 },
      { id: 'cloth_hood', chance: 0.15 }
    ]
  },
  SKELETT: {
    name: 'Skelett-Beschwörer',
    image: 'assets/images/enemy_skeleton.png',
    level: 3,
    hp: 60,
    maxHp: 60,
    damage: 16,
    skills: [
      { name: 'Feuerblitz', chance: 0.4, extraDamage: 8, text: 'beschwört einen kleinen Feuerstoß' }
    ],
    xpReward: 90,
    goldRange: [20, 35],
    lootTable: [
      { id: 'magical_orb', chance: 0.15 },
      { id: 'cloth_trousers', chance: 0.15 }
    ]
  },
  BOSS_SPIDER: {
    name: 'Spinnenkönigin (Boss)',
    image: 'assets/images/enemy_spider.png',
    level: 3,
    hp: 250,
    maxHp: 250,
    damage: 18,
    isBoss: true,
    skills: [
      { name: 'Kokonwurf', chance: 0.25, stun: true, text: 'spinnt ein Ziel in ein klebriges Netz ein' },
      { name: 'Tödliches Toxin', chance: 0.35, dot: 8, duration: 3, text: 'injiziert ein schweres Gift DoT' }
    ],
    xpReward: 350,
    goldRange: [100, 150],
    lootTable: [
      { id: 'steel_shield', chance: 0.5 },
      { id: 'plate_gloves', chance: 0.5 }
    ]
  },
  BOSS_GOBLIN: {
    name: 'Goblin-König (Boss)',
    image: 'assets/images/enemy_ork.png', // Ork image serves as Boss Goblin
    level: 4,
    hp: 380,
    maxHp: 380,
    damage: 22,
    isBoss: true,
    skills: [
      { name: 'Königlicher Hieb', chance: 0.3, extraDamage: 12, stun: true, text: 'schlägt wild mit dem Zepter zu' },
      { name: 'Tollkühner Schrei', chance: 0.2, selfBuff: true, effectText: 'Wütend (Schaden +30%)' }
    ],
    xpReward: 500,
    goldRange: [180, 250],
    lootTable: [
      { id: 'sword_2h', chance: 0.4 },
      { id: 'plate_chest', chance: 0.4 },
      { id: 'holy_relic', chance: 0.4 }
    ]
  }
};

export class Combat {
  constructor(player, enemyKeys) {
    this.player = player;
    
    // Party initialisieren
    this.heroes = [player, ...(player.party || [])];
    this.heroes.forEach(h => {
      h.buffs = [];
      h.debuffs = [];
      h.shield = 0;
      h.stunned = false;
      h.skipNextTurn = false;
      if (h.classKey === 'KRIEGER') h.currentResource = 0;
    });

    // Feinde initialisieren
    this.enemies = enemyKeys.map((key, idx) => {
      const template = ENEMY_TEMPLATES[key];
      return {
        ...template,
        id: `enemy_${idx}`,
        currentHp: template.hp,
        buffs: [],
        debuffs: [],
        stunned: false,
        damageModifier: 1.0,
        damageDebuff: 0,
        damageTakenMultiplier: 1.0,
        hitChanceModifier: 0.0
      };
    });

    this.turn = 0; // 0 = Player, 1 = Companions, 2 = Enemies
    
    const enemyNames = this.enemies.map(e => e.name).join(', ');
    this.logs = [`Kampf gegen ${enemyNames} beginnt!`];
    this.isOver = false;
    this.victory = false;
    this.fled = false;
    
    // Hilfsfunktion: Gibt alle lebenden Ziele zurück
    this.getAliveHeroes = () => this.heroes.filter(h => h.currentHp > 0);
    this.getAliveEnemies = () => this.enemies.filter(e => e.currentHp > 0);

    this.turnQueue = [];
    this.currentTurnIndex = 0;
  }

  startCombat() {
    // Initiative würfeln (W20 + Beweglichkeit oder Level-basiert)
    const rollInitiative = (entity, isHero) => {
      const agi = isHero ? (entity.getAgility ? entity.getAgility() : 5) : (entity.level * 2);
      const d20 = Math.floor(Math.random() * 20) + 1;
      return d20 + agi;
    };

    this.heroes.forEach(h => {
      this.turnQueue.push({ entity: h, type: 'hero', initiative: rollInitiative(h, true) });
    });
    this.enemies.forEach(e => {
      this.turnQueue.push({ entity: e, type: 'enemy', initiative: rollInitiative(e, false) });
    });

    // Absteigend sortieren
    this.turnQueue.sort((a, b) => b.initiative - a.initiative);
    
    let orderLog = this.turnQueue.map(t => `${t.entity.name} (${t.initiative})`).join(', ');
    this.addLog(`🎲 Initiative gewürfelt! Zugreihenfolge: ${orderLog}`);

    // Den ersten Zug starten
    this.nextTurn();
  }

  nextTurn() {
    if (this.isOver) return;
    this.checkVictory();
    this.checkDefeat();
    if (this.isOver) return;

    if (this.currentTurnIndex >= this.turnQueue.length) {
      this.currentTurnIndex = 0; // Neue Runde
      this.addLog('--- Neue Kampfrunde ---');
    }

    const turnData = this.turnQueue[this.currentTurnIndex];
    const currentActor = turnData.entity;
    const type = turnData.type;

    if (currentActor.currentHp <= 0) {
      this.currentTurnIndex++;
      this.nextTurn();
      return;
    }

    if (type === 'hero' && currentActor === this.player) {
      // Spieler ist dran! Wir unterbrechen den Loop und warten auf UI Input.
      this.player.bonusStats = { strength: 0, agility: 0, intellect: 0, stamina: 0, armor: 0, damage: 0, spellPower: 0, healPower: 0 };
      this.player.bonusCritChance = 0;
      this.player.damageDebuff = 0;
      this.tickEffects(this.player, true);

      if (this.player.currentHp <= 0) {
        this.checkDefeat();
        this.currentTurnIndex++;
        if (!this.isOver) this.nextTurn();
        return;
      }

      if (this.player.stunned) {
        this.addLog(`${this.player.name} ist betäubt und kann nicht handeln!`);
        this.player.stunned = false;
        this.currentTurnIndex++;
        this.nextTurn();
        return;
      }

      if (this.player.skipNextTurn) {
        this.addLog(`${this.player.name} sammelt Kräfte für diese Runde.`);
        this.player.skipNextTurn = false;
        this.currentTurnIndex++;
        this.nextTurn();
        return;
      }

      // Warte auf executePlayerTurn Aufruf
      return;
    }
    else if (type === 'hero') {
      this.tickEffects(currentActor, true);
      if (currentActor.currentHp > 0 && !currentActor.stunned) {
        this.executeCompanionAI(currentActor);
      } else if (currentActor.stunned) {
        this.addLog(`${currentActor.name} ist betäubt!`);
        currentActor.stunned = false;
      }
      this.currentTurnIndex++;
      this.nextTurn();
    }
    else if (type === 'enemy') {
      this.tickEffects(currentActor, false);
      if (currentActor.currentHp > 0 && !currentActor.stunned) {
        this.executeEnemyAI(currentActor);
      } else if (currentActor.stunned) {
        this.addLog(`${currentActor.name} ist betäubt!`);
        currentActor.stunned = false;
      }
      this.currentTurnIndex++;
      this.nextTurn();
    }
  }

  addLog(text) {
    this.logs.push(text);
  }

  tickEffects(target, isPlayerSide) {
    if (target.buffs && target.buffs.length > 0) {
      target.buffs.forEach(buff => {
        if (buff.effect) buff.effect(target);
        if (buff.hot) {
          const actualHeal = Math.min(target.maxHp - target.currentHp, buff.hot);
          target.currentHp += actualHeal;
          if (actualHeal > 0) this.addLog(`[Buff] ${target.name} regeneriert ${actualHeal} Leben durch '${buff.name}'.`);
        }
        buff.duration--;
      });
      target.buffs = target.buffs.filter(b => b.duration > 0);
    }

    if (target.debuffs && target.debuffs.length > 0) {
      target.debuffs.forEach(debuff => {
        if (debuff.effect) debuff.effect(target);
        if (debuff.dot) {
          let finalDot = debuff.dot;
          if (isPlayerSide && target.shield && target.shield > 0) {
            const absorbed = Math.min(target.shield, finalDot);
            target.shield -= absorbed;
            finalDot -= absorbed;
            this.addLog(`[Debuff] ${target.name} fängt ${absorbed} Schaden von '${debuff.name}' mit Schild ab.`);
          }
          if (finalDot > 0) {
            target.currentHp = Math.max(0, target.currentHp - finalDot);
            this.addLog(`[Debuff] ${target.name} erleidet ${finalDot} Schaden durch '${debuff.name}'.`);
          }
        }
        debuff.duration--;
      });
      target.debuffs = target.debuffs.filter(d => d.duration > 0);
    }

    if (isPlayerSide && target.resetStats) {
      target.resetStats();
    }
  }

  // SPIELER-ZUG
  executePlayerTurn(skill, targetId = null) {
    if (this.isOver) return;
    
    const currentActorData = this.turnQueue[this.currentTurnIndex];
    if (!currentActorData || currentActorData.entity !== this.player) {
      return { error: 'Du bist nicht am Zug!' };
    }

    // Zielauswahl (Feind oder Verbündeter)
    let targetEntity = null;
    if (targetId) {
      targetEntity = this.enemies.find(e => e.id === targetId) || this.heroes.find(h => h.name === targetId);
    } else {
      if (skill.isHeal || skill.id === 'PRIESTER_RENEW' || skill.id === 'PRIESTER_SHIELD') {
        targetEntity = this.player; // Standardziel für Buffs/Heals: Selbst
      } else {
        targetEntity = this.getAliveEnemies()[0]; // Standardziel für Angriffe: Erster Feind
      }
    }

    if (!targetEntity && skill.id !== 'HEAL_ALL' && !skill.isHeal && skill.type !== 'buff') {
      this.checkVictory();
      return { error: 'Kein Ziel vorhanden.' };
    }

    const result = skill.execute(this.player, targetEntity);
    if (result.error) return result;

    this.addLog(result.text);
    
    this.checkVictory();
    if (!this.isOver) {
      this.currentTurnIndex++;
      this.nextTurn(); // Übergibt den Zug an den nächsten in der Queue
    }
    return { success: true };
  }

  // COMPANION KI
  executeCompanionAI(comp) {
    if (this.isOver) return;

    // KI-Entscheidung
    if (comp.role === 'HEALER') {
      let lowestHero = null;
      let lowestPct = 1.0;
      this.getAliveHeroes().forEach(h => {
        const pct = h.currentHp / h.maxHp;
        if (pct < lowestPct) {
          lowestPct = pct;
          lowestHero = h;
        }
      });

      if (lowestHero && lowestPct < 0.6) {
        const healAmount = Math.round(comp.getSpellPower() * 1.5);
        lowestHero.currentHp = Math.min(lowestHero.maxHp, lowestHero.currentHp + healAmount);
        this.addLog(`[Companion] ${comp.name} wirkt Heilung auf ${lowestHero.name} (+${healAmount} HP).`);
      } else {
        const target = this.getAliveEnemies()[0];
        if (target) {
          const dmg = Math.round(comp.getSpellPower() * 0.8);
          target.currentHp = Math.max(0, target.currentHp - dmg);
          this.addLog(`[Companion] ${comp.name} wirkt Heiliges Feuer auf ${target.name} (${dmg} Schaden).`);
        }
      }
    } else if (comp.role === 'TANK') {
      const target = this.getAliveEnemies().sort((a,b) => b.currentHp - a.currentHp)[0];
      if (target) {
        const dmg = comp.getPhysicalDamage();
        target.currentHp = Math.max(0, target.currentHp - dmg);
        this.addLog(`[Companion] ${comp.name} schlägt mit dem Schwert auf ${target.name} ein (${dmg} Schaden).`);
      }
    } else {
      const target = this.getAliveEnemies()[0];
      if (target) {
        const dmg = Math.round(comp.getPhysicalDamage() * 1.2);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        this.addLog(`[Companion] ${comp.name} greift ${target.name} an (${dmg} Schaden).`);
      }
    }
  }

  // FEIND KI
  executeEnemyAI(enemy) {
    if (this.isOver) return;
    const aliveHeroes = this.getAliveHeroes();
    if (aliveHeroes.length === 0) return;
    
    let targetHero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    if (Math.random() < 0.3) {
      const tanks = aliveHeroes.filter(h => h.role === 'TANK' || h.classKey === 'KRIEGER' || h.classKey === 'PALADIN');
      if (tanks.length > 0) targetHero = tanks[Math.floor(Math.random() * tanks.length)];
    }

    let actionText = '';
    let dmg = enemy.damage;
    if (enemy.damageDebuff) dmg = Math.round(dmg * (1 - enemy.damageDebuff));
    if (enemy.damageModifier > 1.0) dmg = Math.round(dmg * enemy.damageModifier);

    let hitChance = 0.90 + (enemy.hitChanceModifier || 0);
    if (Math.random() > hitChance) {
      this.addLog(`${enemy.name} greift an, aber ${targetHero.name} weicht geschickt aus!`);
      return;
    }

    const usableSkills = enemy.skills || [];
    const skill = usableSkills.find(s => Math.random() < s.chance);

    if (skill) {
      actionText = `${enemy.name} wirkt '${skill.name}' auf ${targetHero.name}: ${skill.text}. `;
      if (skill.extraDamage) dmg += skill.extraDamage;
      if (skill.dot) {
        targetHero.debuffs.push({
          name: skill.name, duration: skill.duration, dot: skill.dot, text: `Leidet unter ${skill.name}.`
        });
      }
      if (skill.stun) targetHero.stunned = true;
      if (skill.selfBuff) {
        enemy.damageModifier = 1.30;
        enemy.buffs.push({ name: 'Wütend', duration: 3, effect: (e) => { e.damageModifier = 1.30; } });
      }
    } else {
      actionText = `${enemy.name} greift ${targetHero.name} an. `;
    }

    const reduction = targetHero.getDamageReduction ? targetHero.getDamageReduction() : 0.3;
    let finalDamage = Math.max(1, Math.round(dmg * (1 - reduction)));
    
    let logPrefix = '';
    if (targetHero.shield && targetHero.shield > 0) {
      const absorbed = Math.min(targetHero.shield, finalDamage);
      targetHero.shield -= absorbed;
      finalDamage -= absorbed;
      logPrefix += `(Schild fängt ${absorbed} ab) `;
    }

    if (finalDamage > 0) {
      targetHero.currentHp = Math.max(0, targetHero.currentHp - finalDamage);
      if (targetHero.classKey === 'KRIEGER') {
        const rageGen = Math.min(50, Math.floor(finalDamage * 0.4));
        if (rageGen > 0) {
          targetHero.currentResource = Math.min(100, targetHero.currentResource + rageGen);
          logPrefix += `(+${rageGen} Wut) `;
        }
      }
    }

    this.addLog(`${actionText}${logPrefix}Verursacht ${finalDamage} Schaden.`);
  }

  checkVictory() {
    if (this.getAliveEnemies().length === 0) {
      this.isOver = true;
      this.victory = true;
      this.addLog(`Sieg! Alle Feinde wurden bezwungen.`);
      this.distributeRewards();
    }
  }

  checkDefeat() {
    if (this.player.currentHp <= 0) {
      this.isOver = true;
      this.victory = false;
      this.addLog(`Niederlage! ${this.player.name} ist im Kampf gefallen...`);
    }
  }

  distributeRewards() {
    // XP
    this.xpEarned = this.enemies.reduce((acc, e) => acc + e.xpReward, 0);
    const leveledUp = this.player.addXp(this.xpEarned);
    if (leveledUp) {
      this.addLog(`★ LEVEL UP! ${this.player.name} erreicht Stufe ${this.player.level}! ★`);
      // Sync companions
      if (this.player.party) {
        this.player.party.forEach(c => c.syncLevel(this.player.level));
      }
    }

    // Gold
    let totalGold = 0;
    this.enemies.forEach(e => {
      totalGold += Math.floor(Math.random() * (e.goldRange[1] - e.goldRange[0] + 1) + e.goldRange[0]);
    });
    
    if (this.player.raceKey === 'MENSCH') totalGold = Math.round(totalGold * 1.1);
    this.player.gold += totalGold;
    this.goldEarned = totalGold;

    // Loot
    this.lootEarned = [];
    this.enemies.forEach(e => {
      if (e.isBoss) {
        if (e.name.includes('Spinnenkönigin')) this.lootEarned.push({ name: 'Spinnenkönigin (Boss) Kopf', isQuestItem: true, id: 'Spinnenkönigin (Boss)' });
        else if (e.name.includes('Goblin-König')) this.lootEarned.push({ name: 'Goblin-König (Boss) Kopf', isQuestItem: true, id: 'Goblin-König (Boss)' });
      }

      const table = e.lootTable || [];
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
    });
  }

  flee() {
    if (this.enemies.some(e => e.isBoss)) {
      this.addLog('Aus einem Bosskampf kann man nicht fliehen!');
      return false;
    }

    const success = Math.random() < 0.4;
    if (success) {
      this.isOver = true;
      this.victory = false;
      this.fled = true;
      this.addLog(`Die Gruppe flieht panisch aus dem Kampf!`);
    } else {
      this.addLog(`Flucht fehlgeschlagen!`);
      this.endPlayerTurn();
    }
    return success;
  }
}
