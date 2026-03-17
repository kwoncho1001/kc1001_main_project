import React, { useState, useEffect } from 'react';
import { GamificationService } from '../services/gamificationService';
import { GamificationStats, HeatmapData } from '../types/ability';
import { 
  Trophy, 
  TreePine, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar, 
  Play, 
  Share2, 
  Award,
  Zap,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * @interface StatCardProps
 * @description Properties for the reusable StatCard component.
 */
interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  label: string;
  value: string | number;
}

/**
 * @component StatCard
 * @description Reusable component for displaying quick statistics.
 */
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconColor, bgColor, label, value }) => (
  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex items-center gap-6">
    <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
      <Icon className={iconColor} size={32} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
      <p className="text-3xl font-serif italic">{value}</p>
    </div>
  </div>
);

export const GamificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats>({
    solvedCount: 124,
    avgDifficulty: 3.5,
    accuracy: 82,
    streakDays: 12,
    totalPoints: 0,
    level: 1,
    treeGrowth: 0
  });

  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [showTimelapse, setShowTimelapse] = useState(false);

  useEffect(() => {
    const points = GamificationService.calculatePoints(stats);
    const level = GamificationService.getLevel(points);
    const growth = GamificationService.getTreeGrowth(points);
    setStats(prev => ({ ...prev, totalPoints: points, level, treeGrowth: growth }));
    setHeatmap(GamificationService.getMockHeatmap());
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F0] overflow-y-auto p-8">
      <header className="mb-12 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-olive-600 mb-2">
            <Leaf size={18} className="text-[#5A5A40]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5A5A40]/60">Your Growth Journey</span>
          </div>
          <h1 className="text-5xl font-serif italic text-[#1A1A1A]">The Learning Forest</h1>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-white border border-black/5 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:shadow-md transition-all">
            <Share2 size={16} />
            Share Report
          </button>
          <button className="bg-[#5A5A40] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#4A4A30] transition-all">
            <Award size={16} />
            Redeem Items
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Tree Growth Visualization */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-10 shadow-sm border border-black/5 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-serif italic mb-8">Current Growth State</h2>
            <div className="flex items-end justify-center h-64 gap-8">
              {/* Visual Tree Representation */}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 0.8 + (stats.treeGrowth / 500), opacity: 1 }}
                className="relative"
              >
                <TreePine size={180} className="text-[#5A5A40]" />
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-4 -right-4 bg-amber-400 text-white p-2 rounded-full shadow-lg"
                >
                  <Zap size={20} fill="currentColor" />
                </motion.div>
              </motion.div>

              <div className="flex flex-col gap-4 pb-4">
                <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Points</p>
                  <p className="text-3xl font-serif italic">{stats.totalPoints.toLocaleString()} TP</p>
                </div>
                <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Growth Level</p>
                  <p className="text-3xl font-serif italic">Lv. {stats.level}</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Next Level Progress</span>
                <span className="text-xs font-black">{stats.treeGrowth.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F0] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.treeGrowth}%` }}
                  className="h-full bg-[#5A5A40]"
                />
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5F5F0] rounded-full -mr-32 -mt-32 opacity-50" />
        </div>

        {/* Quick Stats Cards */}
        <div className="flex flex-col gap-6">
          <StatCard 
            icon={Flame} 
            iconColor="text-orange-500" 
            bgColor="bg-orange-50" 
            label="Current Streak" 
            value={`${stats.streakDays} Days`} 
          />
          <StatCard 
            icon={Target} 
            iconColor="text-emerald-500" 
            bgColor="bg-emerald-50" 
            label="Accuracy Rate" 
            value={`${stats.accuracy}%`} 
          />
          <StatCard 
            icon={TrendingUp} 
            iconColor="text-blue-500" 
            bgColor="bg-blue-50" 
            label="Problems Solved" 
            value={stats.solvedCount} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Heatmap */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif italic">Learning Intensity Heatmap</h2>
            <div className="flex items-center gap-2 text-xs font-bold opacity-40">
              <Calendar size={14} />
              Last 30 Days
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {heatmap.map((day, i) => (
              <div 
                key={i}
                className="aspect-square rounded-lg transition-all hover:scale-110 cursor-help"
                style={{ 
                  backgroundColor: day.intensity > 0 
                    ? `rgba(90, 90, 64, ${0.2 + day.intensity * 0.8})` 
                    : '#F5F5F0' 
                }}
                title={`${day.date}: ${Math.floor(day.intensity * 100)}% intensity`}
              />
            ))}
          </div>
          
          <div className="mt-8 flex items-center justify-end gap-2">
            <span className="text-[10px] font-bold opacity-30">Less</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(90, 90, 64, ${v})` }} />
              ))}
            </div>
            <span className="text-[10px] font-bold opacity-30">More</span>
          </div>
        </div>

        {/* Handwriting Time-lapse Preview */}
        <div className="bg-[#1A1A1A] rounded-[32px] p-10 shadow-xl border border-white/5 relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif italic text-white">Handwriting Time-lapse</h2>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest">
                Latest Session
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center border border-white/10 rounded-2xl bg-black/20 relative">
              {showTimelapse ? (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center gap-4">
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="h-full bg-amber-400"
                      />
                   </div>
                   <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest animate-pulse">Replaying strokes...</p>
                </div>
              ) : (
                <button 
                  onClick={() => setShowTimelapse(true)}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl"
                >
                  <Play size={32} fill="currentColor" className="ml-1" />
                </button>
              )}
            </div>

            <p className="mt-6 text-white/40 text-xs text-center italic">
              "Your effort is visible. Every stroke counts towards your growth."
            </p>
          </div>

          {/* Decorative Glow */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
