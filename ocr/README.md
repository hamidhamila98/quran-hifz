# 📚 Pipeline OCR ABY - Al-Arabiya Bayna Yadayk

Extraction automatique des dialogues/textes arabes avec traduction française.
Spécifiquement conçu pour les livres Al-Arabiya Bayna Yadayk.

## 🎯 Fonctionnalités

| Script | Description | Usage |
|--------|-------------|-------|
| `aby_ocr_pipeline.py` | Pipeline automatique PDF → JSON | Traitement batch |
| `aby_interactive.py` | Mode interactif page par page | Mapping précis |
| `arabic_ocr_translate.py` | OCR générique (ancien) | Livres quelconques |

## 🔧 Prérequis

### 1. Python 3.8+
```bash
python --version
```

### 2. Installer les dépendances
```bash
pip install pdf2image Pillow google-generativeai
```

### 3. Installer Poppler (pour pdf2image)

**Windows:**
- Télécharge: https://github.com/oschwartz10612/poppler-windows/releases
- Extrais et ajoute le dossier `bin` au PATH système

**Mac:**
```bash
brew install poppler
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install poppler-utils
```

### 4. Clé API Gemini

1. Va sur https://aistudio.google.com/apikey
2. Crée une nouvelle clé API
3. La clé est déjà configurée dans les scripts

## 🚀 Usage - Pipeline Automatique

### Traiter un PDF complet
```bash
python aby_ocr_pipeline.py pdf ABY-T1.pdf --book aby1
```

### Traiter une plage de pages
```bash
python aby_ocr_pipeline.py pdf ABY-T2.pdf --book aby2 --start 10 --end 30
```

### Tester sur une seule image
```bash
# Mode dialogue
python aby_ocr_pipeline.py image page_001.png --dialogue

# Mode texte
python aby_ocr_pipeline.py image page_050.png --texte
```

## 🎮 Usage - Mode Interactif

Le mode interactif permet de mapper précisément chaque page à une unité/dialogue.

```bash
python aby_interactive.py interactive ABY-T1.pdf aby1
```

### Commandes interactives
| Commande | Action |
|----------|--------|
| `u [num]` | Créer nouvelle unité |
| `d` | Extraire comme dialogue |
| `t` | Extraire comme texte |
| `s` | Skip cette page |
| `b` | Page précédente |
| `v` | Voir l'image |
| `q` | Quitter et sauvegarder |

### Mode Batch avec config
```bash
python aby_interactive.py batch ABY-T2.pdf aby2 config.json
```

Exemple `config.json`:
```json
[
  {
    "unit": 5,
    "title_ar": "الوحدة الخامسة",
    "title_fr": "Unité 5",
    "pages": [12, 13, 14, 15],
    "type": "dialogue"
  },
  {
    "unit": 5,
    "pages": [16, 17],
    "type": "texte"
  }
]
```

## 📊 Format de sortie ABY

### Structure JSON (compatible MyIslam)
```json
{
  "bookId": "aby1",
  "title": "Al-Arabiya Bayna Yadayk - Tome 1",
  "units": [
    {
      "id": 1,
      "titleAr": "الوحدة الأولى",
      "titleFr": "Unité 1",
      "dialogues": [
        {
          "id": "1.1",
          "type": "dialogue",
          "titleAr": "التحيات",
          "titleFr": "Les salutations",
          "pdfPage": 12,
          "youtubeUrl": "",
          "lines": [
            {
              "speaker": "أحمد",
              "arabic": "السَّلامُ عَلَيْكُمْ",
              "french": "Que la paix soit sur vous"
            },
            {
              "speaker": "محمد",
              "arabic": "وَعَلَيْكُمُ السَّلامُ",
              "french": "Et sur vous la paix"
            }
          ]
        }
      ]
    }
  ]
}
```

### Différences Tome 1 vs Tome 2+
| Tome 1 | Tomes 2-4 |
|--------|-----------|
| `unit.dialogues[]` | `unit.lessons[]` |
| Principalement dialogues | Dialogues + Textes |

## 💰 Coûts estimés

| Service | Gratuit | Payant |
|---------|---------|--------|
| Gemini 2.0 Flash | Généreux quota gratuit | ~$0.075/1M tokens |

Pour un tome de 200 pages: **~$0.50** max (généralement gratuit)

## 🧪 Tester les APIs

```bash
python test_apis.py
```

## ⚠️ Notes importantes

1. **Qualité OCR**: Les diacritiques (tashkeel) sont mieux préservés avec des scans 200+ DPI
2. **Rate limits**: Pause de 1 seconde entre chaque page
3. **Vérification**: Toujours vérifier le JSON généré, surtout les speakers
4. **YouTube URLs**: À ajouter manuellement après extraction

## 🐛 Dépannage

### "poppler not found"
→ Installer Poppler et l'ajouter au PATH

### Mauvaise détection des speakers
→ Utiliser le mode interactif pour plus de contrôle

### Texte manquant ou tronqué
→ Augmenter le DPI dans `pdf_to_images()` (défaut: 200)

### "API key not valid"
→ Générer une nouvelle clé sur https://aistudio.google.com

## 📁 Structure

```
ocr/
├── aby_ocr_pipeline.py    # Pipeline automatique ABY
├── aby_interactive.py     # Mode interactif ABY
├── arabic_ocr_translate.py # OCR générique (ancien)
├── batch_process.py       # Batch processing (ancien)
├── test_apis.py           # Test des APIs
├── README.md              # Ce fichier
└── pages_aby*/            # Images temporaires (créé auto)
```

## 🔄 Workflow recommandé

1. **Préparation**: Scanner le PDF en 200 DPI minimum
2. **Test**: Extraire 2-3 pages pour vérifier la qualité
3. **Extraction**:
   - Simple: `aby_ocr_pipeline.py` automatique
   - Précis: `aby_interactive.py` page par page
4. **Vérification**: Relire le JSON généré
5. **Finalisation**: Ajouter les URLs YouTube manuellement
6. **Intégration**: Copier vers `public/arabic/ABY-Tx.json`

---

*"خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"*
