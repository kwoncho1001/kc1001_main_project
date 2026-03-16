/**
 * Step 5: Binarization & Background Whitening
 * Removes shadows and converts the image to clean black and white.
 * Uses a local adaptive thresholding algorithm (similar to Sauvola).
 */
export const binarize = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // 1. Convert to Grayscale first
  const gray = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
  }

  // 2. Adaptive Thresholding (Local Window Analysis)
  const windowSize = 15;
  const halfWin = Math.floor(windowSize / 2);
  const k = 0.2; // Sensitivity parameter
  const R = 128; // Max standard deviation

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = w;
  outputCanvas.height = h;
  const outCtx = outputCanvas.getContext('2d');
  if (!outCtx) return canvas;
  const outData = outCtx.createImageData(w, h);
  const out = outData.data;

  // For performance, we'll use a simplified local mean check
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      
      let sum = 0;
      let sumSq = 0;
      let count = 0;

      // Sampling for speed: check only a few pixels in the window
      for (let wy = -halfWin; wy <= halfWin; wy += 3) {
        for (let wx = -halfWin; wx <= halfWin; wx += 3) {
          const ny = y + wy;
          const nx = x + wx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
            const val = gray[ny * w + nx];
            sum += val;
            sumSq += val * val;
            count++;
          }
        }
      }

      const mean = sum / count;
      const std = Math.sqrt(Math.max(0, (sumSq / count) - (mean * mean)));
      
      // Sauvola formula: T = m * (1 + k * (s/R - 1))
      const threshold = mean * (1 + k * (std / R - 1));

      const isBlack = gray[idx] < threshold;
      const outIdx = idx * 4;
      const color = isBlack ? 0 : 255;
      
      out[outIdx] = color;
      out[outIdx + 1] = color;
      out[outIdx + 2] = color;
      out[outIdx + 3] = 255;
    }
  }

  outCtx.putImageData(outData, 0, 0);
  return outputCanvas;
};
