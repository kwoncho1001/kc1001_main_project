/**
 * Step 5: Binarization
 * Converts the image to high-contrast black and white, removing shadows.
 */
export const binarize = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Adaptive Thresholding simulation
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Grayscale
    const avg = (r + g + b) / 3;
    
    // Simple Threshold (Binarization)
    // In a real scanner, we'd use Bradley or Sauvola thresholding.
    const threshold = 180; 
    const val = avg > threshold ? 255 : 0;
    
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  newCtx.putImageData(imageData, 0, 0);
  return newCanvas;
};
