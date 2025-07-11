# 📦 PowerShell skript pro přenos aplikace na server

# Nastavení proměnných
$SERVER_IP = "192.168.1.251"
$SERVER_USER = "au"
$SERVER_PASS = "GAL783vs"  # Pozor: heslo v plaintext pouze pro demo
$LOCAL_PATH = "C:\Users\r.ovcacik\Pracovni_denik\pracovni-denik"
$ARCHIVE_NAME = "pracovni-denik.zip"

Write-Host "🚀 Spouštím přenos aplikace na server $SERVER_IP" -ForegroundColor Green

# Kontrola, zda existuje zdrojový adresář
if (-not (Test-Path $LOCAL_PATH)) {
    Write-Host "❌ Zdrojový adresář neexistuje: $LOCAL_PATH" -ForegroundColor Red
    exit 1
}

# Přejít do adresáře aplikace
Set-Location $LOCAL_PATH

Write-Host "📁 Pracovní adresář: $LOCAL_PATH" -ForegroundColor Blue

# Vytvoření ZIP archivu
Write-Host "📦 Vytvářím ZIP archiv..." -ForegroundColor Yellow
if (Test-Path $ARCHIVE_NAME) {
    Remove-Item $ARCHIVE_NAME -Force
}

# Vytvoření archivu (bez node_modules a .next pro rychlejší přenos)
$filesToZip = Get-ChildItem -Path . -Exclude "node_modules", ".next", "*.zip" -Recurse
Compress-Archive -Path $filesToZip -DestinationPath $ARCHIVE_NAME -CompressionLevel Optimal

Write-Host "✅ ZIP archiv vytvořen: $ARCHIVE_NAME" -ForegroundColor Green

# Zobrazení velikosti archivu
$archiveSize = (Get-Item $ARCHIVE_NAME).Length / 1MB
Write-Host "📊 Velikost archivu: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Blue

# Instrukce pro SCP přenos
Write-Host "`n🔧 Nyní použijte jeden z následujících způsobů přenosu:" -ForegroundColor Yellow

Write-Host "`n📋 Možnost 1 - SCP příkaz:" -ForegroundColor Cyan
Write-Host "scp $ARCHIVE_NAME ${SERVER_USER}@${SERVER_IP}:~/" -ForegroundColor White

Write-Host "`n📋 Možnost 2 - Použití WinSCP nebo podobného nástroje:" -ForegroundColor Cyan
Write-Host "- Připojte se na server: $SERVER_IP" -ForegroundColor White
Write-Host "- Uživatel: $SERVER_USER" -ForegroundColor White
Write-Host "- Heslo: $SERVER_PASS" -ForegroundColor White
Write-Host "- Nahrajte soubor: $ARCHIVE_NAME" -ForegroundColor White

Write-Host "`n📋 Možnost 3 - PowerShell SCP (vyžaduje OpenSSH):" -ForegroundColor Cyan
Write-Host "scp.exe $ARCHIVE_NAME ${SERVER_USER}@${SERVER_IP}:~/" -ForegroundColor White

Write-Host "`n🔧 Po nahrání na server spusťte:" -ForegroundColor Yellow
Write-Host "ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "cd ~" -ForegroundColor White
Write-Host "unzip $ARCHIVE_NAME -d /var/www/pracovni-denik/" -ForegroundColor White
Write-Host "cd /var/www/pracovni-denik" -ForegroundColor White
Write-Host "chmod +x deploy.sh manage.sh" -ForegroundColor White
Write-Host "./deploy.sh" -ForegroundColor White

Write-Host "`n✅ Příprava dokončena! Archiv je připraven k přenosu." -ForegroundColor Green

# Volitelně - pokus o automatický SCP přenos (vyžaduje OpenSSH)
$response = Read-Host "`nChcete zkusit automatický přenos přes SCP? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🔄 Pokouším se o automatický přenos..." -ForegroundColor Yellow
    
    # Zkontrolujeme, zda je dostupný scp
    if (Get-Command scp -ErrorAction SilentlyContinue) {
        try {
            scp $ARCHIVE_NAME "${SERVER_USER}@${SERVER_IP}:~/"
            Write-Host "✅ Přenos dokončen!" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Automatický přenos selhal. Použijte ruční způsob." -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ SCP není dostupný. Použijte ruční způsob." -ForegroundColor Red
    }
}

Write-Host "`n🎯 Aplikace bude dostupná na: http://$SERVER_IP" -ForegroundColor Green
