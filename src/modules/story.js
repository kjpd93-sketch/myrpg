/**
 * Story, Lore, NPCs & Companion-Kommentare
 * ─────────────────────────────────────────────────────────────────────────────
 * - WORLD_LORE: Hintergrundgeschichte der Welt
 * - STORY_ACTS: 3-Akt-Kampagnenstruktur
 * - VILLAGE_NPCS: Dorf-NPCs mit Dialogen
 * - DUNGEON_LORE: Fundstücke in Dungeons (Tagebücher, Inschriften etc.)
 * - COMPANION_COMMENTS: Reaktionen auf Dungeon-Events
 * - CAMPFIRE_STORIES: Lagerfeuer-Erzählungen der Companions
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WELTHINTERGRUND
// ═══════════════════════════════════════════════════════════════════════════════
export const WORLD_LORE = {
  name: 'Aethermoor',
  subtitle: 'Das Land der zerbrochenen Siegel',
  intro: `Vor Jahrhunderten versiegelten die Fünf Wächter das Tor zum Abgrund — eine Pforte,
durch die das Chaos in die Welt drängte. Doch die Siegel zerbrechen. Eines nach dem anderen.
In den Tiefen unter der Erde erwachen vergessene Schrecken, und die Dungeons,
einst Gefängnisse des Bösen, werden zu Jagdgründen für jene, die mutig genug sind hinabzusteigen.

Du bist einer von ihnen. Ein Abenteurer im Dorf Grauenfels — dem letzten Außenposten
an der Grenze zum Verfall. Hier, wo die Welt noch hält, beginnt deine Geschichte.`,

  factions: {
    WÄCHTERORDEN: 'Ein uralter Orden, der die Siegel bewacht. Nur noch wenige Mitglieder leben.',
    SCHWARZE_HAND: 'Eine Kult-Organisation, die die Siegel brechen will, um Macht zu erlangen.',
    GRAUENFELS: 'Das Dorf der Abenteurer — pragmatisch, rau, aber mit einem starken Zusammenhalt.',
    TIEFENWÄCHTER: 'Zwerge, die in den Dungeons selbst leben und die ältesten Tunnel kennen.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// KAMPAGNEN-AKTE
// ═══════════════════════════════════════════════════════════════════════════════
export const STORY_ACTS = [
  {
    id: 'ACT_1',
    title: 'Akt I: Das Erwachen',
    description: 'Die ersten Siegel brechen. Monster strömen aus den Tiefen. Grauenfels braucht Helden.',
    dungeonRange: [1, 3], // Dungeon 1-3 gehören zu Akt 1
    bossLore: {
      'boss_spider_queen': 'Die Spinnenkönigin nistete sich ein, als das erste Siegel brach. Sie ist nur ein Vorbote.',
      'boss_goblin_king': 'Der Goblinkönig wurde von der Schwarzen Hand geschickt, um die Tunneleingänge zu kontrollieren.',
      'boss_skeleton_lord': 'Ein gefallener Wächter, korrumpiert durch das Chaos. Er erinnert sich nicht mehr an seinen Eid.'
    },
    completionText: 'Die ersten Bedrohungen sind gebannt. Doch im Dungeon-Inneren spürt ihr eine dunklere Präsenz...',
    unlocks: ['npc_wanderer', 'building_library']
  },
  {
    id: 'ACT_2',
    title: 'Akt II: Die Verschwörung',
    description: 'Die Schwarze Hand operiert im Verborgenen. Jemand in Grauenfels ist ein Verräter.',
    dungeonRange: [4, 6],
    bossLore: {
      'boss_dark_mage': 'Ein Handlanger der Schwarzen Hand. Er trägt ein Fragment des zweiten Siegels bei sich.',
      'boss_ork_warlord': 'Vom Kult angeheuert, um die Tiefenwächter auszulöschen. Ohne ihre Hilfe bleibt das dritte Siegel ungeschützt.',
      'boss_vampire_lord': 'Ein unsterblicher Aristokrat, der das ewige Leben dem Abgrund verdankt. Er kennt den Verräter.'
    },
    completionText: 'Der Vampirlord verrät euch mit letztem Atem: Der Verräter ist... einer der Dorfältesten.',
    unlocks: ['npc_tiefenwächter', 'building_forge_upgrade']
  },
  {
    id: 'ACT_3',
    title: 'Akt III: Der Abgrund',
    description: 'Das letzte Siegel bricht. Der Weg zum Tor steht offen. Es gibt kein Zurück.',
    dungeonRange: [7, 9],
    bossLore: {
      'boss_fallen_warden': 'Der letzte Wächter, korrumpiert und wahnsinnig. Er glaubt, die Welt zu retten, indem er sie zerstört.',
      'boss_abyss_herald': 'Der Herold des Abgrunds. Wenn er fällt, öffnet sich das Tor — und ihr müsst hindurch.',
      'boss_chaos_incarnate': 'Das Chaos selbst, manifestiert. Der finale Kampf um Aethermoor.'
    },
    completionText: 'Das Tor schließt sich. Die Siegel erneuern sich. Aethermoor ist gerettet — vorerst.',
    unlocks: ['ending_screen']
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// DORF-NPCs — Dialoge, Persönlichkeiten, Funktionen
// ═══════════════════════════════════════════════════════════════════════════════
export const VILLAGE_NPCS = {
  schmied: {
    id: 'schmied',
    name: 'Grimjaw der Schmied',
    title: 'Meisterschmied von Grauenfels',
    portrait: 'assets/images/npcs/npc_schmied.png',
    location: 'Schmiede',
    personality: 'Brummig, wortkarg, aber mit goldenem Herzen. Hasst Goblins.',
    dialogues: {
      greeting: [
        'Hmph. Was willst du? Ich hab zu tun.',
        'Ah, du schon wieder. Hoffe deine Waffe hat gehalten.',
        'Stell dich nicht in die Hitze, wenn du nicht schmieden willst.',
        'Die Klingen, die ich schmiede, zerbrechen nicht. Die Helden, die sie tragen... manchmal schon.'
      ],
      afterDungeon: [
        'Du lebst noch. Gut. Bedeutet weniger Grabsteine für den Steinmetz.',
        'Wie war\'s da unten? Egal, erzähl mir\'s nicht. Ich seh\'s an deiner Rüstung.',
        'Bring mir nächstes Mal etwas Dunkel-Erz mit. Das Zeug schmiedet sich wie ein Traum.'
      ],
      quest: [
        'Hör zu — in den Tiefen gibt es Erz, das kein normaler Bergmann je finden würde. Schwarzstahl. Bring mir 3 Brocken und ich schmiede dir etwas Besonderes.',
        'Die Goblins haben meinen alten Amboss gestohlen. Klingt lächerlich, aber der Amboss ist 200 Jahre alt und mit Runen beschlagen. Bring ihn zurück.'
      ],
      lore: [
        'Mein Großvater schmiedete die Ketten des ersten Siegels. Gute Arbeit — hat Jahrhunderte gehalten.',
        'Die Schwarze Hand? Pah. Die kaufen billige Klingen aus dem Osten. Kein Ehrgefühl.',
        'Früher kamen Zwerge aus den Tiefen zum Handeln. Seit die Monster kamen... Stille.'
      ]
    }
  },

  wirtin: {
    id: 'wirtin',
    name: 'Mara die Wirtin',
    title: 'Inhaberin des "Rostigen Bechers"',
    portrait: 'assets/images/npcs/npc_wirtin.png',
    location: 'Gasthaus',
    personality: 'Herzlich, neugierig, sammelt Gerüchte. Kennt jeden im Dorf.',
    disappearsAfterAct: 2, // Verräterin — flieht nach dem Reveal (Akt II)
    dialogues: {
      greeting: [
        'Willkommen, Liebes! Setz dich, trink etwas. Du siehst aus, als bräuchtest du es.',
        'Ah, mein Lieblingsgast! Was darf\'s sein — Bier, Met oder Informationen?',
        'Die Stühle knarzen, das Feuer knistert — fühl dich wie zu Hause.',
        'Du glaubst nicht, was mir heute der Händler erzählt hat...'
      ],
      rumors: [
        'Man sagt, im dritten Stockwerk des alten Dungeons gibt es einen verborgenen Raum. Hinter einer Wand, die nur bei Mondlicht durchsichtig wird.',
        'Ein Reisender sprach von leuchtenden Pilzen in den Tiefen. Wer sie isst, sieht Dinge... Dinge, die waren und die kommen werden.',
        'Die Tiefenwächter-Zwerge handeln nicht mehr mit uns. Irgendetwas hat sie verschreckt. Etwas Großes.',
        'Letzte Nacht hat der alte Aldric im Schlaf geschrien. "Sie kommen durch die Risse", hat er gesagt. Immer wieder.',
        'Der Wanderer, der gestern ankam — seine Augen... wie Kohle. Er hat nach dem Siegel gefragt. Dem dritten.',
        'Ein Abenteurer kam letzte Woche aus dem Dungeon zurück. Ohne seine Gruppe. Spricht seitdem kein Wort.'
      ],
      afterDungeon: [
        'Du riechst nach... Moder und Verzweiflung. Das Übliche also! Hier, ein Bier aufs Haus.',
        'Erzähl, erzähl! Was hast du gesehen? Die anderen Gäste hören auch gerne zu.',
        'Jedes Mal, wenn ihr zurückkommt, atme ich auf. Nicht alle haben dieses Glück.'
      ],
      lore: [
        'Grauenfels war einst eine Festung der Wächter. Das Gasthaus? Der alte Speisesaal.',
        'Mein Großvater sagte, unter dem Dorf verläuft ein Tunnel direkt zum Abgrund. Versiegelt natürlich. ...Hoffentlich.',
        'Die fünf Statuen am Dorfbrunnen? Das sind die Wächter. Fünf Helden, die alles gaben.'
      ]
    }
  },

  wanderer: {
    id: 'wanderer',
    name: 'Der Wanderer',
    title: 'Mysteriöser Reisender',
    portrait: 'assets/images/npcs/npc_wanderer.png',
    location: 'Dorfrand',
    personality: 'Geheimnisvoll, spricht in Rätseln. Weiß mehr als er zugibt.',
    appearsAfterAct: 1, // Erst nach Akt 1 sichtbar
    dialogues: {
      greeting: [
        '...Du bist es also. Ich habe dich erwartet.',
        'Die Sterne sprachen von dir. Nun, die Sterne sprechen von vielem.',
        'Komm näher. Ich habe etwas, das du sehen musst.',
        'Wieder ein Tag. Wieder nähert sich das Ende. Oder der Anfang. Beides ist dasselbe.'
      ],
      cryptic: [
        'Drei Siegel sind gebrochen. Zwei halten. Eines davon... nicht mehr lange.',
        'Der Verräter trägt eine Maske aus Freundlichkeit. Achte auf die, die nie schweigen.',
        'Im Abgrund gibt es keinen Tod. Nur... Veränderung. Endlose, schreckliche Veränderung.',
        'Ich war einmal wie du. Dann sah ich, was hinter dem Tor wartet. Ich laufe seitdem.',
        'Die Schwarze Hand hat fünf Finger. Einen hast du bereits abgetrennt. Vier bleiben.',
        'Frag dich: Warum öffnen sich die Dungeons gerade JETZT für Abenteurer? Zufall? Nein.'
      ],
      quest: [
        'In der Tiefe liegt ein Kristall — blau wie Eis, kalt wie der Tod. Bring ihn mir. Frag nicht warum.',
        'Es gibt einen Ort im Dungeon, an dem die Wände flüstern. Hör zu. Merke dir die Worte. Dann komm zurück.'
      ],
      lore: [
        'Ich bin der letzte des Wächterordens. Nein — der vorletzte. Der andere ist... nicht mehr er selbst.',
        'Die Siegel wurden aus dem Blut der Wächter geschmiedet. Wächterblut bricht sie, Wächterblut erneuert sie.',
        'Aethermoor stirbt nicht mit einem Knall. Es verfällt. Langsam. Wie Rost auf einer vergessenen Klinge.'
      ]
    }
  },

  haendler: {
    id: 'haendler',
    name: 'Fink der Krämer',
    title: 'Reisender Händler',
    portrait: 'assets/images/npcs/npc_haendler.png',
    location: 'Marktplatz',
    personality: 'Schlitzohrig, redet viel, macht fragwürdige Deals. Aber zuverlässig.',
    dialogues: {
      greeting: [
        'Ah, ein Kenner! Komm, schau dir meine Waren an — alles vom Feinsten!',
        'Psst! Heute hab ich was Besonderes. Ganz frisch aus den Tiefen... äh, importiert.',
        'Gold gegen Qualität — fairer geht\'s nicht! Naja, für mich zumindest.',
        'Du brauchst was? Ich hab\'s. Oder ich kenn jemanden, der jemanden kennt.'
      ],
      afterDungeon: [
        'Oho! Schwer beladen heute? Zeig mal, zeig mal — ich mach dir einen guten Preis. Für MICH.',
        'Die besten Kunden sind die, die lebend wiederkommen. Du gehörst zu meinen Lieblingen.',
        'Dungeon-Beute? Lass mich raten — Spinnweben, Knochen und... oh, DAS ist interessant.'
      ],
      lore: [
        'Ich reise viel. Zu viel, sagt meine Frau. Aber die Straßen werden gefährlicher. Mehr Monster, weniger Karawanen.',
        'Im Osten gibt es Dörfer, die über Nacht verschwunden sind. Einfach... weg. Nur leere Häuser.',
        'Die Schwarze Hand? Gute Kunden, schlechte Menschen. Ich verkaufe ihnen nichts mehr. ...Meistens.'
      ]
    }
  },

  heiler: {
    id: 'heiler',
    name: 'Schwester Elia',
    title: 'Tempelheilerin',
    portrait: 'assets/images/npcs/npc_heiler.png',
    location: 'Tempel',
    personality: 'Sanft, gütig, aber mit einem Kern aus Stahl. Heilt jeden — auch Feinde.',
    dialogues: {
      greeting: [
        'Möge das Licht dich beschützen, Kind.',
        'Du siehst müde aus. Komm, lass mich nach deinen Wunden sehen.',
        'Jeder, der durch diese Tür kommt, verdient Heilung. Ohne Ausnahme.',
        'Die Götter sehen dein Opfer. Vergiss das nicht, wenn die Dunkelheit zu stark wird.'
      ],
      afterDungeon: [
        'Oh mein... setz dich sofort hin! Diese Wunde hätte genäht werden müssen. Vor Stunden!',
        'Du hast überlebt. Gut. Aber bitte, sei beim nächsten Mal vorsichtiger. Mein Herz verträgt das nicht.',
        'Die Dunkelheit da unten... ich spüre sie manchmal bis hierher. Pass auf deine Seele auf, nicht nur deinen Körper.'
      ],
      lore: [
        'Dieser Tempel stand hier, bevor das Dorf gebaut wurde. Er markiert den Ort, an dem der erste Wächter fiel.',
        'Heilige Magie wird schwächer in der Nähe der gebrochenen Siegel. Das beunruhigt mich zutiefst.',
        'Es heißt, wer alle fünf Schreine in den Dungeons berührt, wird von den Wächtern gesegnet.'
      ]
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DUNGEON-LORE: Zufällige Fundstücke in Räumen
// ═══════════════════════════════════════════════════════════════════════════════
export const DUNGEON_LORE = {
  // Allgemeine Funde (überall möglich)
  general: [
    {
      type: 'tagebuch',
      title: 'Vergilbtes Tagebuch',
      icon: '📜',
      text: `"Tag 14 — Wir sind zu tief gegangen. Marten hört Stimmen hinter den Wänden.
Ich sage ihm, es ist der Wind. Aber es gibt keinen Wind hier unten."`,
      flavor: 'Die letzten Seiten sind mit Blut verschmiert.'
    },
    {
      type: 'tagebuch',
      title: 'Zerrissene Notiz',
      icon: '📜',
      text: `"Wenn du das findest: GEHE NICHT WEITER. Das dritte Stockwerk ist eine Falle.
Die Wände bewegen sich. Sie lassen dich rein. Aber nicht raus. — K."`,
      flavor: 'Die Schrift wird zum Ende hin unleserlich.'
    },
    {
      type: 'inschrift',
      title: 'Wand-Inschrift',
      icon: '🪨',
      text: `In die Wand geritzt, mit etwas Scharfem:
"HIer RuhT kEiN fRieDeN — NuR hUnGer"`,
      flavor: 'Die Buchstaben sind ungleichmäßig, als hätte jemand im Dunkeln geschrieben.'
    },
    {
      type: 'inschrift',
      title: 'Uralte Runen',
      icon: '🪨',
      text: `Leuchtende Symbole an der Decke. Du kannst sie nicht lesen, aber sie fühlen sich... warm an.
Als ob sie dich beschützen wollten.`,
      flavor: 'Vielleicht ein Überbleibsel der Wächter-Magie.'
    },
    {
      type: 'gegenstand',
      title: 'Zerbrochener Schild',
      icon: '🛡️',
      text: `Ein Schild mit dem Wappen des Wächterordens — fünf Sterne um ein geschlossenes Tor.
Tief gespalten durch einen Hieb, der eigentlich unmöglich sein sollte.`,
      flavor: 'Was für eine Kreatur konnte DAS anrichten?'
    },
    {
      type: 'gegenstand',
      title: 'Kinderspielzeug',
      icon: '🧸',
      text: `Ein geschnitztes Holzpferd, erstaunlich gut erhalten. Was macht ein Spielzeug hier unten?
Auf der Unterseite steht in kindlicher Schrift: "Für Papa, der nicht wiederkam."`,
      flavor: 'Ein Stich ins Herz.'
    },
    {
      type: 'tagebuch',
      title: 'Ledergebundenes Journal',
      icon: '📜',
      text: `"Die Kreatur im dritten Stockwerk ist kein gewöhnliches Monster. Sie war einmal... einer von uns.
Ein Wächter. Sein Name war Aldric. Er hat das Siegel berührt — und es hat ihn verändert."`,
      flavor: 'Der Autor hat den Namen mehrfach durchgestrichen und neu geschrieben, als wäre er unsicher.'
    },
    {
      type: 'inschrift',
      title: 'Warnung in Blut',
      icon: '⚠️',
      text: `An der Wand, in getrockneter roter Farbe (hoffentlich):
"SIE HÖREN DEINE GEDANKEN. DENKE AN NICHTS."`,
      flavor: 'Du versuchst, nicht daran zu denken. Es gelingt dir nicht.'
    },
    {
      type: 'gegenstand',
      title: 'Kaputte Laterne',
      icon: '🏮',
      text: `Eine Zwergen-Laterne, kunstvoll gearbeitet. Das Licht darin ist erloschen, aber die Runen auf
dem Metall glimmen noch schwach. Die Tiefenwächter waren hier — vor langer Zeit.`,
      flavor: 'Du fragst dich, was sie vertrieben hat.'
    },
    {
      type: 'tagebuch',
      title: 'Brief an Niemanden',
      icon: '📜',
      text: `"Liebste Mara — wenn das hier mein Ende sein sollte, wisse:
Es war keine Dummheit, die mich herführte. Es war Hoffnung.
Die Hoffnung, genug Gold für uns beide zu finden. Dein Theodric."`,
      flavor: 'Der Brief wurde nie abgeschickt. Du nimmst ihn mit.'
    },
    {
      type: 'inschrift',
      title: 'Fremdartige Symbole',
      icon: '🪨',
      text: `Spiralförmige Zeichen, die in keiner bekannten Sprache geschrieben sind.
Wenn du sie zu lange anstarrst, beginnen sie sich zu bewegen. Du schaust weg.`,
      flavor: 'Manche Dinge sollte man nicht zu genau betrachten.'
    },
    {
      type: 'gegenstand',
      title: 'Leere Phiole',
      icon: '🧪',
      text: `Eine gläserne Phiole, beschriftet mit "Siegeltinte — NICHT ÖFFNEN".
Sie ist leer. Jemand hat sie geöffnet.`,
      flavor: 'Ein leichter Geruch nach Ozon und... Verzweiflung?'
    }
  ],

  // Spezielle Funde je nach Dungeon-Typ/Akt
  act1: [
    {
      type: 'tagebuch', title: 'Wächter-Bericht', icon: '📜',
      text: `"Bericht an den Orden: Das erste Siegel zeigt Risse. Empfehle sofortige Verstärkung.
Unterschrift: Wächter Aldric, Posten Grauenfels."`,
      flavor: 'Datiert vor über einem Jahr. Die Verstärkung kam nie.'
    },
    {
      type: 'inschrift', title: 'Goblin-Kritzeleien', icon: '🪨',
      text: `Primitive Zeichnungen an der Wand. Ein großes Wesen mit Hörnern, umgeben von kleinen
Figuren auf Knien. Darunter in gebrochenem Gemein: "GROßER CHEF KOMMT BALD"`,
      flavor: 'Die Goblins beten etwas an. Etwas, das noch kommen soll.'
    }
  ],

  act2: [
    {
      type: 'tagebuch', title: 'Schwarze-Hand-Korrespondenz', icon: '📜',
      text: `"Phase 2 eingeleitet. Der Kontakt im Dorf meldet: Die Abenteurer sind stärker als erwartet.
Plan anpassen. Siegel 3 hat Priorität. Vernichte diese Nachricht nach dem Lesen."`,
      flavor: 'Jemand hat sie NICHT vernichtet. Zum Glück für dich.'
    },
    {
      type: 'gegenstand', title: 'Kultisten-Maske', icon: '🎭',
      text: `Eine schwarze Maske aus poliertem Stein. Fünf Finger sind auf die Stirn graviert —
das Zeichen der Schwarzen Hand. Sie fühlt sich unangenehm warm an.`,
      flavor: 'Du verstaust sie vorsichtig. Vielleicht erkennt jemand im Dorf den Besitzer.'
    }
  ],

  act3: [
    {
      type: 'inschrift', title: 'Warnung der Wächter', icon: '🪨',
      text: `Eingebrannt in den Stein, mit heiliger Flamme:
"JENSEITS DIESER SCHWELLE ENDET DIE BEKANNTE WELT.
WER WEITERGEHT, MÖGE WISSEN: ZURÜCK IST NICHT GARANTIERT."`,
      flavor: 'Die Flamme flackert noch immer. Nach Jahrhunderten.'
    },
    {
      type: 'tagebuch', title: 'Letzter Eintrag des Wanderers', icon: '📜',
      text: `"Ich habe das Tor gesehen. Es ist... schön. Auf eine Art, die keinen Sinn ergibt.
Wie ein Sonnenaufgang in Farben, die nicht existieren sollten.
Ich verstehe jetzt, warum manche es ÖFFNEN wollen. Und das macht mir mehr Angst als alles andere."`,
      flavor: 'Die Handschrift ist die des Wanderers. Aber ruhiger als sein übliches Zittern.'
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANION-KOMMENTARE — Reaktionen auf Dungeon-Situationen
// ═══════════════════════════════════════════════════════════════════════════════
export const COMPANION_COMMENTS = {
  // Nach Klasse gruppiert — jede Klasse hat eine "Persönlichkeit"
  KRIEGER: {
    enterRoom: [
      'Formiert euch. Ich gehe voran.',
      'Hmm. Riecht nach Ärger.',
      'Bleibt hinter mir.',
      'Das Schwert bleibt gezückt.'
    ],
    findTrap: [
      'Eine Falle? Pfff. Für Feiglinge.',
      'Vorsicht! Da — seht ihr die Drähte?',
      'Hätte mich beinahe erwischt. Beinahe.'
    ],
    findChest: [
      'Beute! Endlich etwas Brauchbares.',
      'Öffne es. Aber vorsichtig — könnte eine Falle sein.',
      'Gold? Waffen? Mir egal, solange es nützlich ist.'
    ],
    beforeBoss: [
      'Das ist es. Ich spüre es. Der Boss ist nah.',
      'Alle bereit? Dann vorwärts. Kein Zurück.',
      'Für Grauenfels. Für die Gefallenen.'
    ],
    afterCombat: [
      'Ha! Zu leicht.',
      'Noch stehen wir. Gut.',
      'Weitergehen. Hier stinkt es nach Tod.',
      'Mein Arm tut weh. Egal. Weiter.'
    ],
    lowHp: [
      'Nur... ein Kratzer. *hustet*',
      'Ich brauche einen Moment... nein, geht schon.',
      'Das wird eine hübsche Narbe.'
    ],
    altar: [
      'Götter... ich vertraue keinem von ihnen.',
      'Beten? Ich verlasse mich lieber auf mein Schwert.',
      'Tu was du willst. Ich halte Wache.'
    ]
  },

  PALADIN: {
    enterRoom: [
      'Möge das Licht uns den Weg weisen.',
      'Ich spüre Dunkelheit hier. Seid auf der Hut.',
      'Zusammen sind wir stärker als alles hier unten.',
      'Vorwärts — mit Zuversicht, nicht mit Angst.'
    ],
    findTrap: [
      'Wartet! Hier stimmt etwas nicht. Ich spüre es.',
      'Hinterhältig. Aber das Licht offenbart alle Fallen.',
      'Vorsicht, Freunde. Nicht alles ist, wie es scheint.'
    ],
    findChest: [
      'Ein Segen auf unserem Weg! Lasst uns nachsehen.',
      'Möge der Inhalt uns auf unserer Mission helfen.',
      'Ich bete, dass es Heiltränke sind. Wir brauchen sie.'
    ],
    beforeBoss: [
      'Dieses Übel endet HIER. Im Namen des Lichts!',
      'Stellt euch hinter mich. Mein Schild wird halten.',
      'Mögen die Wächter uns Kraft geben für das, was kommt.'
    ],
    afterCombat: [
      'Das Licht hat gesiegt. Diesmal.',
      'Ist jemand verletzt? Lasst mich helfen.',
      'Ruht euch kurz aus. Wir ziehen bald weiter.',
      'Jeder besiegte Feind bringt uns dem Frieden näher.'
    ],
    lowHp: [
      'Mein Glaube... hält mich aufrecht...',
      'Ich... werde nicht fallen. Nicht heute.',
      'Das Licht... es flackert. Aber es erlischt nicht.'
    ],
    altar: [
      'Ein heiliger Ort! Selbst hier unten wirkt das Göttliche.',
      'Lasst mich beten. Vielleicht erhalten wir Segen.',
      'Ich spüre eine Präsenz... gütig, aber fordernd.'
    ]
  },

  MAGIER: {
    enterRoom: [
      'Faszinierend... die magischen Ströme hier sind instabil.',
      'Moment, lasst mich die Runen analysieren...',
      'Arkane Energie — überall. Vorsicht mit Zaubern.',
      'Hmm. Interessant. Und potenziell tödlich.'
    ],
    findTrap: [
      'Oh! Eine magische Konstruktion! Simpel, aber effektiv.',
      'Keine Sorge, ich kann den Auslöser neutrali— VORSICHT!',
      'Wer auch immer das gebaut hat, verstand sich auf Runen.'
    ],
    findChest: [
      'Ich detektiere keine magischen Fallen. ...Meistens liege ich richtig.',
      'Vielleicht ein Zauberbuch? Man darf doch hoffen!',
      'Öffnet es. Ich stehe... hier hinten. Sicherheitshalber.'
    ],
    beforeBoss: [
      'Die Mana-Konzentration hier ist enorm. Bereitet euch vor.',
      'Ich werde aus der Ferne unterstützen. Das ist keine Feigheit, das ist Strategie.',
      'Diese Kreatur... ihre magische Signatur ist... verstörend.'
    ],
    afterCombat: [
      'Notiz an mich selbst: Diesen Zauber dokumentieren.',
      'Mein Mana ist niedrig. Einen Moment...',
      'Hat jemand die Kristalle aufgehoben? Die könnten nützlich sein.',
      'Gut, dass ich den Frostzauber vorbereitet hatte.'
    ],
    lowHp: [
      'Das ist... suboptimal. Definitiv suboptimal.',
      'Ich bin Forscher, kein Krieger... das merkt man gerade...',
      'Schilde! Ich brauche Schilde! Warum halten sie nicht?!'
    ],
    altar: [
      'FASZINIEREND! Die Energiematrix hier ist Jahrhunderte alt!',
      'Nicht anfassen! Lasst mich erst die Resonanzen prüfen.',
      'Die arkanen Muster deuten auf... oh. Oh nein. Doch auf etwas Gutes, denke ich.'
    ]
  },

  PRIESTER: {
    enterRoom: [
      'Ich spüre Seelen hier. Rastlose Seelen.',
      'Bleibt beisammen. Mein Licht wird euch schützen.',
      'Die Stille hier... sie ist nicht natürlich.',
      'Ich bete für uns alle. Leise, aber ständig.'
    ],
    findTrap: [
      'Wartet — meine Sinne warnen mich. Da ist etwas...',
      'Jemand wollte nicht, dass wir weiterkommen. Tja.',
      'Ich heile was ich kann. Aber besser, wir vermeiden Verletzungen.'
    ],
    findChest: [
      'Möge sein Inhalt zum Guten dienen.',
      'Ich hoffe auf Kräuter. Meine Vorräte schwinden.',
      'Seid vorsichtig — Gier ist ein schlechter Ratgeber hier unten.'
    ],
    beforeBoss: [
      'Ich werde euch heilen. Egal was kommt — ich lasse niemanden sterben.',
      'Spürt ihr das? Soviel Schmerz an diesem Ort...',
      'Mögen die Götter uns beistehen. Ich werde mein Bestes geben.'
    ],
    afterCombat: [
      'Kommt her, lasst mich eure Wunden versorgen.',
      'Wir leben. Danke den Göttern.',
      'Die Seelen der Gefallenen... mögen sie Frieden finden.',
      'Einen Moment der Stille für unsere Gegner. Auch sie waren einst... etwas anderes.'
    ],
    lowHp: [
      'Ich... kann mich selbst heilen... einen Moment...',
      'Das Licht in mir schwankt... aber es erlischt nicht...',
      'Wer... heilt den Heiler? Ah. Richtig. Ich selbst.'
    ],
    altar: [
      'Ein Altar! Hier ist die Verbindung zum Göttlichen noch stark.',
      'Lasst mich beten. Die Götter werden uns antworten.',
      'Ich fühle Frieden hier. Zum ersten Mal seit wir eingetreten sind.'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// LAGERFEUER-GESCHICHTEN — Beim Rasten im Dungeon
// ═══════════════════════════════════════════════════════════════════════════════
export const CAMPFIRE_STORIES = [
  {
    teller: 'KRIEGER',
    title: 'Der Ritter ohne Helm',
    text: `"Mein alter Ausbilder erzählte mir einmal von einem Ritter, der seinen Helm verlor.
Statt einen neuen zu schmieden, kämpfte er fortan mit bloßem Haupt.
'Warum?', fragten ihn seine Kameraden. 'Damit meine Feinde mein Gesicht sehen', sagte er.
'Damit sie wissen, wer sie besiegt hat.' ...Ich fand das immer ziemlich dumm. Aber beeindruckend."`
  },
  {
    teller: 'KRIEGER',
    title: 'Die erste Narbe',
    text: `"Seht ihr diese Narbe am Kinn? Mein erster Kampf. Ein Goblin — nicht mal ein großer.
Ich war so nervös, dass ich mein eigenes Schwert gegen mein Kinn geschlagen habe.
Der Goblin hat gelacht. ...Dann nicht mehr. Aber die Narbe? Die bleibt. Als Erinnerung:
Auch Helden fangen klein an."`
  },
  {
    teller: 'PALADIN',
    title: 'Das Licht im Dunkel',
    text: `"Im Tempel lehrten sie uns: 'Das Licht scheint am hellsten in der Dunkelheit.'
Als Kind dachte ich, das sei eine Metapher. Dann stand ich das erste Mal im Dungeon,
umgeben von Finsternis, und mein Schild begann zu leuchten. Einfach so.
Seitdem zweifle ich nicht mehr. Auch wenn ich manchmal... Angst habe."`
  },
  {
    teller: 'PALADIN',
    title: 'Der gefallene Bruder',
    text: `"Ich hatte einen Ordensbruder. Fenrik. Stärker als ich, frommer als ich.
Er ging in einen Dungeon wie diesen. Kam zurück... verändert. Seine Augen waren leer.
Er sprach von Stimmen, die ihm sagten, die Siegel seien falsch.
Eines Morgens war er fort. Manche sagen, er sei zur Schwarzen Hand gegangen.
Ich bete, dass es nicht stimmt."`
  },
  {
    teller: 'MAGIER',
    title: 'Die verbotene Bibliothek',
    text: `"In der Akademie gibt es einen verschlossenen Flügel. 'Verbotenes Wissen', sagen die Meister.
Natürlich bin ich eingebrochen. Was ich fand? Bücher, die... zurückschrieben.
Du liest einen Satz, und auf der nächsten Seite steht eine Antwort. Als ob jemand —
oder etwas — auf der anderen Seite des Buches lebte. Ich hab das Buch zugeschlagen.
...Meistens wünschte ich, ich hätte weitergelesen."`
  },
  {
    teller: 'MAGIER',
    title: 'Warum Magier Türme bauen',
    text: `"Wisst ihr, warum Magier in Türmen leben? Nicht wegen der Aussicht.
Ein Turm hat nur EIN Treppenhaus. Das heißt: nur EINEN Weg, auf dem ein
fehlgeschlagenes Experiment fliehen kann. ...Ich hatte mal ein fehlgeschlagenes Experiment.
Es war schnell. Aber das Treppenhaus war lang. Ich gewann knapp."`
  },
  {
    teller: 'PRIESTER',
    title: 'Die Stimme',
    text: `"Einmal — nur einmal — habe ich eine göttliche Stimme gehört.
Nicht im Tempel. Nicht beim Beten. Sondern hier unten. Im tiefsten Stockwerk.
Sie sagte nur ein Wort: 'Weitergehen.' Ich weiß bis heute nicht,
ob es ein Befehl war... oder eine Warnung."`
  },
  {
    teller: 'PRIESTER',
    title: 'Der Preis der Heilung',
    text: `"Was niemand euch über Heilmagie erzählt: Du spürst den Schmerz des anderen.
Für einen Moment fließt er durch dich hindurch, bevor er verschwindet.
Jede Heilung ist ein kleines Opfer. Manche Heiler werden hart davon. Kalt.
Ich versuche, weich zu bleiben. Aber an Tagen wie diesen... fällt es schwer."`
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zufälliges Gerücht von der Wirtin
 */
