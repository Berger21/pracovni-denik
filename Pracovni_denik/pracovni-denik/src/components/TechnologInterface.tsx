'use client';

import { useState, useEffect } from 'react';
import { TehnologovePoznaky, TypSmeny, TypTechnologie } from '@/types';
import { 
  ulozitTehnologovuPoznamku, 
  nacistTehnologovePoznamky, 
  smazatTehnologovuPoznamku,
  generovatId,
  formatDatumCas 
} from '@/lib/storage';

const SMENY: TypSmeny[] = ['ranní', 'odpolední', 'noční', 'denní'];
const TECHNOLOGIE: TypTechnologie[] = ['SOLO500', 'IPSEN', 'VAKUUM', 'P.K'];

interface TechnologInterfaceProps {
  onClose: () => void;
  onBackToCurrentDiary?: () => void;
}

export default function TechnologInterface({ onClose, onBackToCurrentDiary }: TechnologInterfaceProps) {
  const [poznamky, setPoznamky] = useState<TehnologovePoznaky[]>([]);
  const [novaPoznamka, setNovaPoznamka] = useState({
    datum: new Date().toISOString().split('T')[0],
    smena: '' as TypSmeny | '',
    technologie: '' as TypTechnologie | '',
    poznamka: ''
  });
  const [editovanaId, setEditovanaId] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    datum: '',
    smena: '' as TypSmeny | '',
    technologie: '' as TypTechnologie | ''
  });

  useEffect(() => {
    nactiPoznamky();
  }, []);

  const nactiPoznamky = () => {
    const nactenePoznamky = nacistTehnologovePoznamky();
    setPoznamky(nactenePoznamky.sort((a, b) => new Date(b.vytvoren).getTime() - new Date(a.vytvoren).getTime()));
  };

  const ulozitPoznamku = () => {
    if (!novaPoznamka.datum || !novaPoznamka.smena || !novaPoznamka.technologie || 
        !novaPoznamka.poznamka.trim()) {
      alert('Vyplňte všechna povinná pole');
      return;
    }

    const poznamka: TehnologovePoznaky = {
      id: editovanaId || generovatId(),
      datum: novaPoznamka.datum,
      smena: novaPoznamka.smena as TypSmeny,
      technologie: novaPoznamka.technologie as TypTechnologie,
      poznamka: novaPoznamka.poznamka,
      autor: 'Technolog', // Výchozí hodnota místo pole
      vytvoren: editovanaId ? 
        poznamky.find(p => p.id === editovanaId)?.vytvoren || formatDatumCas() : 
        formatDatumCas()
    };

    ulozitTehnologovuPoznamku(poznamka);
    nactiPoznamky();
    resetFormular();
  };

  const resetFormular = () => {
    setNovaPoznamka({
      datum: new Date().toISOString().split('T')[0],
      smena: '',
      technologie: '',
      poznamka: ''
    });
    setEditovanaId(null);
  };

  const editovatPoznamku = (poznamka: TehnologovePoznaky) => {
    setNovaPoznamka({
      datum: poznamka.datum,
      smena: poznamka.smena,
      technologie: poznamka.technologie,
      poznamka: poznamka.poznamka
    });
    setEditovanaId(poznamka.id);
  };

  const smazatPoznamku = (id: string) => {
    if (confirm('Opravdu chcete smazat tuto poznámku?')) {
      smazatTehnologovuPoznamku(id);
      nactiPoznamky();
    }
  };

  const filtrovaePoznamky = poznamky.filter(p => {
    return (!filter.datum || p.datum === filter.datum) &&
           (!filter.smena || p.smena === filter.smena) &&
           (!filter.technologie || p.technologie === filter.technologie);
  });

  const formatDatum = (datum: string): string => {
    return new Date(datum).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDatumCas2 = (datumCas: string): string => {
    return new Date(datumCas).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hlavička */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              🔧 Rozhraní pro technologa
            </h1>
            <div className="flex gap-3">
              {onBackToCurrentDiary && (
                <button
                  onClick={onBackToCurrentDiary}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📋 Zpět k aktuálnímu deníku
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Zpět na deník
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Zde můžete vytvářet poznámky pro jednotlivé směny, které se zobrazí operátorům při vytváření pracovního deníku.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulář pro novou poznámku */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editovanaId ? 'Upravit poznámku' : 'Nová poznámka pro směnu'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Datum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={novaPoznamka.datum}
                    onChange={(e) => setNovaPoznamka(prev => ({ ...prev, datum: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Směna <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={novaPoznamka.smena}
                    onChange={(e) => setNovaPoznamka(prev => ({ ...prev, smena: e.target.value as TypSmeny }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-500">Vyberte směnu</option>
                    {SMENY.map(smena => (
                      <option key={smena} value={smena} className="text-gray-900">{smena}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Technologie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={novaPoznamka.technologie}
                    onChange={(e) => setNovaPoznamka(prev => ({ ...prev, technologie: e.target.value as TypTechnologie }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  >
                    <option value="" className="text-gray-500">Vyberte technologii</option>
                    {TECHNOLOGIE.map(tech => (
                      <option key={tech} value={tech} className="text-gray-900">{tech}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Poznámka <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={novaPoznamka.poznamka}
                  onChange={(e) => setNovaPoznamka(prev => ({ ...prev, poznamka: e.target.value }))}
                  placeholder="Důležitá poznámka pro operátory..."
                  rows={5}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical text-gray-900 bg-white placeholder-gray-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={ulozitPoznamku}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md"
                >
                  {editovanaId ? '✏️ Upravit poznámku' : '💾 Uložit poznámku'}
                </button>
                {editovanaId && (
                  <button
                    onClick={resetFormular}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                  >
                    ❌ Zrušit úpravy
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Seznam poznámek s filtrem */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Existující poznámky ({filtrovaePoznamky.length})
            </h2>

            {/* Vylepšené filtry s lepší čitelností */}
            <div className="grid grid-cols-3 gap-2 mb-4 p-4 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Filtr podle data</label>
                <input
                  type="date"
                  value={filter.datum}
                  onChange={(e) => setFilter(prev => ({ ...prev, datum: e.target.value }))}
                  className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Filtr podle směny</label>
                <select
                  value={filter.smena}
                  onChange={(e) => setFilter(prev => ({ ...prev, smena: e.target.value as TypSmeny }))}
                  className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Všechny směny</option>
                  {SMENY.map(smena => (
                    <option key={smena} value={smena} className="text-gray-900">{smena}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Filtr podle technologie</label>
                <select
                  value={filter.technologie}
                  onChange={(e) => setFilter(prev => ({ ...prev, technologie: e.target.value as TypTechnologie }))}
                  className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="" className="text-gray-500">Všechny technologie</option>
                  {TECHNOLOGIE.map(tech => (
                    <option key={tech} value={tech} className="text-gray-900">{tech}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filtrovaePoznamky.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Žádné poznámky nenalezeny</p>
                </div>
              ) : (
                filtrovaePoznamky.map((poznamka) => (
                  <div key={poznamka.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {formatDatum(poznamka.datum)}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          {poznamka.smena}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                          {poznamka.technologie}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editovatPoznamku(poznamka)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Upravit
                        </button>
                        <button
                          onClick={() => smazatPoznamku(poznamka.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                        >
                          Smazat
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-800 text-sm mb-2 whitespace-pre-wrap">
                      {poznamka.poznamka}
                    </div>
                    <div className="text-xs text-gray-500">
                      Autor: {poznamka.autor} • Vytvořeno: {formatDatumCas2(poznamka.vytvoren)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
