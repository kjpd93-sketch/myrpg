/**
 * Main Game Controller and UI Orchestrator
 */

import { Character, Companion, CLASSES, RACES } from './modules/character.js';
import { getAvailableSkills, learnTalent, TALENT_TREES } from './modules/skills.js';
import { equipItem, unequipItem, upgradeItem, getUpgradeCost, getStarterEquipment } from './modules/items.js';
import { getAvailableQuests, acceptQuest, turnInQuest, updateQuestKills, updateQuestLoot } from './modules/quests.js';
import { Combat } from './modules/combat.js';
import { DungeonRun, DUNGEONS } from './modules/dungeon.js';
import { INN_OPTIONS, MARKET_ITEMS, getBlacksmithInventory, buyMarketItem, buyBlacksmithItem, sellInventoryItem, useConsumable } from './modules/village.js';

class App {
  constructor() {
    this.player = null;
    this.dungeonRun = null;
    this.combat = null;
    this.currentScreen = 'screen-main-menu';
    this.currentSlot = null;         // Aktiver Speicherslot (1–3)
    this.pendingNewGameSlot = null;  // Gewählter Slot für neues Spiel

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
      level: this.player.level,
      xp: this.player.xp,
      gold: this.player.gold,
      skillPoints: this.player.skillPoints,
      equipment: this.player.equipment,
      inventory: this.player.inventory,
      talents: this.player.talents,
      completedQuests: this.player.completedQuests || [],
      activeQuests: this.player.activeQuests || [],
      currentHp: this.player.currentHp,
      currentResource: this.player.currentResource,
      party: (this.player.party || []).map(p => ({
        name: p.name, gender: p.gender, raceKey: p.raceKey,
        classKey: p.classKey, specKey: p.specKey, role: p.role,
        level: p.level, equipment: p.equipment, talents: p.talents || {},
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
      this.player.level = state.level;
      this.player.xp = state.xp;
      this.player.gold = state.gold;
      this.player.skillPoints = state.skillPoints;
      this.player.equipment = state.equipment;
      this.player.inventory = state.inventory;
      this.player.talents = state.talents || {};
      this.player.completedQuests = state.completedQuests || [];
      this.player.activeQuests = state.activeQuests || [];
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
    if (screenId === 'screen-combat') this.renderCombat();
    if (screenId === 'screen-talents') this.renderTalentTree();
    
    // Nach jedem Screen-Wechsel speichern
    this.saveGameToLocalStorage();
  }

  // --- CHARACTER CREATION ---
  setupCharacterCreation() {
    const raceGrid = document.getElementById('race-selection-grid');
    const classGrid = document.getElementById('class-selection-grid');
    const specGrid = document.getElementById('spec-selection-grid');

    // Völker rendern
    raceGrid.innerHTML = Object.entries(RACES).map(([key, r]) => `
      <div class="choice-card" data-type="race" data-key="${key}">
        <h4>${r.name}</h4>
        <p>${r.description}</p>
      </div>
    `).join('');

    // Klassen rendern
    classGrid.innerHTML = Object.entries(CLASSES).map(([key, c]) => `
      <div class="choice-card" data-type="class" data-key="${key}">
        <h4>${c.name}</h4>
        <p>Rüstung: ${c.armorTypes.map(t => t === 'heavy' ? 'Schwer' : t === 'plate' ? 'Platte' : 'Stoff').join(', ')}</p>
      </div>
    `).join('');

    // Dynamischer Wechsel der Spezialisierung je nach gewählter Klasse
    const selectChoice = (type, key, element) => {
      document.querySelectorAll(`.choice-card[data-type="${type}"]`).forEach(c => c.classList.remove('selected'));
      element.classList.add('selected');

      if (type === 'class') {
        // Specs aktualisieren
        const charClass = CLASSES[key];
        specGrid.innerHTML = Object.entries(charClass.specs).map(([specKey, s]) => `
          <div class="choice-card" data-type="spec" data-key="${specKey}">
            <h4>${s.name}</h4>
            <p>${s.description}</p>
          </div>
        `).join('');

        // Event-Listener an die neuen Specs binden
        document.querySelectorAll('.choice-card[data-type="spec"]').forEach(card => {
          card.addEventListener('click', () => {
            document.querySelectorAll('.choice-card[data-type="spec"]').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
          });
        });

        // Automatisch den ersten Spec wählen
        const firstSpec = specGrid.querySelector('.choice-card');
        if (firstSpec) firstSpec.click();
      }
    };

    // Click Listener binden
    document.querySelectorAll('.choice-card[data-type="race"]').forEach(card => {
      card.addEventListener('click', () => { selectChoice('race', card.dataset.key, card); updateCreationPreview(); });
    });
    document.querySelectorAll('.choice-card[data-type="class"]').forEach(card => {
      card.addEventListener('click', () => { selectChoice('class', card.dataset.key, card); updateCreationPreview(); });
    });

    document.querySelectorAll('input[name="char-gender"]').forEach(radio => {
      radio.addEventListener('change', () => updateCreationPreview());
    });
    document.getElementById('char-name').addEventListener('input', () => updateCreationPreview());

    const updateCreationPreview = () => {
      const name = document.getElementById('char-name').value.trim() || 'Heldname';
      const gender = document.querySelector('input[name="char-gender"]:checked').value;
      const raceEl = document.querySelector('.choice-card[data-type="race"].selected');
      const classEl = document.querySelector('.choice-card[data-type="class"].selected');
      
      const raceKey = raceEl ? raceEl.dataset.key : 'MENSCH';
      const classKey = classEl ? classEl.dataset.key : 'KRIEGER';
      
      let pImg = `assets/images/portrait_${raceKey.toLowerCase()}_${classKey.toLowerCase()}_${gender}.png`;
      
      document.getElementById('char-preview-img').src = pImg;
      document.getElementById('char-preview-name').innerText = name;
      document.getElementById('char-preview-desc').innerText = `${RACES[raceKey].name} ${CLASSES[classKey].name}`;
    };

    // Vorauswahl
    const firstRace = raceGrid.querySelector('.choice-card');
    if (firstRace) firstRace.click();
    const firstClass = classGrid.querySelector('.choice-card');
    if (firstClass) firstClass.click();
    updateCreationPreview();

    // Formular-Absendung
    const form = document.getElementById('char-creation-form');
    form.addEventListener('submit', () => {
      const name = document.getElementById('char-name').value.trim();
      const gender = document.querySelector('input[name="char-gender"]:checked').value;
      const raceKey = document.querySelector('.choice-card[data-type="race"].selected').dataset.key;
      const classKey = document.querySelector('.choice-card[data-type="class"].selected').dataset.key;
      const specKey = document.querySelector('.choice-card[data-type="spec"].selected').dataset.key;

      if (!name) return;

      // Charakter erstellen
      this.player = new Character(name, gender, raceKey, classKey, specKey);
      
      // Starter-Ausrüstung verpassen
      this.player.equipment = getStarterEquipment(classKey);
      this.player.resetStats();
      this.player.currentHp = this.player.maxHp;
      if (CLASSES[classKey].resourceType === 'MANA') {
        this.player.currentResource = this.player.maxResource;
      }

      // Companions hinzufügen
      const elara = new Companion('Elara', 'w', 'NACHTELF', 'PRIESTER', 'HEILUNG', 'HEALER');
      elara.equipment = getStarterEquipment('PRIESTER');
      elara.resetStats();
      elara.currentHp = elara.maxHp;
      elara.currentResource = elara.maxResource;
      elara.image = 'assets/images/portrait_nachtelf_priester_w.png';

      const kael = new Companion('Kael', 'm', 'MENSCH', 'PALADIN', 'TANK', 'TANK');
      kael.equipment = getStarterEquipment('PALADIN');
      kael.resetStats();
      kael.currentHp = kael.maxHp;
      kael.currentResource = kael.maxResource;
      kael.image = 'assets/images/portrait_mensch_paladin_m.png';

      this.player.party = [elara, kael];

      // Assign player portrait
      this.player.image = `assets/images/portrait_${raceKey.toLowerCase()}_${classKey.toLowerCase()}_${gender}.png`;

      // Speicherslot setzen (aus Slot-Auswahl oder Fallback 1)
      this.currentSlot = this.pendingNewGameSlot || 1;
      this.pendingNewGameSlot = null;

      this.showScreen('screen-village');
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

    // Togglen des neuen Charakter-Menüs (Phase 4)
    const toggleBtn = document.getElementById('btn-toggle-character');
    toggleBtn.addEventListener('click', () => {
      document.getElementById('character-menu-overlay').classList.remove('hidden');
      this.updateUI();
      if (this.renderTalentTree) this.renderTalentTree();
    });

    const closeCharBtn = document.getElementById('btn-close-char-menu');
    if (closeCharBtn) {
      closeCharBtn.addEventListener('click', () => {
        document.getElementById('character-menu-overlay').classList.add('hidden');
      });
    }

    // Tab-Wechsel im Charakter-Menü
    document.querySelectorAll('#character-menu-overlay .char-menu-header .shop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Active class für Tabs
        document.querySelectorAll('#character-menu-overlay .char-menu-header .shop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Panels umschalten
        document.querySelectorAll('#character-menu-overlay .char-menu-tab').forEach(p => p.classList.add('hidden'));
        document.getElementById(tab.dataset.tab).classList.remove('hidden');
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
        // Tod
        this.dungeonRun = null;
        this.combat = null;
        this.player.gold = Math.max(0, Math.round(this.player.gold * 0.5)); // Goldverlust bei Tod
        this.player.currentHp = Math.round(this.player.maxHp * 0.1); // Wiederbelebung mit 10% HP
        this.showScreen('screen-village');
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
    });

    // Flee combat
    document.getElementById('btn-combat-flee').addEventListener('click', () => {
      if (this.combat.flee()) {
        this.showCombatResultOverlay(false, 'Du konntest erfolgreich fliehen, verlierst aber deinen Dungeon-Fortschritt.');
      } else {
        this.renderCombat();
      }
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

    // Modal Header
    const menuSheetName = document.getElementById('menu-sheet-name');
    if (menuSheetName) menuSheetName.innerText = this.player.name;
    const menuSheetSub = document.getElementById('menu-sheet-sub');
    if (menuSheetSub) menuSheetSub.innerText = `${genderSign} ${race} ${spec}-${charClass.name}`;

    // Stats im Modal
    document.getElementById('menu-stat-strength').innerText = this.player.stats.strength;
    document.getElementById('menu-stat-agility').innerText = this.player.stats.agility;
    document.getElementById('menu-stat-intellect').innerText = this.player.stats.intellect;
    document.getElementById('menu-stat-stamina').innerText = this.player.stats.stamina;

    const armor = this.player.getArmor();
    const redPct = Math.round(this.player.getDamageReduction() * 100);
    document.getElementById('menu-stat-armor').innerText = armor;
    document.getElementById('menu-stat-reduction').innerText = `${redPct}%`;

    document.getElementById('menu-stat-damage').innerText = this.player.getPhysicalDamage();
    document.getElementById('menu-stat-spellpower').innerText = this.player.getSpellPower();

    // Sekundärwerte
    const critEl      = document.getElementById('menu-stat-crit');
    const spellCritEl = document.getElementById('menu-stat-spellcrit');
    const dodgeEl     = document.getElementById('menu-stat-dodge');
    const blockEl     = document.getElementById('menu-stat-block');
    if (critEl)      critEl.innerText      = `${Math.round(this.player.getCritChance()      * 100)}%`;
    if (spellCritEl) spellCritEl.innerText = `${Math.round(this.player.getSpellCritChance() * 100)}%`;
    if (dodgeEl)     dodgeEl.innerText     = `${Math.round(this.player.getDodgeChance()     * 100)}%`;
    if (blockEl)     blockEl.innerText     = `${Math.round(this.player.getBlockChance()     * 100)}%`;

    // Equipment Slots im Modal
    const previewBox = document.getElementById('item-hover-preview');
    const previewName = document.getElementById('preview-name');
    const previewStats = document.getElementById('preview-stats');

    document.querySelectorAll('.equip-slot').forEach(slot => {
      const slotName = slot.dataset.slot;
      const equippedItem = this.player.equipment[slotName];

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
          const res = unequipItem(this.player, slotName);
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

    let filteredInventory = this.player.inventory;
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
              <div class="item-title" style="font-weight: bold; color: ${item.type === 'consumable' ? '#28a745' : '#fff'}; margin-bottom: 0.3rem;">${item.name}</div>
              <div class="item-desc" style="font-size: 0.75rem; color: #ccc;">${statText || item.description || ''}</div>
            </div>
          </div>
        `;
      }).join('');

      // Preview on hover & Equip/Use on click
      invList.querySelectorAll('.item-card').forEach(card => {
        const item = this.player.inventory.find(i => i.uniqueId === card.dataset.id);

        card.onmouseenter = () => {
          if (!previewBox || item.type === 'consumable') return;
          previewBox.classList.remove('hidden');
          previewName.innerText = item.name + " (Vorschau)";
          previewName.style.color = '#fff';
          
          let statText = '';
          if (item.damage) statText += `<div>Schaden: ${item.damage}</div>`;
          if (item.armor) statText += `<div>Rüstung: ${item.armor}</div>`;
          if (item.stats) {
             Object.entries(item.stats).forEach(([k,v]) => {
               // Calculate stat difference if we have an item equipped in that slot
               const slot = item.slot;
               const equipped = this.player.equipment[slot];
               let diff = v;
               if (equipped && equipped.stats && equipped.stats[k]) {
                 diff = v - equipped.stats[k];
               }
               const diffColor = diff > 0 ? '#28a745' : (diff < 0 ? 'var(--text-red)' : 'gray');
               const diffStr = diff > 0 ? `(+${diff})` : (diff < 0 ? `(${diff})` : `(0)`);
               statText += `<div>${k}: +${v} <span style="color:${diffColor}; margin-left:5px;">${diffStr}</span></div>`;
             });
          }
          previewStats.innerHTML = statText || 'Keine Werte';
        };

        card.onmouseleave = () => {
          if (previewBox) previewBox.classList.add('hidden');
        };

        card.onclick = () => {
          if (item.type === 'consumable') {
            const res = useConsumable(this.player, item.uniqueId, this.currentScreen === 'screen-combat');
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
            const res = equipItem(this.player, item.uniqueId);
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
        if (comp.image) avatarIcon = `<img src="${comp.image}" class="avatar-img" alt="${comp.name}">`;
        
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
      
      // Detailed view in Menu Overlay
      if (menuPartyList) {
        menuPartyList.innerHTML = this.player.party.map(comp => {
          const hpPct = (comp.currentHp / comp.maxHp) * 100;
          let avatarIcon = '🧙‍♂️';
          if (comp.classKey === 'PRIESTER') avatarIcon = '🧝‍♀️';
          if (comp.classKey === 'PALADIN' || comp.classKey === 'KRIEGER') avatarIcon = '🛡️';
          if (comp.image) avatarIcon = `<img src="${comp.image}" class="avatar-img" alt="${comp.name}">`;

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
  }

  // --- 3. INN RENDER ---
  renderInn() {
    const list = document.getElementById('inn-options-list');
    list.innerHTML = INN_OPTIONS.map(opt => {
      const isAffordable = this.player.gold >= opt.cost;
      return `
        <div class="inn-option-row">
          <div class="inn-details">
            <h4>${opt.name}</h4>
            <p>${opt.description}</p>
          </div>
          <div class="inn-buy">
            <span class="product-cost" style="margin-right: 15px;">${opt.cost} Gold</span>
            <button class="premium-btn small" ${isAffordable ? '' : 'disabled'} data-id="${opt.id}">Restieren</button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = INN_OPTIONS.find(o => o.id === btn.dataset.id);
        const res = this.player.rest(opt.cost, opt.regen);
        if (res) {
          alert(`Du fühlst dich ausgeruht und gestärkt! Leben und Mana wurden regeneriert.`);
          this.updateUI();
          this.renderInn();
        }
      });
    });
  }

  // --- 4. MARKET RENDER ---
  renderMarket() {
    // BUY PRODUCT LIST
    const prodList = document.getElementById('market-products');
    prodList.innerHTML = MARKET_ITEMS.map(item => {
      const isAffordable = this.player.gold >= item.cost;
      const isWarriorMana = this.player.classKey === 'KRIEGER' && item.effectType === 'mana';
      return `
        <div class="product-card">
          <span class="product-title">${item.name}</span>
          <span class="product-desc">${item.description}</span>
          <div class="product-footer">
            <span class="product-cost">${item.cost} Gold</span>
            <button class="premium-btn small" ${(isAffordable && !isWarriorMana) ? '' : 'disabled'} data-id="${item.id}">Kaufen</button>
          </div>
        </div>
      `;
    }).join('');

    prodList.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = buyMarketItem(this.player, btn.dataset.id);
        if (res.error) {
          alert(res.error);
        } else {
          this.updateUI();
          this.renderMarket();
        }
      });
    });

    // SELL PANEL LIST
    const sellList = document.getElementById('market-sell-list');
    const sellable = this.player.inventory.filter(i => i.type !== 'consumable'); // Keine Tränke verkaufen, nur Rüstung/Waffen/Stoffe
    const materials = this.player.activeQuests ? [] : []; // Quest-Gegenstände

    if (sellable.length === 0) {
      sellList.innerHTML = `<div class="placeholder-text" style="width:100%; text-align:center;">Keine Ausrüstungsteile zum Verkaufen im Inventar.</div>`;
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
          const res = sellInventoryItem(this.player, btn.dataset.id);
          if (res.success) {
            this.updateUI();
            this.renderMarket();
          }
        });
      });
    }
  }

  // --- 5. BLACKSMITH RENDER ---
  renderBlacksmith() {
    // BUY LIST
    const smithProds = document.getElementById('smith-products');
    const items = getBlacksmithInventory(this.player);

    smithProds.innerHTML = items.map(item => {
      const isAffordable = this.player.gold >= item.cost;
      let statText = '';
      if (item.damage) statText = `Schaden: ${item.damage}`;
      if (item.armor) statText = `Rüstung: ${item.armor}`;
      if (item.stats && Object.keys(item.stats).length > 0) {
        statText += ' | ' + Object.entries(item.stats).map(([k,v]) => `${k.substring(0,3)}: +${v}`).join(', ');
      }

      return `
        <div class="product-card">
          <span class="product-title">${item.name}</span>
          <span class="product-stats">${statText}</span>
          <div class="product-footer">
            <span class="product-cost">${item.cost} Gold</span>
            <button class="premium-btn small" ${isAffordable ? '' : 'disabled'} data-id="${item.id}">Kaufen</button>
          </div>
        </div>
      `;
    }).join('');

    smithProds.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = buyBlacksmithItem(this.player, btn.dataset.id);
        if (res.error) {
          alert(res.error);
        } else {
          this.updateUI();
          this.renderBlacksmith();
        }
      });
    });

    // UPGRADE LIST
    const upgradeList = document.getElementById('upgrade-items-list');
    const detailPanel = document.getElementById('upgrade-detail-panel');

    // Sammle alle verbesserbaren Items (ausgerüstet + Inventar)
    const upgradables = [];
    for (const slot in this.player.equipment) {
      if (this.player.equipment[slot]) upgradables.push({ ...this.player.equipment[slot], isEquipped: true, slotName: slot });
    }
    this.player.inventory.forEach(item => {
      if (item.type !== 'consumable') upgradables.push({ ...item, isEquipped: false });
    });

    if (upgradables.length === 0) {
      upgradeList.innerHTML = `<div class="placeholder-text">Keine aufwertbaren Gegenstände.</div>`;
      detailPanel.innerHTML = `<div class="placeholder-text">Wähle einen Gegenstand aus, um die Upgrade-Details zu sehen.</div>`;
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
          const cost = getUpgradeCost(item);
          const isAffordable = this.player.gold >= cost;

          // Neuer Wert-Vorschau berechnen (+25%)
          let upgradedDmg = item.damage ? Math.round(item.damage * 1.25) : 0;
          let upgradedArm = item.armor ? Math.round(item.armor * 1.25) : 0;

          detailPanel.innerHTML = `
            <div class="upgrade-detail-view">
              <div class="upgrade-title-line">${item.name} Aufwerten</div>
              <div class="upgrade-comparison">
                <div class="upgrade-col">
                  <strong>Aktuell</strong>
                  ${item.damage ? `<span>Schaden: ${item.damage}</span>` : ''}
                  ${item.armor ? `<span>Rüstung: ${item.armor}</span>` : ''}
                  ${Object.entries(item.stats).map(([k,v]) => `<span>${k}: +${v}</span>`).join('')}
                </div>
                <div class="arrow-sep">➔</div>
                <div class="upgrade-col right">
                  <strong>Verbessert (+${item.upgradeLevel + 1})</strong>
                  ${item.damage ? `<span>Schaden: ${upgradedDmg}</span>` : ''}
                  ${item.armor ? `<span>Rüstung: ${upgradedArm}</span>` : ''}
                  ${Object.entries(item.stats).map(([k,v]) => `<span>${k}: +${Math.round(v * 1.25 + 1)}</span>`).join('')}
                </div>
              </div>
              <div class="product-footer">
                <span class="product-cost">Kosten: ${cost} Gold</span>
                <button class="premium-btn" ${isAffordable ? '' : 'disabled'} id="btn-smith-upgrade-action">Upgrade durchführen</button>
              </div>
            </div>
          `;

          const actionBtn = document.getElementById('btn-smith-upgrade-action');
          actionBtn.addEventListener('click', () => {
            const res = upgradeItem(this.player, item.uniqueId);
            if (res.error) {
              alert(res.error);
            } else {
              alert(`Gegenstand erfolgreich aufgewertet!`);
              this.updateUI();
              this.renderBlacksmith();
            }
          });
        });
      });
    }
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

    // Aktive Quests rendern
    if (active.length === 0) {
      activeList.innerHTML = `<div class="placeholder-text" style="width:100%; text-align:center;">Keine aktiven Aufträge. Geh zum Dungeon, um deine Aufgaben zu erfüllen!</div>`;
    } else {
      activeList.innerHTML = active.map(quest => {
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

      activeList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = turnInQuest(this.player, btn.dataset.id);
          if (res.success) {
            alert(`Quest abgegeben! Du erhältst ${res.goldReward} Gold und ${res.xpReward} XP.`);
            this.updateUI();
            this.renderQuestBoard();
          }
        });
      });
    }
  }

  // --- 7. DUNGEON SELECT RENDER ---
  renderDungeonSelect() {
    const list = document.getElementById('dungeons-list');
    list.innerHTML = Object.values(DUNGEONS).map(dg => {
      const allowed = this.player.level >= dg.minLevel;
      return `
        <div class="dungeon-card" style="opacity: ${allowed ? 1 : 0.6}">
          <h3>${dg.name}</h3>
          <span class="dungeon-min-lvl">Erforderte Stufe: ${dg.minLevel}</span>
          <p>${dg.description}</p>
          <button class="premium-btn mt-1" ${allowed ? '' : 'disabled'} data-id="${dg.id}">Dungeon Betreten</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dungeonRun = new DungeonRun(this.player, btn.dataset.id);
        this.showScreen('screen-dungeon-crawler');
      });
    });
  }

  // --- 8. DUNGEON CRAWLER HUB RENDER ---
  renderDungeonCrawler() {
    if (!this.dungeonRun) return;

    // Header-Infos aktualisieren
    document.getElementById('dungeon-run-name').innerText = this.dungeonRun.dungeonMeta.name;

    // Grid Karte Rendern
    const gridEl = document.getElementById('dungeon-grid-map');
    if (gridEl) {
      const map = this.dungeonRun.getVisibleMap();
      const s = this.dungeonRun.gridSize;
      gridEl.style.gridTemplateColumns = `repeat(${s}, 40px)`;
      
      let html = '';
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const room = map[y][x];
          let color = '#333';
          let icon = '';
          if (room.explored) {
            color = '#555';
            if (room.type === 'start') icon = '🚪';
            else if (room.type === 'safe') icon = '⛺';
            else if (room.type === 'combat') icon = room.resolved ? '💀' : '👹';
            else if (room.type === 'event') icon = room.resolved ? '✔️' : '❓';
            else if (room.type === 'boss') icon = room.resolved ? '👑' : '👺';
          }
          
          let border = '1px solid #222';
          if (this.dungeonRun.playerPos.x === x && this.dungeonRun.playerPos.y === y) {
            border = '2px solid var(--border-gold)';
            color = 'var(--text-gold)';
          }
          
          html += `<div style="width: 40px; height: 40px; background: ${color}; border: ${border}; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">${icon}</div>`;
        }
      }
      gridEl.innerHTML = html;
    }

    // Movement Buttons
    const btnN = document.getElementById('btn-move-north');
    const btnS = document.getElementById('btn-move-south');
    const btnE = document.getElementById('btn-move-east');
    const btnW = document.getElementById('btn-move-west');

    if (btnN) {
      btnN.onclick = () => { if(this.dungeonRun.move(0, -1)) this.renderDungeonCrawler(); };
      btnS.onclick = () => { if(this.dungeonRun.move(0, 1)) this.renderDungeonCrawler(); };
      btnE.onclick = () => { if(this.dungeonRun.move(1, 0)) this.renderDungeonCrawler(); };
      btnW.onclick = () => { if(this.dungeonRun.move(-1, 0)) this.renderDungeonCrawler(); };
    }

    const room = this.dungeonRun.activeRoom;
    document.getElementById('dungeon-room-title').innerText = room.name;
    document.getElementById('dungeon-room-desc').innerText = room.description;

    // Visual Icon einstellen
    const visual = document.getElementById('dungeon-room-visual');
    if (room.type === 'combat') visual.innerText = '👹';
    else if (room.type === 'boss') visual.innerText = '💀';
    else if (room.type === 'safe') visual.innerText = '⛺';
    else if (room.type === 'event') {
      if (room.eventType === 'chest') visual.innerText = '🪙';
      else if (room.eventType === 'trap') visual.innerText = '💥';
      else if (room.eventType === 'altar') visual.innerText = '🛕';
    }
    else if (room.type === 'start') visual.innerText = '🚪';

    const actionDiv = document.getElementById('dungeon-action-buttons');
    const logDiv = document.getElementById('dungeon-event-feedback');
    const logsContent = document.getElementById('dungeon-event-logs');

    logDiv.classList.add('hidden');
    actionDiv.innerHTML = '';

    if (room.type === 'combat' || room.type === 'boss') {
      if (!room.resolved) {
        actionDiv.innerHTML = `<button class="premium-btn glowing" id="btn-room-fight">Kampf beginnen!</button>`;
        document.getElementById('btn-room-fight').onclick = () => {
          this.combat = new Combat(this.player, room.enemyKeys);
          this.selectedTargetId = null;
          this.combat.startCombat();
          this.showScreen('screen-combat');
        };
      } else {
        actionDiv.innerHTML = `<div style="color:var(--text-muted);">Gegner bereits besiegt.</div>`;
      }
    } 
    else if (room.type === 'safe') {
      if (room.resolved) {
        actionDiv.innerHTML = `<div style="color:var(--text-muted);">Ausgeruht.</div>`;
      } else {
        actionDiv.innerHTML = `<button class="premium-btn" id="btn-room-rest">Ausruhen (20% HP/Mana)</button>`;
        document.getElementById('btn-room-rest').onclick = () => {
          const reg = this.dungeonRun.restInSafeRoom();
          alert(`Die Gruppe rastet eine Weile. (+${reg.hpRegen} HP, +${reg.resRegen} Mana)`);
          this.updateUI();
          this.renderDungeonCrawler();
        };
      }
    } 
    else if (room.type === 'event') {
      if (room.resolved) {
        logDiv.classList.remove('hidden');
        logsContent.innerHTML = room.logs.map(l => `<div>${l}</div>`).join('');
        
        if (this.dungeonRun.isPlayerDead) {
          actionDiv.innerHTML = `<button class="danger-btn" id="btn-room-dead">Du bist gefallen...</button>`;
          document.getElementById('btn-room-dead').onclick = () => {
            this.showCombatResultOverlay(false, 'Du erlagst den Verletzungen einer Falle im Verlies.');
          };
        }
      } else {
        if (room.eventType === 'chest' || room.eventType === 'trap') {
          actionDiv.innerHTML = `<button class="premium-btn" id="btn-room-resolve-event">${room.eventType === 'chest' ? 'Truhe öffnen' : 'Weiter (Falle)'}</button>`;
          document.getElementById('btn-room-resolve-event').onclick = () => {
            this.dungeonRun.resolveEvent();
            this.updateUI();
            this.renderDungeonCrawler();
          };
        } 
        else if (room.eventType === 'altar') {
          actionDiv.innerHTML = `
            <button class="premium-btn" data-choice="beten">Am Altar beten (D20 Probe)</button>
            <button class="premium-btn" data-choice="blutopfer" style="background:linear-gradient(135deg, hsl(355, 75%, 45%) 0%, hsl(355, 90%, 25%) 100%);">Blutopfer erbringen (-15 HP)</button>
            <button class="premium-btn" data-choice="ignorieren" style="background:gray; border-color:gray;">Ignorieren</button>
          `;
          actionDiv.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
              this.dungeonRun.resolveEvent(btn.dataset.choice);
              this.updateUI();
              this.renderDungeonCrawler();
            };
          });
        }
      }
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

    // Wer ist gerade am Zug?
    const currentActor = this.combat.turnQueue[this.combat.currentTurnIndex]?.entity;

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
          icon = `<img src="${turn.entity.image}" class="avatar-img" alt="${turn.entity.name}">`;
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
        const buffs   = enemy.buffs.map(b   => `<span class="effect-badge" style="color:#28a745">${b.name} (${b.duration}r)</span>`).join('');
        const debuffs = enemy.debuffs.map(d => `<span class="effect-badge" style="color:var(--text-red)">${d.name} (${d.duration}r)</span>`).join('');

        const isSelected    = this.selectedTargetId === enemy.id;
        const isCurrentTurn = currentActor === enemy;
        const enemyImg      = enemy.image ? `<img src="${enemy.image}" class="avatar-img" alt="${enemy.name}">` : `👹`;

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
              <div class="effects-list">${phaseLabel}${debuffs}${buffs}</div>
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
          pAv = `<img src="${hero.image}" class="avatar-img" alt="${hero.name}">`;
        }

        const isSelectedHero = this.selectedHeroId === hero.name;

        const buffs = hero.buffs.map(b => `<span class="effect-badge" style="color:#28a745">${b.name} (${b.duration}r)</span>`).join('');
        const debuffs = hero.debuffs.map(d => `<span class="effect-badge" style="color:var(--text-red)">${d.name} (${d.duration}r)</span>`).join('');
        const shieldBadge = hero.shield ? `<span class="effect-badge" style="color:cyan">Schild: ${hero.shield} HP</span>` : '';

        // Resource Bar (nur für Spieler oder auch Companions? Zeigen wir es nur für den Spieler an)
        let resourceHtml = '';
        if (isPlayer) {
          const resPct = (hero.currentResource / hero.maxResource) * 100;
          const resClass = hero.classKey === 'KRIEGER' ? 'rage' : '';
          resourceHtml = `
            <div class="stat-bar-wrapper">
              <div class="bar-container resource ${resClass}">
                <div class="bar" style="width: ${resPct}%"></div>
                <span class="bar-text">${hero.currentResource} / ${hero.maxResource}</span>
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
              <div class="effects-list">${debuffs}${buffs}${shieldBadge}</div>
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
          const res = useConsumable(this.player, pot.uniqueId, true);
          if (res.error) {
            alert(res.error);
          } else {
            this.combat.addLog(res.text);
            
            // Trank schlucken verbraucht KEINE Runde, sondern ist eine freie Aktion!
            this.updateUI();
            this.renderCombat();
          }
        };
      });
    }
  }

  // Führt einen Skill mit Ziel aus
  executeTargetedSkill(targetId, forceSkill = null) {
    const skill = forceSkill;
    if (!skill) return;

    const res = this.combat.executePlayerTurn(skill, targetId);
    
    if (res && res.error) {
      alert(res.error);
    } else {
      this.updateUI();
      this.renderCombat();
      this.checkCombatEnd();
    }
  }

  // Überprüft, ob der Kampf zu Ende ist und zeigt Belohnungen
  checkCombatEnd() {
    if (!this.combat || !this.combat.isOver) return;

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
        } else {
          rewardText += `<li style="color:var(--text-gold)">+ Gegenstand: ${loot.name}</li>`;
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
      });

      this.showCombatResultOverlay(true, `Der Kampf ist vorbei! Ihr habt gewonnen!`, rewardText);
    } else {
      this.showCombatResultOverlay(false, `Die Gruppe wurde besiegt.`);
    }
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

  // --- 10. TALENT TREE (SKILL POINTS) RENDER ---
  renderTalentTree() {
    if (!this.player) return;

    document.getElementById('talent-points-count').innerText = this.player.skillPoints;

    const charClass = this.player.classKey;
    const spec = this.player.specKey;
    const talents = TALENT_TREES[charClass][spec] || [];

    const nodesGrid = document.getElementById('talent-tree-nodes');
    nodesGrid.innerHTML = talents.map(t => {
      const level = this.player.talents[t.id] || 0;
      const isMaxed = level >= t.maxLevel;
      const isUnlocked = level > 0;
      const nodeClass = isMaxed ? 'maxed' : isUnlocked ? 'unlocked' : '';
      
      return `
        <div class="talent-node ${nodeClass}">
          <span class="talent-level-badge">${level} / ${t.maxLevel}</span>
          <h3>${t.name}</h3>
          <p>${t.desc}</p>
          <button class="premium-btn small mt-1" ${(!isMaxed && this.player.skillPoints > 0) ? '' : 'disabled'} data-id="${t.id}">
            ${level === 0 ? 'Freischalten' : 'Verbessern'}
          </button>
        </div>
      `;
    }).join('');

    nodesGrid.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        const res = learnTalent(this.player, btn.dataset.id);
        if (res.error) {
          alert(res.error);
        } else {
          this.updateUI();
          this.renderTalentTree();
          this.saveGameToLocalStorage();
        }
      };
    });
  }
}

// Initialisiere die App, wenn das Dokument bereit ist
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
