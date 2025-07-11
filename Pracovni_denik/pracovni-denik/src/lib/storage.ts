// Utility funkce pro localStorage
import { UlozenyDenik, TehnologovePoznaky, UpozorneniPravidlo, ZaznamStatistiky } from '@/types';

const STORAGE_KEYS = {
  DENIKY: 'pracovni_deniky',
  TECHNOLOG_POZNAMKY: 'technolog_poznamky',
  UPOZORNENI: 'upozorneni_pravidla',
  STATISTIKY: 'statistiky'
} as const;

// Funkce pro práci s deníky
export const ulozitDenik = (denik: UlozenyDenik): void => {
  try {
    const deniky = nacistDeniky();
    const index = deniky.findIndex(d => d.id === denik.id);
    
    if (index >= 0) {
      deniky[index] = denik;
    } else {
      deniky.push(denik);
    }
    
    localStorage.setItem(STORAGE_KEYS.DENIKY, JSON.stringify(deniky));
  } catch (error) {
    console.error('Chyba při ukládání deníku:', error);
  }
};

export const nacistDeniky = (): UlozenyDenik[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DENIKY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při načítání deníků:', error);
    return [];
  }
};

export const smazatDenik = (id: string): void => {
  try {
    const deniky = nacistDeniky().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DENIKY, JSON.stringify(deniky));
  } catch (error) {
    console.error('Chyba při mazání deníku:', error);
  }
};

// Funkce pro poznámky technologa
export const ulozitTehnologovuPoznamku = (poznamka: TehnologovePoznaky): void => {
  try {
    const poznamky = nacistTehnologovePoznamky();
    const index = poznamky.findIndex(p => p.id === poznamka.id);
    
    if (index >= 0) {
      poznamky[index] = poznamka;
    } else {
      poznamky.push(poznamka);
    }
    
    localStorage.setItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY, JSON.stringify(poznamky));
  } catch (error) {
    console.error('Chyba při ukládání poznámky technologa:', error);
  }
};

export const nacistTehnologovePoznamky = (): TehnologovePoznaky[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při načítání poznámek technologa:', error);
    return [];
  }
};

export const najitPoznamkyProDatumASmenu = (datum: string, smena: string, technologie: string): TehnologovePoznaky[] => {
  const poznamky = nacistTehnologovePoznamky();
  return poznamky.filter(p => 
    p.datum === datum && 
    p.smena === smena && 
    p.technologie === technologie
  );
};

export const smazatTehnologovuPoznamku = (id: string): void => {
  try {
    const poznamky = nacistTehnologovePoznamky().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY, JSON.stringify(poznamky));
  } catch (error) {
    console.error('Chyba při mazání poznámky technologa:', error);
  }
};

// Funkce pro upozornění
export const ulozitUpozorneni = (upozorneni: UpozorneniPravidlo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.UPOZORNENI, JSON.stringify(upozorneni));
  } catch (error) {
    console.error('Chyba při ukládání upozornění:', error);
  }
};

export const nacistUpozorneni = (): UpozorneniPravidlo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UPOZORNENI);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při načítání upozornění:', error);
    return [];
  }
};

// Funkce pro statistiky
export const ulozitStatistiky = (statistiky: ZaznamStatistiky): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTIKY, JSON.stringify(statistiky));
  } catch (error) {
    console.error('Chyba při ukládání statistik:', error);
  }
};

export const nacistStatistiky = (): ZaznamStatistiky | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATISTIKY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Chyba při načítání statistik:', error);
    return null;
  }
};

// Funkce pro nalezení předchozího deníku podle směny
export const najitPredchadzajuciDenik = (aktualneTechnologie: string, aktualnyDatum: string, aktualnaSmena?: string): UlozenyDenik | null => {
  try {
    const deniky = nacistDeniky();
    
    // Filtrovanie deníkov pre danú technológiu
    const denikePodlaTechnologie = deniky.filter(d => d.zakladniUdaje.technologie === aktualneTechnologie);
    
    if (denikePodlaTechnologie.length === 0) {
      return null;
    }
    
    // Zoradenej podľa dátumu a času zostupne (najnovší prvý)
    const zoradenieDenikov = denikePodlaTechnologie.sort((a, b) => {
      const dateA = new Date(a.zakladniUdaje.datum);
      const dateB = new Date(b.zakladniUdaje.datum);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Ak je rovnaký dátum, zoradiť podľa času začiatku směny
      const timeA = a.zakladniUdaje.cas_od;
      const timeB = b.zakladniUdaje.cas_od;
      return timeB.localeCompare(timeA);
    });
    
    // Ak je zadaná konkrétna směna, hľadaj predchádzajúcu
    if (aktualnyDatum && aktualnaSmena) {
      const aktualnyDate = new Date(aktualnyDatum);
      
      // Definícia poradia směn
      const poradiesmen: Record<string, number> = {
        'ranní': 1,
        'denní': 1,    // Pre víkend
        'odpolední': 2,
        'noční': 3
      };
      
      const aktualnePoradie = poradiesmen[aktualnaSmena] || 0;
      
      // Najskôr hľadaj predchádzajúcu směnu v ten istý deň
      const dennikyVRovnakyDen = zoradenieDenikov.filter(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() === aktualnyDate.getTime();
      });
      
      for (const denik of dennikyVRovnakyDen) {
        const denikPoradie = poradiesmen[denik.zakladniUdaje.smena] || 0;
        if (denikPoradie < aktualnePoradie) {
          return denik;
        }
      }
      
      // Ak nenájdem v ten istý deň, hľadaj posledný z predchádzajúceho dňa
      const predchadzajuci = zoradenieDenikov.find(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() < aktualnyDate.getTime();
      });
      
      return predchadzajuci || null;
    }
    
    // Ak je len dátum bez směny, vrátiť posledný pred týmto dátumom
    if (aktualnyDatum) {
      const aktualnyDate = new Date(aktualnyDatum);
      const predchadzajuci = zoradenieDenikov.find(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() < aktualnyDate.getTime();
      });
      return predchadzajuci || null;
    }
    
    // Inak vrátiť najnovší
    return zoradenieDenikov[0] || null;
  } catch (error) {
    console.error('Chyba při hledání předchozího deníku:', error);
    return null;
  }
};

// Funkce pro nalezení rozpracovaného deníku (ještě nedokončeného)
export const najitRozpracovanyDenik = (technologie: string, datum: string): UlozenyDenik | null => {
  try {
    const deniky = nacistDeniky();
    
    // Filtrujeme podle technologie a data
    const denykyProDaneTechnologieADatum = deniky.filter(d => 
      d.zakladniUdaje.technologie === technologie && 
      d.zakladniUdaje.datum === datum
    );
    
    // Hledáme rozpracovaný deník (bez dokončených podpisů)
    const rozpracovanyDenik = denykyProDaneTechnologieADatum.find(d => 
      !d.potvrzeni.smenu_predal || !d.potvrzeni.smenu_prevzal
    );
    
    return rozpracovanyDenik || null;
  } catch (error) {
    console.error('Chyba při hledání rozpracovaného deníku:', error);
    return null;
  }
};

// Utility funkce
export const generovatId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDatumCas = (datum: Date = new Date()): string => {
  return datum.toISOString();
};
