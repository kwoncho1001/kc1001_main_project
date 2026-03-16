import { jsPDF } from 'jspdf';

/**
 * Step 6: Page Layout
 * Standardizes the page to A4 size and exports to PDF.
 */
export const pageLayout = async (canvas: HTMLCanvasElement): Promise<string> => {
  // A4 dimensions in mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate aspect ratio to fit A4
  const canvasRatio = canvas.height / canvas.width;
  const pageRatio = pageHeight / pageWidth;
  
  let finalWidth = pageWidth;
  let finalHeight = pageHeight;
  
  if (canvasRatio > pageRatio) {
    finalWidth = pageHeight / canvasRatio;
  } else {
    finalHeight = pageWidth * canvasRatio;
  }

  const x = (pageWidth - finalWidth) / 2;
  const y = (pageHeight - finalHeight) / 2;

  pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
  
  return pdf.output('bloburl').toString();
};
