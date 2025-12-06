# MyIslam - Application Overview

## Vue d'ensemble

Application web moderne d'apprentissage islamique combinant 3 modules principaux :
1. **MyHifz** - Mémorisation progressive du Coran avec audio synchronisé
2. **MyArabic** - Apprentissage de l'arabe via Al-Arabiya Bayna Yadayk (4 tomes)
3. **MyNotes** - Organisation de ressources islamiques (catégories, playlists, citations)

---

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.2.0 | Framework UI |
| React Router DOM | 7.9.6 | Navigation SPA |
| Vite | 7.2.4 | Build tool |
| Tailwind CSS | 3.4.18 | Styling |
| Lucide React | 0.555.0 | Icônes |
| React PDF | 10.2.0 | Affichage PDF |

---

## Architecture du Projet

```
src/
├── App.jsx                 # Routeur principal + gestion settings
├── main.jsx                # Point d'entrée React
├── contexts/
│   └── UserContext.jsx     # Contexte utilisateur (auth locale)
├── services/
│   └── authService.js      # Service d'authentification
├── pages/
│   └── LandingPage.jsx     # Page d'accueil (sélection module)
├── components/
│   ├── Footer.jsx          # Footer global avec dark mode toggle
│   └── sidebar/            # Composants sidebar partagés
│       └── index.jsx       # SidebarWrapper, Header, Nav, Footer
└── modules/
    ├── quran/              # Module MyHifz
    │   ├── pages/
    │   │   ├── HomePage.jsx        # Portion quotidienne
    │   │   └── TrainingPage.jsx    # Quiz mémorisation
    │   ├── components/
    │   │   ├── QuranSidebar.jsx    # Navigation Quran
    │   │   ├── AudioPlayer.jsx     # Lecteur audio
    │   │   ├── MushafDisplay.jsx   # Affichage Mushaf
    │   │   └── VerseDisplay.jsx    # Affichage versets
    │   └── services/
    │       ├── quranApi.js         # APIs Quran + données statiques
    │       ├── tajweed.js          # Tajweed (cpfair)
    │       └── wordTiming.js       # Sync audio mot-à-mot
    ├── arabic/             # Module MyArabic
    │   ├── pages/
    │   │   ├── ArabicBooksPage.jsx   # Sélection livre + progression
    │   │   ├── ArabicPage.jsx        # Apprentissage dialogues/textes
    │   │   └── ArabicTrainingPage.jsx # Entraînement vocabulaire
    │   └── components/
    │       ├── ArabicSidebar.jsx     # Navigation Arabic
    │       └── PdfViewer.jsx         # Visualiseur PDF avec navigation
    └── notes/              # Module MyNotes
        ├── pages/
        │   └── NotesPage.jsx         # Page principale notes
        ├── components/
        │   ├── NotesSidebar.jsx      # Sidebar avec arbre navigation
        │   ├── FolderView.jsx        # Vue catégories/dossiers
        │   ├── PlaylistView.jsx      # Vue playlists audio/vidéo
        │   ├── CitationsView.jsx     # Vue citations
        │   └── ContentViewer.jsx     # Modal iframe (PDF, YouTube, GDoc)
        └── services/
            └── notesService.js       # CRUD localStorage notes

public/
├── arabic/                 # Données Al-Arabiya Bayna Yadayk
│   ├── ABY-T1.json         # Tome 1 (16 unités, 48 dialogues)
│   ├── ABY-T2.json         # Tome 2 (unités 5-8, dialogue/texte)
│   ├── ABY-T3.json         # Tome 3 (textes OCR)
│   ├── aby-pages.json      # Mapping pages PDF par dialogue
│   └── pdf/                # PDFs mergés (ABY-T1.pdf, ABY-T1-VOC.pdf)
└── quran-timing-data/      # Données synchronisation audio (12 récitateurs)
```

---

## Routes & Pages

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Page d'accueil - sélection du module |
| `/quran` | HomePage | Portion Coran quotidienne, navigation Mushaf, audio |
| `/quran/training` | TrainingPage | Quiz mémorisation (Juz/Hizb/Sourate/Pages) |
| `/arabic` | ArabicBooksPage | Sélection livre + progression globale |
| `/arabic/:bookId` | ArabicPage | Dialogues/textes avec traduction, vidéo, PDF |
| `/arabic/training` | ArabicTrainingPage | Entraînement vocabulaire |
| `/notes` | NotesPage | Organisation ressources (catégories, playlists, citations) |

---

## Module 1: MyHifz (Quran)

