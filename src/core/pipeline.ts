import { fixOrientation } from './filters/fix_orientation';
import { deskew } from './filters/deskew';
import { selectContent } from './filters/select_content';
import { dewarp } from './filters/dewarp';
import { binarize } from './filters/binarize';
import { pageLayout } from './filters/page_layout';

export interface PipelineStep {
  name: string;
  description: string;
  thought: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { name: 'Fix Orientation', description: 'Detects and corrects image orientation.', thought: 'Is this photo landscape or portrait?' },
  { name: 'Deskew', description: 'Corrects the tilt of the paper.', thought: 'The paper is slightly diagonal. Let me straighten it.' },
  { name: 'Select Content', description: 'Detects paper boundaries and crops.', thought: "I don't need the desk background. Just the paper." },
  { name: 'Dewarping', description: 'Flattens curved or wrinkled paper.', thought: 'The paper is bumpy. Let me iron it out.' },
  { name: 'Binarization', description: 'Converts to high-contrast B&W.', thought: 'The photo is dark. Let me make it look like a real scan.' },
  { name: 'Page Layout', description: 'Standardizes to A4 and creates PDF.', thought: 'Let me fit this to A4 and prepare the final PDF.' },
];

export const runPipeline = async (
  imageSrc: string,
  onStepComplete: (stepIndex: number, canvas: HTMLCanvasElement) => void
): Promise<string> => {
  // Load image into canvas
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  let canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(img, 0, 0);

  // Step 1: Fix Orientation
  canvas = await fixOrientation(canvas);
  onStepComplete(0, canvas);

  // Step 2: Deskew
  canvas = await deskew(canvas);
  onStepComplete(1, canvas);

  // Step 3: Select Content
  canvas = await selectContent(canvas);
  onStepComplete(2, canvas);

  // Step 4: Dewarping
  canvas = await dewarp(canvas);
  onStepComplete(3, canvas);

  // Step 5: Binarization
  canvas = await binarize(canvas);
  onStepComplete(4, canvas);

  // Step 6: Page Layout
  const pdfUrl = await pageLayout(canvas);
  onStepComplete(5, canvas);

  return pdfUrl;
};
