/**
 * Quest Board and Quest Tracking module
 */

export const QUEST_TEMPLATES = [
  {
    id: 'quest_spiders',
    title: 'Spinnenplage im Keller',
    description: 'Beseitige 5 Riesenspinnen im Dungeon, um die Dorfbewohner zu schützen.',
    targetType: 'kill_monster',
    targetId: 'Riesenspinne',
    targetCount: 5,
    xpReward: 100,
    goldReward: 50,
    difficulty: 'Leicht'
  },
  {
    id: 'quest_spiders_legs',
    title: 'Kostbare Spinnenbeine',
    description: 'Sammle 6 Spinnenbeine für den lokalen Alchemisten.',
    targetType: 'collect_loot',
    targetId: 'Spinnenbein',
    targetCount: 6,
    xpReward: 120,
    goldReward: 65,
    difficulty: 'Leicht'
  },
  {
    id: 'quest_goblins',
    title: 'Goblin-Plünderer',
    description: 'Besiege 6 Goblin-Krieger, die die Handelswege blockieren.',
    targetType: 'kill_monster',
    targetId: 'Goblin',
    targetCount: 6,
    xpReward: 160,
    goldReward: 80,
    difficulty: 'Mittel'
  },
  {
    id: 'quest_dungeon_clear',
    title: 'Säuberung des Dungeons',
    description: 'Besiege insgesamt 12 beliebige Monster im Dungeon.',
    targetType: 'kill_any',
    targetId: 'any',
    targetCount: 12,
    xpReward: 280,
    goldReward: 150,
    difficulty: 'Mittel'
  },
  {
    id: 'quest_boss_spider',
    title: 'Kopf der Spinnenkönigin',
    description: 'Erschlage die Riesige Spinnenkönigin in den Tiefen der Höhle und bringe ihren Kopf zurück.',
    targetType: 'kill_boss',
    targetId: 'Spinnenkönigin',
    targetCount: 1,
    xpReward: 480,
    goldReward: 300,
    difficulty: 'Schwer (Boss)'
  },
  {
    id: 'quest_boss_goblin',
    title: 'Der Goblin-König',
    description: 'Besiege Grak den Goblin-König, um dem Terror ein Ende zu bereiten.',
    targetType: 'kill_boss',
    targetId: 'Goblin-König Grak',
    targetCount: 1,
    xpReward: 640,
    goldReward: 400,
    difficulty: 'Schwer (Boss)'
  },

  // ── Orkfestung-Quests ──────────────────────────────────────────────────────
  {
    id: 'quest_orks',
    title: 'Ork-Invasoren',
    description: 'Besiege 6 Ork-Krieger, die das Grenzgebiet terrorisieren.',
    targetType: 'kill_monster',
    targetId: 'Ork-Krieger',
    targetCount: 6,
    xpReward: 220,
    goldReward: 110,
    difficulty: 'Mittel'
  },
  {
    id: 'quest_dunkelelf',
    title: 'Schattenläufer',
    description: 'Töte 4 Dunkel-Elfen, die nächtliche Überfälle auf Händler durchführen.',
    targetType: 'kill_monster',
    targetId: 'Dunkel-Elfe',
    targetCount: 4,
    xpReward: 180,
    goldReward: 95,
    difficulty: 'Mittel'
  },
  {
    id: 'quest_orkfestung_clear',
    title: 'Erstürmung der Orkfestung',
    description: 'Kämpfe dich durch die Orkfestung und besiege 14 Gegner.',
    targetType: 'kill_any',
    targetId: 'any',
    targetCount: 14,
    xpReward: 380,
    goldReward: 210,
    difficulty: 'Schwer'
  },
  {
    id: 'quest_boss_ork',
    title: 'Der Ork-Warlord',
    description: 'Stelle dich Gruum dem Ork-Warlord und beende seine Herrschaft.',
    targetType: 'kill_boss',
    targetId: 'Ork-Warlord Gruum',
    targetCount: 1,
    xpReward: 900,
    goldReward: 550,
    difficulty: 'Sehr Schwer (Boss)'
  },

  // ── Verfluchte Katakomben-Quests ───────────────────────────────────────────
  {
    id: 'quest_vampire',
    title: 'Blutsauger vertreiben',
    description: 'Besiege 5 Vampire in den Katakomben.',
    targetType: 'kill_monster',
    targetId: 'Vampir',
    targetCount: 5,
    xpReward: 260,
    goldReward: 130,
    difficulty: 'Schwer'
  },
  {
    id: 'quest_steingolem',
    title: 'Steinerne Wächter',
    description: 'Zerstöre 3 Stein-Golems, die den Weg versperren.',
    targetType: 'kill_monster',
    targetId: 'Stein-Golem',
    targetCount: 3,
    xpReward: 240,
    goldReward: 120,
    difficulty: 'Schwer'
  },
  {
    id: 'quest_boss_vampir',
    title: 'Vampirfürst Mordecai',
    description: 'Besiege den unsterblichen Vampirfürsten Mordecai und stecke ihm einen Pflock durchs Herz.',
    targetType: 'kill_boss',
    targetId: 'Vampirfürst Mordecai',
    targetCount: 1,
    xpReward: 1200,
    goldReward: 750,
    difficulty: 'Extrem (Boss)'
  }
];

