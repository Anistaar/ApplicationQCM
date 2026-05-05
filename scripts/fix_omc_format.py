# Script pour reformater OMC_QCM_EXHAUSTIF_v1.txt au bon format
import re

# Lire le fichier
with open("src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Supprimer les headers markdown
content = re.sub(r'## PARTIE \d+:.*?\n\n', '', content)

# Supprimer "Explication: " des lignes d'explication
content = re.sub(r'\|\| Explication: ', '|| ', content)

# Supprimer la dernière ligne de tags si elle existe déjà en fin
lines = content.strip().split('\n')
if lines[-1].strip().startswith('||') and 'OMC' in lines[-1] and 'QCM' in lines[-1]:
    lines = lines[:-1]

# Supprimer les lignes vides
lines = [line for line in lines if line.strip()]

# Ajouter la ligne de tags au début
final_content = "|| OMC, Exhaustif, Institutions, QCM\n" + '\n'.join(lines)

# Écrire le fichier
with open("src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt", "w", encoding="utf-8") as f:
    f.write(final_content)

# Compter les questions
num_questions = final_content.count('QCM ||')
print(f"✓ Fichier reformaté avec succès")
print(f"✓ Nombre de questions : {num_questions}")
print(f"✓ Lignes totales : {len(final_content.split(chr(10)))}")
