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
    <div className={`glass p-8 rounded-[40px] relative overflow-hidden group ${className}`}>
      <div className="absolute inset-0 apex-grid opacity-5 group-hover:opacity-10 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-apex-accent mb-2 block">진단 결과</span>
            <h3 className="text-2xl font-bold tracking-tighter uppercase">{title}</h3>
            <p className="text-[10px] text-white/40 font-mono mt-1">{date}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-apex-accent/20 flex items-center justify-center text-apex-accent">
            <Trophy size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">점수</span>
            <span className="text-3xl font-bold tracking-tighter text-white">{scoring.totalScore.toFixed(1)}</span>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">석차</span>
            <span className="text-3xl font-bold tracking-tighter text-white">{scoring.rank}<span className="text-xs text-white/40 ml-1">/ {scoring.totalCandidates}</span></span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-white/40">백분위</span>
            <span className="text-apex-accent">{percentile.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-apex-accent shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
              style={{ width: `${percentile}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-apex-accent/10 rounded-2xl border border-apex-accent/20">
          <TrendingUp size={16} className="text-apex-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-apex-accent">
            상위 { (100 - percentile).toFixed(1) }% 수준입니다
          </span>
        </div>
      </div>
    </div>
  );
};
