# Deployment Guide (Fedora + Nginx)

This app is a static Vite build. Typical prod stack: Nginx serving `dist/` under `/var/www/text2quiz/current` with a timestamped release directory.

## One-time server setup

- Install Nginx and open firewall (http/https)
- Clone repo into `/opt/text2quiz` (or `/opt/Text2QuizVIP`)
- Install Node (nvm or dnf), run build at least once to validate
- Create Nginx vhost (as default_server) pointing to `/var/www/text2quiz/current`

## Zero-downtime deploy script (server)

Copy `scripts/deploy-server.sh` to `/opt/text2quiz/deploy.sh` then:

```bash
sudo chmod +x /opt/text2quiz/deploy.sh
sudo /opt/text2quiz/deploy.sh
```

The script:
- Pulls `origin/main`
- `npm ci && npm run build`
- Publishes to `/var/www/text2quiz/releases/$TS` and flips `/var/www/text2quiz/current` symlink
- Reloads Nginx

Environment overrides:
- `BRANCH=main REPO_DIR=/opt/text2quiz WWW_BASE=/var/www/text2quiz NGINX_SERVICE=nginx`

## Local release from Windows

Use the helper PowerShell script:

```powershell
npm run release -- -Message "feat: update" -Branch main -ServerUser anistaar -ServerHost 192.168.1.72 -RemoteDeployPath /opt/text2quiz/deploy.sh
```

It will:
- Optionally run tests and a local build
- `git add/commit/push`
- SSH to the server and run the deploy script

Flags:
- `-SkipTests`, `-SkipLocalBuild`

## HTTPS

Use certbot to obtain a TLS certificate for your domain and let the nginx plugin inject the TLS server block and enable auto-renew:

```bash
sudo dnf -y install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.tld --agree-tos -m you@example.com --redirect --hsts --staple-ocsp --rsa-key-size 4096
```

## Troubleshooting

- Still seeing Fedora welcome page: ensure your vhost is `listen 80 default_server; server_name _;` and move `/etc/nginx/default.d/welcome.conf` away. Reload Nginx.
- 403 with SELinux Enforcing: label web root with `httpd_sys_content_t` and `restorecon -Rv /var/www/text2quiz`.
- Node not available for root when using nvm: run deploy script as the user that installed nvm, or install nvm for root as well.
