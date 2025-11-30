# CLAUDE.md - Instructions pour Claude Code

## Contexte du Projet

Application React d'apprentissage islamique combinant :
- **Quran Hifz** : Mémorisation du Coran avec audio synchronisé mot-à-mot
- **Arabic Learning** : Apprentissage arabe via Al-Arabiya Bayna Yadayk (4 tomes)

## Commandes Essentielles

```bash
npm run dev      # Démarrer serveur dev (port 5173 ou 5174)
npm run build    # Build production
npm run lint     # Vérification ESLint
```

## Architecture Modulaire

```
src/
├── App.jsx                     # Routeur + settings
├── pages/LandingPage.jsx       # Page d'accueil
├── shared/                     # Code partagé (futur)
└── modules/
    ├── quran/                  # Module Quran Hifz
    │   ├── pages/              # HomePage, TrainingPage
    │   ├── components/         # QuranSidebar, AudioPlayer, etc.
    │   ├── services/           # quranApi, tajweed, wordTiming
    │   └── data/               # quran-uthmani.txt, tajweed-cpfair.json
    └── arabic/                 # Module Arabic Learning
        ├── pages/              # ArabicPage
        └── components/         # ArabicSidebar
```

### Routes
| Route | Module | Description |
|-------|--------|-------------|
| `/` | - | Page d'accueil (sélection module) |
| `/quran` | quran | Portion quotidienne |
| `/quran/training` | quran | Quiz mémorisation |
| `/arabic` | arabic | Apprentissage arabe |

### Sidebars Conditionnelles
- `/quran/*` → `QuranSidebar.jsx`
- `/arabic` → `ArabicSidebar.jsx`
- `/` → Pas de sidebar

### Données JSON (public/)
- `arabic/ABY-T1.json` : Tome 1 (16 unités × 3 dialogues)
- `arabic/ABY-T2.json` : Tome 2 (unités 5-8, dialogue/texte)
- `arabic/ABY-T3.json` : Tome 3 (textes OCR)
- `quran-timing-data/*.json` : Synchronisation audio 12 récitateurs

## Conventions de Code

### Settings (localStorage)
Clé : `quran-hifz-settings`
```js
// Coran
currentPage, currentPortionIndex, portionSize, validatedPages, reciter, tajweedEnabled, arabicFont, wordHighlight, darkMode

// Arabic Learning
arabicBook ('aby1'-'aby4'), arabicUnit, arabicDialogue, arabicValidated, arabicLearningFont, arabicLearningFontSize
```

### Structure Arabic Data (Tome 2+)
```json
{
  "units": [{
    "id": 5,
    "titleAr": "...",
    "titleFr": "...",
    "lessons": [{
      "id": "5.1",
      "type": "dialogue|texte",  // dialogue = couleurs alternées, texte = neutre
      "lines": [{ "speaker": "", "arabic": "...", "french": "..." }]
    }]
  }]
}
```
- Tome 1 utilise `unit.dialogues[]`
- Tomes 2-4 utilisent `unit.lessons[]` avec champ `type`

### APIs Externes
```js
// Quran text
'https://api.alquran.cloud/v1/page/{page}/quran-uthmani'
'https://api.quran.com/api/v4/verses/by_page/{page}?words=true'

// Audio
'https://everyayah.com/data/{reciterId}/{surah}{ayah}.mp3'
```

### Fonctions Utilitaires Fréquentes
```js
// Supprimer diacritiques (garde shadda)
text.replace(/[\u064B-\u0650\u0652\u0670]/g, '')

// Numéros arabes
const toArabicNumeral = (n) => String(n).split('').map(d => '٠١٢٣٤٥٦٧٨٩'[d]).join('')
```

## Tailwind - Classes Fréquentes

### Dark Mode
```jsx
${settings.darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}
${settings.darkMode ? 'bg-slate-700' : 'bg-gray-100'}
```

### Couleurs Principales
- Coran : `primary-*` (emerald-like)
- Arabic : `emerald-*`
- Dialogues : `amber-*` (speaker 1), `blue-*` (speaker 2)
- Textes : `slate-*` (neutre)

## Points d'Attention

1. **HomePage.jsx est volumineux** (~30k tokens) - lire par sections avec offset/limit
2. **Pas de BrowsePage/SettingsPage** - fonctionnalités intégrées dans Sidebars
3. **Tajweed via cpfair** - pas l'API Quran.com pour les couleurs
4. **Word timing** - données dans `public/quran-timing-data/` pour 12 récitateurs
5. **RTL** - toujours `dir="rtl"` pour texte arabe
6. **Architecture modulaire** - ne pas cross-importer entre modules

## Tâches en Cours

- [ ] Intégration API Sunnah.com (clé demandée) → futur module `modules/hadith/`
- [ ] Compléter Tome 3 et 4 Arabic Learning
- [ ] CSV restants pour Tome 2

## Ne Pas Modifier

- `modules/quran/services/tajweed.js` - données tajweed volumineuses
- `modules/quran/data/` - texte Coran et données tajweed
- `public/quran-timing-data/` - données audio timing
- Structure `SURAH_INFO`, `JUZ_INFO`, `HIZB_INFO` dans quranApi.js
