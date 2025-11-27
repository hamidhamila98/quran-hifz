# Quran Hifz - Application de Mémorisation du Coran

## 📋 Vue d'ensemble

**Quran Hifz** est une application web moderne conçue pour faciliter la mémorisation progressive du Saint Coran. L'application offre un système structuré pour apprendre le Coran ligne par ligne avec un suivi de progression et des outils d'entraînement interactifs.

---

## 🎯 Fonctionnalités Principales

### 1. **Page d'Accueil (HomePage)**
- Affichage quotidien de la portion à mémoriser basée sur l'objectif de lignes par jour
- Statistiques en temps réel :
  - Nombre de jours depuis le début
  - Lignes par jour configurées
  - Page actuelle
  - Total de lignes mémorisées
- Lecteur audio intégré pour écouter la récitation
- Progression visuelle dans le Coran
- Navigation automatique vers la portion suivante

### 2. **Entraînement (TrainingPage)**
- Mode d'entraînement interactif avec versets aléatoires
- Sélection flexible de la plage d'entraînement :
  - Par **Juz** (30 parties du Coran)
  - Par **Hizb** (60 sections)
  - Par **Sourate** (114 chapitres)
  - Par **plage de pages** personnalisée
- Configuration du nombre de questions et de versets par question
- Système de révélation progressive :
  - Premier verset partiellement caché
  - Versets suivants complètement cachés
  - Indices disponibles (début des versets)
- Système de scoring avec statistiques
- Écran de résultats avec encouragements

### 3. **Navigation (BrowsePage)**
- Navigation page par page dans le Coran complet (604 pages)
- Liste recherchable des 114 sourates
- Navigation rapide par sourate
- Affichage du contexte (sourate actuelle, numéro de page)
- Lecteur audio synchronisé avec la page

### 4. **Paramètres (SettingsPage)**
Personnalisation complète de l'expérience :

#### Objectifs de mémorisation
- Nombre de lignes par jour (1-15)
- Page actuelle dans le Coran
- Date de début du programme

#### Audio
- Choix parmi 5 récitateurs célèbres :
  - Mishary Rashid Alafasy
  - Abdul Basit (Murattal)
  - Mahmoud Khalil Al-Husary
  - Mohamed Siddiq El-Minshawi
  - Abdul Samad

#### Apparence
- **Mode sombre** pour réduire la fatigue oculaire
- **Affichage Tajweed** avec couleurs pour les règles de récitation
- **Mode Mushaf** pour affichage en flux continu
- **5 polices arabes** au choix :
  - Amiri Quran
  - Amiri
  - Scheherazade New
  - Noto Naskh Arabic
  - Kitab

#### Navigation rapide
- Accès direct aux sourates populaires (Al-Fatiha, Al-Baqara, Al-Kahf, Juz Amma)

---

## 🏗️ Architecture Technique

### Stack Technologique
- **Framework Frontend** : React 19.2.0
- **Routeur** : React Router DOM 7.9.6
- **Build Tool** : Vite 7.2.4
- **Styling** : Tailwind CSS 3.4.18
- **Icônes** : Lucide React 0.555.0

### Structure du Projet
```
quran-hifz/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx         # Page d'accueil avec portion quotidienne
│   │   ├── TrainingPage.jsx     # Mode entraînement interactif
│   │   ├── BrowsePage.jsx       # Navigation page par page
│   │   └── SettingsPage.jsx     # Configuration de l'application
│   ├── components/
│   │   ├── Sidebar.jsx          # Barre latérale de navigation
│   │   ├── AudioPlayer.jsx      # Lecteur audio pour récitation
│   │   └── VerseDisplay.jsx     # Affichage des versets arabes
│   ├── services/
│   │   └── quranApi.js          # Service API Coran
│   ├── App.jsx                  # Composant principal
│   └── main.jsx                 # Point d'entrée
├── public/
├── index.html
└── package.json
```

### Sources de Données (APIs)

