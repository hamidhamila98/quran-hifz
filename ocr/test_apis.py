#!/usr/bin/env python3
"""
Test des APIs Google (Vision + Gemini)
"""

import requests
import base64

API_KEY = "AIzaSyAcFwrCFv4e2Zr79S_y-d640EBNhqGGq5k"

def test_gemini():
    """Test Gemini API"""
    print("🧪 Test Gemini API...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Traduis en français: مرحبا"}]
        }]
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if "error" in result:
        print(f"❌ Gemini ERROR: {result['error']}")
        return False
    
    try:
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        print(f"✅ Gemini OK! Réponse: {text}")
        return True
    except:
        print(f"❌ Réponse inattendue: {result}")
        return False


def test_vision():
    """Test Google Cloud Vision API"""
    print("\n🧪 Test Vision API...")
    
    # Créer une petite image de test (1x1 pixel blanc)
    # En pratique on utiliserait une vraie image
    test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
    
    payload = {
        "requests": [{
            "image": {"content": test_image_b64},
            "features": [{"type": "TEXT_DETECTION"}]
        }]
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if "error" in result:
        print(f"❌ Vision ERROR: {result['error']}")
        print("\n💡 Pour activer Vision API:")
        print("   1. Va sur https://console.cloud.google.com")
        print("   2. Cherche 'Cloud Vision API'")
        print("   3. Clique 'Activer'")
        return False
    
    if "responses" in result:
        print("✅ Vision API OK!")
        return True
    
    print(f"❌ Réponse inattendue: {result}")
    return False


def list_gemini_models():
    """Liste les modèles Gemini disponibles"""
    print("\n📋 Modèles Gemini disponibles:")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    response = requests.get(url)
    result = response.json()
    
    if "models" in result:
        for model in result["models"]:
            name = model.get("name", "").replace("models/", "")
            if "gemini" in name.lower():
                print(f"  - {name}")
    else:
        print(f"  Erreur: {result}")


if __name__ == "__main__":
    print("=" * 50)
    print("TEST DES APIs GOOGLE")
    print("=" * 50)
    
    gemini_ok = test_gemini()
    vision_ok = test_vision()
    
    list_gemini_models()
    
    print("\n" + "=" * 50)
    print("RÉSUMÉ:")
    print(f"  Gemini: {'✅ OK' if gemini_ok else '❌ ERREUR'}")
    print(f"  Vision: {'✅ OK' if vision_ok else '❌ ERREUR'}")
    print("=" * 50)
    
    if not vision_ok:
        print("\n⚠️  Vision API n'est pas activée!")
        print("Tu dois l'activer dans Google Cloud Console.")
