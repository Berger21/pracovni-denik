@echo off
echo.
echo 🚀 Migrace Pracovni denik na Ubuntu Server (Git method)
echo ====================================================
echo.
echo 📋 Server: 192.168.1.251
echo 👤 Login: au
echo 🔑 Heslo: GAL783vs
echo.
echo 🔧 Kroky migrace:
echo.
echo 1. Commit a push do Git repository
echo 2. Připojení k serveru přes SSH
echo 3. Git clone na serveru
echo 4. Automatický setup a deployment
echo.
echo 📋 Nejdřív musíte:
echo 1. Vytvořit Git repository (GitHub, GitLab, atd.)
echo 2. Pushnut aktuální kód do repository
echo.
echo 🔧 Příkazy pro Git:
echo git add .
echo git commit -m "Připraveno pro deployment"
echo git push origin main
echo.
pause
echo.
echo 🔧 Nyní se připojte k serveru:
echo ssh au@192.168.1.251
echo.
echo 📋 Na serveru spusťte (nahraďte URL vašeho repository):
echo git clone https://github.com/your-username/pracovni-denik.git /var/www/pracovni-denik
echo cd /var/www/pracovni-denik
echo chmod +x setup-ubuntu.sh deploy.sh manage.sh
echo ./setup-ubuntu.sh
echo ./deploy.sh
echo.
echo ✅ Aplikace bude dostupná na: http://192.168.1.251
echo.
pause