// Generiert das Questbrett für das Dorf
export function getAvailableQuests(character) {
  // Filtere Quests heraus, die der Charakter bereits abgeschlossen oder aktiv hat
  const activeIds = character.activeQuests ? character.activeQuests.map(q => q.id) : [];
  const completedIds = character.completedQuests || [];

  return QUEST_TEMPLATES.filter(q => !activeIds.includes(q.id) && !completedIds.includes(q.id));
}

// Akzeptiert eine Quest vom Brett
export function acceptQuest(character, questId) {
  character.activeQuests = character.activeQuests || [];
  
  // Überprüfen, ob bereits aktiv oder abgeschlossen
  if (character.activeQuests.some(q => q.id === questId)) {
    return { error: 'Diese Quest ist bereits aktiv!' };
  }
  if (character.completedQuests && character.completedQuests.includes(questId)) {
    return { error: 'Diese Quest hast du bereits abgeschlossen!' };
  }

  const template = QUEST_TEMPLATES.find(q => q.id === questId);
  if (!template) return { error: 'Quest nicht gefunden!' };

  const newQuest = {
    ...template,
    currentCount: 0,
    status: 'active'
  };

  character.activeQuests.push(newQuest);
  return { success: true, quest: newQuest };
}

// Aktualisiert den Fortschritt einer Quest bei einem Monster-Kill
export function updateQuestKills(character, monsterName, isBoss = false) {
  if (!character.activeQuests) return [];

  const updatedQuests = [];

  character.activeQuests.forEach(quest => {
    if (quest.status !== 'active') return;

    let advanced = false;

    // 1. Spezifischer Monster-Kill
    if (quest.targetType === 'kill_monster' && !isBoss && quest.targetId === monsterName) {
      quest.currentCount = Math.min(quest.targetCount, quest.currentCount + 1);
      advanced = true;
    }
    // 2. Boss-Kill
    else if (quest.targetType === 'kill_boss' && isBoss && quest.targetId === monsterName) {
      quest.currentCount = Math.min(quest.targetCount, quest.currentCount + 1);
      advanced = true;
    }
    // 3. Beliebiger Monster-Kill
    else if (quest.targetType === 'kill_any') {
      quest.currentCount = Math.min(quest.targetCount, quest.currentCount + 1);
      advanced = true;
    }

    if (advanced) {
      // Prüfen, ob Quest fertig ist
      if (quest.currentCount >= quest.targetCount) {
        quest.status = 'ready';
      }
      updatedQuests.push(quest);
    }
  });

  return updatedQuests;
}

// Aktualisiert den Fortschritt einer Quest bei Loot-Erhalt
export function updateQuestLoot(character, lootName, amount = 1) {
  if (!character.activeQuests) return [];

  const updatedQuests = [];

  character.activeQuests.forEach(quest => {
    if (quest.status !== 'active') return;

    if (quest.targetType === 'collect_loot' && quest.targetId === lootName) {
      quest.currentCount = Math.min(quest.targetCount, quest.currentCount + amount);
      if (quest.currentCount >= quest.targetCount) {
        quest.status = 'ready';
      }
      updatedQuests.push(quest);
    }
  });

  return updatedQuests;
}

// Gibt eine fertige Quest im Dorf ab und streicht die Belohnung ein
export function turnInQuest(character, questId) {
  if (!character.activeQuests) return { error: 'Keine aktiven Quests!' };

  const questIndex = character.activeQuests.findIndex(q => q.id === questId);
  if (questIndex === -1) return { error: 'Diese Quest ist nicht aktiv!' };

  const quest = character.activeQuests[questIndex];
  if (quest.currentCount < quest.targetCount) {
    return { error: 'Die Quest-Bedingungen sind noch nicht erfüllt!' };
  }

  // Belohnungen ausschütten
  let finalGold = quest.goldReward;
  if (character.raceKey === 'MENSCH') {
    finalGold = Math.round(finalGold * 1.1); // 10% Goldbonus für Menschen
  }

  character.gold += finalGold;
  const leveledUp = character.addXp(quest.xpReward);

  // Gefährten auf Spieler-Level bringen (wie im Combat)
  if (leveledUp && character.party) {
    character.party.forEach(c => c.syncLevel(character.level));
  }

  // Quest in die Liste der abgeschlossenen verschieben
  character.completedQuests = character.completedQuests || [];
  character.completedQuests.push(quest.id);
  character.activeQuests.splice(questIndex, 1);

  return {
    success: true,
    goldReward: finalGold,
    xpReward: quest.xpReward,
    leveledUp
  };
}
