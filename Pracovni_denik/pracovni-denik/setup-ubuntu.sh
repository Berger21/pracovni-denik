#!/bin/bash

# 🛠️ Setup skript pro první instalaci na Ubuntu Server 22.04

set -e  # Exit on any error

echo "🛠️ Spouštím setup pro Ubuntu Server 22.04..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkce pro výpis s barvami
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Kontrola, zda běží jako root
if [[ $EUID -eq 0 ]]; then
   print_error "Nespouštějte tento skript jako root!"
   exit 1
fi

print_info "Provádím aktualizaci systému..."
sudo apt update && sudo apt upgrade -y

print_info "Instaluji Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

print_info "Instaluji PM2..."
sudo npm install -g pm2

print_info "Instaluji Nginx..."
sudo apt install nginx -y

print_info "Spouštím a aktivuji Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

print_info "Instaluji Git (pokud není nainstalován)..."
sudo apt install git -y

print_info "Instaluji UFW firewall..."
sudo apt install ufw -y

print_info "Konfiguruji firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_info "Vytvářím adresář pro aplikaci..."
sudo mkdir -p /var/www/pracovni-denik
sudo chown -R $USER:$USER /var/www/pracovni-denik

print_info "Vytvářím adresář pro PM2 logy..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

print_success "Základní setup dokončen!"

echo ""
echo "📋 Nainstalované verze:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"

echo ""
echo "🎯 Další kroky:"
echo "  1. Zkopírujte soubory aplikace do /var/www/pracovni-denik/"
echo "  2. Spusťte deployment skript: ./deploy.sh"
echo "  3. Nakonfigurujte Nginx podle návodu v DEPLOYMENT_UBUNTU.md"

print_success "Setup dokončen! Systém je připraven pro deployment."
