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
      case 'FIELD': return 'bg-accent';
      case 'COURSE': return 'bg-accent';
      case 'MAJOR_CHAPTER': return 'bg-info';
      case 'MINOR_CHAPTER': return 'bg-warning';
      case 'TYPE': return 'bg-error';
      default: return 'bg-foreground/20';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold heading-tight uppercase mb-2 flex items-center gap-4">
            <Layers className="text-accent" size={40} />
            학습 성취도 분석
          </h1>
          <p className="text-muted-foreground font-medium">5단계 학습 성취도 분석 모델</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(ABILITY_WEIGHTS).reverse().map(([level, weight]) => (
            <div key={level} className="flex items-center gap-2 px-4 py-2 card rounded-full text-[10px] font-bold uppercase tracking-widest border border-border">
              <div className={`w-2 h-2 rounded-full ${getLevelColor(level as AbilityLevel)}`}></div>
              <span className="text-muted-foreground">{level}:</span>
              <span className="text-foreground">{weight * 100}%</span>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart: Subject Overview */}
        <div className="lg:col-span-2 card p-8 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-micro flex items-center gap-3">
                <TrendingUp size={16} className="text-accent" />
                학습 성취도
              </h2>
              <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <Info size={14} />
                가중치 합산
              </div>
            </div>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Radar
                    name="Ability"
                    dataKey="score"
                    stroke="var(--accent)"
                    fill="var(--accent)"
                    fillOpacity={0.15}
                    dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--background)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Tags / Weaknesses */}
        <div className="space-y-8">
          <div className="card p-8">
            <h2 className="text-micro mb-8 flex items-center gap-3">
              <Zap size={16} className="text-warning" />
              주요 학습 주제
            </h2>
            <div className="space-y-8">
              {tagData.map((tag, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-lg font-bold tracking-tight text-foreground">{tag.name}</span>
                    <span className="text-sm font-bold text-accent">{(tag.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_var(--accent-glow)]"
                      style={{ width: `${tag.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-accent/10 border border-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={64} className="text-accent" />
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4">학습 데이터 전파</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-8">
                "미적분" 태그 업데이트는 가중치가 감소하면서 "전공: 해석학" 및 "과목: 수학"으로 전파됩니다.
              </p>
              <button className="w-full py-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                상세 계층 보기 <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {lastBehavior && (
            <div className="card p-8">
              <h2 className="text-micro mb-8 flex items-center gap-3">
                <Info size={16} className="text-accent" />
                행동 분석
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">태그</span>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${
                    lastBehavior.behaviorTag === 'NORMAL' ? 'bg-accent/10 text-accent' :
                    lastBehavior.behaviorTag === 'LUCKY_GUESS' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    {lastBehavior.behaviorTag === 'NORMAL' ? '정상' : 
                     lastBehavior.behaviorTag === 'LUCKY_GUESS' ? '찍기' : '실수'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">보정</span>
                  <span className="text-lg font-bold tracking-tighter text-foreground">x{lastBehavior.correctionFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">신뢰도</span>
                  <span className="text-lg font-bold tracking-tighter text-foreground">{(lastBehavior.reliabilityIndex * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Hierarchy List */}
      <div className="card overflow-hidden">
        <div className="p-8 border-b border-border">
          <h2 className="text-micro">계층적 세부 분석</h2>
        </div>
        <div className="divide-y divide-border">
          {hierarchy.filter(h => h.level === 'FIELD' || h.level === 'COURSE').map((item) => (
            <div key={item.id} className="p-8 hover:bg-foreground/5 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${getLevelColor(item.level)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold tracking-tight text-foreground mb-1">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{
                      item.level === 'FIELD' ? '분야' : 
                      item.level === 'COURSE' ? '과목' : 
                      item.level === 'MAJOR_CHAPTER' ? '대단원' : 
                      item.level === 'MINOR_CHAPTER' ? '소단원' : '유형'
                    }</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">현재 숙련도</p>
                    <p className="text-3xl font-bold tracking-tighter text-foreground">{(scores[item.id]?.score ?? 0.5).toFixed(3)}</p>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">해결: {scores[item.id]?.solvedProblemCount ?? 0}</p>
                  </div>
                  <div className="w-48 h-3 bg-muted rounded-full overflow-hidden hidden md:block">
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
