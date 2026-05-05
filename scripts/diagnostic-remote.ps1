# Script de diagnostic serveur
param(
    [string]$ServerUser = 'anistaar',
    [string]$ServerHost = '192.168.1.72',
    [string]$RepoPath = '/opt/text2quiz'
)

Write-Host "==> Diagnostic serveur..." -ForegroundColor Cyan

$cmd = @"
cd $RepoPath
echo '=== COMMIT ==='
git log --oneline -1
echo ''
echo '=== FICHIER OMC (premiere ligne) ==='
head -n 1 src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt
echo ''
echo '=== NOMBRE QUESTIONS ==='
grep -c '^QCM' src/questions/S1/INSTIT/OMC_QCM_EXHAUSTIF_v1.txt || echo '0'
echo ''
echo '=== BUNDLE ACTUEL ==='
ls -lh dist/assets/index-*.js | tail -1
echo ''
echo '=== DANS LE BUNDLE? ==='
strings dist/assets/index-*.js | grep -c 'OMC_QCM_EXHAUSTIF' || echo '0'
"@

ssh "$ServerUser@$ServerHost" $cmd
