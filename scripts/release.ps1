# PowerShell release helper (run on your Windows dev machine)
# - Runs optional tests/build locally
# - Commits and pushes to origin (default branch: main)
# - SSH into server and triggers remote deploy script

param(
    [string]$Message = $(Read-Host 'Commit message'),
    [string]$Branch = 'main',
    [string]$ServerUser = 'anistaar',
    [string]$ServerHost = '192.168.1.72',
    [string]$RemoteDeployPath = '/opt/text2quiz/deploy.sh',
  [string]$RemoteRepoDir,
    [switch]$SkipLocalBuild,
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

function Exec($cmd) {
  Write-Host "==> $cmd" -ForegroundColor Cyan
  & $env:ComSpec /c $cmd | Write-Output
  if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
}

# 1) Ensure clean git status
$status = git status --porcelain
if (-not $status) {
  Write-Host "Working tree clean" -ForegroundColor Green
} else {
  Write-Host "There are local changes." -ForegroundColor Yellow
}

# 2) Optional tests/build locally (fast safety net)
if (-not $SkipTests) {
  try { Exec "npm run test" } catch { Write-Host "Tests failed (continuing by request?)" -ForegroundColor Yellow }
}
if (-not $SkipLocalBuild) {
  try { Exec "npm run build" } catch { Write-Host "Local build failed (continuing by request?)" -ForegroundColor Yellow }
}

# 3) Commit and push
if ([string]::IsNullOrWhiteSpace($Message)) { $Message = "chore: release" }
Exec "git add -A"
try { Exec "git commit -m `"$Message`"" } catch { Write-Host "Nothing to commit" -ForegroundColor Yellow }
Exec "git push origin $Branch"

# 4) Trigger remote deploy
$remote = "$ServerUser@$ServerHost"
Write-Host "Triggering remote deploy on $remote" -ForegroundColor Green

# Commandes simples sans sudo
$repoDir = if ($RemoteRepoDir) { $RemoteRepoDir } else { "/opt/text2quiz" }
$commands = "cd $repoDir && git config --global --add safe.directory $repoDir 2>/dev/null; git fetch origin && git reset --hard origin/$Branch && git pull origin $Branch && npm ci && npm run build"

Write-Host "Executing: $commands" -ForegroundColor Cyan
ssh $remote $commands

if ($LASTEXITCODE -ne 0) { 
  Write-Host "Remote deploy failed - you may need to run commands manually with sudo" -ForegroundColor Red
  Write-Host "SSH to server and run: cd $repoDir && sudo bash deploy.sh" -ForegroundColor Yellow
  exit 1
}

Write-Host "Deploy done." -ForegroundColor Green
