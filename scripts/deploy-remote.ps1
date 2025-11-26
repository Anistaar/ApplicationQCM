# Script de deploiement distant simplifie
param(
    [string]$ServerUser = 'anistaar',
    [string]$ServerHost = '192.168.1.72',
    [string]$RepoPath = '/opt/text2quiz'
)

Write-Host "==> Connexion au serveur..." -ForegroundColor Cyan

$cmd = "cd $RepoPath && git config --global --add safe.directory $RepoPath && git fetch origin && git reset --hard origin/main && git pull origin main && npm ci && npm run build && echo 'Build termine'"

Write-Host "==> Execution du deploiement..." -ForegroundColor Cyan
ssh "$ServerUser@$ServerHost" $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeploiement reussi !" -ForegroundColor Green
} else {
    Write-Host "`nErreur lors du deploiement" -ForegroundColor Red
    exit 1
}
