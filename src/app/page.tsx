'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PracovniZaznam, 
  ZakladniUdaje, 
  SmenaInfo, 
  PodpisData, 
  UlozenyDenik,
  TehnologovePoznaky,
  UpozorneniPravidlo,
  TypSmeny,
  TypTechnologie
} from '@/types';
import { 
  ulozitDenik, 
  nacistDeniky, 
  najitPoznamkyProDatumASmenu,
  najitPredchadzajuciDenik,
  generovatId,
  formatDatumCas,
  nacistUpozorneni,
  ulozitUpozorneni
} from '@/lib/storage';
import { exportDovatPDF } from '@/lib/pdf';
import TechnologInterface from '@/components/TechnologInterface';
import Statistiky from '@/components/Statistiky';
import ErrorDisplay from '@/components/ErrorDisplay';
import NavigationButtons from '@/components/NavigationButtons';
import StepWrapper from '@/components/StepWrapper';
import { FormInput, FormTextArea } from '@/components/FormComponents';

const SMENY_VSEDNI: SmenaInfo[] = [
  { nazev: 'ranní', cas_od: '06:00', cas_do: '14:00' },
  { nazev: 'odpolední', cas_od: '14:00', cas_do: '22:00' },
  { nazev: 'noční', cas_od: '22:00', cas_do: '06:00' }
];

const SMENY_VIKEND: SmenaInfo[] = [
  { nazev: 'denní', cas_od: '06:00', cas_do: '18:00' },
  { nazev: 'noční', cas_od: '18:00', cas_do: '06:00' }
];

// Funkce pro získání směn podle dne v týdnu
const getSmenyProDatum = (datum: string): SmenaInfo[] => {
  const date = new Date(datum);
  const dayOfWeek = date.getDay(); // 0 = neděle, 1 = pondělí, ..., 6 = sobota
  
  // Víkend (sobota = 6, neděle = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return SMENY_VIKEND;
  }
  
  // Všední dny (pondělí-pátek)
  return SMENY_VSEDNI;
};

const TECHNOLOGIE = ['SOLO500', 'IPSEN', 'VAKUUM', 'P.K'] as const;

// Heslo pro přístup do rozhraní technologa
const TECHNOLOG_HESLO = '1234';

const PECE: Record<string, string[]> = {
  'SOLO500': ['SOLO500 pec 1', 'SOLO500 pec 2'],
  'IPSEN': ['TQF1', 'TQF2', 'HSH'],
  'VAKUUM': ['SWDP1', 'SWDP2', 'TAV861', 'TAV980', 'NTC', 'NIT'],
  'P.K': ['P.K pec 1', 'P.K pec 2']
};

