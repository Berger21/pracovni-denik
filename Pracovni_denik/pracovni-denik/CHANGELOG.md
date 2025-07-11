# 📋 Changelog - Pracovní deník

Všechny důležité změny v projektu jsou dokumentovány v tomto souboru.

## [2.6.0] - 2025-07-11

### 🚀 Nová funkce
- **Ubuntu Server Migration**: Kompletní příprava pro migraci na Ubuntu Server 22.04
  - Vytvořen detailní deployment návod (DEPLOYMENT_UBUNTU.md)
  - Automatické deployment skripty (setup-ubuntu.sh, deploy.sh, manage.sh)
  - PM2 konfigurace pro správu procesů (ecosystem.config.json)
  - Nginx konfigurace s proxy a optimalizacemi (nginx.conf)
  - Utility skripty pro jednoduchou správu aplikace
  - Rychlý start guide (QUICK_START.md)

### 🔧 Vylepšeno
- **Package.json**: Přidány deployment skripty a network binding
- **Dokumentace**: Kompletní migrace dokumentace pro Ubuntu Server
- **Automatizace**: Skripty pro setup, deployment a správu

### 📁 Nové soubory
- `DEPLOYMENT_UBUNTU.md` - Detailní deployment návod
- `QUICK_START.md` - Rychlý start guide
- `MIGRATION_FILES.md` - Přehled migračních souborů
- `setup-ubuntu.sh` - Automatický setup Ubuntu serveru
- `deploy.sh` - Deployment skript
- `manage.sh` - Utility skripty pro správu
- `ecosystem.config.json` - PM2 konfigurace
- `nginx.conf` - Nginx konfigurace

## [2.5.5] - 2025-07-11

### 🚀 Vylepšeno
- **Kvalita PDF exportu**: Značně zvýšena kvalita exportovaných PDF souborů
  - Zvýšena kvalita JPEG komprese z 85% na 92%
  - Zvýšen scale parametr z 1.5x na 2x pro nejvyšší kvalitu
  - Výsledek: ostré a čitelné PDF soubory (cca 5-8MB)
  - Optimální poměr kvalita/velikost

### 🐛 Opraveno
- **Automatické vyplnění v kroku 4**: Opraveno předvyplňování pole "Směnu předal"
  - Pole se nyní vyplní celým jménem vedoucího směny místo jen prvního písmena
  - Zlepšená logika detekce kdy má/nemá dojít k automatickému vyplnění
  - Respektuje uživatelské změny v poli

## [2.5.4] - 2025-07-11

### 🐛 Opraveno
- **Zobrazování poznámek technologa**: Opravena logika načítání poznámek technologa
  - Poznámky se nyní správně zobrazují v aktuálním pracovním deníku
  - Zlepšené zpracování případů kdy nejsou všechny údaje vyplněny
- **Kvalita PDF exportu**: Vylepšena kvalita exportovaných PDF souborů
  - Zvýšena kvalita JPEG komprese z 70% na 85%
  - Zvýšen scale parametr z 1x na 1.5x pro lepší rozlišení
  - Lepší poměr kvalita/velikost souboru (cca 2-4MB místo 54kB)
  - Zachována rozumná velikost souboru (ne desítky MB)

### 🔧 Vylepšeno
- **PDF export**: Jednotné použití JPEG formátu pro všechny exporty
- **Zobrazování poznámek**: Vylepšené zpracování chybových stavů při načítání poznámek

## [2.5.3] - 2025-07-11

### 🔧 Vylepšeno
- **Rozhraní technologa**: Odstraněno zbytečné pole "Autor"
  - Poznámky technologa mají automaticky nastaveného autora "Technolog"
  - Zjednodušené rozhraní bez redundantních polí
- **Reorganizace workflow**: Pole "Poznámky vedoucího směny" přesunuto z kroku 2 do kroku 3
  - Poznámky vedoucího směny jsou nyní součástí pracovního deníku
  - Lepší logické uspořádání formuláře
  - Poznámky se nadále zobrazují v PDF i HTML exportu

### 🐛 Opraveno
- Odstraněno zbytečné pole "Autor" v rozhraní technologa
- Zlepšeno logické uspořádání workflow

## [2.5.2] - 2025-07-10

### 🔧 Vylepšeno
- **Čitelnost textu**: Opravena čitelnost šedého textu v celé aplikaci
  - Základní údaje v aktuálním deníku: tmavě šedý text místo světle šedého
  - Náhled předchozí směny: všechen text je nyní dobře čitelný
  - Tabulky v náhledu: opraveny barvy textu a hlaviček
- **Automatické vyplnění**: "Směnu předal" se automaticky vyplní podle vedoucího směny
  - Při zadání vedoucího směny se automaticky vyplní pole "Směnu předal"
  - Zjednodušuje workflow pro technology
