# 🎨 Asset-Liste — NUR NOCH BENÖTIGTE ASSETS

**Dungeon Crawler RPG — Was noch generiert werden muss**
Stand: 2026-06 · Generatoren: Midjourney, DALL·E 3, Stable Diffusion

> Alles bisher Vorhandene (Portraits, NPCs, Bosse, Item-Icons, Umgebungen, UI) ist **vollständig generiert** und hier entfernt. Es fehlen nur noch die **17 unten gelisteten** Assets.

---

## 🎨 MASTER-STILPROMPT (an JEDEN Prompt anhängen)

```
dark fantasy RPG, painterly digital art, dramatic chiaroscuro lighting,
rich jewel tones (deep crimson, sapphire, amber, forest green),
detailed textures, concept art quality, no watermarks, no text, no UI frames
```

---

## 🔴 PRIORITÄT 1 — Raum-Szenen (7 Stück)

> Ersetzen die Emoji-Platzhalter im Raum-Panel. Format: **640×360 px** (16:9), PNG.
> **Pfad:** `assets/images/rooms/`
> Stil-Anhang: `dungeon room scene, atmospheric, no characters, no UI, dark fantasy RPG environment illustration, painterly, dramatic lighting, no text`

| # | Datei | Raum | Prompt |
|---|-------|------|--------|

| R6 | `room_altar.png` | Alter Schrein | An ancient shrine chamber, a stone altar with glowing arcane runes, candles and offerings, soft mystical blue light, sacred and mysterious, dungeon room scene, dark fantasy RPG environment, painterly, no characters, no text |
| R7 | `room_stairs.png` | Treppe nach unten | A dark stone stairway descending deeper into the dungeon, worn steps disappearing into shadow below, torch brackets on the walls, foreboding depth, dungeon room scene, dark fantasy RPG environment, painterly, no characters, no text |

---

## 🔴 PRIORITÄT 2 — Neue Gegner (8 Stück)

> Format: **400×400 px**, 3/4-Ansicht, dunkler/transparenter Hintergrund, PNG.
> **Pfad:** `assets/images/`
> Stil-Anhang: `creature portrait, dark dungeon background, dramatic lighting, dark fantasy RPG monster illustration, detailed textures, no text`

| # | Datei | Gegner (Rolle) | Prompt |
|---|-------|----------------|--------|
| N1 | `enemy_spiderling.png` | Spinnenbrut (Schwarm-DD) | A small fast cave spiderling, half the size of an adult spider, glossy black body with red markings, many tiny legs, glinting eyes, scuttling aggressively, dark cave background, dark fantasy RPG monster illustration, no text |
| N2 | `enemy_venom_lurker.png` | Giftlauerer (DoT) | A bloated venomous cave creature, sickly green translucent skin showing pulsing poison sacs, dripping toxic ooze, hunched and lurking, dark cave background, dark fantasy RPG monster illustration, no text |
| N3 | `enemy_goblin_shaman.png` | Goblin-Schamane (Heiler) | A wizened goblin shaman, green skin, bone fetishes and feathers, holding a glowing skull-topped staff, casting a sickly green healing light, hunched and cunning, dark fortress background, dark fantasy RPG monster illustration, no text |
| N4 | `enemy_goblin_bomber.png` | Goblin-Bombenwerfer (AoE) | A manic goblin clutching crude lit bombs, soot-stained face, wild grin, bandolier of explosives across chest, mid-throw pose, sparks flying, dark fortress background, dark fantasy RPG monster illustration, no text |
| N5 | `enemy_ork_berserker.png` | Ork-Berserker (Glaskanone-DD) | A frenzied shirtless orc berserker, grey-green muscled body covered in war scars and red war paint, dual jagged axes raised, roaring with bloodshot eyes, no armor, reckless fury, burning fortress background, dark fantasy RPG monster illustration, no text |
| N6 | `enemy_ork_warchief.png` | Ork-Kriegshäuptling (Buffer) | A towering orc warchief in heavy trophy-laden armor, holding a banner and a war horn, commanding presence, tusked roar rallying his troops, dark iron armor with skull standards, burning fortress background, dark fantasy RPG monster illustration, no text |
| N7 | `enemy_ghoul.png` | Ghul (Lebensraub-DD) | A feral undead ghoul, grey rotting flesh, elongated claws, hunched predatory stance, hungry hollow eyes, bits of grave dirt clinging to it, catacombs background, dark fantasy RPG monster illustration, no text |
| N8 | `enemy_wraith.png` | Schattengeist (Mana-Dieb/Caster) | A spectral wraith, translucent tattered robes flowing into wisps of shadow, no visible face only two cold glowing eyes, skeletal hands crackling with dark energy, floating ominously, catacombs background, dark fantasy RPG monster illustration, no text |

---

## 🟡 PRIORITÄT 3 — Elite-Varianten (2 Stück, optional)

> Stärkere "Champion"-Versionen. **Pfad:** `assets/images/`

| # | Datei | Gegner | Prompt |
|---|-------|--------|--------|
| E1 | `enemy_elite_ork.png` | Ork-Champion | An elite orc champion, massive and battle-hardened, ornate black plate armor with golden trophies, glowing red eyes, wielding an enormous two-handed axe wreathed in faint dark energy, intimidating aura, burning fortress background, dark fantasy RPG monster illustration, no text |
| E2 | `enemy_elite_skeleton.png` | Knochenlord | An elite skeletal warlord, blackened ancient bones, a tattered crown, wielding a runed greatsword glowing with necrotic green light, cloak of shadows, commanding undead presence, catacombs background, dark fantasy RPG monster illustration, no text |

---

## 📋 ZUSAMMENFASSUNG

| Prio | Kategorie | Anzahl | Pfad |
|------|-----------|--------|------|
| 🔴 1 | Raum-Szenen | 2 | `assets/images/rooms/` |
| 🔴 2 | Neue Gegner | 8 | `assets/images/` |
| 🟡 3 | Elite-Varianten (optional) | 2 | `assets/images/` |
| | **GESAMT** | **12** | |

> **Wichtig:** Code (Stats, Skills, Rollen, Monster-Pools, Raum-Bild-System) ist bereits angelegt — die Bilder greifen **automatisch**, sobald sie im jeweiligen Ordner liegen. Bis dahin laufen Emoji-/👹-Fallbacks.

---

## 📐 Technische Specs

| Asset-Typ | Größe | Format | Transparenz |
|-----------|-------|--------|-------------|
| Raum-Szenen | 640×360 | PNG | optional |
| Gegner | 400×400 | PNG | Ja oder dunkler BG |
