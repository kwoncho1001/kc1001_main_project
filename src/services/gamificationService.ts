import { GamificationStats, HeatmapData } from '../types/ability';

/**
 * @fileoverview Service for calculating gamification metrics and visual rewards.
 * Applies DRY principles and strict typing for maintainability.
 */
export class GamificationService {
  /**
   * Calculates total points based on the provided learning statistics.
   * Formula: Total_Points = (Solved_Count * Avg_Difficulty * Accuracy_Weight) + Streak_Bonus
   * 
   * @param {Pick<GamificationStats, 'solvedCount' | 'avgDifficulty' | 'accuracy' | 'streakDays'>} stats - User's learning stats.
   * @returns {number} The calculated total points.
   * @throws {Error} If input statistics contain invalid (negative) values.
   */
  static calculatePoints(stats: Pick<GamificationStats, 'solvedCount' | 'avgDifficulty' | 'accuracy' | 'streakDays'>): number {
    try {
      if (stats.solvedCount < 0 || stats.avgDifficulty < 0 || stats.accuracy < 0 || stats.streakDays < 0) {
        throw new Error("Gamification stats cannot contain negative values.");
      }
      
      // Normalize accuracy to a 0.0 - 1.0 weight
      const accuracyWeight = Math.max(0, Math.min(1, stats.accuracy / 100));
      const streakBonus = stats.streakDays * 50;
      
      return Math.floor((stats.solvedCount * stats.avgDifficulty * accuracyWeight) + streakBonus);
    } catch (error) {
      console.error("[GamificationService] Error calculating points:", error);
      return 0; // Safe fallback
    }
  }

  /**
   * Determines the user's growth level based on total points.
   * 
   * @param {number} points - The user's total accumulated points.
   * @returns {number} The calculated level (minimum 1).
   */
  static getLevel(points: number): number {
    try {
      if (points < 0) throw new Error("Points cannot be negative.");
      return Math.floor(Math.sqrt(points / 100)) + 1;
    } catch (error) {
      console.error("[GamificationService] Error calculating level:", error);
      return 1;
    }
  }

  /**
   * Calculates the progress towards the next level as a percentage (0-100).
   * 
   * @param {number} points - The user's total accumulated points.
   * @returns {number} Percentage of tree growth (0 to 100).
   */
  static getTreeGrowth(points: number): number {
    try {
      if (points < 0) throw new Error("Points cannot be negative.");
      const levelPoints = points % 1000;
      return (levelPoints / 1000) * 100;
    } catch (error) {
      console.error("[GamificationService] Error calculating tree growth:", error);
      return 0;
    }
  }

  /**
   * Generates mock heatmap data for the last 30 days.
   * In a real environment, this would fetch from a database.
   * 
   * @returns {HeatmapData[]} Array of heatmap intensity data.
   */
  static getMockHeatmap(): HeatmapData[] {
    try {
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
    } catch (error) {
      console.error("[GamificationService] Error generating mock heatmap:", error);
      return [];
    }
  }
}
