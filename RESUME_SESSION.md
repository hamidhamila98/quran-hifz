# RESUME COMPLET DE LA SESSION - Application Quran Hifz

## Vue d'ensemble du projet

**Type**: Application React de mémorisation du Quran
**Stack**: React + Vite + Tailwind CSS
**API**: Quran.com API (avec support Tajweed)

---

## FONCTIONNALITES IMPLEMENTEES

### 1. Systeme de navigation par pages et portions

L'application utilise un système de mémorisation basé sur des **portions de pages** au lieu de lignes fixes.

#### Options de mémorisation disponibles (Sidebar):
| Option | Portions/page | Lignes par portion |
|--------|---------------|-------------------|
| **¼ page/j** | 4 portions | 4, 4, 4, 3 lignes |
| **⅓ page/j** | 3 portions | 5, 5, 5 lignes |
| **½ page/j** | 2 portions | 8, 7 lignes |
| **1 page/j** | 1 portion | 15 lignes |
| **2 pages/j** | 1 portion | 30 lignes (2 pages) |

### 2. Pages speciales (1 et 2)

Les pages 1 (Al-Fatiha) et 2 (début Al-Baqara) sont traitées spécialement car elles n'ont pas 15 lignes standard. Elles affichent la **page complète** au lieu de portions.

### 3. Systeme "Verset depassant"

Quand un verset commence dans les lignes de la portion mais **s'étend au-delà**, il est affiché séparément dans une section **"Verset dépassant la portion"** en couleur ambre/orange.

### 4. Apercu de la page suivante

À la **fin de chaque page** (dernière portion), un aperçu de la **première LIGNE** de la page suivante s'affiche en **ROUGE** pour aider à la liaison lors de la mémorisation.

### 5. Affichage du titre de portion

Le titre affiche maintenant: **"Page X - Portion Y/Z (lignes A-B)"**
Exemple: "Page 4 - Portion 1/3 (lignes 1-5)"

### 6. Stats mises a jour

- **"Page/j"** au lieu de "Lignes/jour" → affiche ¼, ⅓, ½, 1, 2
- **"Pages validées"** au lieu de "Lignes validées" → affiche fractions (1¼, 2½, etc.)
- Progression sur 604 pages

---

## FICHIERS MODIFIES

### 1. `src/App.jsx`

**Settings par défaut modifiés:**
```javascript
const defaultSettings = {
  portionSize: '1/3',        // Options: '1/4', '1/3', '1/2', '1', '2'
  currentPage: 1,
  currentAyah: 1,
  currentSurah: 1,
  currentAbsoluteLine: 1,
  currentPortionIndex: 0,    // NOUVEAU: Index de la portion dans la page
  validatedPages: 0,         // CHANGE: En quarts de page (4 = 1 page)
  lastVerseKey: null,
  reciter: 'ar.husary',
  startDate: new Date().toISOString().split('T')[0],
  darkMode: false,
  tajweedEnabled: false,
  arabicFont: 'amiri-quran',
  flowMode: false,
  arabicNumerals: true,
}
```

### 2. `src/components/Sidebar.jsx`

**Ajouts:**
- Import de `BookOpen` de lucide-react
- Constante `PORTION_SIZES` avec les 5 options
- State `portionDropdownOpen`
- Variable `currentPortion`
- **Nouveau dropdown "Mémorisation/j"** après "Chiffres arabes"

```javascript
const PORTION_SIZES = [
  { id: '1/4', name: '¼ page/j', description: '4, 4, 3 lignes' },
  { id: '1/3', name: '⅓ page/j', description: '5, 5, 5 lignes' },
  { id: '1/2', name: '½ page/j', description: '8, 7 lignes' },
  { id: '1', name: '1 page/j', description: '15 lignes' },
  { id: '2', name: '2 pages/j', description: '30 lignes' },
]
```

### 3. `src/pages/HomePage.jsx` (REECRIT COMPLETEMENT)

**Structure principale:**

