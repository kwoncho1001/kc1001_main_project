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
  { name: '방향 수정', description: '이미지 방향을 감지하고 수정합니다.', thought: '이 사진은 가로인가요, 세로인가요?' },
  { name: '기울기 보정', description: '종이의 기울기를 수정합니다.', thought: '종이가 약간 대각선이네요. 똑바로 펴겠습니다.' },
  { name: '콘텐츠 선택', description: '종이 경계를 감지하고 자릅니다.', thought: '책상 배경은 필요 없어요. 종이만 남기겠습니다.' },
  { name: '디워핑', description: '구부러지거나 구겨진 종이를 평평하게 폅니다.', thought: '종이가 울퉁불퉁하네요. 다림질하듯 펴겠습니다.' },
  { name: '이진화', description: '고대비 흑백으로 변환합니다.', thought: '사진이 어둡네요. 실제 스캔처럼 보이게 만들겠습니다.' },
  { name: '페이지 레이아웃', description: 'A4 규격으로 표준화하고 PDF를 생성합니다.', thought: 'A4에 맞추고 최종 PDF를 준비하겠습니다.' },
];

export const runPipeline = async (
  imageSrcs: string[],
  onStepComplete: (pageIndex: number, stepIndex: number, canvas: HTMLCanvasElement) => void
): Promise<string> => {
  const finalCanvases: HTMLCanvasElement[] = [];

  for (let p = 0; p < imageSrcs.length; p++) {
    const imageSrc = imageSrcs[p];
    
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
    onStepComplete(p, 0, canvas);

    // Step 2: Deskew
    canvas = await deskew(canvas);
    onStepComplete(p, 1, canvas);

    // Step 3: Select Content
    canvas = await selectContent(canvas);
    onStepComplete(p, 2, canvas);

    // Step 4: Dewarping
    canvas = await dewarp(canvas);
    onStepComplete(p, 3, canvas);

    // Step 5: Binarization
    canvas = await binarize(canvas);
    onStepComplete(p, 4, canvas);

    finalCanvases.push(canvas);
  }

  // Step 6: Page Layout (Global)
  const pdfUrl = await pageLayout(finalCanvases);
  // For the final step, we use the last canvas to show completion in UI
  onStepComplete(imageSrcs.length - 1, 5, finalCanvases[finalCanvases.length - 1]);

  return pdfUrl;
};
