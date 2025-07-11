// Utility funkce pro PDF export s podporou českých znaků
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UlozenyDenik } from '@/types';
import { najitPoznamkyProDatumASmenu } from './storage';

// Pomocné funkce pro formátování
const formatDatum = (datum: string): string => {
  const date = new Date(datum);
  return date.toLocaleDateString('cs-CZ');
};

const formatCas = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
};

const formatDatumCas = (): string => {
  const now = new Date();
  return now.toLocaleString('cs-CZ');
};

export const exportDovatPDFText = async (denik: UlozenyDenik): Promise<void> => {
  try {
    // Vytvoření nového PDF dokumentu
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Načtení loga
    let logoBase64: string | null = null;
    try {
      const logoResponse = await fetch('/logo-new.png');
      const logoBlob = await logoResponse.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      console.warn('Nepodařilo se načíst logo:', error);
    }
    
    // Nastavení fontu pro češtinu - použijeme Unicode podporu
    try {
      // Použijeme font s Unicode podporou
      pdf.setFont('helvetica', 'normal');
    } catch (error) {
      console.warn('Nepodařilo se nastavit font, použije se fallback');
    }
    
    // Vylepšená funkce pro české znaky s UTF-8 podporou
    const safeText = (text: string): string => {
      try {
        // Nejprve zkusíme text přímo s diakritikou
        // jsPDF v novějších verzích podporuje Unicode
        const testText = 'čřžýáíéúů';
        pdf.getStringUnitWidth(testText); // Test unicode podpory
        return text; // Pokud test prošel, použijeme originální text
      } catch (error) {
        // Fallback pouze pokud Unicode nefunguje
        console.warn('Unicode podpora není dostupná, používám fallback pro diakritiku');
        return text
          .replace(/á/g, 'a').replace(/Á/g, 'A')
          .replace(/č/g, 'c').replace(/Č/g, 'C')
          .replace(/ď/g, 'd').replace(/Ď/g, 'D')
          .replace(/é/g, 'e').replace(/É/g, 'E')
          .replace(/ě/g, 'e').replace(/Ě/g, 'E')
          .replace(/í/g, 'i').replace(/Í/g, 'I')
          .replace(/ň/g, 'n').replace(/Ň/g, 'N')
          .replace(/ó/g, 'o').replace(/Ó/g, 'O')
          .replace(/ř/g, 'r').replace(/Ř/g, 'R')
          .replace(/š/g, 's').replace(/Š/g, 'S')
          .replace(/ť/g, 't').replace(/Ť/g, 'T')
          .replace(/ú/g, 'u').replace(/Ú/g, 'U')
          .replace(/ů/g, 'u').replace(/Ů/g, 'U')
          .replace(/ý/g, 'y').replace(/Ý/g, 'Y')
          .replace(/ž/g, 'z').replace(/Ž/g, 'Z');
      }
    };
    
    // Hlavička s vylepšeným designem, logem a ohraničením
    pdf.setLineWidth(1.5);
    pdf.setDrawColor(50, 50, 50);
    pdf.rect(10, 10, pageWidth - 20, 45);
    
    // Gradient efekt pozadí hlavičky
    pdf.setFillColor(240, 240, 255);
    pdf.rect(10, 10, pageWidth - 20, 45, 'F');
    pdf.rect(10, 10, pageWidth - 20, 45, 'S');
    
    // Logo vlevo (pokud je dostupné)
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 15, 15, 20, 15);
      } catch (error) {
        console.warn('Nepodařilo se přidat logo do PDF:', error);
      }
    }
    
    // Text vpravo od loga
    const textStartX = logoBase64 ? 40 : pageWidth / 2;
    const textAlign = logoBase64 ? 'left' : 'center';
    
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 120);
    pdf.text(safeText('PRACOVNÍ DENÍK'), textStartX, 25, { align: textAlign });
    
    pdf.setFontSize(14);
    pdf.setTextColor(60, 60, 60);
    pdf.text(safeText(denik.zakladniUdaje.technologie), textStartX, 35, { align: textAlign });
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(safeText(`Vytvořeno: ${formatDatumCas()}`), textStartX, 45, { align: textAlign });
    
    // Základní údaje v vylepšeném rámečku
    let yPos = 65;
    pdf.setLineWidth(1);
    pdf.setDrawColor(100, 100, 100);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(10, yPos - 5, pageWidth - 20, 40, 'DF');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 40, 40);
    pdf.text(safeText('ZÁKLADNÍ ÚDAJE'), 15, yPos + 2);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const zakladniUdaje = [
      ['Datum:', formatDatum(denik.zakladniUdaje.datum)],
      ['Směna:', `${denik.zakladniUdaje.smena} (${denik.zakladniUdaje.cas_od}-${denik.zakladniUdaje.cas_do})`],
      ['Vedoucí směny:', denik.zakladniUdaje.vedouci_smeny],
      ['Obsluha linky:', denik.zakladniUdaje.obsluha_linky.replace(/\n/g, ', ')]
    ];
    
    // Přidáme poznámky vedoucího směny, pokud existují
    if (denik.zakladniUdaje.poznamky_vedouciho?.trim()) {
      zakladniUdaje.push(['Poznámky vedoucího:', denik.zakladniUdaje.poznamky_vedouciho.trim()]);
    }
    
    zakladniUdaje.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(safeText(label), 15, yPos);
      pdf.setFont('helvetica', 'normal');
      
      // Rozdělení dlouhého textu na více řádků
      const maxWidth = 130;
      const lines = pdf.splitTextToSize(safeText(value), maxWidth);
      
      if (lines.length > 1) {
        lines.forEach((line: string, index: number) => {
          pdf.text(line, 50, yPos + (index * 5));
        });
        yPos += (lines.length - 1) * 5;
      } else {
        pdf.text(safeText(value), 50, yPos);
      }
      yPos += 6;
    });
    
    yPos += 10;
    
    // Tabulka záznamů s lepším designem
    if (denik.zaznamy.length > 0) {
      // Hlavička tabulky
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(safeText('ZÁZNAMY PRÁCE'), 15, yPos);
      yPos += 8;
      
      const headers = ['Číslo zakázky', 'Popis zakázky', 'Pec', 'Poznámky'];
      const colWidths = [35, 60, 30, 50];
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const startX = (pageWidth - tableWidth) / 2;
      
      // Hlavička tabulky
      pdf.setFillColor(220, 220, 220);
      pdf.rect(startX, yPos - 3, tableWidth, 8, 'F');
      pdf.rect(startX, yPos - 3, tableWidth, 8, 'S');
      
      let xPos = startX;
      pdf.setFontSize(9);
      headers.forEach((header, index) => {
        pdf.text(safeText(header), xPos + 2, yPos + 2);
        if (index < headers.length - 1) {
          pdf.line(xPos + colWidths[index], yPos - 3, xPos + colWidths[index], yPos + 5);
        }
        xPos += colWidths[index];
      });
      
      yPos += 8;
      
      // Řádky tabulky
      pdf.setFont('helvetica', 'normal');
      denik.zaznamy.forEach((zaznam, index) => {
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = 20;
        }
        
        const rowHeight = 12;
        
        // Pozadí řádku
        if (index % 2 === 1) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(startX, yPos, tableWidth, rowHeight, 'F');
        }
        
        // Ohraničení řádku
        pdf.rect(startX, yPos, tableWidth, rowHeight, 'S');
        
        xPos = startX;
        const row = [
          zaznam.cislo_zakazky,
          zaznam.popis_zakazky,
          zaznam.pec,
          zaznam.poznamky || '-'
        ];
        
        // Text v buňkách
        row.forEach((text, colIndex) => {
          const lines = pdf.splitTextToSize(safeText(text), colWidths[colIndex] - 4);
          pdf.text(lines, xPos + 2, yPos + 6);
          
          // Vertikální čáry
          if (colIndex < row.length - 1) {
            pdf.line(xPos + colWidths[colIndex], yPos, xPos + colWidths[colIndex], yPos + rowHeight);
          }
          xPos += colWidths[colIndex];
        });
        
        yPos += rowHeight;
      });
    }
    
    // Sekce s poznámkami technologa a staticke poznamky
    yPos += 15;
    
    // Načtení poznámek technologa pro tuto směnu
    const poznamkyTechnologa = najitPoznamkyProDatumASmenu(
      denik.zakladniUdaje.datum,
      denik.zakladniUdaje.smena,
      denik.zakladniUdaje.technologie
    );
    
    // Statické poznámky podle technologie a směny
    const statickeUpozorneni: string[] = [];
    const datum = new Date(denik.zakladniUdaje.datum);
    const denVTydnu = datum.getDay(); // 0 = neděle, 1 = pondělí, ..., 3 = středa
    
    // Každou středu - 6S pro všechny směny
    if (denVTydnu === 3) {
      statickeUpozorneni.push("🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY");
    }
    
    // Pro odpolední směnu - nabíječka
    if (denik.zakladniUdaje.smena === 'odpolední') {
      statickeUpozorneni.push("🔋 DÁT VELKÝ VZV NA NABÍJEČKU - DO RÁNA MUSÍ BÝT NABITÝ");
    }
    
    // Zobrazení poznámek, pokud existují
    if (statickeUpozorneni.length > 0 || poznamkyTechnologa.length > 0) {
      // Kontrola místa na stránce
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Rámeček pro poznámky
      const poznamkyBoxHeight = 15 + (statickeUpozorneni.length * 6) + (poznamkyTechnologa.length * 12);
      pdf.setLineWidth(1);
      pdf.setDrawColor(100, 100, 100);
      pdf.setFillColor(255, 255, 240);
      pdf.rect(10, yPos - 5, pageWidth - 20, poznamkyBoxHeight, 'DF');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(40, 40, 40);
      pdf.text(safeText('POZNÁMKY A UPOZORNĚNÍ'), 15, yPos + 2);
      yPos += 10;
      
      // Statické upozornění
      if (statickeUpozorneni.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 0, 0);
        statickeUpozorneni.forEach(upozorneni => {
          pdf.text(safeText(upozorneni), 15, yPos);
          yPos += 6;
        });
        yPos += 3;
      }
      
      // Poznámky technologa
      if (poznamkyTechnologa.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 150);
        pdf.text(safeText('Poznámky technologa:'), 15, yPos);
        yPos += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        poznamkyTechnologa.forEach(poznamka => {
          const lines = pdf.splitTextToSize(safeText(`• ${poznamka.poznamka} (${poznamka.autor})`), pageWidth - 40);
          lines.forEach((line: string) => {
            pdf.text(line, 20, yPos);
            yPos += 4;
          });
          yPos += 2;
        });
      }
      
      yPos += 10;
    }
    
    // Vylepšená sekce podpisů s lepším layoutem
    yPos += 15;
    if (yPos > pageHeight - 90) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Rámeček pro potvrzení s vylepšeným designem
    const confirmBoxHeight = 70;
    pdf.setLineWidth(1.5);
    pdf.setDrawColor(80, 80, 80);
    pdf.setFillColor(248, 248, 255);
    pdf.rect(10, yPos - 5, pageWidth - 20, confirmBoxHeight, 'DF');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text(safeText('POTVRZENÍ A PODPISY SMĚNY'), 15, yPos + 5);
    yPos += 15;
    
    // Rozdělení na dva sloupce pro podpisy
    const colWidth = (pageWidth - 30) / 2 - 5;
    
    // Levý sloupec - Směnu předal
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(safeText('SMĚNU PŘEDAL:'), 15, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(safeText(denik.potvrzeni.smenu_predal), 15, yPos + 6);
    
    // Podpis předávajícího - vylepšené zpracování
    const signatureHeight = 25;
    const signatureWidth = 70;
    
    // JMÉNO NAD PODPISEM pro předávajícího
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(safeText(denik.potvrzeni.smenu_predal), 15, yPos + 6);
    
    if (denik.podpisy?.predal) {
      try {
        // Přidání rámečku pro podpis
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(150, 150, 150);
        pdf.rect(15, yPos + 10, signatureWidth, signatureHeight, 'S');
        
        // Vložení podpisu
        pdf.addImage(denik.podpisy.predal, 'PNG', 17, yPos + 12, signatureWidth - 4, signatureHeight - 4);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Elektronický podpis', 15, yPos + signatureHeight + 15);
      } catch (error) {
        console.warn('Nepodařilo se přidat podpis předávajícího:', error);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(100, 100, 100);
        pdf.line(15, yPos + 15, 15 + signatureWidth, yPos + 15);
        pdf.setFontSize(8);
        pdf.text('Podpis předávajícího', 15, yPos + 20);
      }
    } else {
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(100, 100, 100);
      pdf.line(15, yPos + 15, 15 + signatureWidth, yPos + 15);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Podpis předávajícího', 15, yPos + 20);
    }
    
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    pdf.text(safeText(`Čas předání: ${formatCas()}`), 15, yPos + 40);
    
    // Pravý sloupec - Směnu převzal
    const rightColX = pageWidth / 2 + 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(safeText('SMĚNU PŘEVZAL:'), rightColX, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(safeText(denik.potvrzeni.smenu_prevzal), rightColX, yPos + 6);
    
    // Podpis přebírajícího - vylepšené zpracování
    
    // JMÉNO NAD PODPISEM pro přebírajícího
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(safeText(denik.potvrzeni.smenu_prevzal), rightColX, yPos + 6);
    
    if (denik.podpisy?.prevzal) {
      try {
        // Přidání rámečku pro podpis
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(150, 150, 150);
        pdf.rect(rightColX, yPos + 10, signatureWidth, signatureHeight, 'S');
        
        // Vložení podpisu
        pdf.addImage(denik.podpisy.prevzal, 'PNG', rightColX + 2, yPos + 12, signatureWidth - 4, signatureHeight - 4);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Elektronický podpis', rightColX, yPos + signatureHeight + 15);
      } catch (error) {
        console.warn('Nepodařilo se přidat podpis přebírajícího:', error);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(100, 100, 100);
        pdf.line(rightColX, yPos + 15, rightColX + signatureWidth, yPos + 15);
        pdf.setFontSize(8);
        pdf.text('Podpis přebírajícího', rightColX, yPos + 20);
      }
    } else {
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(100, 100, 100);
      pdf.line(rightColX, yPos + 15, rightColX + signatureWidth, yPos + 15);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Podpis přebírajícího', rightColX, yPos + 20);
    }
    
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    pdf.text(safeText(`Čas převzetí: ${formatCas()}`), rightColX, yPos + 40);
    
    // Vylepšená patička
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(120, 120, 120);
    pdf.text(safeText('Generováno systémem Pracovní deník v2.2.0'), pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text(safeText(`Datum a čas exportu: ${formatDatumCas()}`), pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Uložení PDF s vylepšeným názvem
    const safeTechnology = denik.zakladniUdaje.technologie.replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = denik.zakladniUdaje.datum.replace(/[^0-9\-]/g, '');
    const fileName = `Pracovni_denik_${safeTechnology}_${safeDate}_${denik.zakladniUdaje.smena}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Chyba při exportu do PDF:', error);
    throw error;
  }
};

export const exportElementDovatPDF = async (elementId: string, fileName: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element nenalezen');
    }
    
    // Vytvoření canvas z HTML elementu
    const canvas = await html2canvas(element, {
      scale: 2, // Zvýšeno z 1.5 na 2 pro vyšší kvalitu
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.92); // Zvýšeno z 0.85 na 0.92 pro vyšší kvalitu
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin
    
    // Přidání první stránky
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20; // 10mm margin top and bottom
    
    // Přidání dalších stránek pokud je potřeba
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }
    
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Chyba při exportu elementu do PDF:', error);
    throw error;
  }
};

// Funkce pro export přes HTML canvas (plná podpora diakritiky)
export const exportDovatPDFPomociHTML = async (denik: UlozenyDenik): Promise<void> => {
  try {
    // Vytvoření dočasného HTML elementu s obsahem deníku
    const htmlContent = createDennikHTML(denik);
    
    // Vytvoření dočasného kontejneru
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '794px'; // A4 šířka v px při 96 DPI
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.lineHeight = '1.4';
    tempContainer.style.color = 'black';
    tempContainer.style.padding = '20px';
    
    document.body.appendChild(tempContainer);
    
    try {
      // Převod na canvas s vylepšeným nastavením pro lepší kvalitu
      const canvas = await html2canvas(tempContainer, {
        width: 794,
        height: 1123, // A4 výška v px při 96 DPI
        scale: 2, // Zvýšeno z 1.5 na 2 pro vyšší kvalitu
        useCORS: true,
        backgroundColor: 'white',
        logging: false,
        allowTaint: true,
        removeContainer: true
      });
      
      // Vytvoření PDF s vyšší kvalitou
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // Zvýšeno z 0.85 na 0.92 pro vyšší kvalitu
      const imgWidth = 210; // A4 šířka v mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Stažení PDF
      const safeTechnology = denik.zakladniUdaje.technologie.replace(/[^a-zA-Z0-9]/g, '_');
      const safeDate = denik.zakladniUdaje.datum.replace(/[^0-9\-]/g, '');
      const filename = `Pracovni_denik_${safeTechnology}_${safeDate}_${denik.zakladniUdaje.smena}.pdf`;
      pdf.save(filename);
      
    } finally {
      // Vyčištění
      document.body.removeChild(tempContainer);
    }
    
  } catch (error) {
    console.error('Chyba při exportu PDF:', error);
    alert('Nepodařilo se exportovat PDF. Zkuste to prosím znovu.');
  }
};

// Pomocná funkce pro vytvoření HTML obsahu deníku
const createDennikHTML = (denik: UlozenyDenik): string => {
  // Načtení poznámek technologa pro tuto směnu
  const poznamkyTechnologa = najitPoznamkyProDatumASmenu(
    denik.zakladniUdaje.datum,
    denik.zakladniUdaje.smena,
    denik.zakladniUdaje.technologie
  );
  
  // Statické poznámky podle technologie a směny
  const statickeUpozorneni: string[] = [];
  const datum = new Date(denik.zakladniUdaje.datum);
  const denVTydnu = datum.getDay(); // 0 = neděle, 1 = pondělí, ..., 3 = středa
  
  // Každou středu - 6S pro všechny směny
  if (denVTydnu === 3) {
    statickeUpozorneni.push("🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY");
  }
  
  // Pro odpolední směnu - nabíječka
  if (denik.zakladniUdaje.smena === 'odpolední') {
    statickeUpozorneni.push("🔋 DÁT VELKÝ VZV NA NABÍJEČKU - DO RÁNA MUSÍ BÝT NABITÝ");
  }

  return `
    <div style="max-width: 750px; margin: 0 auto; font-family: Arial, sans-serif;">
      <!-- Hlavička s logem -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <img src="/logo-new.png" alt="Logo" style="height: 60px; margin-bottom: 15px;" />
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">
          PRACOVNÍ DENÍK
        </h1>
        <h2 style="margin: 5px 0 0 0; font-size: 18px; color: #666;">
          ${denik.zakladniUdaje.technologie}
        </h2>
      </div>

      <!-- Základní údaje -->
      <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          📊 ZÁKLADNÍ ÚDAJE
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
          <div><strong>Datum:</strong> ${formatDatum(denik.zakladniUdaje.datum)}</div>
          <div><strong>Směna:</strong> ${denik.zakladniUdaje.smena} (${denik.zakladniUdaje.cas_od}-${denik.zakladniUdaje.cas_do})</div>
          <div><strong>Vedoucí směny:</strong> ${denik.zakladniUdaje.vedouci_smeny}</div>
          <div><strong>Obsluha linky:</strong> ${denik.zakladniUdaje.obsluha_linky.replace(/\n/g, ', ')}</div>
          ${denik.zakladniUdaje.poznamky_vedouciho?.trim() ? `
          <div style="grid-column: 1 / -1;"><strong>Poznámky vedoucího:</strong> ${denik.zakladniUdaje.poznamky_vedouciho}</div>
          ` : ''}
        </div>
      </div>

      <!-- Záznamy práce -->
      ${denik.zaznamy.length > 0 ? `
      <div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          📝 ZÁZNAMY PRÁCE
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #e9ecef;">
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Číslo zakázky</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Popis zakázky</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Pec</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Poznámky</th>
            </tr>
          </thead>
          <tbody>
            ${denik.zaznamy.map((zaznam, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="border: 1px solid #dee2e6; padding: 8px;">${zaznam.cislo_zakazky}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${zaznam.popis_zakazky}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${zaznam.pec}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${zaznam.poznamky || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Poznámky a upozornění -->
      ${statickeUpozorneni.length > 0 || poznamkyTechnologa.length > 0 ? `
      <div style="background-color: #fffbf0; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #8b6914; border-bottom: 1px solid #8b6914; padding-bottom: 5px;">
          📝 POZNÁMKY A UPOZORNĚNÍ
        </h3>
        
        ${statickeUpozorneni.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #d63031;">
            Automatická upozornění:
          </h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #2d3436;">
            ${statickeUpozorneni.map(upozorneni => `<li style="margin-bottom: 5px;">${upozorneni}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${poznamkyTechnologa.length > 0 ? `
        <div>
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #0984e3;">
            Poznámky technologa:
          </h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #2d3436;">
            ${poznamkyTechnologa.map(poznamka => `
              <li style="margin-bottom: 8px;">
                <strong>${poznamka.poznamka}</strong><br>
                <em style="font-size: 10px; color: #636e72;">Autor: ${poznamka.autor}</em>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Potvrzení směny -->
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #155724; border-bottom: 1px solid #155724; padding-bottom: 5px;">
          ✅ POTVRZENÍ SMĚNY
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 12px;">
          <div>
            <div style="text-align: center; margin-bottom: 10px;">
              <strong style="font-size: 14px;">Směnu předal:</strong>
            </div>
            <div style="text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold;">
              ${denik.potvrzeni.smenu_predal}
            </div>
            ${denik.podpisy?.predal ? `
            <div style="text-align: center; margin-bottom: 10px;">
              <img src="${denik.podpisy.predal}" 
                   style="border: 1px solid #333; max-width: 200px; max-height: 80px; background: white; padding: 5px;" 
                   alt="Podpis předávajícího" />
            </div>
            <div style="text-align: center; font-size: 10px; color: #666;">
              Elektronický podpis
            </div>
            ` : `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="border-bottom: 1px solid #333; width: 200px; height: 60px; margin: 0 auto; background: white; display: flex; align-items: end; justify-content: center; padding-bottom: 5px;">
                <span style="font-size: 10px; color: #999;">Podpis předávajícího</span>
              </div>
            </div>
            `}
          </div>
          <div>
            <div style="text-align: center; margin-bottom: 10px;">
              <strong style="font-size: 14px;">Směnu převzal:</strong>
            </div>
            <div style="text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold;">
              ${denik.potvrzeni.smenu_prevzal}
            </div>
            ${denik.podpisy?.prevzal ? `
            <div style="text-align: center; margin-bottom: 10px;">
              <img src="${denik.podpisy.prevzal}" 
                   style="border: 1px solid #333; max-width: 200px; max-height: 80px; background: white; padding: 5px;" 
                   alt="Podpis přebírajícího" />
            </div>
            <div style="text-align: center; font-size: 10px; color: #666;">
              Elektronický podpis
            </div>
            ` : `
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="border-bottom: 1px solid #333; width: 200px; height: 60px; margin: 0 auto; background: white; display: flex; align-items: end; justify-content: center; padding-bottom: 5px;">
                <span style="font-size: 10px; color: #999;">Podpis přebírajícího</span>
              </div>
            </div>
            `}
          </div>
        </div>
        <div style="margin-top: 15px; font-size: 10px; color: #666; text-align: center;">
          Vytvořeno: ${formatDatum(denik.zakladniUdaje.datum)} | Export: ${formatDatumCas()}
        </div>
      </div>
    </div>
  `;
};

// Původní funkce pro textový export (zachována pro kompatibilitu)
// Použijte exportDovatPDFText pro textový export nebo exportDovatPDF pro HTML export

// Hlavní export funkce s plnou podporou diakritiky
export const exportDovatPDF = exportDovatPDFPomociHTML;
