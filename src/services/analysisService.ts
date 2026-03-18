import { TransactionLog, ProgressMaster, AnalysisResult, AbilityLevel } from '../types/ability';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class AnalysisService {
  /**
   * Analyzes student performance based on transaction logs and progress master data.
   * Applies difficulty-based weights to identify weak and strong points.
   */
  static async analyzeStudent(
    studentId: string,
    logs: TransactionLog[],
    progress: ProgressMaster[],
    difficultyWeights: Record<number, number> = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.25, 5: 0.15 }
  ): Promise<AnalysisResult> {
    const studentLogs = logs.filter(l => l.studentId === studentId);
    const studentProgress = progress.filter(p => p.studentId === studentId);

    if (studentLogs.length === 0) {
      return {
        studentId,
        weakPoints: [],
        strongPoints: [],
        recommendedProblems: [],
        overallProgress: 0,
        aiFeedback: "학습 데이터가 부족합니다.",
        recommendations: ["기초 문제부터 시작해보세요."]
      };
    }

    // Calculate weighted accuracy for each hierarchy ID
    const hierarchyPerformance: Record<string, { weightedCorrect: number; weightedTotal: number }> = {};

    studentLogs.forEach(log => {
      const pathParts = log.hierarchyPath.split('/');
      pathParts.forEach(hierarchyId => {
        if (!hierarchyId) return;
        if (!hierarchyPerformance[hierarchyId]) {
          hierarchyPerformance[hierarchyId] = { weightedCorrect: 0, weightedTotal: 0 };
        }

        const weight = difficultyWeights[log.difficulty] || 1;
        hierarchyPerformance[hierarchyId].weightedTotal += weight;
        if (log.isCorrect) {
          hierarchyPerformance[hierarchyId].weightedCorrect += weight;
        }
      });
    });

    const weakPoints: string[] = [];
    const strongPoints: string[] = [];

    Object.entries(hierarchyPerformance).forEach(([id, perf]) => {
      const accuracy = perf.weightedCorrect / perf.weightedTotal;
      if (accuracy < 0.4) {
        weakPoints.push(id);
      } else if (accuracy > 0.8) {
        strongPoints.push(id);
      }
    });

    // Simple overall progress calculation
    const overallProgress = studentProgress.reduce((acc, p) => acc + p.currentScore, 0) / (studentProgress.length || 1);

    // Generate AI Feedback using Gemini
    let aiFeedback = "분석 중입니다...";
    let recommendations: string[] = [];

    try {
      const prompt = `
        수학 학습 데이터를 분석하여 학생에게 줄 피드백과 추천 학습 방향을 작성해주세요.
        
        학습 통계:
        - 총 풀이 문항: ${studentLogs.length}
        - 취약 영역: ${weakPoints.join(', ')}
        - 강점 영역: ${strongPoints.join(', ')}
        - 전체 성취도: ${(overallProgress * 100).toFixed(1)}%
        
        피드백은 격려하는 톤으로 작성하고, 구체적인 학습 전략을 포함해주세요.
        응답은 JSON 형식으로 주세요: { "feedback": "...", "recommendations": ["...", "..."] }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      aiFeedback = result.feedback || "분석 결과가 생성되었습니다.";
      recommendations = result.recommendations || ["기본 개념 복습", "유형별 문제 풀이"];
    } catch (error) {
      console.error('AI Analysis Error:', error);
      aiFeedback = "AI 분석 중 오류가 발생했습니다. 기본 통계를 확인해주세요.";
    }

    return {
      studentId,
      weakPoints,
      strongPoints,
      recommendedProblems: [], // Mock: would normally fetch from a recommendation engine
      overallProgress,
      aiFeedback,
      recommendations
    };
  }

  /**
   * Updates ProgressMaster based on a new transaction log.
   */
  static updateProgress(currentProgress: ProgressMaster, log: TransactionLog): ProgressMaster {
    const totalAttempts = currentProgress.totalAttempts + 1;
    const correctAttempts = currentProgress.correctAttempts + (log.isCorrect ? 1 : 0);
    const newScore = (correctAttempts / totalAttempts);
    
    const trend = newScore > currentProgress.currentScore ? 'UP' : newScore < currentProgress.currentScore ? 'DOWN' : 'STABLE';

    return {
      ...currentProgress,
      currentScore: newScore,
      totalAttempts,
      correctAttempts,
      lastAttemptTimestamp: log.timestamp,
      trend,
    };
  }
}
