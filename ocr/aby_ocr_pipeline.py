#!/usr/bin/env python3
"""
Pipeline OCR ABY - Al-Arabiya Bayna Yadayk
==========================================
Extraction automatique des dialogues/textes arabes avec traduction française.
Utilise Gemini 2.0 Flash pour OCR + Structure + Traduction en une seule étape.

Output: JSON compatible avec l'application MyIslam (format ABY-T1.json)
"""

import os
import json
import time
import base64
import argparse
from pathlib import Path
from typing import Optional
import google.generativeai as genai

# === CONFIGURATION ===
API_KEY = "AIzaSyAcFwrCFv4e2Zr79S_y-d640EBNhqGGq5k"

# Modèle Gemini avec capacités vision
GEMINI_MODEL = "gemini-2.0-flash-exp"  # Vision + Fast

# Configuration du modèle
GENERATION_CONFIG = {
    "temperature": 0.2,  # Basse pour précision
    "max_output_tokens": 8192,
    "response_mime_type": "application/json"
}


def install_dependencies():
    """Installe les dépendances nécessaires"""
    import subprocess
    packages = [
        "pdf2image",
        "Pillow",
        "google-generativeai>=0.8.0",
    ]
    for pkg in packages:
        subprocess.run(["pip", "install", pkg, "-q"], capture_output=True)
    # Poppler pour pdf2image (Windows: télécharger manuellement)
    if os.name != 'nt':  # Linux/Mac
        subprocess.run(["apt-get", "update", "-qq"], capture_output=True)
        subprocess.run(["apt-get", "install", "-y", "-qq", "poppler-utils"], capture_output=True)


def pdf_to_images(pdf_path: str, output_dir: str = "pages", dpi: int = 200):
    """Convertit un PDF en images avec PyMuPDF (pas besoin de Poppler)"""
    import fitz  # PyMuPDF

    Path(output_dir).mkdir(exist_ok=True)
    print(f"📄 Conversion PDF → Images (DPI={dpi})...")

    doc = fitz.open(pdf_path)
    image_paths = []

    zoom = dpi / 72  # 72 is default PDF DPI
    matrix = fitz.Matrix(zoom, zoom)

    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=matrix)
        img_path = f"{output_dir}/page_{i:03d}.png"
        pix.save(img_path)
        image_paths.append(img_path)
        print(f"  ✓ Page {i}/{len(doc)}")

    doc.close()
    return image_paths


