/**
 * Main Game Controller and UI Orchestrator
 */

import { Character, Companion, CLASSES, RACES } from './modules/character.js';
import { getAvailableSkills, learnTalent, TALENT_TREES } from './modules/skills.js';
import { createItem, equipItem, unequipItem, upgradeItem, getUpgradeCost, getStarterEquipment, generateDungeonLoot, RARITIES, ITEM_SETS, getActiveSetBonuses } from './modules/items.js';
import { getAvailableQuests, acceptQuest, turnInQuest, updateQuestKills, updateQuestLoot } from './modules/quests.js';
import { Combat, ENEMY_TEMPLATES } from './modules/combat.js';
import { DungeonRun, DUNGEONS } from './modules/dungeon.js';
import { MATERIALS, CRAFTING_RECIPES, canCraft, missingForRecipe, addMaterial } from './modules/crafting.js';
import { INN_OPTIONS, MARKET_ITEMS, getBlacksmithInventory, buyMarketItem, buyBlacksmithItem, sellInventoryItem, useConsumable, BUILDINGS, getBuildingLevel, getBuildingEffect, getBuildingUpgradeCost, upgradeBuilding, getMarketBuyPrice, getSmithBuyPrice } from './modules/village.js';
import { VILLAGE_NPCS, getNpcDialogue, getRandomRumor, getDungeonLoreFragment, getCompanionComment, getCampfireStory, getBossLore, isNpcAvailable, WORLD_LORE, NPC_CONVERSATIONS, NPC_QUESTS, getConversationEntry, getReputation, getReputationTier, hasFlag, getBossStoryBeat, STORY_BEATS } from './modules/story.js';

// Portrait-Pfad ermitteln mit Fallback-Kette:
// 1. portrait_RASSE_KLASSE_GESCHLECHT.png
// 2. portrait_RASSE_GESCHLECHT.png  (klassenloses Fallback-Portrait)
// 3. portrait_RASSE_m.png           (geschlechtsneutrales Fallback)
function getPortraitPath(raceKey, classKey, gender) {
  return `assets/images/portrait_${raceKey.toLowerCase()}_${classKey.toLowerCase()}_${gender}.png`;
}
function getPortraitFallback(raceKey, gender) {
  return `assets/images/portrait_${raceKey.toLowerCase()}_${gender}.png`;
}
function getPortraitFallback2(raceKey) {
  return `assets/images/portrait_${raceKey.toLowerCase()}_m.png`;
}
function makePortraitImg(src, raceKey, gender, alt, cssClass) {
  const fb1 = getPortraitFallback(raceKey, gender);
  const fb2 = getPortraitFallback2(raceKey);
  // Schritt-Zähler (data-step) verhindert den Endlos-Reload-Loop: der frühere
  // Vergleich this.src!==fb1 schlug fehl, weil this.src absolut, fb1 relativ ist.
  return `<img src="${src}" class="${cssClass}" alt="${alt}" data-step="0"
    onerror="var s=+this.dataset.step; if(s===0){this.dataset.step='1';this.src='${fb1}';} else if(s===1){this.dataset.step='2';this.src='${fb2}';} else {this.onerror=null;this.style.display='none';}">`;
}

class App {
  constructor() {
    this.player = null;
    // null = Spieler ist aktiv, 0/1/... = Companion-Index
    this.activeHeroIdx = null;
    this.dungeonRun = null;
    this.combat = null;
    this.currentScreen = 'screen-main-menu';
    this.currentSlot = null;         // Aktiver Speicherslot (1–3)
    this.pendingNewGameSlot = null;  // Gewählter Slot für neues Spiel

    // Companion management state
    this.selectedCompanionIdx = 0;
    this.companionSubTab = 'stats';

    // ── Kampf-Geschwindigkeit (Telegraph + Aktions-Pausen) ──────────────────
    // Jede Stufe hat: telegraph (Vorwarnung bevor NPC handelt), action (Pause
    // nach der Aufgelösten Aktion), roundEnd (Pause beim Rundenwechsel)
    this.COMBAT_SPEEDS = {
      slow:   { label: '🐢 Langsam', telegraph: 950, action: 1600, roundEnd: 750 },
      normal: { label: '⚖️ Normal',  telegraph: 600, action: 1050, roundEnd: 450 },
      fast:   { label: '⚡ Schnell', telegraph: 250, action: 500,  roundEnd: 200 }
    };
    // Gespeicherte Präferenz laden oder Default 'normal'
    this.combatSpeedKey = localStorage.getItem('rpg_combat_speed') || 'normal';
    if (!this.COMBAT_SPEEDS[this.combatSpeedKey]) this.combatSpeedKey = 'normal';

    // UI-Elemente
    this.screens = document.querySelectorAll('.screen');
    this.header = document.getElementById('game-header');
    this.sidebar = document.getElementById('character-sheet-sidebar');

    this.init();
  }

  init() {
    this.setupCharacterCreation();
    this.setupEventListeners();
    this.setupMainMenu();
    this.showScreen('screen-main-menu');
  }

  // --- SPEICHERN & LADEN (3 Slots) ---

  saveGameToLocalStorage() {
    if (!this.player || !this.currentSlot) return;
    const saveState = {
      name: this.player.name,
      gender: this.player.gender,
      raceKey: this.player.raceKey,
      classKey: this.player.classKey,
      specKey: this.player.specKey,
      image: this.player.image || null,
      level: this.player.level,
      xp: this.player.xp,
      gold: this.player.gold,
      skillPoints: this.player.skillPoints,
      respecCount: this.player.respecCount || 0,
      hardcore: this.player.hardcore || false,
      materials: this.player.materials || {},
      equipment: this.player.equipment,
      inventory: this.player.inventory,
      talents: this.player.talents,
      completedQuests: this.player.completedQuests || [],
      activeQuests: this.player.activeQuests || [],
      buildings: this.player.buildings || {},
      npcReputation: this.player.npcReputation || {},
      storyFlags: this.player.storyFlags || {},
      activeNpcQuests: this.player.activeNpcQuests || [],
      completedActs: this.player.completedActs || 0,
      currentHp: this.player.currentHp,
      currentResource: this.player.currentResource,
      party: (this.player.party || []).map(p => ({
        name: p.name, gender: p.gender, raceKey: p.raceKey,
        classKey: p.classKey, specKey: p.specKey, role: p.role,
        level: p.level, equipment: p.equipment, talents: p.talents || {},
        skillPoints: p.skillPoints || 0,
        respecCount: p.respecCount || 0,
        inventory: p.inventory || [],
        currentHp: p.currentHp, currentResource: p.currentResource,
        image: p.image || null
      }))
    };
    localStorage.setItem(`dungeon_save_slot_${this.currentSlot}`, JSON.stringify(saveState));
    localStorage.setItem('dungeon_last_slot', String(this.currentSlot));
  }

  loadFromSlot(slotId) {
    const data = localStorage.getItem(`dungeon_save_slot_${slotId}`);
    if (!data) return;
    try {
      const state = JSON.parse(data);
      this.player = new Character(state.name, state.gender, state.raceKey, state.classKey, state.specKey);
      // Profilbild wiederherstellen (Fallback: aus Rasse/Klasse/Geschlecht berechnen für alte Saves)
      this.player.image = state.image || getPortraitPath(state.raceKey, state.classKey, state.gender);
      this.player.level = state.level;
      this.player.xp = state.xp;
      this.player.gold = state.gold;
      this.player.skillPoints = state.skillPoints;
      this.player.respecCount = state.respecCount || 0;
      this.player.hardcore = state.hardcore || false;
      this.player.materials = state.materials || {};
      this.player.equipment = state.equipment;
      this.player.inventory = state.inventory;
      this.player.talents = state.talents || {};
      this.player.completedQuests = state.completedQuests || [];
      this.player.activeQuests = state.activeQuests || [];
      this.player.buildings = state.buildings || { inn: 1, market: 1, blacksmith: 1 };
      this.player.npcReputation = state.npcReputation || {};
      this.player.storyFlags = state.storyFlags || {};
      this.player.activeNpcQuests = state.activeNpcQuests || [];
      this.player.completedActs = state.completedActs || 0;
      this.player.party = state.party ? state.party.map(p => {
        const comp = new Companion(p.name, p.gender, p.raceKey, p.classKey, p.specKey, p.role);
        Object.assign(comp, p);
        return comp;
      }) : [];

      // Passive-Effekte aus Talenten neu registrieren (async via restorePassiveEffects)
      this.restorePassiveEffects(this.player);
      if (this.player.party) this.player.party.forEach(c => this.restorePassiveEffects(c));

      this.player.resetStats();
      this.player.currentHp = state.currentHp;
      this.player.currentResource = state.currentResource;

      this.currentSlot = slotId;
      this.activeHeroIdx = null;
      localStorage.setItem('dungeon_last_slot', String(slotId));

      this.showScreen('screen-village');
      this.updateUI();
    } catch (e) {
      console.error('Fehler beim Laden von Slot', slotId, e);
    }
  }

  /** Stellt passiveEffects nach dem Laden wieder her (ohne learnTalent-Seiteneffekte) */
  restorePassiveEffects(character) {
    character.passiveEffects = character.passiveEffects || {};
    import('./modules/skills.js').then(({ SKILL_DATABASE }) => {
      for (const [talentId, level] of Object.entries(character.talents || {})) {
        if (level > 0) {
          const skillDef = SKILL_DATABASE[talentId];
          if (skillDef?.passiveEffect) {
            const fn = skillDef.passiveEffect;
            character.passiveEffects[talentId] = (c) => fn(c, c.talents[talentId] || 0);
          }
        }
      }
      character.resetStats();
    });
  }

