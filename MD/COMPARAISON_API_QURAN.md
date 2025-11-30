# Comparaison des APIs Quran - Analyse Approfondie

## Sommaire
1. [Vue d'ensemble](#vue-densemble)
2. [APIs Analysées](#apis-analysées)
3. [Tableau Comparatif](#tableau-comparatif)
4. [Analyse Détaillée](#analyse-détaillée)
5. [Recommandations](#recommandations)

---

## Vue d'ensemble

Cette analyse compare les principales APIs disponibles pour accéder au contenu du Coran (texte, audio, tajweed, numéros de lignes, etc.) afin de déterminer la meilleure option pour une application de mémorisation du Quran.

---

## APIs Analysées

| # | API | URL | Type |
|---|-----|-----|------|
| 1 | **Quran.com / Quran Foundation** | api.quran.com / api.quran.foundation | REST API |
| 2 | **AlQuran.cloud** | api.alquran.cloud | REST API |
| 3 | **Tarteel AI / QUL** | qul.tarteel.ai | Datasets (pas d'API live) |
| 4 | **EveryAyah** | everyayah.com | CDN Audio |
| 5 | **MP3Quran** | mp3quran.net/api | REST API |
| 6 | **QuranEnc** | quranenc.com/api | REST API |
| 7 | **Tanzil** | tanzil.net | Datasets téléchargeables |
| 8 | **QuranHub** | quranhub.com | REST API |
| 9 | **Free Quran API** | quranapi.pages.dev | REST API (CDN) |

---

## Tableau Comparatif

### Fonctionnalités Principales

| Fonctionnalité | Quran.com | AlQuran.cloud | Tarteel/QUL | EveryAyah | MP3Quran | QuranEnc |
|----------------|-----------|---------------|-------------|-----------|----------|----------|
| **Texte Uthmani** | ✅ | ✅ | ✅ (download) | ❌ | ❌ | ❌ |
| **Tajweed HTML** | ✅ Excellent | ✅ Basique | ❌ | ❌ | ❌ | ❌ |
| **Audio Versets** | ✅ | ✅ | ✅ (download) | ✅ | ✅ | ❌ |
| **Audio Mot-à-mot** | ✅ | ❌ | ✅ (timestamps) | ❌ | ❌ | ❌ |
| **Numéros de Lignes** | ✅ Complet | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Position des Mots** | ✅ | ❌ | ✅ (download) | ❌ | ❌ | ❌ |
| **Traductions** | ✅ Multiple | ✅ 50+ | ✅ Multiple | ❌ | ❌ | ✅ 50+ |
| **Tafsir** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

### Aspects Techniques

| Aspect | Quran.com | AlQuran.cloud | Tarteel/QUL | EveryAyah | MP3Quran |
|--------|-----------|---------------|-------------|-----------|----------|
| **Authentification** | OAuth2 | Aucune | Aucune | Aucune | Aucune |
| **Rate Limits** | Oui | Non spécifié | N/A | Non | Non |
| **Prix** | Gratuit (signup) | Gratuit | Gratuit | Gratuit | Gratuit |
| **Documentation** | Excellente | Bonne | Limitée | Basique | Bonne |
| **Open Source** | Oui | Oui | Partiel | Partiel | Oui |

### Qualité Audio

| API | Récitateurs | Qualité | Formats | Riwayat |
|-----|-------------|---------|---------|---------|
| **Quran.com** | 15+ | 128kbps | MP3 | Hafs principalement |
| **AlQuran.cloud** | 10+ | 128kbps | MP3 | Hafs |
| **EveryAyah** | **26+** | 64-192kbps | MP3 | Hafs, Warsh, Qaloon |
| **MP3Quran** | **100+** | Variable | MP3 | Multiple |

---

## Analyse Détaillée

### 1. Quran.com / Quran Foundation API

**URL**: `https://api.quran.com/api/v4`

**Points Forts**:
- ✅ **Meilleur support Tajweed** avec balises HTML colorées
- ✅ **Numéros de lignes par mot** (crucial pour système de portions)
- ✅ Audio mot-à-mot avec timestamps précis
- ✅ Documentation excellente avec exemples
- ✅ Données de position des mots sur la page
- ✅ Support Juz, Hizb, Rub el Hizb

**Points Faibles**:
- ⚠️ Nécessite authentification OAuth2
- ⚠️ Rate limits (non spécifiés publiquement)
- ⚠️ Inscription requise pour accès complet

**Exemple de données Tajweed**:
```html
<span class="ham_wasl">ٱ</span>لْحَمْدُ لِلَّهِ رَبِّ <span class="madda_normal">ٱ</span>لْعَـٰلَمِينَ
```

**Endpoint clé pour lignes**:
```
GET /verses/by_page/{page}?words=true&word_fields=line_number,page_number
```

**Verdict**: ⭐⭐⭐⭐⭐ **MEILLEURE OPTION** pour applications complètes

---

### 2. AlQuran.cloud API

**URL**: `https://api.alquran.cloud/v1`

**Points Forts**:
- ✅ Aucune authentification requise
- ✅ Pas de rate limits apparents
- ✅ 50+ éditions/traductions
- ✅ Simple à utiliser
- ✅ Open source (auto-hébergeable)

**Points Faibles**:
- ❌ **Pas de numéros de lignes**
- ❌ Tajweed basique (nécessite parsing externe)
- ❌ Pas d'audio mot-à-mot
- ❌ Moins de métadonnées

**Endpoints principaux**:
```
GET /page/{page}/quran-uthmani
GET /surah/{surah}/quran-uthmani
GET /ayah/{surah}:{ayah}/quran-uthmani
```

**Verdict**: ⭐⭐⭐⭐ Excellent pour prototypage rapide, limité pour features avancées

---

### 3. Tarteel AI / QUL (Quranic Universal Library)

**URL**: `https://qul.tarteel.ai/resources`

**IMPORTANT**: Tarteel **n'a PAS d'API publique**. Ils offrent des datasets téléchargeables.

**Points Forts**:
- ✅ Données de haute qualité
- ✅ Timestamps audio précis (mot-à-mot)
- ✅ Données de grammaire/morphologie
- ✅ Multiple scripts (Madani, IndoPak, Uthmani)
- ✅ Polices Quran incluses

**Points Faibles**:
- ❌ **Pas d'API live** - uniquement téléchargement
- ❌ Audio et modèles AI non disponibles
- ❌ Nécessite intégration manuelle

**Formats disponibles**: JSON, SQLite

**Verdict**: ⭐⭐⭐ Utile pour données offline, pas pour API temps réel

---

### 4. EveryAyah

**URL**: `https://everyayah.com/data/{reciter}/{surah}{ayah}.mp3`

**Points Forts**:
- ✅ **26+ récitateurs** de qualité
- ✅ Multiple qualités (64, 128, 192 kbps)
- ✅ **Multiple riwayat** (Hafs, Warsh, Qaloon)
- ✅ Aucune limite
- ✅ URL directe simple

**Points Faibles**:
- ❌ Audio uniquement (pas de texte)
- ❌ Pas d'API structurée
- ❌ Documentation minimale

**Récitateurs Disponibles**:
- Mishary Alafasy (Hafs)
- Abdul Basit (Murattal & Mujawwad)
- Al-Husary (Muallim)
- Maher Al-Muaiqly
- Saad Al-Ghamdi
- Abdul Rahman Al-Sudais
- Et 20+ autres...

**Format URL**:
```
https://everyayah.com/data/Alafasy_128kbps/001001.mp3
                         [reciter_id]    [surah3digits][ayah3digits]
```

**Verdict**: ⭐⭐⭐⭐⭐ **MEILLEUR pour l'audio** - Large choix de récitateurs

---

### 5. MP3Quran API

**URL**: `https://mp3quran.net/api/v3`

**Points Forts**:
- ✅ **100+ récitateurs**
- ✅ Timestamps précis par verset
- ✅ Streams TV/Radio live (Makkah, Madinah)
- ✅ Métadonnées complètes

**Points Faibles**:
- ❌ Pas de texte
- ❌ Documentation en arabe principalement

**Endpoints**:
```
GET /reciters?language=eng
GET /ayat_timing?reciter={id}&sura={num}
GET /radios?language=eng
```

**Verdict**: ⭐⭐⭐⭐ Excellent pour audio avec timestamps

---

### 6. QuranEnc API

**URL**: `https://quranenc.com/api/v1`

**Points Forts**:
- ✅ **50+ traductions** en 30+ langues
- ✅ Notes de bas de page
- ✅ Export multiple formats (XLSX, CSV, XML, JSON, PDF)

**Points Faibles**:
- ❌ Pas d'audio
- ❌ Pas de texte arabe original
- ❌ Traductions uniquement

**Verdict**: ⭐⭐⭐ Spécialisé traductions uniquement

---

### 7. Tanzil.net

**URL**: `https://tanzil.net/download`

**Type**: Datasets téléchargeables (pas d'API)

**Points Forts**:
- ✅ Source officielle et fiable
- ✅ 90+ traductions
- ✅ Texte Uthmani de référence

**Points Faibles**:
- ❌ Pas d'API live
- ❌ Téléchargement manuel

**Verdict**: ⭐⭐⭐ Source de données, pas une API

---

## Recommandations

### Pour ton application Quran Hifz

**Configuration Recommandée** (ce que tu utilises déjà est optimal):

| Besoin | API Recommandée | Raison |
|--------|-----------------|--------|
| **Texte + Tajweed + Lignes** | Quran.com API | Seule API avec numéros de lignes par mot |
| **Audio Récitation** | EveryAyah | Plus grand choix de récitateurs |
| **Backup Texte** | AlQuran.cloud | Simple, sans auth, fiable |

### Pourquoi Quran.com est le meilleur choix

Pour une app de **mémorisation par portions/lignes**, Quran.com est **indispensable** car c'est la **seule API** qui fournit:

1. **`line_number`** - Numéro de ligne de chaque mot sur la page
2. **`page_number`** - Numéro de page Mushaf Madani
3. **`text_uthmani_tajweed`** - Texte avec balises Tajweed colorées
4. **Audio mot-à-mot** avec timestamps

**Aucune autre API** ne fournit les numéros de lignes au niveau des mots.

### Alternative si tu veux éviter l'authentification

Si tu veux simplifier (sans OAuth2):

```
Texte: AlQuran.cloud (simple, gratuit)
Audio: EveryAyah (CDN direct)
Lignes: ❌ Non disponible ailleurs
```

**Problème**: Tu perdrais le système de portions par lignes.

---

## Conclusion

### Classement Global

| Rang | API | Score | Meilleur Pour |
|------|-----|-------|---------------|
| 🥇 | **Quran.com** | 95/100 | Apps complètes, tajweed, lignes |
| 🥈 | **EveryAyah** | 90/100 | Audio, récitateurs multiples |
| 🥉 | **AlQuran.cloud** | 85/100 | Prototypage, simplicité |
| 4 | MP3Quran | 80/100 | Audio avec timestamps |
| 5 | Tarteel/QUL | 75/100 | Datasets offline |
| 6 | QuranEnc | 70/100 | Traductions multilingues |

### Ta Configuration Actuelle

Tu utilises déjà la **meilleure combinaison possible**:

```javascript
const QURAN_COM_API = 'https://api.quran.com/api/v4';  // Tajweed + Lignes
const TEXT_API_BASE = 'https://api.alquran.cloud/v1'; // Backup texte
const AUDIO = 'https://everyayah.com/data/';          // Audio
```

**Aucun changement nécessaire** - tu as la configuration optimale.

---

## Sources

- [Quran Foundation API Docs](https://api-docs.quran.com/)
- [AlQuran.cloud API](https://alquran.cloud/api)
- [Tarteel QUL Resources](https://qul.tarteel.ai/resources)
- [Tarteel Help - No API](https://support.tarteel.ai/en/articles/12414464-do-you-have-an-api-i-can-use)
- [EveryAyah Recitations](https://everyayah.com/recitations_ayat.html)
- [MP3Quran API GitHub](https://github.com/MP3Quran/apis)
- [QuranEnc API](https://quranenc.com/en/home/api/)
- [Tanzil Download](https://tanzil.net/download/)
- [Quran API (Free)](https://quranapi.pages.dev/)
- [Quranic Arabic Corpus](https://corpus.quran.com/)