- **Optimalizace PDF**: Dramaticky snížena velikost PDF souborů
  - Použití JPEG komprese místo PNG (70% kvalita)
  - Sníženo rozlišení z 2x na 1x pro menší velikost
  - PDF soubory nyní ~1-2MB místo 13MB
  - Zachována dobrá čitelnost textu

### 🐛 Opraveno
- Nečitelný šedý text v přehledech základních údajů
- Příliš velké PDF soubory

## [2.5.1] - 2025-07-10

### 🚀 Přidáno
- **Tlačítko návratu k aktuálnímu deníku v kroku 1**: Nová funkce pro rychlý návrat
  - Zobrazuje se pod výběrem technologie
  - Automaticky načte rozpracovaný deník pro zvolenou technologii a dnešní datum
  - Pokud není nalezen žádný deník, začne nový
  - Přejde na správný krok podle stavu deníku (dokončený/rozpracovaný)
  - Intuitivní uživatelské rozhraní s nápovědou

### 🔧 Vylepšeno
- **Uživatelská přívětivost**: Technologové se mohou rychle vrátit k své práci
- **Workflow efektivita**: Žádné ztracené rozpracované deníky
- **Inteligentní navigace**: Automatické směrování na správný krok

## [2.5.0] - 2025-07-10

### 🚀 Přidáno
- **Víkendové směny**: Rozdílná nastavení směn pro všední dny vs víkend
  - Všední dny (Po-Pá): ranní (06:00-14:00), odpolední (14:00-22:00), noční (22:00-06:00)
  - Víkendy (So-Ne): denní (06:00-18:00), noční (18:00-06:00)
  - Automatické přepínání podle data v kroku 2 workflow
- **Vylepšený náhled předchozí směny**: Inteligentní logika pro nalezení správného deníku
  - Hledá předchozí směnu v ten samý den podle pořadí
  - Pokud nenajde, zobrazí poslední směnu z předchozího dne
  - Zohledňuje pořadí směn (ranní → odpolední → noční)
- **Návrat k aktuálnímu deníku**: Nové tlačítko v rozhraní technologa
  - Rychlý návrat bez ztráty ověření heslem
  - Zachování stavu technologa při návratu

### 🔧 Vylepšeno
- **PDF názvy souborů**: Obsahují nyní i název směny
  - Format: `Pracovni_denik_[TECHNOLOGIE]_[DATUM]_[SMENA].pdf`
  - Lepší organizace exportovaných souborů
- **Logika směn**: Robustnější správa různých typů směn
- **Uživatelská přívětivost**: Intuitivnější navigace v rozhraní technologa

## [2.4.0] - 2025-07-10

### 🚀 Přidáno
- **HTML-to-PDF export**: Nová metoda exportu s plnou podporou diakritiky
  - Renderování do HTML s následným převodem na PDF pomocí html2canvas
  - 100% podpora českých znaků včetně všech diakritických znamének
  - Lepší typografie a layout v PDF dokumentech
  - Zachování původního textového exportu jako fallback

### 🔧 Vylepšeno
- **PDF kvalita**: Výrazně lepší kvalita výsledných PDF dokumentů
  - Crisp text s podporou všech českých znaků
  - Lepší struktura tabulek a rozložení
  - Responzivní design zachovaný v PDF
- **Uživatelská přívětivost**: Export nyní zachovává všechny české znaky
- **Kompatibilita**: Zachována zpětná kompatibilita s textovým exportem

## [2.3.0] - 2025-07-10

### 🎨 Přidáno
- **Logo firmy**: Přidáno firemní logo do hlavní aplikace i PDF dokumentů
  - Logo v hlavičce aplikace vedle názvu
  - Logo v PDF exportu s automatickým umístěním
  - Responzivní zobrazení loga
- **Náhled předchozí směny**: Nová funkce pro zobrazení posledního deníku
  - Tlačítko "Náhled předchozí směny" v kroku 3
  - Modal s kompletním obsahem předchozího deníku
  - Automatické načítání při změně technologie
  - Přehledné zobrazení základních údajů, záznamů a potvrzení

### 🔧 Vylepšeno
- **PDF export**: Integrace loga firmy s automatickým layoutem
- **UI/UX**: Lepší rozvržení hlavičky s logem a funkcemi
- **Workflow**: Kontextová nápověda z předchozích směn

## [2.3.0] - 2025-07-10

### ✨ Nové funkce
- **Poznámky vedoucího směny**: Přidána nová kolonka v kroku 2 workflow
  - Volitelné pole pro poznámky vedoucího směny
  - Zobrazuje se v PDF exportu v základních údajích
  - Podporuje dlouhé texty s automatickým zalomením
