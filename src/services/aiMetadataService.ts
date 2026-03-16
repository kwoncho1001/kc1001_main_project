import { GoogleGenAI, Type } from "@google/genai";
import { 
  AIMetadataAnalysisResponse, 
  ProblemMetadata, 
  DifficultyFactors,
  AbilityLevel
} from '../types/ability';
import { HierarchyService } from './hierarchyService';

export class AIMetadataService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  /**
   * Analyzes problem text using Gemini AI to extract hierarchical metadata and difficulty factors.
   */
  static async analyzeProblemMetadata(problemText: string): Promise<AIMetadataAnalysisResponse> {
    const nodes = HierarchyService.getAllNodes();
    const curriculumContext = JSON.stringify(nodes.map(n => ({ id: n.id, name: n.name, level: n.level, parentId: n.parentId })));

    const prompt = `
      You are an expert mathematics educator. Analyze the following math problem and map it to the provided curriculum hierarchy.
      
      Problem Text:
      "${problemText}"
      
      Curriculum Context (JSON):
      ${curriculumContext}
      
      Tasks:
      1. Identify the most relevant node at each level: FIELD, COURSE, MAJOR_CHAPTER, MINOR_CHAPTER, TYPE. Use the IDs from the Curriculum Context.
      2. Extract 3-5 key mathematical keywords.
      3. Identify 2-3 related concepts.
      4. Rate difficulty factors (0.0 to 1.0) for: Computational Complexity, Conceptual Depth, Logical Reasoning.
      5. Provide an overall confidence score (0.0 to 1.0).
      
      Return the result in strict JSON format.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metadata: {
                type: Type.OBJECT,
                properties: {
                  fieldId: { type: Type.STRING },
                  subjectId: { type: Type.STRING },
                  majorUnitId: { type: Type.STRING },
                  minorUnitId: { type: Type.STRING },
                  tagId: { type: Type.STRING },
                },
                required: ["fieldId", "subjectId", "majorUnitId", "minorUnitId", "tagId"]
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              concepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              difficultyFactors: {
                type: Type.OBJECT,
                properties: {
                  computationalComplexity: { type: Type.NUMBER },
                  conceptualDepth: { type: Type.NUMBER },
                  logicalReasoning: { type: Type.NUMBER },
                },
                required: ["computationalComplexity", "conceptualDepth", "logicalReasoning"]
              },
              confidence: { type: Type.NUMBER }
            },
            required: ["metadata", "keywords", "concepts", "difficultyFactors", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result as AIMetadataAnalysisResponse;
    } catch (error) {
      console.error("[AIMetadataService] Analysis failed:", error);
      throw error;
    }
  }

  /**
   * Mock implementation for testing without API calls
   */
  static async mockAnalyze(problemText: string): Promise<AIMetadataAnalysisResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      metadata: {
        fieldId: 'f1',
        subjectId: 's1',
        majorUnitId: 'm1',
        minorUnitId: 'n1',
        tagId: 't1'
      },
      keywords: ['Differentiation', 'Implicit', 'Calculus'],
      concepts: ['Chain Rule', 'Derivative'],
      difficultyFactors: {
        computationalComplexity: 0.7,
        conceptualDepth: 0.5,
        logicalReasoning: 0.6
      },
      confidence: 0.95
    };
  }
}
