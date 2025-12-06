#!/usr/bin/env python3
"""
Process ABY T2 - Partie 2 et merge avec Partie 1
Unités 9-16 (suite du Tome 2)
"""

import json
import time
import fitz
from pathlib import Path
import google.generativeai as genai

API_KEY = "AIzaSyAcFwrCFv4e2Zr79S_y-d640EBNhqGGq5k"
GEMINI_MODEL = "gemini-2.0-flash-exp"

GENERATION_CONFIG = {
    "temperature": 0.2,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json"
}

# Structure ABY T2 Partie 2 (unités 9-16)
# Skip pages 1-2
# Unit 9: title p3, content p4-7
# Unit 10: title p8, content p9-12
# etc.

BOOK_STRUCTURE = [
    {"unit": 9, "title_page": 3, "content_pages": [4, 5, 6, 7]},
    {"unit": 10, "title_page": 8, "content_pages": [9, 10, 11, 12]},
    {"unit": 11, "title_page": 13, "content_pages": [14, 15, 16, 17]},
    {"unit": 12, "title_page": 18, "content_pages": [19, 20, 21, 22]},
    {"unit": 13, "title_page": 23, "content_pages": [24, 25, 26, 27]},
    {"unit": 14, "title_page": 28, "content_pages": [29, 30, 31, 32]},
    {"unit": 15, "title_page": 33, "content_pages": [34, 35, 36, 37]},
    {"unit": 16, "title_page": 38, "content_pages": [39, 40, 41, 42]},
]


def pdf_to_images(pdf_path: str, output_dir: str, dpi: int = 200):
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
    from PIL import Image
    img = Image.open(image_path)

    prompt = """Cette page contient le titre d'une unité du livre "Al-Arabiya Bayna Yadayk".

Extraire UNIQUEMENT le titre de l'unité.

FORMAT JSON:
{
  "titleAr": "الوحدة التاسعة: العنوان",
  "titleFr": "Unité 9: Le titre"
}

Retourne UNIQUEMENT le JSON."""

    try:
        response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
        return json.loads(response.text)
    except:
        return {"titleAr": "", "titleFr": ""}


def extract_content(image_path: str, model) -> dict:
    from PIL import Image
    img = Image.open(image_path)

    detect_prompt = """Cette page contient-elle un DIALOGUE (conversation avec noms de personnes) ou un TEXTE (paragraphes narratifs)?
Réponds uniquement: "dialogue" ou "texte"
"""

    try:
        detect_response = model.generate_content([detect_prompt, img])
        content_type = "dialogue" if "dialogue" in detect_response.text.lower() else "texte"
    except:
        content_type = "dialogue"

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

Garde les diacritiques arabes. Retourne UNIQUEMENT le JSON."""
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

Garde les diacritiques arabes. Retourne UNIQUEMENT le JSON."""

    try:
        response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
        result = json.loads(response.text)
        result["type"] = content_type
        return result
    except Exception as e:
        print(f"    ⚠️ Erreur: {e}")
        return {"type": content_type, "titleAr": "", "titleFr": "", "lines": []}


def process_part2():
    print("=" * 60)
    print("🚀 PROCESSING ABY T2 - Partie 2 (Unités 9-16)")
    print("=" * 60)

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    pdf_path = "ABY T2 - Partie 2.pdf"
    image_paths = pdf_to_images(pdf_path, "pages_aby2_p2")

    units = []

    for unit_info in BOOK_STRUCTURE:
        unit_num = unit_info["unit"]
        title_page = unit_info["title_page"]
        content_pages = unit_info["content_pages"]

        if title_page > len(image_paths):
            print(f"\n⚠️ Page {title_page} n'existe pas, arrêt.")
            break

        print(f"\n{'='*50}")
        print(f"📚 UNITÉ {unit_num}")
        print(f"{'='*50}")

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

        for i, page_num in enumerate(content_pages, 1):
            if page_num > len(image_paths):
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
            time.sleep(1)

        units.append(unit)

    return units


def merge_with_part1():
    # Charger Part 1
    with open("ABY-T2-P1_complete.json", "r", encoding="utf-8") as f:
        part1 = json.load(f)

    # Process Part 2
    part2_units = process_part2()

    # Merge
    part1["title"] = "Al-Arabiya Bayna Yadayk - Tome 2"
    part1["units"].extend(part2_units)

    # Sauvegarder
    output_path = "ABY-T2_complete.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(part1, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🎉 MERGE TERMINÉ!")
    print(f"   Unités totales: {len(part1['units'])}")
    total_lessons = sum(len(u['lessons']) for u in part1['units'])
    print(f"   Leçons totales: {total_lessons}")
    print(f"   Fichier: {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    merge_with_part1()
