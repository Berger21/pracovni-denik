# 📁 Soubory pro Ubuntu Server Migration

Tento adresář obsahuje všechny potřebné soubory pro migraci aplikace na Ubuntu Server 22.04.

## 📋 Seznam souborů

### 📖 Dokumentace
- **DEPLOYMENT_UBUNTU.md** - Kompletní návod pro deployment
- **QUICK_START.md** - Rychlý start guide
- **MIGRATION_FILES.md** - Tento soubor

### 🚀 Deployment skripty
- **setup-ubuntu.sh** - Počáteční setup Ubuntu serveru
- **deploy.sh** - Deployment aplikace
- **manage.sh** - Utility skripty pro správu

### ⚙️ Konfigurační soubory
- **ecosystem.config.json** - PM2 konfigurace
- **nginx.conf** - Nginx konfigurace
- **package.json** - Obsahuje deploy skripty

### 🗂️ Adresářová struktura na serveru

```
/var/www/pracovni-denik/
├── src/                    # Zdrojové soubory aplikace
├── public/                 # Statické soubory
├── node_modules/           # Závislosti (vytvoří se při npm install)
├── .next/                  # Build soubory (vytvoří se při npm run build)
├── package.json            # Konfigurace projektu
├── next.config.ts          # Next.js konfigurace
├── ecosystem.config.json   # PM2 konfigurace
├── nginx.conf              # Nginx konfigurace
├── deploy.sh               # Deployment skript
├── manage.sh               # Utility skripty
└── *.md                    # Dokumentace
```

## 🔄 Postup migrace

### 1. Příprava serveru
```bash
# Spuštění setup skriptu
./setup-ubuntu.sh
```

### 2. Přenos aplikace
```bash
# Zkopírování všech souborů do /var/www/pracovni-denik/
# Nebo git clone přímo na server
```

### 3. Deployment
```bash
# Spuštění deployment skriptu
./deploy.sh
```

### 4. Konfigurace Nginx
```bash
# Zkopírování a aktivace Nginx konfigurace
sudo cp nginx.conf /etc/nginx/sites-available/pracovni-denik
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Užitečné příkazy

### PM2 správa
```bash
pm2 start ecosystem.config.json  # Spuštění aplikace
pm2 stop pracovni-denik          # Zastavení aplikace
pm2 restart pracovni-denik       # Restart aplikace
pm2 logs pracovni-denik          # Zobrazení logů
pm2 monit                        # Monitoring
```

### Nginx správa
```bash
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Status Nginx
sudo nginx -t                    # Test konfigurace
sudo tail -f /var/log/nginx/error.log  # Logy
```

### Utility skripty
```bash
./manage.sh status               # Status aplikace
./manage.sh logs                 # Logy aplikace
./manage.sh restart              # Restart aplikace
./manage.sh update               # Aktualizace z Git
./manage.sh backup               # Záloha aplikace
```

## 🔐 Bezpečnost

- Aplikace běží na portu 3000 (interní)
- Nginx proxy na portu 80/443 (veřejný)
- Firewall povoluje pouze SSH a HTTP/HTTPS
- Možnost přidání SSL certifikátu pomocí Let's Encrypt

## 📊 Monitoring

- PM2 poskytuje monitoring procesů
- Logy aplikace v `/var/log/pm2/`
- Logy Nginx v `/var/log/nginx/`

## 💾 Zálohování

- Automatické zálohování přes `./manage.sh backup`
- Zálohy se ukládají do `/var/backups/pracovni-denik/`
- Zálohy obsahují celou aplikaci včetně konfigurace

## 📞 Podpora

Pokud potřebujete pomoc s migrací:
1. Zkontrolujte logy pomocí `./manage.sh logs`
2. Ověřte status služeb pomocí `./manage.sh status`
3. Použijte návod v DEPLOYMENT_UBUNTU.md

---

✅ **Vše je připraveno pro migraci na Ubuntu Server 22.04!**
