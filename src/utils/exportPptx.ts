import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';

export default async function exportPptx(tabName: string) {
  const element = document.getElementById('exportable-content');
  if (!element) {
    alert('Konten tidak ditemukan untuk diekspor.');
    return;
  }

  try {
    // 1. Create PowerPoint presentation
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'UOBK RSUD R. Syamsudin, S.H.';
    pptx.company = 'Aplikasi Case Manager Pro';
    pptx.title = `Evaluasi Casemix - ${tabName}`;

    // 2. High-resolution canvas capture
    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI for crisp presentation
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: 1440, // Standard desktop canvas width
    });

    const imgData = canvas.toDataURL('image/png');

    // 3. Add Slide with Title and Header
    const slide = pptx.addSlide();

    // Background
    slide.background = { color: '032E2B' }; // Dark Emerald Background

    // Header bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.85,
      fill: { color: '064E3B' },
      line: { color: 'F59E0B', width: 2 } // Gold Bottom Border
    });

    // Header text
    slide.addText(`APLIKASI CASE MANAGER PRO - UOBK RSUD R. SYAMSUDIN, S.H.`, {
      x: 0.5,
      y: 0.15,
      w: 8.5,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
    });

    slide.addText(`SISTEM EVALUASI KLAIM CASEMIX & SUPERVISI ASUHAN KLINIS`, {
      x: 0.5,
      y: 0.45,
      w: 8.5,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: 'FBBF24', // Gold
      bold: true,
    });

    slide.addText(`Kategori: ${tabName.replace(/_/g, ' ').toUpperCase()}`, {
      x: 9.0,
      y: 0.25,
      w: 3.8,
      h: 0.35,
      fontSize: 10,
      fontFace: 'Arial',
      color: 'FEF3C7',
      align: 'right',
      bold: true
    });

    // Calculate dimensions to maintain aspect ratio within 16:9 slide (13.33 x 7.5 inches)
    const maxWidth = 12.33; // inches
    const maxHeight = 6.2;  // inches
    const imgRatio = canvas.width / canvas.height;
    
    let renderW = maxWidth;
    let renderH = maxWidth / imgRatio;

    if (renderH > maxHeight) {
      renderH = maxHeight;
      renderW = maxHeight * imgRatio;
    }

    const posX = 0.5 + (maxWidth - renderW) / 2;
    const posY = 1.0 + (maxHeight - renderH) / 2;

    // Embed high-res screenshot image perfectly
    slide.addImage({
      data: imgData,
      x: posX,
      y: posY,
      w: renderW,
      h: renderH,
    });

    // 4. Save file
    await pptx.writeFile({ fileName: `Laporan_Casemix_${tabName}_${new Date().toISOString().slice(0,10)}.pptx` });
  } catch (err) {
    console.error('Failed to export PPTX', err);
    alert('Terjadi kendala saat membuat PPTX. Silakan gunakan fungsi Print / Save as PDF.');
  }
}
