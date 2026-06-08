/**
 * Dungeon Crawler — Multi-Floor Grid System
 *
 * Jeder Dungeon hat 2-3 Etagen. Jede Etage ist ein eigenes Grid.
 * Tiefer = schwerer. Rückweg jederzeit möglich, aber Hinterhalt-Risiko.
 */

import { createItem, ITEM_TEMPLATES } from './items.js';

// ── Dungeon-Definitionen ──────────────────────────────────────────────────────

export const DUNGEONS = {
  SPINNENHOEHLE: {
    id: 'SPINNENHOEHLE',
    name: 'Die Spinnenhöhle',
    bossKey: 'BOSS_SPIDER',
    background: 'assets/images/dungeon_cave.png',
    monsterPool: ['FLEDERMAUS', 'SPINNE', 'SPINNENBRUT', 'GIFTLAUERER'],
    description: 'Eine finstere Höhle voller Netze und enger Gänge. Am Ende lauert die Spinnenkönigin.',
    minLevel: 1,
    floors: [
      { gridSize: 6, enemyLevelBonus: 0, twoEnemyChance: 0.30 },
      { gridSize: 6, enemyLevelBonus: 1, twoEnemyChance: 0.50 },
    ]
  },
  GOBLINFESTUNG: {
    id: 'GOBLINFESTUNG',
    name: 'Die Goblinfestung',
    bossKey: 'BOSS_GOBLIN',
    background: 'assets/images/dungeon_goblin.png',
    monsterPool: ['GOBLIN', 'SKELETT', 'GOBLIN_BOMBER'],
    supportPool: ['GOBLIN_SCHAMANE'],
    description: 'Eine verbarrikadierte Festung. Grak der Goblin-König herrscht hier.',
    minLevel: 2,
    floors: [
      { gridSize: 7, enemyLevelBonus: 0, twoEnemyChance: 0.30 },
      { gridSize: 7, enemyLevelBonus: 1, twoEnemyChance: 0.50 },
    ]
  },
  ORKFESTUNG: {
    id: 'ORKFESTUNG',
    name: 'Die Orkfestung',
    bossKey: 'BOSS_ORK_WARLORD',
    background: 'assets/images/dungeon_ork.png',
    monsterPool: ['ORK', 'DUNKELELF', 'ORK_BERSERKER'],
    supportPool: ['ORK_KRIEGSHAEUPTLING'],
    eliteChance: 0.12,
    description: 'Eine massive Festung aus schwarzem Stein. Ork-Warlord Gruum regiert mit eiserner Faust.',
    minLevel: 3,
    floors: [
      { gridSize: 7, enemyLevelBonus: 0, twoEnemyChance: 0.30 },
      { gridSize: 7, enemyLevelBonus: 1, twoEnemyChance: 0.45 },
      { gridSize: 7, enemyLevelBonus: 2, twoEnemyChance: 0.60 },
    ]
  },
  VERFLUCHTE_KATAKOMBEN: {
    id: 'VERFLUCHTE_KATAKOMBEN',
    name: 'Die Verfluchten Katakomben',
    bossKey: 'BOSS_VAMPIRFUERST',
    background: 'assets/images/dungeon_catacombs.png',
    monsterPool: ['VAMPIR', 'STEINGOLEM', 'GHUL', 'SCHATTENGEIST'],
    eliteChance: 0.12,
    description: 'Uralte Katakomben voller Dunkelheit. Vampirfürst Mordecai lauert in den Tiefen.',
    minLevel: 5,
    floors: [
      { gridSize: 8, enemyLevelBonus: 0, twoEnemyChance: 0.30 },
      { gridSize: 8, enemyLevelBonus: 1, twoEnemyChance: 0.45 },
      { gridSize: 8, enemyLevelBonus: 2, twoEnemyChance: 0.60 },
    ]
  },
  DAS_TOR: {
    id: 'DAS_TOR',
    name: 'Das Tor zum Abgrund',
    bossKey: 'BOSS_FALLEN_WARDEN',
    background: 'assets/images/dungeon_abyss.png',
    monsterPool: ['GHUL', 'SCHATTENGEIST', 'ORK_BERSERKER', 'STEINGOLEM'],
    supportPool: ['GOBLIN_SCHAMANE'],
    eliteChance: 0.25,
    description: 'Das letzte Siegel ist ungeschützt. Hier wartet der Gefallene Wächter — und das Ende von allem. Nur wer die Verschwörung aufdeckte, kann diesen Ort betreten.',
    minLevel: 7,
    requiresAct: 2, // erst nach Abschluss von Akt II (Verräter-Reveal) betretbar
    isFinale: true,
    floors: [
      { gridSize: 8, enemyLevelBonus: 2, twoEnemyChance: 0.50 },
      { gridSize: 8, enemyLevelBonus: 3, twoEnemyChance: 0.65 },
    ]
  }
};