def image_to_base64(image_path: str) -> str:
    """Encode une image en base64"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def extract_dialogue_with_gemini(
    image_path: str,
    model: genai.GenerativeModel,
    page_num: int,
    is_dialogue: bool = True
) -> dict:
    """
    Extrait le contenu d'une page avec Gemini Vision.
    Détecte automatiquement la structure dialogue/texte.
    """

    # Charger l'image
    from PIL import Image
    img = Image.open(image_path)

    # Prompt adapté au type de contenu
    if is_dialogue:
        prompt = """Analyse cette page du livre "Al-Arabiya Bayna Yadayk" (L'arabe entre tes mains).

TÂCHE: Extraire le dialogue arabe avec traduction française ligne par ligne.

FORMAT JSON REQUIS:
{
  "type": "dialogue",
  "titleAr": "عنوان الحوار",
  "titleFr": "Titre du dialogue",
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

RÈGLES:
1. Garde les diacritiques arabes (tashkeel) si présents
2. Alterne les speakers (généralement 2 personnes)
3. Si pas de nom visible, utilise "المتحدث ١" et "المتحدث ٢"
4. Traduis naturellement en français (pas littéral)
5. Si tu vois un titre de dialogue (souvent en haut), l'extraire
6. Ignore les numéros de page et décorations

Retourne UNIQUEMENT le JSON valide, rien d'autre."""

    else:
        prompt = """Analyse cette page du livre "Al-Arabiya Bayna Yadayk" (L'arabe entre tes mains).

TÂCHE: Extraire le texte arabe avec traduction française.

FORMAT JSON REQUIS:
{
  "type": "texte",
  "titleAr": "عنوان النص",
  "titleFr": "Titre du texte",
  "lines": [
    {
      "speaker": "",
      "arabic": "النص العربي هنا",
      "french": "Le texte français ici"
    }
  ]
}

RÈGLES:
1. Garde les diacritiques arabes (tashkeel) si présents
2. speaker est vide "" pour les textes narratifs
3. Découpe en phrases/paragraphes logiques
4. Traduis naturellement en français
5. Extraire le titre si visible
6. Ignore numéros de page et décorations

Retourne UNIQUEMENT le JSON valide, rien d'autre."""

    try:
        response = model.generate_content(
            [prompt, img],
            generation_config=GENERATION_CONFIG
        )

        # Parser le JSON
        result = json.loads(response.text)
        result["page"] = page_num
        return result

    except json.JSONDecodeError as e:
        print(f"  ⚠️ Erreur parsing JSON page {page_num}: {e}")
        # Retourner structure vide
        return {
            "type": "dialogue" if is_dialogue else "texte",
            "page": page_num,
            "titleAr": "",
            "titleFr": "",
            "lines": [],
            "error": str(e),
            "raw_response": response.text if 'response' in dir() else ""
        }
    except Exception as e:
        print(f"  ❌ Erreur Gemini page {page_num}: {e}")
        return {
            "type": "dialogue" if is_dialogue else "texte",
            "page": page_num,
            "error": str(e),
            "lines": []
        }


def detect_content_type(
    image_path: str,
    model: genai.GenerativeModel
) -> str:
    """Détecte si la page contient un dialogue ou un texte"""
    from PIL import Image
    img = Image.open(image_path)

    prompt = """Regarde cette page de livre d'arabe.
Est-ce un DIALOGUE (conversation entre personnes avec noms/alternance) ou un TEXTE (narratif continu)?

Réponds uniquement: "dialogue" ou "texte"
"""

    try:
        response = model.generate_content([prompt, img])
        content_type = response.text.strip().lower()
        if "dialogue" in content_type:
            return "dialogue"
        return "texte"
    except:
        return "dialogue"  # Par défaut


def process_aby_pdf(
    pdf_path: str,
    book_id: str,
    output_path: Optional[str] = None,
    start_page: int = 1,
    end_page: Optional[int] = None,
    auto_detect_type: bool = True
):
    """
    Pipeline complet: PDF ABY → JSON structuré

    Args:
        pdf_path: Chemin vers le PDF
        book_id: ID du livre (aby1, aby2, aby3, aby4)
        output_path: Chemin de sortie JSON (optionnel)
        start_page: Page de début (1-indexed)
        end_page: Page de fin (incluse, None = toutes)
        auto_detect_type: Détecter automatiquement dialogue/texte
    """
    print("=" * 60)
    print("🚀 PIPELINE OCR ABY - Al-Arabiya Bayna Yadayk")
    print("=" * 60)
    print(f"📚 Livre: {book_id}")
    print(f"📄 PDF: {pdf_path}")
    print(f"🤖 Modèle: {GEMINI_MODEL}")
    print()

    # Configurer Gemini
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    # 1. Convertir PDF en images
    pages_dir = f"pages_{book_id}"
    image_paths = pdf_to_images(pdf_path, pages_dir)
    total_pages = len(image_paths)

    # Ajuster la plage de pages
    if end_page is None:
        end_page = total_pages
    end_page = min(end_page, total_pages)

    print(f"\n📖 Traitement pages {start_page} à {end_page} sur {total_pages}")

    # 2. Structure de sortie ABY
    result = {
        "bookId": book_id,
        "title": f"Al-Arabiya Bayna Yadayk - Tome {book_id[-1]}",
        "units": []
    }

    current_unit = {
        "id": 1,
        "titleAr": "الوحدة الأولى",
        "titleFr": "Unité 1",
        "lessons": []
    }

    # 3. Traiter chaque page
    for page_num in range(start_page, end_page + 1):
        idx = page_num - 1
        if idx >= len(image_paths):
            break

        img_path = image_paths[idx]
        print(f"\n📖 Page {page_num}/{end_page}")

        # Détecter le type si auto
        if auto_detect_type:
            print("  🔍 Détection type...")
            content_type = detect_content_type(img_path, model)
            print(f"  → Type: {content_type}")
            is_dialogue = (content_type == "dialogue")
        else:
            is_dialogue = True

        # Extraire le contenu
        print("  📝 Extraction OCR + Traduction...")
        page_data = extract_dialogue_with_gemini(
            img_path, model, page_num, is_dialogue
        )

        if page_data.get("lines"):
            lesson_id = f"{current_unit['id']}.{len(current_unit['lessons']) + 1}"
            lesson = {
                "id": lesson_id,
                "type": page_data.get("type", "dialogue"),
                "titleAr": page_data.get("titleAr", ""),
                "titleFr": page_data.get("titleFr", ""),
                "pdfPage": page_num,
                "lines": page_data["lines"]
            }
            current_unit["lessons"].append(lesson)
            print(f"  ✓ {len(page_data['lines'])} lignes extraites")
        else:
            print("  ⚠️ Aucune ligne extraite")

        # Pause pour éviter rate limiting
        time.sleep(1)

    # Ajouter l'unité au résultat
    if current_unit["lessons"]:
        result["units"].append(current_unit)

    # 4. Sauvegarder le JSON
    if output_path is None:
        output_path = f"{book_id}_extracted.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🎉 EXTRACTION TERMINÉE!")
    print(f"   Pages traitées: {end_page - start_page + 1}")
    print(f"   Leçons extraites: {len(current_unit['lessons'])}")
    print(f"   Fichier: {output_path}")
    print("=" * 60)

    return result


def process_single_image(
    image_path: str,
    is_dialogue: bool = True,
    output_path: Optional[str] = None
):
    """
    Traite une seule image (pour test rapide)
    """
    print(f"🖼️ Traitement image: {image_path}")

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    result = extract_dialogue_with_gemini(image_path, model, 1, is_dialogue)

    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"✅ Sauvegardé: {output_path}")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Pipeline OCR pour Al-Arabiya Bayna Yadayk",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  # Traiter un PDF complet
  python aby_ocr_pipeline.py pdf ABY-T1.pdf --book aby1

  # Traiter seulement les pages 10-20
  python aby_ocr_pipeline.py pdf ABY-T2.pdf --book aby2 --start 10 --end 20

  # Tester sur une seule image
  python aby_ocr_pipeline.py image page_001.png --dialogue

  # Tester sur une image (mode texte)
  python aby_ocr_pipeline.py image page_050.png --texte
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Commande")

    # Commande PDF
    pdf_parser = subparsers.add_parser("pdf", help="Traiter un PDF ABY")
    pdf_parser.add_argument("input", help="Chemin du PDF")
    pdf_parser.add_argument("--book", "-b", required=True,
                          choices=["aby1", "aby2", "aby3", "aby4"],
                          help="ID du livre")
    pdf_parser.add_argument("--output", "-o", help="Fichier JSON de sortie")
    pdf_parser.add_argument("--start", "-s", type=int, default=1,
                          help="Page de début (défaut: 1)")
    pdf_parser.add_argument("--end", "-e", type=int,
                          help="Page de fin (défaut: toutes)")
    pdf_parser.add_argument("--no-auto-detect", action="store_true",
                          help="Désactiver détection auto dialogue/texte")

    # Commande Image (test)
    img_parser = subparsers.add_parser("image", help="Tester sur une image")
    img_parser.add_argument("input", help="Chemin de l'image")
    img_parser.add_argument("--dialogue", "-d", action="store_true",
                          help="Forcer mode dialogue")
    img_parser.add_argument("--texte", "-t", action="store_true",
                          help="Forcer mode texte")
    img_parser.add_argument("--output", "-o", help="Fichier JSON de sortie")

    args = parser.parse_args()

    if args.command == "pdf":
        process_aby_pdf(
            pdf_path=args.input,
            book_id=args.book,
            output_path=args.output,
            start_page=args.start,
            end_page=args.end,
            auto_detect_type=not args.no_auto_detect
        )

    elif args.command == "image":
        is_dialogue = not args.texte if args.texte else True
        process_single_image(
            image_path=args.input,
            is_dialogue=is_dialogue,
            output_path=args.output
        )

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
