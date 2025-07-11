#!/bin/bash

# 🔧 Utility skripty pro správu aplikace

APP_NAME="pracovni-denik"
APP_DIR="/var/www/${APP_NAME}"

# Barvy pro výstup
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

case "$1" in
    start)
        echo "🚀 Spouštím aplikaci..."
        cd $APP_DIR
        pm2 start $APP_NAME
        print_success "Aplikace spuštěna!"
        ;;
    stop)
        echo "🛑 Zastavuji aplikaci..."
        pm2 stop $APP_NAME
        print_success "Aplikace zastavena!"
        ;;
    restart)
        echo "🔄 Restartuji aplikaci..."
        pm2 restart $APP_NAME
        print_success "Aplikace restartována!"
        ;;
    status)
        echo "📊 Status aplikace:"
        pm2 status
        ;;
    logs)
        echo "📋 Logy aplikace:"
        pm2 logs $APP_NAME
        ;;
    update)
        echo "🔄 Aktualizuji aplikaci z Git..."
        cd $APP_DIR
        echo "📥 Stahuje změny z Git repository..."
        git pull origin main
        echo "📦 Instaluji závislosti..."
        npm install
        echo "🔨 Buildím aplikaci..."
        npm run build
        echo "🔄 Restartuji aplikaci..."
        pm2 restart $APP_NAME
        print_success "Aplikace aktualizována z Git!"
        ;;
    git-status)
        echo "📊 Git status:"
        cd $APP_DIR
        git status
        echo ""
        echo "📋 Poslední commity:"
        git log --oneline -5
        ;;
    nginx-restart)
        echo "🔄 Restartuji Nginx..."
        sudo systemctl restart nginx
        print_success "Nginx restartován!"
        ;;
    nginx-status)
        echo "📊 Status Nginx:"
        sudo systemctl status nginx
        ;;
    nginx-logs)
        echo "📋 Logy Nginx:"
        sudo tail -f /var/log/nginx/error.log
        ;;
    backup)
        echo "💾 Vytvářím zálohu..."
        BACKUP_DIR="/var/backups/pracovni-denik"
        sudo mkdir -p $BACKUP_DIR
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        cd /var/www
        sudo tar -czf $BACKUP_FILE $APP_NAME
        sudo chown $USER:$USER $BACKUP_FILE
        print_success "Záloha vytvořena: $BACKUP_FILE"
        ;;
    monitor)
        echo "📈 Monitoring aplikace:"
        pm2 monit
        ;;
    *)
        echo "🔧 Utility skripty pro správu aplikace Pracovní deník"
        echo ""
        echo "Použití: $0 {start|stop|restart|status|logs|update|git-status|nginx-restart|nginx-status|nginx-logs|backup|monitor}"
        echo ""
        echo "Příkazy:"
        echo "  start          - Spustí aplikaci"
        echo "  stop           - Zastaví aplikaci"
        echo "  restart        - Restartuje aplikaci"
        echo "  status         - Zobrazí status aplikace"
        echo "  logs           - Zobrazí logy aplikace"
        echo "  update         - Aktualizuje aplikaci z Git"
        echo "  git-status     - Zobrazí Git status a historii"
        echo "  nginx-restart  - Restartuje Nginx"
        echo "  nginx-status   - Zobrazí status Nginx"
        echo "  nginx-logs     - Zobrazí logy Nginx"
        echo "  backup         - Vytvoří zálohu aplikace"
        echo "  monitor        - Spustí monitoring PM2"
        exit 1
        ;;
esac
