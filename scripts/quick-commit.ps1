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
  Exec "git push origin $branch"
}

Write-Host "Done" -ForegroundColor Green
