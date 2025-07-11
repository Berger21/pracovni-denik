# 🚀 Migrace na server 192.168.1.251

## 📋 Přihlašovací údaje
- **IP adresa**: 192.168.1.251
- **Uživatel**: au
- **Heslo**: GAL783vs

## 🔧 Krok 1: Připojení k serveru

```bash
# Z Windows PowerShell nebo terminál
ssh au@192.168.1.251
# Zadejte heslo: GAL783vs
```

## 🛠️ Krok 2: Automatický setup serveru

```bash
# Po přihlášení na server spusťte:
cd ~
wget https://raw.githubusercontent.com/nodejs/node/main/README.md -O test.txt && rm test.txt
# Pokud wget funguje, pokračujte

# Vytvoříte setup skript
cat > setup-ubuntu.sh << 'EOF'
#!/bin/bash

# 🛠️ Setup skript pro Ubuntu Server 22.04

set -e

echo "🛠️ Spouštím setup pro Ubuntu Server 22.04..."

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

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

print_info "Instaluji Git..."
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

print_success "Setup dokončen!"

echo ""
echo "📋 Nainstalované verze:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - PM2: $(pm2 --version)"
echo "  - Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"

print_success "Server je připraven!"
EOF

# Spuštění setup skriptu
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

## 📦 Krok 3: Přenos aplikace

Nyní budeme potřebovat přenést soubory z Windows na server. Máte několik možností:

### Možnost A: SCP z Windows (doporučeno)

```powershell
# Na Windows (PowerShell) - přejděte do složky s aplikací
cd C:\Users\r.ovcacik\Pracovni_denik\pracovni-denik

# Vytvoříte ZIP archiv (Windows)
Compress-Archive -Path * -DestinationPath pracovni-denik.zip

# Nahrajte ZIP na server
scp pracovni-denik.zip au@192.168.1.251:~/
```

### Možnost B: Ruční kopírování souborů

```bash
# Na serveru vytvořte strukturu
mkdir -p /var/www/pracovni-denik
cd /var/www/pracovni-denik

# Zkopírujte jednotlivé soubory (použijte WinSCP nebo podobný nástroj)
```

## 🔧 Krok 4: Rozbalení a konfigurace na serveru

```bash
# Na serveru
cd ~
unzip pracovni-denik.zip -d /var/www/pracovni-denik/

# Nebo pokud jste kopírovali ručně, přesuňte soubory
# cp -r ~/pracovni-denik/* /var/www/pracovni-denik/

# Nastavte práva
sudo chown -R $USER:$USER /var/www/pracovni-denik
cd /var/www/pracovni-denik

# Nastavte spustitelné práva pro skripty
chmod +x deploy.sh manage.sh setup-ubuntu.sh

# Spuštění deployment
./deploy.sh
```

## 🌐 Krok 5: Konfigurace Nginx

```bash
# Na serveru
cd /var/www/pracovni-denik

# Zkopírujte Nginx konfiguraci
sudo cp nginx.conf /etc/nginx/sites-available/pracovni-denik

# Upravte server_name na IP adresu
sudo sed -i 's/your-domain.com/192.168.1.251/g' /etc/nginx/sites-available/pracovni-denik

# Aktivujte konfiguraci
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/

# Odstraňte výchozí konfiguraci
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurace
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🎯 Krok 6: Ověření

```bash
# Kontrola statusu aplikace
pm2 status

# Kontrola logů
pm2 logs pracovni-denik

# Kontrola Nginx
sudo systemctl status nginx

# Test přístupu
curl http://localhost:3000
```

## 🌐 Finální test

Po dokončení:
1. Otevřete webový prohlížeč
2. Přejděte na: **http://192.168.1.251**
3. Ověřte funkčnost aplikace

## 🔧 Užitečné příkazy pro správu

```bash
# Status aplikace
./manage.sh status

# Logy aplikace
./manage.sh logs

# Restart aplikace
./manage.sh restart

# Aktualizace aplikace
./manage.sh update

# Záloha aplikace
./manage.sh backup
```

## 🚨 Řešení problémů

### Aplikace nefunguje
```bash
pm2 logs pracovni-denik
sudo systemctl status nginx
```

### Port conflict
```bash
sudo netstat -tlnp | grep 3000
pm2 kill
pm2 start ecosystem.config.json
```

---

✅ **Aplikace poběží na: http://192.168.1.251**
