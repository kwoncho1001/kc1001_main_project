/**
 * Step 3: Select Content
 * Detects the paper boundaries and crops the image to the paper area.
 */
export const selectContent = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Simulation: Find the bounding box of the content
  // We'll crop 5% from each side as a simulation of finding the paper edge.
  const margin = 0.05;
  const x = canvas.width * margin;
  const y = canvas.height * margin;
  const width = canvas.width * (1 - 2 * margin);
  const height = canvas.height * (1 - 2 * margin);

  const newCanvas = document.createElement('canvas');
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  newCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return newCanvas;
};