- **Vylepšený PDF export s poznámkami**: 
  - Zobrazení statických upozornění (středa = 6S, odpolední = nabíječka)
  - Zobrazení poznámek technologa pro konkrétní datum/směnu/technologii
  - Nová sekce "POZNÁMKY A UPOZORNĚNÍ" v PDF
- **Oddělené jméno technologa**: V rozhraní technologa je pole "Autor" samostatně

### 🔧 Opravy
- **Oprava automatického vyplňování**: Pole "Směnu předal" se nyní správně vyplňuje celým jménem vedoucího směny
  - Odstraněn problematický useEffect
  - Vytvořen dedikovaný handler `handleVedouciSmenyChange`
  - Vyplňuje se pouze pokud je pole prázdné

### 🎨 Vylepšení UI
- Vylepšena struktura PDF exportu s novou sekcí poznámek
- Barevné odlišení různých typů poznámek v PDF
- Lepší formátování dlouhých textů v PDF s automatickým zalomením

---

## [2.2.1] - 2025-07-10

### 🔧 Opravy
- **KRITICKÁ OPRAVA**: Logika návratu k aktuálnímu deníku nyní správně rozlišuje mezi rozpracovanými a dokončenými deníky
  - Prioritní načítání rozpracovaných deníků před dokončenými
  - Lepší detekce stavu deníku v paměti vs. localStorage
  - Přesnější určení správného kroku workflow podle stavu deníku
- **PDF Export**: Přidána podpora pro zobrazení ručních podpisů (canvas) v HTML-to-PDF exportu
  - Podpisy se nyní zobrazují jako obrázky v PDF místo jen textových jmen
  - Jméno je správně umístěno nad podpisem v obou typech exportu (textový i HTML)
  - Vylepšená struktura podpisové sekce s lepším layoutem
- **Nová funkce**: `najitRozpracovanyDenik()` v storage.ts pro přesnější hledání rozpracovaných deníků

### ✨ Vylepšení
- Vylepšená logika určování kroků workflow při návratu k deníku
- Lepší hierarchie priority při načítání deníků (paměť → rozpracované → dokončené → nový)
- Vylepšený layout podpisů v PDF s konzistentním umístěním jmen nad podpisy
- Kvalitnější uživatelské zpětné vazby s přesnějšími statusovými hláškami

---

## [2.2.0] - 2025-07-10

### 🔧 Vylepšeno
- **PDF export**: Výrazně vylepšený s lepší podporou češtiny a podpisů
  - Pokus o zachování diakritiky s fallback náhradou
  - Lepší layout a design PDF dokumentu
  - Vylepšené zpracování elektronických podpisů
  - Barevné prvky a gradientní pozadí hlavičky
  - Přehlednější tabulky a ohraničení
- **Rozhraní technologa**: Vylepšená čitelnost a kontrast
  - Lepší placeholdery a barvy textu
  - Vylepšené filtry s labely
  - Kontrastní inputy a selecty pro lepší viditelnost
  - Barevně odlišená tlačítka
- **Síťová dostupnost**: Konfigurace pro presentaci v síti
  - Dev skript nastaven pro běh na všech IP adresách (-H 0.0.0.0)
  - Možnost přístupu z jiných zařízení v síti

### 🐛 Opraveno
- Opraveny chyby s chybějícími funkcemi formatDatumCas() a formatCas() v PDF
- Vylepšené error handling pro podpisy v PDF
- Lepší názvy exportovaných PDF souborů

---

## [2.1.0] - 2025-07-10

### 🔒 Přidáno
- **Ochrana heslem**: Rozhraní technologa je nyní chráněno heslem (1234)
- **Moderní dialog**: Vlastní UI dialog pro zadání hesla místo základního prompt
- **Bezpečnost**: Přístup do technolog rozhraní pouze po ověření

### ♻️ Změněno
- **Workflow zjednodušen**: Odstraněn krok "Instrukce" z hlavního workflow
- **4-krokový proces**: 1) Technologie, 2) Směna/Personál, 3) Pracovní deník, 4) Potvrzení
- **Instrukce**: Jsou nyní buď statické nebo zadávané technologem jako poznámky
- **Progress bar**: Upraven na 4 kroky místo původních 5

### 🐛 Opraveno
- Opravena chyba s přístupem k pecím při prázdné technologii
- Odstraněny všechny odkazy na proměnné souvisejí s instrukcemi
- Opraveny TypeScript chyby po úpravě workflow
- Aktualizovaná navigace mezi kroky
- Přidán debug logging pro lepší diagnostiku problémů

---

## [2.0.0] - 2025-07-10