// Atmosphärische Beschreibungen für leere Räume
const EMPTY_ROOM_DESCS = [
  { name: 'Verlassener Korridor',    desc: 'Staubige Steine, kalte Luft. Nichts bewegt sich hier.' },
  { name: 'Leere Kammer',            desc: 'Rohe Felswände, verrottetes Holz auf dem Boden. Kein Zeichen von Leben.' },
  { name: 'Dunkler Durchgang',       desc: 'Fackeln fehlen hier. Deine Augen brauchen einen Moment, um sich anzupassen.' },
  { name: 'Alter Wachposten',        desc: 'Ein verlassener Wachposten. Staubige Knochen in einem morschen Stuhl.' },
  { name: 'Verfallene Halle',        desc: 'Eine weite Kammer, deren Decke teilweise eingestürzt ist. Eerie Stille.' },
  { name: 'Schmaler Felsspalt',      desc: 'Du zwängst dich durch einen engen Spalt im Fels. Nichts außer Gestein.' },
  { name: 'Vergessene Lagerkammer',  desc: 'Leere Fässer und zersplitterte Holzkisten. Alles Verwertbare ist weg.' },
  { name: 'Modrige Grotte',          desc: 'Wasser tropft von der Decke. Moosbedeckte Steine, sonst nichts.' },
  { name: 'Kreuzung',                desc: 'Mehrere Gänge treffen sich hier. Eine alte Wegmarkierung ist nicht mehr lesbar.' },
  { name: 'Ruine einer Zelle',       desc: 'Alte Gitterstäbe, verrostet und gebrochen. Die Zelle ist seit Jahren leer.' },
];

// ── DungeonFloor ──────────────────────────────────────────────────────────────

class DungeonFloor {
  constructor(floorIdx, floorMeta, dungeonMeta, isLastFloor = false) {
    this.floorIdx       = floorIdx;
    this.gridSize       = floorMeta.gridSize;
    this.enemyLevelBonus = floorMeta.enemyLevelBonus;
    this.twoEnemyChance  = floorMeta.twoEnemyChance;
    this.isLastFloor    = isLastFloor;
    this.dungeonMeta    = dungeonMeta;
    this.playerPos      = { x: 0, y: 0 };
    this.map            = [];

    this._generate();
  }

  _generate() {
    const G = this.gridSize;

    // 1. Alle Räume als leer initialisieren
    for (let y = 0; y < G; y++) {
      const row = [];
      for (let x = 0; x < G; x++) {
        row.push({ type: 'empty', explored: false, resolved: true, exits: {north:false,south:false,east:false,west:false}, x, y });
      }
      this.map.push(row);
    }

    // 2. Korridore einschneiden (DFS + 20% Schleifen)
    this._carvePaths();

    // 3. Startraum
    const startDesc = this.floorIdx === 0
      ? 'Der Eingang zum Dungeon. Schwere Luft strömt von unten herauf.'
      : 'Der Treppenabsatz zur oberen Etage. Der Weg zurück ist offen.';
    this.map[0][0] = {
      type: 'start', name: this.floorIdx === 0 ? 'Eingang' : 'Treppenabsatz',
      description: startDesc,
      explored: true, resolved: true, exits: this.map[0][0].exits, x: 0, y: 0
    };

    // 4. Sonderräume platzieren
    this._placeSpecialRooms();

    // 5. Verbleibende Räume mit Kampf oder Leer füllen
    this._fillRooms();
  }

