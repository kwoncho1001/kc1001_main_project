/**
 * Step 4: Dewarping
 * Flattens curved or wrinkled paper by tracking text lines.
 * Uses a 1D vertical dewarping model based on text line curvature.
 */
export const dewarp = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // 1. Text Line Tracking (Simplified)
  // We'll find the average vertical offset (curvature) at different horizontal positions.
  const numSlices = 20;
  const sliceWidth = Math.floor(w / numSlices);
  const offsets = new Float32Array(numSlices);

  for (let s = 0; s < numSlices; s++) {
    const startX = s * sliceWidth;
    const endX = Math.min(w, startX + sliceWidth);
    
    let sumY = 0;
    let count = 0;
    for (let x = startX; x < endX; x += 4) { // Sample every 4 pixels for speed
      for (let y = 0; y < h; y += 4) {
        const idx = (y * w + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < 128) {
          sumY += y;
          count++;
        }
      }
    }
    offsets[s] = count > 0 ? sumY / count : h / 2;
  }

  const idealCenter = offsets.reduce((a, b) => a + b, 0) / numSlices;
  
  // 2. Remapping
  const newCanvas = document.createElement('canvas');
  newCanvas.width = w;
  newCanvas.height = h;
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) return canvas;

  const outputData = newCtx.createImageData(w, h);
  const out = outputData.data;

  for (let x = 0; x < w; x++) {
    const sliceIdx = Math.min(numSlices - 1, Math.floor(x / sliceWidth));
    const offset = offsets[sliceIdx] - idealCenter;

    for (let y = 0; y < h; y++) {
      const srcY = Math.floor(y + offset);
      const outIdx = (y * w + x) * 4;
      
      if (srcY >= 0 && srcY < h) {
        const srcIdx = (srcY * w + x) * 4;
        out[outIdx] = data[srcIdx];
        out[outIdx + 1] = data[srcIdx + 1];
        out[outIdx + 2] = data[srcIdx + 2];
        out[outIdx + 3] = data[srcIdx + 3];
      } else {
        out[outIdx] = 255;
        out[outIdx + 1] = 255;
        out[outIdx + 2] = 255;
        out[outIdx + 3] = 255;
      }
    }
  }

  newCtx.putImageData(outputData, 0, 0);
  return newCanvas;
};
