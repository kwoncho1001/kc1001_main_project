/**
 * Step 2: Deskew
 * Corrects the tilt of the paper by rotating it slightly.
 */
export const deskew = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Simulation: Detect tilt angle (usually -5 to 5 degrees)
  // In a real app, we'd use Hough Transform.
  const angle = (Math.random() - 0.5) * 4; // Simulated tilt correction
  
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  newCtx.save();
  newCtx.translate(canvas.width / 2, canvas.height / 2);
  newCtx.rotate((angle * Math.PI) / 180);
  newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  newCtx.restore();

  return newCanvas;
};
