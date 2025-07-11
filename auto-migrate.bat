@echo off
echo.
echo 🚀 Automatická migrace Pracovni denik na Ubuntu Server
echo ====================================================
echo.
echo 📋 Server: 192.168.1.251
echo 👤 Login: au
echo 🔑 Heslo: GAL783vs
echo.
echo ⚠️  POZOR: Tento skript provede automatickou migraci!
echo.
set /p confirm="Chcete pokračovat? (y/N): "
if /i not "%confirm%"=="y" (
    echo Migrace zrušena.
    pause
    exit /b
)

echo.
echo 🔧 Krok 1: Kontrola Git repository...
echo.

:: Kontrola, zda je Git inicializován
if not exist ".git" (
    echo ❌ Git není inicializován v tomto adresáři!
    echo Spusťte nejdřív: git init
    pause
    exit /b 1
)

:: Kontrola, zda je nastaven remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ Git remote 'origin' není nastaven!
    echo Spusťte: git remote add origin https://github.com/Berger21/pracovni-denik.git
    pause
    exit /b 1
)

echo ✅ Git je nastaven správně
echo.

echo 🔧 Krok 2: Commit a push aktuálního kódu...
echo.

:: Přidání všech souborů
git add .
if errorlevel 1 (
    echo ❌ Git add selhal!
    pause
    exit /b 1
)

:: Commit
git commit -m "Automatická migrace na Ubuntu Server - %date% %time%"
if errorlevel 1 (
    echo ℹ️  Žádné změny k commit nebo commit selhal
)

:: Push
echo Pushování do Git repository...
git push origin main
if errorlevel 1 (
    echo ❌ Git push selhal!
    echo Zkontrolujte své Git nastavení a připojení
    pause
    exit /b 1
)

echo ✅ Kód byl úspěšně nahrán do Git repository
echo.

echo 🔧 Krok 3: Příprava SSH příkazů...
echo.

:: Vytvoření dočasného SSH skriptu
echo #!/bin/bash > temp_deploy.sh
echo echo "🚀 Spouštím automatický deployment na Ubuntu Server..." >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "📦 Kontrola a cleanup starých souborů..." >> temp_deploy.sh
echo sudo rm -rf /var/www/pracovni-denik >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "📥 Klonování z Git repository..." >> temp_deploy.sh
echo git clone https://github.com/Berger21/pracovni-denik.git /var/www/pracovni-denik >> temp_deploy.sh
echo if [ $? -ne 0 ]; then >> temp_deploy.sh
echo     echo "❌ Git clone selhal!" >> temp_deploy.sh
echo     exit 1 >> temp_deploy.sh
echo fi >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "🔧 Nastavování oprávnění..." >> temp_deploy.sh
echo sudo chown -R $USER:$USER /var/www/pracovni-denik >> temp_deploy.sh
echo cd /var/www/pracovni-denik >> temp_deploy.sh
echo chmod +x setup-ubuntu.sh deploy.sh manage.sh >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "🛠️  Spouštím setup Ubuntu serveru..." >> temp_deploy.sh
echo ./setup-ubuntu.sh >> temp_deploy.sh
echo if [ $? -ne 0 ]; then >> temp_deploy.sh
echo     echo "❌ Setup selhal!" >> temp_deploy.sh
echo     exit 1 >> temp_deploy.sh
echo fi >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "🚀 Spouštím deployment..." >> temp_deploy.sh
echo ./deploy.sh >> temp_deploy.sh
echo if [ $? -ne 0 ]; then >> temp_deploy.sh
echo     echo "❌ Deployment selhal!" >> temp_deploy.sh
echo     exit 1 >> temp_deploy.sh
echo fi >> temp_deploy.sh
echo echo "" >> temp_deploy.sh
echo echo "✅ Migrace dokončena!" >> temp_deploy.sh
echo echo "🎯 Aplikace je dostupná na: http://192.168.1.251" >> temp_deploy.sh
echo rm -f temp_deploy.sh >> temp_deploy.sh

echo ✅ SSH skript připraven
echo.

echo 🔧 Krok 4: Nahrávání a spuštění na serveru...
echo.
echo ℹ️  Budete vyzváni k zadání hesla pro SSH připojení
echo    Heslo: GAL783vs
echo.

:: Nahrání skriptu na server
scp temp_deploy.sh au@192.168.1.251:~/
if errorlevel 1 (
    echo ❌ Nahrání SSH skriptu selhalo!
    echo Zkontrolujte síťové připojení k serveru
    pause
    del temp_deploy.sh
    exit /b 1
)

echo ✅ SSH skript nahrán na server
echo.

:: Spuštění skriptu na serveru
echo 🚀 Spouštím deployment na serveru...
echo.
ssh au@192.168.1.251 "chmod +x temp_deploy.sh && ./temp_deploy.sh"
if errorlevel 1 (
    echo ❌ Spuštění na serveru selhalo!
    echo Zkontrolujte SSH připojení a oprávnění
    pause
    del temp_deploy.sh
    exit /b 1
)

:: Cleanup
del temp_deploy.sh

echo.
echo ✅ MIGRACE DOKONČENA!
echo.
echo 🎯 Aplikace je nyní dostupná na: http://192.168.1.251
echo.
echo 📋 Pro správu aplikace na serveru použijte:
echo    ssh au@192.168.1.251
echo    cd /var/www/pracovni-denik
echo    ./manage.sh status
echo.
pause