export default function Home() {
  const [zobrazeniRezim, setZobrazeniRezim] = useState<'denik' | 'technolog' | 'statistiky'>('denik');
  const [technologOveren, setTechnologOveren] = useState<boolean>(false);
  const [zobrazitHesloDialog, setZobrazitHesloDialog] = useState<boolean>(false);
  const [zadaneHeslo, setZadaneHeslo] = useState<string>('');
  const [krok, setKrok] = useState<1 | 2 | 3 | 4>(1);
  const [zakladniUdaje, setZakladniUdaje] = useState<ZakladniUdaje>({
    technologie: '',
    smena: '',
    vedouci_smeny: '',
    obsluha_linky: '',
    datum: new Date().toISOString().split('T')[0],
    cas_od: '',
    cas_do: '',
    poznamky_vedouciho: ''
  });
  
  const [zaznamy, setZaznamy] = useState<PracovniZaznam[]>([]);
  const [novyZaznam, setNovyZaznam] = useState({
    cislo_zakazky: '',
    popis_zakazky: '',
    pec: '',
    cinnost: '',
    poznamky: ''
  });

  const [potvrzeni, setPotvrzeni] = useState({
    smenu_predal: '',
    smenu_prevzal: ''
  });

  const [podpisy, setPodpisy] = useState<PodpisData>({
    predal: '',
    prevzal: ''
  });

  const [technologovePoznamky, setTechnologovePoznamky] = useState<TehnologovePoznaky[]>([]);
  const [upozorneniPravidla, setUpozorneniPravidla] = useState<UpozorneniPravidlo[]>([]);
  const [validacniChyby, setValidacniChyby] = useState<string[]>([]);
  const [predchadzajuciDenik, setPredchadzajuciDenik] = useState<UlozenyDenik | null>(null);
  const [zobrazitNahlad, setZobrazitNahlad] = useState<boolean>(false);

  const canvasPredal = useRef<HTMLCanvasElement>(null);
  const canvasPrevzal = useRef<HTMLCanvasElement>(null);

  // Funkce pro ověření hesla technologa
  const overitTechnologaHeslo = () => {
    setZobrazitHesloDialog(true);
    setZadaneHeslo('');
  };

  const potvrditHeslo = () => {
    if (zadaneHeslo === TECHNOLOG_HESLO) {
      setTechnologOveren(true);
      setZobrazeniRezim('technolog');
      setZobrazitHesloDialog(false);
      setZadaneHeslo('');
    } else {
      alert('Nesprávné heslo! Přístup do rozhraní technologa byl zamítnut.');
      setZadaneHeslo('');
    }
  };

  const zrusitHesloDialog = () => {
    setZobrazitHesloDialog(false);
    setZadaneHeslo('');
  };

  // Funkce pro resetování ověření při návratu do hlavního rozhraní
  const navratitDoHlavnihoRozhrani = () => {
    setZobrazeniRezim('denik');
    setTechnologOveren(false);
  };

  // Funkce pro návrat k aktuálnímu deníku (bez resetování ověření)
  const navratitKAktualnimuDeniku = () => {
    setZobrazeniRezim('denik');
    // Zachovat technologOveren = true pro snadný návrat
  };

  // Funkce pro nalezení a načtení aktuálního deníku pro zvolenou technologii
  const nacistAktualniDenik = () => {
    if (!zakladniUdaje.technologie) {
      alert('Nejprve vyberte technologii');
      return;
    }

    const dnes = new Date().toISOString().split('T')[0];
    
    // PRIORITA 1: Zkontrolujeme, zda není v aktuálním stavu rozpracovaný deník (ještě neuložený)
    if (zakladniUdaje.datum === dnes && 
        zakladniUdaje.technologie === zakladniUdaje.technologie &&
        (zakladniUdaje.smena || zaznamy.length > 0 || potvrzeni.smenu_predal || potvrzeni.smenu_prevzal)) {
      
      // Je rozpracovaný deník v paměti - určíme krok podle stavu
      if (potvrzeni.smenu_predal && potvrzeni.smenu_prevzal) {
        setKrok(4); // Dokončený deník
        alert(`✅ Vrácen k dokončenému deníku pro ${zakladniUdaje.technologie}`);
      } else if (zaznamy.length > 0) {
        setKrok(3); // Má záznamy, ale není dokončen
        alert(`✅ Vrácen k rozpracovanému deníku pro ${zakladniUdaje.technologie} - ${zakladniUdaje.smena} směna`);
      } else if (zakladniUdaje.smena) {
        setKrok(3); // Má směnu nastavenou, jdeme na záznamy
        alert(`✅ Vrácen k nastavení záznamů pro ${zakladniUdaje.technologie} - ${zakladniUdaje.smena} směna`);
      } else {
        setKrok(2); // Jen technologie vybrána
        alert(`✅ Vrácen k nastavení směny pro ${zakladniUdaje.technologie}`);
      }
      return;
    }
    
    // PRIORITA 2: Hledáme uložené deníky v localStorage
    const deniky = nacistDeniky();
    
    // Nejprve hledáme rozpracované deníky pro dnešní den a tuto technologii
    const dnesniDeniky = deniky.filter(d => 
      d.zakladniUdaje.datum === dnes && 
      d.zakladniUdaje.technologie === zakladniUdaje.technologie
    );

    // Rozdělíme na dokončené a rozpracované
    const dokonceneDeníky = dnesniDeniky.filter(d => 
      d.potvrzeni.smenu_predal && d.potvrzeni.smenu_prevzal
    );
    const rozpracovaneDeníky = dnesniDeniky.filter(d => 
      !d.potvrzeni.smenu_predal || !d.potvrzeni.smenu_prevzal
    );

    // PRIORITA 3: Pokud jsou rozpracované deníky, načti první z nich
    if (rozpracovaneDeníky.length > 0) {
      const rozpracovanyDenik = rozpracovaneDeníky[0];
      
      // Načteme data do formuláře
      setZakladniUdaje(rozpracovanyDenik.zakladniUdaje);
      setZaznamy(rozpracovanyDenik.zaznamy);
      setPotvrzeni(rozpracovanyDenik.potvrzeni);
      setPodpisy(rozpracovanyDenik.podpisy || { predal: '', prevzal: '' });
      
      // Určíme správný krok
      if (rozpracovanyDenik.zaznamy.length > 0) {
        setKrok(3);
        alert(`✅ Načten rozpracovaný deník pro ${rozpracovanyDenik.zakladniUdaje.technologie} - ${rozpracovanyDenik.zakladniUdaje.smena} směna`);
      } else if (rozpracovanyDenik.zakladniUdaje.smena) {
        setKrok(3);
        alert(`✅ Načten částečně vypracovaný deník pro ${rozpracovanyDenik.zakladniUdaje.technologie} - ${rozpracovanyDenik.zakladniUdaje.smena} směna`);
      } else {
        setKrok(2);
        alert(`✅ Načten základní deník pro ${rozpracovanyDenik.zakladniUdaje.technologie}`);
      }
      return;
    }

    // PRIORITA 4: Pokud jsou jen dokončené deníky, načti poslední
    if (dokonceneDeníky.length > 0) {
      const posledniDenik = dokonceneDeníky[dokonceneDeníky.length - 1];
      
      // Načteme data do formuláře
      setZakladniUdaje(posledniDenik.zakladniUdaje);
      setZaznamy(posledniDenik.zaznamy);
      setPotvrzeni(posledniDenik.potvrzeni);
      setPodpisy(posledniDenik.podpisy || { predal: '', prevzal: '' });
      
      // Dokončený deník - zobrazíme přehled
      setKrok(4);
      alert(`✅ Načten dokončený deník pro ${posledniDenik.zakladniUdaje.technologie} - ${posledniDenik.zakladniUdaje.smena} směna`);
      return;
    }
    
    // PRIORITA 5: Žádný deník pro dnes nenalezen, začneme nový
    setZakladniUdaje(prev => ({
      ...prev,
      datum: dnes,
      smena: '',
      cas_od: '',
      cas_do: '',
      poznamky_vedouciho: ''
    }));
    setZaznamy([]);
    setPotvrzeni({ smenu_predal: '', smenu_prevzal: '' });
    setPodpisy({ predal: '', prevzal: '' });
    setKrok(2); // Jdeme na nastavení směny
    alert(`📋 Pro technologii ${zakladniUdaje.technologie} nebyl nalezen žádný dnešní deník. Začínáme nový.`);
  };

  // Funkce pro automatické upozornění
  const getAutomatickeUpozorneni = (): string[] => {
    const upozorneni: string[] = [];
    const datum = new Date(zakladniUdaje.datum);
    const denVTydnu = datum.getDay(); // 0 = neděle, 1 = pondělí, ..., 3 = středa

    // Každou středu - 6S pro všechny směny
    if (denVTydnu === 3) {
      upozorneni.push("🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY");
    }

    // Pro odpolední směnu - nabíječka
    if (zakladniUdaje.smena === 'odpolední') {
      upozorneni.push("🔋 DÁT VELKÝ VZV NA NABÍJEČKU - DO RÁNA MUSÍ BÝT NABITÝ");
    }

    // Přidání dalších upozornění z pravidel
    upozorneniPravidla.filter(p => p.aktivni).forEach(pravidlo => {
      let zobrazit = false;
      
      switch (pravidlo.typ) {
        case 'den_v_tydnu':
          zobrazit = denVTydnu === pravidlo.podminka;
          break;
        case 'smena':
          zobrazit = zakladniUdaje.smena === pravidlo.podminka;
          break;
        case 'technologie':
          zobrazit = zakladniUdaje.technologie === pravidlo.podminka;
          break;
        case 'datum':
          zobrazit = zakladniUdaje.datum === pravidlo.podminka;
          break;
      }
      
      if (zobrazit) {
        upozorneni.push(`⚠️ ${pravidlo.zprava}`);
      }
    });

    return upozorneni;
  };

  // Načtení poznámek technologa
  const nactiTechnologovePoznamky = () => {
    if (zakladniUdaje.datum && zakladniUdaje.smena && zakladniUdaje.technologie) {
      const poznamky = najitPoznamkyProDatumASmenu(
        zakladniUdaje.datum, 
        zakladniUdaje.smena, 
        zakladniUdaje.technologie
      );
      setTechnologovePoznamky(poznamky);
    } else {
      setTechnologovePoznamky([]);
    }
  };

  // Rozšířená validace
  const validateStep = (stepNumber: number): string[] => {
    const chyby: string[] = [];
    
    switch (stepNumber) {
      case 1:
        if (!zakladniUdaje.technologie) {
          chyby.push('Vyberte technologii');
        }
        break;
      case 2:
        if (!zakladniUdaje.smena) chyby.push('Vyberte směnu');
        if (!zakladniUdaje.vedouci_smeny.trim()) chyby.push('Zadejte vedoucího směny');
        if (!zakladniUdaje.obsluha_linky.trim()) chyby.push('Zadejte obsluhu linky');
        if (zakladniUdaje.vedouci_smeny.length < 2) chyby.push('Jméno vedoucího musí mít alespoň 2 znaky');
        if (zakladniUdaje.obsluha_linky.length < 2) chyby.push('Jméno obsluhy musí mít alespoň 2 znaky');
        break;
      case 3:
        if (zaznamy.length === 0) chyby.push('Přidejte alespoň jeden záznam práce');
        break;
      case 4:
        if (!potvrzeni.smenu_predal.trim()) chyby.push('Zadejte jméno osoby, která předává směnu');
        if (!potvrzeni.smenu_prevzal.trim()) chyby.push('Zadejte jméno osoby, která přebírá směnu');
        break;
    }
    
    return chyby;
  };

  // Automatická aktualizace dat a načítání
  useEffect(() => {
    const dnes = new Date().toISOString().split('T')[0];
    setZakladniUdaje(prev => ({ ...prev, datum: dnes }));
    
    // Načtení uložených pravidel upozornění
    const pravidla = nacistUpozorneni();
    setUpozorneniPravidla(pravidla);
  }, []);

  useEffect(() => {
    nactiTechnologovePoznamky();
  }, [zakladniUdaje.datum, zakladniUdaje.smena, zakladniUdaje.technologie]);

  // Handler pro změnu vedoucího směny s automatickým vyplněním "Směnu předal"
  const handleVedouciSmenyChange = (value: string) => {
    // Aktualizace vedoucího směny
    setZakladniUdaje(prev => ({ ...prev, vedouci_smeny: value }));
    
    // Automatické vyplnění "Směnu předal" pouze pokud je prázdné
    // nebo pokud obsahuje předchozí hodnotu vedoucího směny
    const currentPredal = potvrzeni.smenu_predal.trim();
    const previousVedouci = zakladniUdaje.vedouci_smeny.trim();
    
    if (value.trim() && (!currentPredal || currentPredal === previousVedouci)) {
      setPotvrzeni(prev => ({ ...prev, smenu_predal: value.trim() }));
    }
  };

  // Načtení předchozího deníku při změně technologie nebo data
  useEffect(() => {
    if (zakladniUdaje.technologie && krok >= 2) {
      const predchadzajuci = najitPredchadzajuciDenik(zakladniUdaje.technologie, zakladniUdaje.datum, zakladniUdaje.smena);
      setPredchadzajuciDenik(predchadzajuci);
    }
  }, [zakladniUdaje.technologie, zakladniUdaje.datum, krok]);

  // Nastavení času podle směny
  const handleSmenaChange = (smena: TypSmeny) => {
    const dostupneSmeny = getSmenyProDatum(zakladniUdaje.datum);
    const smenaInfo = dostupneSmeny.find(s => s.nazev === smena);
    if (smenaInfo) {
      setZakladniUdaje(prev => ({
        ...prev,
        smena,
        cas_od: smenaInfo.cas_od,
        cas_do: smenaInfo.cas_do
      }));
    }
  };

  const pokracovatDalsi = () => {
    const chyby = validateStep(krok);
    setValidacniChyby(chyby);
    
    if (chyby.length === 0 && krok < 4) {
      setKrok((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const vratitZpet = () => {
    setValidacniChyby([]);
    if (krok > 1) {
      setKrok((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const pridatZaznam = () => {
    const chyby: string[] = [];
    
    if (!novyZaznam.cislo_zakazky.trim()) chyby.push('Zadejte číslo zakázky');
    if (!novyZaznam.popis_zakazky.trim()) chyby.push('Zadejte popis zakázky');
    if (!novyZaznam.pec) chyby.push('Vyberte pec');
    if (novyZaznam.cislo_zakazky.length < 3) chyby.push('Číslo zakázky musí mít alespoň 3 znaky');
    if (novyZaznam.popis_zakazky.length < 5) chyby.push('Popis zakázky musí mít alespoň 5 znaků');
    
    if (chyby.length > 0) {
      alert('Chyby ve formuláři:\n' + chyby.join('\n'));
      return;
    }

    const zaznam: PracovniZaznam = {
      id: Date.now(),
      datum: zakladniUdaje.datum,
      cas_od: zakladniUdaje.cas_od,
      cas_do: zakladniUdaje.cas_do,
      cislo_zakazky: novyZaznam.cislo_zakazky,
      popis_zakazky: novyZaznam.popis_zakazky,
      pec: novyZaznam.pec,
      cinnost: '', // Prázdná hodnota protože pole bylo odstraněno
      poznamky: novyZaznam.poznamky
    };
    
    setZaznamy([...zaznamy, zaznam]);
    setNovyZaznam({
      cislo_zakazky: '',
      popis_zakazky: '',
      pec: '',
      cinnost: '',
      poznamky: ''
    });
  };

  const dokoncitAUlozit = async () => {
    const chyby = validateStep(4);
    setValidacniChyby(chyby);
    
    if (chyby.length > 0) {
      return;
    }

    try {
      // Vytvoření kompletního deníku
      const ulozenyDenik: UlozenyDenik = {
        id: generovatId(),
        zakladniUdaje,
        zaznamy,
        instrukce: [], // Prázdné pole, instrukce se zobrazují ze statických dat nebo poznámek technologa
        potvrzeni,
        podpisy,
        vytvoren: formatDatumCas()
      };

      // Uložení do localStorage
      ulozitDenik(ulozenyDenik);

      // Export do PDF
      await exportDovatPDF(ulozenyDenik);
      
      alert('Pracovní deník byl úspěšně dokončen a exportován do PDF!');
      
      // Reset formuláře
      resetFormular();
      
    } catch (error) {
      console.error('Chyba při dokončování deníku:', error);
      alert('Deník byl uložen, ale export do PDF se nezdařil. Zkuste to prosím znovu.');
    }
  };

  const resetFormular = () => {
    setKrok(1);
    setZakladniUdaje({
      technologie: '',
      smena: '',
      vedouci_smeny: '',
      obsluha_linky: '',
      datum: new Date().toISOString().split('T')[0],
      cas_od: '',
      cas_do: '',
      poznamky_vedouciho: ''
    });
    setZaznamy([]);
    setNovyZaznam({
      cislo_zakazky: '',
      popis_zakazky: '',
      pec: '',
      cinnost: '',
      poznamky: ''
    });
    setPotvrzeni({
      smenu_predal: '',
      smenu_prevzal: ''
    });
    setPodpisy({
      predal: '',
      prevzal: ''
    });
    setValidacniChyby([]);
  };

  const formatDatum = (datum: string): string => {
    return new Date(datum).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Funkce pro kreslení podpisů
  const startDrawing = (canvas: HTMLCanvasElement, e: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
    }
  };

  const draw = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: MouseEvent) => {
    const canvas = e.target as HTMLCanvasElement;
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    
    // Uložení podpisu jako base64
    const dataURL = canvas.toDataURL();
    if (canvas === canvasPredal.current) {
      setPodpisy(prev => ({ ...prev, predal: dataURL }));
    } else if (canvas === canvasPrevzal.current) {
      setPodpisy(prev => ({ ...prev, prevzal: dataURL }));
    }
  };

  const clearSignature = (type: 'predal' | 'prevzal') => {
    const canvas = type === 'predal' ? canvasPredal.current : canvasPrevzal.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPodpisy(prev => ({ ...prev, [type]: '' }));
      }
    }
  };

  const renderKrok1 = () => (
    <StepWrapper stepNumber={1} title="Výběr technologie">
      <ErrorDisplay errors={validacniChyby} />
      
      <div className="grid grid-cols-2 gap-4">
        {TECHNOLOGIE.map((tech) => (
          <button
            key={tech}
            onClick={() => setZakladniUdaje(prev => ({ ...prev, technologie: tech }))}
            className={`p-6 border-2 rounded-lg text-xl font-semibold transition-all ${
              zakladniUdaje.technologie === tech
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>
      
      {/* Tlačítko pro návrat k aktuálnímu deníku */}
      {zakladniUdaje.technologie && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <p className="text-blue-700 text-sm mb-3">
              💡 Už máte rozpracovaný deník pro technologii <strong>{zakladniUdaje.technologie}</strong>?
            </p>
            <button
              onClick={nacistAktualniDenik}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors mr-4"
            >
              📋 Vrátit se k aktuálnímu deníku
            </button>
            <span className="text-gray-500 text-xs">nebo pokračujte v novém deníku ↓</span>
          </div>
        </div>
      )}
      
      {zakladniUdaje.technologie && (
        <div className="mt-8 text-center">
          <button
            onClick={pokracovatDalsi}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Pokračovat →
          </button>
        </div>
      )}
    </StepWrapper>
  );

  const renderKrok2 = () => (
    <StepWrapper stepNumber={2} title="Nastavení směny a personálu" maxWidth="3xl">
      <ErrorDisplay errors={validacniChyby} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Směna */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Směna <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {getSmenyProDatum(zakladniUdaje.datum).map((smena) => (
              <button
                key={smena.nazev}
                onClick={() => handleSmenaChange(smena.nazev as TypSmeny)}
                className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                  zakladniUdaje.smena === smena.nazev
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">{smena.nazev}</div>
                <div className="text-sm text-gray-600">{smena.cas_od} - {smena.cas_do}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Personál */}
        <div className="space-y-4">
          <FormInput
            label="Vedoucí směny"
            required
            type="text"
            value={zakladniUdaje.vedouci_smeny}
            onChange={(e) => handleVedouciSmenyChange(e.target.value)}
            placeholder="Jméno vedoucího směny"
          />

          <FormTextArea
            label="Obsluha linky"
            required
            value={zakladniUdaje.obsluha_linky}
            onChange={(e) => setZakladniUdaje(prev => ({ ...prev, obsluha_linky: e.target.value }))}
            placeholder="Jména obsluhy linky&#10;(každé jméno na nový řádek)&#10;např.:&#10;Jan Novák&#10;Marie Svobodová"
            rows={4}
          />
        </div>
      </div>

      {/* Datum a čas */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Přehled:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Technologie:</strong> {zakladniUdaje.technologie}</div>
          <div><strong>Datum:</strong> {formatDatum(zakladniUdaje.datum)}</div>
          <div><strong>Směna:</strong> {zakladniUdaje.smena}</div>
          <div><strong>Čas:</strong> {zakladniUdaje.cas_od} - {zakladniUdaje.cas_do}</div>
        </div>
      </div>

      <NavigationButtons
        onBack={vratitZpet}
        onNext={pokracovatDalsi}
      />
    </StepWrapper>
  );

  const renderKrok3 = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Hlavička s instrukcemi */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-gray-300">
          <div className="text-center border-b-2 border-gray-400 pb-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                PRACOVNÍ DENÍK - {zakladniUdaje.technologie}
              </h1>
              {predchadzajuciDenik && (
                <button
                  onClick={() => setZobrazitNahlad(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  👁️ Náhled předchozí směny
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-800">
              <div><strong className="text-gray-900">Datum:</strong> <span className="text-gray-800">{formatDatum(zakladniUdaje.datum)}</span></div>
              <div><strong className="text-gray-900">Směna:</strong> <span className="text-gray-800">{zakladniUdaje.smena} ({zakladniUdaje.cas_od}-{zakladniUdaje.cas_do})</span></div>
              <div><strong className="text-gray-900">Vedoucí:</strong> <span className="text-gray-800">{zakladniUdaje.vedouci_smeny}</span></div>
              <div><strong className="text-gray-900">Obsluha:</strong> <span className="text-gray-800">{zakladniUdaje.obsluha_linky.split('\n').join(', ')}</span></div>
            </div>
          </div>
          
          {/* Poznámky technologa */}
          {technologovePoznamky.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Poznámky od technologa:</h3>
              {technologovePoznamky.map((poznamka) => (
                <div key={poznamka.id} className="text-blue-700 mb-2 p-2 bg-white rounded border-l-2 border-blue-300">
                  <div className="font-medium text-sm text-blue-600 mb-1">
                    {poznamka.autor} - {formatDatum(poznamka.datum)}
                  </div>
                  <div className="whitespace-pre-wrap">{poznamka.poznamka}</div>
                </div>
              ))}
            </div>
          )}

          {/* Automatická upozornění */}
          {getAutomatickeUpozorneni().length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Důležitá upozornění:</h3>
              {getAutomatickeUpozorneni().map((upozorneni, index) => (
                <div key={index} className="text-red-700 font-medium py-1">
                  {upozorneni}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Poznámky vedoucího směny */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            📝 Poznámky vedoucího směny
          </h2>
          <div>
            <textarea
              value={zakladniUdaje.poznamky_vedouciho || ''}
              onChange={(e) => setZakladniUdaje(prev => ({ ...prev, poznamky_vedouciho: e.target.value }))}
              placeholder="Zvláštní pokyny, důležité informace pro směnu, změny v provozu..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400 resize-vertical"
            />
            <p className="text-sm text-gray-600 mt-2">
              💡 Tyto poznámky se zobrazí v pracovním deníku a budou součástí PDF exportu
            </p>
          </div>
        </div>

        {/* Formulář pro nový záznam */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            Nový záznam práce
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Číslo výrobní zakázky <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={novyZaznam.cislo_zakazky}
                onChange={(e) => setNovyZaznam({...novyZaznam, cislo_zakazky: e.target.value})}
                placeholder="např. VZ12345"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Popis zakázky <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={novyZaznam.popis_zakazky}
                onChange={(e) => setNovyZaznam({...novyZaznam, popis_zakazky: e.target.value})}
                placeholder="Název/popis zakázky"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pec <span className="text-red-500">*</span>
              </label>
              <select
                value={novyZaznam.pec}
                onChange={(e) => setNovyZaznam({...novyZaznam, pec: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900"
              >
                <option value="" className="text-blue-400">Vyberte pec</option>
                {zakladniUdaje.technologie && PECE[zakladniUdaje.technologie] && PECE[zakladniUdaje.technologie].map(pec => (
                  <option key={pec} value={pec} className="text-blue-900">{pec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Poznámky</label>
              <textarea
                value={novyZaznam.poznamky}
                onChange={(e) => setNovyZaznam({...novyZaznam, poznamky: e.target.value})}
                placeholder="Další poznámky, problémy, atd..."
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-blue-900 placeholder-blue-400"
              />
            </div>
          </div>

          <button
            onClick={pridatZaznam}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Přidat záznam
          </button>
        </div>

        {/* Tabulka záznamů */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 mb-6">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold text-gray-800">
              Záznamy práce ({zaznamy.length})
            </h2>
          </div>
          
          {zaznamy.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">Zatím nemáte žádné záznamy</p>
              <p className="text-sm">Přidejte svůj první záznam výše</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Číslo zakázky</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Popis zakázky</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Pec</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">Poznámky</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider print-hidden">Akce</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {zaznamy.map((zaznam, index) => (
                    <tr key={zaznam.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-900 border-r border-gray-200">
                        {zaznam.cislo_zakazky}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-900 border-r border-gray-200">
                        {zaznam.popis_zakazky}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-900 border-r border-gray-200">
                        {zaznam.pec}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-900 border-r border-gray-200 max-w-xs">
                        <div className="truncate" title={zaznam.poznamky}>
                          {zaznam.poznamky || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium print-hidden">
                        <button
                          onClick={() => setZaznamy(zaznamy.filter(z => z.id !== zaznam.id))}
                          className="text-red-600 hover:text-red-900 transition-colors font-medium"
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <NavigationButtons
          onBack={vratitZpet}
          onNext={pokracovatDalsi}
          nextLabel="K potvrzení →"
          nextColor="green"
        />
      </div>
    </div>
  );

  const renderKrok4 = () => (
    <StepWrapper stepNumber={4} title="Potvrzení a předání směny" maxWidth="4xl">      
      {/* Přehled směny */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Přehled směny</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><strong>Technologie:</strong> {zakladniUdaje.technologie}</div>
          <div><strong>Datum:</strong> {formatDatum(zakladniUdaje.datum)}</div>
          <div><strong>Směna:</strong> {zakladniUdaje.smena}</div>
          <div><strong>Čas:</strong> {zakladniUdaje.cas_od} - {zakladniUdaje.cas_do}</div>
          <div><strong>Vedoucí:</strong> {zakladniUdaje.vedouci_smeny}</div>
          <div><strong>Obsluha:</strong> {zakladniUdaje.obsluha_linky.split('\n').join(', ')}</div>
          <div><strong>Počet záznamů:</strong> {zaznamy.length}</div>
          <div><strong>Status:</strong> <span className="text-green-600 font-semibold">Připraven k potvrzení</span></div>
        </div>
      </div>

      {/* Formulář potvrzení */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border-2 border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">📤 SMĚNU PŘEDAL</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jméno a podpis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={potvrzeni.smenu_predal}
                onChange={(e) => setPotvrzeni(prev => ({ ...prev, smenu_predal: e.target.value }))}
                placeholder="Jméno osoby, která předává směnu"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 placeholder-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Podpis myší (nepovinné)
              </label>
              <canvas
                ref={canvasPredal}
                width={300}
                height={80}
                onMouseDown={(e) => canvasPredal.current && startDrawing(canvasPredal.current, e)}
                className="border-2 border-dashed border-gray-300 rounded-md cursor-crosshair bg-white"
                style={{ touchAction: 'none' }}
              />
              <button
                onClick={() => clearSignature('predal')}
                className="mt-1 text-xs text-red-600 hover:text-red-800"
              >
                Vymazat podpis
              </button>
            </div>
            <div className="text-xs text-gray-600">
              Čas předání: {new Date().toLocaleTimeString('cs-CZ')}
            </div>
          </div>
        </div>

        <div className="border-2 border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-4">📥 SMĚNU PŘEVZAL</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jméno a podpis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={potvrzeni.smenu_prevzal}
                onChange={(e) => setPotvrzeni(prev => ({ ...prev, smenu_prevzal: e.target.value }))}
                placeholder="Jméno osoby, která přebírá směnu"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-blue-900 placeholder-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Podpis myší (nepovinné)
              </label>
              <canvas
                ref={canvasPrevzal}
                width={300}
                height={80}
                onMouseDown={(e) => canvasPrevzal.current && startDrawing(canvasPrevzal.current, e)}
                className="border-2 border-dashed border-gray-300 rounded-md cursor-crosshair bg-white"
                style={{ touchAction: 'none' }}
              />
              <button
                onClick={() => clearSignature('prevzal')}
                className="mt-1 text-xs text-red-600 hover:text-red-800"
              >
                Vymazat podpis
              </button>
            </div>
            <div className="text-xs text-gray-600">
              Čas převzetí: {new Date().toLocaleTimeString('cs-CZ')}
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        onBack={vratitZpet}
        onNext={dokoncitAUlozit}
        nextLabel="🖨️ Dokončit a exportovat PDF"
        nextColor="green"
        showNext={potvrzeni.smenu_predal && potvrzeni.smenu_prevzal}
      />
    </StepWrapper>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {zobrazeniRezim === 'technolog' && technologOveren && (
        <TechnologInterface 
          onClose={navratitDoHlavnihoRozhrani} 
          onBackToCurrentDiary={navratitKAktualnimuDeniku}
        />
      )}
      
      {zobrazeniRezim === 'statistiky' && (
        <Statistiky onClose={() => setZobrazeniRezim('denik')} />
      )}
      
      {zobrazeniRezim === 'denik' && (
        <div className="print-hidden">
          <div className="container mx-auto p-6">
            {/* Hlavní navigace */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/logo-new.png" 
                      alt="Logo firmy" 
                      className="h-12 w-auto object-contain"
                    />
                    <h1 className="text-3xl font-bold text-gray-800">
                      📋 Pracovní deník
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={overitTechnologaHeslo}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      🔧 Rozhraní technologa
                    </button>
                    <button
                      onClick={() => setZobrazeniRezim('statistiky')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📊 Statistiky
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      step <= krok ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-20 h-1 mx-2 ${
                        step < krok ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Technologie</span>
                <span>Směna & Personál</span>
                <span>Pracovní deník</span>
                <span>Potvrzení</span>
              </div>
            </div>

            {/* Render aktuálního kroku */}
            {krok === 1 && renderKrok1()}
            {krok === 2 && renderKrok2()}
            {krok === 3 && renderKrok3()}
            {krok === 4 && renderKrok4()}
          </div>
        </div>
      )}

      {/* Dialog pro zadání hesla technologa */}
      {zobrazitHesloDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🔒 Ověření technologa
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              Pro přístup do rozhraní technologa je vyžadováno heslo.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heslo <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={zadaneHeslo}
                onChange={(e) => setZadaneHeslo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    potvrditHeslo();
                  } else if (e.key === 'Escape') {
                    zrusitHesloDialog();
                  }
                }}
                placeholder="Zadejte heslo..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={zrusitHesloDialog}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={potvrditHeslo}
                className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Potvrdit
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Tip: Stiskněte Enter pro potvrzení nebo Escape pro zrušení
            </p>
          </div>
        </div>
      )}

      {/* Modal pre náhľad predchádzajúceho deníku */}
      {zobrazitNahlad && predchadzajuciDenik && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 Náhled předchozího deníku
              </h2>
              <button
                onClick={() => setZobrazitNahlad(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ✕ Zavřít
              </button>
            </div>
            
            <div className="p-6">
              {/* Základní údaje predchádzajúceho deníku */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  📊 Základní údaje
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-800">
                  <div><strong className="text-gray-900">Datum:</strong> <span className="text-gray-800">{formatDatum(predchadzajuciDenik.zakladniUdaje.datum)}</span></div>
                  <div><strong className="text-gray-900">Technologie:</strong> <span className="text-gray-800">{predchadzajuciDenik.zakladniUdaje.technologie}</span></div>
                  <div><strong className="text-gray-900">Směna:</strong> <span className="text-gray-800">{predchadzajuciDenik.zakladniUdaje.smena} ({predchadzajuciDenik.zakladniUdaje.cas_od}-{predchadzajuciDenik.zakladniUdaje.cas_do})</span></div>
                  <div><strong className="text-gray-900">Vedoucí:</strong> <span className="text-gray-800">{predchadzajuciDenik.zakladniUdaje.vedouci_smeny}</span></div>
                </div>
                <div className="mt-2 text-gray-800">
                  <strong className="text-gray-900">Obsluha:</strong> <span className="text-gray-800">{predchadzajuciDenik.zakladniUdaje.obsluha_linky.split('\n').join(', ')}</span>
                </div>
              </div>

              {/* Záznamy predchádzajúceho deníku */}
              {predchadzajuciDenik.zaznamy.length > 0 && (
                <div className="bg-white border rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    📝 Záznamy práce
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left border-b font-semibold text-gray-900">Číslo zakázky</th>
                          <th className="p-2 text-left border-b font-semibold text-gray-900">Popis</th>
                          <th className="p-2 text-left border-b font-semibold text-gray-900">Pec</th>
                          <th className="p-2 text-left border-b font-semibold text-gray-900">Poznámky</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predchadzajuciDenik.zaznamy.map((zaznam, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="p-2 border-b text-gray-800">{zaznam.cislo_zakazky}</td>
                            <td className="p-2 border-b text-gray-800">{zaznam.popis_zakazky}</td>
                            <td className="p-2 border-b text-gray-800">{zaznam.pec}</td>
                            <td className="p-2 border-b text-gray-800">{zaznam.poznamky || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Potvrzení predchádzajúceho deníku */}
              <div className="bg-green-50 border rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  ✅ Potvrzení směny
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Směnu předal:</strong> {predchadzajuciDenik.potvrzeni.smenu_predal}
                  </div>
                  <div>
                    <strong>Směnu převzal:</strong> {predchadzajuciDenik.potvrzeni.smenu_prevzal}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Vytvořeno: {formatDatum(predchadzajuciDenik.zakladniUdaje.datum)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