  _carvePaths() {
    const G = this.gridSize;
    const visited = new Set();
    const shuffle = (arr) => { for (let i = arr.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; };
    const dfs = (x, y) => {
      visited.add(`${x},${y}`);
      for (const {dx,dy,myDir,theirDir} of shuffle([
        {dx:1,dy:0,myDir:'east',theirDir:'west'},{dx:-1,dy:0,myDir:'west',theirDir:'east'},
        {dx:0,dy:1,myDir:'south',theirDir:'north'},{dx:0,dy:-1,myDir:'north',theirDir:'south'}
      ])) {
        const nx=x+dx, ny=y+dy;
        if (nx>=0&&nx<G&&ny>=0&&ny<G&&!visited.has(`${nx},${ny}`)) {
          this.map[y][x].exits[myDir]=true; this.map[ny][nx].exits[theirDir]=true; dfs(nx,ny);
        }
      }
    };
    dfs(0,0);
    // ~20% Schleifen für D&D-Atmosphäre
    for (let y=0; y<G; y++) for (let x=0; x<G; x++) {
      if (x+1<G && !this.map[y][x].exits.east   && Math.random()<0.20) { this.map[y][x].exits.east=true;  this.map[y][x+1].exits.west=true; }
      if (y+1<G && !this.map[y][x].exits.south  && Math.random()<0.20) { this.map[y][x].exits.south=true; this.map[y+1][x].exits.north=true; }
    }
  }

  _getCandidates(excludeCorners = false) {
    // Alle freien Räume (noch 'empty'), die nicht (0,0) sind
    const candidates = [];
    for (let y=0; y<this.gridSize; y++) for (let x=0; x<this.gridSize; x++) {
      if (x===0 && y===0) continue;
      const G = this.gridSize;
      if (excludeCorners && x===G-1 && y===G-1) continue;
      if (this.map[y][x].type === 'empty') candidates.push({x,y});
    }
    // Mischen
    for (let i=candidates.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [candidates[i],candidates[j]]=[candidates[j],candidates[i]]; }
    return candidates;
  }

  _placeRoom(type, data) {
    // Platziert den ersten verfügbaren Kandidaten
    const candidates = this._getCandidates(true);
    if (!candidates.length) return false;

    // Für Treppe und Boss: möglichst weit von (0,0) entfernt
    let pos;
    if (type === 'stairs' || type === 'boss') {
      pos = candidates.sort((a,b) => (b.x+b.y)-(a.x+a.y))[0];
    } else {
      pos = candidates[0];
    }

    this.map[pos.y][pos.x] = { ...this.map[pos.y][pos.x], type, ...data };
    return true;
  }

  _placeSpecialRooms() {
    if (this.isLastFloor) {
      // Boss ganz hinten
      const G = this.gridSize;
      this.map[G-1][G-1] = {
        type: 'boss', name: 'Tiefenkammer',
        description: 'Die Luft wird schwer und heiß. Ein mächtiger Schatten baut sich vor dir auf...',
        enemyKeys: [this.dungeonMeta.bossKey],
        explored: false, resolved: false,
        exits: this.map[G-1][G-1].exits, x: G-1, y: G-1
      };
    } else {
      // Treppe nach unten — weit weg vom Start
      this._placeRoom('stairs', {
        name: 'Treppe nach unten',
        description: 'Stufen führen tiefer in die Dunkelheit. Von unten weht kalte, modrige Luft herauf.',
        explored: false, resolved: true
      });
    }

    // Garantierte Truhe
    this._placeRoom('chest', {
      name: 'Geheimnisvolle Kammer',
      description: 'Du entdeckst eine alte, verstaubte Eichentruhe in der Ecke. Schloss sieht knackbar aus.',
      explored: false, resolved: false, logs: []
    });

    // Falle (60% Chance)
    if (Math.random() < 0.60) {
      this._placeRoom('trap', {
        name: 'Verdächtiger Korridor',
        description: 'Der Boden fühlt sich merkwürdig locker an. Du hörst ein feines Klicken unter deinen Füßen.',
        explored: false, resolved: false, logs: []
      });
    }

    // Altar (50% Chance, nur wenn keine Truhe in gleicher Etage... hier immer möglich da separat)
    if (Math.random() < 0.50) {
      this._placeRoom('altar', {
        name: 'Alter Schrein',
        description: 'Ein steinerner Altar mit schwach leuchtenden Runen ragt in der Mitte der Kammer auf.',
        explored: false, resolved: false, logs: []
      });
    }
  }

  /**
   * Stellt eine Begegnung zusammen — smarte Rollen-Gruppen statt nur Zufall.
   * - Basis: 1-2 DDs aus monsterPool
   * - Chance auf ein "Rollen-Rudel": + Support (Heiler/Buffer) aus supportPool
   * - Chance auf einen Elite-Gegner (eliteChance)
   */
  _composeEncounter() {
    const pool = this.dungeonMeta.monsterPool || ['FLEDERMAUS'];
    const support = this.dungeonMeta.supportPool || [];
    const eliteChance = this.dungeonMeta.eliteChance || 0;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const keys = [];

    // Rollen-Rudel: Support + 2 DDs (wenn Support-Pool vorhanden)
    if (support.length && Math.random() < 0.30) {
      keys.push(pick(support));               // Heiler/Buffer
      keys.push(pick(pool), pick(pool));      // 2 DDs als Schützlinge
    } else {
      // Normale 1-2 DDs
      const num = Math.random() < this.twoEnemyChance ? 2 : 1;
      for (let i = 0; i < num; i++) keys.push(pick(pool));
    }

    // Elite-Chance: ein DD wird durch einen Elite ersetzt
    if (eliteChance > 0 && Math.random() < eliteChance) {
      const elites = ['ELITE_ORK', 'ELITE_SKELETT'];
      const idx = keys.findIndex(k => k);
      if (idx >= 0) keys[idx] = pick(elites);
    }

    return keys;
  }

  _fillRooms() {
    // Verbleibende 'empty' Räume: 55% Kampf, 45% wirklich leer (mit Atmosphäre-Text)
    for (let y=0; y<this.gridSize; y++) for (let x=0; x<this.gridSize; x++) {
      const room = this.map[y][x];
      if (room.type !== 'empty') continue;

      if (Math.random() < 0.55) {
        // Kampfraum mit smarter Gruppen-Komposition
        const keys = this._composeEncounter();
        const isPack = keys.length >= 3;
        this.map[y][x] = {
          ...room, type: 'combat',
          name: isPack ? 'Gegner-Rudel' : 'Dungeon-Gang',
          description: isPack
            ? 'Eine organisierte Gruppe versperrt den Weg — sie kämpfen zusammen!'
            : 'Du hörst Schritte im Dunkeln. Gegner greifen an!',
          enemyKeys: keys, resolved: false
        };
      } else {
        // Leerer Raum mit Atmosphäre-Text
        const desc = EMPTY_ROOM_DESCS[Math.floor(Math.random()*EMPTY_ROOM_DESCS.length)];
        this.map[y][x] = { ...room, type: 'empty', name: desc.name, description: desc.desc, resolved: true };
      }
    }
  }
}

// ── DungeonRun ────────────────────────────────────────────────────────────────

export class DungeonRun {
  constructor(player, dungeonId) {
    this.player      = player;
    this.dungeonMeta = DUNGEONS[dungeonId];
    this.isFinished  = false;
    this.isPlayerDead= false;
    this.activeRoom  = null;
    this.pendingAmbush = null; // { enemyKeys } wenn Hinterhalt beim Aufstieg

    // Alle Etagen generieren — isLastFloor vor _generate übergeben
    const total = this.dungeonMeta.floors.length;
    this.floors = this.dungeonMeta.floors.map((meta, i) =>
      new DungeonFloor(i, meta, this.dungeonMeta, i === total - 1)
    );

    this.currentFloorIdx = 0;
    this.enterRoom();
  }

