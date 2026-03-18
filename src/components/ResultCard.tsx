import React from 'react';
import { Trophy, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ExamScoringResponse } from '../types/ability';

interface ResultCardProps {
  scoring: ExamScoringResponse;
  title: string;
  date: string;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  scoring, 
  title, 
  date,
  className = ''
}) => {
  const percentile = (1 - scoring.rank / scoring.totalCandidates) * 100;

  return (
    <div className={`card p-8 relative overflow-hidden group ${className}`}>
      <div className="absolute inset-0 grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-micro text-accent mb-2 block">진단 결과</span>
            <h3 className="text-2xl font-bold tracking-tighter uppercase">{title}</h3>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">{date}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
            <Trophy size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-background/50 border border-border">
            <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">점수</span>
            <span className="text-3xl font-bold tracking-tighter text-foreground">{scoring.totalScore.toFixed(1)}</span>
          </div>
          <div className="p-6 rounded-3xl bg-background/50 border border-border">
            <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">석차</span>
            <span className="text-3xl font-bold tracking-tighter text-foreground">{scoring.rank}<span className="text-xs text-muted-foreground ml-1">/ {scoring.totalCandidates}</span></span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">백분위</span>
            <span className="text-accent">{percentile.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-background/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent shadow-[0_0_10px_var(--accent-glow)] transition-all duration-1000"
              style={{ width: `${percentile}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-accent/10 rounded-2xl border border-accent/20">
          <TrendingUp size={16} className="text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            상위 { (100 - percentile).toFixed(1) }% 수준입니다
          </span>
        </div>
      </div>
    </div>
  );
};
