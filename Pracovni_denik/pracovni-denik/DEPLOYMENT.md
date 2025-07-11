# 🚀 Nasazení aplikace Pracovní deník

Tento dokument obsahuje pokyny pro nasazení aplikace do produkčního prostředí.

## 📋 Předpoklady

- Node.js 18+ nainstalovaný na serveru
- Webový server (Apache/Nginx) nebo cloud hosting
- SSL certifikát pro HTTPS

## 🔧 Lokální build

1. **Příprava produkčního buildu:**
```bash
cd pracovni-denik
npm install --production
npm run build
```

2. **Testování produkčního buildu:**
```bash
npm start
```

## ☁️ Nasazení na Vercel (doporučeno)

1. **Připojte GitHub repozitář:**
   - Přihlaste se na [vercel.com](https://vercel.com)
   - Importujte projekt z GitHubu
   - Vyberte složku `pracovni-denik`

2. **Nastavení:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Root Directory: `pracovni-denik`

3. **Deploy:**
   - Vercel automaticky nasadí aplikaci
   - Každý push do main větve spustí nový deploy

## 🐳 Nasazení s Dockerem

1. **Vytvořte Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY pracovni-denik/package*.json ./
RUN npm ci --only=production

COPY pracovni-denik/ .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build a spuštění:**
```bash
docker build -t pracovni-denik .
docker run -p 3000:3000 pracovni-denik
```

## 🔒 Bezpečnostní doporučení

### Pro produkční nasazení:

1. **HTTPS:** Vždy používejte SSL certifikát
2. **Headers:** Nastavte bezpečnostní hlavičky
3. **Environment:** Oddělte produkční a vývojové prostředí
4. **Backup:** Pravidelně zálohujte localStorage data uživatelů

### Doporučené security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📊 Monitoring a analytics

### Doporučené nástroje:

1. **Vercel Analytics** - pro sledování výkonu
2. **Google Analytics** - pro sledování použití
3. **Sentry** - pro sledování chyb
4. **LogRocket** - pro sledování uživatelských session

## 🔄 Aktualizace

### Postup aktualizace:

1. **Testování na staging:**
```bash
git checkout develop
npm run build
npm run test # když budou testy
```

2. **Deploy do produkce:**
```bash
git checkout main
git merge develop
git push origin main
```

3. **Verifikace:**
   - Ověřte funkčnost všech modulů
   - Zkontrolujte localStorage kompatibilitu
   - Otestujte PDF export

## 📱 PWA podpora (volitelné)

Pro offline funkčnost přidejte:

1. **Service Worker:**
```bash
npm install next-pwa
```

2. **Konfigurace v next.config.js:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public'
})

module.exports = withPWA({
  // vaše konfigurace
})
```

## 🛠️ Údržba

### Pravidelné úkoly:

- **Týdně:** Kontrola aplikačních logů
- **Měsíčně:** Aktualizace závislostí
- **Čtvrtletně:** Bezpečnostní audit
- **Ročně:** Plný performance audit

### Zálohování dat:

Protože aplikace používá localStorage:
1. **Instruujte uživatele** k pravidelnému exportu dat
2. **Implementujte automatické zálohování** (volitelné)
3. **Vytvořte import/export funkcionalitu** pro migraci

## 🎯 Performance optimalizace

### Pro rychlejší načítání:

1. **Image optimalizace:** Použijte Next.js Image component
2. **Code splitting:** Rozdělte komponenty podle potřeby
3. **Caching:** Nastavte správné cache headers
4. **CDN:** Použijte CDN pro statické assety

### Monitoring rychlosti:
```bash
npx @next/bundle-analyzer
```

## 📞 Support a dokumentace

### Pro koncové uživatele:

1. **Uživatelská příručka** - vytvořte PDF manuál
2. **Video tutoriály** - pro složitější funkce
3. **FAQ sekce** - nejčastější dotazy
4. **Kontaktní formulář** - pro technickou podporu

### Pro vývojáře:

1. **API dokumentace** - pro budoucí integraci
2. **Kódové komentáře** - udržujte aktuální
3. **Change log** - dokumentujte všechny změny

---

## 🆘 Řešení problémů

### Časté problémy:

1. **LocalStorage plný:**
   - Implementujte čištění starých dat
   - Nastavte limity pro počet uložených deníků

2. **PDF export nefunguje:**
   - Zkontrolujte CORS nastavení
   - Ověřte podporu prohlížeče

3. **Pomalé načítání:**
   - Optimalizujte bundle velikost
   - Implementujte lazy loading

### Kontakt pro technickou podporu:
- GitHub Issues pro bug reporty
- Email pro urgentní problémy
- Dokumentace v README.md

---

**Úspěšné nasazení! 🎉**
