import React, { useState, useEffect } from 'react';
import { GamificationService } from '../services/gamificationService';
import { FirebaseService } from '../services/firebaseService';
import { GamificationStats, HeatmapData } from '../types/ability';
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  Zap,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export const GamificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats>({
    solvedCount: 0,
    avgDifficulty: 0,
    accuracy: 0,
    streakDays: 0,
    totalPoints: 0,
    level: 1,
    treeGrowth: 0
  });

  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync stats from Firestore
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToGamificationStats((remoteStats) => {
      if (remoteStats) {
        setStats(remoteStats);
      } else {
        // Initialize if no stats exist
        const initialPoints = GamificationService.calculatePoints(stats);
        const initialLevel = GamificationService.getLevel(initialPoints);
        const initialGrowth = GamificationService.getTreeGrowth(initialPoints);
        const newStats = { ...stats, totalPoints: initialPoints, level: initialLevel, treeGrowth: initialGrowth };
        setStats(newStats);
        FirebaseService.saveGamificationStats(newStats);
      }
      setLoading(false);
    });
    setHeatmap(GamificationService.getMockHeatmap());
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin text-apex-accent"><RefreshCw size={32} /></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-apex-accent mb-2">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] glow-text">학습 현황</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase">나의 등급</h1>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">현재 등급</span>
          <span className="text-3xl font-bold tracking-tighter uppercase text-apex-accent">
            {stats.level >= 10 ? '엘리트' : stats.level >= 5 ? '상급' : '초보'}
          </span>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass rounded-[40px] p-8 relative overflow-hidden group">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-apex-accent/10 rounded-2xl border border-apex-accent/20">
                <Zap size={24} className="text-apex-accent" />
              </div>
              <span className="font-mono text-[10px] text-white/40">LVL.{stats.level}</span>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">총 포인트</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold tracking-tighter">{stats.totalPoints.toLocaleString()}</span>
              <span className="text-xs font-mono text-white/20">TP</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.treeGrowth}%` }}
                className="h-full bg-apex-accent shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-[40px] p-8 relative overflow-hidden group">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-apex-accent/10 rounded-2xl border border-apex-accent/20">
                <Flame size={24} className="text-apex-accent" />
              </div>
              <span className="font-mono text-[10px] text-white/40">ACTIVE</span>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">연속 학습일</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tighter">{stats.streakDays}</span>
              <span className="text-xs font-mono text-white/20 uppercase tracking-widest">일</span>
            </div>
            <p className="mt-4 text-[10px] text-white/40 font-medium">매일 꾸준히 학습하여 더 많은 혜택을 받아보세요.</p>
          </div>
        </div>

        <div className="glass rounded-[40px] p-8 relative overflow-hidden group">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-apex-accent/10 rounded-2xl border border-apex-accent/20">
                <Target size={24} className="text-apex-accent" />
              </div>
              <span className="font-mono text-[10px] text-white/40">ACCURACY</span>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">정밀도</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tighter">{stats.accuracy}</span>
              <span className="text-xs font-mono text-white/20 uppercase tracking-widest">%</span>
            </div>
            <p className="mt-4 text-[10px] text-white/40 font-medium">{stats.solvedCount}개의 노드 분석 결과 기반</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-0">
        {/* Heatmap Section */}
        <div className="glass rounded-[40px] p-10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold tracking-tight uppercase">활동 히트맵</h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
              <Calendar size={14} />
              최근 30주기
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-3">
              {heatmap.map((day, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-lg transition-all hover:scale-110 cursor-help border border-white/5"
                  style={{ 
                    backgroundColor: day.intensity > 0 
                      ? `rgba(16, 185, 129, ${0.1 + day.intensity * 0.9})` 
                      : 'rgba(255, 255, 255, 0.02)' 
                  }}
                  title={`${day.date}: ${Math.floor(day.intensity * 100)}% 강도`}
                />
              ))}
            </div>
            
            <div className="mt-8 flex items-center justify-end gap-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">낮음</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map(v => (
                  <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(16, 185, 129, ${v})` }} />
                ))}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">높음</span>
            </div>
          </div>
        </div>

        {/* Recent Milestones */}
        <div className="glass rounded-[40px] p-10 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold tracking-tight uppercase">최근 마일스톤</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-apex-accent hover:glow-text transition-all">아카이브 보기</button>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
            {[
              { label: '첫 학습 시작', date: '2024.03.15', xp: '+500 TP' },
              { label: '첫 시험 분석 완료', date: '2024.03.14', xp: '+250 TP' },
              { label: '꾸준한 학습자', date: '2024.03.12', xp: '+1000 TP' },
              { label: '학습 패턴 분석', date: '2024.03.10', xp: '+150 TP' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-apex-accent/10 flex items-center justify-center text-apex-accent group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight mb-1">{m.label}</h4>
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{m.date}</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-apex-accent font-bold">{m.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
