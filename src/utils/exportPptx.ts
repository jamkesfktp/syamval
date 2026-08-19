import { exportToPptx } from 'dom-to-pptx';

export default async function exportPptx(tabName: string) {
  const element = document.getElementById('exportable-content');
  if (!element) {
    alert('Konten tidak ditemukan untuk diekspor.');
    return;
  }
  
  try {
    await exportToPptx(element, {
      fileName: `Laporan_Casemix_${tabName}.pptx`,
      svgAsVector: true,
    });
  } catch (err) {
    console.error('Failed to export PPTX', err);
    alert('Terjadi kesalahan saat mengkonversi ke PPTX.');
  }
}
