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
    description: 'Erschlage die Riesige Spinnenkönigin in den Tiefen des Dungeons und bringe ihren Kopf zurück.',
    targetType: 'kill_boss',
    targetId: 'Spinnenkönigin (Boss)',
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
    targetId: 'Goblin-König (Boss)',
    targetCount: 1,
    xpReward: 640,
    goldReward: 400,
    difficulty: 'Schwer (Boss)'
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