### 🚀 Přidáno
- **PDF Export**: Automatické generování PDF dokumentů s kompletním obsahem deníku
- **LocalStorage**: Persistentní ukládání všech dat v prohlížeči
- **Technolog rozhraní**: Speciální sekce pro technology k zadávání poznámek pro operátory
- **Statistiky a reporty**: Kompletní přehled s grafy, filtry a analýzami
- **Rozšířená validace**: Detailní kontrola vstupních dat s chybovými hlášeními
- **Konfigurovatelná upozornění**: Systém pravidel pro různé situace
- **Podpisy myší**: Canvas pro kreslení podpisů při předání/převzetí směny

### 🔧 Vylepšeno
- **Validace formulářů**: Přísná kontrola všech vstupních polí
- **Uživatelské rozhraní**: Jasné označení chyb a upozornění
- **Responsivní design**: Optimalizace pro mobilní zařízení
- **TypeScript**: Kompletní typová podpora pro všechny komponenty
- **Performance**: Optimalizace načítání a renderování

### 🎯 Funkce
- **Automatické ukládání**: Všechny deníky se ukládají do localStorage
- **Poznámky technologa**: Zobrazují se operátorům podle data/směny/technologie
- **Statistiky s filtrováním**: Podle období, technologie, směny
- **Export statistik**: PDF export analytických reportů
- **Navigace mezi moduly**: Přepínání mezi deníkem, technolog rozhraním a statistikami

### 📱 Uživatelská rozhraní
- **Operátor**: Hlavní workflow pro vytváření deníků
- **Technolog**: Správa poznámek pro jednotlivé směny
- **Statistiky**: Analytické rozhraní s reporting

### 🛠️ Technické změny
- Přidána závislost `jspdf` pro PDF generování
- Přidána závislost `html2canvas` pro export HTML do PDF
- Přidána závislost `react-icons` pro ikony
- Přidána závislost `date-fns` pro práci s datumy
- Nové utility funkce v `src/lib/`
- Nové komponenty v `src/components/`
- Rozšířené typy v `src/types/index.ts`

---

## [1.0.0] - 2025-07-09

### 🚀 Počáteční verze
- **Vícekolové workflow**: 5 kroků pro vytváření pracovních deníků
- **Výběr technologie**: SOLO500, IPSEN, VAKUUM, P.K
- **Správa směn**: Ranní, odpolední, noční s automatickým nastavením času
- **Personální údaje**: Vedoucí směny a obsluha linky
- **Instrukce pro směnu**: Zadávání pokynů pro operátory
- **Pracovní záznamy**: Přidávání záznamů s validací
- **Potvrzení směny**: Předání/převzetí s podpisy
- **Automatická upozornění**: 
  - Středa: 6S pro všechny směny
  - Odpolední směna: Nabíječka VZV
- **Tisk**: Základní funkcionalita tisku

### 🎨 Design
- Moderní UI s Tailwind CSS
- Responsivní design
- Progress bar pro workflow
- Jasné označení povinných polí

### 🛠️ Technologie
- Next.js 15 s App Router
- TypeScript
- Tailwind CSS
- React hooks

---

## 🔮 Plánované funkce (Next.js roadmap)

### [2.1.0] - Plánováno
- **Backend integrace**: REST API pro ukládání dat
- **Uživatelské role**: Admin, technolog, operátor
- **Email notifikace**: Automatické upozornění
- **Bulk operace**: Hromadné operace s deníky

### [2.2.0] - Plánováno  
- **Mobile aplikace**: PWA s offline podporou
- **Více jazyků**: Anglická lokalizace
- **Advanced reporting**: Detailnější analytika
- **API integrace**: Propojení s ERP systémy

### [3.0.0] - Vize
- **AI asistent**: Automatické vyplňování na základě historie
- **Real-time collaboration**: Více uživatelů současně
- **Advanced security**: 2FA, audit log
- **Cloud sync**: Synchronizace mezi zařízeními

---

## 📋 Typy změn

### Legenda
- **🚀 Přidáno**: Nové funkce
- **🔧 Vylepšeno**: Změny existujících funkcí  
- **🐛 Opraveno**: Bug fixy
- **💔 Změna API**: Breaking changes
- **🔒 Bezpečnost**: Bezpečnostní opravy
- **📚 Dokumentace**: Změny v dokumentaci
- **🎨 Design**: Změny v UI/UX
- **⚡ Performance**: Optimalizace výkonu

---

## 🏷️ Verzování

Projekt používá [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: Nové funkce (zpětně kompatibilní)
- **PATCH**: Bug fixy (zpětně kompatibilní)

---

## 🤝 Přispívání

1. Fork repositáře
2. Vytvořte feature branch (`git checkout -b feature/nova-funkce`)
3. Commit změny (`git commit -am 'Přidána nová funkce'`)
4. Push do branchu (`git push origin feature/nova-funkce`)
5. Vytvořte Pull Request

---

**Udržujte changelog aktuální s každou verzí! 📝**
