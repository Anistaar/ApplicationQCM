# Script de consolidation des questions MACRO
# Lit tous les fichiers MACRO et les ajoute au fichier MEGA avec tags automatiques

import sys
import os
import re
from pathlib import Path

# Chemin vers les questions MACRO
MACRO_DIR = Path("src/questions/S1/MACRO")
OUTPUT_FILE = MACRO_DIR / "MACRO_MEGA_COMPLET.txt"

# Mapping fichier -> tags
FILE_TAGS = {
    "macro_chap0_intro.txt": ["Chapitre0", "Introduction"],
    "Intro_v2.txt": ["Chapitre0", "Introduction"],
    
    "macro_chap1_consommation.txt": ["Chapitre1", "Consommation"],
    "Consommation_v2.txt": ["Chapitre1", "Consommation"],
    "macro_chap1_openq_v1.txt": ["Chapitre1", "Consommation", "OpenQ"],
    
    "macro_chap2_investissement.txt": ["Chapitre2", "Investissement"],
    "Investissement_v2.txt": ["Chapitre2", "Investissement"],
    
    "macro_chap3_modele_classique_reel.txt": ["Chapitre3", "ModeleClassique"],
    "macro_chap3_theorie_quantitative_monnaie.txt": ["Chapitre3", "TheorieQuantitative", "Monnaie"],
    "ModeleClassique_v2.txt": ["Chapitre3", "ModeleClassique"],
    
    "macro_chap4_modele_keynesien.txt": ["Chapitre4", "Keynesien", "ISLM"],
    
    "DragMatch_v1.txt": ["DragMatch", "Appariements"],
    "BANQUE_QUESTIONS_MACRO_v1.txt": ["BanqueQuestions", "Supplementaires"],
    "macro_unclassified.txt": ["NonClassifie"]
}

# Détection automatique de difficulté dans le texte
DIFFICULTY_KEYWORDS = {
    "Facile": ["simple", "basique", "définition", "qu'est-ce que"],
    "Moyen": ["expliquez", "comparez", "analysez", "fonction"],
    "Difficile": ["démontrez", "prouvez", "dérivez", "calculez"],
    "Expert": ["critique", "paradoxe", "sophist", "avancé"]
}

def detect_difficulty(question_text):
    """Détecte la difficulté probable d'une question"""
    text_lower = question_text.lower()
    
    for diff, keywords in DIFFICULTY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return diff
    
    # Par défaut
    return "Moyen"

def clean_question_line(line):
    """Nettoie une ligne de question"""
    line = line.strip()
    
    # Retirer les préfixes chapter:
    if line.startswith("chapter:"):
        return None
    
    return line

def parse_question(lines, file_tags):
    """Parse une question text2quiz et ajoute les tags"""
    if not lines or not lines[0]:
        return None
    
    line = lines[0]
    
    # Détecter le type de question
    q_type = None
    if line.startswith("QCM ||"):
        q_type = "QCM"
    elif line.startswith("QR ||"):
        q_type = "QR"
    elif line.startswith("VF ||"):
        q_type = "VF"
    elif line.startswith("DragMatch ||"):
        q_type = "DragMatch"
        file_tags.append("DragMatch")
    elif line.startswith("OpenQ ||"):
        q_type = "OpenQ"
        file_tags.append("OpenQ")
    elif line.startswith("||"):
        q_type = "QR"  # Par défaut
    else:
        return None
    
    # Séparer les colonnes
    parts = line.split("||")
    parts = [p.strip() for p in parts]
    
    # Extraire la question
    if parts[0] in ["QCM", "QR", "VF", "DragMatch", "OpenQ"]:
        parts = parts[1:]  # Retirer le préfixe
    
    if len(parts) < 2:
        return None
    
    question_text = parts[0] if len(parts) > 0 else ""
    
    # Détecter difficulté
    difficulty = detect_difficulty(question_text)
    
    # Construire les tags
    tags = list(set(file_tags + [difficulty]))
    tags_str = ", ".join(tags)
    
    # Reconstruire la ligne avec tags
    # Format: TYPE || Question || Réponses || Explication || Tags
    if len(parts) == 2:
        # Pas d'explication
        return f"{q_type} || {parts[0]} || {parts[1]} || || {tags_str}"
    elif len(parts) == 3:
        # Avec explication
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {tags_str}"
    elif len(parts) >= 4:
        # Déjà des tags ? Les fusionner
        existing_tags = parts[3].split(",") if len(parts) > 3 else []
        existing_tags = [t.strip() for t in existing_tags if t.strip()]
        all_tags = list(set(tags + existing_tags))
        return f"{q_type} || {parts[0]} || {parts[1]} || {parts[2]} || {', '.join(all_tags)}"
    
    return line

def consolidate_file(filepath, file_tags):
    """Consolide un fichier de questions"""
    print(f"📄 Traitement: {filepath.name}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"   ❌ Erreur lecture: {e}")
        return []
    
    questions = []
    current_question = []
    
    for line in lines:
        line = line.rstrip()
        
        # Ignorer les lignes vides et commentaires
        if not line or line.startswith("#"):
            continue
        
        # Ignorer les lignes chapter:
        if line.startswith("chapter:"):
            continue
        
        # Ligne de question
        if line.startswith("||") or line.startswith("QCM ||") or line.startswith("QR ||") or \
           line.startswith("VF ||") or line.startswith("DragMatch ||") or line.startswith("OpenQ ||"):
            
            if current_question:
                parsed = parse_question(current_question, file_tags)
                if parsed:
                    questions.append(parsed)
            
            current_question = [line]
        elif current_question:
            # Suite de la question (réponses multiples pour QCM)
            current_question.append(line)
    
    # Dernière question
    if current_question:
        parsed = parse_question(current_question, file_tags)
        if parsed:
            questions.append(parsed)
    
    print(f"   ✅ {len(questions)} questions extraites")
    return questions

def main():
    print("=" * 60)
    print("🔧 CONSOLIDATION MACRO - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    all_questions = []
    
    # Lire le fichier de base déjà créé
    print("📖 Lecture du fichier de base...")
    with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
        base_content = f.read()
    
    # Traiter chaque fichier
    for filename, tags in FILE_TAGS.items():
        filepath = MACRO_DIR / filename
        
        if not filepath.exists():
            print(f"⏭️  {filename} - Non trouvé, skip")
            continue
        
        questions = consolidate_file(filepath, tags)
        all_questions.extend(questions)
    
    print()
    print("=" * 60)
    print(f"✅ TOTAL: {len(all_questions)} questions consolidées")
    print("=" * 60)
    print()
    
    # Ajouter au fichier de base
    print("💾 Écriture du fichier final...")
    
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
        f.write("\n\n")
        f.write("# " + "=" * 60 + "\n")
        f.write("# QUESTIONS CONSOLIDÉES DEPUIS LES FICHIERS EXISTANTS\n")
        f.write("# " + "=" * 60 + "\n\n")
        
        for q in all_questions:
            f.write(q + "\n\n")
    
    print(f"✅ Fichier créé: {OUTPUT_FILE}")
    print(f"📊 Total estimé: ~{len(all_questions) + 100} questions")
    print()
    print("🎉 Consolidation terminée!")

if __name__ == "__main__":
    main()