  get currentFloor() { return this.floors[this.currentFloorIdx]; }
  get gridSize()     { return this.currentFloor.gridSize; }
  get map()          { return this.currentFloor.map; }
  get playerPos()    { return this.currentFloor.playerPos; }

  get floorCount()   { return this.floors.length; }
  get floorLabel()   { return `Etage ${this.currentFloorIdx + 1} / ${this.floorCount}`; }

  // Aufstieg — gibt 'exit', 'ambush', oder 'ascended' zurück
  ascend() {
    const ambushChances = [0.20, 0.25, 0.35];
    const chance = ambushChances[this.currentFloorIdx] ?? 0.20;

    if (Math.random() < chance) {
      // Hinterhalt!
      const pool = this.dungeonMeta.monsterPool;
      const num  = Math.random() < 0.40 ? 2 : 1;
      const keys = Array.from({length: num}, () => pool[Math.floor(Math.random()*pool.length)]);
      this.pendingAmbush = { enemyKeys: keys };
      return 'ambush';
    }

    if (this.currentFloorIdx === 0) {
      this.isFinished = true;
      return 'exit';
    }
    this.currentFloorIdx--;
    this.enterRoom();
    return 'ascended';
  }

  // Abstieg (Treppe benutzen)
  descend() {
    if (this.currentFloorIdx >= this.floorCount - 1) return false;
    this.currentFloorIdx++;
    this.enterRoom();
    return true;
  }

