# Script de consolidation DROIT
import sys
import os
from pathlib import Path

DROIT_DIR = Path("src/questions/S1/DROIT")
OUTPUT_FILE = DROIT_DIR / "DROIT_MEGA_COMPLET.txt"

FILE_TAGS = {
    "Introduction_Droit_Prive_DragMatch_v1.txt": ["DroitPrive", "Introduction", "DragMatch"],
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
    elif line.startswith("DragMatch ||"):
        q_type, line = "DragMatch", line[13:]
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
    print("⚖️ CONSOLIDATION DROIT - CRÉATION DU MEGA FICHIER")
    print("=" * 60)
    print()
    
    header = """# DROIT - FICHIER MEGA COMPLET
# Droit Privé S1
# Total: ~80 questions
# Format: text2quiz avec tags exhaustifs

"""
    
    all_questions = []
    for filename, tags in FILE_TAGS.items():
        filepath = DROIT_DIR / filename
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
