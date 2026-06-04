/**
 * Dungeon Crawler Generation and Event module - Grid Based (Phase 2)
 */

import { createItem, ITEM_TEMPLATES } from './items.js';

export const DUNGEONS = {
  SPINNENHOEHLE: {
    id: 'SPINNENHOEHLE',
    name: 'Die Spinnenhöhle',
    gridSize: 4, // 4x4 Map
    bossKey: 'BOSS_SPIDER',
    monsterPool: ['FLEDERMAUS', 'SPINNE'],
    description: 'Eine finstere Höhle voller Netze. Am Ende lauert die Spinnenkönigin.',
    minLevel: 1
  },
  GOBLINFESTUNG: {
    id: 'GOBLINFESTUNG',
    name: 'Die Goblinfestung',
    gridSize: 5, // 5x5 Map
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
    this.gridSize = this.dungeonMeta.gridSize;
    this.isFinished = false;
    this.isPlayerDead = false;
    this.activeRoom = null;
    
    this.playerPos = { x: 0, y: 0 };
    this.map = []; // 2D array
    
    this.generateMap();
    this.enterRoom();
  }

  generateMap() {
    // 2D Array initialisieren
    for (let y = 0; y < this.gridSize; y++) {
      let row = [];
      for (let x = 0; x < this.gridSize; x++) {
        row.push(this.generateRandomRoomData(x, y));
      }
      this.map.push(row);
    }

    // Start-Raum fixieren (0,0)
    this.map[0][0] = {
      type: 'start',
      name: 'Eingang',
      description: 'Der Eingang zum Dungeon. Der Rückweg ist versperrt.',
      explored: true,
      resolved: true
    };
    
    // Boss-Raum fixieren (am anderen Ende)
    this.map[this.gridSize - 1][this.gridSize - 1] = {
      type: 'boss',
      name: `Tiefenkammer`,
      description: 'Die Luft wird schwer. Ein mächtiger Schatten baut sich vor dir auf...',
      enemyKeys: [this.dungeonMeta.bossKey],
      explored: false,
      resolved: false
    };
  }

  generateRandomRoomData(x, y) {
    const rand = Math.random();
    let room = { explored: false, resolved: false, x, y };
    
    if (rand < 0.60) {
      // Combat (1-2 Enemies)
      const pool = this.dungeonMeta.monsterPool;
      const numEnemies = Math.random() < 0.3 ? 2 : 1; // 30% chance for 2 enemies
      const enemies = [];
      for(let i=0; i<numEnemies; i++) {
        enemies.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      
      room.type = 'combat';
      room.name = `Dungeon-Gang`;
      room.description = 'Du hörst Schritte im Dunkeln... Gegner greifen an!';
      room.enemyKeys = enemies;
    } else if (rand < 0.85) {
      // Event
      const eventType = ['chest', 'trap', 'altar'][Math.floor(Math.random() * 3)];
      room.type = 'event';
      room.name = `Geheimnisvolle Kammer`;
      room.eventType = eventType;
      room.logs = [];

      if (eventType === 'chest') room.description = 'Du entdeckst eine alte, verstaubte Eichentruhe in der Ecke.';
      else if (eventType === 'trap') room.description = 'Der Boden unter dir fühlt sich merkwürdig locker an. Du hörst ein Klicken!';
      else if (eventType === 'altar') room.description = 'Ein steinerner Altar mit leuchtenden Runen ragt in der Mitte der Kammer auf.';
    } else {
      // Safe
      room.type = 'safe';
      room.name = `Gewölbe der Zuflucht`;
      room.description = 'Hier ist es ruhig. Keine Anzeichen von Gegnern. Du kannst durchschnaufen.';
    }
    return room;
  }

  // Bewegung im Grid
  move(dx, dy) {
    if (this.isFinished || this.activeRoom?.type === 'combat' && !this.activeRoom.resolved) {
      return false; // Cannot move while in unresolved combat
    }

    const newX = this.playerPos.x + dx;
    const newY = this.playerPos.y + dy;

    if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
      this.playerPos.x = newX;
      this.playerPos.y = newY;
      this.enterRoom();
      return true;
    }
    return false; // Wall
  }

  enterRoom() {
    const room = this.map[this.playerPos.y][this.playerPos.x];
    room.explored = true;
    this.activeRoom = room;
  }
  
  // Nützlich für UI
  getVisibleMap() {
    return this.map; // Returns full map, UI can filter by `explored`
  }

  // Event & Rest Logik bleibt gleich, bezieht sich aber auf this.activeRoom
  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  resolveEvent(actionChoice = '') {
    if (this.activeRoom.type !== 'event' || this.activeRoom.resolved) return;
    const eventType = this.activeRoom.eventType;
    this.activeRoom.resolved = true;

    if (eventType === 'chest') {
      const roll = this.rollD20();
      let goldGained = Math.round(20 + roll * 2);
      if (this.player.raceKey === 'MENSCH') goldGained = Math.round(goldGained * 1.1);
      this.player.gold += goldGained;
      this.activeRoom.logs.push(`Du öffnest die Truhe! (+${goldGained} Gold)`);

      if (Math.random() < 0.40) {
        const itemKeys = Object.keys(ITEM_TEMPLATES);
        const randKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
        const item = createItem(randKey);
        this.player.inventory.push(item);
        this.activeRoom.logs.push(`Du findest einen Gegenstand: ${item.name}!`);
      }
    } 
    else if (eventType === 'trap') {
      const roll = this.rollD20();
      const agilityBonus = Math.floor((this.player.stats.agility - 10) / 2) || 0;
      const totalRoll = roll + agilityBonus;
      const dc = 12;

      this.activeRoom.logs.push(`Rettungswurf (Beweglichkeit): Du würfelst ${roll} + ${agilityBonus} (Bonus) = ${totalRoll} (Benötigt: ${dc}).`);

      if (totalRoll >= dc) {
        this.activeRoom.logs.push(`★ Erfolg! Du springst geschickt zur Seite und weichst der Falle aus!`);
      } else {
        const dmg = Math.round(10 + Math.random() * 8);
        const reduction = this.player.getDamageReduction();
        const finalDmg = Math.max(2, Math.round(dmg * (1 - reduction)));
        
        this.player.currentHp = Math.max(0, this.player.currentHp - finalDmg);
        this.activeRoom.logs.push(`✗ Fehlschlag! Giftpfeile treffen dich für ${finalDmg} Schaden.`);
        if (this.player.currentHp <= 0) this.isPlayerDead = true;
      }
    } 
    else if (eventType === 'altar') {
      if (actionChoice === 'beten') {
        const roll = this.rollD20();
        const intellectBonus = Math.floor((this.player.stats.intellect - 10) / 2) || 0;
        const totalRoll = roll + intellectBonus;
        const dc = 11;

        this.activeRoom.logs.push(`Willenskraft-Probe: Du würfelst ${roll} + ${intellectBonus} = ${totalRoll} (Benötigt: ${dc}).`);

        if (totalRoll >= dc) {
          this.player.currentHp = this.player.maxHp;
          if (this.player.classKey !== 'KRIEGER') this.player.currentResource = this.player.maxResource;
          this.activeRoom.logs.push(`★ Erfolg! Deine Lebenspunkte und dein Mana wurden vollständig regeneriert!`);
        } else {
          this.activeRoom.logs.push(`✗ Der Altar leuchtet schwach auf, aber nichts geschieht.`);
        }
      } 
      else if (actionChoice === 'blutopfer') {
        const hpCost = 15;
        if (this.player.currentHp <= hpCost) {
          this.activeRoom.logs.push(`Du hast nicht genug Lebensenergie übrig!`);
          this.activeRoom.resolved = false;
          return;
        }

        this.player.currentHp -= hpCost;
        this.activeRoom.logs.push(`Du verlierst ${hpCost} Lebenspunkte.`);

        let itemKey = '';
        if (this.player.classKey === 'KRIEGER' || this.player.classKey === 'PALADIN') {
          itemKey = Math.random() < 0.5 ? 'plate_helm' : 'sword_1h';
        } else {
          itemKey = Math.random() < 0.5 ? 'cloth_hood' : 'magical_orb';
        }

        const item = createItem(itemKey);
        this.player.inventory.push(item);
        this.activeRoom.logs.push(`Ein Relikt erscheint: ${item.name}!`);
      } 
      else {
        this.activeRoom.logs.push(`Du ignorierst den Altar.`);
      }
    }
  }

  restInSafeRoom() {
    if (this.activeRoom.type !== 'safe' || this.activeRoom.resolved) return;
    this.activeRoom.resolved = true;

    const hpRegen = Math.round(this.player.maxHp * 0.20);
    this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + hpRegen);
    if(this.player.party) {
      this.player.party.forEach(comp => {
        comp.currentHp = Math.min(comp.maxHp, comp.currentHp + Math.round(comp.maxHp * 0.20));
      });
    }

    let resRegen = 0;
    if (this.player.classKey !== 'KRIEGER') {
      resRegen = Math.round(this.player.maxResource * 0.20);
      this.player.currentResource = Math.min(this.player.maxResource, this.player.currentResource + resRegen);
    }
    return { hpRegen, resRegen };
  }
}
