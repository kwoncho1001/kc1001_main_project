import EXIF from 'exif-js';

/**
 * Step 1: Fix Orientation
 * Uses EXIF, Aspect Ratio, and Text Flow analysis to rotate the image to portrait.
 */
export const fixOrientation = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  let rotationNeeded = 0; // 0, 90, 180, 270

  // 1. EXIF Check
  try {
    const exifData = await new Promise<any>((resolve) => {
      // @ts-ignore
      EXIF.getData(canvas as any, function(this: any) {
        resolve(EXIF.getAllTags(this));
      });
    });

    if (exifData && exifData.Orientation) {
      switch (exifData.Orientation) {
        case 6: rotationNeeded = 90; break;
        case 3: rotationNeeded = 180; break;
        case 8: rotationNeeded = 270; break;
      }
    }
  } catch (e) {
    console.warn('EXIF read failed, falling back to visual analysis');
  }

  // 2. Aspect Ratio Check (If landscape, likely needs 90 or 270)
  if (rotationNeeded === 0 && canvas.width > canvas.height) {
    rotationNeeded = 90; 
  }

  // 3. Text Flow Analysis (Coarse check)
  // We'll check if text lines are vertical or horizontal by comparing variance 
  // of horizontal vs vertical projections.
  if (rotationNeeded === 0 || rotationNeeded === 90) {
    const isVertical = await detectTextFlowIsVertical(canvas);
    if (isVertical && canvas.width > canvas.height) {
      rotationNeeded = 90;
    } else if (isVertical && canvas.height > canvas.width) {
      // Already portrait but text is vertical? Might need 90.
      // For simplicity in this simulation, we prioritize aspect ratio.
    }
  }

  if (rotationNeeded !== 0) {
    return rotateOrthogonal(canvas, rotationNeeded);
  }

  return canvas;
};

const rotateOrthogonal = (canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement => {
  const newCanvas = document.createElement('canvas');
  const is90or270 = degrees === 90 || degrees === 270;
  
  newCanvas.width = is90or270 ? canvas.height : canvas.width;
  newCanvas.height = is90or270 ? canvas.width : canvas.height;
  
  const ctx = newCanvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.translate(newCanvas.width / 2, newCanvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  
  return newCanvas;
};

const detectTextFlowIsVertical = async (canvas: HTMLCanvasElement): Promise<boolean> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  // Downsample for speed
  const scale = 0.1;
  const w = Math.floor(canvas.width * scale);
  const h = Math.floor(canvas.height * scale);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return false;
  tempCtx.drawImage(canvas, 0, 0, w, h);

  const imageData = tempCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const rowSums = new Float32Array(h);
  const colSums = new Float32Array(w);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const val = brightness < 128 ? 1 : 0; // Dark pixels (text)
      rowSums[y] += val;
      colSums[x] += val;
    }
  }

  const rowVar = calculateVariance(rowSums);
  const colVar = calculateVariance(colSums);

  // If row variance is higher, text is likely horizontal (aligned with rows)
  // If col variance is higher, text is likely vertical (aligned with columns)
  return colVar > rowVar;
};

const calculateVariance = (arr: Float32Array): number => {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
};