L'application utilise plusieurs APIs externes pour récupérer le contenu du Coran :

1. **AlQuran.cloud** (`api.alquran.cloud/v1`)
   - Texte du Coran en script Uthmani
   - Données des sourates et versets
   - Recherche dans le Coran

2. **Quran.com API** (`api.quran.com/api/v4`)
   - Texte avec Tajweed (règles de récitation colorées)
   - Version avancée pour l'affichage visuel

3. **EveryAyah** (`everyayah.com/data`)
   - Fichiers audio MP3 de récitation
   - Support de multiples récitateurs

4. **Islamic Network CDN** (`cdn.islamic.network/quran/audio`)
   - CDN de secours pour les fichiers audio

---

## 💾 Gestion des Données

### LocalStorage
L'application sauvegarde automatiquement tous les paramètres dans `localStorage` :
- Paramètres utilisateur (objectifs, préférences)
- Progression actuelle (page, verset)
- Configuration d'affichage

Clé de stockage : `quran-hifz-settings`

### Données Statiques Intégrées
- Métadonnées de 114 sourates (nom arabe, anglais, pages, nombre de versets)
- Informations sur 30 Juz (parties)
- Informations sur 60 Hizb (sections)
- Règles de Tajweed avec codes couleur

---

## 🎨 Fonctionnalités Visuelles

### Affichage du Texte Arabe
- Support de 5 polices arabes professionnelles
- Direction RTL (droite à gauche)
- Tailles de texte optimisées pour la lisibilité

### Mode Tajweed
Codage couleur pour les règles de récitation :
- **Gris** : Hamza Wasl, Silent, Lam Shamsiyya
- **Bleu** : Madd (prolongation) Normal
- **Vert** : Madd Permissible, Idgham
- **Rouge** : Madd Obligatoire, Qalqala
- **Violet/Magenta** : Ikhfa
- **Orange** : Ghunna

### Thèmes
- **Mode clair** : Interface lumineuse avec contraste optimal
- **Mode sombre** : Réduit la fatigue oculaire pour les sessions de nuit

---

## 🔊 Lecteur Audio

### Fonctionnalités
- Lecture/Pause avec contrôles intuitifs
- Navigation entre les versets (précédent/suivant)
- Barre de progression avec seek
- Contrôle du volume
- Mode répétition pour un verset
- Lecture automatique enchaînée des versets
- Indicateur de chargement

### Récitateurs Disponibles
Tous les récitateurs sont fournis en qualité 128kbps :
1. **Mishary Rashid Alafasy** (par défaut)
2. **Abdul Basit (Murattal)**
3. **Mahmoud Khalil Al-Husary**
4. **Mohamed Siddiq El-Minshawi**
5. **Abdul Samad**

---

## 📊 Système de Progression

### Calcul de la Progression
```
Jours écoulés = (Date actuelle - Date de début) / 24h
Lignes mémorisées = Jours écoulés × Lignes par jour
Progression Quran = (Page actuelle / 604) × 100%
```

### Statistiques Affichées
- **Jours** : Nombre de jours depuis le début
- **Lignes/jour** : Objectif quotidien
- **Page actuelle** : Position dans le Coran (1-604)
- **Total lignes** : Lignes mémorisées au total

---

## 🎓 Mode Entraînement

### Modes de Jeu
1. **Premier verset** : Moitié visible, moitié cachée
2. **Versets suivants** : Complètement cachés avec option d'indice

### Système de Score
- Score en temps réel (correct/total)
- Pourcentage de réussite
- Messages d'encouragement :
  - 90%+ : "Excellent ! Ma sha Allah !"
  - 70-89% : "Très bien ! Continue comme ça !"
  - 50-69% : "Pas mal ! Continue à réviser."
  - <50% : "Continue à réviser, tu peux y arriver !"

### Configuration Flexible
- 5-500 questions par session
- 1-10 versets par question
- Sélection précise de la plage (Juz/Hizb/Sourate/Pages)

