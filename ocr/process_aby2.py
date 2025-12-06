#!/usr/bin/env python3
"""
Process ABY T2 - Partie 1 avec structure spécifique
"""

import json
import time
import fitz  # PyMuPDF
from pathlib import Path
import google.generativeai as genai

API_KEY = "AIzaSyAcFwrCFv4e2Zr79S_y-d640EBNhqGGq5k"
GEMINI_MODEL = "gemini-2.0-flash-exp"

GENERATION_CONFIG = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json"
}

# Structure du livre ABY T2 Partie 1
# Skip pages 1-2
# Unit 1: title p3, content p4-7
# Unit 2: title p8, content p9-12
# Unit 3: title p13, content p14-17
# etc.

BOOK_STRUCTURE = [
    {"unit": 1, "title_page": 3, "content_pages": [4, 5, 6, 7]},
    {"unit": 2, "title_page": 8, "content_pages": [9, 10, 11, 12]},
    {"unit": 3, "title_page": 13, "content_pages": [14, 15, 16, 17]},
    {"unit": 4, "title_page": 18, "content_pages": [19, 20, 21, 22]},
    {"unit": 5, "title_page": 23, "content_pages": [24, 25, 26, 27]},
    {"unit": 6, "title_page": 28, "content_pages": [29, 30, 31, 32]},
    {"unit": 7, "title_page": 33, "content_pages": [34, 35, 36, 37]},
    {"unit": 8, "title_page": 38, "content_pages": [39, 40, 41, 42]},
]


def pdf_to_images(pdf_path: str, output_dir: str = "pages_aby2_full", dpi: int = 200):
    """Convertit PDF en images"""
    Path(output_dir).mkdir(exist_ok=True)
    print(f"📄 Conversion PDF → Images...")

    doc = fitz.open(pdf_path)
    image_paths = {}

    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=matrix)
        img_path = f"{output_dir}/page_{i:03d}.png"
        pix.save(img_path)
        image_paths[i] = img_path
        print(f"  ✓ Page {i}/{len(doc)}", end="\r")

    print(f"\n✅ {len(doc)} pages converties")
    doc.close()
    return image_paths


def extract_unit_title(image_path: str, model) -> dict:
    """Extrait le titre d'une unité"""
    from PIL import Image
    img = Image.open(image_path)

    prompt = """Cette page contient le titre d'une unité du livre "Al-Arabiya Bayna Yadayk".

Extraire UNIQUEMENT le titre de l'unité.

FORMAT JSON:
{
  "titleAr": "الوحدة الأولى: العنوان",
  "titleFr": "Unité 1: Le titre"
}

Retourne UNIQUEMENT le JSON."""

    try:
        response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
        return json.loads(response.text)
    except:
        return {"titleAr": "", "titleFr": ""}


def extract_content(image_path: str, model) -> dict:
    """Extrait dialogue ou texte"""
    from PIL import Image
    img = Image.open(image_path)

    # D'abord détecter le type
    detect_prompt = """Cette page contient-elle un DIALOGUE (conversation avec noms de personnes qui parlent) ou un TEXTE (paragraphes narratifs sans interlocuteurs)?

Réponds uniquement: "dialogue" ou "texte"
"""

    try:
        detect_response = model.generate_content([detect_prompt, img])
        content_type = "dialogue" if "dialogue" in detect_response.text.lower() else "texte"
    except:
        content_type = "dialogue"

    # Extraire selon le type
    if content_type == "dialogue":
        prompt = """Extraire le DIALOGUE de cette page.

FORMAT JSON:
{
  "type": "dialogue",
  "titleAr": "عنوان الحوار",
  "titleFr": "Titre du dialogue",
  "lines": [
    {"speaker": "اسم", "arabic": "النص العربي", "french": "Traduction française"}
  ]
}

RÈGLES:
- Garde les diacritiques arabes (tashkeel)
- Identifie les speakers (noms des personnes)
- Traduction naturelle en français

Retourne UNIQUEMENT le JSON."""
    else:
        prompt = """Extraire le TEXTE de cette page.

FORMAT JSON:
{
  "type": "texte",
  "titleAr": "عنوان النص",
  "titleFr": "Titre du texte",
  "lines": [
    {"speaker": "", "arabic": "النص العربي", "french": "Traduction française"}
  ]
}

RÈGLES:
- Garde les diacritiques arabes (tashkeel)
- speaker est vide "" pour les textes
- Découpe en paragraphes logiques
- Traduction naturelle en français

Retourne UNIQUEMENT le JSON."""

    try:
        response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
        result = json.loads(response.text)
        result["type"] = content_type
        return result
    except Exception as e:
        print(f"    ⚠️ Erreur: {e}")
        return {"type": content_type, "titleAr": "", "titleFr": "", "lines": []}


def process_book():
    """Traite tout le livre"""
    print("=" * 60)
    print("🚀 PROCESSING ABY T2 - Partie 1")
    print("=" * 60)

    # Configurer Gemini
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    # Convertir PDF
    pdf_path = "ABY T2 - Partie 1.pdf"
    image_paths = pdf_to_images(pdf_path)

    # Structure de sortie
    result = {
        "bookId": "aby2",
        "title": "Al-Arabiya Bayna Yadayk - Tome 2 (Partie 1)",
        "units": []
    }

    # Traiter chaque unité
    for unit_info in BOOK_STRUCTURE:
        unit_num = unit_info["unit"]
        title_page = unit_info["title_page"]
        content_pages = unit_info["content_pages"]

        # Vérifier que les pages existent
        if title_page > len(image_paths):
            print(f"\n⚠️ Page {title_page} n'existe pas, arrêt.")
            break

        print(f"\n{'='*50}")
        print(f"📚 UNITÉ {unit_num}")
        print(f"{'='*50}")

        # Extraire titre de l'unité
        print(f"  📖 Page {title_page} (titre)...")
        title_data = extract_unit_title(image_paths[title_page], model)
        time.sleep(1)

        unit = {
            "id": unit_num,
            "titleAr": title_data.get("titleAr", f"الوحدة {unit_num}"),
            "titleFr": title_data.get("titleFr", f"Unité {unit_num}"),
            "lessons": []
        }

        print(f"  → {unit['titleAr']}")
        print(f"  → {unit['titleFr']}")

        # Extraire chaque page de contenu
        for i, page_num in enumerate(content_pages, 1):
            if page_num > len(image_paths):
                print(f"  ⚠️ Page {page_num} n'existe pas, skip.")
                continue

            print(f"  📝 Page {page_num} (leçon {i})...", end=" ")

            content = extract_content(image_paths[page_num], model)

            lesson = {
                "id": f"{unit_num}.{i}",
                "type": content.get("type", "dialogue"),
                "titleAr": content.get("titleAr", ""),
                "titleFr": content.get("titleFr", ""),
                "pdfPage": page_num,
                "youtubeUrl": "",
                "lines": content.get("lines", [])
            }

            unit["lessons"].append(lesson)
            print(f"✓ {content.get('type', '?')} - {len(content.get('lines', []))} lignes")

            time.sleep(1)  # Rate limiting

        result["units"].append(unit)

    # Sauvegarder
    output_path = "ABY-T2-P1_complete.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🎉 TERMINÉ!")
    print(f"   Unités: {len(result['units'])}")
    total_lessons = sum(len(u['lessons']) for u in result['units'])
    print(f"   Leçons: {total_lessons}")
    print(f"   Fichier: {output_path}")
    print("=" * 60)

    return result


if __name__ == "__main__":
    process_book()