  // Bewegung im aktuellen Grid
  move(dx, dy) {
    if (this.isFinished) return false;
    const room = this.currentFloor.map[this.playerPos.y][this.playerPos.x];
    if (room.type === 'combat' && !room.resolved) return false;

    const newX = this.playerPos.x + dx;
    const newY = this.playerPos.y + dy;
    if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) return false;

    const dir = dx===1?'east':dx===-1?'west':dy===1?'south':'north';
    if (!room.exits?.[dir]) return false;

    this.currentFloor.playerPos.x = newX;
    this.currentFloor.playerPos.y = newY;
    this.enterRoom();
    return true;
  }

  enterRoom() {
    const room = this.currentFloor.map[this.playerPos.y][this.playerPos.x];
    room.explored = true;
    this.activeRoom = room;
  }

  getVisibleMap() { return this.currentFloor.map; }

  rollD20() { return Math.floor(Math.random()*20)+1; }

  // Lager aufschlagen (in Leerräumen, kostet Ration)
  campInEmptyRoom() {
    if (this.activeRoom.type !== 'empty') return { error: 'Nur in leeren Räumen möglich.' };

    const rationIdx = this.player.inventory.findIndex(i => i.id === 'ration');
    if (rationIdx === -1) return { error: 'Du hast keine Feldration dabei.' };

    this.player.inventory.splice(rationIdx, 1);

    const hpGain = [];
    const party  = [this.player, ...(this.player.party||[])];
    party.forEach(c => {
      const gain = Math.round(c.maxHp * 0.30);
      c.currentHp = Math.min(c.maxHp, c.currentHp + gain);
      if (c.maxResource > 0 && c.classKey !== 'KRIEGER') {
        c.currentResource = Math.min(c.maxResource, c.currentResource + Math.round(c.maxResource * 0.20));
      }
      hpGain.push(`${c.name} +${gain} HP`);
    });

    return { success: true, log: hpGain.join(', ') };
  }

  // Truhe, Falle, Altar auflösen
  resolveChest() {
    const room = this.activeRoom;
    if (room.type !== 'chest' || room.resolved) return;
    room.resolved = true;

    const roll = this.rollD20();
    let gold = Math.round(25 + roll * 2 + this.currentFloorIdx * 15);
    if (this.player.raceKey === 'MENSCH') gold = Math.round(gold * 1.1);
    this.player.gold += gold;
    room.logs.push(`Du öffnest die Truhe! (+${gold} Gold)`);

    // Item-Chance: besser auf tieferen Etagen
    const itemChance = 0.35 + this.currentFloorIdx * 0.10;
    if (Math.random() < itemChance) {
      // Tiefere Etagen → T2 Items bevorzugen
      const allKeys = Object.keys(ITEM_TEMPLATES);
      const t2Keys  = allKeys.filter(k => k.includes('_t2') || k.includes('arcane') || k.includes('tower') || k.includes('dark_tome') || k.includes('battle_axe'));
      const pool    = this.currentFloorIdx >= 1 && t2Keys.length ? [...t2Keys, ...allKeys] : allKeys;
      const key     = pool[Math.floor(Math.random()*pool.length)];
      const item    = createItem(key);
      this.player.inventory.push(item);
      room.logs.push(`Du findest: ${item.name}!`);
    }

    // Ration: 30% Chance
    if (Math.random() < 0.30) {
      this.player.inventory.push({ id:'ration', name:'Feldration', type:'consumable', effectType:'ration', value:30, cost:20, description:'Stellt 30% HP der Gruppe wieder her.', icon:'assets/images/items/icon_potion_heal.png', uniqueId:`ration_${Date.now()}` });
      room.logs.push(`Du findest eine Feldration!`);
    }
  }