### Fonctionnalités Principales
- **Portions fractionnées** : 1/4, 1/3, 1/2, 1 ou 2 pages par jour
- **Affichage Mushaf** : 15 lignes par page, style authentique
- **Audio synchronisé** : 12 récitateurs avec suivi mot-à-mot
- **Tajweed coloré** : Règles de récitation visuelles (cpfair)
- **Traduction/Tafsir** : Français + Ibn Kathir (AR/EN)
- **Validation** : Marquer pages/portions comme apprises
- **Mode masquage** : Cacher texte pour mémorisation

### Récitateurs Disponibles (avec timing mot-à-mot)
1. Mishary Al-Afasy
2. Abdul Basit (Mujawwad & Murattal)
3. Abdurrahmaan As-Sudais
4. Abu Bakr Ash-Shaatree
5. Hani Ar-Rifai
6. Al-Husary (Murattal & Muallim)
7. Al-Minshawi (Mujawwad & Murattal)
8. Mohammad Al-Tablaway
9. Saood Ash-Shuraym
10. Ibrahim Al-Dosary (Warsh - sans timing)

### APIs Externes
- **AlQuran.cloud** : Texte Uthmani, métadonnées sourates
- **Quran.com API v4** : Données mots + numéros de ligne
- **EveryAyah.com** : Audio MP3 (128-192 kbps)
- **CDN Islamic Network** : Backup audio

---

## Module 2: Training (Entraînement Quran)

### Modes d'Entraînement
- **Par Juz** (30 parties)
- **Par Hizb** (60 sections)
- **Par Sourate** (114 chapitres)
- **Par Pages** (plage personnalisée)

### Système de Quiz
- Versets partiellement cachés (1/2 ou 1/3)
- Révélation progressive avec indices
- Score en temps réel
- Audio intégré par verset

---

## Module 3: MyArabic (Arabic Learning)

### Contenu Al-Arabiya Bayna Yadayk
- **Tome 1** : 16 unités × 3 dialogues = 48 dialogues
- **Tome 2** : 4 unités × 4 leçons (dialogue/texte)
- **Tome 3** : Textes OCR (en cours)
- **Tome 4** : À venir

### Fonctionnalités
- **Types de leçons** : حوار (dialogue) ou نص (texte)
- **Couleurs locuteurs** : Rouge/Bleu alternés pour dialogues
- **Traduction** : Affichage ligne par ligne ou global
- **Tashkeel toggle** : Masquer diacritiques (garde shadda)
- **YouTube** : Vidéos intégrées par leçon
- **PDF intégré** : Affichage PDF avec navigation pages
- **Vocabulaire** : PDF vocabulaire par unité
- **Validation** : Progression par dialogue/texte
- **Progression** : Comptage livres complétés (100%)

### Pages
- **ArabicBooksPage** : Vue globale des 4 tomes avec progression
- **ArabicPage** : Interface d'apprentissage avec vidéo, PDF, traduction
- **ArabicTrainingPage** : Entraînement vocabulaire

### Structure JSON (Tome 2+)
```json
{
  "bookId": "aby2",
  "units": [{
    "id": 5,
    "titleAr": "عنوان",
    "titleFr": "Titre",
    "lessons": [{
      "id": "5.1",
      "type": "dialogue|texte",
      "titleAr": "...",
      "youtubeUrl": "...",
      "lines": [
        { "speaker": "...", "arabic": "...", "french": "..." }
      ]
    }]
  }]
}
```

---

## Module 4: MyNotes

### Fonctionnalités
Système d'organisation de ressources islamiques avec structure hiérarchique flexible.

### Types d'Éléments
| Type | Description | Contenu |
|------|-------------|---------|
| **Catégorie** (folder) | Dossier avec profondeur illimitée | Sous-dossiers, PDFs, YouTube, Google Docs, liens |
| **Playlist** | Collection audio/vidéo | Pistes MP3, vidéos YouTube, MP4 |
| **Citations** | Stockage de citations | Texte, auteur, source |

### Structure Hiérarchique
```
Catégorie (ex: Fiqh)
├── Sous-catégorie (ex: Maliki)
│   ├── Livre (ex: Al-Risala)
│   │   ├── Chapitre 1 (PDF iframe)
│   │   └── Chapitre 2 (PDF iframe)
│   └── Autre livre...
└── Sous-catégorie (ex: Hanbali)
    └── ...
```

### Types de Contenu Supportés
- **PDF** : Iframe Google Drive ou lien direct
- **YouTube** : Embed vidéo avec extraction ID
- **Google Docs** : Iframe avec conversion /preview
- **Liens externes** : Ouverture nouvel onglet

