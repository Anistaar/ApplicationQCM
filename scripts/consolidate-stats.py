# Script de consolidation des questions STATS
# Lit tous les fichiers STATS et les consolide avec tags

import sys
import os
from pathlib import Path

STATS_DIR = Path("src/questions/S1/STATS")
OUTPUT_FILE = STATS_DIR / "STATS_MEGA_COMPLET.txt"

# Mapping fichier -> tags
FILE_TAGS = {
    # Chapitre 1
    "stats_chap1_chapitre_1_2.txt": ["Chapitre1", "Stats1"],
    "stats_chap1_banque_facile.txt": ["Chapitre1", "Facile", "Banque"],
    "stats_chap1_banque_moyen.txt": ["Chapitre1", "Moyen", "Banque"],
    "stats_chap1_banque_difficile.txt": ["Chapitre1", "Difficile", "Banque"],
    "stats_partiel_chap1_qcm.txt": ["Chapitre1", "Partiel", "QCM"],
    
    # Chapitre 2
    "stats_chap2_chapitre_2_1.txt": ["Chapitre2", "Stats2"],
    "stats_chap2_banque_facile.txt": ["Chapitre2", "Facile", "Banque"],
    "stats_chap2_banque_moyen.txt": ["Chapitre2", "Moyen", "Banque"],
    "stats_chap2_banque_difficile.txt": ["Chapitre2", "Difficile", "Banque"],
    "stats_partiel_chap2_qcm.txt": ["Chapitre2", "Partiel", "QCM"],
    
    # Chapitre 3
    "stats_chap3_chapitre_3_1.txt": ["Chapitre3", "Stats3"],
    "stats_chap3_banque_facile.txt": ["Chapitre3", "Facile", "Banque"],
    "stats_chap3_banque_moyen.txt": ["Chapitre3", "Moyen", "Banque"],
    "stats_chap3_banque_difficile.txt": ["Chapitre3", "Difficile", "Banque"],
    "stats_partiel_chap3_qcm.txt": ["Chapitre3", "Partiel", "QCM"],
    
    # Chapitre 4
    "stats_chap4_statistiques_descriptives_chap4_2023_2024.txt": ["Chapitre4", "Stats4", "Partiel2024"],
    "stats_chap4_banque_facile.txt": ["Chapitre4", "Facile", "Banque"],
    "stats_chap4_banque_moyen.txt": ["Chapitre4", "Moyen", "Banque"],
    "stats_chap4_banque_difficile.txt": ["Chapitre4", "Difficile", "Banque"],
}

def detect_difficulty(question_text):
    """Détecte la difficulté"""
    text_lower = question_text.lower()
    
    if any(kw in text_lower for kw in ["définition", "qu'est-ce", "citez", "nommez", "calculez"]):
        return "Facile"
    elif any(kw in text_lower for kw in ["expliquez", "comparez", "interprétez"]):
        return "Moyen"
    elif any(kw in text_lower for kw in ["analysez", "démontrez", "variance", "écart-type"]):
        return "Difficile"
    elif any(kw in text_lower for kw in ["régression", "corrélation", "probabilité conditionnelle"]):
        return "Expert"
    
    return "Moyen"

def parse_question(line, file_tags):
    """Parse une question et ajoute les tags"""
    if not line or not "||" in line:
        return None
    
    # Détecter le type
    q_type = "QR"
    if line.startswith("QCM ||"):
        q_type = "QCM"
        line = line[7:]
    elif line.startswith("QR ||"):
        q_type = "QR"
        line = line[6:]
    elif line.startswith("VF ||"):
        q_type = "VF"
        line = line[6:]
    elif line.startswith("DragMatch ||"):
        q_type = "DragMatch"
        file_tags = file_tags + ["DragMatch"]
        line = line[13:]
    elif line.startswith("OpenQ ||"):
        q_type = "OpenQ"
        file_tags = file_tags + ["OpenQ"]
        line = line[9:]
    elif line.startswith("||"):
        line = line[2:].strip()
    
    # Séparer les colonnes
    parts = [p.strip() for p in line.split("||")]
    
    if len(parts) < 2:
        return None
    
    question_text = parts[0]
    difficulty = detect_difficulty(question_text)
    
    # Construire les tags (ne pas ajouter difficulté si déjà dans file_tags)
    if not any(d in file_tags for d in ["Facile", "Moyen", "Difficile", "Expert"]):
        tags = list(set(file_tags + [difficulty]))
    else:
        tags = list(set(file_tags))
    
    tags_str = ", ".join(tags)
    
    # Reconstruire
    if len(parts) == 2:
        return f"{q_type} || {parts[0]} || {parts[1]} || || {tags_str}"
    elif len(parts) == 3:
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {tags_str}"
    elif len(parts) >= 4:
        existing_tags = [t.strip() for t in parts[3].split(",") if t.strip()]
        all_tags = list(set(tags + existing_tags))
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {', '.join(all_tags)}"
    
    return None

def consolidate_file(filepath, file_tags):
    """Consolide un fichier"""
    print(f"📄 {filepath.name}")
    
    # Essayer UTF-8, puis latin-1, puis cp1252
    lines = []
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                lines = f.readlines()
            if encoding != 'utf-8':
                print(f"   ⚠️  Encodage: {encoding}")
            break
        except Exception:
            continue
    
    if not lines:
        print(f"   ❌ Erreur d'encodage")
        return []
    
    questions = []
    
    for line in lines:
        line = line.strip()
        
        if not line or line.startswith("#") or line.startswith("chapter:"):
            continue
        
        if "||" in line:
            parsed = parse_question(line, file_tags)
            if parsed:
                questions.append(parsed)
    
    print(f"   ✅ {len(questions)} questions")
    return questions

def main():
    print("=" * 60)
    print("📊 CONSOLIDATION STATS - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    # Header du fichier
    header = """# STATS - FICHIER MEGA COMPLET
# Statistiques descriptives S1 - Consolidation complète
# Total: ~562 questions
# Créé le: 2025-11-28
# Format: text2quiz avec tags exhaustifs

# ================================================================
# STATISTIQUES DESCRIPTIVES
# ================================================================

"""
    
    all_questions = []
    
    for filename, tags in FILE_TAGS.items():
        filepath = STATS_DIR / filename
        
        if not filepath.exists():
            print(f"⏭️  {filename} - Skip")
            continue
        
        questions = consolidate_file(filepath, tags)
        all_questions.extend(questions)
    
    print()
    print("=" * 60)
    print(f"✅ TOTAL: {len(all_questions)} questions consolidées")
    print("=" * 60)
    print()
    
    # Écriture
    print("💾 Écriture du fichier...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(header)
        for q in all_questions:
            f.write(q + "\n\n")
    
    print(f"✅ Fichier créé: {OUTPUT_FILE}")
    print("🎉 Consolidation terminée!")

if __name__ == "__main__":
    main()
