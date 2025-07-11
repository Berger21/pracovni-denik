# 📋 Pracovní deník - Rozšířená verze

Moderní webová aplikace pro vedení pracovních deníků s pokročilými funkcemi pro různé technologie, směny a personál.

## 🚀 Nové funkce v této verzi

### ✨ Hlavní rozšíření

1. **📄 Export do PDF** - Vylepšený export s podporou češtiny, logom firmy a elektronických podpisů
2. **💾 Ukládání do localStorage** - Persistentní ukládání všech dat v prohlížeči
3. **🔧 Rozhraní pro technologa** - Speciální sekce s vylepšenou čitelností
4. **📊 Statistiky a reporty** - Kompletní přehled s grafy a analýzami
5. **⚠️ Rozšířená upozornění** - Konfigurovatelná upozornění podle pravidel
6. **✅ Pokročilá validace** - Detailní kontrola vstupních dat s chybovými hlášeními
7. **🖊️ Elektronické podpisy** - Canvas podpisy exportované do PDF
8. **🌐 Síťová dostupnost** - Možnost spuštění na konkrétní IP adrese
9. **👁️ Náhled předchozí směny** - Zobrazení posledního deníku pro danou technologii
10. **🏢 Logo firmy** - Firemní logo v aplikaci i PDF dokumentech

### 🔧 Technické funkce

- **Automatické ukládání** všech vyplněných deníků
- **Poznámky technologa** se zobrazují operátorům podle data, směny a technologie
- **Konfigurovatelná upozornění** pro různé situace
- **Statistiky** s filtrováním podle období, technologie, směny
- **PDF export** s profesionálním formátováním
- **Validace formulářů** s jasným označením chyb

## 📱 Uživatelská rozhraní

### 👷 Operátor (hlavní rozhraní)
Standardní čtyřkrokový workflow pro vytváření pracovních deníků:

1. **Výběr technologie** (SOLO500, IPSEN, VAKUUM, P.K)
2. **Nastavení směny a personálu** s validací a automatickým přepínáním směn
   - **Všední dny** (Po-Pá): ranní (06:00-14:00), odpolední (14:00-22:00), noční (22:00-06:00)
   - **Víkendy** (So-Ne): denní (06:00-18:00), noční (18:00-06:00)
3. **Vyplňování pracovního deníku** s automatickými upozorněními a náhledem předchozí směny
4. **Potvrzení a podpis** s exportem do PDF

### 🔧 Technolog (chráněné rozhraní)
- **Ochrana heslem** (1234)
- **Náhled předchozí směny**: Inteligentní hledání podle pořadí směn
- **Návrat k aktuálnímu deníku**: Rychlý přepínač bez ztráty ověření
- **Správa poznámek** pro konkrétní datum/směnu/technologii

> **Poznámka:** Instrukce se zobrazují buď jako statické nebo jsou zadávané technologem jako poznámky.

### 🔧 Technolog
Speciální rozhraní pro technology (chráněno heslem: **1234**):
- Vytváření poznámek pro konkrétní datum/směnu/technologii
- Správa existujících poznámek
- Filtrování a vyhledávání
- Poznámky se automaticky zobrazí operátorům

### 📊 Statistiky
Kompletní analytické rozhraní:
- Přehledové karty s klíčovými číslíky
- Rozdělení podle směn a technologií
- Nejčastější zakázky a nejaktivnější dny
- Seznam posledních deníků
- Export statistik do PDF
- Filtrování podle období

## 🎯 Automatická upozornění

### Výchozí upozornění:
- **Každou středu**: "🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY"
- **Odpolední směna**: "🔋 DÁT VELKÝ VZV NA NABÍJEČKU - DO RÁNA MUSÍ BÝT NABITÝ"

### Rozšiřitelná pravidla:
Systém podporuje vytváření vlastních upozornění podle:
- Konkrétního data
- Dne v týdnu
- Typu směny
- Technologie

## 💾 Ukládání dat

Všechna data se ukládají lokálně v prohlížeči:
- **Pracovní deníky** - kompletní historie
- **Poznámky technologa** - podle data/směny/technologie
- **Statistiky** - průběžně aktualizované
- **Nastavení upozornění** - konfigurovatelná pravidla

## 🔍 Validace

