# Quick commit & push helper for Windows (PowerShell)
# Usage:
#   npm run commit
#   # or
#   powershell -ExecutionPolicy Bypass -File ./scripts/quick-commit.ps1 -Message "feat: update UI"

param(
  [string]$Message = $(Read-Host 'Message de commit'),
  [switch]$SkipPush
)

$ErrorActionPreference = 'Stop'

function Exec($cmd) {
  Write-Host "==> $cmd" -ForegroundColor Cyan
  & $env:ComSpec /c $cmd | Write-Output
  if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
}

# Detect current branch
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { throw 'Impossible de détecter la branche Git' }
Write-Host "Branche actuelle: $branch" -ForegroundColor Green

# Stage & commit
Exec "git add -A"
if ([string]::IsNullOrWhiteSpace($Message)) { $Message = "chore: update" }
try {
  Exec "git commit -m `"$Message`""
} catch {
  Write-Host "Rien à committer (aucune modification détectée)" -ForegroundColor Yellow
}

# Push (optional)
if (-not $SkipPush) {
  # Ensure a remote exists
  $remotes = (git remote) -split "\r?\n" | Where-Object { $_ -ne '' }
  if (-not $remotes) {
    Write-Host "Aucun remote Git configuré. Ajoute-en un, par ex.:" -ForegroundColor Yellow
    Write-Host "  git remote add origin <URL_DU_DEPOT>" -ForegroundColor Yellow
    Write-Host "Puis relance le script." -ForegroundColor Yellow
    exit 1
  }
  try {
    Exec "git push origin $branch"
  } catch {
    Write-Host "Le push a échoué. Tentative avec --set-upstream..." -ForegroundColor Yellow
    try {
      Exec "git push -u origin $branch"
    } catch {
      Write-Host "Le push a encore échoué. Causes communes:" -ForegroundColor Red
      Write-Host "- Authentification requise (configurer HTTPS avec un token PAT ou SSH)" -ForegroundColor Red
      Write-Host "- Le remote 'origin' ne pointe pas vers le bon dépôt" -ForegroundColor Red
      Write-Host "- Droits insuffisants sur le dépôt" -ForegroundColor Red
      Write-Host "Essaye manuellement:" -ForegroundColor Yellow
      Write-Host "  git remote -v" -ForegroundColor Yellow
      Write-Host "  git push -u origin $branch" -ForegroundColor Yellow
      exit 1
    }
  }
}

Write-Host "Done" -ForegroundColor Green
