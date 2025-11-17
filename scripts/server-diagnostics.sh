#!/usr/bin/env bash
# Text2Quiz server diagnostics (read-only checks)
# Usage (on server): bash scripts/server-diagnostics.sh
set -euo pipefail

say() { printf "\n== %s ==\n" "$*"; }
cmd() { echo "> $*"; eval "$*" 2>&1 | sed 's/^/  /'; }

# 1) Detect repo path
say "Detect Git repo"
REPO_CANDIDATES=(
  "/opt/text2quiz/Text2QuizVIP"
  "/opt/text2Quiz/Text2QuizVIP"
  "/opt/text2quiz"
)
REPO=""
for d in "${REPO_CANDIDATES[@]}"; do
  if [ -d "$d/.git" ]; then REPO="$d"; break; fi
  if git -C "$d" rev-parse --is-inside-work-tree >/dev/null 2>&1; then REPO=$(git -C "$d" rev-parse --show-toplevel); break; fi
done
if [ -z "${REPO:-}" ]; then echo "[x] No Git repo found under ${REPO_CANDIDATES[*]}"; else echo "[i] REPO=$REPO"; fi

if [ -n "${REPO:-}" ]; then
  cmd "git -C '$REPO' remote -v"
  cmd "git -C '$REPO' branch --show-current || true"
  cmd "git -C '$REPO' rev-parse HEAD || true"
  cmd "git -C '$REPO' rev-parse origin/main || true"
fi

# 2) Deploy script/link
say "Deploy script"
cmd "ls -l /opt/text2quiz/deploy.sh || true"
cmd "file /opt/text2quiz/deploy.sh || true"
cmd "head -n 3 /opt/text2quiz/deploy.sh || true"
cmd "ls -l '$REPO/scripts/deploy-server.sh' || true"

# 3) Node/npm
say "Node & npm"
if command -v node >/dev/null 2>&1; then cmd "node -v"; else echo "[!] node not found"; fi
if command -v npm >/dev/null 2>&1; then cmd "npm -v"; else echo "[!] npm not found"; fi

# 4) Releases & current symlink
say "Releases & current"
cmd "ls -lt /var/www/text2quiz/releases | head -n 5 || true"
cmd "readlink -f /var/www/text2quiz/current || true"
cmd "ls -lt /var/www/text2quiz/current | head -n 5 || true"

# 5) Nginx vhost (server_name/root)
say "Nginx config"
cmd "sudo grep -R "server_name\\|root " /etc/nginx/conf.d /etc/nginx/nginx.conf 2>/dev/null || true"
cmd "sudo nginx -t || true"
cmd "sudo systemctl status nginx --no-pager -l | head -n 20 || true"

# 6) Firewall & SELinux
say "Firewall & SELinux"
if command -v firewall-cmd >/dev/null 2>&1; then cmd "sudo firewall-cmd --list-services || true"; fi
if command -v getenforce >/dev/null 2>&1; then cmd "getenforce || true"; fi
cmd "ls -Zd /var/www/text2quiz /var/www/text2quiz/current 2>/dev/null || true"

# 7) HTTP reachability (from server)
say "HTTP reachability"
if command -v curl >/dev/null 2>&1; then
  cmd "curl -I -sS http://localhost/ | sed -n '1,10p'"
  cmd "curl -I -sS http://mercivictor.duckdns.org/ | sed -n '1,10p' || true"
  cmd "curl -I -sS https://mercivictor.duckdns.org/ | sed -n '1,10p' || true"
else
  echo "[!] curl not found"
fi

say "Done"
