/**
 * Step 2: Deskew
 * Corrects the tilt of the paper by rotating it slightly.
 * Uses Horizontal Projection Profile (Variance maximization) algorithm.
 */
export const deskew = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // 1. Preprocessing: Downsample for speed
  const scale = 0.2; // ~150-200 DPI equivalent for analysis
  const w = Math.floor(canvas.width * scale);
  const h = Math.floor(canvas.height * scale);
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return canvas;
  tempCtx.drawImage(canvas, 0, 0, w, h);

  // 2. Core Engine: Find best angle using Horizontal Projection Profile
  const searchRange = 5; // -5 to +5 degrees
  const step = 0.2; // 0.2 degree precision
  
  let bestAngle = 0;
  let maxVariance = -1;
  let secondMaxVariance = -1;

  const imageData = tempCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Pre-calculate dark pixels for faster projection
  const points: {x: number, y: number}[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (brightness < 128) {
        points.push({x, y});
      }
    }
  }

  for (let angle = -searchRange; angle <= searchRange; angle += step) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const projection = new Float32Array(h);
    const centerY = h / 2;
    const centerX = w / 2;

    for (const p of points) {
      // Rotate point around center to find its row in the projection
      const ry = (p.x - centerX) * sin + (p.y - centerY) * cos + centerY;
      const row = Math.floor(ry);
      if (row >= 0 && row < h) {
        projection[row]++;
      }
    }

    const variance = calculateVariance(projection);
    
    if (variance > maxVariance) {
      secondMaxVariance = maxVariance;
      maxVariance = variance;
      bestAngle = angle;
    } else if (variance > secondMaxVariance) {
      secondMaxVariance = variance;
    }
  }

  // 3. Confidence Check
  const confidence = (maxVariance - secondMaxVariance) / maxVariance;
  if (confidence < 0.05) {
    console.log('Deskew confidence low, skipping rotation');
    return canvas;
  }

  // 4. Final Rotation
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvas.width;
  finalCanvas.height = canvas.height;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) return canvas;

  finalCtx.save();
  finalCtx.translate(canvas.width / 2, canvas.height / 2);
  finalCtx.rotate((bestAngle * Math.PI) / 180);
  finalCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  finalCtx.restore();

  return finalCanvas;
};

const calculateVariance = (arr: Float32Array): number => {
  const n = arr.length;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    sum += arr[i];
    sumSq += arr[i] * arr[i];
  }
  const mean = sum / n;
  return (sumSq / n) - (mean * mean);
};
