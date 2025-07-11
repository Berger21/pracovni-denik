# 🚀 Migrace na Ubuntu Server

## Automatické skripty

### 1. `auto-migrate.bat` (Windows Batch)
```cmd
auto-migrate.bat
```

### 2. `auto-migrate.ps1` (PowerShell - doporučeno)
```powershell
.\auto-migrate.ps1
```

### 3. `migrate-to-ubuntu.bat` (jen návod)
Pouze zobrazí ruční instrukce.

## Požadavky

- Git nastavený s remote origin
- OpenSSH Client (pro SCP a SSH)
- Síťové připojení k serveru 192.168.1.251

## Co automatické skripty dělají:

1. ✅ Kontrola Git repository
2. 📤 Commit a push aktuálního kódu
3. 🔧 Vytvoření deployment skriptu
4. 📡 Nahrání na server přes SCP
5. 🚀 Spuštění na serveru přes SSH
6. 🎯 Aplikace dostupná na http://192.168.1.251

## Řešení problémů

### Git není nastaven:
```bash
git init
git remote add origin https://github.com/Berger21/pracovni-denik.git
```

### SCP není dostupný:
- Nainstalujte OpenSSH Client
- Nebo použijte WSL

### SSH připojení selhává:
- Zkontrolujte síťové připojení
- Ověřte heslo: GAL783vs
