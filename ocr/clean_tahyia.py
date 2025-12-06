#!/usr/bin/env python3
"""
Clean tahyia (تَهيئة) sections from ABY JSON files.
These are warm-up/preparation questions before the main text.
"""

import json
import re
from pathlib import Path

def clean_tahyia_from_item(item):
    """Remove tahyia section from an item's lines"""
    if not item.get('lines'):
        return item

    lines = item['lines']
    cleaned_lines = []
    in_tahyia = False

    for i, line in enumerate(lines):
        ar_text = line.get('ar', '')

        # Check if this is the start of tahyia section
        if 'تَهيئة' in ar_text or 'تهيئة' in ar_text:
            in_tahyia = True
            continue

        # Check if we're in tahyia (numbered questions like ١- ٢- ٣-)
        if in_tahyia:
            # Check if line starts with Arabic number + hyphen (question format)
            if re.match(r'^[١٢٣٤٥٦٧٨٩٠]+-', ar_text.strip()):
                continue
            # Check for "فكر في" pattern (think about...)
            if 'فكر في' in ar_text:
                continue
            # If it's a substantial text without question markers, we're out of tahyia
            if len(ar_text.strip()) > 20 and not ar_text.strip().endswith('؟'):
                in_tahyia = False

        if not in_tahyia:
            cleaned_lines.append(line)

    item['lines'] = cleaned_lines
    return item

def clean_book(input_path, output_path=None):
    """Clean tahyia from all items in a book"""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_removed = 0

    for section in data.get('sections', []):
        for item in section.get('items', []):
            original_count = len(item.get('lines', []))
            item = clean_tahyia_from_item(item)
            new_count = len(item.get('lines', []))
            removed = original_count - new_count
            if removed > 0:
                print(f"  Section {section['id']}, Item {item['id']}: removed {removed} lines")
                total_removed += removed

    if output_path is None:
        output_path = input_path

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  Total lines removed: {total_removed}")
    return data

if __name__ == "__main__":
    base_path = Path(__file__).parent.parent / "public" / "arabic" / "books"

    print("🧹 Cleaning tahyia sections from ABY books...\n")

    for book_file in ['aby-t2.json', 'aby-t3.json']:
        path = base_path / book_file
        if path.exists():
            print(f"📖 Processing {book_file}...")
            clean_book(path)
            print()

    print("✅ Cleaning complete!")