  resolveTrap() {
    const room = this.activeRoom;
    if (room.type !== 'trap' || room.resolved) return;
    room.resolved = true;

    const roll   = this.rollD20();
    const agiBonus = Math.floor((this.player.stats.agility - 10) / 2) || 0;
    const total  = roll + agiBonus;
    const dc     = 12 + this.currentFloorIdx;
    room.logs.push(`Rettungswurf (Beweglichkeit): ${roll} + ${agiBonus} = ${total} (Benötigt: ${dc})`);

    if (total >= dc) {
      room.logs.push(`★ Du springst geschickt zur Seite und weichst der Falle aus!`);
    } else {
      const dmg      = Math.round(10 + Math.random()*8 + this.currentFloorIdx*5);
      const finalDmg = Math.max(2, Math.round(dmg * (1 - this.player.getDamageReduction())));
      this.player.currentHp = Math.max(0, this.player.currentHp - finalDmg);
      room.logs.push(`✗ Giftpfeile treffen dich für ${finalDmg} Schaden!`);
      if (this.player.currentHp <= 0) this.isPlayerDead = true;
    }
  }

  resolveAltar(choice) {
    const room = this.activeRoom;
    if (room.type !== 'altar' || room.resolved) return;

    if (choice === 'ignorieren') {
      room.resolved = true;
      room.logs.push('Du ignorierst den Altar und gehst weiter.');
      return;
    }

    if (choice === 'beten') {
      room.resolved = true;
      const roll       = this.rollD20();
      const intBonus   = Math.floor((this.player.stats.intellect - 10) / 2) || 0;
      const total      = roll + intBonus;
      const dc         = 11 + this.currentFloorIdx;
      room.logs.push(`Willenskraft-Probe: ${roll} + ${intBonus} = ${total} (Benötigt: ${dc})`);

      if (total >= dc) {
        const party = [this.player, ...(this.player.party||[])];
        party.forEach(c => {
          c.currentHp = c.maxHp;
          if (c.maxResource > 0 && c.classKey !== 'KRIEGER') c.currentResource = c.maxResource;
        });
        room.logs.push(`★ Göttliches Licht durchflutet die Gruppe — alle vollständig geheilt!`);
      } else {
        room.logs.push(`✗ Der Altar leuchtet kurz auf, dann erlischt er wieder. Nichts geschieht.`);
      }
    }

    if (choice === 'blutopfer') {
      const cost = 15 + this.currentFloorIdx * 5;
      if (this.player.currentHp <= cost) {
        room.logs.push(`Du hast nicht genug Lebensenergie für das Opfer!`);
        return; // resolved bleibt false → nochmal wählbar
      }
      room.resolved = true;
      this.player.currentHp -= cost;
      room.logs.push(`Du verlierst ${cost} Lebenspunkte.`);

      const classKey = this.player.classKey;
      const pool = classKey === 'KRIEGER' || classKey === 'PALADIN'
        ? ['plate_helm','sword_1h','war_mace','steel_shield']
        : ['cloth_hood','magical_orb','arcane_staff','dark_tome'];
      const key  = pool[Math.floor(Math.random()*pool.length)];
      const item = createItem(key);
      this.player.inventory.push(item);
      room.logs.push(`Ein Relikt erscheint: ${item.name}!`);
    }
  }
}
