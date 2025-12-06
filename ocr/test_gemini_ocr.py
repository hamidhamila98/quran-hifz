#!/usr/bin/env python3
"""Test Gemini Vision OCR"""

import base64
import requests
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent / '.env')
API_KEY = os.getenv('GOOGLE_API_KEY')

print(f"API Key: {API_KEY[:20]}...")

image_path = Path(__file__).parent.parent / 'ABY OCR' / 'u1-texte-p1.png'
print(f"Image: {image_path}")

with open(image_path, 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [
            {"text": """Extrais tout le texte arabe de cette image.
Le texte contient des paragraphes numérotés avec des chiffres arabes (١، ٢، ٣...).
Retourne le texte EXACT tel qu'il apparaît, avec les numéros de paragraphe.
Ne traduis pas, garde l'arabe original."""},
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
        "maxOutputTokens": 4096
    }
}

print("Calling Gemini Vision API...")
response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")

result = response.json()

if 'error' in result:
    print(f"ERROR: {result['error']}")
elif 'candidates' in result:
    text = result['candidates'][0]['content']['parts'][0]['text']
    print(f"\n{'='*50}")
    print("EXTRACTED TEXT:")
    print('='*50)
    print(text)
else:
    print(f"Response: {result}")
