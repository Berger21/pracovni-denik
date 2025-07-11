# 🚀 Automatická migrace Pracovni denik na Ubuntu Server
# PowerShell verze

param(
    [switch]$Force
)

$SERVER_IP = "192.168.1.251"
$SERVER_USER = "au"
$SERVER_PATH = "/var/www/pracovni-denik"
$GIT_REPO = "https://github.com/Berger21/pracovni-denik.git"

Write-Host "🚀 Automatická migrace Pracovni denik na Ubuntu Server" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Server: $SERVER_IP" -ForegroundColor Cyan
Write-Host "👤 Login: $SERVER_USER" -ForegroundColor Cyan
Write-Host "🔑 Heslo: GAL783vs" -ForegroundColor Cyan
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "⚠️  POZOR: Tento skript provede automatickou migraci! Pokračovat? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Migrace zrušena." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "🔧 Krok 1: Kontrola Git repository..." -ForegroundColor Yellow
Write-Host ""

# Kontrola Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git není inicializován v tomto adresáři!" -ForegroundColor Red
    Write-Host "Spusťte nejdřív: git init" -ForegroundColor White
    exit 1
}

# Kontrola remote origin
try {
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        Write-Host "❌ Git remote 'origin' není nastaven!" -ForegroundColor Red
        Write-Host "Spusťte: git remote add origin $GIT_REPO" -ForegroundColor White
        exit 1
    }
    Write-Host "✅ Git je nastaven správně" -ForegroundColor Green
} catch {
    Write-Host "❌ Git remote není nastaven!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Krok 2: Commit a push aktuálního kódu..." -ForegroundColor Yellow
Write-Host ""

# Git add
Write-Host "Přidávám soubory..." -ForegroundColor White
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git add selhal!" -ForegroundColor Red
    exit 1
}

# Git commit
Write-Host "Vytvářím commit..." -ForegroundColor White
$commitMessage = "Automatická migrace na Ubuntu Server - $(Get-Date -Format 'dd.MM.yyyy HH:mm')"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️  Žádné změny k commit nebo commit selhal" -ForegroundColor Blue
}

# Git push
Write-Host "Pushování do Git repository..." -ForegroundColor White
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push selhal!" -ForegroundColor Red
    Write-Host "Zkontrolujte své Git nastavení a připojení" -ForegroundColor White
    exit 1
}

Write-Host "✅ Kód byl úspěšně nahrán do Git repository" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Krok 3: Příprava deployment skriptu..." -ForegroundColor Yellow
Write-Host ""

# Vytvoření deployment skriptu
$deployScript = @"
#!/bin/bash
echo "🚀 Spouštím automatický deployment na Ubuntu Server..."
echo ""

echo "📦 Kontrola a cleanup starých souborů..."
sudo rm -rf $SERVER_PATH

echo "📥 Klonování z Git repository..."
git clone $GIT_REPO $SERVER_PATH
if [ \$? -ne 0 ]; then
    echo "❌ Git clone selhal!"
    exit 1
fi

echo "🔧 Nastavování oprávnění..."
sudo chown -R \$USER:\$USER $SERVER_PATH
cd $SERVER_PATH
chmod +x setup-ubuntu.sh deploy.sh manage.sh

echo "🛠️  Spouštím setup Ubuntu serveru..."
./setup-ubuntu.sh
if [ \$? -ne 0 ]; then
    echo "❌ Setup selhal!"
    exit 1
fi

echo "🚀 Spouštím deployment..."
./deploy.sh
if [ \$? -ne 0 ]; then
    echo "❌ Deployment selhal!"
    exit 1
fi

echo ""
echo "✅ Migrace dokončena!"
echo "🎯 Aplikace je dostupná na: http://$SERVER_IP"

# Cleanup
rm -f ~/auto_deploy.sh
"@

# Uložení skriptu
$deployScript | Out-File -FilePath "auto_deploy.sh" -Encoding UTF8

Write-Host "✅ Deployment skript připraven" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Krok 4: Nahrávání a spuštění na serveru..." -ForegroundColor Yellow
Write-Host ""
Write-Host "ℹ️  Budete vyzváni k zadání hesla pro SSH připojení" -ForegroundColor Blue
Write-Host "   Heslo: GAL783vs" -ForegroundColor Blue
Write-Host ""

# Kontrola SCP
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP příkaz není dostupný!" -ForegroundColor Red
    Write-Host "Nainstalujte OpenSSH Client nebo použijte WSL" -ForegroundColor White
    Remove-Item "auto_deploy.sh" -Force
    exit 1
}

# Nahrání skriptu
Write-Host "📤 Nahrávám deployment skript na server..." -ForegroundColor White
scp auto_deploy.sh "${SERVER_USER}@${SERVER_IP}:~/auto_deploy.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Nahrání skriptu selhalo!" -ForegroundColor Red
    Write-Host "Zkontrolujte síťové připojení k serveru" -ForegroundColor White
    Remove-Item "auto_deploy.sh" -Force
    exit 1
}

Write-Host "✅ Skript nahrán na server" -ForegroundColor Green
Write-Host ""

# Spuštění na serveru
Write-Host "🚀 Spouštím deployment na serveru..." -ForegroundColor White
Write-Host ""
ssh "${SERVER_USER}@${SERVER_IP}" "chmod +x auto_deploy.sh; ./auto_deploy.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Spuštění na serveru selhalo!" -ForegroundColor Red
    Write-Host "Zkontrolujte SSH připojení a oprávnění" -ForegroundColor White
    Remove-Item "auto_deploy.sh" -Force
    exit 1
}

# Cleanup
Remove-Item "auto_deploy.sh" -Force

Write-Host ""
Write-Host "✅ MIGRACE DOKONČENA!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Aplikace je nyní dostupná na: http://$SERVER_IP" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Pro správu aplikace na serveru použijte:" -ForegroundColor Cyan
Write-Host "   ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "   cd $SERVER_PATH" -ForegroundColor White
Write-Host "   ./manage.sh status" -ForegroundColor White
Write-Host ""
