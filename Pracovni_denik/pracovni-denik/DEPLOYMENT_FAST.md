# 🚀 Rychlá migrace na Ubuntu Server

## ⚡ Git způsob (rychlý)

### 1. Příprava (Windows)
```bash
git add .
git commit -m "Připraveno pro deployment"
git push origin main
```

### 2. Deployment (Ubuntu Server)
```bash
# Připojení
ssh au@192.168.1.251

# Setup serveru (jednorázově)
curl -fsSL https://raw.githubusercontent.com/your-username/pracovni-denik/main/setup-ubuntu.sh | bash

# Clone a deployment
git clone https://github.com/your-username/pracovni-denik.git /var/www/pracovni-denik
cd /var/www/pracovni-denik
chmod +x deploy.sh manage.sh
./deploy.sh

# Nginx konfigurace
sudo cp nginx.conf /etc/nginx/sites-available/pracovni-denik
sudo sed -i 's/your-domain.com/192.168.1.251/g' /etc/nginx/sites-available/pracovni-denik
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 3. Výsledek
Aplikace běží na: **http://192.168.1.251**

## 📋 Správa aplikace
```bash
./manage.sh status     # Status
./manage.sh update     # Aktualizace z Git
./manage.sh logs       # Logy
./manage.sh restart    # Restart
```

---

✅ **Mnohem rychlejší než archivace!**
