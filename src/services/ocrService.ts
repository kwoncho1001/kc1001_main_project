import { OCRResult, ExtractedProblem, OCRProcessingState } from '../types/ability';

export class OCRService {
  /**
   * Simulates the full OCR extraction pipeline.
   */
  static async processFile(file: File, onProgress: (state: OCRProcessingState) => void): Promise<ExtractedProblem[]> {
    // 1. Uploading
    onProgress({ status: 'UPLOADING', progress: 10, message: 'Uploading file to secure storage...' });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Preprocessing (Handwriting separation)
    onProgress({ status: 'PREPROCESSING', progress: 30, message: 'Separating handwriting from printed text...' });
    await new Promise(r => setTimeout(r, 1500));

    // 3. Extracting (OCR + Formula)
    onProgress({ status: 'EXTRACTING', progress: 60, message: 'Recognizing text and mathematical formulas...' });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Validating
    onProgress({ status: 'VALIDATING', progress: 85, message: 'Validating data structure and identifying uncertainties...' });
    await new Promise(r => setTimeout(r, 1000));

    // Mock extracted data
    const mockProblems: ExtractedProblem[] = [
      {
        id: 'ext-1',
        problemNumber: '1',
        content: '다음 함수 f(x) = sin(x^2)의 도함수를 구하시오.',
        options: ['2x cos(x^2)', 'cos(x^2)', '2 sin(x)', 'x^2 cos(x)'],
        answer: '2x cos(x^2)',
        explanation: '연쇄법칙을 적용하면 f\'(x) = cos(x^2) * 2x이다.',
        rawElements: [
          {
            id: 'e1',
            type: 'text',
            boundingBox: { x: 10, y: 10, width: 200, height: 30 },
            content: '다음 함수 f(x) = sin(x^2)의 도함수를 구하시오.',
            isUncertain: false
          },
          {
            id: 'e2',
            type: 'formula',
            boundingBox: { x: 10, y: 50, width: 100, height: 30 },
            content: 'f(x) = \\sin(x^2)',
            isUncertain: true,
            candidates: [
              { text: 'f(x) = \\sin(x^2)', confidence: 0.85 },
              { text: 'f(x) = \\sin(x^3)', confidence: 0.12 },
              { text: 'f(x) = \\sin(x)', confidence: 0.03 }
            ]
          }
        ]
      },
      {
        id: 'ext-2',
        problemNumber: '2',
        content: '함수 g(x) = ln(x)의 x=1에서의 접선의 방정식을 구하시오.',
        answer: 'y = x - 1',
        rawElements: [
          {
            id: 'e3',
            type: 'text',
            boundingBox: { x: 10, y: 100, width: 200, height: 30 },
            content: '함수 g(x) = ln(x)의 x=1에서의 접선의 방정식을 구하시오.',
            isUncertain: true,
            candidates: [
              { text: '함수 g(x) = ln(x)의 x=1에서의 접선의 방정식을 구하시오.', confidence: 0.78 },
              { text: '함수 g(x) = In(x)의 x=1에서의 접선의 방정식을 구하시오.', confidence: 0.20 }
            ]
          }
        ]
      }
    ];

    onProgress({ status: 'REVIEW_REQUIRED', progress: 100, message: 'Analysis complete. Please review uncertain areas.' });
    return mockProblems;
  }

  /**
   * Finalizes the extraction after user review.
   */
  static async finalizeExtraction(problems: ExtractedProblem[]): Promise<void> {
    // In a real app, this would save to the DB
    console.log('Saving finalized problem data:', problems);
    await new Promise(r => setTimeout(r, 1000));
  }
}
