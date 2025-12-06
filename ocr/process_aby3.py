#!/usr/bin/env python3
"""
Process ABY T3 - Structure différente
- Pages 1-2: skip
- Page 3: Unit 1 title
- Pages 4-5: textes avec paragraphes numérotés (١، ٢، ٣)
- Page 6: Unit 2 title
- Pages 7-8: textes
- etc.

Structure: 1 titre + 2 textes par unité
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


def get_book_structure(total_pages: int, start_unit: int = 1):
    """
    Génère la structure du livre ABY T3
    Pattern: skip p1-2, puis [titre, texte, texte] répété
    """
    structure = []
    unit_num = start_unit
    page = 3  # Commence à la page 3

    while page <= total_pages:
        title_page = page
        content_pages = []

        # 2 pages de contenu après le titre
        for i in range(1, 3):
            if page + i <= total_pages:
                content_pages.append(page + i)

        if content_pages:
            structure.append({
                "unit": unit_num,
                "title_page": title_page,
                "content_pages": content_pages
            })

        unit_num += 1
        page += 3  # titre + 2 textes = 3 pages par unité

    return structure


def pdf_to_images(pdf_path: str, output_dir: str, dpi: int = 200):
    Path(output_dir).mkdir(exist_ok=True)
    print(f"📄 Conversion PDF → Images...")

    doc = fitz.open(pdf_path)
    image_paths = {}

    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    total_pages = len(doc)
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(matrix=matrix)
        img_path = f"{output_dir}/page_{i:03d}.png"
        pix.save(img_path)
        image_paths[i] = img_path
        print(f"  ✓ Page {i}/{total_pages}", end="\r")

    print(f"\n✅ {total_pages} pages converties")
    doc.close()
    return image_paths, total_pages


def extract_unit_title(image_path: str, model) -> dict:
    from PIL import Image
    img = Image.open(image_path)

    prompt = """Cette page contient le titre d'une unité du livre "Al-Arabiya Bayna Yadayk" Tome 3.

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


def extract_text_with_paragraphs(image_path: str, model) -> dict:
    """Extrait le texte avec séparation par paragraphes numérotés"""
    from PIL import Image
    img = Image.open(image_path)

    prompt = """Cette page contient un TEXTE du livre "Al-Arabiya Bayna Yadayk" Tome 3.
Le texte peut être divisé en paragraphes numérotés (١، ٢، ٣) ou non.

Extraire le texte avec traduction, en séparant chaque paragraphe.

FORMAT JSON:
{
  "type": "texte",
  "titleAr": "عنوان النص",
  "titleFr": "Titre du texte",
  "lines": [
    {"speaker": "", "arabic": "١- النص العربي للفقرة الأولى", "french": "1- Le texte français du premier paragraphe"},
    {"speaker": "", "arabic": "٢- النص العربي للفقرة الثانية", "french": "2- Le texte français du deuxième paragraphe"}
  ]
}

RÈGLES:
- Garde les diacritiques arabes (tashkeel)
- speaker est toujours vide ""
- Sépare par paragraphe (si numérotés ١، ٢، ٣ ou par retour à la ligne)
- Garde les numéros arabes dans le texte
- Traduction naturelle en français

Retourne UNIQUEMENT le JSON."""

    try:
        response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
        result = json.loads(response.text)
        result["type"] = "texte"
        return result
    except Exception as e:
        print(f"    ⚠️ Erreur: {e}")
        return {"type": "texte", "titleAr": "", "titleFr": "", "lines": []}


def process_part(pdf_path: str, output_dir: str, start_unit: int = 1):
    """Traite une partie du tome 3"""
    print(f"📄 Traitement: {pdf_path}")

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    image_paths, total_pages = pdf_to_images(pdf_path, output_dir)
    structure = get_book_structure(total_pages, start_unit)

    print(f"📚 Structure détectée: {len(structure)} unités")

    units = []

    for unit_info in structure:
        unit_num = unit_info["unit"]
        title_page = unit_info["title_page"]
        content_pages = unit_info["content_pages"]

        if title_page > total_pages:
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
            if page_num > total_pages:
                continue

            print(f"  📝 Page {page_num} (texte {i})...", end=" ")
            content = extract_text_with_paragraphs(image_paths[page_num], model)

            lesson = {
                "id": f"{unit_num}.{i}",
                "type": "texte",
                "titleAr": content.get("titleAr", ""),
                "titleFr": content.get("titleFr", ""),
                "pdfPage": page_num,
                "youtubeUrl": "",
                "lines": content.get("lines", [])
            }

            unit["lessons"].append(lesson)
            print(f"✓ {len(content.get('lines', []))} paragraphes")
            time.sleep(1)

        units.append(unit)

    return units


def process_aby3_complete():
    """Traite les deux parties de ABY T3"""
    print("=" * 60)
    print("🚀 PROCESSING ABY T3 COMPLET")
    print("=" * 60)

    # Partie 1
    print("\n" + "=" * 60)
    print("📗 PARTIE 1")
    print("=" * 60)
    units_p1 = process_part("ABY T3 - Partie 1.pdf", "pages_aby3_p1", start_unit=1)

    # Calculer l'unité de départ pour partie 2
    next_unit = units_p1[-1]["id"] + 1 if units_p1 else 1

    # Partie 2
    print("\n" + "=" * 60)
    print("📘 PARTIE 2")
    print("=" * 60)
    units_p2 = process_part("ABY T3 - Partie 2.pdf", "pages_aby3_p2", start_unit=next_unit)

    # Merge
    result = {
        "bookId": "aby3",
        "title": "Al-Arabiya Bayna Yadayk - Tome 3",
        "units": units_p1 + units_p2
    }

    # Sauvegarder
    output_path = "ABY-T3_complete.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🎉 ABY T3 TERMINÉ!")
    print(f"   Unités totales: {len(result['units'])}")
    total_lessons = sum(len(u['lessons']) for u in result['units'])
    print(f"   Leçons totales: {total_lessons}")
    print(f"   Fichier: {output_path}")
    print("=" * 60)

    return result


if __name__ == "__main__":
    process_aby3_complete()
