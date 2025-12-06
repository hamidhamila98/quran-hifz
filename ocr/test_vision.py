#!/usr/bin/env python3
"""Test Google Vision API"""

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
print(f"Exists: {image_path.exists()}")

with open(image_path, 'rb') as f:
    image_content = base64.b64encode(f.read()).decode('utf-8')

print(f"Image size: {len(image_content)} bytes")

url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
payload = {
    "requests": [{
        "image": {"content": image_content},
        "features": [{"type": "TEXT_DETECTION"}],
        "imageContext": {"languageHints": ["ar"]}
    }]
}

print("Calling Vision API...")
response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")

result = response.json()
print(f"Response keys: {result.keys()}")

if 'error' in result:
    print(f"ERROR: {result['error']}")
elif 'responses' in result:
    resp = result['responses'][0]
    if 'error' in resp:
        print(f"Response ERROR: {resp['error']}")
    elif 'textAnnotations' in resp:
        text = resp['textAnnotations'][0]['description']
        print(f"\n{'='*50}")
        print("EXTRACTED TEXT:")
        print('='*50)
        print(text[:2000])
    else:
        print(f"No textAnnotations. Keys: {resp.keys()}")
else:
    print(f"Full response: {result}")
