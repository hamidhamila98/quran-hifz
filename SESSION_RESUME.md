# Session Resume - Quran Hifz App

## Date: 28 Novembre 2025

## Contexte du Projet
Application de mémorisation du Coran avec affichage du texte arabe, tajweed (règles de récitation colorées), et audio.

---

## Tâches Complétées Cette Session

### 1. Correction du Double Symbole de Fin de Verset
**Problème:** Le marqueur de fin de verset (۝) affichait DEUX symboles au lieu d'un seul avec le numéro à l'intérieur.

**Solution:**
- Modifié `VerseDisplay.jsx` et `HomePage.jsx` pour utiliser une approche unifiée
- Créé la classe CSS `.verse-marker-styled` avec positionnement absolu
- Le numéro est maintenant superposé au centre du symbole ۝

**Fichiers modifiés:**
- `src/components/VerseDisplay.jsx`
- `src/pages/HomePage.jsx`
- `src/index.css`

### 2. Ajustement Position du Numéro de Verset
**Demande:** "met a -35 pourcent pas -50% stp"

**Solution:** Changé `transform: translate(-50%, -50%)` en `translate(-50%, -35%)` pour centrer visuellement le numéro dans le symbole.

### 3. Option "Cacher Bismillah"
**Fonctionnalité:** Permettre de cacher la Bismillah au début de chaque sourate (sauf Al-Fatiha et At-Tawbah).

**Implémentation:**
- Ajouté `hideBismillah: true` dans les settings par défaut (`App.jsx`)
- Ajouté toggle dans `Sidebar.jsx`
- Modifié `quranApi.js` et `cpfairTajweed.js` pour filtrer la Bismillah
- Ajusté les positions des annotations tajweed après suppression de la Bismillah

### 4. Retours à la Ligne Style Mushaf avec Tajweed
**Demande:** Afficher le texte avec les retours à la ligne correspondant au vrai Mushaf (15 lignes par page), tout en gardant le tajweed fonctionnel.

**Problème initial:** Le mode Mushaf séparé ne supportait pas le tajweed car il rendait mot par mot sans les couleurs.

**Solution complète:**

#### a) Tajweed mot par mot (`cpfairTajweed.js`)
Nouvelles fonctions:
```javascript
getVerseWordsWithTajweed(surah, ayah, options)
// Retourne un tableau de mots avec leur HTML tajweed

applyTajweedToWords(surah, ayah, quranComWords, options)
// Mappe les mots quran.com aux mots cpfair avec tajweed
```

#### b) Données de lignes avec tajweed (`quranApi.js`)
Modifié `getPageWithLines()`:
- Récupère les mots avec leur `line_number` depuis l'API quran.com
- Applique le tajweed mot par mot via cpfair
- Chaque mot a maintenant un champ `tajweedHtml`

#### c) Affichage ligne par ligne (`HomePage.jsx`)
- Supprimé le mode Mushaf séparé
- L'affichage normal rend maintenant ligne par ligne
- Chaque ligne est un `<div>` centré avec les mots
- Le tajweed est appliqué à chaque mot individuellement
- Les marqueurs de fin de verset sont rendus avec `renderVerseMarker()`

#### d) Nettoyage
- Supprimé `MushafDisplay` component (plus utilisé)
- Supprimé toggle "Mode Mushaf" de la sidebar
- Supprimé setting `mushafMode` des defaults

---

## Architecture Technique

### Flux de Données pour l'Affichage
```
1. getPageWithLines(pageNumber, useTajweed, options)
   ↓
2. Fetch words depuis quran.com API (avec line_number)
   ↓
3. Pour chaque verset avec tajweed activé:
   - getVerseWordsWithTajweed() → mots cpfair avec HTML tajweed
   - Mapper aux mots quran.com par position
   ↓
4. Construire linesMap: Map<lineNumber, words[]>
   ↓
5. Retourner { verses, lines, pageNumber }
```

### Structure des Données de Ligne
```javascript
{
  lineNumber: 1-15,
  words: [
    {
      text: "بِسْمِ",           // Texte brut
      tajweedHtml: "<span>...</span>", // HTML avec couleurs
      verseKey: "1:1",
      verseNumber: 1,
      surahNumber: 1,
      isEndMarker: false,
      position: 1
    },
    // ...
  ]
}
```

### Rendu dans HomePage
```jsx
{portionLines.map(line => (
  <div className="mushaf-line text-center mb-2" dir="rtl">
    {line.words.map(word => (
      <span>
        {word.isEndMarker ? (
          renderVerseMarker(word.verseNumber)
        ) : settings.tajweedEnabled && word.tajweedHtml ? (
          <span dangerouslySetInnerHTML={{ __html: word.tajweedHtml }} />
        ) : (
          word.text
        )}
      </span>
    ))}
  </div>
))}
```

---

## Fichiers Modifiés (Résumé)

| Fichier | Modifications |
|---------|---------------|
| `src/services/cpfairTajweed.js` | +2 fonctions tajweed mot par mot |
| `src/services/quranApi.js` | Tajweed dans getPageWithLines |
| `src/pages/HomePage.jsx` | Affichage ligne par ligne, supprimé MushafDisplay |
| `src/components/Sidebar.jsx` | Supprimé toggle Mode Mushaf |
| `src/App.jsx` | Supprimé setting mushafMode |
| `src/index.css` | Styles verse-marker-styled |

---

## Settings Actuels (App.jsx)
```javascript
{
  portionSize: '1/3',
  currentPage: 1,
  currentPortionIndex: 0,
  validatedPages: 0,
  reciter: 'ar.husary',
  darkMode: false,
  tajweedEnabled: false,
  arabicFont: 'amiri-quran',
  flowMode: false,
  arabicNumerals: true,
  hideBismillah: true
}
```

---

## Pour Continuer le Développement

### Tester
```bash
npm run dev
```

### Points d'attention
1. Le tajweed mot par mot dépend de la correspondance entre mots quran.com et cpfair
2. Les pages spéciales (1 et 2) ont un traitement particulier
3. Le mode 2 pages affiche encore les versets de manière classique (pas ligne par ligne) pour la 2e page

### Améliorations possibles
- Appliquer l'affichage ligne par ligne aussi pour le mode 2 pages
- Ajouter un indicateur visuel du numéro de ligne Mushaf
- Cache local des données de page pour performance
