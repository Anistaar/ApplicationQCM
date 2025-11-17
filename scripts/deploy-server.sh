#!/usr/bin/env bash
# Zero-downtime deploy script for Text2Quiz on Fedora + Nginx
# - Pulls latest from git
# - Installs deps and builds (vite)
# - Publishes to /var/www/text2quiz/current via timestamped releases
# Usage (on server): sudo /opt/text2quiz/deploy.sh  OR  bash deploy-server.sh

set -euo pipefail

# ---- Config (override via env) ----
BRANCH="${BRANCH:-main}"
REPO_DIR="${REPO_DIR:-/opt/text2quiz}"
ALT_REPO_DIR="${ALT_REPO_DIR:-/opt/Text2QuizVIP}"
# Common nested location when repo is inside /opt/text2quiz/Text2QuizVIP
NESTED_REPO_DIR="${NESTED_REPO_DIR:-/opt/text2quiz/Text2QuizVIP}"
WWW_BASE="${WWW_BASE:-/var/www/text2quiz}"
RELEASES_DIR="$WWW_BASE/releases"
CURRENT_LINK="$WWW_BASE/current"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"

# ---- Auto-detect repo from this script's path if possible ----
# Resolves symlinks and finds the git top-level if this script lives inside the repo
_SELF_PATH="${BASH_SOURCE[0]:-$0}"
_SELF_DIR=$(cd "$(dirname "$(readlink -f "$_SELF_PATH" 2>/dev/null || echo "$_SELF_PATH")")" && pwd)
if git -C "$_SELF_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_DIR=$(git -C "$_SELF_DIR" rev-parse --show-toplevel)
fi

# ---- Select repo dir (supports multiple common paths) ----
if [[ ! -d "$REPO_DIR/.git" ]]; then
  if [[ -d "$ALT_REPO_DIR/.git" ]]; then
    REPO_DIR="$ALT_REPO_DIR"
  elif [[ -d "$NESTED_REPO_DIR/.git" ]]; then
    REPO_DIR="$NESTED_REPO_DIR"
  else
    echo "[x] Git repo not found in $REPO_DIR, $ALT_REPO_DIR or $NESTED_REPO_DIR" >&2
    exit 1
  fi
fi

echo "[i] Using repo: $REPO_DIR (branch: $BRANCH)"

# ---- Ensure dirs ----
sudo mkdir -p "$RELEASES_DIR"
sudo mkdir -p "$WWW_BASE"

# ---- Build ----
cd "$REPO_DIR"
echo "[*] Fetching..."
git fetch --all --prune
echo "[*] Switching to $BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "[*] Installing deps (npm ci)"
npm ci

echo "[*] Building (npm run build)"
npm run build

if [[ ! -d "dist" ]]; then
  echo "[x] Build did not produce dist/" >&2
  exit 1
fi

TS=$(date +%Y%m%d%H%M%S)
DEST="$RELEASES_DIR/$TS"
echo "[*] Publishing to $DEST"
sudo mkdir -p "$DEST"
sudo rsync -a --delete "dist/" "$DEST/"

echo "[*] Switching current symlink"
# Use -T so DEST is treated as a normal file, replacing an existing directory
sudo ln -sfnT "$DEST" "$CURRENT_LINK"

# ---- SELinux contexts (safe even if Permissive) ----
if command -v getenforce >/dev/null 2>&1; then
  if [[ "$(getenforce || true)" == "Enforcing" ]]; then
    if ! command -v semanage >/dev/null 2>&1; then
      sudo dnf -y install policycoreutils-python-utils || true
    fi
    sudo semanage fcontext -a -t httpd_sys_content_t "$WWW_BASE(/.*)?" 2>/dev/null || true
    sudo restorecon -Rv "$WWW_BASE" || true
  fi
fi

echo "[*] Reloading Nginx"
sudo systemctl reload "$NGINX_SERVICE"

echo "[✓] Deploy complete: $DEST -> $CURRENT_LINK"
