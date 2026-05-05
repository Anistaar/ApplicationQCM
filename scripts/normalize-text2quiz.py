# Script de normalisation text2quiz
# Détecte et ajoute automatiquement les types manquants (QR, QCM, etc.)
# Permet aussi de merger/splitter des fichiers

import sys
import re
from pathlib import Path

def detect_question_type(parts):
    """Détecte le type de question selon le contenu"""
    if len(parts) < 2:
        return None
    
    answers = parts[1].strip()
    
    # Si contient des | ou V: ou ;vrai/;faux → QCM
    if '|' in answers or ';vrai' in answers.lower() or ';faux' in answers.lower():
        return 'QCM'
    
    # Si contient des paires item:match → DragMatch
    if ':' in answers and len(answers.split(':')) >= 2:
        lines = answers.split('\n')
        if any(':' in line for line in lines):
            return 'DragMatch'
    
    # Si contient V: ou "vrai" → QCM
    if answers.startswith('V:') or answers.lower().startswith('vrai'):
        return 'QCM'
    
    # Par défaut → QR (question-réponse)
    return 'QR'

def normalize_line(line):
    """Normalise une ligne de question en ajoutant le type si manquant"""
    line = line.strip()
    
    # Ignorer les lignes vides, commentaires, headers
    if not line or line.startswith('#') or line.startswith('@') or line.startswith('chapter:'):
        return line
    
    # Si ne contient pas ||, ignorer
    if '||' not in line:
        return line
    
    # Si commence déjà par un type connu, ne rien faire
    known_types = ['QCM ||', 'QR ||', 'VF ||', 'DragMatch ||', 'OpenQ ||', 'FormulaBuilder ||']
    if any(line.startswith(t) for t in known_types):
        return line
    
    # Si commence par ||, détecter le type
    if line.startswith('||'):
        line = line[2:].strip()
    
    # Parser les colonnes
    parts = [p.strip() for p in line.split('||')]
    
    if len(parts) < 2:
        return line
    
    # Détecter le type
    q_type = detect_question_type(parts)
    
    if q_type:
        # Reconstruire avec le type
        return f"{q_type} || {' || '.join(parts)}"
    
    return line

def normalize_file(input_path, output_path=None):
    """Normalise un fichier text2quiz"""
    input_path = Path(input_path)
    
    if not input_path.exists():
        print(f"❌ Fichier introuvable: {input_path}")
        return False
    
    # Lire avec détection encodage
    content = None
    for encoding in ['utf-8', 'latin-1', 'cp1252']:
        try:
            with open(input_path, 'r', encoding=encoding) as f:
                content = f.readlines()
            if encoding != 'utf-8':
                print(f"   ⚠️  Encodage détecté: {encoding}")
            break
        except:
            continue
    
    if content is None:
        print(f"❌ Erreur de lecture: {input_path}")
        return False
    
    # Normaliser ligne par ligne
    normalized = []
    questions_fixed = 0
    
    for line in content:
        original = line.rstrip('\n')
        normalized_line = normalize_line(original)
        
        if normalized_line != original and '||' in original:
            questions_fixed += 1
        
        normalized.append(normalized_line)
    
    # Écrire le résultat
    if output_path is None:
        output_path = input_path
    else:
        output_path = Path(output_path)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for line in normalized:
            f.write(line + '\n')
    
    print(f"✅ {input_path.name}: {questions_fixed} questions normalisées")
    return True

