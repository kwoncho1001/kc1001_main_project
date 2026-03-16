import { GamificationStats, HeatmapData } from '../types/ability';

export class GamificationService {
  /**
   * Calculates total points based on the provided formula:
   * Total_Points = (Solved_Count * Avg_Difficulty * Accuracy_Weight) + Streak_Bonus
   */
  static calculatePoints(stats: Pick<GamificationStats, 'solvedCount' | 'avgDifficulty' | 'accuracy' | 'streakDays'>): number {
    const accuracyWeight = stats.accuracy / 100;
    const streakBonus = stats.streakDays * 50;
    return Math.floor((stats.solvedCount * stats.avgDifficulty * accuracyWeight) + streakBonus);
  }

  static getLevel(points: number): number {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  static getTreeGrowth(points: number): number {
    const levelPoints = points % 1000;
    return (levelPoints / 1000) * 100;
  }

  static getMockHeatmap(): HeatmapData[] {
    const data: HeatmapData[] = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        intensity: Math.random() > 0.3 ? Math.random() : 0
      });
    }
    return data;
  }
}