### Lecteur Audio/Vidéo
- Contrôles play/pause/prev/next
- Barre de progression avec seek
- Contrôle volume et mute
- Lecture YouTube intégrée
- Passage automatique piste suivante

### Stockage
- localStorage clé : `myislam_notes`
- Structure récursive avec IDs uniques
- CRUD complet (Create, Read, Update, Delete)

---

## Gestion d'État (Settings)

### Authentification
- Système local avec `localStorage`
- Clé utilisateurs : `myislam_users`
- Contexte : `UserContext.jsx`
- Service : `authService.js`

### Settings Globaux
Stockage `localStorage` :
- Connecté : dans `user.settings`
- Invité : clé `guest_settings`

### Settings Coran
| Clé | Type | Description |
|-----|------|-------------|
| `currentPage` | number | Page Mushaf (1-604) |
| `currentPortionIndex` | number | Index portion dans page |
| `portionSize` | string | '1/4', '1/3', '1/2', '1', '2' |
| `validatedPages` | array | Pages validées |
| `portionProgress` | object | Portions validées par page |
| `reciter` | string | ID récitateur |
| `playbackSpeed` | number | 1, 1.5, ou 2 |
| `tajweedEnabled` | boolean | Couleurs tajweed |
| `arabicFont` | string | Police arabe |
| `wordHighlight` | boolean | Suivi mot-à-mot |
| `darkMode` | boolean | Thème sombre |

### Settings Arabic Learning
| Clé | Type | Description |
|-----|------|-------------|
| `arabicBook` | string | 'aby1', 'aby2', 'aby3', 'aby4' |
| `arabicUnit` | number | Unité courante |
| `arabicDialogue` | number | Index dialogue/leçon |
| `arabicValidated` | object | { "book-unit-dialogue": true } |
| `arabicLearningFont` | string | Police (amiri, scheherazade...) |
| `arabicLearningFontSize` | string | 'small', 'medium', 'large' |

### Settings Notes
Stockage séparé dans `myislam_notes` :
```js
{
  items: [
    { id, type: 'folder', name, children: [...] },
    { id, type: 'playlist', name, tracks: [...] },
    { id, type: 'citations', name, quotes: [...] }
  ]
}
```

---

## Polices Arabes

### Mushaf (Uthmanic)
- Hafs Smart, Uthmanic Hafs v18, KFGQPC Uthmanic, Al Mushaf

### Calligraphie
- Al Qalam Quran Majeed, Amiri Quran (Colored)

### Naskh (Lisibilité)
- Scheherazade New, Droid Naskh, Noto Naskh Arabic, Lateef

### Nastaliq
- Hafs Nastaleeq

---

## Données Statiques

### SURAH_INFO (114 sourates)
```js
{ number, name, englishName, startPage, endPage, ayahCount }
```

### JUZ_INFO (30 juz)
```js
{ number, name, englishName, startPage, endPage }
```

### HIZB_INFO (60 hizb)
```js
{ number, name, englishName, startPage, endPage, juz }
```

### TAJWEED_CLASSES (règles colorées)
- `ham_wasl`, `slnt`, `laam_shamsiyah` → Gris
- `madda_normal` → Bleu
- `madda_permissible`, `idghm_*` → Vert
- `madda_obligatory`, `qalpieces` → Rouge
- `ikhf_*` → Violet
- `ghn` → Orange

---

## Couleurs par Module

| Module | Couleur | Tailwind | Hex |
|--------|---------|----------|-----|
| MyIslam (Landing) | Emerald | `emerald-*` | #10b981 |
| MyHifz | Emerald | `emerald-*` | #10b981 |
| MyArabic | Rouge | `red-*` | #ef4444 |
| MyNotes | Amber | `amber-*` | #f59e0b |

---

## Commandes

```bash
npm run dev      # Développement (Vite HMR)
npm run build    # Build production
npm run preview  # Prévisualiser build
npm run lint     # ESLint
```

---

## Évolutions Prévues

- [ ] API Sunnah.com pour Hadiths (clé demandée)
- [ ] Tome 3 & 4 Al-Arabiya Bayna Yadayk complets
- [ ] Mode PWA hors ligne
- [ ] Synchronisation cloud multi-appareils
- [ ] Statistiques avancées de progression
- [ ] Export PDF des progrès
- [ ] Drag & drop pour réorganiser notes

---

**Qu'Allah facilite la mémorisation du Noble Coran et l'apprentissage de la langue arabe !**

*"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا" - Al-Muzzammil:4*
