# 🚀 RYCHLÝ START - Migrace na Ubuntu Server 22.04

## 📋 Přehled kroků

1. **Příprava serveru** - Instalace Node.js, PM2, Nginx
2. **Přenos aplikace** - Zkopírování souborů na server
3. **Konfigurace** - Nastavení služeb a proxy
4. **Spuštění** - Aktivace aplikace

## ⚡ Rychlé kroky

### 1. Na Ubuntu Serveru

```bash
# Stáhněte setup skript
wget https://raw.githubusercontent.com/your-repo/pracovni-denik/main/setup-ubuntu.sh

# Spusťte setup
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

### 2. Přenos aplikace

**Varianta A - ZIP archiv:**
```bash
# Na Windows vytvořte ZIP z pracovni-denik složky
# Nahrajte na server a rozbalte do /var/www/pracovni-denik/
```

**Varianta B - Git (doporučeno):**
```bash
cd /var/www/
git clone https://github.com/your-repo/pracovni-denik.git
sudo chown -R $USER:$USER pracovni-denik
```

### 3. Deployment

```bash
cd /var/www/pracovni-denik
chmod +x deploy.sh manage.sh
./deploy.sh
```

### 4. Konfigurace Nginx

```bash
# Zkopírujte konfiguraci
sudo cp nginx.conf /etc/nginx/sites-available/pracovni-denik

# Aktivujte
sudo ln -s /etc/nginx/sites-available/pracovni-denik /etc/nginx/sites-enabled/

# Upravte server_name v konfiguraci
sudo nano /etc/nginx/sites-available/pracovni-denik
# Změňte "your-domain.com" na vaši IP adresu nebo doménu

# Test a restart
sudo nginx -t
sudo systemctl restart nginx
```

## 🎯 Výsledek

Aplikace poběží na:
- **HTTP**: `http://your-server-ip`
- **Port**: 3000 (interní), 80 (veřejný)

## 🔧 Správa aplikace

```bash
# Utility skripty
./manage.sh status    # Status aplikace
./manage.sh logs      # Zobrazení logů
./manage.sh restart   # Restart aplikace
./manage.sh update    # Aktualizace z Git
```

## 🚨 Řešení problémů

### Aplikace nefunguje
```bash
pm2 logs pracovni-denik
sudo systemctl status nginx
```

### Port už je použit
```bash
sudo netstat -tlnp | grep 3000
pm2 kill
pm2 start ecosystem.config.json
```

### Nginx chyby
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

## 📞 Kontakt

Pokud potřebujete pomoc s migrací, mám připraveny všechny potřebné soubory a skripty!

---

✅ **Připraveno k migraci!** Všechny soubory jsou v pracovní složce aplikace.
