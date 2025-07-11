# 🚀 Deployment na Ubuntu Server 22.04

Tento návod vás provede nasazením aplikace Pracovní deník na Ubuntu Server 22.04.

## 📋 Požadavky

- Ubuntu Server 22.04 LTS
- Root nebo sudo přístup
- Internetové připojení
- Minimálně 2GB RAM a 10GB volného místa

## 🔧 Instalace Node.js a npm

```bash
# Aktualizace systému
sudo apt update && sudo apt upgrade -y

# Instalace Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Ověření instalace
node --version
npm --version
```

## 📦 Instalace PM2 (Process Manager)

```bash
# Instalace PM2 globálně
sudo npm install -g pm2

# Ověření instalace
pm2 --version
```

## 🌐 Instalace a konfigurace Nginx

```bash
# Instalace Nginx
sudo apt install nginx -y

# Spuštění a povolení Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ověření stavu
sudo systemctl status nginx
```

## 📁 Přenos aplikace na server

### Varianta 1: Přenos přes SCP/SFTP

```bash
# Na vašem Windows PC (PowerShell)
# Zkomprimujte složku pracovni-denik do ZIP
# Nahrajte na server přes SCP

# Na Ubuntu serveru
cd /var/www/
sudo mkdir pracovni-denik
sudo chown $USER:$USER pracovni-denik
```

### Varianta 2: Git clone (doporučeno)

```bash
# Na Ubuntu serveru
cd /var/www/
sudo git clone <your-git-repo-url> pracovni-denik
sudo chown -R $USER:$USER pracovni-denik
```

### Varianta 3: Ruční přenos

```bash
# Na Ubuntu serveru vytvořte strukturu
cd /var/www/
sudo mkdir -p pracovni-denik
sudo chown -R $USER:$USER pracovni-denik

# Zkopírujte všechny soubory do /var/www/pracovni-denik/
```

## 🛠️ Konfigurace aplikace

```bash
# Přejděte do složky aplikace
cd /var/www/pracovni-denik

# Instalace závislostí
npm install

# Build produkční verze
npm run build

# Test spuštění
npm start
```

## ⚙️ Konfigurace PM2

```bash
# Vytvoření PM2 konfigurace
cd /var/www/pracovni-denik

# Spuštění aplikace přes PM2
pm2 start npm --name "pracovni-denik" -- start

# Uložení PM2 konfigurace
pm2 save

# Automatické spuštění po restartu
pm2 startup
# Spusťte příkaz, který PM2 vypíše

# Ověření běhu aplikace
pm2 status
pm2 logs pracovni-denik
```

## 🌐 Konfigurace Nginx

```bash
# Vytvoření konfiguračního souboru
sudo nano /etc/nginx/sites-available/pracovni-denik

# Vložte následující konfiguraci:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Nahraďte svou doménou nebo IP adresou
    
    # Hlavní aplikace
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Statické soubory
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
    
    # Bezpečnostní hlavičky
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Velikost uploadu
    client_max_body_size 10M;
}
```

```bash
# Aktivace konfigurace
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/

# Test konfigurace
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔥 Konfigurace firewallu

```bash
# Instalace ufw (pokud není nainstalován)
sudo apt install ufw -y

# Povolení SSH
sudo ufw allow ssh

# Povolení HTTP a HTTPS
sudo ufw allow 'Nginx Full'

# Aktivace firewallu
sudo ufw enable

# Ověření statusu
sudo ufw status
```

## 🔒 SSL/HTTPS s Let's Encrypt (volitelné)

```bash
# Instalace Certbot
sudo apt install certbot python3-certbot-nginx -y

# Získání SSL certifikátu
sudo certbot --nginx -d your-domain.com

# Automatické obnovení (cron job)
sudo crontab -e
# Přidejte řádek:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitorování a správa

```bash
# Zobrazení logů aplikace
pm2 logs pracovni-denik

# Restart aplikace
pm2 restart pracovni-denik

# Stop aplikace
pm2 stop pracovni-denik

# Zobrazení statusu
pm2 status

# Monitoring v reálném čase
pm2 monit
```

## 🔧 Utility skripty

```bash
# Vytvoření utility skriptu
sudo nano /usr/local/bin/pracovni-denik-update

# Vložte obsah:
#!/bin/bash
cd /var/www/pracovni-denik
git pull origin main
npm install
npm run build
pm2 restart pracovni-denik
echo "Aplikace byla aktualizována!"

# Nastavte práva
sudo chmod +x /usr/local/bin/pracovni-denik-update
```

## 📝 Důležité poznámky

1. **Záloha dat**: localStorage se ukládá v prohlížeči, takže data zůstávají na klientských zařízeních
2. **Aktualizace**: Použijte `pracovni-denik-update` příkaz pro jednoduchou aktualizaci
3. **Logy**: Najdete v `pm2 logs` nebo v `/var/log/nginx/`
4. **Bezpečnost**: Změňte heslo pro rozhraní technologa v kódu před nasazením

## 🚨 Řešení problémů

### Aplikace nefunguje
```bash
# Kontrola statusu
pm2 status
pm2 logs pracovni-denik

# Restart služeb
pm2 restart pracovni-denik
sudo systemctl restart nginx
```

### Nginx chyby
```bash
# Kontrola konfigurace
sudo nginx -t

# Logy Nginx
sudo tail -f /var/log/nginx/error.log
```

### Port už je použit
```bash
# Najděte proces na portu 3000
sudo netstat -tlnp | grep 3000
sudo kill -9 <PID>
```

## 🎯 Finální test

Po dokončení instalace:

1. Otevřete webový prohlížeč
2. Přejděte na `http://your-server-ip` nebo `http://your-domain.com`
3. Ověřte, že aplikace funguje správně
4. Otestujte všechny funkce (vytvoření deníku, export PDF, rozhraní technologa)

## 📞 Podpora

Pokud narazíte na problémy:
1. Zkontrolujte logy: `pm2 logs pracovni-denik`
2. Zkontrolujte Nginx logy: `sudo tail -f /var/log/nginx/error.log`
3. Ověřte stav služeb: `pm2 status` a `sudo systemctl status nginx`

---

✅ **Aplikace je nyní nasazena a běží na Ubuntu Server 22.04!**
