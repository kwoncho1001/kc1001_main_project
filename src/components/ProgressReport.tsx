import React from 'react';
import { AnalysisResult } from '../types/ability';
import { Brain, TrendingUp, Target, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ProgressReportProps {
  analysis: AnalysisResult;
  loading?: boolean;
}

export const ProgressReport: React.FC<ProgressReportProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/40">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI 분석 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* AI Feedback Section */}
      <div className="glass p-10 rounded-[48px] relative overflow-hidden">
        <div className="absolute inset-0 apex-grid opacity-5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Brain size={16} className="text-apex-accent" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">AI 학습 분석 및 피드백</h3>
          </div>
          <div className="p-8 bg-apex-accent/5 border border-apex-accent/20 rounded-3xl">
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {analysis.aiFeedback || "학습 데이터를 분석하여 맞춤형 피드백을 생성합니다."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendations */}
        <div className="glass p-10 rounded-[48px] relative overflow-hidden">
          <div className="absolute inset-0 apex-grid opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Target size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">추천 학습 방향</h3>
            </div>
            <div className="space-y-4">
              {analysis.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-apex-accent/20 flex items-center justify-center text-apex-accent">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-xs font-bold text-white/80">{rec}</span>
                </div>
              ))}
              {(!analysis.recommendations || analysis.recommendations.length === 0) && (
                <p className="text-xs text-white/30 italic">추천 사항이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* Weak/Strong Points */}
        <div className="glass p-10 rounded-[48px] relative overflow-hidden">
          <div className="absolute inset-0 apex-grid opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">영역별 성취도 분석</h3>
            </div>
            <div className="space-y-6">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-red-500 mb-3">집중 보완 필요</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.weakPoints.map(id => (
                    <span key={id} className="px-3 py-1 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                      {id}
                    </span>
                  ))}
                  {analysis.weakPoints.length === 0 && <span className="text-[8px] text-white/20">없음</span>}
                </div>
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-apex-accent mb-3">우수 영역</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.strongPoints.map(id => (
                    <span key={id} className="px-3 py-1 bg-apex-accent/10 text-apex-accent text-[8px] font-black uppercase tracking-widest rounded-full border border-apex-accent/20">
                      {id}
                    </span>
                  ))}
                  {analysis.strongPoints.length === 0 && <span className="text-[8px] text-white/20">없음</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
