/**
 * Dungeon Crawler Generation and Event module
 */

import { createItem, ITEM_TEMPLATES } from './items.js';

export const DUNGEONS = {
  SPINNENHOEHLE: {
    id: 'SPINNENHOEHLE',
    name: 'Die Spinnenhöhle',
    maxRooms: 10,
    bossKey: 'BOSS_SPIDER',
    monsterPool: ['FLEDERMAUS', 'SPINNE'],
    description: 'Eine finstere Höhle voller Netze. Am Ende lauert die Spinnenkönigin.',
    minLevel: 1
  },
  GOBLINFESTUNG: {
    id: 'GOBLINFESTUNG',
    name: 'Die Goblinfestung',
    maxRooms: 12,
    bossKey: 'BOSS_GOBLIN',
    monsterPool: ['GOBLIN', 'SKELETT'],
    description: 'Eine verbarrikadierte Festung aus Holz und Stein. Grak der Goblin-König herrscht hier.',
    minLevel: 2
  }
};

export class DungeonRun {
  constructor(player, dungeonId) {
    this.player = player;
    this.dungeonMeta = DUNGEONS[dungeonId];
    this.currentRoomIndex = 1;
    this.maxRooms = this.dungeonMeta.maxRooms;
    this.isFinished = false;
    this.isPlayerDead = false;
    this.activeRoom = null;

    this.generateRoom();
  }

  // Generiert den nächsten Raum basierend auf dem Fortschritt
  generateRoom() {
    if (this.currentRoomIndex === this.maxRooms) {
      // Bossraum am Ende
      this.activeRoom = {
        type: 'boss',
        name: `Tiefenkammer: ${DUNGEONS[this.dungeonMeta.id].bossKey === 'BOSS_SPIDER' ? 'Nest der Königin' : 'Thronsaal des Goblin-Königs'}`,
        description: 'Die Luft wird schwer. Ein mächtiger Schatten baut sich vor dir auf...',
        enemyKey: this.dungeonMeta.bossKey
      };
      return;
    }

    // Zufälliger Raumtyp für Zwischenräume (60% Kampf, 25% Event/P&P, 15% Sicherer Raum/Pause)
    const rand = Math.random();
    if (rand < 0.60) {
      // Kampf
      const pool = this.dungeonMeta.monsterPool;
      const enemyKey = pool[Math.floor(Math.random() * pool.length)];
      this.activeRoom = {
        type: 'combat',
        name: `Dungeon-Gang (Raum ${this.currentRoomIndex})`,
        description: 'Plötzlich springt eine Kreatur aus den Schatten!',
        enemyKey: enemyKey
      };
    } else if (rand < 0.85) {
      // Event (Schatz, Falle oder Altar)
      const eventType = ['chest', 'trap', 'altar'][Math.floor(Math.random() * 3)];
      this.activeRoom = {
        type: 'event',
        name: `Kammer des Schicksals (Raum ${this.currentRoomIndex})`,
        eventType: eventType,
        resolved: false,
        logs: []
      };

      if (eventType === 'chest') {
        this.activeRoom.description = 'Du entdeckst eine alte, verstaubte Eichentruhe in der Ecke.';
      } else if (eventType === 'trap') {
        this.activeRoom.description = 'Der Boden unter dir fühlt sich merkwürdig locker an. Du hörst ein Klicken!';
      } else if (eventType === 'altar') {
        this.activeRoom.description = 'Ein steinerner Altar mit leuchtenden Runen ragt in der Mitte der Kammer auf.';
      }
    } else {
      // Sicherer Raum
      this.activeRoom = {
        type: 'safe',
        name: `Gewölbe der Zuflucht (Raum ${this.currentRoomIndex})`,
        description: 'Hier ist es ruhig. Keine Anzeichen von Gegnern. Du kannst durchschnaufen.',
        resolved: false
      };
    }
  }

  // Geht in den nächsten Raum über
  nextRoom() {
    if (this.currentRoomIndex < this.maxRooms) {
      this.currentRoomIndex++;
      this.generateRoom();
      return true;
    } else {
      this.isFinished = true;
      return false;
    }
  }

