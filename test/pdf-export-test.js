// Test script pro testování PDF exportu s diakritikou
import { exportDovatPDF } from '../src/lib/pdf';
import { UlozenyDenik } from '../src/types';

// Test data s českými znaky
const testDenik: UlozenyDenik = {
  id: 'test-1',
  zakladniUdaje: {
    datum: new Date().toISOString(),
    technologie: 'Žíhání - test českých znaků',
    smena: 'Ranní',
    cas_od: '06:00',
    cas_do: '14:00',
    vedouci_smeny: 'Jan Novák',
    obsluha_linky: 'Petr Svoboda\nJaroslav Dvořák'
  },
  zaznamy: [
    {
      id: '1',
      cislo_zakazky: 'VZ-123',
      popis_zakazky: 'Žíhání součástek - test diakritiky',
      pec: 'PEC-1',
      poznamky: 'Vše v pořádku - žádné problémy',
      cas_pridani: new Date().toISOString()
    },
    {
      id: '2',
      cislo_zakazky: 'VZ-456',
      popis_zakazky: 'Tepelné zpracování - češtinačřžýáíéúů',
      pec: 'PEC-2',
      poznamky: 'Pozor na teplotu při začátku cyklu',
      cas_pridani: new Date().toISOString()
    }
  ],
  potvrzeni: {
    smenu_predal: 'Josef Novotný',
    smenu_prevzal: 'František Procházka',
    datum_predani: new Date().toISOString()
  }
};

console.log('Test PDF export s diakritikou připraven!');
console.log('Pro test použijte webovou aplikaci a exportujte tento deník.');
