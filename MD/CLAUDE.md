# CLAUDE.md - Instructions pour Claude Code

## Contexte du Projet

Application React d'apprentissage islamique **MyIslam** combinant 3 modules :
- **MyHifz** : Mémorisation du Coran avec audio synchronisé mot-à-mot
- **MyArabic** : Apprentissage arabe via Al-Arabiya Bayna Yadayk (4 tomes)
- **MyNotes** : Organisation de ressources (catégories, playlists, citations)

## Commandes Essentielles

```bash
npm run dev      # Démarrer serveur dev (port 5173 ou 5174)
npm run build    # Build production
npm run lint     # Vérification ESLint
```

## Architecture Modulaire

```
src/
├── App.jsx                     # Routeur + settings + sidebar conditionnelle
├── contexts/UserContext.jsx    # Auth locale
├── services/authService.js     # Service authentification
├── pages/LandingPage.jsx       # Page d'accueil (3 modules)
├── components/
│   ├── Footer.jsx              # Footer global + dark mode toggle
│   └── sidebar/index.jsx       # Composants sidebar partagés
└── modules/
    ├── quran/                  # Module MyHifz
    │   ├── pages/              # HomePage, TrainingPage
    │   ├── components/         # QuranSidebar, AudioPlayer, MushafDisplay
    │   └── services/           # quranApi, tajweed, wordTiming
    ├── arabic/                 # Module MyArabic
    │   ├── pages/              # ArabicBooksPage, ArabicPage, ArabicTrainingPage
    │   └── components/         # ArabicSidebar, PdfViewer
    └── notes/                  # Module MyNotes
        ├── pages/              # NotesPage
        ├── components/         # NotesSidebar, FolderView, PlaylistView, CitationsView, ContentViewer
        └── services/           # notesService
```

### Routes
| Route | Module | Description |
|-------|--------|-------------|
| `/` | - | Page d'accueil (sélection module) |
| `/quran` | quran | Portion quotidienne |
| `/quran/training` | quran | Quiz mémorisation |
| `/arabic` | arabic | Sélection livre + progression |
| `/arabic/:bookId` | arabic | Apprentissage dialogues/textes |
| `/arabic/training` | arabic | Entraînement vocabulaire |
| `/notes` | notes | Organisation ressources |

### Sidebars Conditionnelles
- `/quran/*` → `QuranSidebar.jsx`
- `/arabic/*` → `ArabicSidebar.jsx`
- `/notes/*` → `NotesSidebar.jsx`
- `/` → Pas de sidebar

### Données JSON (public/)
- `arabic/ABY-T1.json` : Tome 1 (16 unités × 3 dialogues)
- `arabic/ABY-T2.json` : Tome 2 (unités 5-8, dialogue/texte)
- `arabic/ABY-T3.json` : Tome 3 (textes OCR)
- `arabic/aby-pages.json` : Mapping pages PDF
- `arabic/pdf/` : PDFs mergés (ABY-T1.pdf, ABY-T1-VOC.pdf)
- `quran-timing-data/*.json` : Synchronisation audio 12 récitateurs

## Conventions de Code

### Settings (localStorage)
**App settings** : `guest_settings` (invité) ou `user.settings` (connecté)
```js
// Coran
currentPage, currentPortionIndex, portionSize, validatedPages, portionProgress,
reciter, tajweedEnabled, arabicFont, wordHighlight, darkMode

// Arabic Learning
arabicBook ('aby1'-'aby4'), arabicUnit, arabicDialogue, arabicValidated,
arabicLearningFont, arabicLearningFontSize
```

**Notes** : `myislam_notes` (stockage séparé)
```js
{
  items: [
    { id, type: 'folder', name, children: [...] },
    { id, type: 'playlist', name, tracks: [...] },
    { id, type: 'citations', name, quotes: [...] }
  ]
}
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

### Structure Notes Data
```js
// Catégorie (folder) - profondeur illimitée
{ id, type: 'folder', name, children: [
  { id, type: 'folder', name, children: [...] },  // sous-dossier
  { id, type: 'content', name, contentType: 'pdf|youtube|gdoc|link', url }
]}

// Playlist
{ id, type: 'playlist', name, tracks: [
  { id, name, type: 'mp3|youtube|mp4', url, order }
]}

// Citations
{ id, type: 'citations', name, quotes: [
  { id, text, author, source, createdAt }
]}
```

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

// ID unique (notes)
Date.now().toString(36) + Math.random().toString(36).substr(2)

// YouTube ID extraction
const getYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  return url.match(regex)?.[1]
}

// Google Drive embed
url.replace('/view', '/preview')
```

## Tailwind - Classes Fréquentes

### Dark Mode
```jsx
${settings.darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}
${settings.darkMode ? 'bg-slate-700' : 'bg-gray-100'}
```

### Couleurs par Module
| Module | Couleur | Usage |
|--------|---------|-------|
| MyHifz | `emerald-*` | Coran, validation |
| MyArabic | `red-*` | Arabe, dialogues |
| MyNotes | `amber-*` | Notes, catégories |
| Playlists | `purple-*` | Audio/vidéo |
| Citations | `teal-*` | Quotes |

### Couleurs Dialogues
- Speaker 1 : `red-*` (rouge)
- Speaker 2 : `blue-*` (bleu)
- Texte : `slate-*` (neutre)

## Points d'Attention

1. **HomePage.jsx est volumineux** (~30k tokens) - lire par sections avec offset/limit
2. **Pas de BrowsePage/SettingsPage** - fonctionnalités intégrées dans Sidebars
3. **Tajweed via cpfair** - pas l'API Quran.com pour les couleurs
4. **Word timing** - données dans `public/quran-timing-data/` pour 12 récitateurs
5. **RTL** - toujours `dir="rtl"` pour texte arabe
6. **Architecture modulaire** - ne pas cross-importer entre modules
7. **Notes stockage séparé** - `myislam_notes` indépendant des settings
8. **PDF viewer** - utilise react-pdf avec navigation par page

## Composants Partagés

### Sidebar (src/components/sidebar/index.jsx)
```jsx
import { SidebarWrapper, SidebarHeader, SidebarNav, SidebarFooter } from '../../../components/sidebar'

<SidebarWrapper isOpen={isOpen} darkMode={darkMode}>
  <SidebarHeader title="ModuleName" icon="🔖" gradientFrom="from-color" gradientTo="to-color" />
  <SidebarNav items={navItems} accentColor="color" />
  <SidebarFooter arabicText="..." frenchText="..." accentColor="color" />
</SidebarWrapper>
```

### Footer (src/components/Footer.jsx)
Footer global avec toggle dark mode, affiché sur toutes les pages.

## Tâches en Cours

- [ ] Intégration API Sunnah.com (clé demandée) → futur module `modules/hadith/`
- [ ] Compléter Tome 3 et 4 Arabic Learning
- [ ] Drag & drop réorganisation notes
- [ ] CSV restants pour Tome 2

## Ne Pas Modifier

- `modules/quran/services/tajweed.js` - données tajweed volumineuses
- `modules/quran/data/` - texte Coran et données tajweed
- `public/quran-timing-data/` - données audio timing
- Structure `SURAH_INFO`, `JUZ_INFO`, `HIZB_INFO` dans quranApi.js
