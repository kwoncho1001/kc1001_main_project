/**
 * Step 3: Select Content
 * Detects paper boundaries and crops the image to the valid content area.
 * Uses Projection Analysis to find the bounding box of the text.
 */
export const selectContent = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // 1. Projection Analysis
  const rowSums = new Int32Array(h);
  const colSums = new Int32Array(w);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (brightness < 128) {
        rowSums[y]++;
        colSums[x]++;
      }
    }
  }

  // Find boundaries where pixel density is significant
  const threshold = 2; // Minimum pixels per line to be considered content
  
  // Vertical boundaries (Top/Bottom)
  let top = 0;
  while (top < h && rowSums[top] < threshold) top++;
  
  let bottom = h - 1;
  while (bottom > top && rowSums[bottom] < threshold) bottom--;

  // Horizontal boundaries (Left/Right)
  let left = 0;
  while (left < w && colSums[left] < threshold) left++;

  let right = w - 1;
  while (right > left && colSums[right] < threshold) right--;

  // 2. Dynamic Expansion
  // Ensure we include top 10% for logos/headers even if density is low
  const topBuffer = Math.floor(h * 0.1);
  if (top > topBuffer) {
    for (let y = 0; y < top; y++) {
      if (rowSums[y] > 1) { 
        top = Math.max(0, y - 5);
        break;
      }
    }
  }

  // 3. Final Refinement with Margins
  const margin = 20;
  left = Math.max(0, left - margin);
  top = Math.max(0, top - margin);
  right = Math.min(w - 1, right + margin);
  bottom = Math.min(h - 1, bottom + margin);

  const cropW = right - left;
  const cropH = bottom - top;

  if (cropW <= 0 || cropH <= 0) return canvas;

  const newCanvas = document.createElement('canvas');
  newCanvas.width = cropW;
  newCanvas.height = cropH;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  newCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
  
  return newCanvas;
};
