import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Layers, Zap, TrendingUp, ChevronRight, Info } from 'lucide-react';
import { AbilityLevel, ABILITY_WEIGHTS, BehaviorCorrectionOutput, AbilityScore } from '../types/ability';

interface AbilityTrackerProps {
  scores: Record<string, AbilityScore>;
  hierarchy: {
    id: string;
    name: string;
    level: AbilityLevel;
    parentId?: string;
  }[];
  lastBehavior?: BehaviorCorrectionOutput | null;
}

export const AbilityTracker: React.FC<AbilityTrackerProps> = ({ scores, hierarchy, lastBehavior }) => {
  const radarData = useMemo(() => {
    return hierarchy
      .filter(h => h.level === 'COURSE')
      .map(h => ({
        subject: h.name,
        score: Math.round((scores[h.id]?.score ?? 0.5) * 100),
      }));
  }, [scores, hierarchy]);

  const tagData = useMemo(() => {
    return hierarchy
      .filter(h => h.level === 'TYPE')
      .map(h => ({
        name: h.name,
        score: scores[h.id]?.score ?? 0.5,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [scores, hierarchy]);

  const getLevelColor = (level: AbilityLevel) => {
    switch (level) {
      case 'FIELD': return 'bg-purple-500';
      case 'COURSE': return 'bg-apex-accent';
      case 'MAJOR_CHAPTER': return 'bg-blue-500';
      case 'MINOR_CHAPTER': return 'bg-amber-500';
      case 'TYPE': return 'bg-rose-500';
      default: return 'bg-white/20';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2 flex items-center gap-4">
            <Layers className="text-apex-accent" size={40} />
            학습 성취도 분석
          </h1>
          <p className="text-white/40 font-medium">5단계 학습 성취도 분석 모델</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(ABILITY_WEIGHTS).reverse().map(([level, weight]) => (
            <div key={level} className="flex items-center gap-2 px-4 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
              <div className={`w-2 h-2 rounded-full ${getLevelColor(level as AbilityLevel)}`}></div>
              <span className="text-white/40">{level}:</span>
              <span className="text-white">{weight * 100}%</span>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart: Subject Overview */}
        <div className="lg:col-span-2 glass rounded-[48px] p-8 relative overflow-hidden">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
                <TrendingUp size={16} className="text-apex-accent" />
                학습 성취도
              </h2>
              <div className="text-[10px] font-black text-white/20 flex items-center gap-2 uppercase tracking-widest">
                <Info size={14} />
                가중치 합산
              </div>
            </div>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Radar
                    name="Ability"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Tags / Weaknesses */}
        <div className="space-y-8">
          <div className="glass rounded-[40px] p-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-3">
              <Zap size={16} className="text-amber-500" />
              주요 학습 주제
            </h2>
            <div className="space-y-8">
              {tagData.map((tag, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-lg font-bold tracking-tight text-white/80">{tag.name}</span>
                    <span className="text-sm font-black text-apex-accent">{(tag.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-apex-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{ width: `${tag.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-apex-accent/10 border border-apex-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={64} className="text-apex-accent" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-apex-accent uppercase tracking-[0.2em] mb-4">학습 데이터 전파</h3>
              <p className="text-sm text-white/70 leading-relaxed font-medium mb-8">
                "미적분" 태그 업데이트는 가중치가 감소하면서 "전공: 해석학" 및 "과목: 수학"으로 전파됩니다.
              </p>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                상세 계층 보기 <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {lastBehavior && (
            <div className="glass rounded-[40px] p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-3">
                <Info size={16} className="text-apex-accent" />
                행동 분석
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">태그</span>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                    lastBehavior.behaviorTag === 'NORMAL' ? 'bg-apex-accent/10 text-apex-accent' :
                    lastBehavior.behaviorTag === 'LUCKY_GUESS' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {lastBehavior.behaviorTag === 'NORMAL' ? '정상' : 
                     lastBehavior.behaviorTag === 'LUCKY_GUESS' ? '찍기' : '실수'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">보정</span>
                  <span className="text-lg font-bold tracking-tighter">x{lastBehavior.correctionFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">신뢰도</span>
                  <span className="text-lg font-bold tracking-tighter">{(lastBehavior.reliabilityIndex * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Hierarchy List */}
      <div className="glass rounded-[48px] overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">계층적 세부 분석</h2>
        </div>
        <div className="divide-y divide-white/5">
          {hierarchy.filter(h => h.level === 'FIELD' || h.level === 'COURSE').map((item) => (
            <div key={item.id} className="p-8 hover:bg-white/5 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${getLevelColor(item.level)} flex items-center justify-center text-apex-black font-black text-xl shadow-lg`}>
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold tracking-tight text-white/90 mb-1">{item.name}</h4>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">{
                      item.level === 'FIELD' ? '분야' : 
                      item.level === 'COURSE' ? '과목' : 
                      item.level === 'MAJOR_CHAPTER' ? '대단원' : 
                      item.level === 'MINOR_CHAPTER' ? '소단원' : '유형'
                    }</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">현재 숙련도</p>
                    <p className="text-3xl font-bold tracking-tighter text-white">{(scores[item.id]?.score ?? 0.5).toFixed(3)}</p>
                    <p className="text-[10px] font-black text-apex-accent uppercase tracking-widest mt-1">해결: {scores[item.id]?.solvedProblemCount ?? 0}</p>
                  </div>
                  <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden hidden md:block">
                    <div 
                      className={`h-full ${getLevelColor(item.level)} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                      style={{ width: `${(scores[item.id]?.score ?? 0.5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