```javascript
// Configuration des portions
const PORTION_CONFIG = {
  '1/4': { lines: [4, 4, 4, 3], portions: 4, label: '¼' },
  '1/3': { lines: [5, 5, 5], portions: 3, label: '⅓' },
  '1/2': { lines: [8, 7], portions: 2, label: '½' },
  '1': { lines: [15], portions: 1, label: '1' },
  '2': { lines: [15, 15], portions: 1, pages: 2, label: '2' }
}

// Pages spéciales
const SPECIAL_PAGES = [1, 2]
```

**States:**
- `verses` - Versets de la portion
- `overflowVerse` - Verset dépassant (affiché en orange)
- `previewVerses` - Aperçu page suivante (affiché en rouge)
- `loading`, `error`
- `portionInfo` - Infos sur la portion actuelle
- `highlightedAyah`
- `audioKey` - Pour reset l'audio à chaque navigation

**Fonctions clés:**

1. `getPortionLines()` - Calcule startLine et endLine selon portionIndex
2. `isLastPortionOfPage()` - Vérifie si c'est la dernière portion
3. `loadPortion()` - Charge les versets:
   - Gère pages spéciales (1, 2)
   - Groupe versets par lignes
   - Sépare versets normaux et overflow
   - Charge aperçu si dernière portion
4. `handleNext()` - Navigation suivant
5. `handlePrevious()` - Navigation précédent
6. `handleValidate()` - Valider et avancer
7. `getPortionLabel()` - Retourne "Page X - Portion Y/Z (lignes A-B)"
8. `validatedPagesDisplay()` - Affiche pages en fractions (1¼, 2½, etc.)

**Logique de séparation versets/overflow:**
```javascript
for (let line = startLine; line <= endLine; line++) {
  const versesOnLine = lineMap.get(line) || []
  versesOnLine.forEach(verse => {
    if (!seenKeys.has(verse.verseKey)) {
      seenKeys.add(verse.verseKey)
      const maxLine = Math.max(...verse.lineNumbers)

      // Si verset dépasse la portion → overflow
      if (maxLine > endLine) {
        overflowVerses.push(verse)
      } else {
        portionVerses.push(verse)
      }
    }
  })
}
```

### 4. `src/services/quranApi.js`

**Fonction `getPageWithLines()`** - Charge une page avec numéros de lignes via Quran.com API

**Fonction `getVersesByLineRange()`** - Charge versets par plage de lignes (utilisée dans version précédente, moins utilisée maintenant)

---

## STRUCTURE DE L'INTERFACE

### Sidebar (gauche)
1. Logo "Quran Hifz"
2. Navigation: Aujourd'hui / Entraînement
3. Options:
   - Toggle Tajweed
   - Toggle Chiffres arabes
   - **Dropdown Mémorisation/j** (NOUVEAU)
   - Dropdown Police arabe
   - Dropdown Réciteur
   - Toggle Mode sombre
4. Verset du jour

### Page principale (Aujourd'hui)
1. **Header**: "Assalamu Alaikum"
2. **Stats** (4 cartes):
   - Jours (depuis début)
   - Page/j (¼, ⅓, ½, 1, 2)
   - Page actuelle + Portion
   - Pages validées / 604
3. **Info Sourate** (nom arabe/anglais, page, versets)
4. **Zone principale**:
   - Titre: "Page X - Portion Y/Z (lignes A-B)"
   - Versets arabes
   - Section "Verset dépassant" (si applicable, en orange)
   - Section "Première ligne page suivante" (si dernière portion, en rouge)
   - Boutons: Précédent / Valider / Suivant
5. **Sidebar droite**:
   - Audio player
   - Carte progression

---

## COMPORTEMENT NAVIGATION

### Bouton "Suivant"
1. Si page spéciale → page suivante, portion 0
2. Si mode 2 pages → +2 pages
3. Si pas dernière portion → portion +1
4. Si dernière portion → page +1, portion 0

### Bouton "Précédent"
1. Si page spéciale → page -1
2. Si mode 2 pages → -2 pages
3. Si portion > 0 → portion -1
4. Si portion 0 → page -1, dernière portion