def merge_files(file_paths, output_path, add_separators=True):
    """Merge plusieurs fichiers en un seul"""
    output_path = Path(output_path)
    
    print(f"🔗 Fusion de {len(file_paths)} fichiers vers {output_path.name}")
    
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("# FICHIER FUSIONNÉ\n")
        out.write(f"# Créé le: {__import__('datetime').date.today()}\n")
        out.write(f"# Sources: {len(file_paths)} fichiers\n\n")
        
        for i, file_path in enumerate(file_paths):
            file_path = Path(file_path)
            
            if not file_path.exists():
                print(f"   ⏭️  Skip: {file_path.name}")
                continue
            
            if add_separators:
                out.write(f"\n# {'='*60}\n")
                out.write(f"# SOURCE: {file_path.name}\n")
                out.write(f"# {'='*60}\n\n")
            
            # Lire et normaliser
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        for line in f:
                            normalized = normalize_line(line.rstrip('\n'))
                            out.write(normalized + '\n')
                    break
                except:
                    continue
            
            print(f"   ✅ {file_path.name}")
    
    print(f"✅ Fusion terminée: {output_path}")

def split_by_theme(input_path, output_dir):
    """Split un fichier par thème dans le header"""
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    print(f"✂️  Split de {input_path.name} par thème")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_theme = "general"
    current_buffer = []
    theme_files = {}
    
    for line in lines:
        line = line.rstrip('\n')
        
        # Détection de section thématique
        if line.startswith('@themes:'):
            # Sauver le buffer précédent
            if current_buffer:
                if current_theme not in theme_files:
                    theme_files[current_theme] = []
                theme_files[current_theme].extend(current_buffer)
            
            # Nouveau thème
            themes = line.replace('@themes:', '').strip()
            current_theme = themes.split(',')[0].strip()
            current_buffer = [line]
        
        elif line.startswith('# CHAPITRE') or line.startswith('# ==='):
            # Sauver buffer
            if current_buffer:
                if current_theme not in theme_files:
                    theme_files[current_theme] = []
                theme_files[current_theme].extend(current_buffer)
            
            # Extraire nom du chapitre
            match = re.search(r'CHAPITRE\s+(\d+)', line)
            if match:
                current_theme = f"chapitre{match.group(1)}"
            
            current_buffer = [line]
        else:
            current_buffer.append(line)
    
    # Sauver le dernier buffer
    if current_buffer and current_theme:
        if current_theme not in theme_files:
            theme_files[current_theme] = []
        theme_files[current_theme].extend(current_buffer)
    
    # Écrire les fichiers
    for theme, content in theme_files.items():
        safe_theme = re.sub(r'[^\w\-]', '_', theme.lower())
        output_file = output_dir / f"{input_path.stem}_{safe_theme}.txt"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))
        
        print(f"   ✅ {output_file.name} ({len([l for l in content if '||' in l])} questions)")
    
    print(f"✅ Split terminé: {len(theme_files)} fichiers créés")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Normalisation et gestion de fichiers text2quiz')
    subparsers = parser.add_subparsers(dest='command', help='Commandes disponibles')
    
    # Normalize
    normalize_parser = subparsers.add_parser('normalize', help='Normaliser un ou plusieurs fichiers')
    normalize_parser.add_argument('files', nargs='+', help='Fichiers à normaliser')
    normalize_parser.add_argument('-o', '--output', help='Fichier de sortie (optionnel)')
    
    # Merge
    merge_parser = subparsers.add_parser('merge', help='Fusionner plusieurs fichiers')
    merge_parser.add_argument('files', nargs='+', help='Fichiers à fusionner')
    merge_parser.add_argument('-o', '--output', required=True, help='Fichier de sortie')
    merge_parser.add_argument('--no-separators', action='store_true', help='Sans séparateurs')
    
    # Split
    split_parser = subparsers.add_parser('split', help='Découper par thème')
    split_parser.add_argument('file', help='Fichier à découper')
    split_parser.add_argument('-o', '--output-dir', required=True, help='Dossier de sortie')
    
    args = parser.parse_args()
    
    if args.command == 'normalize':
        for file in args.files:
            normalize_file(file, args.output if args.output and len(args.files) == 1 else None)
    
    elif args.command == 'merge':
        merge_files(args.files, args.output, not args.no_separators)
    
    elif args.command == 'split':
        split_by_theme(args.file, args.output_dir)
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
