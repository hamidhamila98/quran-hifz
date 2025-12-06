#!/usr/bin/env python3
"""
ABY Tome 3 OCR Pipeline
- Gemini 2.0 Flash for Arabic OCR (vision)
- Gemini 2.0 Flash for translation to French
"""

import os
import re
import json
import base64
import requests
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

API_KEY = os.getenv('GOOGLE_API_KEY')
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

# Arabic numeral mapping
AR_NUMERALS = {'٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
               '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'}

def arabic_to_int(ar_num):
    """Convert Arabic numerals to integer"""
    result = ''
    for char in ar_num:
        result += AR_NUMERALS.get(char, char)
    return int(result) if result.isdigit() else 0


def ocr_image(image_path):
    """Extract Arabic text from image using Gemini Vision"""
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    payload = {
        "contents": [{
            "parts": [
                {"text": """Extrais TOUT le texte arabe de cette image.
Le texte contient des paragraphes numérotés avec des chiffres arabes (١، ٢، ٣...).
Retourne UNIQUEMENT le texte arabe tel qu'il apparaît, avec les numéros.
Ne traduis pas. Ne commente pas. Juste le texte arabe brut."""},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": image_data
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 8192
        }
    }

    response = requests.post(GEMINI_URL, json=payload)
    result = response.json()

    if 'candidates' in result:
        return result['candidates'][0]['content']['parts'][0]['text']

    if 'error' in result:
        print(f"    OCR Error: {result['error'].get('message', 'Unknown')}")
    return ''


def ocr_title_page(image_path):
    """Extract title from title page image"""
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    payload = {
        "contents": [{
            "parts": [
                {"text": """Cette image est une page de titre d'un livre arabe.
Extrais UNIQUEMENT le titre principal (pas "الوحدة الأولى" etc).
Le titre est généralement en gros au centre.
Retourne juste le titre arabe, rien d'autre."""},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": image_data
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 256
        }
    }

    response = requests.post(GEMINI_URL, json=payload)
    result = response.json()

    if 'candidates' in result:
        return result['candidates'][0]['content']['parts'][0]['text'].strip()
    return ''


def translate_with_gemini(arabic_text):
    """Translate Arabic text to French using Gemini"""
    if not arabic_text.strip():
        return ''

    prompt = f"""Traduis ce texte arabe en français.
Garde le sens exact et le style académique/religieux.
Les références coraniques [sourate:verset] doivent rester entre crochets.
Retourne UNIQUEMENT la traduction française, rien d'autre.

Texte arabe:
{arabic_text}"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096
        }
    }

    response = requests.post(GEMINI_URL, json=payload)
    result = response.json()

    if 'candidates' in result:
        return result['candidates'][0]['content']['parts'][0]['text'].strip()

    if 'error' in result:
        print(f"    Translation Error: {result['error'].get('message', 'Unknown')}")
    return ''


def parse_paragraphs(raw_text):
    """Parse text into numbered paragraphs"""
    paragraphs = []

    # Clean up any introductory text from Gemini
    lines = raw_text.split('\n')

    # Skip any non-Arabic introductory lines
    start_idx = 0
    for i, line in enumerate(lines):
        if re.search(r'[١٢٣٤٥٦٧٨٩٠]-', line) or re.search(r'[\u0600-\u06FF]{10,}', line):
            start_idx = i
            break

    lines = lines[start_idx:]
    current_paragraph = {'num': 0, 'ar': '', 'is_header': False}

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for numbered paragraph start (e.g., "١-" or "٢-")
        num_match = re.match(r'^([١٢٣٤٥٦٧٨٩٠]+)\s*[-–:]\s*(.*)$', line)

        if num_match:
            # Save previous paragraph if exists
            if current_paragraph['ar']:
                paragraphs.append(current_paragraph.copy())

            num = arabic_to_int(num_match.group(1))
            text = num_match.group(2)
            current_paragraph = {'num': num, 'ar': text, 'is_header': False}
        else:
            # Continue current paragraph
            if current_paragraph['ar']:
                current_paragraph['ar'] += ' ' + line
            else:
                # Could be a header/title
                current_paragraph['ar'] = line
                current_paragraph['is_header'] = len(line) < 60 and ':' in line

    # Don't forget last paragraph
    if current_paragraph['ar']:
        paragraphs.append(current_paragraph)

    return paragraphs


def process_unit(unit_num, image_paths, output_dir):
    """Process a complete unit (title + text pages)"""
    print(f"\n{'='*50}")
    print(f"Processing Unit {unit_num}")
    print('='*50)

    unit_data = {
        'id': unit_num,
        'titleAr': '',
        'titleFr': '',
        'items': []
    }

    all_text = ''

    # Sort images: titre first, then texte pages in order
    sorted_images = sorted(image_paths, key=lambda p: (0 if 'titre' in p.name else 1, p.name))

    for img_path in sorted_images:
        print(f"  OCR: {img_path.name}...")
        time.sleep(0.5)  # Rate limiting

        if 'titre' in img_path.name:
            unit_data['titleAr'] = ocr_title_page(img_path)
            print(f"    Title: {unit_data['titleAr']}")
        else:
            text = ocr_image(img_path)
            all_text += '\n' + text

    # Translate title
    if unit_data['titleAr']:
        print(f"  Translating title...")
        time.sleep(0.5)
        unit_data['titleFr'] = translate_with_gemini(unit_data['titleAr'])
        print(f"    → {unit_data['titleFr']}")

    # Parse paragraphs
    print(f"  Parsing paragraphs...")
    paragraphs = parse_paragraphs(all_text)
    print(f"    Found {len(paragraphs)} paragraphs")

    # Create single item with all paragraphs as lines
    item = {
        'id': f"{unit_num}.1",
        'type': 'text',
        'titleAr': unit_data['titleAr'],
        'titleFr': unit_data['titleFr'],
        'lines': []
    }

    for i, para in enumerate(paragraphs):
        print(f"  Translating paragraph {i+1}/{len(paragraphs)}...")
        time.sleep(0.5)  # Rate limiting
        fr_text = translate_with_gemini(para['ar'])

        item['lines'].append({
            'num': para['num'],
            'ar': para['ar'].strip(),
            'fr': fr_text,
            'isHeader': para.get('is_header', False)
        })

    unit_data['items'].append(item)

    # Save intermediate result
    output_file = output_dir / f"unit_{unit_num}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unit_data, f, ensure_ascii=False, indent=2)

    print(f"  Saved: {output_file}")
    return unit_data


def build_book_json(units, output_path):
    """Build complete book JSON in universal format"""
    book = {
        "meta": {
            "id": "aby-t3",
            "title": "Al-Arabiya Bayna Yadayk - Tome 3",
            "structure": {
                "sectionLabel": {"ar": "الوحدة", "fr": "Unité"},
                "itemLabels": {
                    "text": {"ar": "نص", "fr": "Texte"}
                }
            },
            "resources": {
                "pdf": "/arabic/pdf/ABY-T3.pdf"
            }
        },
        "sections": units
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(book, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Book JSON saved: {output_path}")


def main():
    ocr_dir = Path(__file__).parent.parent / 'ABY OCR'
    output_dir = Path(__file__).parent / 'output'
    output_dir.mkdir(exist_ok=True)

    # Group images by unit
    units_images = {}
    for img in sorted(ocr_dir.glob('*.png')):
        # Parse filename: u1-titre.png, u1-texte-p1.png
        match = re.match(r'u(\d+)-(.+)\.png', img.name)
        if match:
            unit_num = int(match.group(1))
            if unit_num not in units_images:
                units_images[unit_num] = []
            units_images[unit_num].append(img)

    print(f"Found {len(units_images)} units to process")

    # Process each unit
    all_units = []
    for unit_num in sorted(units_images.keys()):
        images = sorted(units_images[unit_num])
        unit_data = process_unit(unit_num, images, output_dir)
        all_units.append(unit_data)

    # Build complete book JSON
    if all_units:
        book_path = Path(__file__).parent.parent / 'public' / 'arabic' / 'books' / 'aby-t3.json'
        build_book_json(all_units, book_path)


if __name__ == "__main__":
    main()
