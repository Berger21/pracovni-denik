#!/bin/bash

# 🚀 Deployment skript pro Pracovní deník na Ubuntu Server 22.04

set -e  # Exit on any error

echo "🚀 Spouštím deployment Pracovní deník..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Kontrola, zda běží jako root
if [[ $EUID -eq 0 ]]; then
   print_error "Nespouštějte tento skript jako root!"
   exit 1
fi

# Definice proměnných
APP_NAME="pracovni-denik"
APP_DIR="/var/www/${APP_NAME}"
NGINX_CONFIG="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"

echo "📁 Pracovní adresář: ${APP_DIR}"

# Kontrola, zda existuje adresář aplikace
if [ ! -d "${APP_DIR}" ]; then
    print_error "Adresář aplikace ${APP_DIR} neexistuje!"
    print_warning "Nejprve zkopírujte soubory aplikace do ${APP_DIR}"
    exit 1
fi

# Přejít do adresáře aplikace
cd "${APP_DIR}"

print_success "Aktualizuji aplikaci..."

# Instalace závislostí
echo "📦 Instaluji závislosti..."
npm install

# Build produkční verze
echo "🔨 Buildím produkční verzi..."
npm run build

# Zastavení PM2 aplikace (pokud běží)
echo "🛑 Zastavuji běžící aplikaci..."
pm2 stop ${APP_NAME} 2>/dev/null || true

# Spuštění aplikace přes PM2
echo "🚀 Spouštím aplikaci..."
if [ -f "ecosystem.config.json" ]; then
    pm2 start ecosystem.config.json
else
    pm2 start npm --name "${APP_NAME}" -- start
fi

# Uložení PM2 konfigurace
pm2 save

# Restart Nginx
echo "🔄 Restartuji Nginx..."
sudo systemctl restart nginx

print_success "Deployment dokončen!"

# Zobrazení statusu
echo "📊 Status aplikace:"
pm2 status

# Zobrazení logů (posledních 10 řádků)
echo "📋 Poslední logy:"
pm2 logs ${APP_NAME} --lines 10

print_success "Aplikace běží na portu 3000"
print_success "Pro přístup přes web navštivte: http://$(hostname -I | awk '{print $1}')"

echo "🔧 Užitečné příkazy:"
echo "  - Zobrazit logy: pm2 logs ${APP_NAME}"
echo "  - Restart aplikace: pm2 restart ${APP_NAME}"
echo "  - Status aplikace: pm2 status"
echo "  - Zastavit aplikaci: pm2 stop ${APP_NAME}"