---

## 🔧 Installation et Démarrage

### Prérequis
- Node.js (version LTS recommandée)
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Accès
- **Développement** : http://localhost:5173
- **Production** : Déploiement sur n'importe quel hébergeur statique (Vercel, Netlify, etc.)

---

## 🌐 Navigation de l'Application

### Structure de Routage
- `/` - Page d'accueil (portion quotidienne)
- `/training` - Mode entraînement
- `/browse` - Navigation dans le Coran
- `/settings` - Paramètres

### Sidebar
Navigation latérale toujours accessible avec :
- Liens vers toutes les pages
- État actif visible
- Mode rétractable/expandable
- Adaptation au mode sombre

---

## 🎯 Cas d'Usage

### Pour les Débutants
1. Configurer l'objectif à 3-5 lignes par jour
2. Commencer par Juz Amma (page 582)
3. Écouter la récitation plusieurs fois
4. S'entraîner avec 5-10 questions

### Pour les Apprenants Intermédiaires
1. Objectif de 7-10 lignes par jour
2. Continuer depuis la dernière page mémorisée
3. Utiliser le mode Tajweed pour améliorer la récitation
4. Sessions d'entraînement de 10-20 questions

### Pour les Apprenants Avancés
1. Objectif de 10-15 lignes par jour
2. Révision régulière avec le mode entraînement
3. Utilisation intensive du lecteur audio
4. Sessions d'entraînement de 20+ questions sur plusieurs Juz

---

## 🚀 Points Forts de l'Application

✅ **Interface Moderne et Intuitive**
- Design épuré avec Tailwind CSS
- Animations fluides et transitions élégantes
- Expérience utilisateur optimisée

✅ **Flexibilité Complète**
- Personnalisation de tous les aspects
- Adaptation à tous les niveaux d'apprentissage
- Support multilingue (Arabe/Français)

✅ **Pédagogie Active**
- Mode entraînement gamifié
- Feedback immédiat avec scoring
- Révélation progressive pour faciliter la mémorisation

✅ **Richesse du Contenu**
- 114 sourates complètes
- 604 pages du Mushaf
- 5 récitateurs de renommée mondiale
- Tajweed visuel intégré

✅ **Performance et Fiabilité**
- Sauvegarde automatique des progrès
- Fonctionnement hors ligne (après premier chargement)
- API robustes avec plusieurs sources

✅ **Accessibilité**
- Mode sombre pour confort visuel
- Polices lisibles et ajustables
- Navigation intuitive au clavier

---

## 📱 Compatibilité

### Navigateurs Supportés
- Chrome/Edge (recommandé)
- Firefox
- Safari
- Opera

### Responsive Design
- Desktop (1920×1080+)
- Laptop (1366×768+)
- Tablette (768×1024)
- Mobile (375×667+)

---

## 🔮 Évolutions Potentielles

### Fonctionnalités Futures Possibles
- Export des progrès en PDF
- Synchronisation cloud multi-appareils
- Mode hors ligne complet (PWA)
- Traductions multilingues des versets
- Statistiques avancées et graphiques de progression
- Rappels quotidiens personnalisables
- Mode compétition entre utilisateurs
- Intégration de Tafsir (exégèse)
- Notes personnelles sur les versets
- Badges et système de récompenses

---

## 📞 Support et Contribution

### Technologies Utilisées
- React : https://react.dev
- Vite : https://vitejs.dev
- Tailwind CSS : https://tailwindcss.com
- APIs Coran : AlQuran.cloud, Quran.com, EveryAyah

### Licence
Cette application est destinée à l'apprentissage et à la mémorisation du Saint Coran.

---

**Qu'Allah facilite la mémorisation du Noble Coran pour tous les utilisateurs ! 🤲**

*"Nous avons certes facilité le Coran pour la méditation. Y a-t-il quelqu'un pour réfléchir ?" (Sourate Al-Qamar, 54:17)*