export function getRandomRumor() {
  const rumors = VILLAGE_NPCS.wirtin.dialogues.rumors;
  return rumors[Math.floor(Math.random() * rumors.length)];
}

/**
 * Zufälligen NPC-Dialog holen
 */
export function getNpcDialogue(npcId, category = 'greeting') {
  const npc = VILLAGE_NPCS[npcId];
  if (!npc) return null;
  const lines = npc.dialogues[category];
  if (!lines || lines.length === 0) return null;
  return {
    npc: npc.name,
    title: npc.title,
    portrait: npc.portrait,
    text: lines[Math.floor(Math.random() * lines.length)]
  };
}

/**
 * Zufälliges Dungeon-Lore-Fragment für den aktuellen Akt
 */
export function getDungeonLoreFragment(currentAct = 1) {
  const pool = [...DUNGEON_LORE.general];
  if (currentAct >= 1 && DUNGEON_LORE.act1) pool.push(...DUNGEON_LORE.act1);
  if (currentAct >= 2 && DUNGEON_LORE.act2) pool.push(...DUNGEON_LORE.act2);
  if (currentAct >= 3 && DUNGEON_LORE.act3) pool.push(...DUNGEON_LORE.act3);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Companion-Kommentar zu einer Situation
 */
export function getCompanionComment(classKey, situation) {
  const classComments = COMPANION_COMMENTS[classKey];
  if (!classComments) return null;
  const lines = classComments[situation];
  if (!lines || lines.length === 0) return null;
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Zufällige Lagerfeuer-Geschichte
 */
export function getCampfireStory(tellerClassKey = null) {
  const pool = tellerClassKey
    ? CAMPFIRE_STORIES.filter(s => s.teller === tellerClassKey)
    : CAMPFIRE_STORIES;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Boss-Lore für einen bestimmten Boss im aktuellen Akt
 */
export function getBossLore(bossId, currentAct = 1) {
  for (const act of STORY_ACTS) {
    if (act.bossLore && act.bossLore[bossId]) {
      return { actTitle: act.title, lore: act.bossLore[bossId] };
    }
  }
  return null;
}

/**
 * Prüft ob ein NPC sichtbar ist (basierend auf Story-Fortschritt)
 */
export function isNpcAvailable(npcId, completedActs = 0) {
  const npc = VILLAGE_NPCS[npcId];
  if (!npc) return false;
  if (npc.appearsAfterAct && completedActs < npc.appearsAfterAct) return false;
  // Verräter verschwindet nach dem Reveal (z.B. Mara nach Akt II)
  if (npc.disappearsAfterAct && completedActs >= npc.disappearsAfterAct) return false;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  VERZWEIGTES DIALOG-SYSTEM — Ruf, Flags, Konversationsbäume, NPC-Questlines
// ═══════════════════════════════════════════════════════════════════════════

export const REPUTATION_TIERS = [
  { min: 60,   name: 'Verbündet',    color: '#1eff00', priceMod: -0.15 },
  { min: 25,   name: 'Freundlich',   color: '#7fff7f', priceMod: -0.07 },
  { min: -14,  name: 'Neutral',      color: '#cfcfcf', priceMod: 0 },
  { min: -39,  name: 'Misstrauisch', color: '#ffae42', priceMod: 0.10 },
  { min: -999, name: 'Feindselig',   color: '#ff4444', priceMod: 0.25 }
];

export function getReputationTier(rep = 0) {
  return REPUTATION_TIERS.find(t => rep >= t.min) || REPUTATION_TIERS[REPUTATION_TIERS.length - 1];
}

export function getReputation(player, npcId) {
  return (player && player.npcReputation && player.npcReputation[npcId]) || 0;
}

export function hasFlag(player, flag) {
  return !!(player && player.storyFlags && player.storyFlags[flag]);
}

export const NPC_CONVERSATIONS = {
  schmied: {
    root: {
      text: 'Hmph. Du wieder. Was willst du, {name}? Ich hab Eisen im Feuer.',
      choices: [
        { text: '"Erzähl mir vom Dorf und seiner Geschichte."', goto: 'lore1' },
        { text: '"Du wirkst angespannt. Stimmt etwas nicht?"', goto: 'amboss_intro', requires: { notFlag: 'amboss_done' } },
        { text: '"Wie laeuft das Geschaeft, alter Freund?"', goto: 'friendly', requires: { minRep: 25 } },
        { text: '"Nichts. Bis spaeter." (beenden)', goto: 'end' }
      ]
    },
    lore1: {
      text: 'Mein Grossvater schmiedete die Ketten des Ersten Siegels. Gute Arbeit. Bis die Schwarze Hand kam und anfing, an ihnen zu ruetteln.',
      choices: [
        { text: '"Die Schwarze Hand? Wer ist das?"', goto: 'lore2', effects: { rep: 2 } },
        { text: '"Faszinierend. Danke." (zurueck)', goto: 'root' }
      ]
    },
    lore2: {
      text: 'Ein Kult. Sie wollen die Siegel brechen und das befreien, was dahinter schlaeft. Narren. Aber gefaehrliche Narren. Halt die Augen offen da unten.',
      choices: [
        { text: '"Das werde ich. Danke, Grimjaw."', goto: 'root', effects: { rep: 3, lore: true } }
      ]
    },
    amboss_intro: {
      text: '*knurrt* Die verfluchten Goblins. Sie haben meinen Amboss gestohlen. 200 Jahre alt, mit Runen meines Grossvaters beschlagen. Ohne ihn kann ich keine Meisterwaffen mehr schmieden.',
      choices: [
        { text: '"Ich hole ihn dir zurueck."', goto: 'amboss_accept', effects: { setFlag: 'amboss_quest', rep: 8, startNpcQuest: 'grimjaw_amboss' } },
        { text: '"Klingt nach deinem Problem, nicht meinem."', goto: 'amboss_reject', effects: { rep: -12 } },
        { text: '"Warum ist dieser Amboss so wichtig?"', goto: 'amboss_why' }
      ]
    },
    amboss_why: {
      text: 'Die Runen binden die Hitze des Erdkerns. Damit gehaerteter Stahl zerbricht nie. Es gibt keine drei solcher Ambosse auf der ganzen Welt. Verstehst du jetzt?',
      choices: [
        { text: '"Jetzt ja. Ich hole ihn zurueck."', goto: 'amboss_accept', effects: { setFlag: 'amboss_quest', rep: 8, startNpcQuest: 'grimjaw_amboss' } },
        { text: '"Trotzdem, das ist riskant." (zurueck)', goto: 'root' }
      ]
    },
    amboss_accept: {
      text: 'Du wuerdest das tun? *mustert dich* Vielleicht hab ich dich falsch eingeschaetzt. Die Goblins hausen in der Goblinfestung. Bring mir den Amboss, und ich schmiede dir etwas, das deine Feinde fuerchten werden.',
      choices: [ { text: '"Abgemacht." (beenden)', goto: 'end' } ]
    },
    amboss_reject: {
      text: '*spuckt ins Feuer* Dann verschwende nicht meine Zeit. Geh.',
      choices: [ { text: '(beenden)', goto: 'end' } ]
    },
    amboss_return: {
      text: 'Ist das... DAS IST ER! Mein Amboss! *seine Augen werden feucht* Du hast Wort gehalten, {name}. So etwas vergisst Grimjaw nicht.',
      choices: [
        { text: '"Er gehoert dorthin, wo er hingehoert."', goto: 'amboss_reward', effects: { rep: 25, setFlag: 'amboss_done', clearFlag: 'amboss_found', item: 'battle_axe', gold: 200 } }
      ]
    },
    amboss_reward: {
      text: 'Nimm diese Axt, geschmiedet auf dem zurueckgebrachten Amboss, das erste Stueck. Und etwas Gold. Von nun an bist du bei mir immer willkommen, Held.',
      choices: [ { text: '"Es war mir eine Ehre, Grimjaw."', goto: 'end', effects: { lore: true } } ]
    },
    friendly: {
      text: '*lacht rau* Das Geschaeft brummt, seit du meine Klingen traegst und zurueckbringst. Fuer dich gibts immer einen fairen Preis.',
      choices: [ { text: '"Darauf einen Handschlag." (zurueck)', goto: 'root', effects: { rep: 1 } } ]
    }
  },
  wirtin: {
    root: {
      text: 'Willkommen zurueck, Liebes! Setz dich. Was darfs sein, ein Bier, ein warmes Laecheln oder saftige Geruechte?',
      choices: [
        { text: '"Erzaehl mir die neuesten Geruechte."', goto: 'rumor' },
        { text: '"Wie geht es dir, Mara?"', goto: 'personal', effects: { rep: 2 } },
        { text: '"Hast du Arbeit fuer mich?"', goto: 'mara_quest', requires: { minRep: 15, notFlag: 'mara_lieferung_done' } },
        { text: '"Nur auf der Durchreise. Danke." (beenden)', goto: 'end' }
      ]
    },
    rumor: {
      text: '*senkt die Stimme* Man sagt, in den Katakomben wandelt ein Fuerst, der nicht stirbt. Und der Haendler verkauft Dinge, die er besser nicht haette. Aber das hast du nicht von mir.',
      choices: [
        { text: '"Interessant. Mehr davon."', goto: 'rumor2' },
        { text: '"Danke fuer den Tipp." (zurueck)', goto: 'root', effects: { rep: 1 } }
      ]
    },
    rumor2: {
      text: 'Der Wanderer am Kamin, niemand weiss, woher er kommt. Aber wenn er spricht, wird das Feuer kaelter. Ich wuerde mit ihm reden. Vorsichtig.',
      choices: [ { text: '"Das werde ich. Danke, Mara."', goto: 'root', effects: { rep: 2, lore: true } } ]
    },
    personal: {
      text: 'Ach, das Gasthaus haelt mich auf Trab. Aber solange Gaeste wie du zurueckkehren, ist mein Herz leicht. Pass auf dich auf da draussen.',
      choices: [ { text: '"Versprochen." (zurueck)', goto: 'root', effects: { rep: 3 } } ]
    },
    mara_quest: {
      text: 'Tatsaechlich, ja! Mein Met-Lieferant traut sich nicht mehr durch den Wald. Bring mir von deiner naechsten Reise ein Fass Zwergenfeuer mit, und ich zahle gut. Das erste Glas geht aufs Haus.',
      choices: [
        { text: '"Ich halte die Augen offen."', goto: 'end', effects: { setFlag: 'mara_lieferung', rep: 5, startNpcQuest: 'mara_lieferung' } },
        { text: '"Vielleicht spaeter." (zurueck)', goto: 'root' }
      ]
    }
  },

  // ─── FINK DER KRÄMER (Händler) — „Die verlorene Fracht" ──────────────────
  haendler: {
    root: {
      text: 'Ah, {name}! Mein Lieblingskunde — der, der lebend wiederkommt. Was darf\'s sein?',
      choices: [
        { text: '"Hast du Neuigkeiten von den Straßen?"', goto: 'gossip' },
        { text: '"Du wirkst bedrückt. Was ist los?"', goto: 'fracht_intro', requires: { notFlag: 'fracht_done' } },
        { text: '"Ein Rabatt für einen Stammkunden?"', goto: 'discount', requires: { minRep: 25 } },
        { text: '"Nur am Schauen. Danke." (beenden)', goto: 'end' }
      ]
    },
    gossip: {
      text: 'Die Karawanen werden weniger. Im Osten verschwinden ganze Dörfer über Nacht. Und die Schwarze Hand? Gute Kunden, schlechte Menschen. Ich verkauf ihnen nichts mehr. ...Meistens.',
      choices: [
        { text: '"Erzähl mir mehr über die Schwarze Hand."', goto: 'gossip2', effects: { rep: 2 } },
        { text: '"Danke für die Infos." (zurück)', goto: 'root' }
      ]
    },
    gossip2: {
      text: '*flüstert* Sie zahlen in altem Gold. Münzen, die seit 300 Jahren niemand mehr prägt. Woher haben die das? Ich will\'s gar nicht wissen. Und du solltest es auch nicht.',
      choices: [
        { text: '"Vorsicht ist klug. Danke."', goto: 'root', effects: { rep: 2, lore: true } }
      ]
    },
    fracht_intro: {
      text: 'Bedrückt? Bestohlen bin ich! Ork-Warlord Gruum hat meine ganze Fracht überfallen — eine eiserne Truhe voll Handelsgut. Mein halbes Vermögen, futsch. Wenn du sie zurückbringst...',
      choices: [
        { text: '"Ich besorge dir deine Truhe."', goto: 'fracht_accept', effects: { setFlag: 'fracht_quest', rep: 8, startNpcQuest: 'fink_fracht' } },
        { text: '"Was springt für mich dabei raus?"', goto: 'fracht_why' },
        { text: '"Klingt zu gefährlich." (zurück)', goto: 'root' }
      ]
    },
    fracht_why: {
      text: 'Ein gerechter Anteil, versteht sich! Sagen wir... ein hübscher Batzen Gold und mein ewiger Rabatt. Fink vergisst eine gute Tat nie — und einen Betrug erst recht nicht.',
      choices: [
        { text: '"Abgemacht. Ich hole die Truhe."', goto: 'fracht_accept', effects: { setFlag: 'fracht_quest', rep: 8, startNpcQuest: 'fink_fracht' } },
        { text: '"Lass mich überlegen." (zurück)', goto: 'root' }
      ]
    },
    fracht_accept: {
      text: 'Ha! Ich wusste, auf dich ist Verlass. Gruum haust in der Orkfestung. Pass auf seine Äxte auf — die sind so groß wie du!',
      choices: [ { text: '"Bis bald, Fink." (beenden)', goto: 'end' } ]
    },
    fracht_return: {
      text: 'Meine Truhe! Du hast sie tatsächlich... *öffnet sie hastig* ...und nichts fehlt! {name}, du bist ein Wunder. Hier, dein Anteil — und ab jetzt zahlst du bei mir nie wieder den vollen Preis!',
      choices: [
        { text: '"Geschäfte mit dir lohnen sich, Fink."', goto: 'end', effects: { rep: 25, setFlag: 'fracht_done', clearFlag: 'fracht_found', gold: 250, lore: true } }
      ]
    },
    discount: {
      text: '*zwinkert* Für dich? Immer. Solange du meine Waren nicht weiterverkaufst und mein Geschäft ruinierst. Abgemacht?',
      choices: [ { text: '"Abgemacht." (zurück)', goto: 'root', effects: { rep: 1 } } ]
    }
  },

  // ─── SCHWESTER ELIA (Heilerin) — „Mordecais Schatten" ────────────────────
  heiler: {
    root: {
      text: 'Möge das Licht dich beschützen, {name}. Du trägst die Müdigkeit vieler Kämpfe. Wie kann ich dir dienen?',
      choices: [
        { text: '"Erzähl mir von diesem Tempel."', goto: 'temple' },
        { text: '"Etwas beunruhigt dich, Schwester."', goto: 'mordecai_intro', requires: { notFlag: 'mordecai_done' } },
        { text: '"Würdest du mich segnen?"', goto: 'blessing', requires: { minRep: 30 } },
        { text: '"Nur auf der Durchreise. Danke." (beenden)', goto: 'end' }
      ]
    },
    temple: {
      text: 'Dieser Tempel stand hier, lange bevor das Dorf gebaut wurde. Er markiert die Stelle, an der der erste Wächter fiel. Sein Licht hält noch immer — schwächer, aber es hält.',
      choices: [
        { text: '"Warum wird die heilige Magie schwächer?"', goto: 'temple2', effects: { rep: 2 } },
        { text: '"Eine ehrwürdige Geschichte. Danke." (zurück)', goto: 'root' }
      ]
    },
    temple2: {
      text: 'Die gebrochenen Siegel. Mit jedem, das fällt, weicht das Licht ein Stück zurück. Ich spüre die Dunkelheit bis hierher kriechen. Wir haben weniger Zeit, als die Leute glauben.',
      choices: [
        { text: '"Ich werde die Siegel schützen."', goto: 'root', effects: { rep: 3, lore: true } }
      ]
    },
    mordecai_intro: {
      text: '*ihre Hände zittern* In den Katakomben... ein Fürst, der den Tod verhöhnt. Vampirfürst Mordecai. Er entweiht die Toten, die ich einst segnete, und macht sie zu seinen Sklaven. Bitte — befreie ihre Seelen.',
      choices: [
        { text: '"Ich werde Mordecai vernichten."', goto: 'mordecai_accept', effects: { setFlag: 'mordecai_quest', rep: 10, startNpcQuest: 'elia_mordecai' } },
        { text: '"Warum kümmert dich das Schicksal der Toten?"', goto: 'mordecai_why' },
        { text: '"Das übersteigt meine Kräfte." (zurück)', goto: 'root' }
      ]
    },
    mordecai_why: {
      text: 'Weil ich sie kannte. Jeden Namen. Jedes Gesicht. Ich gab ihnen die letzte Ölung — und nun wandeln sie als Marionetten. Es ist mehr als Pflicht. Es ist... persönlich.',
      choices: [
        { text: '"Dann sollen sie endlich ruhen. Ich gehe."', goto: 'mordecai_accept', effects: { setFlag: 'mordecai_quest', rep: 10, startNpcQuest: 'elia_mordecai' } },
        { text: '"Ich brauche Zeit." (zurück)', goto: 'root' }
      ]
    },
    mordecai_accept: {
      text: 'Das Licht geleite dich, Kind. Nimm diesen Segen mit in die Finsternis — und kehre zu mir zurück, wenn es vollbracht ist.',
      choices: [ { text: '"Ich kehre zurück. Versprochen." (beenden)', goto: 'end' } ]
    },
    mordecai_return: {
      text: 'Ich spüre es... die Seelen sind frei. Mordecais Griff ist gebrochen. *Tränen in den Augen* Du hast getan, was kein Gebet vermochte. Nimm dies — ein Relikt des ersten Wächters. Möge es dich schützen.',
      choices: [
        { text: '"Sie ruhen nun in Frieden, Schwester."', goto: 'end', effects: { rep: 30, setFlag: 'mordecai_done', clearFlag: 'mordecai_found', item: 'holy_relic', gold: 150, lore: true } }
      ]
    },
    blessing: {
      text: '*legt dir die Hand auf die Stirn* Möge dein Schild niemals brechen und dein Mut niemals wanken. Geh, Held — das Licht ist mit dir.',
      choices: [ { text: '"Ich danke dir, Schwester." (zurück)', goto: 'root', effects: { rep: 2 } } ]
    }
  },

  // ─── DER WANDERER — kryptische Lore + „Das schlafende Auge" ──────────────
  wanderer: {
    root: {
      text: '...Du bist es also, {name}. Die Sterne sprachen von dir. Nun — die Sterne sprechen von vielem.',
      choices: [
        { text: '"Was weißt du über die Siegel?"', goto: 'seals' },
        { text: '"Du siehst etwas Kommendes. Was?"', goto: 'auge_intro', requires: { notFlag: 'auge_done' } },
        { text: '"Wer bist du wirklich?"', goto: 'identity', requires: { minRep: 20 } },
        { text: '"Deine Rätsel ermüden mich." (beenden)', goto: 'end' }
      ]
    },
    seals: {
      text: 'Drei Siegel sind gebrochen. Zwei halten. Eines davon... nicht mehr lange. Die Siegel wurden aus dem Blut der Wächter geschmiedet. Wächterblut bricht sie — und Wächterblut allein erneuert sie.',
      choices: [
        { text: '"Bin ich ein Wächter?"', goto: 'seals2', effects: { rep: 3 } },
        { text: '"Das ist viel zu verdauen." (zurück)', goto: 'root' }
      ]
    },
    seals2: {
      text: '*mustert dich lange* Vielleicht. Vielleicht das Werkzeug eines Wächters. Vielleicht sein Erbe. Die Schwarze Hand hat fünf Finger — einen hast du bereits abgetrennt. Achte auf die, die niemals schweigen. Der Verräter trägt eine Maske aus Freundlichkeit.',
      choices: [
        { text: '"Ich werde wachsam sein."', goto: 'root', effects: { rep: 3, lore: true } }
      ]
    },
    auge_intro: {
      text: 'Im Herzen der Katakomben pulsiert etwas... ein Auge, das nie schläft. Mordecai ist nur sein Hüter. Solange er lebt, kann das Auge das letzte Siegel von innen zernagen. Beende den Hüter — und das Auge erblindet.',
      choices: [
        { text: '"Ich werde den Hüter beenden."', goto: 'auge_accept', effects: { setFlag: 'auge_quest', rep: 8, startNpcQuest: 'wanderer_auge' } },
        { text: '"Warum gehst du nicht selbst?"', goto: 'auge_why' },
        { text: '"Deine Worte sind zu dunkel." (zurück)', goto: 'root' }
      ]
    },
    auge_why: {
      text: '*sein Blick wird leer* Ich sah einst, was hinter dem Tor wartet. Seitdem laufe ich. Das Auge kennt mein Gesicht. Käme ich näher, würde es mich rufen — und ich würde gehen. Du aber... dich kennt es noch nicht.',
      choices: [
        { text: '"Dann gehe ich an deiner Statt."', goto: 'auge_accept', effects: { setFlag: 'auge_quest', rep: 8, startNpcQuest: 'wanderer_auge' } },
        { text: '"Ich muss nachdenken." (zurück)', goto: 'root' }
      ]
    },
    auge_accept: {
      text: 'Mut oder Torheit — bei dir ist es schwer zu sagen. Geh in die Katakomben. Wenn der Hüter fällt, wird das Auge für eine Weile erblinden. Das schenkt Aethermoor Zeit. Mehr kann niemand erbitten.',
      choices: [ { text: '"Dann beginnt es." (beenden)', goto: 'end' } ]
    },
    auge_return: {
      text: 'Das Auge... ich spüre seine Blindheit von hier. Du hast getan, was ein ganzer Orden nicht vermochte. *reicht dir einen kalten, blau schimmernden Splitter* Nimm dies — ein Splitter des Siegels selbst. Bewahre ihn. Du wirst ihn noch brauchen.',
      choices: [
        { text: '"Aethermoor hat noch eine Frist gewonnen."', goto: 'end', effects: { rep: 30, setFlag: 'auge_done', clearFlag: 'auge_found', item: 'magical_orb', gold: 180, lore: true } }
      ]
    },
    identity: {
      text: 'Ich bin der letzte des Wächterordens. Nein — der vorletzte. Der andere ist nicht mehr er selbst. Frag dich: Warum öffnen sich die Dungeons gerade JETZT für Abenteurer? Zufall? Nein. Jemand will, dass ihr hinabsteigt.',
      choices: [
        { text: '"Wer? Und warum?"', goto: 'identity2', effects: { rep: 4 } },
        { text: '"Genug Rätsel für heute." (zurück)', goto: 'root' }
      ]
    },
    identity2: {
      text: 'Das, mein Freund, ist die Frage, deren Antwort dich entweder retten oder verzehren wird. Wenn die Zeit reif ist, wirst du es erfahren. Bis dahin: vertraue keinem Lächeln, das zu breit ist.',
      choices: [
        { text: '"Ich werde mich erinnern."', goto: 'root', effects: { rep: 4, lore: true } }
      ]
    }
  }
};

export const NPC_QUESTS = {
  grimjaw_amboss: {
    id: 'grimjaw_amboss', npcId: 'schmied',
    title: 'Der gestohlene Amboss',
    description: 'Finde Grimjaws uralten Amboss in der Goblinfestung und bring ihn zurueck.',
    objectiveText: 'Besiege den Goblin-Koenig und sichere den Amboss.',
    triggerType: 'bossKill', triggerKey: 'Goblin-König Grak',
    foundFlag: 'amboss_found', startFlag: 'amboss_quest', doneFlag: 'amboss_done',
    returnNode: 'amboss_return'
  },
  mara_lieferung: {
    id: 'mara_lieferung', npcId: 'wirtin',
    title: 'Zwergenfeuer',
    description: 'Treibe ein Fass Zwergenfeuer-Met auf einer Dungeon-Reise auf.',
    objectiveText: 'Schliesse einen beliebigen Dungeon-Run ab.',
    triggerType: 'dungeonClear', triggerKey: 'any',
    foundFlag: 'mara_fass_found', startFlag: 'mara_lieferung', doneFlag: 'mara_lieferung_done',
    returnNode: null, rewardGold: 120, rewardRep: 18
  },
  fink_fracht: {
    id: 'fink_fracht', npcId: 'haendler',
    title: 'Die verlorene Fracht',
    description: 'Ork-Warlord Gruum hat Finks Handelstruhe geraubt. Hol sie aus der Orkfestung zurück.',
    objectiveText: 'Besiege Ork-Warlord Gruum und sichere die Truhe.',
    triggerType: 'bossKill', triggerKey: 'Ork-Warlord Gruum',
    foundFlag: 'fracht_found', startFlag: 'fracht_quest', doneFlag: 'fracht_done',
    returnNode: 'fracht_return'
  },
  elia_mordecai: {
    id: 'elia_mordecai', npcId: 'heiler',
    title: 'Mordecais Schatten',
    description: 'Vampirfürst Mordecai versklavt die Toten der Katakomben. Befreie ihre Seelen.',
    objectiveText: 'Besiege Vampirfürst Mordecai in den Katakomben.',
    triggerType: 'bossKill', triggerKey: 'Vampirfürst Mordecai',
    foundFlag: 'mordecai_found', startFlag: 'mordecai_quest', doneFlag: 'mordecai_done',
    returnNode: 'mordecai_return'
  },
  wanderer_auge: {
    id: 'wanderer_auge', npcId: 'wanderer',
    title: 'Das schlafende Auge',
    description: 'Mordecai hütet ein uraltes Auge, das am letzten Siegel nagt. Beende den Hüter.',
    objectiveText: 'Besiege Vampirfürst Mordecai, den Hüter des Auges.',
    triggerType: 'bossKill', triggerKey: 'Vampirfürst Mordecai',
    foundFlag: 'auge_found', startFlag: 'auge_quest', doneFlag: 'auge_done',
    returnNode: 'auge_return'
  }
};

export function getConversationEntry(npcId, player) {
  const conv = NPC_CONVERSATIONS[npcId];
  if (!conv) return null;
  for (const q of Object.values(NPC_QUESTS)) {
    if (q.npcId === npcId && q.returnNode && hasFlag(player, q.foundFlag) && !hasFlag(player, q.doneFlag)) {
      if (conv[q.returnNode]) return q.returnNode;
    }
  }
  return 'root';
}

// ═══════════════════════════════════════════════════════════════════════════
//  STORY-FINALE — Akt-Progression, cinematische Beats, Verraeter-Reveal, Ende
// ═══════════════════════════════════════════════════════════════════════════

// Welcher Boss-Sieg treibt die Kampagne voran? (Boss-Name -> erreichter Akt-Stand)
export const BOSS_ACT_TRIGGERS = {
  'Ork-Warlord Gruum': 1,
  'Vampirfürst Mordecai': 2,
  'Der Gefallene Wächter': 3
};

// Cinematische Story-Momente, ausgeloest beim Erreichen eines Akt-Stands.
export const STORY_BEATS = {
  1: {
    id: 'act1_done', title: 'Akt I vollendet — Die Verschwoerung',
    accent: '#c9a23a',
    paragraphs: [
      'Der Ork-Warlord faellt, und mit ihm bricht die aeussere Front der Schwarzen Hand zusammen. Doch in seinen letzten Atemzuegen lacht er.',
      '"Ihr Narren... ihr kaempft gegen die Finger, waehrend die Hand euch bereits umschlossen haelt. Der Verraeter sitzt an EUREM Tisch."',
      'Ein kalter Wind weht durch Grauenfels. Am Dorfrand steht eine verhuellte Gestalt, die auf dich gewartet zu haben scheint...'
    ],
    unlockNpc: 'wanderer'
  },
  2: {
    id: 'traitor', title: 'Akt II vollendet — Der Verraeter',
    accent: '#a335ee',
    paragraphs: [
      'Vampirfuerst Mordecai zerfaellt zu Asche. Mit seinem letzten Fluestern enthuellt er, was der Wanderer laengst ahnte:',
      '"Der Verraeter... traegt eine Maske aus Waerme. Sie hoert alles. Sie weiss alles. Sie... hat euch... von Anfang an..."',
      'Du kehrst nach Grauenfels zurueck — und findest den Rostigen Becher leer. Auf dem Tresen liegt ein Brief in Maras Handschrift:',
      '"Es tut mir leid, Liebes. Ich habe euch wirklich gemocht. Aber die Schwarze Hand zahlt nicht in Gold, sondern in Leben — und meines war verwirkt, lange bevor du kamst. Wir sehen uns am Tor. Komm allein. Oder komm gar nicht."',
      'Mara. Die Wirtin, die jedes Gerucht kannte, jedes Kommen und Gehen. Die Spinne im Netz von Grauenfels. Und nun ist das letzte Siegel ungeschuetzt.'
    ],
    unlockDungeon: 'DAS_TOR'
  },
  3: {
    id: 'ending', title: 'Aethermoor gerettet — vorerst',
    accent: '#1eff00',
    paragraphs: [
      'Der Gefallene Waechter sinkt zu Boden, und mit ihm verstummt das schlafende Auge fuer immer. Das Tor zum Abgrund schliesst sich mit einem Seufzen, das wie Erloesung klingt.',
      'Mara ist fort — geflohen oder verschlungen vom Abgrund, niemand weiss es. Doch ihr Brief brennt noch in deiner Tasche: "Wir sehen uns am Tor." Vielleicht ist es nicht vorbei.',
      'Die Siegel erneuern sich aus Waechterblut — aus DEINEM Blut, wie der Wanderer laechelnd verkuendet. Denn das warst du die ganze Zeit: der letzte Waechter, der seinen Eid noch nicht kannte.',
      'Grauenfels feiert. Die Dungeons bleiben — denn das Boese schlaeft nie ganz. Aber heute, in diesem Moment, ist Aethermoor sicher. Und das ist dein Werk, Held.',
      '— ENDE —   (Dein Abenteuer geht weiter: Die Dungeons stehen dir weiterhin offen.)'
    ],
    unlockDungeon: null
  }
};

/** Liefert den Story-Beat fuer einen besiegten Boss, falls er den Akt voranbringt. */
export function getBossStoryBeat(bossName, currentCompletedActs = 0) {
  const reachAct = BOSS_ACT_TRIGGERS[bossName];
  if (!reachAct) return null;
  if (reachAct <= currentCompletedActs) return null; // schon vorbei
  return { actReached: reachAct, beat: STORY_BEATS[reachAct] };
}
