/**
 * Step 1: Fix Orientation
 * Detects if the image is landscape or portrait and rotates it to portrait.
 */
export const fixOrientation = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (canvas.width > canvas.height) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.height;
    newCanvas.height = canvas.width;
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) return canvas;

    newCtx.translate(newCanvas.width / 2, newCanvas.height / 2);
    newCtx.rotate(Math.PI / 2);
    newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    return newCanvas;
  }

  return canvas;
};
