import { OCRResult, ExtractedProblem, OCRProcessingState } from '../types/ability';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * @fileoverview Service for OCR extraction using Gemini AI.
 * Handles file preprocessing, API communication, and data formatting.
 */
export class OCRService {
  /**
   * Processes a file (PDF or Image) to extract exam problems using Gemini AI.
   * 
   * @param {File} file - The file to be processed.
   * @param {(state: OCRProcessingState) => void} onProgress - Callback to report processing progress.
   * @returns {Promise<ExtractedProblem[]>} A promise that resolves to an array of extracted problems.
   * @throws {Error} If the API key is missing or the API call fails.
   */
  static async processFile(file: File, onProgress: (state: OCRProcessingState) => void): Promise<ExtractedProblem[]> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in the environment.');
      }

      const ai = new GoogleGenAI({ apiKey });

      // 1. Uploading & Preprocessing
      onProgress({ status: 'UPLOADING', progress: 10, message: 'Reading file content...' });
      const base64Data = await this.fileToBase64(file);
      const mimeType = file.type || 'application/pdf';

      onProgress({ status: 'PREPROCESSING', progress: 30, message: 'Analyzing document structure and removing noise...' });
      // Simulate preprocessing delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. Extracting (Real AI Call)
      onProgress({ status: 'EXTRACTING', progress: 60, message: 'Gemini AI is extracting problems and formulas...' });
      const extractedData = await this.callGeminiAPI(ai, base64Data, mimeType);
      
      // 3. Validating & Formatting
      onProgress({ status: 'VALIDATING', progress: 90, message: 'Finalizing data structure...' });
      const finalizedProblems = this.formatExtractedData(extractedData);

      onProgress({ status: 'REVIEW_REQUIRED', progress: 100, message: 'Analysis complete. Please review the extracted data.' });
      return finalizedProblems;

    } catch (error) {
      console.error('[OCRService] Error during file processing:', error);
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred during OCR processing.');
    }
  }

  /**
   * Calls the Gemini API to extract problem data from the base64 file content.
   * 
   * @param {GoogleGenAI} ai - The initialized GoogleGenAI instance.
   * @param {string} base64Data - The base64 encoded file data.
   * @param {string} mimeType - The MIME type of the file.
   * @returns {Promise<any[]>} The raw extracted data from the AI.
   * @private
   */
  private static async callGeminiAPI(ai: GoogleGenAI, base64Data: string, mimeType: string): Promise<any[]> {
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

    return JSON.parse(response.text || "[]");
  }

  /**
   * Formats the raw extracted data into the ExtractedProblem interface structure.
   * 
   * @param {any[]} extractedData - The raw data from the AI.
   * @returns {ExtractedProblem[]} The formatted array of problems.
   * @private
   */
  private static formatExtractedData(extractedData: any[]): ExtractedProblem[] {
    const timestamp = Date.now();
    return extractedData.map((p: any, index: number) => ({
      ...p,
      id: `ext-${timestamp}-${index}`,
      rawElements: (p.rawElements || []).map((re: any, reIdx: number) => ({
        ...re,
        id: `re-${timestamp}-${reIdx}`,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 } // Placeholder for bounding boxes
      }))
    }));
  }

  /**
   * Converts a File object to a base64 encoded string.
   * 
   * @param {File} file - The file to convert.
   * @returns {Promise<string>} A promise resolving to the base64 string.
   * @private
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Failed to extract base64 data from file."));
        }
      };
      reader.onerror = error => reject(new Error(`File reading failed: ${error}`));
    });
  }

  /**
   * Finalizes the extraction after user review.
   * 
   * @param {ExtractedProblem[]} problems - The finalized list of problems.
   * @returns {Promise<void>}
   */
  static async finalizeExtraction(problems: ExtractedProblem[]): Promise<void> {
    try {
      console.log('[OCRService] Saving finalized problem data:', problems);
      // Simulate API call to save data
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[OCRService] Error finalizing extraction:', error);
      throw new Error("Failed to save finalized extraction data.");
    }
  }
}

