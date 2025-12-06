# MyIslam

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.18-06B6D4?logo=tailwindcss)

Application web pour la mémorisation du Coran, l'apprentissage de l'arabe et l'organisation de ressources islamiques

</div>

---

## Modules

### MyHifz - Mémorisation du Coran
- Affichage Mushaf authentique (15 lignes/page)
- Portions quotidiennes configurables (¼, ⅓, ½, 1 ou 2 pages/jour)
- 12 récitateurs avec synchronisation audio mot-à-mot
- Tajweed coloré (règles de récitation visuelles)
- Traduction française + Tafsir Ibn Kathir (AR/EN)
- Suivi de progression avec validation

### Training - Entraînement Quran
- Quiz par Juz, Hizb, Sourate ou pages personnalisées
- Versets partiellement cachés avec révélation progressive
- Score en temps réel

### MyArabic - Apprentissage de l'Arabe
- Al-Arabiya Bayna Yadayk (Tomes 1-4)
- Dialogues et textes avec traduction ligne par ligne
- Toggle diacritiques (tashkeel) - garde le shadda
- Vidéos YouTube intégrées
- PDF intégré avec navigation par page
- Progression par unité/leçon

### MyNotes - Organisation de Ressources
- **Catégories** : Dossiers hiérarchiques avec profondeur illimitée
- **Playlists** : Collections audio/vidéo (MP3, YouTube, MP4)
- **Citations** : Stockage de citations avec auteur et source
- Contenu via iframe (PDF Google Drive, YouTube, Google Docs)
- Lecteur audio/vidéo intégré

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd myislam

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Accès : http://localhost:5173

---

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (Vite HMR) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérification ESLint |

---

## Structure du Projet

```
src/
├── App.jsx                     # Routeur principal
├── contexts/UserContext.jsx    # Auth locale
├── pages/LandingPage.jsx       # Page d'accueil
├── components/
│   ├── Footer.jsx              # Footer global
│   └── sidebar/                # Composants sidebar partagés
└── modules/
    ├── quran/                  # Module MyHifz (/quran, /quran/training)
    │   ├── pages/              # HomePage, TrainingPage
    │   ├── components/         # QuranSidebar, AudioPlayer
    │   └── services/           # quranApi, tajweed, wordTiming
    ├── arabic/                 # Module MyArabic (/arabic, /arabic/:bookId)
    │   ├── pages/              # ArabicBooksPage, ArabicPage, ArabicTrainingPage
    │   └── components/         # ArabicSidebar, PdfViewer
    └── notes/                  # Module MyNotes (/notes)
        ├── pages/              # NotesPage
        ├── components/         # NotesSidebar, FolderView, PlaylistView, CitationsView
        └── services/           # notesService

public/
├── arabic/                 # Données Al-Arabiya Bayna Yadayk
│   ├── ABY-T1/T2/T3.json   # Contenus tomes
│   ├── aby-pages.json      # Mapping pages PDF
│   └── pdf/                # PDFs mergés
└── quran-timing-data/      # Données timing audio (12 récitateurs)
```

---

## APIs Utilisées

| API | Usage |
|-----|-------|
| [AlQuran.cloud](https://alquran.cloud/api) | Texte Uthmani, métadonnées |
| [Quran.com API](https://api.quran.com) | Mots + numéros de ligne |
| [EveryAyah.com](https://everyayah.com) | Audio MP3 récitateurs |
| [cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed) | Données Tajweed |

---

## Récitateurs Disponibles

Tous avec synchronisation mot-à-mot :
- Mishary Al-Afasy
- Abdul Basit (Mujawwad & Murattal)
- Abdurrahmaan As-Sudais
- Abu Bakr Ash-Shaatree
- Hani Ar-Rifai
- Al-Husary (Murattal & Muallim)
- Al-Minshawi (Mujawwad & Murattal)
- Mohammad Al-Tablaway
- Saood Ash-Shuraym
- Ibrahim Al-Dosary (Warsh)

---

## Configuration

Les paramètres sont sauvegardés automatiquement dans `localStorage` :

**Coran** : page courante, portion, récitateur, police, tajweed, mode sombre...

**Arabe** : tome, unité, dialogue, police, taille, validations...

**Notes** : stockage séparé avec structure hiérarchique

---

## Polices Arabes

- **Mushaf** : Hafs Smart, KFGQPC Uthmanic, Al Mushaf
- **Calligraphie** : Al Qalam Quran, Amiri Quran
- **Naskh** : Scheherazade, Noto Naskh Arabic, Lateef

---

## Roadmap

- [ ] Intégration API Sunnah.com (Hadiths)
- [ ] Compléter Tomes 3-4 Al-Arabiya Bayna Yadayk
- [ ] Mode PWA hors ligne
- [ ] Synchronisation cloud
- [ ] Export PDF progression
- [ ] Drag & drop réorganisation notes

---

## Technologies

- **React 19** - Framework UI
- **Vite 7** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 7** - Navigation
- **React PDF** - Affichage PDF
- **Lucide React** - Icônes

---

## Licence

Usage personnel - Apprentissage du Coran et de la langue arabe.

---

<div align="center">

**وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا**

*"Et récite le Coran lentement et clairement"* - Al-Muzzammil:4

</div>
