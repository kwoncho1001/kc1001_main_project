import React, { useState } from 'react';
import { Calculator, Save, CheckCircle2, AlertCircle, ListChecks, History } from 'lucide-react';
import { ExamScorerService } from '../services/examScorerService';
import { ExamPaperMetadata, ExamScoringResponse } from '../types/ability';

interface ExamScorerProps {
  onScoreCalculated?: (result: ExamScoringResponse) => void;
}

export const ExamScorer: React.FC<ExamScorerProps> = ({ onScoreCalculated }) => {
  const [examId, setExamId] = useState('exam-1');
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [calculatedResult, setCalculatedResult] = useState<ExamScoringResponse | null>(null);

  // Mock metadata
  const MOCK_METADATA: ExamPaperMetadata = {
    examId: 'exam-1',
    questions: Array.from({ length: 10 }, (_, i) => ({
      questionId: `p${i + 1}`,
      weight: 10
    }))
  };

  const handleToggleResult = (qId: string) => {
    setResults(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleCalculate = () => {
    const score = ExamScorerService.calculateScore(
      { examId, userId: 'user-123', gradedResults: results },
      MOCK_METADATA
    );
    const result = ExamScorerService.getMockRank(score);
    setCalculatedResult(result);
    if (onScoreCalculated) onScoreCalculated(result);
  };

  return (
    <div className="glass p-10 rounded-[48px] relative overflow-hidden">
      <div className="absolute inset-0 apex-grid opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-apex-accent/20 flex items-center justify-center text-apex-accent">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tighter uppercase">시험 점수 입력</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">수동 채점 및 성적 산출</p>
            </div>
          </div>
          <button 
            onClick={handleCalculate}
            className="px-8 py-3 bg-white text-apex-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-apex-accent transition-all flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            성적 산출
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <ListChecks size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">문항별 채점 결과</h3>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {MOCK_METADATA.questions.map((q, idx) => (
                <button 
                  key={q.questionId}
                  onClick={() => handleToggleResult(q.questionId)}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    results[q.questionId] 
                      ? 'bg-apex-accent/20 border-apex-accent/50 text-apex-accent shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                      : 'glass border-white/5 text-white/20 hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] font-black">{idx + 1}</span>
                  {results[q.questionId] ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <History size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">산출 결과 요약</h3>
            </div>

            {calculatedResult ? (
              <div className="space-y-4">
                <div className="p-8 rounded-3xl bg-apex-accent/10 border border-apex-accent/20 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-apex-accent mb-2">최종 점수</span>
                  <span className="text-5xl font-bold tracking-tighter text-apex-accent">{calculatedResult.totalScore.toFixed(1)}</span>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">예상 석차</span>
                  <span className="text-3xl font-bold tracking-tighter text-white">{calculatedResult.rank} / {calculatedResult.totalCandidates}</span>
                </div>
              </div>
            ) : (
              <div className="p-12 glass border-white/5 rounded-[32px] text-center opacity-20">
                <Calculator size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">데이터를 입력해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
