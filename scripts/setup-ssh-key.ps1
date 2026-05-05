# Script pour configurer l'authentification SSH par cle
Write-Host "=== Configuration SSH ===" -ForegroundColor Cyan

$serverUser = "anistaar"
$serverHost = "192.168.1.72"
$sshDir = "$env:USERPROFILE\.ssh"
$keyPath = "$sshDir\id_rsa_text2quiz"

if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

if (-not (Test-Path $keyPath)) {
    Write-Host "Generation de la cle SSH..." -ForegroundColor Yellow
    Write-Host "(Appuyez sur Entree pour accepter les valeurs par defaut)" -ForegroundColor Gray
    ssh-keygen -t rsa -b 4096 -f $keyPath -C "text2quiz-deploy" -N '""'
    Write-Host "Cle generee!" -ForegroundColor Green
} else {
    Write-Host "Cle existe deja" -ForegroundColor Green
}

Write-Host ""
Write-Host "Copie de la cle sur le serveur..." -ForegroundColor Yellow
Write-Host "Entrez le mot de passe UNE DERNIERE FOIS:" -ForegroundColor Gray

$publicKey = Get-Content "$keyPath.pub"
$cmd = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo OK"

ssh "$serverUser@$serverHost" $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Configuration terminee!" -ForegroundColor Green
    Write-Host "Test de connexion..." -ForegroundColor Yellow
    
    ssh -o BatchMode=yes -o ConnectTimeout=5 "$serverUser@$serverHost" "echo 'SSH fonctionne sans mot de passe!'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCES! Vous pouvez maintenant deployer sans mot de passe!" -ForegroundColor Green
    }
} else {
    Write-Host "Erreur lors de la copie" -ForegroundColor Red
}
