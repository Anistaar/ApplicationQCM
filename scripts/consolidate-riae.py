# Script de consolidation RIAE
import sys
import os
from pathlib import Path

RIAE_DIR = Path("src/questions/S1/RIAE")
OUTPUT_FILE = RIAE_DIR / "RIAE_MEGA_COMPLET.txt"

FILE_TAGS = {
    "riae_chap0_intro.txt": ["Chapitre0", "Introduction"],
    "riae_chap1_bases_micro.txt": ["Chapitre1", "Micro", "Bases"],
    "riae_chap2_offre_demande.txt": ["Chapitre2", "OffreDemande", "Marches"],
    "riae_chap3_interventions_publiques.txt": ["Chapitre3", "InterventionPublique", "PolitiqueEconomique"],
    "riae_chap4_echecs_marche.txt": ["Chapitre4", "EchecsMarche", "Externalites"],
    "riae_chap5_introduction_macro.txt": ["Chapitre5", "Macro", "Introduction"],
    "riae_hpe_qcm_part0_methodo.txt": ["HPE", "Methodologie"],
    "riae_hpe_qcm_part1.txt": ["HPE", "Part1"],
    "riae_hpe_qcm_part2.txt": ["HPE", "Part2"],
    "stats_chap1_fiche_hpe_l1_2.txt": ["HPE", "Stats"],
}

def detect_difficulty(question_text):
    text_lower = question_text.lower()
    if any(kw in text_lower for kw in ["définition", "qu'est-ce", "citez"]):
        return "Facile"
    elif any(kw in text_lower for kw in ["expliquez", "comparez"]):
        return "Moyen"
    elif any(kw in text_lower for kw in ["analysez", "démontrez"]):
        return "Difficile"
    return "Moyen"

def parse_question(line, file_tags):
    if not line or not "||" in line:
        return None
    
    q_type = "QR"
    if line.startswith("QCM ||"):
        q_type, line = "QCM", line[7:]
    elif line.startswith("QR ||"):
        q_type, line = "QR", line[6:]
    elif line.startswith("VF ||"):
        q_type, line = "VF", line[6:]
    elif line.startswith("||"):
        line = line[2:].strip()
    
    parts = [p.strip() for p in line.split("||")]
    if len(parts) < 2:
        return None
    
    difficulty = detect_difficulty(parts[0])
    tags = list(set(file_tags + [difficulty]))
    tags_str = ", ".join(tags)
    
    if len(parts) == 2:
        return f"{q_type} || {parts[0]} || {parts[1]} || || {tags_str}"
    elif len(parts) == 3:
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {tags_str}"
    elif len(parts) >= 4:
        existing = [t.strip() for t in parts[3].split(",") if t.strip()]
        all_tags = list(set(tags + existing))
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {', '.join(all_tags)}"
    
    return None

def consolidate_file(filepath, file_tags):
    print(f"📄 {filepath.name}")
    lines = []
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                lines = f.readlines()
            if encoding != 'utf-8':
                print(f"   ⚠️  Encodage: {encoding}")
            break
        except:
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
    print("🌍 CONSOLIDATION RIAE - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    header = """# RIAE - FICHIER MEGA COMPLET
# Relations Internationales et Analyse Économique S1
# Total: ~93 questions
# Format: text2quiz avec tags exhaustifs

"""
    
    all_questions = []
    for filename, tags in FILE_TAGS.items():
        filepath = RIAE_DIR / filename
        if not filepath.exists():
            print(f"⏭️  {filename} - Skip")
            continue
        questions = consolidate_file(filepath, tags)
        all_questions.extend(questions)
    
    print()
    print(f"✅ TOTAL: {len(all_questions)} questions consolidées")
    print()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(header)
        for q in all_questions:
            f.write(q + "\n\n")
    
    print(f"✅ Fichier créé: {OUTPUT_FILE}")
    print("🎉 Consolidation terminée!")

if __name__ == "__main__":
    main()
