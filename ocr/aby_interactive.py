#!/usr/bin/env python3
"""
ABY Interactive Processor
=========================
Mode interactif pour mapper les unités et dialogues manuellement
avec OCR + Traduction automatique par Gemini.

Workflow:
1. Convertir PDF en images
2. Afficher chaque page et demander: Unité? Dialogue? Skip?
3. OCR + Traduction automatique
4. Export JSON final
"""

import os
import json
import time
from pathlib import Path
from typing import Optional, List
import google.generativeai as genai

# === CONFIGURATION ===
API_KEY = "AIzaSyAcFwrCFv4e2Zr79S_y-d640EBNhqGGq5k"
GEMINI_MODEL = "gemini-2.0-flash-exp"

GENERATION_CONFIG = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json"
}


class ABYInteractiveProcessor:
    """Processeur interactif pour les livres ABY"""

    def __init__(self, book_id: str):
        self.book_id = book_id
        self.tome = int(book_id[-1])
        genai.configure(api_key=API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)

        # Structure de données
        self.data = {
            "bookId": book_id,
            "title": f"Al-Arabiya Bayna Yadayk - Tome {self.tome}",
            "units": []
        }
        self.current_unit_idx = -1
        self.image_paths = []

    def load_images(self, images_dir: str):
        """Charge les images depuis un dossier"""
        self.images_dir = Path(images_dir)
        self.image_paths = sorted(self.images_dir.glob("*.png"))
        if not self.image_paths:
            self.image_paths = sorted(self.images_dir.glob("*.jpg"))
        print(f"📚 {len(self.image_paths)} images trouvées")

    def pdf_to_images(self, pdf_path: str, dpi: int = 200):
        """Convertit un PDF en images"""
        from pdf2image import convert_from_path

        output_dir = f"pages_{self.book_id}"
        Path(output_dir).mkdir(exist_ok=True)

        print(f"📄 Conversion PDF → Images...")
        images = convert_from_path(pdf_path, dpi=dpi)

        self.image_paths = []
        for i, img in enumerate(images, 1):
            img_path = Path(output_dir) / f"page_{i:03d}.png"
            img.save(str(img_path), "PNG")
            self.image_paths.append(img_path)
            print(f"  Page {i}/{len(images)}", end="\r")

        print(f"\n✅ {len(self.image_paths)} pages converties")
        self.images_dir = Path(output_dir)

    def add_unit(self, unit_num: int, title_ar: str = "", title_fr: str = ""):
        """Ajoute une nouvelle unité"""
        unit = {
            "id": unit_num,
            "titleAr": title_ar or f"الوحدة {self._to_arabic_num(unit_num)}",
            "titleFr": title_fr or f"Unité {unit_num}",
            "lessons": [] if self.tome >= 2 else None,
            "dialogues": [] if self.tome == 1 else None
        }
        # Nettoyer None
        unit = {k: v for k, v in unit.items() if v is not None}
        self.data["units"].append(unit)
        self.current_unit_idx = len(self.data["units"]) - 1
        return unit

    def _to_arabic_num(self, n: int) -> str:
        """Convertit un nombre en chiffres arabes"""
        arabic = "٠١٢٣٤٥٦٧٨٩"
        return "".join(arabic[int(d)] for d in str(n))

    def extract_page(
        self,
        page_idx: int,
        content_type: str = "dialogue",
        lesson_num: Optional[int] = None
    ) -> dict:
        """Extrait une page avec OCR + Traduction"""
        if page_idx >= len(self.image_paths):
            return {"error": "Page index out of range"}

        img_path = self.image_paths[page_idx]
        print(f"  🔍 OCR page {page_idx + 1}...")

        from PIL import Image
        img = Image.open(img_path)

        # Prompt selon le type
        if content_type == "dialogue":
            prompt = self._get_dialogue_prompt()
        else:
            prompt = self._get_text_prompt()

        try:
            response = self.model.generate_content(
                [prompt, img],
                generation_config=GENERATION_CONFIG
            )
            result = json.loads(response.text)
            result["pdfPage"] = page_idx + 1
            print(f"  ✅ {len(result.get('lines', []))} lignes extraites")
            return result

        except json.JSONDecodeError as e:
            print(f"  ⚠️ Erreur JSON: {e}")
            return {"lines": [], "error": str(e)}
        except Exception as e:
            print(f"  ❌ Erreur: {e}")
            return {"lines": [], "error": str(e)}

    def _get_dialogue_prompt(self) -> str:
        return """Analyse cette page du livre "Al-Arabiya Bayna Yadayk".

Extraire le DIALOGUE avec traduction ligne par ligne.

FORMAT JSON:
{
  "titleAr": "عنوان الحوار",
  "titleFr": "Titre du dialogue",
  "lines": [
    {"speaker": "أحمد", "arabic": "السَّلامُ عَلَيْكُمْ", "french": "Que la paix soit sur vous"},
    {"speaker": "محمد", "arabic": "وَعَلَيْكُمُ السَّلامُ", "french": "Et sur vous la paix"}
  ]
}

RÈGLES:
- Garde les diacritiques arabes (tashkeel)
- Alterne les speakers (2 personnes en général)
- Si pas de nom visible: "المتحدث ١" et "المتحدث ٢"
- Traduction naturelle en français
- Ignore numéros de page

Retourne UNIQUEMENT le JSON."""

    def _get_text_prompt(self) -> str:
        return """Analyse cette page du livre "Al-Arabiya Bayna Yadayk".

Extraire le TEXTE avec traduction.

FORMAT JSON:
{
  "titleAr": "عنوان النص",
  "titleFr": "Titre du texte",
  "lines": [
    {"speaker": "", "arabic": "النص العربي", "french": "Le texte français"}
  ]
}

RÈGLES:
- Garde les diacritiques arabes
- speaker vide "" pour texte narratif
- Découpe en phrases logiques
- Traduction naturelle
- Ignore numéros de page

Retourne UNIQUEMENT le JSON."""

    def add_lesson_to_current_unit(
        self,
        lesson_data: dict,
        lesson_type: str = "dialogue"
    ):
        """Ajoute une leçon à l'unité courante"""
        if self.current_unit_idx < 0:
            print("⚠️ Aucune unité active, création unité 1")
            self.add_unit(1)

        unit = self.data["units"][self.current_unit_idx]
        key = "lessons" if self.tome >= 2 else "dialogues"

        if key not in unit:
            unit[key] = []

        lesson_num = len(unit[key]) + 1
        lesson_id = f"{unit['id']}.{lesson_num}"

        lesson = {
            "id": lesson_id,
            "type": lesson_type,
            "titleAr": lesson_data.get("titleAr", ""),
            "titleFr": lesson_data.get("titleFr", ""),
            "pdfPage": lesson_data.get("pdfPage"),
            "youtubeUrl": "",  # À remplir manuellement
            "lines": lesson_data.get("lines", [])
        }

        unit[key].append(lesson)
        return lesson

    def save(self, output_path: Optional[str] = None):
        """Sauvegarde le JSON"""
        if output_path is None:
            output_path = f"{self.book_id}_extracted.json"

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

        print(f"💾 Sauvegardé: {output_path}")
        return output_path

    def interactive_process(self, start_page: int = 0, end_page: Optional[int] = None):
        """Mode interactif page par page"""
        if not self.image_paths:
            print("❌ Aucune image chargée. Utilisez load_images() ou pdf_to_images()")
            return

        if end_page is None:
            end_page = len(self.image_paths)

        print("\n" + "=" * 50)
        print("🎮 MODE INTERACTIF ABY")
        print("=" * 50)
        print("Commandes:")
        print("  u [num] [titre_ar] [titre_fr] - Nouvelle unité")
        print("  d - Extraire comme dialogue")
        print("  t - Extraire comme texte")
        print("  s - Skip cette page")
        print("  q - Quitter et sauvegarder")
        print("  b - Page précédente")
        print("  v - Voir image (ouvre dans viewer)")
        print("=" * 50 + "\n")

        page_idx = start_page
        while page_idx < end_page:
            img_path = self.image_paths[page_idx]
            print(f"\n📄 Page {page_idx + 1}/{len(self.image_paths)}: {img_path.name}")
            print(f"   Unité actuelle: {self.current_unit_idx + 1 if self.current_unit_idx >= 0 else 'Aucune'}")

            cmd = input(">>> ").strip().lower()

            if cmd.startswith("u"):
                # Nouvelle unité: u 5 الوحدة الخامسة Unité 5
                parts = cmd.split(maxsplit=3)
                unit_num = int(parts[1]) if len(parts) > 1 else len(self.data["units"]) + 1
                title_ar = parts[2] if len(parts) > 2 else ""
                title_fr = parts[3] if len(parts) > 3 else ""
                self.add_unit(unit_num, title_ar, title_fr)
                print(f"✅ Unité {unit_num} créée")

            elif cmd == "d":
                # Dialogue
                result = self.extract_page(page_idx, "dialogue")
                if result.get("lines"):
                    self.add_lesson_to_current_unit(result, "dialogue")
                    print(f"✅ Dialogue ajouté ({len(result['lines'])} lignes)")
                page_idx += 1
                time.sleep(1)

            elif cmd == "t":
                # Texte
                result = self.extract_page(page_idx, "texte")
                if result.get("lines"):
                    self.add_lesson_to_current_unit(result, "texte")
                    print(f"✅ Texte ajouté ({len(result['lines'])} lignes)")
                page_idx += 1
                time.sleep(1)

            elif cmd == "s":
                # Skip
                print("⏭️ Page ignorée")
                page_idx += 1

            elif cmd == "b":
                # Back
                page_idx = max(0, page_idx - 1)

            elif cmd == "v":
                # View image
                try:
                    os.startfile(str(img_path))  # Windows
                except:
                    os.system(f"open '{img_path}'")  # Mac
                    os.system(f"xdg-open '{img_path}'")  # Linux

            elif cmd == "q":
                # Quit
                self.save()
                print("👋 Session terminée")
                break

            else:
                print("❓ Commande inconnue")

        # Auto-save à la fin
        if page_idx >= end_page:
            self.save()
            print("✅ Traitement terminé!")


