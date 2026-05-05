# Script de consolidation ANALYSE_ECO
import sys
import os
from pathlib import Path

ANALYSE_DIR = Path("src/questions/S1/ANALYSE_ECO")
OUTPUT_FILE = ANALYSE_DIR / "ANALYSE_ECO_MEGA_COMPLET.txt"

FILE_TAGS = {
    "analyse_eco_formules_facile.txt": ["Formules", "Facile"],
    "analyse_eco_formules_moyen.txt": ["Formules", "Moyen"],
    "analyse_eco_formules_difficile.txt": ["Formules", "Difficile"],
    "analyse_eco_formules_openq.txt": ["Formules", "OpenQ"],
    "analyse_eco_formules_dragmatch_noms.txt": ["Formules", "DragMatch", "Noms"],
    "analyse_eco_formules_dragmatch_reconstruction.txt": ["Formules", "DragMatch", "Reconstruction"],
    "analyse_eco_formules_builder.txt": ["Formules", "Builder"],
    
    "analyse_eco_MA1_qcm.txt": ["MA1", "Partiel", "QCM"],
    "analyse_eco_MA2_qcm.txt": ["MA2", "Partiel", "QCM"],
    "analyse_eco_MI1_qcm.txt": ["MI1", "Partiel", "QCM"],
    "analyse_eco_MI2_qcm.txt": ["MI2", "Partiel", "QCM"],
    "analyse_eco_MI3_qcm.txt": ["MI3", "Partiel", "QCM"],
    "analyse_eco_MI4_qcm.txt": ["MI4", "Partiel", "QCM"],
    
    "iae_1_macro_comptabilite_nationale.txt": ["IAE", "Macro", "ComptaNationale"],
    "iae_2_macro_croissance_et_fluctuations.txt": ["IAE", "Macro", "Croissance"],
    "iae_micro_1_les_bases_du_raisonnement_economique_1.txt": ["IAE", "Micro", "Bases"],
    "iae_micro_2_les_postulats_de_base_du_raisonnement_economique_1.txt": ["IAE", "Micro", "Postulats"],
    "iae_micro_3_les_interdependances_et_les_echanges_1.txt": ["IAE", "Micro", "Interdependances"],
}

def detect_difficulty(question_text):
    text_lower = question_text.lower()
    if any(kw in text_lower for kw in ["définition", "qu'est-ce", "citez", "calculez"]):
        return "Facile"
    elif any(kw in text_lower for kw in ["expliquez", "comparez", "dérivez"]):
        return "Moyen"
    elif any(kw in text_lower for kw in ["analysez", "démontrez", "optimisez"]):
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
    elif line.startswith("DragMatch ||"):
        q_type, line = "DragMatch", line[13:]
        if "DragMatch" not in file_tags:
            file_tags = file_tags + ["DragMatch"]
    elif line.startswith("OpenQ ||"):
        q_type, line = "OpenQ", line[9:]
        if "OpenQ" not in file_tags:
            file_tags = file_tags + ["OpenQ"]
    elif line.startswith("||"):
        line = line[2:].strip()
    
    parts = [p.strip() for p in line.split("||")]
    if len(parts) < 2:
        return None
    
    # Ne pas ajouter difficulté si déjà dans file_tags
    if not any(d in file_tags for d in ["Facile", "Moyen", "Difficile", "Expert"]):
        difficulty = detect_difficulty(parts[0])
        tags = list(set(file_tags + [difficulty]))
    else:
        tags = list(set(file_tags))
    
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
    print("📈 CONSOLIDATION ANALYSE_ECO - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    header = """# ANALYSE_ECO - FICHIER MEGA COMPLET
# Analyse Économique S1
# Total: ~362 questions
# Format: text2quiz avec tags exhaustifs

"""
    
    all_questions = []
    for filename, tags in FILE_TAGS.items():
        filepath = ANALYSE_DIR / filename
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
