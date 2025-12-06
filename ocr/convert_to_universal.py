#!/usr/bin/env python3
"""
Convert existing ABY JSON files to universal format
"""

import json
from pathlib import Path

def convert_aby_t1(input_path, output_path):
    """Convert ABY T1 format (dialogues with arabic/french keys)"""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    result = {
        "meta": {
            "id": "aby-t1",
            "title": "Al-Arabiya Bayna Yadayk - Tome 1",
            "structure": {
                "sectionLabel": {"ar": "الوحدة", "fr": "Unité"},
                "itemLabels": {
                    "dialogue": {"ar": "حوار", "fr": "Dialogue"},
                    "text": {"ar": "نص", "fr": "Texte"}
                }
            },
            "resources": {
                "pdf": "/arabic/pdf/ABY-T1.pdf",
                "vocabulary": "/arabic/pdf/ABY-T1-VOC.pdf"
            }
        },
        "sections": []
    }

    for unit in data.get('units', []):
        section = {
            "id": unit['id'],
            "titleAr": unit.get('titleAr', ''),
            "titleFr": unit.get('titleFr', ''),
            "items": []
        }

        # ABY T1 uses 'dialogues' key
        dialogues = unit.get('dialogues', [])
        for idx, dialogue in enumerate(dialogues):
            item = {
                "id": f"{unit['id']}.{idx + 1}",
                "type": "dialogue",
                "titleAr": dialogue.get('titleAr', ''),
                "titleFr": dialogue.get('titleFr', ''),
                "youtube": dialogue.get('youtubeUrl', ''),
                "pdfPage": dialogue.get('pdfPage'),
                "lines": []
            }

            for line in dialogue.get('lines', []):
                item['lines'].append({
                    "speaker": line.get('speaker', ''),
                    "ar": line.get('arabic', ''),
                    "fr": line.get('french', '')
                })

            section['items'].append(item)

        result['sections'].append(section)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ Converted ABY T1 → {output_path}")

def convert_aby_t2_t3(input_path, output_path, book_id, title):
    """Convert ABY T2/T3 format (lessons with type field)"""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    tome_num = book_id[-1]
    result = {
        "meta": {
            "id": book_id,
            "title": title,
            "structure": {
                "sectionLabel": {"ar": "الوحدة", "fr": "Unité"},
                "itemLabels": {
                    "dialogue": {"ar": "حوار", "fr": "Dialogue"},
                    "text": {"ar": "نص", "fr": "Texte"}
                }
            },
            "resources": {
                "pdf": f"/arabic/pdf/ABY-T{tome_num}.pdf",
                "vocabulary": f"/arabic/pdf/ABY-T{tome_num}-VOC.pdf"
            }
        },
        "sections": []
    }

    for unit in data.get('units', []):
        section = {
            "id": unit['id'],
            "titleAr": unit.get('titleAr', ''),
            "titleFr": unit.get('titleFr', ''),
            "items": []
        }

        # ABY T2/T3 uses 'lessons' key
        lessons = unit.get('lessons', [])
        for idx, lesson in enumerate(lessons):
            item = {
                "id": f"{unit['id']}.{idx + 1}",
                "type": lesson.get('type', 'dialogue'),  # 'dialogue' or 'texte'
                "titleAr": lesson.get('titleAr', ''),
                "titleFr": lesson.get('titleFr', ''),
                "youtube": lesson.get('youtubeUrl', ''),
                "pdfPage": lesson.get('pdfPage'),
                "lines": []
            }

            for line in lesson.get('lines', []):
                item['lines'].append({
                    "speaker": line.get('speaker', ''),
                    "ar": line.get('arabic', ''),
                    "fr": line.get('french', '')
                })

            section['items'].append(item)

        result['sections'].append(section)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ Converted {book_id.upper()} → {output_path}")

if __name__ == "__main__":
    base_path = Path(__file__).parent.parent / "public" / "arabic"
    books_path = base_path / "books"
    books_path.mkdir(exist_ok=True)

    # Convert ABY T1
    convert_aby_t1(
        base_path / "ABY-T1.json",
        books_path / "aby-t1.json"
    )

    # Convert ABY T2
    convert_aby_t2_t3(
        base_path / "ABY-T2.json",
        books_path / "aby-t2.json",
        "aby-t2",
        "Al-Arabiya Bayna Yadayk - Tome 2"
    )

    # Convert ABY T3
    convert_aby_t2_t3(
        base_path / "ABY-T3.json",
        books_path / "aby-t3.json",
        "aby-t3",
        "Al-Arabiya Bayna Yadayk - Tome 3"
    )

    print("\n🎉 All conversions complete!")
