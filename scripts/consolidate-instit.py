# Script de consolidation des questions INSTIT
# Lit tous les fichiers INSTIT et les consolide avec tags

import sys
import os
from pathlib import Path

INSTIT_DIR = Path("src/questions/S1/INSTIT")
OUTPUT_FILE = INSTIT_DIR / "INSTIT_MEGA_COMPLET.txt"

# Mapping fichier -> tags
FILE_TAGS = {
    "OMC_QCM_EXHAUSTIF_v1.txt": ["OMC", "Commerce", "International"],
    "FMI_QCM_EXHAUSTIF_v1.txt": ["FMI", "Monnaie", "International"],
    "BM_QCM_EXHAUSTIF_v1.txt": ["BanqueMondiale", "Developpement", "International"],
    
    "TRAIN_OMC_FMI_BM_v1.txt": ["OMC", "FMI", "BanqueMondiale", "Institutions"],
    "TRAIN_Definitions_Gouvernance_v1.txt": ["Gouvernance", "Definitions"],
    "TRAIN_CoutsTransaction_v1.txt": ["CoutsTransaction", "Coase", "Theories"],
    "TRAIN_DroitsPropriete_Communs_v1.txt": ["DroitsPropriete", "BiensCommuns", "Ostrom", "Hardin"],
    "TRAIN_Asymetrie_Signaux_v1.txt": ["AsymetrieInformation", "Signalisation", "Theories"],
    "TRAIN_Comptabilite_IFRS_v1.txt": ["Comptabilite", "IFRS", "Normes"],
    "TRAIN_Pieges_Comparatifs_v1.txt": ["Pieges", "Comparatifs", "Methodologie"],
    "TRAIN_Stats_IPC_v1.txt": ["IPC", "Statistiques", "Indicateurs"],
    
    "INSTIT_Examen_2023.txt": ["Examen2023", "Partiel"],
    "INSTIT_Examen_2024.txt": ["Examen2024", "Partiel"],
    
    "INSTIT_ALL.txt": ["Institutionnel", "General"],
    "BANQUE_QUESTIONS_SUPPLEMENTAIRES_v1.txt": ["Supplementaires", "Banque"],
    "INSTIT_MEGA_v1.txt": ["MegaV1"]  # Ancien, à intégrer
}

def detect_difficulty(question_text):
    """Détecte la difficulté"""
    text_lower = question_text.lower()
    
    if any(kw in text_lower for kw in ["définition", "qu'est-ce", "citez", "nommez"]):
        return "Facile"
    elif any(kw in text_lower for kw in ["expliquez", "comparez", "fonction", "pourquoi"]):
        return "Moyen"
    elif any(kw in text_lower for kw in ["analysez", "démontrez", "justifiez"]):
        return "Difficile"
    elif any(kw in text_lower for kw in ["critique", "évaluez", "discutez"]):
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
    
    # Construire les tags
    tags = list(set(file_tags + [difficulty]))
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
    print("🏛️ CONSOLIDATION INSTIT - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    # Header du fichier
    header = """# INSTIT - FICHIER MEGA COMPLET
# Institutions économiques S1 - Consolidation complète
# Total: ~670 questions
# Créé le: 2025-11-28
# Format: text2quiz avec tags exhaustifs

# ================================================================
# INSTITUTIONS INTERNATIONALES
# ================================================================

"""
    
    all_questions = []
    
    for filename, tags in FILE_TAGS.items():
        filepath = INSTIT_DIR / filename
        
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
