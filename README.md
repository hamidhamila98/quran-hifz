# Quran Hifz & Arabic Learning

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.18-06B6D4?logo=tailwindcss)

Application web pour la mémorisation du Coran et l'apprentissage de l'arabe

</div>

---

## Fonctionnalités

### Quran Hifz (Mémorisation)
- Affichage Mushaf authentique (15 lignes/page)
- Portions quotidiennes configurables (¼, ⅓, ½, 1 ou 2 pages/jour)
- 12 récitateurs avec synchronisation audio mot-à-mot
- Tajweed coloré (règles de récitation visuelles)
- Traduction française + Tafsir Ibn Kathir (AR/EN)
- Suivi de progression avec validation

### Training (Entraînement)
- Quiz par Juz, Hizb, Sourate ou pages personnalisées
- Versets partiellement cachés avec révélation progressive
- Score en temps réel

### Arabic Learning (Arabe)
- Al-Arabiya Bayna Yadayk (Tomes 1-4)
- Dialogues et textes avec traduction ligne par ligne
- Toggle diacritiques (tashkeel) - garde le shadda
- Vidéos YouTube intégrées
- Progression par unité/leçon

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd quran-hifz

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
├── pages/LandingPage.jsx       # Page d'accueil
├── shared/                     # Code partagé (futur)
└── modules/
    ├── quran/                  # Module Quran Hifz (/quran, /quran/training)
    │   ├── pages/              # HomePage, TrainingPage
    │   ├── components/         # QuranSidebar, AudioPlayer
    │   └── services/           # quranApi, tajweed, wordTiming
    └── arabic/                 # Module Arabic Learning (/arabic)
        ├── pages/              # ArabicPage
        └── components/         # ArabicSidebar

public/
├── arabic/                 # Données Al-Arabiya Bayna Yadayk (ABY-T1/T2/T3.json)
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

---

## Technologies

- **React 19** - Framework UI
- **Vite 7** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 7** - Navigation
- **Lucide React** - Icônes

---

## Licence

Usage personnel - Apprentissage du Coran et de la langue arabe.

---

<div align="center">

**وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا**

*"Et récite le Coran lentement et clairement"* - Al-Muzzammil:4

</div>
