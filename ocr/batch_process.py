#!/usr/bin/env python3
"""
Traitement par lot de plusieurs livres PDF
==========================================
Usage: python batch_process.py dossier_pdfs/ dossier_sortie/
"""

import os
import sys
from pathlib import Path
from arabic_ocr_translate import process_book, install_dependencies, API_KEY

def batch_process(input_dir, output_dir):
    """Traite tous les PDFs d'un dossier"""
    
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Trouver tous les PDFs
    pdf_files = list(input_path.glob("*.pdf")) + list(input_path.glob("*.PDF"))
    
    if not pdf_files:
        print(f"❌ Aucun PDF trouvé dans {input_dir}")
        return
    
    print(f"📚 {len(pdf_files)} livre(s) à traiter")
    print("=" * 60)
    
    results_summary = []
    
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"\n{'='*60}")
        print(f"📖 LIVRE {i}/{len(pdf_files)}: {pdf_path.name}")
        print("=" * 60)
        
        try:
            output_prefix = str(output_path / pdf_path.stem)
            results, json_path, excel_path = process_book(
                str(pdf_path), 
                API_KEY, 
                output_prefix
            )
            
            results_summary.append({
                "file": pdf_path.name,
                "status": "✅ OK",
                "pages": len(results)
            })
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            results_summary.append({
                "file": pdf_path.name,
                "status": f"❌ Erreur: {str(e)[:50]}",
                "pages": 0
            })
    
    # Résumé final
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ FINAL")
    print("=" * 60)
    
    for item in results_summary:
        print(f"  {item['status']} {item['file']} ({item['pages']} pages)")
    
    success = sum(1 for r in results_summary if "OK" in r["status"])
    print(f"\n✅ Réussi: {success}/{len(pdf_files)}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("""
Usage: python batch_process.py <dossier_pdfs> <dossier_sortie>

Exemple:
    python batch_process.py ./mes_livres ./traductions
    
Cela traitera tous les fichiers .pdf dans 'mes_livres'
et sauvegardera les résultats dans 'traductions'
        """)
        sys.exit(1)
    
    print("📦 Installation des dépendances...")
    install_dependencies()
    
    batch_process(sys.argv[1], sys.argv[2])
