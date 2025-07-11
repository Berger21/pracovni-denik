'use client';

import { useState, useEffect } from 'react';
import { UlozenyDenik, ZaznamStatistiky, TypSmeny, TypTechnologie } from '@/types';
import { nacistDeniky, nacistStatistiky, ulozitStatistiky } from '@/lib/storage';
import { exportDovatPDF } from '@/lib/pdf';

interface StatistikyProps {
  onClose: () => void;
}

export default function Statistiky({ onClose }: StatistikyProps) {
  const [deniky, setDeniky] = useState<UlozenyDenik[]>([]);
  const [statistiky, setStatistiky] = useState<ZaznamStatistiky | null>(null);
  const [filter, setFilter] = useState({
    datumOd: '',
    datumDo: '',
    technologie: '' as TypTechnologie | '',
    smena: '' as TypSmeny | ''
  });

  useEffect(() => {
    nactiData();
  }, []);

  useEffect(() => {
    vypocitejStatistiky();
  }, [deniky, filter]);

  const nactiData = () => {
    const nacteneDeniky = nacistDeniky();
    setDeniky(nacteneDeniky);
    
    const nactteneStatistiky = nacistStatistiky();
    setStatistiky(nactteneStatistiky);
  };

  const vypocitejStatistiky = () => {
    const filtrovaeDeniky = deniky.filter(d => {
      const datum = new Date(d.zakladniUdaje.datum);
      const datumOd = filter.datumOd ? new Date(filter.datumOd) : null;
      const datumDo = filter.datumDo ? new Date(filter.datumDo) : null;
      
      return (!datumOd || datum >= datumOd) &&
             (!datumDo || datum <= datumDo) &&
             (!filter.technologie || d.zakladniUdaje.technologie === filter.technologie) &&
             (!filter.smena || d.zakladniUdaje.smena === filter.smena);
    });

    const stats: ZaznamStatistiky = {
      celkovyPocet: filtrovaeDeniky.length,
      celkovyCas: 0,
      smeny: { 'ranní': 0, 'odpolední': 0, 'noční': 0 },
      denni: {},
      zakazky: {},
      technologie: { 'SOLO500': 0, 'IPSEN': 0, 'VAKUUM': 0, 'P.K': 0 },
      posledniAktivita: filtrovaeDeniky.length > 0 ? 
        filtrovaeDeniky.sort((a, b) => new Date(b.vytvoren).getTime() - new Date(a.vytvoren).getTime())[0].vytvoren :
        new Date().toISOString()
    };

    filtrovaeDeniky.forEach(denik => {
      // Počítání směn
      if (denik.zakladniUdaje.smena) {
        stats.smeny[denik.zakladniUdaje.smena as TypSmeny]++;
      }

      // Počítání technologií
      if (denik.zakladniUdaje.technologie) {
        stats.technologie[denik.zakladniUdaje.technologie as TypTechnologie]++;
      }

      // Počítání podle datumů
      const datum = denik.zakladniUdaje.datum;
      stats.denni[datum] = (stats.denni[datum] || 0) + 1;

      // Analýza zakázek
      denik.zaznamy.forEach(zaznam => {
        const zakazka = zaznam.cislo_zakazky;
        stats.zakazky[zakazka] = (stats.zakazky[zakazka] || 0) + 1;
        
        // Výpočet času (zjednodušený)
        const casOd = new Date(`2000-01-01T${denik.zakladniUdaje.cas_od}`);
        const casDo = new Date(`2000-01-01T${denik.zakladniUdaje.cas_do}`);
        let rozdil = (casDo.getTime() - casOd.getTime()) / (1000 * 60 * 60); // hodiny
        
        // Pokud je cas_do menší než cas_od, jde o noční směnu
        if (rozdil < 0) {
          rozdil += 24;
        }
        
        stats.celkovyCas += rozdil;
      });
    });

    setStatistiky(stats);
    ulozitStatistiky(stats);
  };

  const exportStatistikDoPDF = async () => {
    try {
      await exportElementDovatPDF('statistiky-obsah', `Statistiky_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Chyba při exportu statistik:', error);
      alert('Chyba při exportu do PDF');
    }
  };

  const formatDatum = (datum: string): string => {
    return new Date(datum).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDatumCas = (datumCas: string): string => {
    return new Date(datumCas).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nejaktivnejsiZakazky = statistiky ? 
    Object.entries(statistiky.zakazky)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) : [];

  const nejaktivnejsiDny = statistiky ?
    Object.entries(statistiky.denni)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) : [];

  const exportElementDovatPDF = async (elementId: string, fileName: string): Promise<void> => {
    // Implementace je stejná jako v pdf.ts, ale importovaná funkce
    const { exportElementDovatPDF } = await import('@/lib/pdf');
    return exportElementDovatPDF(elementId, fileName);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hlavička */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              📊 Statistiky a reporty
            </h1>
            <div className="flex gap-2">
              <button
                onClick={exportStatistikDoPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 Export PDF
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Zpět
              </button>
            </div>
          </div>
        </div>

        {/* Filtry */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filtry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Datum od
              </label>
              <input
                type="date"
                value={filter.datumOd}
                onChange={(e) => setFilter(prev => ({ ...prev, datumOd: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Datum do
              </label>
              <input
                type="date"
                value={filter.datumDo}
                onChange={(e) => setFilter(prev => ({ ...prev, datumDo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Technologie
              </label>
              <select
                value={filter.technologie}
                onChange={(e) => setFilter(prev => ({ ...prev, technologie: e.target.value as TypTechnologie }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Všechny</option>
                <option value="SOLO500">SOLO500</option>
                <option value="IPSEN">IPSEN</option>
                <option value="VAKUUM">VAKUUM</option>
                <option value="P.K">P.K</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Směna
              </label>
              <select
                value={filter.smena}
                onChange={(e) => setFilter(prev => ({ ...prev, smena: e.target.value as TypSmeny }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Všechny</option>
                <option value="ranní">Ranní</option>
                <option value="odpolední">Odpolední</option>
                <option value="noční">Noční</option>
              </select>
            </div>
          </div>
        </div>

        {/* Obsah statistik */}
        <div id="statistiky-obsah">
          {/* Přehledové karty */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Celkem deníků</h3>
              <p className="text-3xl font-bold">{statistiky?.celkovyPocet || 0}</p>
            </div>
            <div className="bg-green-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Celkem hodin</h3>
              <p className="text-3xl font-bold">{statistiky?.celkovyCas.toFixed(1) || 0}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Jedinečných zakázek</h3>
              <p className="text-3xl font-bold">{statistiky ? Object.keys(statistiky.zakazky).length : 0}</p>
            </div>
            <div className="bg-orange-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Poslední aktivita</h3>
              <p className="text-sm font-bold">
                {statistiky ? formatDatum(statistiky.posledniAktivita.split('T')[0]) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistiky směn */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rozdělení podle směn</h2>
              <div className="space-y-3">
                {statistiky && Object.entries(statistiky.smeny).map(([smena, pocet]) => {
                  const procento = statistiky.celkovyPocet > 0 ? (pocet / statistiky.celkovyPocet * 100).toFixed(1) : 0;
                  return (
                    <div key={smena} className="flex justify-between items-center">
                      <span className="capitalize font-medium">{smena}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${procento}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{pocet} ({procento}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiky technologií */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rozdělení podle technologií</h2>
              <div className="space-y-3">
                {statistiky && Object.entries(statistiky.technologie).map(([tech, pocet]) => {
                  const procento = statistiky.celkovyPocet > 0 ? (pocet / statistiky.celkovyPocet * 100).toFixed(1) : 0;
                  return (
                    <div key={tech} className="flex justify-between items-center">
                      <span className="font-medium">{tech}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${procento}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{pocet} ({procento}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nejaktivnější zakázky */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nejčastější zakázky</h2>
              <div className="space-y-2">
                {nejaktivnejsiZakazky.map(([zakazka, pocet], index) => (
                  <div key={zakazka} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{zakazka}</span>
                    </div>
                    <span className="text-sm text-gray-600">{pocet}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nejaktivnější dny */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nejaktivnější dny</h2>
              <div className="space-y-2">
                {nejaktivnejsiDny.map(([datum, pocet], index) => (
                  <div key={datum} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{formatDatum(datum)}</span>
                    </div>
                    <span className="text-sm text-gray-600">{pocet} deníků</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seznam posledních deníků */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Poslední deníky</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Směna</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Technologie</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Vedoucí</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Záznamů</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Vytvořen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deniky
                    .filter(d => {
                      const datum = new Date(d.zakladniUdaje.datum);
                      const datumOd = filter.datumOd ? new Date(filter.datumOd) : null;
                      const datumDo = filter.datumDo ? new Date(filter.datumDo) : null;
                      
                      return (!datumOd || datum >= datumOd) &&
                             (!datumDo || datum <= datumDo) &&
                             (!filter.technologie || d.zakladniUdaje.technologie === filter.technologie) &&
                             (!filter.smena || d.zakladniUdaje.smena === filter.smena);
                    })
                    .sort((a, b) => new Date(b.vytvoren).getTime() - new Date(a.vytvoren).getTime())
                    .slice(0, 20)
                    .map((denik) => (
                    <tr key={denik.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{formatDatum(denik.zakladniUdaje.datum)}</td>
                      <td className="px-4 py-3 text-sm">{denik.zakladniUdaje.smena}</td>
                      <td className="px-4 py-3 text-sm">{denik.zakladniUdaje.technologie}</td>
                      <td className="px-4 py-3 text-sm">{denik.zakladniUdaje.vedouci_smeny}</td>
                      <td className="px-4 py-3 text-sm">{denik.zaznamy.length}</td>
                      <td className="px-4 py-3 text-sm">{formatDatumCas(denik.vytvoren)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
