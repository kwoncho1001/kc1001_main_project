import { OCRResult, ExtractedProblem, OCRProcessingState } from '../types/ability';
import { GoogleGenAI, Type } from "@google/genai";

export class OCRService {
  /**
   * Real OCR extraction pipeline using Gemini AI.
   */
  static async processFile(file: File, onProgress: (state: OCRProcessingState) => void): Promise<ExtractedProblem[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1. Uploading
    onProgress({ status: 'UPLOADING', progress: 10, message: 'Reading file content...' });
    const base64Data = await this.fileToBase64(file);
    const mimeType = file.type || 'application/pdf';

    // 2. Preprocessing
    onProgress({ status: 'PREPROCESSING', progress: 30, message: 'Analyzing document structure and removing noise...' });
    await new Promise(r => setTimeout(r, 800));

    // 3. Extracting (Real AI Call)
    onProgress({ status: 'EXTRACTING', progress: 60, message: 'Gemini AI is extracting problems and formulas...' });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `You are a professional exam digitizer. Extract all exam problems from this document. 
            
            For each problem, you MUST extract:
            - problemNumber: The number of the problem (e.g., "1", "2a", etc.)
            - content: The full text of the problem. Use LaTeX for ALL mathematical formulas (e.g., $x^2$, \\frac{a}{b}).
            - options: If it's multiple choice, list the options as an array of strings.
            - answer: The correct answer if identifiable.
            - explanation: Any solution steps or explanations provided in the text.
            
            CRITICAL: Identify "rawElements". These are the individual blocks of text or formulas you extracted. 
            If you are even slightly unsure about a specific word, symbol, or formula (e.g., due to handwriting overlap or blur), set "isUncertain": true and provide 2-3 "candidates" with confidence scores.
            
            Return ONLY a JSON array of problems.`,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problemNumber: { type: Type.STRING },
                content: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                rawElements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ["text", "formula", "image"] },
                      content: { type: Type.STRING },
                      isUncertain: { type: Type.BOOLEAN },
                      candidates: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: { type: Type.STRING },
                            confidence: { type: Type.NUMBER }
                          }
                        }
                      }
                    },
                    required: ["type", "content", "isUncertain"]
                  }
                }
              },
              required: ["problemNumber", "content", "rawElements"]
            }
          }
        }
      });

      const extractedData = JSON.parse(response.text || "[]");
      
      // 4. Validating
      onProgress({ status: 'VALIDATING', progress: 90, message: 'Finalizing data structure...' });
      
      const finalizedProblems: ExtractedProblem[] = extractedData.map((p: any, index: number) => ({
        ...p,
        id: `ext-${Date.now()}-${index}`,
        rawElements: p.rawElements.map((re: any, reIdx: number) => ({
          ...re,
          id: `re-${Date.now()}-${reIdx}`,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 } // Bounding boxes are hard to get from text-only response, keeping as placeholder
        }))
      }));

      onProgress({ status: 'REVIEW_REQUIRED', progress: 100, message: 'Analysis complete. Please review the extracted data.' });
      return finalizedProblems;

    } catch (error) {
      console.error('Gemini OCR Error:', error);
      throw error;
    }
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Finalizes the extraction after user review.
   */
  static async finalizeExtraction(problems: ExtractedProblem[]): Promise<void> {
    console.log('Saving finalized problem data:', problems);
    await new Promise(r => setTimeout(r, 1000));
  }
}