def batch_process(
    pdf_path: str,
    book_id: str,
    page_ranges: List[dict],
    output_path: Optional[str] = None
):
    """
    Traitement batch avec configuration prédéfinie.

    Args:
        pdf_path: Chemin du PDF
        book_id: ID du livre (aby1, aby2, etc.)
        page_ranges: Liste de config par unité
            [
                {"unit": 1, "title_ar": "...", "title_fr": "...", "pages": [1,2,3], "type": "dialogue"},
                {"unit": 2, "title_ar": "...", "title_fr": "...", "pages": [10,11,12], "type": "texte"},
            ]
        output_path: Fichier JSON de sortie
    """
    processor = ABYInteractiveProcessor(book_id)
    processor.pdf_to_images(pdf_path)

    for unit_config in page_ranges:
        unit_num = unit_config["unit"]
        processor.add_unit(
            unit_num,
            unit_config.get("title_ar", ""),
            unit_config.get("title_fr", "")
        )

        for page_num in unit_config["pages"]:
            page_idx = page_num - 1  # 0-indexed
            content_type = unit_config.get("type", "dialogue")

            print(f"\n📖 Unité {unit_num}, Page {page_num} ({content_type})")
            result = processor.extract_page(page_idx, content_type)

            if result.get("lines"):
                processor.add_lesson_to_current_unit(result, content_type)
            else:
                print(f"  ⚠️ Aucune ligne extraite")

            time.sleep(1)  # Rate limiting

    return processor.save(output_path)


# === EXEMPLE D'UTILISATION ===

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("""
Usage:
  # Mode interactif
  python aby_interactive.py interactive ABY-T1.pdf aby1

  # Mode batch avec config
  python aby_interactive.py batch ABY-T2.pdf aby2 config.json

Exemple config.json pour batch:
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
        """)
        sys.exit(1)

    mode = sys.argv[1]
    pdf_path = sys.argv[2]
    book_id = sys.argv[3]

    if mode == "interactive":
        processor = ABYInteractiveProcessor(book_id)
        processor.pdf_to_images(pdf_path)
        processor.interactive_process()

    elif mode == "batch":
        if len(sys.argv) < 5:
            print("❌ Config JSON requis pour mode batch")
            sys.exit(1)

        config_path = sys.argv[4]
        with open(config_path, "r", encoding="utf-8") as f:
            page_ranges = json.load(f)

        batch_process(pdf_path, book_id, page_ranges)