### Přísná kontrola vstupů:
- **Krok 1**: Povinný výběr technologie
- **Krok 2**: Validace jmen (min. 2 znaky), povinné vyplnění všech polí
- **Krok 3**: Instrukce min. 10 znaků
- **Krok 4**: Validace zakázek (min. 3 znaky číslo, min. 5 znaků popis)
- **Krok 5**: Povinné vyplnění jmen pro předání/převzetí

### Zobrazení chyb:
Všechny validační chyby se zobrazují v červených boxech s konkrétními pokyny k opravě.

## 📄 PDF Export

### Vylepšený export s plnou podporou diakritiky:
- **HTML-to-PDF metoda**: Nová technologie pro dokonalý export
- **100% podpora češtiny**: Všechny diakritické znaménka jsou zachovány
- **Profesionální layout**: Crisp text, lepší tabulky, barevné prvky
- **Firemní logo**: Automatické vložení loga do hlavičky PDF
- **Fallback kompatibilita**: Zachována zpětná kompatibilita s textovým exportem

### Automatický export obsahuje:
- Hlavičku s logem firmy, technologií a datem
- Základní údaje o směně s přehledným formátováním
- Tabulku všech záznamů práce
- Sekci pro podpisy (předal/převzal) s prostorem pro podpis
- Profesionální typografii s plnou podporou českých znaků

### Dostupné exporty:
- **Pracovní deník** - po dokončení workflow
- **Statistiky** - z analytického rozhraní

## 🛠️ Technologie

- **Next.js 15** s App Router
- **TypeScript** pro type safety
- **Tailwind CSS** pro styling
- **jsPDF** pro generování PDF
- **html2canvas** pro export HTML do PDF
- **React hooks** pro state management
- **LocalStorage API** pro persistenci

## 🚀 Spuštění

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru (místní přístup)
npm run dev

# Build pro produkci
npm run build
```

### 🌐 Spuštění pro síťový přístup

Pro prezentaci aplikace v místní síti:

```bash
# Aplikace bude dostupná na http://192.168.12.8:3000
npm run dev
```

**Poznámka:** Dev skript je již nakonfigurován pro běh na všech IP adresách (`-H 0.0.0.0`), takže aplikace bude automaticky dostupná na IP adrese vašeho PC.

## 📋 Přehled funkcí

| Funkce | Status | Popis |
|--------|--------|--------|
| ✅ Vícekolové workflow | Dokončeno | 4 kroky s validací |
| ✅ PDF export | Dokončeno | Automatické generování |
| ✅ LocalStorage | Dokončeno | Persistentní ukládání |
| ✅ Technolog rozhraní | Dokončeno | Poznámky pro operátory (heslo: 1234) |
| ✅ Statistiky | Dokončeno | Kompletní analytika |
| ✅ Podpisy myší | Dokončeno | Canvas pro kreslení |
| ✅ Validace | Dokončeno | Detailní kontrola vstupů |
| ✅ Upozornění | Dokončeno | Konfigurovatelná pravidla |
| ✅ Responsivní design | Dokončeno | Mobilní i desktop |
| ✅ TypeScript | Dokončeno | Plná typová podpora |

## 🎨 Design

Aplikace používá moderní design s:
- Čistým a přehledným rozhraním
- Jasnou navigací mezi sekcemi
- Výrazným označením chyb a upozornění
- Profesionálním vzhledem pro tisk
- Responsivním designem pro všechna zařízení

## 🔮 Možná rozšíření

- **Backend integrace** s databází
- **Uživatelské role** a autentifikace
- **Email notifikace** pro upozornění
- **Více jazykových variant**
- **Mobile aplikace** s offline podporou
- **Integrace s ERP systémy**

---

**Vytvořeno pro efektivní vedení pracovních deníků s důrazem na uživatelskou přívětivost a funkcionalnost.** 🚀
└── types/             # TypeScript typy
```

## Skripty

- `npm run dev` - Spustí vývojový server
- `npm run build` - Sestaví aplikaci pro produkci
- `npm run start` - Spustí produkční server
- `npm run lint` - Spustí ESLint kontrolu

## Nasazení

Aplikaci lze snadno nasadit na [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Další informace o nasazení najdete v [Next.js dokumentaci](https://nextjs.org/docs/app/building-your-application/deploying).