  // Führt eine D20-Würfelprobe durch (wie in D&D)
  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Löst ein Ereignis im Raum auf
  resolveEvent(actionChoice = '') {
    if (this.activeRoom.type !== 'event' || this.activeRoom.resolved) return;

    const eventType = this.activeRoom.eventType;
    this.activeRoom.resolved = true;

    if (eventType === 'chest') {
      // Schatztruhe öffnen
      const roll = this.rollD20();
      let goldGained = Math.round(20 + roll * 2);
      if (this.player.raceKey === 'MENSCH') goldGained = Math.round(goldGained * 1.1);

      this.player.gold += goldGained;
      this.activeRoom.logs.push(`Du öffnest die Truhe! (+${goldGained} Gold)`);

      // 40% Chance auf einen Ausrüstungsgegenstand
      if (Math.random() < 0.40) {
        const itemKeys = Object.keys(ITEM_TEMPLATES);
        const randKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
        const item = createItem(randKey);
        this.player.inventory.push(item);
        this.activeRoom.logs.push(`Du findest einen Gegenstand: ${item.name}!`);
      }
    } 
    else if (eventType === 'trap') {
      // Falle ausweichen (Geschicklichkeits-Wurf)
      const roll = this.rollD20();
      const agilityBonus = Math.floor((this.player.stats.agility - 10) / 2) || 0;
      const totalRoll = roll + agilityBonus;
      const dc = 12; // Schwierigkeitsgrad (Difficulty Class)

      this.activeRoom.logs.push(`Rettungswurf (Beweglichkeit): Du würfelst ${roll} + ${agilityBonus} (Bonus) = ${totalRoll} (Benötigt: ${dc}).`);

      if (totalRoll >= dc) {
        this.activeRoom.logs.push(`★ Erfolg! Du springst geschickt zur Seite und weichst der Falle aus!`);
      } else {
        const dmg = Math.round(10 + Math.random() * 8);
        
        // Rüstungsreduktion greift bei physischer Falle
        const reduction = this.player.getDamageReduction();
        const finalDmg = Math.max(2, Math.round(dmg * (1 - reduction)));
        
        this.player.currentHp = Math.max(0, this.player.currentHp - finalDmg);
        this.activeRoom.logs.push(`✗ Fehlschlag! Giftpfeile schießen aus den Wänden und treffen dich für ${finalDmg} Schaden.`);
        if (this.player.currentHp <= 0) {
          this.isPlayerDead = true;
        }
      }
    } 
    else if (eventType === 'altar') {
      // P&P Altar-Interaktion
      if (actionChoice === 'beten') {
        const roll = this.rollD20();
        const intellectBonus = Math.floor((this.player.stats.intellect - 10) / 2) || 0;
        const totalRoll = roll + intellectBonus;
        const dc = 11;

        this.activeRoom.logs.push(`Willenskraft-Probe: Du würfelst ${roll} + ${intellectBonus} = ${totalRoll} (Benötigt: ${dc}).`);

        if (totalRoll >= dc) {
          // Volle Heilung
          this.player.currentHp = this.player.maxHp;
          if (this.player.classKey !== 'KRIEGER') {
            this.player.currentResource = this.player.maxResource;
          }
          this.activeRoom.logs.push(`★ Erfolg! Ein göttlicher Strahl trifft dich vom Altar. Deine Lebenspunkte und dein Mana wurden vollständig regeneriert!`);
        } else {
          this.activeRoom.logs.push(`✗ Der Altar leuchtet schwach auf, aber nichts geschieht. Eine finstere Kälte lässt dich erschauern.`);
        }
      } 
      else if (actionChoice === 'blutopfer') {
        // Kostet 15 HP, gibt magische Waffe/Schutz
        const hpCost = 15;
        if (this.player.currentHp <= hpCost) {
          this.activeRoom.logs.push(`Du hast nicht genug Lebensenergie übrig, um dieses Opfer sicher darzubringen!`);
          this.activeRoom.resolved = false; // Zurücksetzen für andere Wahl
          return;
        }

        this.player.currentHp -= hpCost;
        this.activeRoom.logs.push(`Du opferst dein Blut am Altar und verlierst ${hpCost} Lebenspunkte.`);

        // Finde ein passendes Item für die Klasse
        let itemKey = '';
        if (this.player.classKey === 'KRIEGER' || this.player.classKey === 'PALADIN') {
          itemKey = Math.random() < 0.5 ? 'plate_helm' : 'sword_1h';
        } else {
          itemKey = Math.random() < 0.5 ? 'cloth_hood' : 'magical_orb';
        }

        const item = createItem(itemKey);
        this.player.inventory.push(item);
        this.activeRoom.logs.push(`Der Altar bebt! Ein Relikt erscheint aus der Wand: ${item.name}!`);
      } 
      else {
        // Ignorieren
        this.activeRoom.logs.push(`Du gehst misstrauisch am Altar vorbei und rührst ihn nicht an.`);
      }
    }
  }

  // Rasten in einer sicheren Kammer (1x pro Kammer kostenlos für 20% HP/Mana)
  restInSafeRoom() {
    if (this.activeRoom.type !== 'safe' || this.activeRoom.resolved) return;
    this.activeRoom.resolved = true;

    const hpRegen = Math.round(this.player.maxHp * 0.20);
    this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + hpRegen);

    let resRegen = 0;
    if (this.player.classKey !== 'KRIEGER') {
      resRegen = Math.round(this.player.maxResource * 0.20);
      this.player.currentResource = Math.min(this.player.maxResource, this.player.currentResource + resRegen);
    }

    return { hpRegen, resRegen };
  }
}