  // --- HAUPTMENÜ ---
  setupMainMenu() {
    document.getElementById('btn-continue-game').addEventListener('click', () => {
      const lastSlot = localStorage.getItem('dungeon_last_slot');
      if (lastSlot && localStorage.getItem(`dungeon_save_slot_${lastSlot}`)) {
        this.loadFromSlot(parseInt(lastSlot));
      }
    });

    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.renderSaveSlots('new');
      document.getElementById('save-slots-overlay').classList.remove('hidden');
    });

    document.getElementById('btn-load-game').addEventListener('click', () => {
      this.renderSaveSlots('load');
      document.getElementById('save-slots-overlay').classList.remove('hidden');
    });

    document.getElementById('btn-close-save-slots').addEventListener('click', () => {
      document.getElementById('save-slots-overlay').classList.add('hidden');
    });

    this.updateMainMenuButtons();
  }

  updateMainMenuButtons() {
    const lastSlot = localStorage.getItem('dungeon_last_slot');
    const btn = document.getElementById('btn-continue-game');
    if (!btn) return;
    const hasSave = lastSlot && localStorage.getItem(`dungeon_save_slot_${lastSlot}`);
    btn.disabled = !hasSave;
    btn.style.opacity = hasSave ? '1' : '0.4';
    btn.style.cursor  = hasSave ? 'pointer' : 'not-allowed';
  }

  renderSaveSlots(mode) {
    const title = document.getElementById('save-slots-title');
    const list  = document.getElementById('save-slots-list');
    title.textContent = mode === 'new' ? 'Speicherslot wählen' : 'Spielstand laden';

    list.innerHTML = [1, 2, 3].map(slotId => {
      const raw = localStorage.getItem(`dungeon_save_slot_${slotId}`);
      let infoHtml = '<span style="color:var(--text-muted);">— Leer —</span>';
      let isEmpty = true;
      if (raw) {
        try {
          const d = JSON.parse(raw);
          isEmpty = false;
          infoHtml = `
            <strong style="color:var(--text-gold);">${d.name}</strong>
            <span style="color:var(--text-muted); margin-left:0.5rem;">
              ${CLASSES[d.classKey]?.name || d.classKey} · Stufe ${d.level}
            </span>`;
        } catch(e) { /* ignore */ }
      }

      const disabled = mode === 'load' && isEmpty;
      const warningHtml = !isEmpty && mode === 'new'
        ? `<div style="color:#c0392b; font-size:0.78rem; margin-top:0.25rem;">⚠ Wird überschrieben</div>`
        : '';
      const deleteBtn = !isEmpty
        ? `<button class="danger-btn btn-delete-slot" data-slot="${slotId}"
             style="padding:0.35rem 0.7rem; font-size:0.8rem; min-width:unset;"
             title="Spielstand löschen">🗑</button>`
        : '';

      return `
        <div style="
          display:flex; align-items:center; justify-content:space-between; gap:1rem;
          background:rgba(0,0,0,0.35); border:1px solid var(--border-color);
          border-radius:8px; padding:0.9rem 1.2rem;
          ${disabled ? 'opacity:0.4;' : ''}
        ">
          <div>
            <div style="font-family:var(--font-title); font-size:0.95rem; color:var(--text-gold); margin-bottom:0.3rem;">
              Slot ${slotId}
            </div>
            <div style="font-size:0.9rem;">${infoHtml}</div>
            ${warningHtml}
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button
              class="premium-btn small btn-select-slot"
              data-slot="${slotId}"
              data-mode="${mode}"
              ${disabled ? 'disabled' : ''}
              style="min-width:110px; ${disabled ? 'opacity:0.4;' : ''}">
              ${mode === 'new' ? 'Hier starten' : 'Laden'}
            </button>
            ${deleteBtn}
          </div>
        </div>`;
    }).join('');

    // Löschen-Handler
    list.querySelectorAll('.btn-delete-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = parseInt(btn.dataset.slot);
        const raw = localStorage.getItem(`dungeon_save_slot_${slotId}`);
        let charName = `Slot ${slotId}`;
        try { charName = JSON.parse(raw).name; } catch(e) {}
        if (confirm(`Spielstand "${charName}" (Slot ${slotId}) wirklich löschen?\nDieser Vorgang kann nicht rückgängig gemacht werden.`)) {
          localStorage.removeItem(`dungeon_save_slot_${slotId}`);
          // last_slot zurücksetzen falls dieser Slot der letzte war
          if (localStorage.getItem('dungeon_last_slot') === String(slotId)) {
            // Nächsten belegten Slot als last_slot setzen, oder komplett entfernen
            const next = [1,2,3].find(s => s !== slotId && localStorage.getItem(`dungeon_save_slot_${s}`));
            next ? localStorage.setItem('dungeon_last_slot', String(next))
                 : localStorage.removeItem('dungeon_last_slot');
          }
          this.renderSaveSlots(mode); // Liste neu aufbauen
          this.updateMainMenuButtons();
        }
      });
    });

    // Click-Handler an die Slot-Buttons binden
    list.querySelectorAll('.btn-select-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = parseInt(btn.dataset.slot);
        document.getElementById('save-slots-overlay').classList.add('hidden');
        if (btn.dataset.mode === 'new') {
          this.pendingNewGameSlot = slotId;
          this.showScreen('screen-char-creation');
        } else {
          this.loadFromSlot(slotId);
        }
      });
    });
  }

  // --- SCREEN SWITCHER ---
  showScreen(screenId) {
    this.screens.forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      this.currentScreen = screenId;
    }
    
    // Header & Sidebar steuern
    if (screenId === 'screen-main-menu' || screenId === 'screen-char-creation') {
      this.header.classList.add('hidden');
      this.sidebar.classList.add('hidden');
    } else {
      this.header.classList.remove('hidden');
      this.sidebar.classList.remove('hidden');
      this.updateHeaderStats();
      this.updateCharacterSidebar();
    }

    // Spezifische Screen-Renderer aufrufen
    if (screenId === 'screen-village') this.renderVillage();
    if (screenId === 'screen-inn') this.renderInn();
    if (screenId === 'screen-market') this.renderMarket();
    if (screenId === 'screen-blacksmith') this.renderBlacksmith();
    if (screenId === 'screen-quests') this.renderQuestBoard();
    if (screenId === 'screen-dungeon-select') this.renderDungeonSelect();
    if (screenId === 'screen-dungeon-crawler') this.renderDungeonCrawler();
    if (screenId === 'screen-combat') {
      // Slide-In-Animation nur EINMAL beim Betreten des Kampfes auslösen,
      // damit nicht bei jedem renderCombat()-Aufruf die Karten neu "zucken".
      const eg = document.getElementById('combat-enemies-group');
      const hg = document.getElementById('combat-heroes-group');
      eg?.classList.add('combat-entering');
      hg?.classList.add('combat-entering');
      this.renderCombat();
      setTimeout(() => {
        eg?.classList.remove('combat-entering');
        hg?.classList.remove('combat-entering');
      }, 700);
    }
    if (screenId === 'screen-talents') this.renderTalentTree();
    
    // Nach jedem Screen-Wechsel speichern
    this.saveGameToLocalStorage();
  }

  // --- CHARACTER CREATION (mehrstufig) ---
  setupCharacterCreation() {
    // Hilfsfunktion: initialisiert Race/Class/Spec-Grids für einen Step
    const setupStep = (prefix, defaultRace, defaultClass, defaultGender, previewImgId, previewNameId, previewDescId) => {
      const raceGrid  = document.getElementById(`${prefix}-race-grid`  ) || document.getElementById('race-selection-grid');
      const classGrid = document.getElementById(`${prefix}-class-grid` ) || document.getElementById('class-selection-grid');
      const specGrid  = document.getElementById(`${prefix}-spec-grid`  ) || document.getElementById('spec-selection-grid');

      raceGrid.innerHTML = Object.entries(RACES).map(([key, r]) =>
        `<div class="choice-card" data-type="${prefix}-race" data-key="${key}"><h4>${r.name}</h4><p>${r.description}</p></div>`
      ).join('');

      classGrid.innerHTML = Object.entries(CLASSES).map(([key, c]) =>
        `<div class="choice-card" data-type="${prefix}-class" data-key="${key}"><h4>${c.name}</h4><p>Rüstung: ${c.armorTypes.map(t => t === 'plate' ? 'Platte' : t === 'heavy' ? 'Schwer' : 'Stoff').join(', ')}</p></div>`
      ).join('');

      const updatePreview = () => {
        const nameEl   = document.getElementById(previewNameId === 'char-preview-name' ? 'char-name' : `${prefix}-name`);
        const name     = nameEl ? (nameEl.value?.trim() || previewNameId) : '';
        const genderEl = document.querySelector(`input[name="${prefix}-gender"]:checked`);
        const gender   = genderEl ? genderEl.value : defaultGender;
        const raceEl   = raceGrid.querySelector('.choice-card.selected');
        const classEl  = classGrid.querySelector('.choice-card.selected');
        const raceKey  = raceEl  ? raceEl.dataset.key  : defaultRace;
        const classKey = classEl ? classEl.dataset.key : defaultClass;

        const img = document.getElementById(previewImgId);
        if (img) {
          const src = getPortraitPath(raceKey, classKey, gender);
          const fb1 = getPortraitFallback(raceKey, gender);
          const fb2 = getPortraitFallback2(raceKey);
          img.src = src;
          img.onerror = function() {
            if (!this.src.includes(fb1)) { this.src = fb1; }
            else if (!this.src.includes(fb2)) { this.src = fb2; }
            else { this.style.display = 'none'; }
          };
        }
        const nameDisp = document.getElementById(previewNameId);
        const descDisp = document.getElementById(previewDescId);
        if (nameDisp) nameDisp.innerText = (nameEl?.value?.trim()) || previewNameId;
        if (descDisp) descDisp.innerText = `${RACES[raceKey]?.name || raceKey} ${CLASSES[classKey]?.name || classKey}`;
      };

      const selectClass = (key) => {
        // Spezialisierung wird NICHT bei Erstellung gewählt — stattdessen dynamisch durch Talentbaum bestimmt
        if (specGrid) {
          specGrid.innerHTML = '<p style="color:var(--text-gold);font-style:italic;padding:0.5rem;">⚔ Spezialisierung wird durch Talentpunkte bestimmt.</p>';
        }
        updatePreview();
      };

      raceGrid.querySelectorAll('.choice-card').forEach(c => {
        c.addEventListener('click', () => {
          raceGrid.querySelectorAll('.choice-card').forEach(x => x.classList.remove('selected'));
          c.classList.add('selected');
          updatePreview();
        });
      });
      classGrid.querySelectorAll('.choice-card').forEach(c => {
        c.addEventListener('click', () => {
          classGrid.querySelectorAll('.choice-card').forEach(x => x.classList.remove('selected'));
          c.classList.add('selected');
          selectClass(c.dataset.key);
        });
      });

      const nameInput = document.getElementById(prefix === 'char' ? 'char-name' : `${prefix}-name`);
      if (nameInput) nameInput.addEventListener('input', updatePreview);
      document.querySelectorAll(`input[name="${prefix}-gender"]`).forEach(r => r.addEventListener('change', updatePreview));

      // Vorauswahl
      const defaultRaceCard = raceGrid.querySelector(`[data-key="${defaultRace}"]`) || raceGrid.querySelector('.choice-card');
      if (defaultRaceCard) { defaultRaceCard.classList.add('selected'); }
      const defaultClassCard = classGrid.querySelector(`[data-key="${defaultClass}"]`) || classGrid.querySelector('.choice-card');
      if (defaultClassCard) { defaultClassCard.classList.add('selected'); selectClass(defaultClassCard.dataset.key); }

      return {
        getRaceKey:  () => (raceGrid.querySelector('.choice-card.selected')?.dataset.key  || defaultRace),
        getClassKey: () => (classGrid.querySelector('.choice-card.selected')?.dataset.key || defaultClass),
        getSpecKey:  () => null, // Spec wird dynamisch über Talentbaum bestimmt
        getGender:   () => (document.querySelector(`input[name="${prefix}-gender"]:checked`)?.value || defaultGender),
        getName:     () => (document.getElementById(prefix === 'char' ? 'char-name' : `${prefix}-name`)?.value?.trim() || ''),
      };
    };

    // Steps initialisieren
    const stepPlayer = setupStep('char',  'MENSCH',   'KRIEGER', 'm', 'char-preview-img',  'char-preview-name',  'char-preview-desc');
    const stepComp1  = setupStep('comp1', 'NACHTELF', 'PRIESTER','w', 'comp1-preview-img', 'comp1-preview-name', 'comp1-preview-desc');
    const stepComp2  = setupStep('comp2', 'MENSCH',   'PALADIN', 'm', 'comp2-preview-img', 'comp2-preview-name', 'comp2-preview-desc');

    // Step-Wechsel
    const gotoStep = (step) => {
      document.querySelectorAll('.creation-step-panel').forEach(p => p.classList.add('hidden'));
      document.querySelector(`.creation-step-panel[data-step="${step}"]`).classList.remove('hidden');
      document.querySelectorAll('#creation-steps-bar .creation-step').forEach(s => s.classList.remove('active'));
      document.querySelector(`#creation-steps-bar .creation-step[data-step="${step}"]`).classList.add('active');
    };

    document.getElementById('btn-creation-next-0').addEventListener('click', () => {
      if (!stepPlayer.getName()) { alert('Bitte gib deinem Helden einen Namen!'); return; }
      gotoStep(1);
    });
    document.getElementById('btn-creation-back-1').addEventListener('click', () => gotoStep(0));
    document.getElementById('btn-creation-next-1').addEventListener('click', () => {
      if (!stepComp1.getName()) { document.getElementById('comp1-name').value = 'Elara'; }
      gotoStep(2);
    });
    document.getElementById('btn-creation-back-2').addEventListener('click', () => gotoStep(1));

    // Finaler Start-Button
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const pName     = stepPlayer.getName() || 'Held';
      const pGender   = stepPlayer.getGender();
      const pRaceKey  = stepPlayer.getRaceKey();
      const pClassKey = stepPlayer.getClassKey();
      const pSpecKey  = stepPlayer.getSpecKey();

      this.player = new Character(pName, pGender, pRaceKey, pClassKey, pSpecKey);
      this.player.equipment = getStarterEquipment(pClassKey);
      this.player.buildings = { inn: 1, market: 1, blacksmith: 1 };
      this.player.npcReputation = {};
      this.player.storyFlags = {};
      this.player.activeNpcQuests = [];
      this.player.completedActs = 0;
      this.player.materials = {};
      this.player.hardcore = !!document.getElementById('char-hardcore')?.checked;
      this.player.resetStats();
      this.player.currentHp = this.player.maxHp;
      if (CLASSES[pClassKey].resourceType === 'MANA') this.player.currentResource = this.player.maxResource;
      this.player.image = getPortraitPath(pRaceKey, pClassKey, pGender);

      const buildCompanion = (step, roleHint) => {
        const name     = step.getName() || 'Gefährte';
        const gender   = step.getGender();
        const raceKey  = step.getRaceKey();
        const classKey = step.getClassKey();
        const specKey  = step.getSpecKey();
        const role     = classKey === 'PRIESTER' ? 'HEALER' : classKey === 'PALADIN' || classKey === 'KRIEGER' ? 'TANK' : 'DPS';
        const comp = new Companion(name, gender, raceKey, classKey, specKey, role);
        comp.equipment = getStarterEquipment(classKey);
        comp.resetStats();
        comp.currentHp = comp.maxHp;
        if (CLASSES[classKey].resourceType === 'MANA') comp.currentResource = comp.maxResource;
        comp.image = getPortraitPath(raceKey, classKey, gender);
        return comp;
      };

      this.player.party = [buildCompanion(stepComp1), buildCompanion(stepComp2)];
      // Companions starten mit 1 Talentpunkt — der Spieler verteilt ihn selbst
      // (Gefährten-Tab im Charaktermenü), um ihre Rolle zu bestimmen.
      this.activeHeroIdx = null;

      this.currentSlot = this.pendingNewGameSlot || 1;
      this.pendingNewGameSlot = null;
      this.showScreen('screen-village');
    });
  }

  // Liefert den aktuell verwalteten Helden (Spieler oder Companion)
  get activeHero() {
    if (this.activeHeroIdx === null || this.activeHeroIdx === undefined) return this.player;
    return this.player?.party?.[this.activeHeroIdx] ?? this.player;
  }

  // Rendert Hero-Switcher in ein Container-Element
  renderHeroSwitcher(containerId, onSwitch) {
    const container = document.getElementById(containerId);
    if (!container || !this.player) return;

    const allHeroes = [this.player, ...(this.player.party || [])];
    container.innerHTML = `
      <span class="hero-switcher-label">Held:</span>
      ${allHeroes.map((h, i) => {
        const idx = i === 0 ? null : i - 1;
        const isActive = this.activeHeroIdx === idx;
        const imgSrc = h.image || '';
        const imgHtml = imgSrc
          ? `<img src="${imgSrc}" alt="${h.name}" onerror="this.style.display='none';">`
          : '';
        const hpPct = Math.round((h.currentHp / h.maxHp) * 100);
        const hpColor = hpPct < 30 ? '#e74c3c' : hpPct < 60 ? '#f0a500' : '#2ecc71';
        return `<button class="hero-switch-btn ${isActive ? 'active' : ''}" data-heroIdx="${i === 0 ? 'null' : i - 1}">
          ${imgHtml}
          <span>${h.name} <span style="font-size:0.7rem; color:${hpColor};">${hpPct}% HP</span></span>
        </button>`;
      }).join('')}
    `;

    container.querySelectorAll('.hero-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.heroidx;
        this.activeHeroIdx = (raw === 'null') ? null : parseInt(raw);
        onSwitch();
      });
    });
  }

  // --- GLOBALE EVENT LISTENERS ---
  setupEventListeners() {
    // Migration: alten Einzelsave in Slot 1 übernehmen
    const legacySave = localStorage.getItem('dungeon_crawler_save');
    if (legacySave && !localStorage.getItem('dungeon_save_slot_1')) {
      localStorage.setItem('dungeon_save_slot_1', legacySave);
      localStorage.setItem('dungeon_last_slot', '1');
      localStorage.removeItem('dungeon_crawler_save');
    }

    // Hauptmenü-Button im Header
    const mainMenuBtn = document.getElementById('btn-goto-mainmenu');
    if (mainMenuBtn) {
      mainMenuBtn.addEventListener('click', () => {
        this.saveGameToLocalStorage(); // Speichern bevor zurück
        this.player = null;
        this.currentSlot = null;
        this.showScreen('screen-main-menu');
        this.updateMainMenuButtons();
      });
    }

    // Togglen des neuen Charakter-Menüs
    const toggleBtn = document.getElementById('btn-toggle-character');
    toggleBtn.addEventListener('click', () => {
      document.getElementById('character-menu-overlay').classList.remove('hidden');
      this.renderHeroSwitcher('char-menu-hero-switcher', () => {
        this.updateCharacterSidebar();
        this.renderCharMenuContent();
      });
      this.updateUI();
      this.renderCharMenuContent();
    });

    const closeCharBtn = document.getElementById('btn-close-char-menu');
    if (closeCharBtn) {
      closeCharBtn.addEventListener('click', () => {
        document.getElementById('character-menu-overlay').classList.add('hidden');
      });
    }

    // Quest-Tagebuch öffnen/schließen
    document.getElementById('btn-open-quest-log')?.addEventListener('click', () => this._showQuestLogOverlay());
    document.getElementById('btn-close-quest-log')?.addEventListener('click', () => {
      document.getElementById('quest-log-overlay').classList.add('hidden');
    });
    document.getElementById('quest-log-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'quest-log-overlay') e.currentTarget.classList.add('hidden');
    });

    // Tab-Wechsel im Charakter-Menü
    document.querySelectorAll('#character-menu-overlay .char-menu-header .shop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Active class für Tabs
        document.querySelectorAll('#character-menu-overlay .char-menu-header .shop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Panels umschalten
        document.querySelectorAll('#character-menu-overlay .char-menu-tab').forEach(p => p.classList.add('hidden'));
        document.getElementById(tab.dataset.tab).classList.remove('hidden');

        // Inhalte je Tab aktualisieren
        if (tab.dataset.tab === 'tab-companions') this.renderCompanionManagement();
        if (tab.dataset.tab === 'tab-talents')    this.renderTalentTree();
        if (tab.dataset.tab === 'tab-stats' || tab.dataset.tab === 'tab-equip') this.updateCharacterSidebar();
      });
    });

    // Inventar Filter im Charakter-Menü
    const bindInvFilter = (id, type) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#tab-equip .shop-tabs .shop-tab').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          this.currentInventoryFilter = type;
          this.updateCharacterSidebar(); // Renders inventory
        });
      }
    };
    this.currentInventoryFilter = 'all';
    bindInvFilter('filter-inv-all', 'all');
    bindInvFilter('filter-inv-equip', 'equip');
    bindInvFilter('filter-inv-consumable', 'consumable');

    // Village Back Buttons
    document.querySelectorAll('.btn-back-to-village').forEach(btn => {
      btn.addEventListener('click', () => this.showScreen('screen-village'));
    });

    // Village Buttons
    document.querySelector('.btn-visit-inn').addEventListener('click', () => this.showScreen('screen-inn'));
    document.querySelector('.btn-visit-market').addEventListener('click', () => this.showScreen('screen-market'));
    document.querySelector('.btn-visit-blacksmith').addEventListener('click', () => this.showScreen('screen-blacksmith'));
    document.querySelector('.btn-visit-quests').addEventListener('click', () => this.showScreen('screen-quests'));
    document.querySelector('.btn-visit-dungeon-select').addEventListener('click', () => this.showScreen('screen-dungeon-select'));
    document.querySelector('.btn-visit-townhall')?.addEventListener('click', () => this._showTownHall());
    document.querySelector('.btn-visit-training')?.addEventListener('click', () => this._showTrainingHall());

    // Shop Tabs
    const bindTabs = (tabGroupClass, panelGroupClass, tabActiveId, panelActiveId) => {
      const tab = document.getElementById(tabActiveId);
      if (!tab) return;
      tab.addEventListener('click', () => {
        document.querySelectorAll(`.${tabGroupClass}`).forEach(t => t.classList.remove('active'));
        document.querySelectorAll(`.${panelGroupClass}`).forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById(panelActiveId).classList.remove('hidden');
      });
    };

    // Markt-Tabs
    bindTabs('shop-tab', 'shop-panel', 'tab-market-buy', 'market-buy-panel');
    bindTabs('shop-tab', 'shop-panel', 'tab-market-sell', 'market-sell-panel');

    // Schmied-Tabs
    bindTabs('shop-tab', 'shop-panel', 'tab-smith-buy', 'smith-buy-panel');
    bindTabs('shop-tab', 'shop-panel', 'tab-smith-upgrade', 'smith-upgrade-panel');
    const craftTab = document.getElementById('tab-smith-craft');
    if (craftTab) {
      craftTab.addEventListener('click', () => {
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.shop-panel').forEach(p => p.classList.add('hidden'));
        craftTab.classList.add('active');
        document.getElementById('smith-craft-panel').classList.remove('hidden');
        this._renderCrafting();
      });
    }

    // Quest-Tabs
    bindTabs('quest-layout-tab', 'quest-board-panel', 'tab-quests-available', 'quests-available-panel');
    bindTabs('quest-layout-tab', 'quest-board-panel', 'tab-quests-active', 'quests-active-panel');

    // Dungeon Rückzug
    document.getElementById('btn-retreat-dungeon').addEventListener('click', () => {
      if (confirm('Willst du wirklich fliehen? Du verlierst jeglichen ungespeicherten Fortschritt im aktuellen Dungeon!')) {
        this.dungeonRun = null;
        this.showScreen('screen-village');
      }
    });

    // Combat Result close
    document.getElementById('btn-close-result').addEventListener('click', () => {
      document.getElementById('combat-result-overlay').classList.add('hidden');
      if (this.player.currentHp <= 0) {
        // ── TOD ──────────────────────────────────────────────────────────────
        this.dungeonRun = null;
        this.combat = null;
        if (this.player.hardcore) {
          // HARDCORE: Spielstand löschen, endgültiges Game Over
          this._showHardcoreDeath();
          return;
        }
        // Normaler Tod: Wiederbelebung im Dorf gegen Goldverlust
        this.player.gold = Math.max(0, Math.round(this.player.gold * 0.5));
        this.player.currentHp = Math.round(this.player.maxHp * 0.1);
        this.showScreen('screen-village');
        this.saveGameToLocalStorage();
        alert('Du bist gestorben und wurdest im Dorf wiederbelebt. Die Priester verlangen die Hälfte deines Goldes für die Rettung.');
      } else if (this.combat && this.combat.fled) {
        this.combat = null;
        this.showScreen('screen-village');
      } else {
        // Zurück zum Dungeon Crawler
        this.combat = null;
        if (this.dungeonRun.activeRoom.type === 'boss') {
          // Dungeon abgeschlossen!
          alert(`Herzlichen Glückwunsch! Du hast ${this.dungeonRun.dungeonMeta.name} erfolgreich abgeschlossen!`);
          this.dungeonRun = null;
          this.showScreen('screen-village');
        } else {
          this.renderDungeonCrawler();
          this.showScreen('screen-dungeon-crawler');
        }
      }
      // Cinematischen Story-Beat zeigen (Akt-Übergang / Verräter / Ende)
      if (this._pendingStoryBeat) {
        const beat = this._pendingStoryBeat;
        this._pendingStoryBeat = null;
        setTimeout(() => this._applyStoryBeat(beat), 400);
      }
    });

    // TEMP DEBUG: Kampflog exportieren (später entfernen)
    document.getElementById('btn-combat-debug-log')?.addEventListener('click', () => {
      this._exportDebugLog();
    });

    // Kampftempo umschalten (zyklisch: slow → normal → fast → slow)
    document.getElementById('combat-speed-toggle')?.addEventListener('click', () => {
      const order = ['slow', 'normal', 'fast'];
      const idx = order.indexOf(this.combatSpeedKey);
      this.combatSpeedKey = order[(idx + 1) % order.length];
      localStorage.setItem('rpg_combat_speed', this.combatSpeedKey);
      this._updateSpeedToggleBtn();
    });

    // Heilung anfordern
    document.getElementById('btn-combat-heal-request')?.addEventListener('click', () => {
      if (!this.combat || this.combat.isOver) return;
      // Prüfen ob ein Heiler-Companion lebt
      const healer = this.combat.heroes.find(h =>
        h !== this.player && h.currentHp > 0 &&
        (h.role === 'HEALER' || h.classKey === 'PRIESTER')
      );
      if (!healer) {
        this._showHealRequestFeedback('Kein Heiler in der Gruppe!', false);
        return;
      }
      if (this.combat.healRequest) {
        this._showHealRequestFeedback('Heilung bereits angefordert!', false);
        return;
      }
      this.combat.healRequest = { target: this.player, priority: 'urgent' };
      this._showHealRequestFeedback(`${healer.name} wurde um Heilung gebeten!`, true);
      this.renderCombat();
    });

    // Flee combat
    document.getElementById('btn-combat-flee').addEventListener('click', () => {
      if (this.combat.flee()) {
        this.showCombatResultOverlay(false, 'Du konntest erfolgreich fliehen, verlierst aber deinen Dungeon-Fortschritt.');
      } else {
        this.renderCombat();
      }
    });

    // Auto-Kampf Button
    const autoBtn = document.getElementById('combat-auto-btn');
    if (autoBtn) {
      const setAutoBtnIdle = () => {
        autoBtn.textContent = '⚡ Auto-Kampf';
        autoBtn.style.borderColor = 'hsl(270,50%,50%)';
      };
      const setAutoBtnRunning = () => {
        autoBtn.textContent = '⏸ Stopp';
        autoBtn.style.borderColor = 'hsl(0,60%,50%)';
      };

      autoBtn.addEventListener('click', async () => {
        // ── TOGGLE: läuft bereits → stoppen ──────────────────────────────────
        if (this._autoCombatRunning) {
          this._autoCombatRunning = false;
          setAutoBtnIdle();
          return;
        }
        // ── Sonst: starten ───────────────────────────────────────────────────
        if (!this.combat || this.combat.isOver) return;
        this._autoCombatRunning = true;
        setAutoBtnRunning();

        const runAuto = async () => {
          while (this._autoCombatRunning && this.combat && !this.combat.isOver) {
            const current = this.combat.turnQueue[this.combat.currentTurnIndex];
            if (!current) break;

            if (current.type === 'hero' && current.entity === this.player) {
              // Auto: bevorzugt einen bezahlbaren Schadens-Skill mit Kosten (z.B. Feuerball),
              // sonst irgendeinen Schadens-Skill (Auto-Attack), sonst den ersten nutzbaren.
              const skills = getAvailableSkills(this.player);
              const usable = skills.filter(s => s.type !== 'passive' && this.player.currentResource >= (s.cost || 0));
              const skill =
                usable.find(s => s.type === 'damage' && (s.cost || 0) > 0) ||
                usable.find(s => s.type === 'damage') ||
                usable[0];
              const target = this.combat.enemies.find(e => e.currentHp > 0);
              if (skill && target) {
                // WICHTIG: await — sonst überlappen sich die NPC-Loops (Race Condition)
                await this.executeTargetedSkill(target.id, skill);
              } else break;
            } else {
              this._setNpcTurnLock(true);
              await this._runNpcAnimLoop();
              this._setNpcTurnLock(false);
              this.renderCombat();
            }

            if (this.combat && this.combat.isOver) break;
            // Abbruch durch Stopp-Klick respektieren
            if (!this._autoCombatRunning) break;
            await new Promise(r => setTimeout(r, 300)); // kurze Pause zwischen Runden
          }
          this._autoCombatRunning = false;
          setAutoBtnIdle();

          // WICHTIG: Belohnungen/Loot anzeigen, falls der Kampf während eines
          // NPC-Zugs endete (z.B. Companion erledigt den letzten Gegner).
          // checkCombatEnd ist idempotent → kein Doppel-Reward.
          if (this.combat && this.combat.isOver) this.checkCombatEnd();
        };

        runAuto();
      });
    }
  }

  // Rendert den aktiven Tab im Charakter-Overlay neu (für Hero-Switcher)
  renderCharMenuContent() {
    const activeTab = document.querySelector('#character-menu-overlay .char-menu-header .shop-tab.active');
    if (!activeTab) return;
    const tabId = activeTab.dataset.tab;
    this.updateCharacterSidebar();
    if (tabId === 'tab-talents') this.renderTalentTree();
    if (tabId === 'tab-companions') this.renderCompanionManagement();
    this.renderHeroSwitcher('char-menu-hero-switcher', () => {
      this.renderCharMenuContent();
    });
  }

  // --- UI UPDATER UTILS ---
  updateUI() {
    this.updateHeaderStats();
    this.updateCharacterSidebar();
  }

  updateHeaderStats() {
    if (!this.player) return;
    document.getElementById('header-gold').innerHTML = `💰 <span class="val">${this.player.gold}</span> Gold`;
    document.getElementById('header-level').innerText = `Stufe ${this.player.level}`;

    const xpNeeded = this.player.getXpNeeded();
    const pct = (this.player.xp / xpNeeded) * 100;
    document.getElementById('header-xp-bar').style.width = `${pct}%`;
    document.getElementById('header-xp-text').innerText = `${this.player.xp} / ${xpNeeded} XP`;
  }

  updateCharacterSidebar() {
    if (!this.player) return;

    // Name & Subtitle
    document.getElementById('sheet-name').innerText = this.player.name;
    const race = RACES[this.player.raceKey].name;
    const charClass = CLASSES[this.player.classKey];
    const spec = charClass.specs[this.player.specKey].name;
    const genderSign = this.player.gender === 'm' ? '♂' : '♀';
    document.getElementById('sheet-sub').innerText = `${genderSign} ${race} ${spec}-${charClass.name}`;

    // Portrait + Level-Chip in der Sidebar
    const sbPortrait = document.getElementById('sidebar-portrait');
    if (sbPortrait) {
      const frame = sbPortrait.parentElement;
      frame.classList.remove('no-img');
      sbPortrait.style.display = '';
      sbPortrait.src = this.player.image || getPortraitPath(this.player.raceKey, this.player.classKey, this.player.gender);
    }
    const lvlChip = document.getElementById('sheet-level-chip');
    if (lvlChip) {
      lvlChip.innerHTML = `Stufe ${this.player.level}` +
        (this.player.hardcore ? ` <span class="hardcore-badge" title="Hardcore-Modus: Tod ist endgültig">☠️</span>` : '');
    }

    // HP Bar
    const hpPct = (this.player.currentHp / this.player.maxHp) * 100;
    document.getElementById('sheet-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('sheet-hp-text').innerText = `${this.player.currentHp} / ${this.player.maxHp}`;

    // Resource Bar
    const resContainer = document.getElementById('sheet-resource-container');
    const resBar = document.getElementById('sheet-resource-bar');
    const resText = document.getElementById('sheet-resource-text');
    const resLabel = document.getElementById('sheet-resource-label');

    resLabel.innerText = charClass.resourceType;
    resText.innerText = `${this.player.currentResource} / ${this.player.maxResource}`;
    const resPct = (this.player.currentResource / this.player.maxResource) * 100;
    resBar.style.width = `${resPct}%`;

    if (charClass.resourceType === 'WUT') {
      resContainer.className = 'bar-container resource rage';
    } else {
      resContainer.className = 'bar-container resource';
    }

    // Modal Header — zeigt activeHero
    const h = this.activeHero;
    const hRace      = RACES[h.raceKey].name;
    const hCharClass = CLASSES[h.classKey];
    const hSpec      = hCharClass.specs[h.specKey]?.name || '';
    const hGenderSign = h.gender === 'm' ? '♂' : '♀';

    const menuSheetName = document.getElementById('menu-sheet-name');
    if (menuSheetName) menuSheetName.innerText = h.name;
    const menuSheetSub = document.getElementById('menu-sheet-sub');
    if (menuSheetSub) menuSheetSub.innerText = `${hGenderSign} ${hRace} ${hSpec}-${hCharClass.name}`;

    // Stats im Modal
    document.getElementById('menu-stat-strength').innerText = h.stats.strength;
    document.getElementById('menu-stat-agility').innerText = h.stats.agility;
    document.getElementById('menu-stat-intellect').innerText = h.stats.intellect;
    document.getElementById('menu-stat-stamina').innerText = h.stats.stamina;

    const armor = h.getArmor();
    const redPct = Math.round(h.getDamageReduction() * 100);
    document.getElementById('menu-stat-armor').innerText = armor;
    document.getElementById('menu-stat-reduction').innerText = `${redPct}%`;

    document.getElementById('menu-stat-damage').innerText = h.getPhysicalDamage();
    document.getElementById('menu-stat-spellpower').innerText = h.getSpellPower();

    // Sekundärwerte
    const critEl      = document.getElementById('menu-stat-crit');
    const spellCritEl = document.getElementById('menu-stat-spellcrit');
    const dodgeEl     = document.getElementById('menu-stat-dodge');
    const blockEl     = document.getElementById('menu-stat-block');
    if (critEl)      critEl.innerText      = `${Math.round(h.getCritChance()      * 100)}%`;
    if (spellCritEl) spellCritEl.innerText = `${Math.round(h.getSpellCritChance() * 100)}%`;
    if (dodgeEl)     dodgeEl.innerText     = `${Math.round(h.getDodgeChance()     * 100)}%`;
    if (blockEl)     blockEl.innerText     = `${Math.round(h.getBlockChance()     * 100)}%`;

    // Equipment Slots im Modal — zeigt activeHero
    const hero = this.activeHero;
    const previewBox = document.getElementById('item-hover-preview');
    const previewName = document.getElementById('preview-name');
    const previewStats = document.getElementById('preview-stats');

    document.querySelectorAll('.equip-slot').forEach(slot => {
      const slotName = slot.dataset.slot;
      const equippedItem = hero.equipment[slotName];

      if (equippedItem) {
        slot.classList.add('equipped');
        let icon = '⚔️';
        if (slotName === 'head') icon = '👑';
        if (slotName === 'chest') icon = '🛡️';
        if (slotName === 'hands') icon = '🧤';
        if (slotName === 'legs') icon = '👖';
        if (slotName === 'feet') icon = '🥾';
        if (slotName === 'offHand') icon = equippedItem.id.includes('shield') ? '🛡️' : '📖';

        slot.innerHTML = `
          <div class="slot-icon">${icon}</div>
          <div class="slot-name" style="font-size: 0.55rem; color: var(--text-gold); font-weight:bold;">${equippedItem.name}</div>
        `;
        
        slot.onmouseenter = () => {
          previewBox.classList.remove('hidden');
          previewName.innerText = equippedItem.name;
          previewName.style.color = 'var(--text-gold)';
          let statText = '';
          if (equippedItem.damage) statText += `<div>Schaden: ${equippedItem.damage}</div>`;
          if (equippedItem.armor) statText += `<div>Rüstung: ${equippedItem.armor}</div>`;
          if (equippedItem.stats) {
             Object.entries(equippedItem.stats).forEach(([k,v]) => {
               statText += `<div>${k}: +${v}</div>`;
             });
          }
          previewStats.innerHTML = statText || 'Keine Werte';
        };
        slot.onmouseleave = () => {
          previewBox.classList.add('hidden');
        };

        // Ablegen per Klick
        slot.onclick = () => {
          const res = unequipItem(hero, slotName);
          if (res.success) {
            previewBox.classList.add('hidden');
            this.updateUI();
            this.saveGameToLocalStorage();
          }
        };
      } else {
        slot.classList.remove('equipped');
        let placeholder = 'Kopf';
        let icon = '👑';
        if (slotName === 'chest') { placeholder = 'Brust'; icon = '🛡️'; }
        if (slotName === 'hands') { placeholder = 'Hände'; icon = '🧤'; }
        if (slotName === 'legs') { placeholder = 'Beine'; icon = '👖'; }
        if (slotName === 'feet') { placeholder = 'Füße'; icon = '🥾'; }
        if (slotName === 'mainHand') { placeholder = 'Hauptwaff'; icon = '⚔️'; }
        if (slotName === 'offHand') { placeholder = 'Nebenhand'; icon = '🛡️'; }

        slot.innerHTML = `
          <div class="slot-icon">${icon}</div>
          <div class="slot-name">${placeholder}</div>
        `;
        slot.onmouseenter = null;
        slot.onmouseleave = null;
        slot.onclick = null;
      }
    });

    // Inventory List in Modal
    const invList = document.getElementById('menu-inventory-grid');
    if (!invList) return;

    let filteredInventory = hero.inventory;
    if (this.currentInventoryFilter === 'equip') {
      filteredInventory = filteredInventory.filter(i => i.type === 'equipment');
    } else if (this.currentInventoryFilter === 'consumable') {
      filteredInventory = filteredInventory.filter(i => i.type === 'consumable');
    }

    if (filteredInventory.length === 0) {
      invList.innerHTML = `<div class="placeholder-text" style="font-size:0.9rem; color:var(--text-muted); grid-column: 1 / -1;">Keine Gegenstände gefunden.</div>`;
    } else {
      invList.innerHTML = filteredInventory.map(item => {
        let typeClass = item.armorType || 'weapon';
        if (item.type === 'consumable') typeClass = 'consumable';
        if (item.damage) typeClass = 'weapon';

        let statText = '';
        if (item.damage) statText = `Schaden: ${item.damage}`;
        if (item.armor) statText = `Rüstung: ${item.armor}`;
        if (item.stats && Object.keys(item.stats).length > 0) {
          statText += ' | ' + Object.entries(item.stats).map(([k,v]) => `${k.substring(0,3)}: +${v}`).join(', ');
        }

        return `
          <div class="item-card ${typeClass}" data-id="${item.uniqueId}" style="cursor: pointer; padding: 0.8rem; border: 1px solid var(--border-color); background: rgba(0,0,0,0.4); border-radius: 6px;">
            <div class="item-info">
              <div class="item-title" style="font-weight: bold; color: ${item.type === 'consumable' ? '#28a745' : (item.rarity ? (RARITIES[item.rarity]?.color || '#fff') : '#fff')}; margin-bottom: 0.3rem;">${item.name}</div>
              <div class="item-desc" style="font-size: 0.75rem; color: #ccc;">${statText || item.description || ''}</div>
            </div>
          </div>
        `;
      }).join('');

      // Preview on hover & Equip/Use on click
      invList.querySelectorAll('.item-card').forEach(card => {
        const item = hero.inventory.find(i => i.uniqueId === card.dataset.id);

        card.onmouseenter = () => {
          if (!previewBox || item.type === 'consumable') return;
          previewBox.classList.remove('hidden');
          const rarityData = item.rarity ? RARITIES[item.rarity] : null;
          const rarityColor = rarityData?.color || '#fff';
          previewName.innerText = item.name;
          previewName.style.color = rarityColor;

          const slot = item.slot;
          const equipped = hero.equipment[slot];
          let statText = '';

          // Rarity tag
          if (rarityData) {
            statText += `<div style="color:${rarityColor}; font-size:0.7rem; margin-bottom:4px;">${rarityData.name}</div>`;
          }

          // Einzigartiger Proc-Effekt (legendäre Items)
          if (item.procDesc) {
            statText += `<div style="color:#ff8000; font-size:0.72rem; font-style:italic; margin-bottom:5px; line-height:1.3;">${item.procDesc}</div>`;
          }

          // Schaden-Vergleich
          if (item.damage) {
            const eqDmg = equipped?.damage || 0;
            const diff = item.damage - eqDmg;
            const diffHtml = equipped ? ` <span style="color:${diff > 0 ? '#28a745' : diff < 0 ? 'var(--text-red)' : 'gray'}">${diff > 0 ? '+' : ''}${diff}</span>` : '';
            statText += `<div>⚔️ Schaden: ${item.damage}${diffHtml}</div>`;
          }
          // Rüstung-Vergleich
          if (item.armor) {
            const eqArm = equipped?.armor || 0;
            const diff = item.armor - eqArm;
            const diffHtml = equipped ? ` <span style="color:${diff > 0 ? '#28a745' : diff < 0 ? 'var(--text-red)' : 'gray'}">${diff > 0 ? '+' : ''}${diff}</span>` : '';
            statText += `<div>🛡️ Rüstung: ${item.armor}${diffHtml}</div>`;
          }
          // Stats-Vergleich
          if (item.stats) {
             Object.entries(item.stats).forEach(([k,v]) => {
               const eqStat = equipped?.stats?.[k] || 0;
               const diff = v - eqStat;
               const diffColor = diff > 0 ? '#28a745' : (diff < 0 ? 'var(--text-red)' : 'gray');
               const diffStr = equipped ? ` <span style="color:${diffColor}">${diff > 0 ? '+' : ''}${diff}</span>` : '';
               statText += `<div>${k}: +${v}${diffStr}</div>`;
             });
          }
          // Set-Zugehörigkeit + Boni
          if (item.setId && ITEM_SETS[item.setId]) {
            const set = ITEM_SETS[item.setId];
            const equippedCount = Object.values(hero.equipment).filter(it => it?.setId === item.setId).length;
            statText += `<div style="margin-top:7px; border-top:1px solid #444; padding-top:5px;">`;
            statText += `<div style="color:${set.color}; font-size:0.72rem; font-weight:bold;">⊛ ${set.name}</div>`;
            Object.entries(set.bonuses).forEach(([thr, b]) => {
              const act = equippedCount >= Number(thr);
              statText += `<div style="font-size:0.66rem; color:${act ? set.color : '#777'};">(${thr}) ${b.desc}${act ? ' ✓' : ''}</div>`;
            });
            statText += `</div>`;
          }
          // Aktuell ausgerüstet Hinweis
          if (equipped) {
            statText += `<div style="margin-top:6px; border-top:1px solid #444; padding-top:4px; font-size:0.65rem; color:#aaa;">Ausgerüstet: ${equipped.name}</div>`;
          }
          previewStats.innerHTML = statText || 'Keine Werte';
        };

        card.onmouseleave = () => {
          if (previewBox) previewBox.classList.add('hidden');
        };

        card.onclick = () => {
          if (item.type === 'consumable') {
            const res = useConsumable(hero, item.uniqueId, this.currentScreen === 'screen-combat');
            if (res.error) {
              alert(res.error);
            } else {
              alert(res.text);
              if (previewBox) previewBox.classList.add('hidden');
              this.updateUI();
              if (this.currentScreen === 'screen-combat' && this.combat) this.renderCombat();
              this.saveGameToLocalStorage();
            }
          } else {
            const res = equipItem(hero, item.uniqueId);
            if (res.error) {
              alert(res.error);
            } else {
              if (previewBox) previewBox.classList.add('hidden');
              this.updateUI();
              this.saveGameToLocalStorage();
            }
          }
        };
      });
    }

    // Party List Rendering (Sidebar)
    const partyList = document.getElementById('sidebar-party-list');
    const menuPartyList = document.getElementById('menu-companions-list');
    
    if (this.player.party) {
      const partyHtml = this.player.party.map(comp => {
        const hpPct = (comp.currentHp / comp.maxHp) * 100;
        let avatarIcon = '🧙‍♂️';
        if (comp.classKey === 'PRIESTER') avatarIcon = '🧝‍♀️';
        if (comp.classKey === 'PALADIN' || comp.classKey === 'KRIEGER') avatarIcon = '🛡️';
        if (comp.image) avatarIcon = makePortraitImg(comp.image, comp.raceKey, comp.gender, comp.name, 'avatar-img');

        return `
          <div class="party-member-card">
            <div class="party-avatar">${avatarIcon}</div>
            <div class="party-info">
              <div class="party-name">${comp.name}</div>
              <div class="party-class">Lvl ${comp.level} ${comp.classKey}</div>
              <div class="party-hp-bar">
                <div class="party-hp-fill" style="width: ${hpPct}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      if (partyList) partyList.innerHTML = partyHtml;
      
      // Companion-Verwaltung aktualisieren wenn Tab sichtbar
      const compTab = document.getElementById('tab-companions');
      if (compTab && !compTab.classList.contains('hidden')) {
        this.renderCompanionManagement();
      }

      // Detailed view in Menu Overlay (Fallback wenn Tab nicht geöffnet)
      if (menuPartyList && (!compTab || compTab.classList.contains('hidden'))) {
        menuPartyList.innerHTML = this.player.party.map(comp => {
          const hpPct = (comp.currentHp / comp.maxHp) * 100;
          let avatarIcon = '🧙‍♂️';
          if (comp.classKey === 'PRIESTER') avatarIcon = '🧝‍♀️';
          if (comp.classKey === 'PALADIN' || comp.classKey === 'KRIEGER') avatarIcon = '🛡️';
          if (comp.image) avatarIcon = makePortraitImg(comp.image, comp.raceKey, comp.gender, comp.name, 'avatar-img');

          return `
            <div style="display: flex; gap: 1rem; background: rgba(0,0,0,0.3); padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
              <div class="avatar-box player-avatar">${avatarIcon}</div>
              <div style="flex: 1;">
                <h3 style="color: #fff; margin:0 0 0.5rem 0;">${comp.name} <span style="font-size:0.8rem; color:var(--text-muted);">Lvl ${comp.level} ${comp.classKey} (${comp.role})</span></h3>
                <div class="stat-bar-wrapper" style="max-width: 300px; margin-bottom: 0.5rem;">
                  <div class="bar-container hp">
                    <div class="bar" style="width: ${hpPct}%"></div>
                    <span class="bar-text">${comp.currentHp} / ${comp.maxHp} HP</span>
                  </div>
                </div>
                <div style="font-size: 0.85rem; display:flex; gap: 1rem; color: #ccc;">
                  <div>Stärke: ${comp.stats.strength}</div>
                  <div>Intelligenz: ${comp.stats.intellect}</div>
                  <div>Rüstung: ${comp.getArmor()}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Portables Quest-Log in der Sidebar aktualisieren
    this._renderSidebarQuestLog();
  }

  /** Baut (einmalig) Lookup-Maps: Boss-/Monster-/Loot-Name → Dungeon-Name. */
  _questDungeonMap() {
    if (this.__qdMap) return this.__qdMap;
    const map = { boss: {}, monster: {}, loot: {} };
    for (const dg of Object.values(DUNGEONS)) {
      const dn = dg.name;
      const bossTpl = ENEMY_TEMPLATES[dg.bossKey];
      if (bossTpl) map.boss[bossTpl.name] = dn;
      [...(dg.monsterPool || []), ...(dg.supportPool || [])].forEach(k => {
        const t = ENEMY_TEMPLATES[k];
        if (!t) return;
        if (!map.monster[t.name]) map.monster[t.name] = dn;
        (t.lootTable || []).forEach(l => { if (l.isMaterial && !map.loot[l.id]) map.loot[l.id] = dn; });
      });
    }
    this.__qdMap = map;
    return map;
  }

  /** Sammelt alle aktiven Quests (NPC + Brett) in einheitlicher Form, inkl. Dungeon. */
  _collectActiveQuests() {
    const list = [];
    const dm = this._questDungeonMap();
    const ANY = 'Alle Dungeons';

    for (const qid of (this.player.activeNpcQuests || [])) {
      const q = NPC_QUESTS[qid];
      if (!q || hasFlag(this.player, q.doneFlag)) continue;
      const ready = q.returnNode && hasFlag(this.player, q.foundFlag);
      const npc = VILLAGE_NPCS[q.npcId];
      const dungeon = q.triggerType === 'bossKill' ? (dm.boss[q.triggerKey] || ANY) : ANY;
      list.push({
        kind: 'npc', icon: '📖', title: q.title, desc: q.description,
        giver: npc?.name || null, portrait: npc?.portrait || null,
        ready, dungeon,
        status: ready ? `Erfüllt — kehre zu ${npc?.name?.split(' ')[0] || 'dem Auftraggeber'} zurück` : q.objectiveText
      });
    }
    for (const q of (this.player.activeQuests || [])) {
      const ready = q.status === 'ready';
      let dungeon = ANY;
      if (q.targetType === 'kill_monster') dungeon = dm.monster[q.targetId] || ANY;
      else if (q.targetType === 'collect_loot') dungeon = dm.loot[q.targetId] || ANY;
      list.push({
        kind: 'board', icon: '📋', title: q.title, desc: q.description,
        giver: null, portrait: null, ready, dungeon,
        status: ready ? 'Bereit zur Abgabe am Questbrett' : `Fortschritt: ${q.currentCount} / ${q.targetCount}`,
        reward: `💰 ${q.goldReward}  ★ ${q.xpReward} XP`
      });
    }
    return list;
  }

  /** Aktualisiert nur den Zähler-Text auf dem Quest-Log-Button. */
  _renderSidebarQuestLog() {
    const countEl = document.getElementById('quest-log-count');
    if (!countEl || !this.player) return;
    const quests = this._collectActiveQuests();
    const ready = quests.filter(q => q.ready).length;
    if (quests.length === 0) {
      countEl.textContent = 'Keine aktiven Aufträge';
    } else {
      countEl.textContent = `${quests.length} aktiv${ready ? ` · ${ready} bereit ✔` : ''}`;
    }
    // Button hervorheben wenn etwas abgabebereit ist
    const btn = document.getElementById('btn-open-quest-log');
    if (btn) btn.classList.toggle('has-ready', ready > 0);
  }

  /** Öffnet das schön präsentierte Quest-Tagebuch-Overlay (mit Filtern). */
  _showQuestLogOverlay() {
    const overlay = document.getElementById('quest-log-overlay');
    if (!overlay) return;
    this._questLogFilter = this._questLogFilter || { type: 'all', dungeon: 'all' };
    this._renderQuestLogBody();
    overlay.classList.remove('hidden');
  }

  /** Rendert Filterleiste + gefilterte Quest-Liste im Overlay. */
  _renderQuestLogBody() {
    const body = document.getElementById('quest-log-body');
    if (!body) return;
    const all = this._collectActiveQuests();
    const f = this._questLogFilter;

    // Verfügbare Dungeons für Filter-Chips (nur welche, die Quests haben)
    const dungeons = [...new Set(all.map(q => q.dungeon).filter(d => d && d !== 'Alle Dungeons'))];

    // Filterleiste
    const typeChip = (id, label) =>
      `<button class="ql-chip ${f.type === id ? 'active' : ''}" data-ftype="${id}">${label}</button>`;
    const dgChip = (id, label) =>
      `<button class="ql-chip ${f.dungeon === id ? 'active' : ''}" data-fdungeon="${id}">${label}</button>`;

    let filterBar = `<div class="ql-filter-row">
        ${typeChip('all', 'Alle')}
        ${typeChip('ready', '✔ Bereit')}
        ${typeChip('npc', '📖 Story')}
        ${typeChip('board', '📋 Aufträge')}
      </div>`;
    if (dungeons.length > 1) {
      filterBar += `<div class="ql-filter-row ql-filter-dungeons">
          ${dgChip('all', '🗺️ Alle Orte')}
          ${dungeons.map(d => dgChip(d, d.replace(/^Die /, ''))).join('')}
        </div>`;
    }

    // Filter anwenden
    let quests = all.filter(q => {
      if (f.type === 'ready' && !q.ready) return false;
      if (f.type === 'npc' && q.kind !== 'npc') return false;
      if (f.type === 'board' && q.kind !== 'board') return false;
      if (f.dungeon !== 'all' && q.dungeon !== f.dungeon && q.dungeon !== 'Alle Dungeons') return false;
      return true;
    });
    quests.sort((a, b) => (b.ready ? 1 : 0) - (a.ready ? 1 : 0));

    let listHtml;
    if (all.length === 0) {
      listHtml = `<div class="ql-empty">
        <div class="ql-empty-icon">🗺️</div>
        <p>Dein Tagebuch ist leer.</p>
        <p class="ql-empty-sub">Sprich mit Dorfbewohnern oder nimm Aufträge am Questbrett an, um Abenteuer zu beginnen.</p>
      </div>`;
    } else if (quests.length === 0) {
      listHtml = `<div class="ql-empty"><div class="ql-empty-icon">🔍</div><p>Keine Aufträge in diesem Filter.</p></div>`;
    } else {
      listHtml = quests.map(q => `
        <div class="ql-quest ${q.ready ? 'ql-ready' : ''}">
          ${q.portrait ? `<img class="ql-portrait" src="${q.portrait}" onerror="this.style.display='none'">` : `<div class="ql-portrait ql-portrait-icon">${q.icon}</div>`}
          <div class="ql-content">
            <div class="ql-title-row">
              <span class="ql-kind">${q.kind === 'npc' ? 'Story' : 'Auftrag'}</span>
              <h3>${q.title}</h3>
            </div>
            <div class="ql-meta">${q.giver ? `Auftraggeber: ${q.giver} · ` : ''}📍 ${q.dungeon}</div>
            <p class="ql-desc">${q.desc}</p>
            <div class="ql-status ${q.ready ? 'ready' : ''}">${q.ready ? '✔ ' : '🎯 '}${q.status}</div>
            ${q.reward ? `<div class="ql-reward">Belohnung: ${q.reward}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    body.innerHTML = filterBar + `<div class="ql-list">${listHtml}</div>`;

    // Filter-Chip-Events
    body.querySelectorAll('[data-ftype]').forEach(btn =>
      btn.addEventListener('click', () => { this._questLogFilter.type = btn.dataset.ftype; this._renderQuestLogBody(); }));
    body.querySelectorAll('[data-fdungeon]').forEach(btn =>
      btn.addEventListener('click', () => { this._questLogFilter.dungeon = btn.dataset.fdungeon; this._renderQuestLogBody(); }));
  }

  // --- 2. VILLAGE RENDER ---
  renderVillage() {
    this.updateUI();

    // Eventuell Questbrett-Ausrufezeichen rendern
    const questsBtn = document.querySelector('.btn-visit-quests');
    const readyQuests = this.player.activeQuests ? this.player.activeQuests.filter(q => q.status === 'ready') : [];
    if (readyQuests.length > 0) {
      questsBtn.innerText = 'Ansehen (!)';
      questsBtn.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.6)';
    } else {
      questsBtn.innerText = 'Ansehen';
      questsBtn.style.boxShadow = '';
    }

    // NPC-Bereich rendern
    this.renderVillageNpcs();
  }

  /**
   * Rendert die NPC-Leiste im Dorf mit anklickbaren Portraits
   */
  renderVillageNpcs() {
    let container = document.getElementById('village-npcs');
    if (!container) {
      // Container nach dem Village-Content einfügen
      const villageScreen = document.getElementById('screen-village');
      if (!villageScreen) return;
      container = document.createElement('div');
      container.id = 'village-npcs';
      villageScreen.appendChild(container);
    }

    const completedActs = this.player.completedActs || 0;
    const availableNpcs = Object.values(VILLAGE_NPCS).filter(npc => isNpcAvailable(npc.id, completedActs));

    // Hat ein NPC eine erfüllte Quest zum Abgeben (foundFlag gesetzt)?
    const npcHasReadyQuest = (npcId) => Object.values(NPC_QUESTS).some(q =>
      q.npcId === npcId && q.returnNode && hasFlag(this.player, q.foundFlag) && !hasFlag(this.player, q.doneFlag));

    container.innerHTML = `
      <div class="npc-section-header">
        <span class="npc-section-line"></span>
        <h3>🏘️ Dorfbewohner</h3>
        <span class="npc-section-line"></span>
      </div>
      <div class="npc-card-row">
        ${availableNpcs.map(npc => `
          <div class="npc-card ${npcHasReadyQuest(npc.id) ? 'has-quest' : ''}" data-npc="${npc.id}">
            ${npcHasReadyQuest(npc.id) ? '<span class="npc-quest-bang">❗</span>' : ''}
            <div class="npc-card-portrait">
              <img src="${npc.portrait}" alt="${npc.name}" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
              <span class="npc-card-fallback">👤</span>
            </div>
            <strong class="npc-card-name">${npc.name.split(' ')[0]}</strong>
            <div class="npc-card-title">${npc.title}</div>
            <div class="npc-card-hint">Sprechen</div>
          </div>
        `).join('')}
      </div>
      <div id="npc-dialogue-box" class="npc-dialogue-box" style="display:none;"></div>
    `;

    // Klick-Events
    container.querySelectorAll('.npc-card').forEach(card => {
      card.addEventListener('click', () => this.showNpcDialogue(card.dataset.npc));
    });
  }

  /**
   * Öffnet einen NPC-Dialog. Hat der NPC einen Konversationsbaum
   * (NPC_CONVERSATIONS), läuft der verzweigte Engine; sonst Fallback auf
   * den klassischen statischen Dialog.
   */
  showNpcDialogue(npcId) {
    const box = document.getElementById('npc-dialogue-box');
    if (!box) return;
    const npc = VILLAGE_NPCS[npcId];
    if (!npc) return;

    if (NPC_CONVERSATIONS[npcId]) {
      const entry = getConversationEntry(npcId, this.player);
      this._renderDialogueNode(npcId, entry);
    } else {
      this._renderStaticNpcDialogue(npcId);
    }
  }

  /** Verzweigter Dialog-Knoten-Renderer */
  _renderDialogueNode(npcId, nodeId) {
    const box = document.getElementById('npc-dialogue-box');
    const npc = VILLAGE_NPCS[npcId];
    const conv = NPC_CONVERSATIONS[npcId];
    if (!box || !npc || !conv) return;

    if (nodeId === 'end' || !conv[nodeId]) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const node = conv[nodeId];

    // Ruf-Anzeige
    const rep = getReputation(this.player, npcId);
    const tier = getReputationTier(rep);

    // Choices filtern nach requires
    const choices = (node.choices || []).filter(ch => this._choiceAllowed(npcId, ch));

    const text = (node.text || '').replace(/\{name\}/g, this.player.name);

    box.style.display = 'block';
    box.innerHTML = `
      <div class="npc-dialogue-panel">
        <button class="npc-dialogue-close">✕</button>
        <div class="npc-dialogue-head">
          <div class="npc-dialogue-portrait">
            <img src="${npc.portrait}" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
            <span class="npc-card-fallback">👤</span>
          </div>
          <div>
            <strong class="npc-dialogue-name">${npc.name}</strong>
            <div class="npc-dialogue-title">${npc.title}</div>
            <div class="npc-rep-badge" style="color:${tier.color};">❤ ${tier.name} (${rep > 0 ? '+' : ''}${rep})</div>
          </div>
        </div>
        <p class="npc-dialogue-text">"${text}"</p>
        <div class="npc-dialogue-choices">
          ${choices.map((ch, i) => `<button class="dialogue-choice" data-idx="${i}">${ch.text}</button>`).join('')}
        </div>
      </div>
    `;

    box.querySelector('.npc-dialogue-close').addEventListener('click', () => { box.style.display = 'none'; box.innerHTML = ''; });
    box.querySelectorAll('.dialogue-choice').forEach((btn, i) => {
      btn.addEventListener('click', () => this._selectDialogueChoice(npcId, choices[i]));
    });
  }

  /** Prüft requires einer Antwortmöglichkeit */
  _choiceAllowed(npcId, choice) {
    const r = choice.requires;
    if (!r) return true;
    if (r.minLevel && this.player.level < r.minLevel) return false;
    if (r.minRep != null && getReputation(this.player, npcId) < r.minRep) return false;
    if (r.flag && !hasFlag(this.player, r.flag)) return false;
    if (r.notFlag && hasFlag(this.player, r.notFlag)) return false;
    if (r.classKey && this.player.classKey !== r.classKey) return false;
    return true;
  }

  /** Wendet die Effekte einer Antwort an und navigiert zum Folgeknoten */
  _selectDialogueChoice(npcId, choice) {
    const e = choice.effects || {};
    const feedback = [];

    // Ruf
    if (e.rep) {
      this.player.npcReputation = this.player.npcReputation || {};
      this.player.npcReputation[npcId] = (this.player.npcReputation[npcId] || 0) + e.rep;
      feedback.push(`${e.rep > 0 ? '＋' : '－'} Ansehen ${e.rep > 0 ? '+' : ''}${e.rep}`);
    }
    // Flags
    if (e.setFlag) { this.player.storyFlags = this.player.storyFlags || {}; this.player.storyFlags[e.setFlag] = true; }
    if (e.clearFlag) { if (this.player.storyFlags) this.player.storyFlags[e.clearFlag] = false; }
    // Gold
    if (e.gold) { this.player.gold += e.gold; feedback.push(`💰 +${e.gold} Gold`); }
    // Item
    if (e.item) {
      const item = createItem(e.item);
      if (item) { this.player.inventory.push(item); feedback.push(`🎁 ${item.name}`); }
    }
    // NPC-Quest starten
    if (e.startNpcQuest && NPC_QUESTS[e.startNpcQuest]) {
      this.player.activeNpcQuests = this.player.activeNpcQuests || [];
      if (!this.player.activeNpcQuests.includes(e.startNpcQuest)) {
        this.player.activeNpcQuests.push(e.startNpcQuest);
        feedback.push(`📜 Neue Aufgabe: ${NPC_QUESTS[e.startNpcQuest].title}`);
      }
    }
    // Lore-Marker (rein kosmetisch)
    if (e.lore) feedback.push('📖 Lore enthüllt');

    // Erledigte NPC-Quests aus der aktiven Liste entfernen (doneFlag gesetzt)
    if (this.player.activeNpcQuests?.length) {
      this.player.activeNpcQuests = this.player.activeNpcQuests.filter(qid => {
        const q = NPC_QUESTS[qid];
        return q && !hasFlag(this.player, q.doneFlag);
      });
    }

    if (feedback.length) this._showDialogueFeedback(feedback.join('   '));

    this.updateUI();
    this.saveGameToLocalStorage();

    // Navigieren
    this._renderDialogueNode(npcId, choice.goto || 'end');
  }

  /**
   * Prüft NPC-Questreihen-Trigger (Boss-Kill, Dungeon-Abschluss).
   * Quests mit returnNode → setzt foundFlag (Spieler kehrt zum NPC zurück).
   * Quests ohne returnNode → wird sofort abgeschlossen (Belohnung direkt).
   * @returns {string[]} Meldungen für die UI
   */
  _checkNpcQuestTriggers(triggerType, key) {
    const messages = [];
    const active = this.player.activeNpcQuests || [];
    for (const qid of [...active]) {
      const q = NPC_QUESTS[qid];
      if (!q || q.triggerType !== triggerType) continue;
      if (q.triggerKey !== 'any' && q.triggerKey !== key) continue;
      if (hasFlag(this.player, q.doneFlag) || hasFlag(this.player, q.foundFlag)) continue;

      this.player.storyFlags = this.player.storyFlags || {};
      if (q.returnNode) {
        // Spieler muss zum NPC zurück → foundFlag setzen
        this.player.storyFlags[q.foundFlag] = true;
        const npc = VILLAGE_NPCS[q.npcId];
        messages.push(`✔ '${q.title}' erfüllt — kehre zu ${npc?.name?.split(' ')[0] || 'dem Auftraggeber'} zurück!`);
      } else {
        // Direkt abschließen
        this.player.storyFlags[q.doneFlag] = true;
        if (q.rewardGold) this.player.gold += q.rewardGold;
        if (q.rewardRep) {
          this.player.npcReputation = this.player.npcReputation || {};
          this.player.npcReputation[q.npcId] = (this.player.npcReputation[q.npcId] || 0) + q.rewardRep;
        }
        this.player.activeNpcQuests = this.player.activeNpcQuests.filter(id => id !== qid);
        messages.push(`✔ '${q.title}' abgeschlossen! +${q.rewardGold || 0} Gold, +${q.rewardRep || 0} Ansehen`);
      }
    }
    if (messages.length) this.saveGameToLocalStorage();
    return messages;
  }

  /** Kurzes Feedback-Toast für Dialog-Effekte */
  _showDialogueFeedback(text) {
    const t = document.createElement('div');
    t.className = 'dialogue-toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add('fade'); setTimeout(() => t.remove(), 500); }, 2200);
  }

  /** Klassischer statischer NPC-Dialog (Fallback für NPCs ohne Baum) */
  _renderStaticNpcDialogue(npcId) {
    const box = document.getElementById('npc-dialogue-box');
    const npc = VILLAGE_NPCS[npcId];
    const category = this.justReturnedFromDungeon ? 'afterDungeon' : 'greeting';
    const dialogue = getNpcDialogue(npcId, category);
    if (!dialogue) return;
    const hasLore = npc.dialogues.lore && npc.dialogues.lore.length > 0;
    const hasRumors = npc.dialogues.rumors && npc.dialogues.rumors.length > 0;

    box.style.display = 'block';
    box.innerHTML = `
      <div class="npc-dialogue-panel">
        <button class="npc-dialogue-close" onclick="document.getElementById('npc-dialogue-box').style.display='none'">✕</button>
        <div class="npc-dialogue-head">
          <div class="npc-dialogue-portrait">
            <img src="${npc.portrait}" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
            <span class="npc-card-fallback">👤</span>
          </div>
          <div>
            <strong class="npc-dialogue-name">${npc.name}</strong>
            <div class="npc-dialogue-title">${npc.title}</div>
          </div>
        </div>
        <p class="npc-dialogue-text">"${dialogue.text}"</p>
        <div class="npc-dialogue-actions">
          ${hasLore ? `<button class="premium-btn small" data-action="lore">📖 Erzähl mir mehr...</button>` : ''}
          ${hasRumors ? `<button class="premium-btn small" data-action="rumor">👂 Gerüchte?</button>` : ''}
          ${npc.dialogues.quest ? `<button class="premium-btn small" data-action="quest">❗ Auftrag</button>` : ''}
        </div>
        <div id="npc-sub-text" style="margin-top:0.8rem;"></div>
      </div>
    `;
    box.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const subText = document.getElementById('npc-sub-text');
        const action = btn.dataset.action;
        let text = '';
        if (action === 'lore') text = npc.dialogues.lore[Math.floor(Math.random() * npc.dialogues.lore.length)];
        else if (action === 'rumor') text = getRandomRumor();
        else if (action === 'quest') text = npc.dialogues.quest[Math.floor(Math.random() * npc.dialogues.quest.length)];
        subText.innerHTML = `<p style="color:#ccc;font-style:italic;border-top:1px solid var(--border-color);padding-top:0.5rem;margin-top:0.3rem;">"${text}"</p>`;
      });
    });
  }

  // --- 3. INN RENDER ---
  renderInn() {
    const list = document.getElementById('inn-options-list');
    const innEffect = getBuildingEffect(this.player, 'inn');
    const restDiscount = innEffect.restDiscount || 0;
    const regenBonus = innEffect.regenBonus || 0;
    const innLvl = getBuildingLevel(this.player, 'inn');

    list.innerHTML = INN_OPTIONS.map(opt => {
      const cost = Math.max(0, Math.round(opt.cost * (1 - restDiscount)));
      const discounted = cost < opt.cost;
      const effRegen = Math.min(1, opt.regen + regenBonus);
      const isAffordable = this.player.gold >= cost;
      return `
        <div class="inn-option-row">
          <div class="inn-details">
            <h4>${opt.name}</h4>
            <p>${opt.description}${regenBonus > 0 ? ` <span style="color:#7fff7f;">(+${Math.round(regenBonus*100)}% durch Gasthaus → ${Math.round(effRegen*100)}%)</span>` : ''}</p>
          </div>
          <div class="inn-buy">
            <span class="product-cost" style="margin-right: 15px;">💰 ${cost}${discounted ? ` <s style="color:var(--text-muted);font-size:0.7rem;">${opt.cost}</s>` : ''}</span>
            <button class="premium-btn small" ${isAffordable ? '' : 'disabled'} data-id="${opt.id}">Restieren</button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = INN_OPTIONS.find(o => o.id === btn.dataset.id);
        const cost = Math.max(0, Math.round(opt.cost * (1 - restDiscount)));
        const effRegen = Math.min(1, opt.regen + regenBonus);
        const res = this.player.rest(cost, effRegen);
        if (res) {
          // Auch alle Companions regenerieren
          if (this.player.party) {
            this.player.party.forEach(comp => {
              comp.currentHp = Math.min(comp.maxHp, comp.currentHp + Math.round(comp.maxHp * effRegen));
              if (comp.maxResource > 0) comp.currentResource = Math.min(comp.maxResource, comp.currentResource + Math.round(comp.maxResource * effRegen));
            });
          }
          alert(`Die gesamte Gruppe rastet und erholt sich!`);
          this.updateUI();
          this.renderInn();
        }
      });
    });
  }

  // --- 4. MARKET RENDER ---
  renderMarket() {
    const hero = this.activeHero;
    this.renderHeroSwitcher('market-hero-switcher', () => this.renderMarket());

    // BUY PRODUCT LIST
    const prodList = document.getElementById('market-products');
    prodList.innerHTML = MARKET_ITEMS.map(item => {
      const price = getMarketBuyPrice(item.cost, this.player);
      const discounted = price < item.cost;
      const isAffordable  = this.player.gold >= price;
      const isWarriorMana = hero.classKey === 'KRIEGER' && item.effectType === 'mana';
      return `
        <div class="product-card">
          <div class="product-head">
            <div class="product-icon">
              <img src="${item.icon}" alt="${item.name}" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
              <span class="product-icon-fallback">🧪</span>
            </div>
            <span class="product-title">${item.name}</span>
          </div>
          <span class="product-desc">${item.description}</span>
          <div class="product-footer">
            <span class="product-cost">💰 ${price}${discounted ? ` <s style="color:var(--text-muted);font-size:0.7rem;">${item.cost}</s>` : ''}</span>
            <button class="premium-btn small" ${(isAffordable && !isWarriorMana) ? '' : 'disabled'} data-id="${item.id}">Kaufen für ${hero.name}</button>
          </div>
        </div>
      `;
    }).join('');

    prodList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = buyMarketItem(this.activeHero, btn.dataset.id, this.player);
        if (res.error) { alert(res.error); }
        else { this.updateUI(); this.renderMarket(); }
      });
    });

    // SELL PANEL LIST
    const sellList = document.getElementById('market-sell-list');
    const sellable = hero.inventory.filter(i => i.type !== 'consumable');

    if (sellable.length === 0) {
      sellList.innerHTML = `<div class="placeholder-text" style="width:100%; text-align:center;">Kein Ausrüstung von ${hero.name} zum Verkaufen.</div>`;
    } else {
      sellList.innerHTML = sellable.map(item => {
        const price = Math.round(item.cost * 0.40) + (item.upgradeLevel * Math.round(item.cost * 0.20));
        return `
          <div class="sell-item-card">
            <div class="item-info">
              <span class="item-title">${item.name}</span>
              <span class="item-desc">Verkaufspreis: ${price} Gold</span>
            </div>
            <button class="danger-btn" style="padding: 4px 8px; font-size: 0.75rem;" data-id="${item.uniqueId}">Verkaufen</button>
          </div>
        `;
      }).join('');

      sellList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = sellInventoryItem(this.activeHero, btn.dataset.id, this.player);
          if (res.success) { this.updateUI(); this.renderMarket(); }
        });
      });
    }
  }

  // --- 5. BLACKSMITH RENDER ---
  /** Rendert das Crafting-Panel: Material-Lager + Rezepte. */
  _renderCrafting() {
    const matBar = document.getElementById('craft-materials-bar');
    const recipeGrid = document.getElementById('craft-recipes');
    if (!matBar || !recipeGrid) return;
    const mats = this.player.materials || {};

    // Material-Lager-Leiste
    const owned = Object.entries(mats).filter(([, c]) => c > 0);
    matBar.innerHTML = `<div class="craft-mat-title">📦 Dein Material-Lager</div>
      <div class="craft-mat-list">${
        owned.length
          ? owned.map(([n, c]) => `<span class="craft-mat-chip" title="${MATERIALS[n]?.desc || ''}">${MATERIALS[n]?.icon || '◆'} ${n} <b>×${c}</b></span>`).join('')
          : '<span class="craft-mat-empty">Noch keine Materialien — besiege Gegner, um Rohstoffe zu sammeln.</span>'
      }</div>`;

    // Rezepte
    recipeGrid.innerHTML = CRAFTING_RECIPES.map(r => {
      const craftable = canCraft(this.player, r);
      const missing = missingForRecipe(this.player, r);
      const matList = Object.entries(r.materials).map(([n, c]) => {
        const have = mats[n] || 0;
        const ok = have >= c;
        return `<span style="color:${ok ? '#7fdc8c' : 'var(--text-red)'}">${MATERIALS[n]?.icon || '◆'} ${n} ${have}/${c}</span>`;
      }).join(' · ');
      const outName = this._craftOutputName(r.output);
      return `
        <div class="product-card">
          <div class="product-head">
            <div class="product-icon"><span class="product-icon-fallback">${r.icon}</span></div>
            <span class="product-title">${r.name}${r.output.count > 1 ? ` ×${r.output.count}` : ''}</span>
          </div>
          <span class="product-desc">${r.desc}</span>
          <div style="font-size:0.72rem; margin:0.3rem 0; line-height:1.5;">${matList}</div>
          <div class="product-footer">
            <span class="product-cost">💰 ${r.gold}</span>
            <button class="premium-btn small ${craftable ? '' : 'disabled'}" ${craftable ? '' : 'disabled'} data-recipe="${r.id}">Herstellen</button>
          </div>
        </div>`;
    }).join('');

    recipeGrid.querySelectorAll('button[data-recipe]').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('click', () => this._craft(btn.dataset.recipe));
    });
  }

  _craftOutputName(output) {
    if (output.kind === 'material') return output.id;
    if (output.kind === 'consumable') return (MARKET_ITEMS.find(i => i.id === output.id)?.name) || output.id;
    return output.id;
  }

  /** Führt ein Crafting-Rezept aus. */
  _craft(recipeId) {
    const r = CRAFTING_RECIPES.find(x => x.id === recipeId);
    if (!r || !canCraft(this.player, r)) { alert('Voraussetzungen nicht erfüllt!'); return; }

    // Materialien + Gold abziehen
    for (const [name, count] of Object.entries(r.materials)) {
      this.player.materials[name] -= count;
    }
    this.player.gold -= r.gold;

    // Output erzeugen
    const o = r.output;
    let resultText = '';
    if (o.kind === 'material') {
      addMaterial(this.player, o.id, o.count || 1);
      resultText = `${o.count || 1}× ${o.id}`;
    } else if (o.kind === 'consumable') {
      const tpl = MARKET_ITEMS.find(i => i.id === o.id);
      for (let i = 0; i < (o.count || 1); i++) {
        if (tpl) this.player.inventory.push({ ...tpl, uniqueId: `${tpl.id}_${Date.now()}_${i}` });
      }
      resultText = `${o.count || 1}× ${tpl?.name || o.id}`;
    } else if (o.kind === 'equipment') {
      const item = createItem(o.id);
      if (item) { this.player.inventory.push(item); resultText = item.name; }
    }

    this.updateUI();
    this.saveGameToLocalStorage();
    this._renderCrafting();
    this._showDialogueFeedback(`🛠️ Hergestellt: ${resultText}`);
  }

  renderBlacksmith() {
    const hero = this.activeHero;
    this.renderHeroSwitcher('smith-hero-switcher', () => this.renderBlacksmith());

    // BUY LIST
    const smithProds = document.getElementById('smith-products');
    const items = getBlacksmithInventory(hero);

    smithProds.innerHTML = items.map(item => {
      const price = getSmithBuyPrice(item.cost, this.player);
      const discounted = price < item.cost;
      const isAffordable = this.player.gold >= price;
      let statText = '';
      if (item.damage) statText = `Schaden: ${item.damage}`;
      if (item.armor) statText = `Rüstung: ${item.armor}`;
      if (item.stats && Object.keys(item.stats).length > 0) {
        statText += ' | ' + Object.entries(item.stats).map(([k,v]) => `${k.substring(0,3)}: +${v}`).join(', ');
      }
      const icon = item.icon || 'assets/images/items/icon_sword_1h.png';
      return `
        <div class="product-card">
          <div class="product-head">
            <div class="product-icon">
              <img src="${icon}" alt="${item.name}" onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
              <span class="product-icon-fallback">⚔️</span>
            </div>
            <span class="product-title">${item.name}</span>
          </div>
          <span class="product-stats">${statText}</span>
          <div class="product-footer">
            <span class="product-cost">💰 ${price}${discounted ? ` <s style="color:var(--text-muted);font-size:0.7rem;">${item.cost}</s>` : ''}</span>
            <button class="premium-btn small" ${isAffordable ? '' : 'disabled'} data-id="${item.id}">Kaufen für ${hero.name}</button>
          </div>
        </div>
      `;
    }).join('');

    smithProds.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = buyBlacksmithItem(this.activeHero, btn.dataset.id, this.player);
        if (res.error) { alert(res.error); }
        else { this.updateUI(); this.renderBlacksmith(); }
      });
    });

    // UPGRADE LIST
    const upgradeList = document.getElementById('upgrade-items-list');
    const detailPanel = document.getElementById('upgrade-detail-panel');

    const upgradables = [];
    for (const slot in hero.equipment) {
      if (hero.equipment[slot]) upgradables.push({ ...hero.equipment[slot], isEquipped: true, slotName: slot });
    }
    hero.inventory.forEach(item => {
      if (item.type !== 'consumable') upgradables.push({ ...item, isEquipped: false });
    });

    if (upgradables.length === 0) {
      upgradeList.innerHTML = `<div class="placeholder-text">${hero.name} hat keine aufwertbaren Gegenstände.</div>`;
      detailPanel.innerHTML = `<div class="placeholder-text">Wähle einen Gegenstand aus.</div>`;
    } else {
      upgradeList.innerHTML = upgradables.map(item => `
        <div class="item-card ${item.isEquipped ? 'heavy' : 'cloth'}" style="margin-bottom: 5px;" data-id="${item.uniqueId}">
          <div class="item-info">
            <span class="item-title">${item.name} ${item.isEquipped ? '<span style="color:var(--text-gold); font-size:0.65rem;">(Equipped)</span>' : ''}</span>
            <span class="item-desc">Upgrade-Stufe: +${item.upgradeLevel}</span>
          </div>
        </div>
      `).join('');

      upgradeList.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
          const item = upgradables.find(i => i.uniqueId === card.dataset.id);
          const upgradeDiscount = getBuildingEffect(this.player, 'blacksmith').upgradeDiscount || 0;
          const cost = getUpgradeCost(item, upgradeDiscount);
          const isAffordable = this.player.gold >= cost;
          const upgradedDmg = item.damage ? Math.round(item.damage * 1.25) : 0;
          const upgradedArm = item.armor  ? Math.round(item.armor  * 1.25) : 0;

          detailPanel.innerHTML = `
            <div class="upgrade-detail-view">
              <div class="upgrade-title-line">${item.name} Aufwerten</div>
              <div class="upgrade-comparison">
                <div class="upgrade-col">
                  <strong>Aktuell</strong>
                  ${item.damage ? `<span>Schaden: ${item.damage}</span>` : ''}
                  ${item.armor  ? `<span>Rüstung: ${item.armor}</span>`  : ''}
                  ${Object.entries(item.stats).map(([k,v]) => `<span>${k}: +${v}</span>`).join('')}
                </div>
                <div class="arrow-sep">➔</div>
                <div class="upgrade-col right">
                  <strong>Verbessert (+${item.upgradeLevel + 1})</strong>
                  ${item.damage ? `<span>Schaden: ${upgradedDmg}</span>` : ''}
                  ${item.armor  ? `<span>Rüstung: ${upgradedArm}</span>`  : ''}
                  ${Object.entries(item.stats).map(([k,v]) => `<span>${k}: +${Math.round(v * 1.25 + 1)}</span>`).join('')}
                </div>
              </div>
              <div class="product-footer">
                <span class="product-cost">Kosten: ${cost} Gold</span>
                <button class="premium-btn" ${isAffordable ? '' : 'disabled'} id="btn-smith-upgrade-action">Upgrade durchführen</button>
              </div>
            </div>
          `;

          document.getElementById('btn-smith-upgrade-action').addEventListener('click', () => {
            const res = upgradeItem(this.activeHero, item.uniqueId, upgradeDiscount);
            if (res.error) { alert(res.error); }
            else { alert('Gegenstand erfolgreich aufgewertet!'); this.updateUI(); this.renderBlacksmith(); }
          });
        });
      });
    }
  }

  /**
   * Rendert die Karten der aktiven NPC-Questreihen (Story-Aufträge) für das
   * Quest-Tagebuch. Zeigt Auftraggeber, Ziel und Status (in Arbeit / bereit).
   * @returns {string} HTML (leer wenn keine aktiven NPC-Quests)
   */
  _renderNpcQuestCards() {
    const active = this.player.activeNpcQuests || [];
    if (!active.length) return '';
    return active.map(qid => {
      const q = NPC_QUESTS[qid];
      if (!q || hasFlag(this.player, q.doneFlag)) return '';
      const npc = VILLAGE_NPCS[q.npcId];
      const giver = npc ? npc.name : 'Unbekannt';
      const ready = q.returnNode && hasFlag(this.player, q.foundFlag);
      const statusLine = ready
        ? `✔ Erfüllt — kehre zu ${giver.split(' ')[0]} zurück`
        : `🎯 ${q.objectiveText}`;
      return `
        <div class="quest-card npc-quest-card ${ready ? 'quest-ready' : ''}">
          <div class="npc-quest-giver">
            <img src="${npc?.portrait || ''}" onerror="this.style.display='none'">
            <span>${giver}</span>
          </div>
          <h4>${q.title}</h4>
          <p>${q.description}</p>
          <div class="quest-progress-txt ${ready ? 'ready' : ''}" style="margin-top:5px;">${statusLine}</div>
        </div>
      `;
    }).join('');
  }

  // --- 6. QUEST BOARD RENDER ---
  renderQuestBoard() {
    const availList = document.getElementById('quests-available-list');
    const activeList = document.getElementById('quests-active-list');

    const available = getAvailableQuests(this.player);
    const active = this.player.activeQuests || [];

    // Verfügbare Quests rendern
    if (available.length === 0) {
      availList.innerHTML = `<div class="placeholder-text" style="width:100%; text-align:center;">Derzeit keine neuen Aufträge vorhanden.</div>`;
    } else {
      availList.innerHTML = available.map(quest => `
        <div class="quest-card">
          <span class="quest-difficulty ${quest.difficulty.toLowerCase().split(' ')[0]}">${quest.difficulty}</span>
          <h4>${quest.title}</h4>
          <p>${quest.description}</p>
          <div class="quest-rewards">💰 ${quest.goldReward} Gold &nbsp;★ ${quest.xpReward} XP</div>
          <button class="premium-btn small mt-1" data-id="${quest.id}">Annehmen</button>
        </div>
      `).join('');

      availList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = acceptQuest(this.player, btn.dataset.id);
          if (res.success) {
            this.renderQuestBoard();
            this.saveGameToLocalStorage();
          }
        });
      });
    }

    // ── STORY-AUFTRÄGE (NPC-Questreihen) ────────────────────────────────────
    const npcQuestHtml = this._renderNpcQuestCards();

    // Aktive Quests rendern
    const hasRegular = active.length > 0;
    if (!npcQuestHtml && !hasRegular) {
      activeList.innerHTML = `<div class="placeholder-text" style="width:100%; text-align:center;">Keine aktiven Aufträge. Sprich mit Dorfbewohnern oder nimm Aufträge am Brett an!</div>`;
    } else {
      let html = '';
      if (npcQuestHtml) {
        html += `<div class="journal-section-label" style="grid-column:1/-1;">📖 Story-Aufträge</div>${npcQuestHtml}`;
      }
      if (hasRegular) {
        html += `<div class="journal-section-label" style="grid-column:1/-1;">📋 Aufträge vom Brett</div>`;
        html += active.map(quest => {
          const isReady = quest.status === 'ready';
          return `
            <div class="quest-card">
              <h4>${quest.title}</h4>
              <p>${quest.description}</p>
              <div class="quest-rewards">Belohnung: 💰 ${quest.goldReward}g / ★ ${quest.xpReward}xp</div>
              <div class="quest-progress-txt ${isReady ? 'ready' : ''}" style="margin-top: 5px;">
                Fortschritt: ${quest.currentCount} / ${quest.targetCount}
              </div>
              ${isReady ? `<button class="premium-btn small mt-1 glowing" data-id="${quest.id}">Abgeben</button>` : ''}
            </div>
          `;
        }).join('');
      }
      activeList.innerHTML = html;

      activeList.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = turnInQuest(this.player, btn.dataset.id);
          if (res.success) {
            alert(`Quest abgegeben! Du erhältst ${res.goldReward} Gold und ${res.xpReward} XP.`);
            if (res.leveledUp) {
              setTimeout(() => this._showLevelUpCelebration(), 200);
            }
            this.updateUI();
            this.renderQuestBoard();
            this.saveGameToLocalStorage();
          }
        });
      });
    }
  }

  // --- 7. DUNGEON SELECT RENDER ---
  renderDungeonSelect() {
    const list = document.getElementById('dungeons-list');
    const completedActs = this.player.completedActs || 0;
    list.innerHTML = Object.values(DUNGEONS).map(dg => {
      const levelOk = this.player.level >= dg.minLevel;
      const actOk = !dg.requiresAct || completedActs >= dg.requiresAct;
      const allowed = levelOk && actOk;
      const bg = dg.background || '';
      // Lock-Grund bestimmen
      let lockLabel = '';
      if (!actOk) lockLabel = '🔒 Story';
      else if (!levelOk) lockLabel = `🔒 Stufe ${dg.minLevel}`;
      return `
        <div class="dungeon-card ${allowed ? '' : 'locked'} ${dg.isFinale ? 'finale-card' : ''}">
          <div class="dungeon-card-thumb" style="${bg ? `background-image:linear-gradient(to top, rgba(14,10,14,0.95) 5%, rgba(14,10,14,0.25) 100%), url('${bg}');` : ''}">
            ${lockLabel ? `<div class="dungeon-lock">${lockLabel}</div>` : ''}
            ${dg.isFinale && allowed ? `<div class="dungeon-finale-badge">⚔ FINALE</div>` : ''}
            <h3>${dg.name}</h3>
          </div>
          <div class="dungeon-card-body">
            <span class="dungeon-min-lvl">⚔ Erforderte Stufe: ${dg.minLevel}${dg.requiresAct ? ` · 📖 Akt ${dg.requiresAct} abgeschlossen` : ''}</span>
            <p>${dg.description}</p>
            <button class="premium-btn mt-1" ${allowed ? '' : 'disabled'} data-id="${dg.id}">${allowed ? 'Dungeon Betreten' : (lockLabel.includes('Story') ? 'Story-gesperrt' : 'Gesperrt')}</button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this._showDungeonModifierSelect(btn.dataset.id);
      });
    });
  }

  /** Kosten für einen Skill-Reset (hoch + skaliert mit Level & Anzahl bisheriger Resets). */
  _respecCost(char) {
    return Math.round(250 * char.level * ((char.respecCount || 0) + 1));
  }

  /** Setzt alle Talente eines Charakters zurück und erstattet die Punkte. */
  _respecCharacter(char) {
    const spent = Object.values(char.talents || {}).reduce((s, l) => s + l, 0);
    char.skillPoints = (char.skillPoints || 0) + spent;
    char.talents = {};
    char.passiveEffects = {};
    char.respecCount = (char.respecCount || 0) + 1;
    if (char.updateActiveSpec) char.updateActiveSpec(TALENT_TREES);
    char.resetStats();
    // HP/Mana nicht über Max lassen
    char.currentHp = Math.min(char.currentHp, char.maxHp);
    if (char.maxResource > 0) char.currentResource = Math.min(char.currentResource, char.maxResource);
  }

  /** Ausbildungshalle: Übersicht aller Helden mit Reset-Option. */
  _showTrainingHall() {
    const overlay = document.createElement('div');
    overlay.className = 'townhall-overlay';

    const render = () => {
      const heroes = [this.player, ...(this.player.party || [])];
      const cards = heroes.map((h, idx) => {
        const cls = CLASSES[h.classKey];
        const spent = Object.values(h.talents || {}).reduce((s, l) => s + l, 0);
        const cost = this._respecCost(h);
        const canAfford = this.player.gold >= cost;
        const nothingToReset = spent === 0;
        return `
          <div class="townhall-card">
            <div class="th-icon">${h === this.player ? '⚔️' : '🛡️'}</div>
            <div class="th-body">
              <div class="th-name">${h.name} <span class="th-level">Lvl ${h.level} ${cls?.name || h.classKey}</span></div>
              <div class="th-desc">Verteilte Talentpunkte: <strong>${spent}</strong> · Offen: ${h.skillPoints || 0} · Resets bisher: ${h.respecCount || 0}</div>
              ${nothingToReset
                ? `<div class="th-max">Keine Punkte zum Zurücksetzen.</div>`
                : `<button class="premium-btn small th-upgrade-btn ${canAfford ? '' : 'disabled'}" data-idx="${idx}" ${canAfford ? '' : 'disabled'}>
                     ♻ Zurücksetzen — 💰 ${cost}
                   </button>
                   ${!canAfford ? `<div class="th-desc" style="color:var(--text-red);">Nicht genug Gold.</div>` : ''}`
              }
            </div>
          </div>
        `;
      }).join('');

      overlay.innerHTML = `
        <div class="townhall-panel">
          <button class="townhall-close">✕</button>
          <div class="townhall-header">
            <h2>🎖️ Ausbildungshalle</h2>
            <div class="townhall-gold">💰 ${this.player.gold} Gold</div>
          </div>
          <p class="townhall-sub">Der alte Waffenmeister setzt gegen eine saftige Gebühr die Talente zurück. Die Kosten steigen mit Level und jeder weiteren Umverteilung — überleg es dir gut.</p>
          <div class="townhall-grid">${cards}</div>
        </div>
      `;

      overlay.querySelector('.townhall-close').addEventListener('click', () => overlay.remove());
      overlay.querySelectorAll('.th-upgrade-btn').forEach(btn => {
        if (btn.disabled) return;
        btn.addEventListener('click', () => {
          const hero = heroes[parseInt(btn.dataset.idx)];
          const cost = this._respecCost(hero);
          if (this.player.gold < cost) { alert('Nicht genug Gold!'); return; }
          if (!confirm(`${hero.name}: Alle Talentpunkte für ${cost} Gold zurücksetzen?`)) return;
          this.player.gold -= cost;
          this._respecCharacter(hero);
          this.updateUI();
          this.saveGameToLocalStorage();
          render();
        });
      });
    };

    render();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  /** Hardcore-Tod: Spielstand löschen + endgültiger Game-Over-Bildschirm. */
  _showHardcoreDeath() {
    const heroName = this.player?.name || 'Held';
    const level = this.player?.level || 1;
    // Spielstand unwiderruflich löschen
    if (this.currentSlot) {
      localStorage.removeItem(`dungeon_save_slot_${this.currentSlot}`);
      const last = localStorage.getItem('dungeon_last_slot');
      if (last && parseInt(last) === this.currentSlot) localStorage.removeItem('dungeon_last_slot');
    }

    const overlay = document.createElement('div');
    overlay.className = 'hardcore-death-overlay';
    overlay.innerHTML = `
      <div class="hardcore-death-panel">
        <div class="hcd-skull">☠️</div>
        <h1 class="hcd-title">DU BIST GEFALLEN</h1>
        <p class="hcd-name">${heroName} · Stufe ${level}</p>
        <p class="hcd-text">Im Hardcore-Modus gibt es keine Wiederkehr. Dein Spielstand wurde gelöscht — doch deine Taten werden in den Hallen von Grauenfels weitererzählt.</p>
        <button class="premium-btn large hcd-btn" id="hcd-to-menu">Zurück zum Hauptmenü</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#hcd-to-menu').addEventListener('click', () => {
      overlay.remove();
      this.player = null;
      this.dungeonRun = null;
      this.combat = null;
      this.currentSlot = null;
      this.updateMainMenuButtons();
      this.showScreen('screen-main-menu');
    });
  }

  _showTownHall() {
    // sicherstellen dass buildings existiert (alte Saves)
    this.player.buildings = this.player.buildings || { inn: 1, market: 1, blacksmith: 1 };

    const overlay = document.createElement('div');
    overlay.className = 'townhall-overlay';

    const render = () => {
      const cards = Object.values(BUILDINGS).map(def => {
        const lvl = getBuildingLevel(this.player, def.id);
        const isMax = lvl >= def.maxLevel;
        const cost = isMax ? 0 : getBuildingUpgradeCost(lvl);
        const canAfford = this.player.gold >= cost;
        const nextBenefit = isMax ? '' : def.benefitText(lvl + 1);
        // Stufen-Pips
        const pips = Array.from({ length: def.maxLevel }, (_, i) =>
          `<span class="th-pip ${i < lvl ? 'filled' : ''}"></span>`).join('');
        return `
          <div class="townhall-card">
            <div class="th-icon">${def.icon}</div>
            <div class="th-body">
              <div class="th-name">${def.name} <span class="th-level">Stufe ${lvl}/${def.maxLevel}</span></div>
              <div class="th-pips">${pips}</div>
              <div class="th-desc">${def.desc}</div>
              <div class="th-current">Aktuell: <span>${def.benefitText(lvl)}</span></div>
              ${isMax
                ? `<div class="th-max">★ Maximale Stufe erreicht</div>`
                : `<div class="th-next">Nächste Stufe: <span>${nextBenefit}</span></div>
                   <button class="premium-btn small th-upgrade-btn ${canAfford ? '' : 'disabled'}" data-id="${def.id}" ${canAfford ? '' : 'disabled'}>
                     ⬆ Aufwerten — 💰 ${cost}
                   </button>`
              }
            </div>
          </div>
        `;
      }).join('');

      overlay.innerHTML = `
        <div class="townhall-panel">
          <button class="townhall-close">✕</button>
          <div class="townhall-header">
            <h2>🏛️ Dorfverwaltung</h2>
            <div class="townhall-gold">💰 ${this.player.gold} Gold</div>
          </div>
          <p class="townhall-sub">Investiere dein Gold in das Dorf — die Boni gelten dauerhaft für alle Helden.</p>
          <div class="townhall-grid">${cards}</div>
        </div>
      `;

      overlay.querySelector('.townhall-close').addEventListener('click', () => overlay.remove());
      overlay.querySelectorAll('.th-upgrade-btn').forEach(btn => {
        if (btn.disabled) return;
        btn.addEventListener('click', () => {
          const res = upgradeBuilding(this.player, btn.dataset.id);
          if (res.error) { alert(res.error); return; }
          this.updateUI();
          this.saveGameToLocalStorage();
          render(); // Overlay neu aufbauen mit aktualisierten Werten
        });
      });
    };

    render();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  _showDungeonModifierSelect(dungeonId) {
    const DUNGEON_MODIFIERS = [
      { id: 'none', name: 'Kein Modifikator', desc: 'Standard-Dungeon ohne Veränderungen.', icon: '🏰', risk: 0, rewardMult: 1.0, enemyMult: 1.0 },
      { id: 'fortified', name: 'Verstärkt', desc: 'Gegner haben +30% HP. Dafür +25% mehr Gold & XP.', icon: '🛡️', risk: 1, rewardMult: 1.25, enemyMult: 1.3 },
      { id: 'frenzied', name: 'Rasend', desc: 'Gegner dealen +40% Schaden. Dafür +35% mehr Loot-Glück.', icon: '⚡', risk: 2, rewardMult: 1.35, enemyMult: 1.0, damageMult: 1.4 },
      { id: 'cursed', name: 'Verflucht', desc: 'HP-Regeneration halbiert. Gegner +20% stärker. Dafür doppelte Rarity-Chancen.', icon: '💀', risk: 3, rewardMult: 1.5, enemyMult: 1.2, damageMult: 1.2, healReduction: 0.5 },
      { id: 'mythic', name: 'Mythisch', desc: 'Gegner +50% HP & +30% Schaden. Dafür +75% XP/Gold und garantiert Rare+ Loot.', icon: '🔥', risk: 4, rewardMult: 1.75, enemyMult: 1.5, damageMult: 1.3 }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'modifier-select-overlay';
    overlay.innerHTML = `
      <div class="modifier-select-content">
        <h2 style="color: var(--text-gold); margin-bottom: 1rem;">⚙️ Dungeon-Modifikator wählen</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Wähle einen Modifikator für erhöhte Herausforderung und bessere Belohnungen.</p>
        <div class="modifier-grid">
          ${DUNGEON_MODIFIERS.map(mod => `
            <div class="modifier-card risk-${mod.risk}" data-mod-id="${mod.id}">
              <div class="modifier-icon">${mod.icon}</div>
              <div class="modifier-name">${mod.name}</div>
              <div class="modifier-desc">${mod.desc}</div>
              <div class="modifier-risk">${'⚠️'.repeat(mod.risk) || '—'}</div>
            </div>
          `).join('')}
        </div>
        <button class="btn-secondary mt-1" id="modifier-cancel">Abbrechen</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#modifier-cancel').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('.modifier-card').forEach(card => {
      card.addEventListener('click', () => {
        const mod = DUNGEON_MODIFIERS.find(m => m.id === card.dataset.modId);
        overlay.remove();
        this.activeDungeonModifier = mod;
        this.dungeonRun = new DungeonRun(this.player, dungeonId);
        this.dungeonRun.modifier = mod; // Modifier an den Run hängen
        this.showScreen('screen-dungeon-crawler');
      });
    });
  }

  // --- 8. DUNGEON CRAWLER HUB RENDER ---
  renderDungeonCrawler() {
    if (!this.dungeonRun) return;
    const dr = this.dungeonRun;

    // Header
    document.getElementById('dungeon-run-name').innerText =
      `${dr.dungeonMeta.name} — ${dr.floorLabel}`;

    // ── Grid-Karte ──────────────────────────────────────────────────────────────
    const gridEl = document.getElementById('dungeon-grid-map');
    if (gridEl) {
      const map  = dr.getVisibleMap();
      const s    = dr.gridSize;
      const px   = dr.playerPos;
      const cell = s <= 6 ? 34 : s <= 7 ? 30 : 26;
      const gap  = 8; // Lücke zwischen Räumen — hier liegen die Korridor-Verbinder
      gridEl.style.gridTemplateColumns = `repeat(${s}, ${cell}px)`;
      gridEl.style.gap = `${gap}px`;

      const adjExplored = (nx, ny) => nx>=0&&nx<s&&ny>=0&&ny<s&&map[ny][nx].explored;

      let html = '';
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const room     = map[y][x];
          const isPlayer = px.x === x && px.y === y;
          const exits    = room.exits || {};
          let bg = 'rgba(10,8,15,0.9)', icon = '', opacity = '0.3';

          if (room.explored) {
            opacity = '1';
            // Aktueller Raum vs. bereits besucht
            if (isPlayer) {
              bg = 'linear-gradient(135deg, #6a5a2a, #4a3a18)';
            } else if (room.resolved) {
              bg = 'rgba(35,30,45,0.8)'; // Bereits erledigt — dunkler
            } else {
              bg = 'rgba(50,45,60,0.9)'; // Erkundet aber nicht erledigt
            }

            if      (room.type === 'start')  icon = '🚪';
            else if (room.type === 'stairs') icon = room.resolved ? '🪜' : '🔽';
            else if (room.type === 'combat') icon = room.resolved ? '💀' : '👹';
            else if (room.type === 'boss')   icon = room.resolved ? '👑' : '👺';
            else if (room.type === 'chest')  icon = room.resolved ? '✔'  : '📦';
            else if (room.type === 'trap')   icon = room.resolved ? '✔'  : '⚠️';
            else if (room.type === 'altar')  icon = room.resolved ? '✔'  : '🛕';
            else if (room.type === 'empty')  icon = '';
          }

          // ── Korridor-Verbinder (echte begehbare Wege) ─────────────────────
          // Nur EAST + SOUTH zeichnen — die Verbinder reichen jeweils in die
          // Lücke zum Nachbarn (Exits sind symmetrisch, also genügt eine Seite).
          // Heller Verbinder = beide Räume erkundet (gegangener/sichtbarer Weg)
          // Gedimmter Verbinder = führt zu noch unerkundetem Raum (Hinweis)
          let connectors = '';
          const corridorColor = (neighborExplored) =>
            neighborExplored ? 'rgba(212,175,55,0.95)' : 'rgba(150,120,50,0.4)';
          const thick = Math.max(5, Math.round(cell * 0.22));

          // Nur Korridore von erkundeten Räumen zeigen
          if (room.explored) {
            if (exits.east && x + 1 < s) {
              const ne = adjExplored(x + 1, y);
              connectors += `<span style="position:absolute;right:-${gap + 1}px;top:50%;transform:translateY(-50%);` +
                `width:${gap + 2}px;height:${thick}px;background:${corridorColor(ne)};border-radius:2px;z-index:1;"></span>`;
            }
            if (exits.south && y + 1 < s) {
              const ns = adjExplored(x, y + 1);
              connectors += `<span style="position:absolute;bottom:-${gap + 1}px;left:50%;transform:translateX(-50%);` +
                `height:${gap + 2}px;width:${thick}px;background:${corridorColor(ns)};border-radius:2px;z-index:1;"></span>`;
            }
          }

          let style = `width:${cell}px;height:${cell}px;background:${bg};opacity:${opacity};` +
            `border:1.5px solid ${room.explored ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.05)'};` +
            `border-radius:6px;display:flex;align-items:center;justify-content:center;` +
            `font-size:${cell <= 30 ? '0.7rem' : '0.9rem'};box-sizing:border-box;` +
            `position:relative;transition:all 0.3s ease;`;
          if (isPlayer) style += 'border-color:var(--border-gold);box-shadow:0 0 12px rgba(212,175,55,0.6);';

          // Spieler-Marker: pulsierender Punkt statt nur Icon
          const content = isPlayer
            ? `<span class="dungeon-player-marker">${icon||'🧝'}</span>`
            : icon;

          html += `<div class="dungeon-cell${isPlayer ? ' is-player' : ''}${room.explored ? ' explored' : ''}" style="${style}">${connectors}${content}</div>`;
        }
      }
      gridEl.innerHTML = html;
    }

    // ── Bewegungs-Buttons ───────────────────────────────────────────────────────
    const inCombat = dr.activeRoom?.type === 'combat' && !dr.activeRoom.resolved;
    const exits    = dr.map[dr.playerPos.y][dr.playerPos.x].exits || {};

    [['btn-move-north','north',0,-1],['btn-move-south','south',0,1],
     ['btn-move-east','east',1,0],['btn-move-west','west',-1,0]].forEach(([id,dir,dx,dy]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const ok = !!exits[dir] && !inCombat;
      btn.disabled = !ok;
      btn.style.opacity = ok ? '1' : '0.25';
      btn.onclick = ok ? () => { if (dr.move(dx, dy)) this.renderDungeonCrawler(); } : null;
    });

    // ── Raum-Info ───────────────────────────────────────────────────────────────
    const room = dr.activeRoom;
    const TYPE_LABELS = {
      combat:'⚔️ Kampfraum', boss:'💀 Boss-Kammer', chest:'📦 Truhe',
      trap:'⚠️ Falle', altar:'🛕 Altar', stairs:'🔽 Treppe nach unten',
      start:'🚪 Eingang', empty:'🌑 Leerer Raum'
    };
    document.getElementById('dungeon-room-title').innerText =
      `${room.name}  ·  ${TYPE_LABELS[room.type] || room.type}`;

    const exitLabels = [];
    if (exits.north) exitLabels.push('↑ N'); if (exits.south) exitLabels.push('↓ S');
    if (exits.west)  exitLabels.push('← W'); if (exits.east)  exitLabels.push('→ O');
    const exitLine = exitLabels.length ? `\n\n🚶 Ausgänge: ${exitLabels.join('  ·  ')}` : '\n\n🧱 Sackgasse.';
    document.getElementById('dungeon-room-desc').innerText = room.description + exitLine;

    // ── Companion-Kommentar & Lore-Fragment ─────────────────────────────────
    this._renderDungeonAtmosphere(room);

    const visual = document.getElementById('dungeon-room-visual');
    const ICONS = { combat:'👹', boss:'💀', chest:'📦', trap:'⚠️', altar:'🛕', stairs:'🔽', start:'🚪', empty:'🌑' };
    const emoji = (room.type === 'combat' && room.resolved) ? '💀' :
                  (room.type === 'boss'   && room.resolved) ? '👑' :
                  ICONS[room.type] || '🌑';
    // Raum-Szenen-Bild ermitteln (mit Emoji-Fallback). Leere Räume rotieren über 3 Varianten.
    let roomImg = '';
    if (room.type === 'empty') {
      const variant = ((room.x || 0) + (room.y || 0)) % 3 + 1; // stabil pro Raum
      roomImg = `assets/images/rooms/room_empty_${variant}.png`;
    } else if (['chest','trap','altar','stairs'].includes(room.type)) {
      roomImg = `assets/images/rooms/room_${room.type}.png`;
    } else if (room.type === 'combat' && !room.resolved) {
      roomImg = this.dungeonRun?.dungeonMeta?.background || ''; // Dungeon-Hintergrund für Kämpfe
    }
    if (roomImg) {
      visual.innerHTML = `<img src="${roomImg}" alt="" class="room-scene-img" onerror="this.parentElement.classList.remove('has-img');this.replaceWith(document.createTextNode('${emoji}'));"><span class="room-scene-emoji">${emoji}</span>`;
      visual.classList.add('has-img');
    } else {
      visual.classList.remove('has-img');
      visual.innerText = emoji;
    }

    // ── Aktions-Bereich ─────────────────────────────────────────────────────────
    const actionDiv   = document.getElementById('dungeon-action-buttons');
    const logDiv      = document.getElementById('dungeon-event-feedback');
    const logsContent = document.getElementById('dungeon-event-logs');
    logDiv.classList.add('hidden');
    actionDiv.innerHTML = '';

    const addBtn = (label, cls, onClick, extraStyle='') => {
      const b = document.createElement('button');
      b.className = cls; b.innerText = label; b.style.cssText = extraStyle;
      b.onclick = onClick; actionDiv.appendChild(b);
    };

    // Aufstieg / Dungeon verlassen — immer zeigen wenn nicht im Kampf
    if (!inCombat) {
      const isStart = room.type === 'start';
      const label   = dr.currentFloorIdx === 0 ? '🚪 Dungeon verlassen' : '⬆ Etage aufsteigen';
      addBtn(label, 'premium-btn', async () => {
        const result = dr.ascend();
        if (result === 'exit') {
          // NPC-Questreihen: Dungeon-Abschluss-Trigger (z.B. Maras Lieferung)
          const npcMsgs = this._checkNpcQuestTriggers('dungeonClear', 'any');
          this.dungeonRun = null;
          this.justReturnedFromDungeon = true;
          setTimeout(() => { this.justReturnedFromDungeon = false; }, 60000); // 1 Min
          this.showScreen('screen-dungeon-select');
          if (npcMsgs.length) setTimeout(() => alert(npcMsgs.join('\n')), 300);
        } else if (result === 'ambush') {
          // Hinterhalt!
          const ambush = dr.pendingAmbush;
          dr.pendingAmbush = null;
          alert('⚔️ Hinterhalt! Gegner blockieren den Rückweg!');
          const levelBonus = dr.currentFloor?.enemyLevelBonus || 0;
          this.combat = new Combat(this.player, ambush.enemyKeys, this.player.level + levelBonus);
          this._applyDungeonModifier(this.combat);
          this.selectedTargetId = null;
          this.combat.startCombat();
          this.showScreen('screen-combat');
          const first = this.combat.turnQueue[this.combat.currentTurnIndex];
          if (!(first?.type === 'hero' && first?.entity === this.player) && !this.combat.isOver) {
            this._setNpcTurnLock(true); await this._runNpcAnimLoop();
            this._setNpcTurnLock(false); this.renderCombat();
          }
        } else {
          this.renderDungeonCrawler();
        }
      });
    }

    // Kampf- und Boss-Räume
    if ((room.type === 'combat' || room.type === 'boss') && !room.resolved) {
      const isBoss = room.type === 'boss';
      addBtn(isBoss ? '💀 Boss herausfordern!' : '⚔️ Kampf beginnen!', 'premium-btn glowing', async () => {
        const levelBonus = dr.currentFloor?.enemyLevelBonus || 0;

        // Boss-Intro Overlay
        if (isBoss) {
          await this._showBossIntro(room);
        }

        this.combat = new Combat(this.player, room.enemyKeys, this.player.level + levelBonus);
        this._applyDungeonModifier(this.combat);
        this.selectedTargetId = null; this.combat.startCombat();
        this.showScreen('screen-combat');
        const first = this.combat.turnQueue[this.combat.currentTurnIndex];
        if (!(first?.type === 'hero' && first?.entity === this.player) && !this.combat.isOver) {
          this._setNpcTurnLock(true); await this._runNpcAnimLoop();
          this._setNpcTurnLock(false); this.renderCombat();
        }
      });
    } else if ((room.type === 'combat' || room.type === 'boss') && room.resolved) {
      // WICHTIG: appendChild statt innerHTML+= — innerHTML+= würde die onclick-Handler
      // aller zuvor per addBtn() erzeugten Buttons (z.B. "Dungeon verlassen") zerstören!
      const note = document.createElement('div');
      note.style.cssText = 'color:var(--text-muted); font-size:0.85rem;';
      note.innerText = 'Gegner besiegt.';
      actionDiv.appendChild(note);
    }

    // Treppe nach unten
    if (room.type === 'stairs') {
      addBtn('⬇ Tiefer hinabsteigen', 'premium-btn', () => {
        if (dr.descend()) this.renderDungeonCrawler();
      }, 'background:linear-gradient(135deg,hsl(220,70%,30%),hsl(220,80%,20%));border-color:hsl(220,60%,50%)');
    }

    // Truhe
    if (room.type === 'chest' && !room.resolved) {
      addBtn('📦 Truhe öffnen', 'premium-btn', () => {
        dr.resolveChest(); this.updateUI(); this.renderDungeonCrawler();
      });
    }
    if (room.type === 'chest' && room.resolved && room.logs?.length) {
      logDiv.classList.remove('hidden');
      logsContent.innerHTML = room.logs.map(l => `<div>${l}</div>`).join('');
    }

    // Falle
    if (room.type === 'trap' && !room.resolved) {
      addBtn('⚠️ Weiter durch den Korridor', 'premium-btn', () => {
        dr.resolveTrap(); this.updateUI(); this.renderDungeonCrawler();
      }, 'border-color:hsl(40,80%,50%);');
    }
    if (room.type === 'trap' && room.resolved && room.logs?.length) {
      logDiv.classList.remove('hidden');
      logsContent.innerHTML = room.logs.map(l => `<div>${l}</div>`).join('');
      if (dr.isPlayerDead) {
        addBtn('💀 Du bist gefallen...', 'danger-btn', () => {
          this.showCombatResultOverlay(false, 'Du erlagst den Verletzungen einer Falle.');
        });
      }
    }

    // Altar
    if (room.type === 'altar' && !room.resolved) {
      addBtn('🙏 Am Altar beten (D20)', 'premium-btn', () => {
        dr.resolveAltar('beten'); this.updateUI(); this.renderDungeonCrawler();
      });
      const cost = 15 + dr.currentFloorIdx * 5;
      addBtn(`🩸 Blutopfer (−${cost} HP)`, 'premium-btn', () => {
        dr.resolveAltar('blutopfer'); this.updateUI(); this.renderDungeonCrawler();
      }, 'background:linear-gradient(135deg,hsl(355,75%,40%),hsl(355,90%,20%));border-color:hsl(355,80%,50%);');
      addBtn('Ignorieren', 'premium-btn', () => {
        dr.resolveAltar('ignorieren'); this.renderDungeonCrawler();
      }, 'background:#444;border-color:#555;');
    }
    if (room.type === 'altar' && room.resolved && room.logs?.length) {
      logDiv.classList.remove('hidden');
      logsContent.innerHTML = room.logs.map(l => `<div>${l}</div>`).join('');
    }

    // Lager aufschlagen (in leeren Räumen)
    if (room.type === 'empty' && !inCombat) {
      const hasRation = this.player.inventory.some(i => i.id === 'ration');
      addBtn(`⛺ Lager aufschlagen ${hasRation ? '(1 Ration)' : '(keine Ration!)'}`,
        'premium-btn', () => {
          const res = dr.campInEmptyRoom();
          if (res.error) { alert(res.error); return; }
          // Campfire Story (40% Chance)
          let story = null, teller = null;
          if (Math.random() < 0.40 && this.player.party?.length > 0) {
            teller = this.player.party[Math.floor(Math.random() * this.player.party.length)];
            story = getCampfireStory(teller.classKey);
          }
          this._showCampfireScene(res.log, teller, story);
          this.updateUI(); this.renderDungeonCrawler();
        }, hasRation ? '' : 'opacity:0.5; cursor:not-allowed;'
      );
      if (!hasRation) actionDiv.querySelector('button:last-child').disabled = true;
    }
  }

  // ─── Boss-Intro Splash Screen ──────────────────────────────────────────────
  _showBossIntro(room) {
    return new Promise(resolve => {
      const bossKey = room.enemyKeys?.[0] || '';
      // Boss-Lore-ID Mapping (ENEMY_TEMPLATES key → story.js bossLore key)
      const BOSS_LORE_MAP = {
        'BOSS_SPIDER': 'boss_spider_queen',
        'BOSS_GOBLIN': 'boss_goblin_king',
        'BOSS_LICH': 'boss_lich',
        'BOSS_DRAGON': 'boss_dragon'
      };
      // Hole echten Boss-Namen aus ENEMY_TEMPLATES
      const bossTemplate = ENEMY_TEMPLATES[bossKey];
      const bossName = bossTemplate?.name || bossKey || 'Unbekannte Bedrohung';
      const bossImg = bossTemplate?.image || `assets/images/enemies/${bossKey.toLowerCase()}.png`;
      const loreId = BOSS_LORE_MAP[bossKey] || bossKey.toLowerCase();
      const lore = getBossLore(loreId);

      const overlay = document.createElement('div');
      overlay.className = 'boss-intro-overlay';
      overlay.innerHTML = `
        <div class="boss-intro-content">
          <div class="boss-intro-flash"></div>
          <div class="boss-intro-portrait">
            <img src="${bossImg}" alt="${bossName}" onerror="this.outerHTML='<div class=\\'boss-intro-emoji\\'>💀</div>'">
          </div>
          <h1 class="boss-intro-name">${bossName}</h1>
          <div class="boss-intro-title">${room.name || 'Boss-Kammer'}</div>
          ${lore ? `<p class="boss-intro-lore">"${lore.lore}"</p>` : ''}
          <div class="boss-intro-ready">Bereite dich vor...</div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Nach 2.5 Sekunden automatisch entfernen
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => { overlay.remove(); resolve(); }, 500);
      }, 2500);

      // Oder per Klick sofort skippen
      overlay.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => { overlay.remove(); resolve(); }, 300);
      });
    });
  }

  // ─── Dungeon Atmosphäre: Companion-Kommentare + Lore-Funde ─────────────────
  _renderDungeonAtmosphere(room) {
    // Container unterhalb der Raum-Beschreibung
    let atmoDiv = document.getElementById('dungeon-atmosphere');
    if (!atmoDiv) {
      const desc = document.getElementById('dungeon-room-desc');
      if (!desc) return;
      atmoDiv = document.createElement('div');
      atmoDiv.id = 'dungeon-atmosphere';
      atmoDiv.style.cssText = 'margin-top:0.6rem;font-size:0.82rem;';
      desc.parentNode.insertBefore(atmoDiv, desc.nextSibling);
    }
    atmoDiv.innerHTML = '';

    // Nur anzeigen wenn Raum gerade erst betreten (vermeidet Wiederholung bei Re-Render)
    const roomKey = `${this.dungeonRun?.currentFloorIdx}_${this.dungeonRun?.playerPos?.x}_${this.dungeonRun?.playerPos?.y}`;
    if (this._lastAtmoRoom === roomKey) return;
    this._lastAtmoRoom = roomKey;

    const parts = [];

    // 1. Companion-Kommentar (50% Chance)
    if (Math.random() < 0.50 && this.player.party?.length > 0) {
      const comp = this.player.party[Math.floor(Math.random() * this.player.party.length)];
      const situation = room.type === 'combat' && !room.resolved ? 'beforeBoss' :
                        room.type === 'boss' && !room.resolved ? 'beforeBoss' :
                        room.type === 'trap' ? 'findTrap' :
                        room.type === 'chest' ? 'findChest' :
                        room.type === 'altar' ? 'altar' : 'enterRoom';
      const comment = getCompanionComment(comp.classKey, situation);
      if (comment) {
        parts.push(`<div style="color:#b8d4e3;font-style:italic;padding:0.3rem 0.5rem;border-left:3px solid #5588aa;margin-bottom:0.4rem;">
          <strong style="color:#7ab8d4;">${comp.name}:</strong> "${comment}"
        </div>`);
      }
    }

    // 2. Lore-Fragment (20% Chance in leeren Räumen, 35% bei Altären)
    const loreChance = room.type === 'altar' ? 0.35 : room.type === 'empty' ? 0.20 : 0.10;
    if (Math.random() < loreChance && !room._loreShown) {
      room._loreShown = true;
      const currentAct = (this.player.completedActs || 0) + 1;
      const fragment = getDungeonLoreFragment(currentAct);
      if (fragment) {
        parts.push(`<div style="color:#c9a85c;padding:0.4rem 0.6rem;border:1px solid #8a6d3b;border-radius:6px;background:rgba(30,20,10,0.7);margin-top:0.3rem;">
          <div style="font-weight:bold;margin-bottom:0.2rem;">${fragment.icon} ${fragment.title}</div>
          <div style="white-space:pre-wrap;line-height:1.4;">${fragment.text}</div>
          <div style="font-size:0.72rem;color:#887;margin-top:0.3rem;font-style:italic;">${fragment.flavor}</div>
        </div>`);
      }
    }

    if (parts.length > 0) {
      atmoDiv.innerHTML = parts.join('');
    }
  }

  // ─── Kampflog Farbkodierung ─────────────────────────────────────────────────
  formatLogLine(text) {
    if (!text?.trim()) return '';
    if (text.includes('⚠️') || (text.includes('!') && text.includes('💀')) || text.includes('RAST') || text.includes('RASS'))
      return `<div class="log-boss-phase">${text}</div>`;
    if (text.startsWith('🏆') || text.startsWith('💀 Niederlage'))
      return `<div class="log-result">${text}</div>`;
    if (text.startsWith('─') || text.startsWith('---'))
      return `<div class="log-round">${text}</div>`;
    if (text.startsWith('🎲') || text.startsWith('⭐') || text.startsWith('Kampf gegen'))
      return `<div class="log-system">${text}</div>`;
    if (text.includes('💥 KRIT'))
      return `<div class="log-crit">${text}</div>`;
    if (text.includes('verfehlt') || text.includes('weicht aus'))
      return `<div class="log-miss">${text}</div>`;
    if (text.includes('heilt') || text.includes('regeneriert') || text.includes('HoT') || text.includes('Heilung'))
      return `<div class="log-heal">${text}</div>`;
    if (text.startsWith('[Comp]'))
      return `<div class="log-companion">${text}</div>`;
    if (text.startsWith('[Buff]') || text.startsWith('[Debuff]') || text.startsWith('[DoT]') || text.startsWith('[Schild]'))
      return `<div class="log-effect">${text}</div>`;
    if (text.startsWith('  →') || text.includes('Schaden ('))
      return `<div class="log-damage">${text}</div>`;
    return `<div class="log-action">${text}</div>`;
  }

  // --- 9. COMBAT SYSTEM RENDER & HANDLER ---
  renderCombat() {
    if (!this.combat) return;

    // Kampftempo-Button-Stand sicherstellen
    this._updateSpeedToggleBtn();

    // Dungeon-Kampfhintergrund setzen (atmosphärisches Bild hinter den Einheiten)
    const battlefield = document.querySelector('#screen-combat .battlefield-group');
    const bg = this.dungeonRun?.dungeonMeta?.background;
    if (battlefield) {
      if (bg) {
        battlefield.style.backgroundImage =
          `linear-gradient(rgba(8,6,12,0.72), rgba(8,6,12,0.85)), url('${bg}')`;
        battlefield.style.backgroundSize = 'cover';
        battlefield.style.backgroundPosition = 'center';
      } else {
        battlefield.style.backgroundImage = '';
      }
    }

    // Wer ist gerade am Zug?
    const currentActor = this.combat.turnQueue[this.combat.currentTurnIndex]?.entity;

    // Runden-Header aktualisieren
    const roundLabel = document.getElementById('combat-round-label');
    const turnIndicator = document.getElementById('combat-turn-indicator');
    if (roundLabel) roundLabel.textContent = `⚔ Runde ${this.combat.round || 1}`;
    if (turnIndicator && currentActor) {
      const turnType = this.combat.turnQueue[this.combat.currentTurnIndex]?.type;
      turnIndicator.innerHTML = turnType === 'hero'
        ? `<span style="color:var(--text-gold);">▶ ${currentActor.name} ist am Zug</span>`
        : `<span style="color:var(--text-red);">⏳ ${currentActor.name} agiert...</span>`;
    }

    // INITIATIVE TRACK
    const initTrack = document.getElementById('combat-initiative-track');
    if (initTrack) {
      initTrack.innerHTML = this.combat.turnQueue.map((turn, idx) => {
        const isActive = idx === this.combat.currentTurnIndex;
        const isDead = turn.entity.currentHp <= 0;
        let icon = turn.type === 'hero' ? '🧙‍♂️' : '👹';
        if (turn.entity.classKey === 'KRIEGER') icon = '⚔️';
        else if (turn.entity.classKey === 'PALADIN') icon = '🛡️';
        else if (turn.entity.classKey === 'MAGIER') icon = '🔥';
        else if (turn.entity.classKey === 'PRIESTER') icon = '✨';

        if (turn.entity.image) {
          if (turn.type === 'hero') {
            icon = makePortraitImg(turn.entity.image, turn.entity.raceKey, turn.entity.gender, turn.entity.name, 'avatar-img');
          } else {
            icon = `<img src="${turn.entity.image}" class="avatar-img" alt="${turn.entity.name}" onerror="this.style.display='none';this.parentElement.textContent='👹';">`;
          }
        }

        let classNames = `init-avatar ${turn.type}`;
        if (isActive) classNames += ' active';
        if (isDead) classNames += ' dead';

        return `<div class="${classNames}" title="${turn.entity.name} (Init: ${turn.initiative})">${icon}</div>`;
      }).join('');
    }

    // FEINDE UI
    const enemiesGroup = document.getElementById('combat-enemies-group');
    if (enemiesGroup) {
      enemiesGroup.innerHTML = this.combat.enemies.map(enemy => {
        if (enemy.currentHp <= 0) {
          return `<div class="combat-unit enemy-unit" style="opacity: 0.3;"><div class="unit-info"><h3>${enemy.name} (Tot)</h3></div></div>`;
        }
        const enemyHpPct = (enemy.currentHp / enemy.maxHp) * 100;
        const stunIcon = enemy.stunned
          ? `<span class="status-icon stun">💫 Betäubt</span>` : '';
        const buffs   = enemy.buffs.map(b =>
          `<span class="status-icon buff">✨ ${b.name} (${b.duration}r)</span>`).join('');
        const debuffs = enemy.debuffs.map(d => {
          const icon = d.name.toLowerCase().includes('gift') || d.name.toLowerCase().includes('tox') || d.name.toLowerCase().includes('blut') ? '🩸'
                     : d.name.toLowerCase().includes('magie') || d.name.toLowerCase().includes('feuer') ? '🔥'
                     : d.name.toLowerCase().includes('kält') || d.name.toLowerCase().includes('frost') || d.name.toLowerCase().includes('eis') ? '❄️'
                     : '⬇️';
          return `<span class="status-icon debuff">${icon} ${d.name} (${d.duration}r)</span>`;
        }).join('');

        const isSelected    = this.selectedTargetId === enemy.id;
        const isCurrentTurn = currentActor === enemy;
        const enemyImg      = enemy.image
          ? `<img src="${enemy.image}" class="avatar-img" alt="${enemy.name}" onerror="this.outerHTML='<span class=\\'enemy-emoji\\'>👹</span>';">`
          : `<span class="enemy-emoji">👹</span>`;

        // Boss-Phasen-Marker auf dem HP-Balken
        let phaseMarkers = '';
        if (enemy.isBoss && enemy.phases) {
          phaseMarkers = enemy.phases.map(p =>
            `<div class="phase-marker" style="left: ${p.threshold * 100}%" title="Phase bei ${Math.round(p.threshold*100)}% HP"></div>`
          ).join('');
        }

        // Phase-Label
        let phaseLabel = '';
        if (enemy.isBoss && enemy.phases) {
          const triggeredCount = enemy.phases.filter(p => p.triggered).length;
          if (triggeredCount > 0) {
            phaseLabel = `<span class="effect-badge" style="color:hsl(15,90%,65%); border-color:hsl(15,90%,50%);">Phase ${triggeredCount + 1}</span>`;
          }
        }

        return `
          <div class="combat-unit enemy-unit ${isSelected ? 'selected-target' : ''} ${isCurrentTurn ? 'is-my-turn' : ''}" style="cursor:pointer;" data-id="${enemy.id}">
            <div class="avatar-box enemy-avatar">${enemyImg}</div>
            <div class="unit-info">
              <h3>${enemy.name}${enemy.isBoss ? ' 👺' : ''}</h3>
              <span class="level-badge">Lvl ${enemy.level}${enemy.isBoss ? ' · BOSS' : ''}</span>
              <div class="stat-bar-wrapper">
                <div class="bar-container hp ${enemy.isBoss ? 'boss-bar' : ''}">
                  <div class="bar" style="width: ${enemyHpPct}%; background: ${enemy.isBoss ? 'linear-gradient(90deg, hsl(15,80%,40%), hsl(0,80%,50%))' : ''}"></div>
                  ${phaseMarkers}
                  <span class="bar-text">${enemy.currentHp} / ${enemy.maxHp}</span>
                </div>
              </div>
              <div class="effects-list">${phaseLabel}${stunIcon}${debuffs}${buffs}</div>
            </div>
          </div>
        `;
      }).join('');

      enemiesGroup.querySelectorAll('.enemy-unit').forEach(el => {
        if (el.dataset.id) {
          el.onclick = () => {
            this.selectedTargetId = el.dataset.id;
            this.renderCombat();
          };
        }
      });
    }

    // HELDDEN UI
    const heroesGroup = document.getElementById('combat-heroes-group');
    // Aggro-Halter ermitteln: lebender Held mit höchster Bedrohung
    const aliveHeroesForAggro = this.combat.heroes.filter(h => h.currentHp > 0);
    let aggroHolder = null;
    if (aliveHeroesForAggro.length) {
      aggroHolder = aliveHeroesForAggro.reduce((a, b) => (b.threat || 0) > (a.threat || 0) ? b : a);
      if ((aggroHolder.threat || 0) <= 0) aggroHolder = null; // noch keine Bedrohung aufgebaut
    }
    // Wird gerade jemand verspottet-fokussiert? (Spott aktiv durch diesen Helden)
    const tauntHolder = this.combat.enemies.find(e => e.currentHp > 0 && e.tauntTurns > 0 && e.tauntedBy)?.tauntedBy || null;

    if (heroesGroup) {
      heroesGroup.innerHTML = this.combat.heroes.map(hero => {
        if (hero.currentHp <= 0) {
          return `<div class="combat-unit player-unit" style="opacity: 0.3;"><div class="unit-info"><h3>${hero.name} (Tot)</h3></div></div>`;
        }
        
        const isPlayer      = hero === this.player;
        const isCurrentTurnHero = currentActor === hero;
        const hpPct = (hero.currentHp / hero.maxHp) * 100;
        
        let pAv = '🧙‍♂️';
        if (hero.classKey === 'KRIEGER') pAv = '⚔️';
        else if (hero.classKey === 'PALADIN') pAv = '🛡️';
        else if (hero.classKey === 'MAGIER') pAv = '🔥';
        else if (hero.classKey === 'PRIESTER') pAv = '✨';

        if (hero.image) {
          pAv = makePortraitImg(hero.image, hero.raceKey, hero.gender, hero.name, 'avatar-img');
        }

        const isSelectedHero = this.selectedHeroId === hero.name;

        const heroStunIcon = hero.stunned
          ? `<span class="status-icon stun">💫 Betäubt</span>` : '';
        const buffs = hero.buffs.map(b =>
          `<span class="status-icon buff">✨ ${b.name} (${b.duration}r)</span>`).join('');
        const debuffs = hero.debuffs.map(d => {
          const icon = d.name.toLowerCase().includes('gift') || d.name.toLowerCase().includes('tox') || d.name.toLowerCase().includes('blut') ? '🩸'
                     : d.name.toLowerCase().includes('magie') || d.name.toLowerCase().includes('feuer') ? '🔥'
                     : d.name.toLowerCase().includes('kält') || d.name.toLowerCase().includes('frost') || d.name.toLowerCase().includes('eis') ? '❄️'
                     : '⬇️';
          return `<span class="status-icon debuff">${icon} ${d.name} (${d.duration}r)</span>`;
        }).join('');
        const shieldBadge = hero.shield
          ? `<span class="status-icon shield">🛡 Schild: ${hero.shield}</span>` : '';
        // Aggro-/Spott-Anzeige
        const aggroBadge = (tauntHolder === hero)
          ? `<span class="status-icon taunt">🎯 Spott aktiv</span>`
          : (aggroHolder === hero ? `<span class="status-icon aggro">🎯 Aggro</span>` : '');

        // Resource Bar — für alle Helden anzeigen (Mana bei Magieklassen, Wut beim Krieger)
        let resourceHtml = '';
        if (hero.maxResource > 0) {
          const resPct   = Math.min(100, (hero.currentResource / hero.maxResource) * 100);
          const resClass = hero.classKey === 'KRIEGER' ? 'rage' : '';
          const resLabel = hero.classKey === 'KRIEGER' ? 'Wut' : 'Mana';
          resourceHtml = `
            <div class="stat-bar-wrapper">
              <div class="bar-container resource ${resClass}">
                <div class="bar" style="width: ${resPct}%"></div>
                <span class="bar-text">${hero.currentResource} / ${hero.maxResource} ${resLabel}</span>
              </div>
            </div>
          `;
        }

        return `
          <div class="combat-unit player-unit ${isCurrentTurnHero ? 'is-my-turn' : ''} ${isSelectedHero ? 'selected-target' : ''}" style="cursor: pointer;" data-id="${hero.name}">
            <div class="avatar-box player-avatar">${pAv}</div>
            <div class="unit-info">
              <h3>${hero.name}</h3>
              <span class="level-badge">Lvl ${hero.level}</span>
              <div class="stat-bar-wrapper">
                <div class="bar-container hp">
                  <div class="bar" style="width: ${hpPct}%"></div>
                  <span class="bar-text">${hero.currentHp} / ${hero.maxHp}</span>
                </div>
              </div>
              ${resourceHtml}
              <div class="effects-list">${aggroBadge}${heroStunIcon}${debuffs}${buffs}${shieldBadge}</div>
            </div>
          </div>
        `;
      }).join('');

      heroesGroup.querySelectorAll('.player-unit').forEach(el => {
        if (el.dataset.id) {
          el.onclick = () => {
            this.selectedHeroId = el.dataset.id;
            this.renderCombat();
          };
        }
      });
    }

    // COMBAT LOG — farbkodiert
    const logBody = document.getElementById('combat-log-body');
    logBody.innerHTML = this.combat.logs.map(log => this.formatLogLine(log)).join('');
    logBody.scrollTop = logBody.scrollHeight;

    // COMBAT SKILLS (Tasten rendern)
    const skillsGrid = document.getElementById('combat-skills-grid');
    const skills = getAvailableSkills(this.player);

    skillsGrid.innerHTML = skills.map(skill => {
      const charClass = this.player.classKey;
      const enoughResource = this.player.currentResource >= skill.cost;
      return `
        <div class="skill-card">
          <button class="premium-btn small" ${enoughResource ? '' : 'disabled'} data-id="${skill.id}">
            ${skill.name} (${skill.cost} ${skill.costType})
          </button>
          <div class="skill-desc">${skill.description}</div>
        </div>
      `;
    }).join('');

    skillsGrid.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const skill = skills.find(s => s.id === btn.dataset.id);
        
        // Auto-Execute Logic
        if (skill.type === 'buff' || skill.id === 'HEAL_ALL') {
          this.executeTargetedSkill(null, skill);
        } else {
          // Ist es ein Heilzauber?
          const isHeal = skill.isHeal || skill.id === 'PRIESTER_RENEW' || skill.id === 'PRIESTER_SHIELD';
          let targetId = null;

          if (isHeal) {
            targetId = this.selectedHeroId || this.player.name;
          } else {
            targetId = this.selectedTargetId;
            // Wenn kein Feind ausgewählt ist oder der gewählte tot ist, nimm den ersten lebenden
            if (!targetId || !this.combat.enemies.find(e => e.id === targetId && e.currentHp > 0)) {
              const firstAlive = this.combat.enemies.find(e => e.currentHp > 0);
              if (firstAlive) {
                targetId = firstAlive.id;
                this.selectedTargetId = targetId; // Speichere als neuen Standard
              }
            }
          }

          if (targetId) {
            this.executeTargetedSkill(targetId, skill);
          }
        }
      };
    });

    // COMBAT POTIONS (Verbrauchsgüter auflisten)
    const potGrid = document.getElementById('combat-potions-grid');
    const potions = this.player.inventory.filter(i => i.type === 'consumable');

    if (potions.length === 0) {
      potGrid.innerHTML = `<div class="placeholder-text" style="font-size:0.8rem;">Keine Tränke im Inventar.</div>`;
    } else {
      // Gruppieren der Tränke nach ID
      const count = {};
      const uniquePots = [];
      potions.forEach(p => {
        if (!count[p.id]) {
          count[p.id] = 0;
          uniquePots.push(p);
        }
        count[p.id]++;
      });

      potGrid.innerHTML = uniquePots.map(pot => `
        <button class="premium-btn small" style="background:linear-gradient(135deg, #28a745 0%, #155724 100%); border-color:#28a745;" data-id="${pot.uniqueId}">
          ${pot.name} x${count[pot.id]}
        </button>
      `).join('');

      potGrid.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
          const pot = potions.find(p => p.uniqueId === btn.dataset.id);
          if (!pot) return;
          // Trank trinken = Kampfaktion (verbraucht den Spielerzug)
          this.executePlayerPotionTurn(pot.uniqueId);
        };
      });
    }

    // HEAL-REQUEST BUTTON STATUS
    const healBtn = document.getElementById('btn-combat-heal-request');
    if (healBtn) {
      const healer = this.combat.heroes.find(h =>
        h !== this.player && h.currentHp > 0 &&
        (h.role === 'HEALER' || h.classKey === 'PRIESTER')
      );
      const hasRequest = !!this.combat.healRequest;
      const noHealer = !healer;

      healBtn.disabled = hasRequest || noHealer || this.combat.isOver;
      healBtn.style.opacity = (hasRequest || noHealer) ? '0.45' : '1';
      healBtn.title = noHealer
        ? 'Kein Heiler in der Gruppe'
        : hasRequest
          ? `${healer?.name} heilt dich im nächsten Zug!`
          : `${healer?.name} um Heilung bitten`;

      // Aktive Anforderung visuell hervorheben
      if (hasRequest) {
        healBtn.textContent = `💚 ${healer?.name || 'Heiler'} heilt gleich...`;
        healBtn.style.borderColor = 'hsl(120,80%,40%)';
        healBtn.style.boxShadow = '0 0 8px rgba(50,200,50,0.4)';
      } else {
        healBtn.textContent = '💚 Heilung anfordern';
        healBtn.style.borderColor = 'hsl(120,50%,40%)';
        healBtn.style.boxShadow = '';
      }
    }
  }

  // ─── Animations-Hilfsmethoden ─────────────────────────────────────────────

  /** Zeigt eine schwebende Zahl (Schaden/Heilung) über einem Combat-Element */
  _showFloatNumber(cardId, amount, type = 'damage') {
    // Suche nach der Karte per data-id
    const card = document.querySelector(
      `[data-id="${CSS.escape(String(cardId))}"]`
    );
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const div  = document.createElement('div');
    div.className = `float-number ${type}`;

    if (type === 'damage')  div.textContent = `−${amount}`;
    else if (type === 'crit') div.textContent = `💥 −${amount}`;
    else if (type === 'heal') div.textContent = `+${amount}`;
    else if (type === 'miss') div.textContent = 'Verfehlt!';
    else if (type === 'stun') div.textContent = '💫 Betäubt';
    else if (type === 'dot')  div.textContent = `🩸 −${amount}`;

    div.style.left = `${rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.3}px`;
    div.style.top  = `${rect.top  + 10}px`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1200);
  }

  /** Lässt eine Combat-Karte kurz aufleuchten (Treffer / Heilung / Stun) */
  _flashCard(cardId, type = 'hit') {
    const card = document.querySelector(`[data-id="${CSS.escape(String(cardId))}"]`);
    if (!card) return;
    card.classList.remove('fx-hit', 'fx-heal', 'fx-stun');
    void card.offsetWidth; // Reflow um Animation neu zu starten
    card.classList.add(`fx-${type}`);
    setTimeout(() => card.classList.remove(`fx-${type}`), 500);
  }

  /** Setzt die UI in "NPC ist dran"-Modus: Skills sperren, Log zeigen */
  _setNpcTurnLock(locked) {
    const grid    = document.getElementById('combat-skills-grid');
    const potGrid = document.getElementById('combat-potions-grid');
    const autoBtn = document.getElementById('btn-auto-attack');
    [grid, potGrid, autoBtn].forEach(el => {
      if (!el) return;
      if (locked) el.classList.add('npc-turn');
      else        el.classList.remove('npc-turn');
    });
  }

  /**
   * Snapshots der HP aller Einheiten vor einem Schritt.
   * Gibt ein Map zurück: id → { hp, shield }
   */
  _snapshotHp() {
    const snap = new Map();
    if (!this.combat) return snap;
    for (const e of this.combat.enemies) {
      snap.set(e.id, { hp: e.currentHp, shield: e.shield || 0, stunned: e.stunned });
    }
    for (const h of this.combat.heroes) {
      snap.set(h.name, { hp: h.currentHp, shield: h.shield || 0, stunned: h.stunned });
    }
    return snap;
  }

  /**
   * Vergleicht aktuellen Zustand mit Snapshot und spawnt Float-Nummern +
   * flasht Karten für alle geänderten Einheiten.
   */
  _playDeltaFX(before) {
    if (!this.combat) return;

    const process = (entity, cardId) => {
      const prev = before.get(cardId);
      if (!prev) return;
      const hpDelta = (prev.hp) - entity.currentHp;  // positiv = Schaden
      const healDelta = entity.currentHp - prev.hp;    // positiv = Heilung

      if (hpDelta > 0) {
        // Schaden
        this._flashCard(cardId, 'hit');
        this._showFloatNumber(cardId, hpDelta, 'damage');
      } else if (healDelta > 0) {
        // Heilung
        this._flashCard(cardId, 'heal');
        this._showFloatNumber(cardId, healDelta, 'heal');
      }
      // Stun neu gesetzt?
      if (entity.stunned && !prev.stunned) {
        this._flashCard(cardId, 'stun');
        this._showFloatNumber(cardId, 0, 'stun');
      }
    };

    for (const e of this.combat.enemies)  process(e, e.id);
    for (const h of this.combat.heroes)   process(h, h.name);
  }

  /**
   * Prüft die letzte Log-Zeile auf Crit / Miss / DoT und spawnt entsprechende Nummern.
   * Wird nach jedem Schritt aufgerufen um Text-spezifische FX auszulösen.
   */
  _playLogFX(logsBefore) {
    const newLogs = this.combat.logs.slice(logsBefore.length);
    for (const line of newLogs) {
      // Crit-Treffer
      if (line.includes('💥 KRIT')) {
        const dmgMatch = line.match(/\d+/);
        if (!dmgMatch) continue;
        // Target-Karte bestimmen (einfache Heuristik: erster Gegner der gerade aktiv ist)
        const target = this.combat.enemies.find(e => line.includes(e.name) && e.currentHp > 0)
                    || this.combat.heroes.find(h => line.includes(h.name) && h.currentHp > 0);
        if (target) {
          const id = target.classKey ? target.name : target.id;
          this._showFloatNumber(id, parseInt(dmgMatch[0]), 'crit');
        }
      }
      // Verfehlt
      if (line.startsWith('✗') && line.includes('verfehlt')) {
        const caster = this.combat.heroes.find(h => line.includes(h.name));
        if (caster) this._showFloatNumber(caster.name, 0, 'miss');
      }
      // DoT-Schaden
      if (line.startsWith('[DoT]')) {
        const dmgMatch = line.match(/erleidet (\d+)/);
        const target = this.combat.heroes.find(h => line.includes(h.name))
                    || this.combat.enemies.find(e => line.includes(e.name));
        if (target && dmgMatch) {
          const id = target.classKey ? target.name : target.id;
          this._showFloatNumber(id, parseInt(dmgMatch[1]), 'dot');
        }
      }
    }
  }

  /**
   * Fährt alle NPC-Züge animiert ab (Companions + Feinde) bis der Spieler
   * wieder dran ist oder der Kampf endet.
   *
   * Nutzt die Rückgabewerte von nextTurn():
   *   'npc'       → echte Aktion → 900ms Pause + FX
   *   'round_end' → Rundenende   → kurze 300ms Pause (Runden-Log sichtbar)
   *   'skip'      → Betäubung/tot → sofort weiter, kein Delay
   *   'player'    → Spieler dran → Schleife endet
   *   'over'      → Kampf beendet → Schleife endet
   */
  async _runNpcAnimLoop() {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const speed = this.COMBAT_SPEEDS[this.combatSpeedKey] || this.COMBAT_SPEEDS.normal;
    // Sicherheitslimit: nie mehr als diese Anzahl Schritte pro Aufruf
    const maxSteps = (this.combat.heroes.length + this.combat.enemies.length) * 4 + 8;
    let steps = 0;

    while (!this.combat.isOver && steps++ < maxSteps) {
      // ── PHASE 1: TELEGRAPH ─────────────────────────────────────────────────
      // Wer ist als nächstes dran? (Index zeigt noch auf den kommenden Actor)
      const upcoming = this.combat.turnQueue[this.combat.currentTurnIndex];
      // Spieler nicht telegraphen — er handelt manuell (Loop endet bei 'player')
      const isPlayerNext = upcoming && upcoming.entity === this.player;
      const willAct = upcoming && upcoming.entity.currentHp > 0 && !upcoming.entity.stunned
                      && !isPlayerNext
                      && this.combat.currentTurnIndex < this.combat.turnQueue.length;

      if (willAct) {
        // Actor hervorheben + Intent-Banner zeigen, BEVOR die Aktion passiert
        this._telegraphActor(upcoming.entity, upcoming.type);
        await delay(speed.telegraph);
      }

      // ── PHASE 2: AKTION AUFLÖSEN ───────────────────────────────────────────
      const hpSnap  = this._snapshotHp();
      const logSnap = [...this.combat.logs];

      const result = this.combat.nextTurn();

      this.renderCombat();

      if (result === 'npc') {
        // Echte Aktion: FX anzeigen + deutliche Pause zum Nachvollziehen
        this._playDeltaFX(hpSnap);
        this._playLogFX(logSnap);
        if (!this.combat.isOver) await delay(speed.action);

      } else if (result === 'round_end') {
        // Neues Runden-Banner: kurz sichtbar lassen
        this._flashRoundBanner();
        await delay(speed.roundEnd);

      } else if (result === 'player' || result === 'over') {
        // Spieler ist dran oder Kampf vorbei → aufhören
        break;

      }
      // 'skip': sofort weitermachen, kein delay
    }
    this._clearTelegraph();
  }

  /** Hebt die gerade handelnde Einheit hervor und zeigt eine Absichts-Vorwarnung */
  _telegraphActor(entity, type) {
    this._clearTelegraph(); // alte Markierungen entfernen

    const findCard = (e) => {
      const id = e.classKey ? e.name : e.id;
      return document.querySelector(`[data-id="${CSS.escape(String(id))}"]`);
    };

    // Karte des Actors hervorheben (pulsierender Rahmen)
    const card = findCard(entity);
    if (card) {
      card.classList.add('telegraph-active');
      this._lastTelegraphCard = card;
    }

    // Standard-Vorwarnungstext
    const turnIndicator = document.getElementById('combat-turn-indicator');
    let intentText = '';

    // ── Bei Gegnern: Ziel vorab ermitteln & anvisieren ──────────────────────
    this._telegraphTargets = [];
    if (type !== 'hero' && this.combat.planEnemyTurn) {
      const plan = this.combat.planEnemyTurn(entity);
      if (plan && plan.target) {
        const targets = plan.isAoe ? this.combat.getAliveHeroes() : [plan.target];
        targets.forEach(t => {
          const tcard = findCard(t);
          if (tcard) {
            tcard.classList.add('telegraph-target');
            this._telegraphTargets.push(tcard);
          }
        });
        // Intent-Text: Skill-Name + Ziel
        const targetLabel = plan.isAoe ? 'die GRUPPE' : plan.target.name;
        if (plan.usedSkill) {
          intentText = `<span style="color:var(--text-red);font-weight:bold;">⚡ ${entity.name} → '${plan.usedSkill.name}' auf ${targetLabel}!</span>`;
        } else {
          intentText = `<span style="color:var(--text-red);font-weight:bold;">🎯 ${entity.name} zielt auf ${targetLabel}...</span>`;
        }
      }
    }

    // Fallback-Text (Companions / keine Zielinfo)
    if (turnIndicator) {
      if (intentText) {
        turnIndicator.innerHTML = intentText;
      } else {
        const verb = type === 'hero' ? 'bereitet sich vor' : 'holt aus';
        const color = type === 'hero' ? 'var(--text-gold)' : 'var(--text-red)';
        turnIndicator.innerHTML = `<span style="color:${color};font-weight:bold;">⚡ ${entity.name} ${verb}...</span>`;
      }
    }
  }

  /** Entfernt die Telegraph-Hervorhebung (Actor + Ziele) */
  _clearTelegraph() {
    if (this._lastTelegraphCard) {
      this._lastTelegraphCard.classList.remove('telegraph-active');
      this._lastTelegraphCard = null;
    }
    if (this._telegraphTargets) {
      this._telegraphTargets.forEach(c => c.classList.remove('telegraph-target'));
      this._telegraphTargets = [];
    }
    document.querySelectorAll('.telegraph-active').forEach(el => el.classList.remove('telegraph-active'));
    document.querySelectorAll('.telegraph-target').forEach(el => el.classList.remove('telegraph-target'));
  }

  /** Blitzt ein Runden-Banner auf */
  _flashRoundBanner() {
    const roundLabel = document.getElementById('combat-round-label');
    if (roundLabel) {
      roundLabel.classList.remove('round-flash');
      void roundLabel.offsetWidth;
      roundLabel.classList.add('round-flash');
    }
  }

  /** Aktualisiert den Kampftempo-Button-Text */
  _updateSpeedToggleBtn() {
    const btn = document.getElementById('combat-speed-toggle');
    if (!btn) return;
    const speed = this.COMBAT_SPEEDS[this.combatSpeedKey] || this.COMBAT_SPEEDS.normal;
    btn.textContent = speed.label;
    // Farbe je nach Tempo
    const colors = { slow: 'hsl(140,50%,40%)', normal: 'hsl(45,70%,50%)', fast: 'hsl(0,60%,50%)' };
    btn.style.borderColor = colors[this.combatSpeedKey] || colors.normal;
    btn.style.color = colors[this.combatSpeedKey] || colors.normal;
  }

  // ─── Skill ausführen (jetzt async mit Animations-Loop) ────────────────────

  // Führt einen Skill mit Ziel aus
  async executeTargetedSkill(targetId, forceSkill = null) {
    const skill = forceSkill;
    if (!skill) return;

    // Snapshot vor der Spieler-Aktion
    const hpSnap  = this._snapshotHp();
    const logSnap = [...this.combat.logs];

    const res = this.combat.executePlayerTurn(skill, targetId);

    if (res && res.error) {
      alert(res.error);
      return;
    }

    this.updateUI();
    this.renderCombat();
    // FX für Spieler-Aktion sofort anzeigen
    this._playDeltaFX(hpSnap);
    this._playLogFX(logSnap);

    if (this.combat.isOver) { this.checkCombatEnd(); return; }

    // NPC-Züge animiert abfahren
    this._setNpcTurnLock(true);
    await this._runNpcAnimLoop();
    this._setNpcTurnLock(false);

    this.updateUI();
    this.renderCombat();
    this.checkCombatEnd();
  }

  // Trank trinken als Kampfaktion — verbraucht den Spielerzug
  async executePlayerPotionTurn(potionId) {
    if (!this.combat || this.combat.isOver) return;
    // Nur wenn Spieler aktuell dran ist
    const cur = this.combat.turnQueue[this.combat.currentTurnIndex];
    if (!cur || cur.entity !== this.player) return;

    const hpSnap  = this._snapshotHp();
    const logSnap = [...this.combat.logs];

    const res = useConsumable(this.player, potionId, true);
    if (res.error) { alert(res.error); return; }

    this.combat.addLog(`🧪 ${res.text}`);

    // Spielerzug verbrauchen (entspricht executePlayerTurn ohne Skill)
    this.combat.currentTurnIndex++;

    this.updateUI();
    this.renderCombat();
    this._playDeltaFX(hpSnap);
    this._playLogFX(logSnap);

    if (this.combat.isOver) { this.checkCombatEnd(); return; }

    this._setNpcTurnLock(true);
    await this._runNpcAnimLoop();
    this._setNpcTurnLock(false);

    this.updateUI();
    this.renderCombat();
    this.checkCombatEnd();
  }

  // Überprüft, ob der Kampf zu Ende ist und zeigt Belohnungen
  checkCombatEnd() {
    if (!this.combat || !this.combat.isOver) return;
    // Idempotenz: Belohnungen/Quest-Updates nur EINMAL ausführen
    // (checkCombatEnd kann aus mehreren Pfaden aufgerufen werden — z.B. Auto-Kampf)
    if (this.combat._endHandled) return;
    this.combat._endHandled = true;

    if (this.combat.victory) {
      if (this.dungeonRun && this.dungeonRun.activeRoom) {
        this.dungeonRun.activeRoom.resolved = true; // Raum als geschafft markieren
      }

      // Belohnungen auflisten
      let rewardText = `
        <li>+ ${this.combat.xpEarned} XP</li>
        <li>+ ${this.combat.goldEarned} Gold</li>
      `;

      this.combat.lootEarned.forEach(loot => {
        if (loot.isMaterial) {
          rewardText += `<li style="color:#28a745">+ Rohstoff: ${loot.name}</li>`;
          updateQuestLoot(this.player, loot.name, 1);
          addMaterial(this.player, loot.name, 1); // ins Material-Lager (Crafting)
        } else {
          const rarityColor = loot.rarityColor || '#9d9d9d';
          const rarityTag = loot.rarityName ? `[${loot.rarityName}]` : '';
          rewardText += `<li class="loot-item-reveal" style="color:${rarityColor};text-shadow:0 0 6px ${rarityColor}40;">+ ${loot.name} <span style="font-size:0.7rem;opacity:0.8;">${rarityTag}</span></li>`;
        }
      });

      // Monsterkills für Quests updaten
      this.combat.enemies.forEach(enemy => {
        const questUpdates = updateQuestKills(this.player, enemy.name, enemy.isBoss || false);
        if (questUpdates.length > 0) {
          questUpdates.forEach(q => {
            rewardText += `<li style="color:cyan">Quest-Fortschritt '${q.title}': ${q.currentCount}/${q.targetCount}</li>`;
          });
        }
        // NPC-Questreihen: Boss-Kill-Trigger (z.B. Grimjaws Amboss beim Goblin-König)
        if (enemy.isBoss) {
          const npcMsg = this._checkNpcQuestTriggers('bossKill', enemy.name);
          npcMsg.forEach(m => { rewardText += `<li style="color:#e8a040">${m}</li>`; });
          // Akt-Progression: bringt dieser Boss-Sieg die Kampagne voran?
          const beat = getBossStoryBeat(enemy.name, this.player.completedActs || 0);
          if (beat) this._pendingStoryBeat = beat; // nach dem Belohnungs-Overlay zeigen
        }
      });

      this.showCombatResultOverlay(true, `Der Kampf ist vorbei! Ihr habt gewonnen!`, rewardText);

      // Level-Up Celebration
      if (this.combat.leveledUp) {
        setTimeout(() => this._showLevelUpCelebration(), 600);
      }
    } else {
      this.showCombatResultOverlay(false, `Die Gruppe wurde besiegt.`);
    }
  }

  _showHealRequestFeedback(msg, success) {
    const btn = document.getElementById('btn-combat-heal-request');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = (success ? '✓ ' : '✗ ') + msg;
    btn.style.opacity = '0.7';
    btn.disabled = success; // Bei Erfolg deaktivieren bis Zug vorbei
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.opacity = '1';
      if (!this.combat?.healRequest) btn.disabled = false;
    }, 2000);
  }

  _showCampfireScene(restLog, teller, story) {
    const overlay = document.createElement('div');
    overlay.className = 'campfire-overlay';
    overlay.innerHTML = `
      <div class="campfire-panel">
        <div class="campfire-image">
          <img src="assets/images/ui_campfire.png" alt="Lagerfeuer"
               onerror="this.style.display='none';this.parentElement.classList.add('no-img');">
          <span class="campfire-fallback">🔥</span>
        </div>
        <div class="campfire-content">
          <h2 class="campfire-title">⛺ Die Gruppe rastet</h2>
          <p class="campfire-rest">${restLog || 'Ihr schlagt ein Lager auf und sammelt neue Kräfte.'}</p>
          ${story && teller ? `
            <div class="campfire-story">
              <div class="campfire-teller">🔥 ${teller.name} erzählt am Lagerfeuer…</div>
              <div class="campfire-story-title">„${story.title}"</div>
              <p class="campfire-story-text">${story.text}</p>
            </div>
          ` : ''}
          <button class="premium-btn campfire-close">Weiter</button>
        </div>
      </div>
    `;
    const close = () => overlay.remove();
    overlay.querySelector('.campfire-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  /**
   * Setzt den Akt-Fortschritt und zeigt den cinematischen Story-Beat
   * (Akt-Übergang, Verräter-Reveal oder Ending) als Vollbild-Overlay.
   */
  _applyStoryBeat(beatInfo) {
    if (!beatInfo) return;
    const { actReached, beat } = beatInfo;
    // Akt-Fortschritt setzen (nur vorwärts)
    if (actReached > (this.player.completedActs || 0)) {
      this.player.completedActs = actReached;
    }
    this.updateUI();
    this.saveGameToLocalStorage();
    this._showStoryBeatOverlay(beat);
  }

  /** Vollbild-Cinematic für einen Story-Beat (mehrere Absätze, klickweise) */
  _showStoryBeatOverlay(beat) {
    if (!beat) return;
    const accent = beat.accent || 'var(--text-gold)';
    let idx = 0;

    const overlay = document.createElement('div');
    overlay.className = 'story-beat-overlay';
    overlay.innerHTML = `
      <div class="story-beat-panel">
        <div class="story-beat-rune" style="color:${accent};">❖</div>
        <h1 class="story-beat-title" style="color:${accent};">${beat.title}</h1>
        <div class="story-beat-text" id="story-beat-text"></div>
        <button class="premium-btn story-beat-next" id="story-beat-next">Weiter ▸</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const textEl = overlay.querySelector('#story-beat-text');
    const nextBtn = overlay.querySelector('#story-beat-next');

    const showPara = () => {
      const p = document.createElement('p');
      p.className = 'story-beat-para';
      p.textContent = beat.paragraphs[idx];
      textEl.appendChild(p);
      // sanft einblenden
      requestAnimationFrame(() => p.classList.add('visible'));
      idx++;
      if (idx >= beat.paragraphs.length) {
        nextBtn.textContent = beat.id === 'ending' ? 'Abschließen ✦' : 'Schließen ✦';
      }
    };
    showPara();

    nextBtn.addEventListener('click', () => {
      if (idx < beat.paragraphs.length) {
        showPara();
        textEl.scrollTop = textEl.scrollHeight;
      } else {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
        // ggf. Folge-Renderer (Dorf aktualisieren wegen freigeschalteter Inhalte)
        if (this.currentScreen === 'screen-village') this.renderVillage();
      }
    });
  }

  // ─── TEMP DEBUG: Kampflog-Export (später entfernen) ───────────────────────

  /** Baut einen detaillierten Text-Report des aktuellen Kampfes. */
  _buildCombatReport() {
    const c = this.combat;
    const lines = [];
    const sep = '─'.repeat(60);
    lines.push('═'.repeat(60));
    lines.push(`KAMPF-DEBUG-REPORT  —  ${new Date().toLocaleString('de-DE')}`);
    lines.push('═'.repeat(60));

    if (!c) { lines.push('(Kein aktiver Kampf)'); return lines.join('\n'); }

    lines.push(`Runde: ${c.round || 1}   |   Kampf vorbei: ${c.isOver ? 'ja' : 'nein'}${c.isOver ? (c.victory ? ' (Sieg)' : ' (Niederlage)') : ''}`);
    lines.push(`Tempo: ${this.combatSpeedKey}   |   Dungeon-Modifikator: ${this.dungeonRun?.modifier?.name || 'keiner'}`);
    lines.push('');

    // Party
    lines.push(sep);
    lines.push('PARTY');
    lines.push(sep);
    for (const h of c.heroes) {
      const cls = CLASSES[h.classKey];
      const spec = cls?.specs?.[h.specKey]?.name || h.specKey;
      lines.push(`▸ ${h.name} — ${h.raceKey} ${cls?.name || h.classKey} (${spec}) Lvl ${h.level}${h === this.player ? '  [SPIELER]' : '  [Companion/' + (h.role || '?') + ']'}`);
      lines.push(`    HP ${h.currentHp}/${h.maxHp}   ${cls?.resourceType || 'RES'} ${h.currentResource}/${h.maxResource}   Bedrohung ${Math.round(h.threat || 0)}`);
      lines.push(`    STR ${h.stats?.strength} AGI ${h.stats?.agility} INT ${h.stats?.intellect} STA ${h.stats?.stamina}`);
      const dmg = h.getPhysicalDamage ? h.getPhysicalDamage() : '?';
      const sp = h.getSpellPower ? h.getSpellPower() : '?';
      const arm = h.getArmor ? h.getArmor() : '?';
      const crit = h.getCritChance ? Math.round(h.getCritChance()*100) : '?';
      const scrit = h.getSpellCritChance ? Math.round(h.getSpellCritChance()*100) : '?';
      const block = h.getBlockChance ? Math.round(h.getBlockChance()*100) : '?';
      const dodge = h.getDodgeChance ? Math.round(h.getDodgeChance()*100) : '?';
      lines.push(`    PhysDmg ${dmg}  SpellPower ${sp}  Rüstung ${arm}  Krit ${crit}%  ZKrit ${scrit}%  Block ${block}%  Ausweichen ${dodge}%`);
      // Talente
      const talents = Object.entries(h.talents || {}).filter(([,lvl])=>lvl>0).map(([id,lvl])=>`${id}:${lvl}`);
      lines.push(`    Talente: ${talents.length ? talents.join(', ') : '(keine)'}  |  Skillpunkte offen: ${h.skillPoints || 0}`);
      // Ausrüstung
      const eq = Object.entries(h.equipment || {}).filter(([,it])=>it).map(([slot,it])=>`${slot}=${it.name}${it.upgradeLevel?`(+${it.upgradeLevel})`:''}`);
      lines.push(`    Ausrüstung: ${eq.length ? eq.join(', ') : '(nichts)'}`);
      // Aktive Buffs/Debuffs
      const buffs = (h.buffs||[]).map(b=>`${b.name}(${b.duration})`).join(', ');
      const debs = (h.debuffs||[]).map(d=>`${d.name}(${d.duration})`).join(', ');
      if (buffs || debs) lines.push(`    Buffs: ${buffs||'-'}  Debuffs: ${debs||'-'}`);
    }
    lines.push('');

    // Gegner
    lines.push(sep);
    lines.push('GEGNER');
    lines.push(sep);
    for (const e of c.enemies) {
      lines.push(`▸ ${e.name}${e.isBoss?' [BOSS]':''} Lvl ${e.level}  HP ${e.currentHp}/${e.maxHp}  Schaden ${e.damage}  Rüstung ${e.armor}${e.currentHp<=0?'  (TOT)':''}`);
      if (e.tauntedBy) lines.push(`    🎯 verspottet von: ${e.tauntedBy.name} (${e.tauntTurns} Runden)`);
      const skills = (e.skills||[]).map(s=>`${s.name}(${Math.round(s.chance*100)}%${s.isAoe?',AoE':''}${s.dot?',DoT':''}${s.stun?',Stun':''})`);
      if (skills.length) lines.push(`    Skills: ${skills.join(', ')}`);
      const debs = (e.debuffs||[]).map(d=>`${d.name}(${d.duration})`).join(', ');
      if (debs) lines.push(`    Debuffs: ${debs}`);
    }
    lines.push('');

    // Kampflog
    lines.push(sep);
    lines.push('KAMPFLOG (chronologisch)');
    lines.push(sep);
    (c.logs || []).forEach((l, i) => lines.push(`${String(i+1).padStart(3,' ')}. ${l}`));

    return lines.join('\n');
  }

  /** Exportiert den aktuellen Kampf-Report als herunterladbare Textdatei. */
  _exportDebugLog() {
    if (!this.combat) { alert('Kein aktiver Kampf zum Exportieren.'); return; }
    const report = this._buildCombatReport();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `combat-debug_${stamp}.txt`;
    try {
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } catch (e) {
      // Fallback: in die Zwischenablage kopieren
      try { navigator.clipboard.writeText(report); alert('Download nicht möglich — Report in die Zwischenablage kopiert.'); }
      catch { console.log(report); alert('Report in die Konsole geschrieben (F12).'); }
    }
  }

  _showLevelUpCelebration() {
    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';
    overlay.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-particles"></div>
        <div class="level-up-icon">⭐</div>
        <h1 class="level-up-title">LEVEL UP!</h1>
        <div class="level-up-level">Stufe ${this.player.level}</div>
        <div class="level-up-talent">🌟 Neuer Talentpunkt verfügbar!</div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Partikel erzeugen
    const particleContainer = overlay.querySelector('.level-up-particles');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'level-up-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 1.5 + 's';
      p.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      particleContainer.appendChild(p);
    }

    // Entfernen nach 3.5s oder per Klick
    const remove = () => { overlay.classList.add('fade-out'); setTimeout(() => overlay.remove(), 500); };
    setTimeout(remove, 3500);
    overlay.addEventListener('click', remove);
  }

  _applyDungeonModifier(combat) {
    const mod = this.dungeonRun?.modifier;
    if (!mod || mod.id === 'none') return;

    // Gegner-HP skalieren
    if (mod.enemyMult && mod.enemyMult !== 1.0) {
      combat.enemies.forEach(e => {
        e.hp = Math.round(e.hp * mod.enemyMult);
        e.maxHp = Math.round(e.maxHp * mod.enemyMult);
      });
    }
    // Gegner-Schaden skalieren
    if (mod.damageMult && mod.damageMult !== 1.0) {
      combat.enemies.forEach(e => {
        e.damage = Math.round(e.damage * mod.damageMult);
      });
    }
    // Belohnungsmultiplikator merken
    combat.rewardMult = mod.rewardMult || 1.0;
    combat.luckBonus = mod.id === 'frenzied' ? 2 : (mod.id === 'mythic' ? 3 : (mod.id === 'cursed' ? 2 : 0));
  }

  showCombatResultOverlay(victory, message, rewardsHtml = '') {
    const overlay = document.getElementById('combat-result-overlay');
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    const rewardsSec = document.getElementById('result-rewards-section');
    const rewardsList = document.getElementById('result-rewards-list');

    title.innerText = victory ? 'SIEG!' : 'NIEDERLAGE!';
    title.style.color = victory ? 'var(--text-gold)' : 'var(--text-red)';
    msg.innerText = message;

    if (victory && rewardsHtml) {
      rewardsSec.classList.remove('hidden');
      rewardsList.innerHTML = rewardsHtml;
    } else {
      rewardsSec.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
    this.updateUI();
  }

  // --- 10. COMPANION MANAGEMENT ---

  renderCompanionManagement() {
    const panel = document.getElementById('tab-companions');
    if (!panel) return;

    if (!this.player?.party?.length) {
      panel.innerHTML = `
        <h3 style="color:var(--text-gold); margin-bottom:1rem;">Deine Gruppe</h3>
        <p style="color:var(--text-muted);">Du hast noch keine Gefährten in deiner Gruppe.</p>
      `;
      return;
    }

    const companions = this.player.party;
    const idx = Math.min(this.selectedCompanionIdx || 0, companions.length - 1);
    const comp = companions[idx];
    const sub = this.companionSubTab || 'stats';

    const classIcon = (c) => c.classKey === 'PRIESTER' ? '🧝‍♀️' : (c.classKey === 'PALADIN' || c.classKey === 'KRIEGER') ? '🛡️' : '🧙‍♂️';

    const selectorHtml = companions.map((c, i) => {
      const hpPct = Math.round((c.currentHp / c.maxHp) * 100);
      const hpColor = hpPct < 30 ? 'var(--text-red)' : hpPct < 60 ? '#f0a500' : '#28a745';
      return `<button class="premium-btn small ${i === idx ? 'active' : ''}" data-ci="${i}">${classIcon(c)} ${c.name} <span style="font-size:0.7rem; color:${hpColor};">${hpPct}% ❤️</span></button>`;
    }).join('');

    const subTabs = [
      { id: 'stats',      label: '📊 Werte'      },
      { id: 'equip',      label: '⚔️ Ausrüstung' },
      { id: 'talents',    label: '⭐ Talente'     },
      { id: 'potions',    label: '🧪 Tränke'      },
      { id: 'distribute', label: '🎒 Verteilen'   }
    ].map(t => `<button class="premium-btn small ${t.id === sub ? 'active' : ''}" data-csub="${t.id}">${t.label}</button>`).join('');

    let subContent = '';
    if      (sub === 'stats')      subContent = this._renderCompanionStats(comp);
    else if (sub === 'equip')      subContent = this._renderCompanionEquip(comp);
    else if (sub === 'talents')    subContent = this._renderCompanionTalents(comp);
    else if (sub === 'potions')    subContent = this._renderCompanionPotions(comp);
    else if (sub === 'distribute') subContent = this._renderCompanionDistribute(comp);

    const hpPct = Math.round((comp.currentHp / comp.maxHp) * 100);
    const manaPart = comp.maxResource > 0
      ? `<div style="font-size:0.8rem; color:#6fa8dc;">💧 ${comp.currentResource} / ${comp.maxResource} ${comp.classKey === 'KRIEGER' ? 'Wut' : 'Mana'}</div>`
      : '';

    panel.innerHTML = `
      <div style="margin-bottom:1rem;">
        <h3 style="color:var(--text-gold); margin-bottom:0.75rem;">Gefährten-Verwaltung</h3>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${selectorHtml}
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:8px; padding:1rem;">
        <!-- Companion Header -->
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:2.2rem; line-height:1; width:3rem; height:3rem; overflow:hidden; border-radius:50%;">
            ${comp.image ? makePortraitImg(comp.image, comp.raceKey, comp.gender, comp.name, 'avatar-img') : classIcon(comp)}
          </div>
          <div style="flex:1;">
            <div style="color:#fff; font-weight:bold; font-size:1.05rem;">${comp.name}</div>
            <div style="color:var(--text-muted); font-size:0.8rem;">Stufe ${comp.level} · ${comp.classKey} · ${comp.specKey} · ${comp.role || ''}</div>
          </div>
          <div style="text-align:right; font-size:0.82rem;">
            <div style="color:${hpPct < 30 ? 'var(--text-red)' : '#aaa'};">❤️ ${comp.currentHp} / ${comp.maxHp}</div>
            ${manaPart}
          </div>
        </div>

        <!-- Sub-Tabs -->
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1rem;">
          ${subTabs}
        </div>

        <!-- Sub-Content -->
        <div id="companion-sub-content">
          ${subContent}
        </div>
      </div>
    `;

    // Bind: Companion selector
    panel.querySelectorAll('[data-ci]').forEach(btn => {
      btn.onclick = () => { this.selectedCompanionIdx = parseInt(btn.dataset.ci); this.renderCompanionManagement(); };
    });
    // Bind: Sub-tab selector
    panel.querySelectorAll('[data-csub]').forEach(btn => {
      btn.onclick = () => { this.companionSubTab = btn.dataset.csub; this.renderCompanionManagement(); };
    });
    // Bind: Actions (equip / unequip / learn / potion)
    this._bindCompanionActions(comp);
  }

  _renderCompanionStats(comp) {
    const armor  = comp.getArmor           ? comp.getArmor()                              : 0;
    const redPct = comp.getDamageReduction ? Math.round(comp.getDamageReduction() * 100)  : 0;
    const dmg    = comp.getPhysicalDamage  ? comp.getPhysicalDamage()                     : '—';
    const sp     = comp.getSpellPower      ? comp.getSpellPower()                         : '—';
    const crit   = comp.getCritChance      ? `${Math.round(comp.getCritChance() * 100)}%`  : '—';

    const row = (label, value) => `
      <div style="display:flex; justify-content:space-between; padding:0.35rem 0.5rem; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:0.25rem;">
        <span style="color:var(--text-muted); font-size:0.85rem;">${label}</span>
        <span style="color:#fff; font-size:0.85rem; font-weight:bold;">${value}</span>
      </div>`;

    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em;">Attribute</div>
          ${row('Stärke',      comp.stats.strength)}
          ${row('Beweglichkeit', comp.stats.agility)}
          ${row('Intelligenz', comp.stats.intellect)}
          ${row('Ausdauer',    comp.stats.stamina)}
        </div>
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.05em;">Kampfwerte</div>
          ${row('Rüstung',       `${armor} (${redPct}% Red.)`)}
          ${row('Phys. Schaden', dmg)}
          ${row('Zaubermacht',   sp)}
          ${row('Krit-Chance',   crit)}
          ${row('Talentpunkte',  comp.skillPoints || 0)}
        </div>
      </div>`;
  }

  _renderCompanionEquip(comp) {
    const slots      = ['mainHand','offHand','head','chest','hands','legs','feet'];
    const slotLabels = { mainHand:'Hauptwaffe', offHand:'Nebenhand', head:'Kopf', chest:'Brust', hands:'Hände', legs:'Beine', feet:'Füße' };
    const slotIcons  = { mainHand:'⚔️', offHand:'🛡️', head:'👑', chest:'🛡️', hands:'🧤', legs:'👖', feet:'🥾' };

    const equippedHtml = slots.map(slot => {
      const item = comp.equipment[slot];
      return `
        <div style="display:flex; align-items:center; gap:0.5rem; padding:0.4rem 0.6rem; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; margin-bottom:0.35rem;">
          <span>${slotIcons[slot]}</span>
          <div style="flex:1; min-width:0;">
            <div style="font-size:0.7rem; color:var(--text-muted);">${slotLabels[slot]}</div>
            <div style="color:${item ? 'var(--text-gold)' : '#555'}; font-size:0.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item ? item.name : '— Leer —'}</div>
          </div>
          ${item ? `<button class="premium-btn small" style="background:rgba(180,30,30,0.4); border-color:#a33;" data-unequip-slot="${slot}">Ablegen</button>` : ''}
        </div>`;
    }).join('');

    // Nur Gegenstände aus dem eigenen Inventar des Companions
    const compEquipItems = (comp.inventory || []).filter(i => i.type === 'equipment');
    const invHtml = compEquipItems.length === 0
      ? `<p style="color:var(--text-muted); font-size:0.82rem; padding:0.5rem 0;">Kein Ausrüstung im Gepäck.<br><span style="font-size:0.75rem;">Gegenstände über <strong>🎒 Verteilen</strong> übergeben.</span></p>`
      : compEquipItems.map(item => {
          let statText = '';
          if (item.damage) statText += `⚔️ ${item.damage} `;
          if (item.armor)  statText += `🛡️ ${item.armor} `;
          if (item.stats)  statText += Object.entries(item.stats).map(([k,v]) => `${k.substring(0,3)}+${v}`).join(' ');
          return `
            <div style="padding:0.4rem 0.6rem; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px; margin-bottom:0.35rem;">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div style="flex:1; min-width:0;">
                  <div style="color:#fff; font-size:0.84rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                  <div style="color:#888; font-size:0.72rem;">${statText.trim() || '—'} · ${slotLabels[item.slot] || item.slot || '?'}</div>
                </div>
                <button class="premium-btn small" data-equip-item="${item.uniqueId}">Anlegen</button>
              </div>
            </div>`;
        }).join('');

    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem;">
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">Ausgerüstet</div>
          ${equippedHtml}
        </div>
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">Gepäck (${comp.name})</div>
          ${invHtml}
        </div>
      </div>`;
  }

  _renderCompanionTalents(comp) {
    if (!TALENT_TREES[comp.classKey] || !TALENT_TREES[comp.classKey][comp.specKey]) {
      return `<p style="color:var(--text-muted);">Keine Talente für ${comp.classKey} (${comp.specKey}) verfügbar.</p>`;
    }

    const talents = TALENT_TREES[comp.classKey][comp.specKey];
    const sp = comp.skillPoints || 0;

    return `
      <div style="margin-bottom:0.75rem; padding:0.5rem 0.75rem; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); border-radius:6px; font-size:0.85rem; color:#aaa;">
        Verfügbare Talentpunkte: <strong style="color:var(--text-gold); font-size:1rem;">${sp}</strong>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:0.75rem;">
        ${talents.map(t => {
          const lvl = (comp.talents && comp.talents[t.id]) || 0;
          const isMaxed = lvl >= t.maxLevel;
          const nodeClass = isMaxed ? 'maxed' : lvl > 0 ? 'unlocked' : '';
          return `
            <div class="talent-node ${nodeClass}" style="position:relative;">
              <span class="talent-level-badge">${lvl} / ${t.maxLevel}</span>
              <h3>${t.name}</h3>
              <p>${t.desc}</p>
              <button class="premium-btn small mt-1" ${(!isMaxed && sp > 0) ? '' : 'disabled'}
                      data-learn-talent="${t.id}">
                ${lvl === 0 ? 'Freischalten' : 'Verbessern'}
              </button>
            </div>`;
        }).join('')}
      </div>`;
  }

  _renderCompanionPotions(comp) {
    const consumables = (comp.inventory || []).filter(i => i.type === 'consumable');

    if (consumables.length === 0) {
      return `
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem;">Keine Tränke im Gepäck von ${comp.name}.</p>
        <p style="color:#888; font-size:0.78rem;">Tränke über <strong>🎒 Verteilen</strong> übergeben. Im Kampf nutzt ${comp.name} Heiltränke automatisch wenn HP unter 35% fällt.</p>`;
    }

    return `
      <p style="color:#888; font-size:0.78rem; margin-bottom:0.75rem;">💡 Im Kampf nutzt ${comp.name} Heiltränke automatisch wenn HP unter 35% fällt.</p>
      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        ${consumables.map(item => {
          const hpFull    = item.effectType === 'heal' && comp.currentHp >= comp.maxHp;
          const manaFull  = item.effectType === 'mana' && comp.currentResource >= comp.maxResource;
          const isKrieger = item.effectType === 'mana' && comp.classKey === 'KRIEGER';
          const isBuff    = item.effectType === 'buff';
          const cantUse   = hpFull || manaFull || isKrieger;
          let disabledReason = '';
          if (hpFull)    disabledReason = 'HP voll';
          if (manaFull)  disabledReason = 'Mana voll';
          if (isKrieger) disabledReason = 'Krieger ≠ Mana';

          const typeIcon = item.effectType === 'heal' ? '❤️' : item.effectType === 'mana' ? '💧' : '⚗️';
          return `
            <div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0.75rem; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:6px;">
              <div style="font-size:1.4rem; line-height:1;">${typeIcon}</div>
              <div style="flex:1;">
                <div style="color:#28a745; font-weight:bold; font-size:0.88rem;">${item.name}</div>
                <div style="color:#888; font-size:0.75rem;">${item.description || ''}</div>
              </div>
              <div style="text-align:right;">
                ${isBuff
                  ? `<span style="color:#888; font-size:0.75rem;">Nur im Kampf</span>`
                  : `<button class="premium-btn small" ${cantUse ? 'disabled' : ''} data-use-potion="${item.uniqueId}">
                       ${cantUse ? disabledReason : 'Benutzen'}
                     </button>`}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  _bindCompanionActions(comp) {
    const panel = document.getElementById('tab-companions');
    if (!panel) return;

    // Unequip: item → comp.inventory
    panel.querySelectorAll('[data-unequip-slot]').forEach(btn => {
      btn.onclick = () => {
        this._unequipFromCompanion(comp, btn.dataset.unequipSlot);
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });

    // Equip: item from comp.inventory → comp.equipment
    panel.querySelectorAll('[data-equip-item]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const res = this._equipToCompanion(comp, btn.dataset.equipItem);
        if (res.error) { alert(res.error); return; }
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });

    // Learn talent for companion
    panel.querySelectorAll('[data-learn-talent]').forEach(btn => {
      btn.onclick = () => {
        const res = learnTalent(comp, btn.dataset.learnTalent);
        if (res.error) { alert(res.error); return; }
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });

    // Use potion on companion (item lives in comp.inventory)
    panel.querySelectorAll('[data-use-potion]').forEach(btn => {
      btn.onclick = () => {
        const res = useConsumable(comp, btn.dataset.usePotion, false);
        if (res.error) { alert(res.error); return; }
        alert(res.text.replace('Du trinkst', `${comp.name} trinkt`));
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });

    // Transfer: player.inventory → comp.inventory
    panel.querySelectorAll('[data-give-to-comp]').forEach(btn => {
      btn.onclick = () => {
        this._giveItemToCompanion(comp, btn.dataset.giveToComp);
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });

    // Transfer: comp.inventory → player.inventory
    panel.querySelectorAll('[data-take-from-comp]').forEach(btn => {
      btn.onclick = () => {
        this._takeItemFromCompanion(comp, btn.dataset.takeFromComp);
        this.renderCompanionManagement();
        this.saveGameToLocalStorage();
      };
    });
  }

  // Gegenstände zwischen Spieler und Companion verteilen (Übergabe)
  _renderCompanionDistribute(comp) {
    const compName = comp.name;

    const playerItems = this.player.inventory;
    const compItems   = (comp.inventory || []).filter(i => !comp.equipment || Object.values(comp.equipment).every(e => !e || e.uniqueId !== i.uniqueId));

    const itemRow = (item, btnLabel, btnAttr) => {
      let statText = '';
      if (item.damage)   statText = `⚔️ ${item.damage}`;
      if (item.armor)    statText = `🛡️ ${item.armor}`;
      if (item.type === 'consumable') statText = item.effectType === 'heal' ? '❤️ Heiltrank' : item.effectType === 'mana' ? '💧 Manatrank' : '⚗️ Elixier';
      if (!statText && item.stats) statText = Object.entries(item.stats).map(([k,v]) => `${k.substring(0,3)}+${v}`).join(' ');
      return `
        <div style="display:flex; align-items:center; gap:0.4rem; padding:0.35rem 0.5rem; background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:5px; margin-bottom:0.3rem;">
          <div style="flex:1; min-width:0;">
            <div style="color:#fff; font-size:0.82rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
            <div style="color:#888; font-size:0.7rem;">${statText || '—'}</div>
          </div>
          <button class="premium-btn small" ${btnAttr}>${btnLabel}</button>
        </div>`;
    };

    const playerHtml = playerItems.length === 0
      ? `<p style="color:var(--text-muted); font-size:0.8rem; padding:0.3rem 0;">Inventar leer.</p>`
      : playerItems.map(i => itemRow(i, `→ ${compName}`, `data-give-to-comp="${i.uniqueId}"`)).join('');

    const compHtml = compItems.length === 0
      ? `<p style="color:var(--text-muted); font-size:0.8rem; padding:0.3rem 0;">Gepäck leer.</p>`
      : compItems.map(i => itemRow(i, `← ${this.player.name}`, `data-take-from-comp="${i.uniqueId}"`)).join('');

    return `
      <p style="color:#888; font-size:0.78rem; margin-bottom:0.75rem;">Gegenstände zwischen dir und ${compName} aufteilen. Ausgerüstete Items sind nicht übertragbar.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem;">
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">📦 ${this.player.name} (${playerItems.length})</div>
          ${playerHtml}
        </div>
        <div>
          <div style="color:var(--text-gold); font-size:0.8rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em;">🎒 ${compName} (${compItems.length})</div>
          ${compHtml}
        </div>
      </div>`;
  }

  // Equip an item from comp.inventory onto a companion slot.
  // Any previously equipped item in that slot stays in comp.inventory.
  _equipToCompanion(comp, uniqueId) {
    // Item muss im Gepäck des Companions liegen
    const cIdx = (comp.inventory || []).findIndex(i => i.uniqueId === uniqueId);
    if (cIdx === -1) return { error: 'Gegenstand nicht im Gepäck des Gefährten gefunden.' };

    // equipItem() handles: find in comp.inventory, unequip old into comp.inventory, equip new
    return equipItem(comp, uniqueId);
  }

  // Unequip a slot from companion — item returns to comp.inventory (not player.inventory).
  _unequipFromCompanion(comp, slot) {
    const item = comp.equipment[slot];
    if (!item) return { error: 'Slot ist bereits leer.' };
    // unequipItem pushes item to comp.inventory
    return unequipItem(comp, slot);
  }

  // Transfer item from player.inventory → comp.inventory
  _giveItemToCompanion(comp, uniqueId) {
    const idx = this.player.inventory.findIndex(i => i.uniqueId === uniqueId);
    if (idx === -1) return { error: 'Gegenstand nicht gefunden.' };
    const item = this.player.inventory.splice(idx, 1)[0];
    comp.inventory = comp.inventory || [];
    comp.inventory.push(item);
    return { success: true };
  }

  // Transfer item from comp.inventory → player.inventory
  _takeItemFromCompanion(comp, uniqueId) {
    const idx = (comp.inventory || []).findIndex(i => i.uniqueId === uniqueId);
    if (idx === -1) return { error: 'Gegenstand nicht im Gepäck des Gefährten.' };
    const item = comp.inventory.splice(idx, 1)[0];
    this.player.inventory.push(item);
    return { success: true };
  }

  // --- 11. TALENT TREE (SKILL POINTS) RENDER ---
  renderTalentTree() {
    if (!this.player) return;
    const hero = this.activeHero;

    const pointsEl = document.getElementById('talent-points-count');
    if (pointsEl) pointsEl.innerText = hero.skillPoints;

    const charClass = hero.classKey;
    const classTrees = TALENT_TREES[charClass];

    const nodesGrid = document.getElementById('talent-tree-nodes');
    if (!nodesGrid) return;

    if (!classTrees || Object.keys(classTrees).length === 0) {
      nodesGrid.innerHTML = `<div class="placeholder-text">Keine Talente für ${CLASSES[charClass]?.name || charClass} definiert.</div>`;
      return;
    }

    // Aktiven Spec hervorheben
    const activeSpec = hero.specKey;

    // 3-Spalten-Layout: ein Baum pro Spalte
    nodesGrid.innerHTML = '';
    nodesGrid.style.display = 'grid';
    nodesGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    nodesGrid.style.gap = '0.5rem';

    for (const [treeName, treeTalents] of Object.entries(classTrees)) {
      // Punkte in diesem Baum zählen
      let treePts = 0;
      for (const t of treeTalents) treePts += (hero.talents[t.id] || 0);

      const isActive = treeName === activeSpec;
      const col = document.createElement('div');
      col.className = 'talent-tree-column';
      col.style.cssText = `border:2px solid ${isActive ? 'var(--text-gold)' : 'var(--border-color)'}; border-radius:8px; padding:0.5rem; background:rgba(0,0,0,0.3);`;

      // Spalten-Header
      const specMeta = CLASSES[charClass]?.specs?.[treeName];
      col.innerHTML = `
        <div style="text-align:center;margin-bottom:0.5rem;">
          <h3 style="color:${isActive ? 'var(--text-gold)' : '#aaa'};margin:0;">${specMeta?.name || treeName}</h3>
          <small style="color:var(--text-gold);">${treePts} Punkte investiert</small>
          ${isActive ? '<div style="color:var(--text-gold);font-size:0.75rem;">★ Aktive Spezialisierung</div>' : ''}
        </div>
      `;

      // Talent-Knoten in Reihen (nach treePointsRequired gruppiert)
      const tiers = [0, 3, 6, 10];
      const tierLabels = ['Reihe 1', 'Reihe 2', 'Reihe 3', '★ Ultimate'];
      for (let ti = 0; ti < tiers.length; ti++) {
        const tierTalents = treeTalents.filter(t => (t.treePointsRequired || 0) === tiers[ti]);
        if (tierTalents.length === 0) continue;

        const locked = treePts < tiers[ti];
        const tierDiv = document.createElement('div');
        tierDiv.style.cssText = `margin-bottom:0.4rem;padding:0.3rem;border-top:1px solid ${locked ? '#555' : 'var(--text-gold)'};opacity:${locked ? '0.5' : '1'};`;
        tierDiv.innerHTML = `<div style="font-size:0.65rem;color:${locked ? '#777' : 'var(--text-gold)'};text-align:center;">${tierLabels[ti]} (${tiers[ti]} Pkt.)</div>`;

        for (const t of tierTalents) {
          const level = hero.talents[t.id] || 0;
          const isMaxed = level >= t.maxLevel;
          const canLearn = !locked && !isMaxed && hero.skillPoints > 0;
          const nodeClass = isMaxed ? 'maxed' : level > 0 ? 'unlocked' : '';

          const node = document.createElement('div');
          node.className = `talent-node ${nodeClass}`;
          node.style.cssText = 'margin:0.3rem 0;padding:0.4rem;font-size:0.85rem;';
          node.innerHTML = `
            <span class="talent-level-badge">${level}/${t.maxLevel}</span>
            <strong>${t.name}</strong>
            <p style="font-size:0.75rem;margin:0.2rem 0;color:#ccc;">${t.desc}</p>
            <button class="premium-btn small" ${canLearn ? '' : 'disabled'} data-id="${t.id}" style="font-size:0.7rem;padding:2px 8px;">
              ${locked ? '🔒' : level === 0 ? 'Lernen' : 'Verbessern'}
            </button>
          `;
          tierDiv.appendChild(node);
        }
        col.appendChild(tierDiv);
      }
      nodesGrid.appendChild(col);
    }

    // Event-Listener für alle Talent-Buttons
    nodesGrid.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => {
        const res = learnTalent(this.activeHero, btn.dataset.id);
        if (res.error) { alert(res.error); }
        else { this.updateUI(); this.renderTalentTree(); this.saveGameToLocalStorage(); }
      };
    });
  }
}

// Initialisiere die App, wenn das Dokument bereit ist
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
