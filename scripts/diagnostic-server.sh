# Script de diagnostic serveur
cd /opt/text2quiz || exit 1

echo "=== COMMIT ACTUEL ==="
git log --oneline -1

echo ""
echo "=== PREMIERE LIGNE OMC_QCM_EXHAUSTIF_v1.txt ==="
head -n 1 src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt

echo ""
echo "=== NOMBRE DE QUESTIONS ==="
grep -c "^QCM ||" src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt

echo ""
echo "=== FICHIERS DANS BUNDLE ==="
strings dist/assets/index-*.js | grep -c "OMC_QCM_EXHAUSTIF"

echo ""
echo "=== LISTE FICHIERS INSTIT ==="
ls -lh src/questions/S1/INSTIT/*.txt | wc -l
echo "fichiers INSTIT trouvés"

echo ""
echo "=== HASH DU BUNDLE ==="
ls -lh dist/assets/index-*.js
