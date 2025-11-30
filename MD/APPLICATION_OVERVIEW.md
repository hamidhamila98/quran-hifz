# Quran Hifz & Arabic Learning - Application Overview

## Vue d'ensemble

Application web moderne pour la mémorisation du Coran et l'apprentissage de l'arabe. Combine deux modules principaux :
1. **Quran Hifz** - Mémorisation progressive du Coran avec audio synchronisé
2. **Arabic Learning** - Apprentissage de l'arabe via Al-Arabiya Bayna Yadayk (4 tomes)

---

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.2.0 | Framework UI |
| React Router DOM | 7.9.6 | Navigation SPA |
| Vite | 7.2.4 | Build tool |
| Tailwind CSS | 3.4.18 | Styling |
| Lucide React | 0.555.0 | Icônes |

---

## Architecture du Projet

```
src/
├── App.jsx                 # Routeur principal + gestion settings
├── main.jsx                # Point d'entrée React
├── pages/
│   └── LandingPage.jsx     # Page d'accueil (sélection module)
├── shared/                 # Code partagé entre modules
│   ├── components/         # Composants partagés (futur)
│   ├── hooks/              # Hooks personnalisés (futur)
│   └── utils/              # Fonctions utilitaires (futur)
└── modules/
    ├── quran/              # Module Quran Hifz
    │   ├── pages/
    │   │   ├── HomePage.jsx        # Portion quotidienne
    │   │   └── TrainingPage.jsx    # Quiz mémorisation
    │   ├── components/
    │   │   ├── QuranSidebar.jsx    # Navigation Quran
    │   │   ├── AudioPlayer.jsx     # Lecteur audio
    │   │   ├── MushafDisplay.jsx   # Affichage Mushaf
    │   │   └── VerseDisplay.jsx    # Affichage versets
    │   ├── services/
    │   │   ├── quranApi.js         # APIs Quran
    │   │   ├── tajweed.js          # Tajweed (cpfair)
    │   │   └── wordTiming.js       # Sync audio mot-à-mot
    │   └── data/
    │       ├── quran-uthmani.txt   # Texte Coran
    │       └── tajweed-cpfair.json # Données Tajweed
    └── arabic/             # Module Arabic Learning
        ├── pages/
        │   └── ArabicPage.jsx      # Apprentissage arabe
        ├── components/
        │   └── ArabicSidebar.jsx   # Navigation Arabic
        └── services/               # (futur)

public/
├── arabic/                 # Données Al-Arabiya Bayna Yadayk
│   ├── ABY-T1.json         # Tome 1 (16 unités, 48 dialogues)
│   ├── ABY-T2.json         # Tome 2 (4 unités, 16 leçons dialogue/texte)
│   └── ABY-T3.json         # Tome 3 (textes OCR)
└── quran-timing-data/      # Données synchronisation audio (12 récitateurs)
```

---

## Routes & Pages

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Page d'accueil - sélection du module |
| `/quran` | HomePage | Portion Coran quotidienne, navigation Mushaf, audio |
| `/quran/training` | TrainingPage | Quiz mémorisation (Juz/Hizb/Sourate/Pages) |
| `/arabic` | ArabicPage | Dialogues/textes arabes avec traduction |

---

## Module 1: Quran Hifz (HomePage)

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

## Module 2: Training (TrainingPage)

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

## Module 3: Arabic Learning (ArabicPage)

### Contenu Al-Arabiya Bayna Yadayk
- **Tome 1** : 16 unités × 3 dialogues = 48 dialogues
- **Tome 2** : 4 unités × 4 leçons (dialogue/texte)
- **Tome 3** : Textes OCR (en cours)
- **Tome 4** : À venir

### Fonctionnalités
- **Types de leçons** : حوار (dialogue) ou نص (texte)
- **Couleurs locuteurs** : Amber/Bleu alternés
- **Traduction** : Affichage ligne par ligne ou global
- **Tashkeel toggle** : Masquer diacritiques (garde shadda)
- **YouTube** : Vidéos intégrées par leçon
- **Validation** : Progression par dialogue/texte

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

## Gestion d'État (Settings)

Stockage `localStorage` sous clé `quran-hifz-settings` :

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
| `arabicValidated` | object | { "unit-dialogue": true } |
| `arabicLearningFont` | string | Police (amiri, scheherazade...) |
| `arabicLearningFontSize` | string | 'small', 'medium', 'large' |

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

---

**Qu'Allah facilite la mémorisation du Noble Coran et l'apprentissage de la langue arabe !**

*"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا" - Al-Muzzammil:4*
