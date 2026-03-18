import { jsPDF } from 'jspdf';

/**
 * Step 6: Page Layout
 * Standardizes the page to A4 size and exports to PDF.
 * Handles margins, centering, and optimal scaling for multiple pages.
 */
export const pageLayout = async (canvases: HTMLCanvasElement[]): Promise<string> => {
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10; // 10mm "Hard Margin" as requested

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    if (i > 0) pdf.addPage();

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Calculate dimensions to fit in A4 with margins
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    
    let finalWidth = canvas.width;
    let finalHeight = canvas.height;
    
    const ratio = finalWidth / finalHeight;
    
    // Scale down if it exceeds max dimensions
    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = finalWidth / ratio;
    }
    
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = finalHeight * ratio;
    }

    // Center the image on the A4 canvas
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    // Add white background (canvas)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
  }
  
  return pdf.output('bloburl').toString();
};