### Bouton "Valider"
- Ajoute des "quarts" aux pages validées
- Avance comme "Suivant"
- Quarters ajoutés selon portionSize:
  - 1/4 → 1 quarter
  - 1/3 → 1 ou 2 quarters (pour arrondir)
  - 1/2 → 2 quarters
  - 1 → 4 quarters
  - 2 → 8 quarters

---

## CALCUL PAGES VALIDEES

Les pages validées sont stockées en **quarts** (4 quarts = 1 page):

```javascript
const validatedPagesDisplay = () => {
  const fullPages = Math.floor(validatedQuarters / 4)
  const remainder = validatedQuarters % 4
  if (remainder === 0) return fullPages === 0 ? '0' : `${fullPages}`
  const fractions = ['', '¼', '½', '¾']
  return fullPages > 0 ? `${fullPages}${fractions[remainder]}` : fractions[remainder]
}
```

Exemples:
- 0 quarts → "0"
- 1 quart → "¼"
- 2 quarts → "½"
- 4 quarts → "1"
- 5 quarts → "1¼"
- 10 quarts → "2½"

---

## FONCTIONNALITES PRECEDENTES (avant cette session)

### Marker de versets
- Symbole ۝ (U+06DD) avec numéro
- Option chiffres arabes (٠١٢٣٤٥٦٧٨٩) ou occidentaux

### Tajweed
- Couleurs pour règles de tajweed via API Quran.com
- CSS dans `index.css` avec classes tajweed

### Polices arabes
- Amiri Quran, Amiri, Scheherazade, Noto Naskh, Kitab

### Réciteurs
- Al-Husary (Hafs), Alafasy (Hafs)
- Abdul Basit (Warsh), Al-Dosary (Warsh)

### Mode sombre
- Thème complet dark/light

---

## ETAT ACTUEL DE L'APPLICATION

### Dernière configuration testée:
- **Page**: 4
- **Portion**: 1/3 (lignes 1-5)
- **portionSize**: "⅓ page/j"
- **Versets affichés**: 17, 18, 19
- **Verset dépassant**: 20

### LocalStorage
Les settings sont sauvegardés dans `quran-hifz-settings`

---

## COMMENT REPRENDRE

1. Ouvrir le projet dans VS Code
2. Terminal: `npm run dev`
3. Ouvrir http://localhost:5173
4. L'état sera chargé depuis localStorage

### Pour tester:
1. Changer la taille de portion via le dropdown sidebar
2. Naviguer avec Suivant/Précédent
3. Vérifier l'aperçu rouge à la dernière portion de chaque page
4. Vérifier le "verset dépassant" quand un verset s'étend au-delà

### Pour reset:
Ouvrir console navigateur et exécuter:
```javascript
localStorage.clear()
```
Puis rafraîchir la page.

---

## BUGS CORRIGES CETTE SESSION

1. **NaN dans stats** - Fusion settings avec defaults pour nouveaux champs
2. **Lignes vides page 1** - Skip lignes sans versets
3. **Aperçu au mauvais moment** - Condition `position.line >= 10` changée en `isLastPortionOfPage()`
4. **Plus que X lignes affichées** - Versets qui dépassent vont dans overflow
5. **Pas de numéro de page** - Ajouté "Page X -" au label

---

## FICHIERS DU PROJET

```
src/
├── App.jsx                 # Settings, routing
├── index.css              # Styles, tajweed colors
├── main.jsx               # Entry point
├── components/
│   ├── AudioPlayer.jsx    # Lecteur audio
│   ├── Sidebar.jsx        # Navigation + options
│   └── VerseDisplay.jsx   # (moins utilisé maintenant)
├── pages/
│   ├── HomePage.jsx       # Page principale (MODIFIE++)
│   └── TrainingPage.jsx   # Page entraînement
└── services/
    └── quranApi.js        # Appels API Quran.com
```

---

## PROCHAINES AMELIORATIONS POSSIBLES

1. Mode entraînement avec versets cachés
2. Statistiques détaillées de progression
3. Rappels/notifications
4. Export/import de progression
5. Mode hors-ligne avec cache
