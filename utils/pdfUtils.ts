import jsPDF from 'jspdf';

export const downloadPagesAsPDF = (pages: string[], title: string) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  pages.forEach((pageBase64, index) => {
    if (index > 0) {
      pdf.addPage();
    }
    
    // Add image to PDF with high quality
    pdf.addImage(
      `data:image/png;base64,${pageBase64}`,
      'PNG',
      0, // x position
      0, // y position
      8.5, // width in inches
      11, // height in inches
      undefined,
      'FAST' // compression type for quality
    );
  });

  // Download the PDF
  const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}_${pages.length}pages.pdf`;
  pdf.save(fileName);
};

export const downloadSinglePageAsPDF = (pageBase64: string, title: string, pageNumber: number) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  pdf.addImage(
    `data:image/png;base64,${pageBase64}`,
    'PNG',
    0,
    0,
    8.5,
    11,
    undefined,
    'FAST'
  );

  const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}_page${pageNumber}.pdf`;
  pdf.save(fileName);
};