import React, { useState, useEffect, useCallback } from 'react';
import { DigitalLearningCanvas } from './canvas/DigitalLearningCanvas';
import { useExamTimer } from '../hooks/useExamTimer';
import { useBookmarks } from '../hooks/useBookmarks';
import { ExamManagerService } from '../services/examManagerService';
import { ScoreCalculationService } from '../services/scoreCalculationService';
import { Timer, AlertCircle, CheckCircle2, Save, Wifi, WifiOff, Layout, ListChecks, History, Clock, Star, Trophy, Users } from 'lucide-react';
import { Problem, SolvingResult, ExamStatus, ExamScoringResponse } from '../types/ability';

const EXAM_DURATION = 60 * 30; // 30 minutes

export const ExamInterface: React.FC<{ 
  problems: Problem[], 
  initialProblemId?: string | null,
  onSolve?: (result: SolvingResult) => void 
}> = ({ problems, initialProblemId, onSolve }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() => {
    if (initialProblemId) {
      const index = problems.findIndex(p => p.id === initialProblemId);
      return index !== -1 ? index : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (initialProblemId) {
      const index = problems.findIndex(p => p.id === initialProblemId);
      if (index !== -1) setCurrentProblemIndex(index);
    }
  }, [initialProblemId, problems]);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('exam_answers_v3');
    return saved ? JSON.parse(saved) : {};
  });
  const [examStatus, setExamStatus] = useState<ExamStatus>('ACTIVE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scoringResult, setScoringResult] = useState<ExamScoringResponse | null>(null);

  const currentProblem = problems[currentProblemIndex];

  // Initialize Precision Timer Hook
  const { remainingTime, perQuestionTime, isTimeUp, blurCount } = useExamTimer(
    60 * 30,
    currentProblem.id,
    () => {
      const finalState = ExamManagerService.handleTimeout(answers);
      setExamStatus(finalState.status);
    }
  );

  // Initialize Bookmarks Hook
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const handleToggleBookmark = () => {
    const autoTags = ['Saved'];
    toggleBookmark(currentProblem.id, autoTags);
  };
// ... (rest of the component)

  // Sync answers with localStorage
  useEffect(() => {
    if (examStatus === 'ACTIVE') {
      localStorage.setItem('exam_answers_v3', JSON.stringify(answers));
    }
  }, [answers, examStatus]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAnswerChange = (value: string) => {
    if (examStatus === 'SUBMITTED' || examStatus === 'TIMED_OUT' || isTimeUp) return;
    setAnswers(prev => ({
      ...prev,
      [currentProblem.id]: value
    }));
  };

  const handleSubmit = useCallback(() => {
    if (examStatus === 'SUBMITTED' || examStatus === 'TIMED_OUT') return;
    
    const finalState = ExamManagerService.handleSubmit(answers);
    setExamStatus(finalState.status);

    const gradedResults: Record<string, boolean> = {};
    problems.forEach(p => {
      gradedResults[p.id] = !!answers[p.id] && Math.random() > 0.3;
    });

    const result = ScoreCalculationService.processExamResult({
      examId: 'exam-1',
      userId: 'user-123',
      gradedResults
    });
    setScoringResult(result);
    
    localStorage.removeItem('exam_answers_v3');
  }, [answers, problems, examStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatMs = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (examStatus === 'SUBMITTED' || examStatus === 'TIMED_OUT') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="glass p-12 rounded-[48px] max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center ${examStatus === 'SUBMITTED' ? 'bg-apex-accent/20 text-apex-accent' : 'bg-amber-500/20 text-amber-500'}`}>
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter uppercase mb-4">
              {examStatus === 'SUBMITTED' ? '세션 종료' : '시간 초과'}
            </h1>
            <p className="text-white/40 mb-12 font-medium">
              {examStatus === 'SUBMITTED' 
                ? '시험이 완료되었습니다. 성능 데이터가 성공적으로 저장되었습니다.' 
                : '제한 시간이 초과되어 시험이 종료되었습니다.'}
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">총 소요 시간</span>
                <span className="text-3xl font-bold tracking-tighter">{formatTime(EXAM_DURATION - remainingTime)}</span>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">집중력 위반</span>
                <span className="text-3xl font-bold tracking-tighter text-red-500">{blurCount}</span>
              </div>
            </div>

            {scoringResult && (
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-3xl bg-apex-accent/10 border border-apex-accent/20">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-apex-accent mb-2">지능 점수</span>
                  <span className="text-4xl font-bold tracking-tighter text-apex-accent">{scoringResult.totalScore.toFixed(1)}</span>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">글로벌 순위</span>
                  <span className="text-4xl font-bold tracking-tighter">{scoringResult.rank}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-6 bg-white text-apex-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-apex-accent transition-all"
            >
              커맨드 센터로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full gap-8">
      {/* Left: Problem Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className={`glass px-6 py-3 rounded-2xl flex items-center gap-3 ${remainingTime < 60 ? 'bg-red-500/10 border-red-500/50' : ''}`}>
              <Clock size={18} className={remainingTime < 60 ? 'text-red-500' : 'text-apex-accent'} />
              <span className={`font-mono text-xl font-bold tracking-tighter ${remainingTime < 60 ? 'text-red-500' : ''}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
            {!isOnline && (
              <div className="px-4 py-2 bg-red-500/20 text-red-500 rounded-xl border border-red-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <WifiOff size={14} /> 오프라인 모드
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">활성 노드</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tighter">{currentProblemIndex + 1}</span>
                <span className="text-xs text-white/20">/ {problems.length}</span>
              </div>
            </div>
            <button 
              onClick={handleToggleBookmark}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                isBookmarked(currentProblem.id) 
                  ? 'bg-apex-accent/20 border-apex-accent/50 text-apex-accent shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'glass border-white/5 text-white/20 hover:text-white/60'
              }`}
            >
              <Star size={20} className={isBookmarked(currentProblem.id) ? 'fill-apex-accent' : ''} />
            </button>
          </div>
        </header>

        <div className="flex-1 glass rounded-[48px] p-2 relative overflow-hidden group">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="w-full h-full rounded-[40px] relative overflow-hidden bg-black/40">
            <DigitalLearningCanvas />
            
            {/* Floating Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 glass p-2 rounded-3xl shadow-2xl">
              <button 
                disabled={currentProblemIndex === 0}
                onClick={() => setCurrentProblemIndex(i => i - 1)}
                className="px-8 py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 hover:bg-white/10 rounded-2xl transition-all"
              >
                이전
              </button>
              <div className="w-px h-6 bg-white/10" />
              <button 
                disabled={currentProblemIndex === problems.length - 1}
                onClick={() => setCurrentProblemIndex(i => i + 1)}
                className="px-8 py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 hover:bg-white/10 rounded-2xl transition-all"
              >
                다음 노드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Answer Panel */}
      <aside className="w-96 flex flex-col gap-8">
        <div className="glass rounded-[40px] p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">응답 매트릭스</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-apex-accent">
              <div className="w-1.5 h-1.5 rounded-full bg-apex-accent animate-pulse"></div>
              동기화됨
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3">노드 지능</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-tight">문제 {currentProblemIndex + 1}</span>
                <span className="font-mono text-xs text-apex-accent">{formatMs(perQuestionTime[currentProblem.id] || 0)}</span>
              </div>
            </div>

            {currentProblem.type === 'multiple' ? (
              <div className="grid grid-cols-2 gap-3">
                {currentProblem.options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerChange(opt)}
                    className={`h-16 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                      answers[currentProblem.id] === opt 
                        ? 'bg-white text-apex-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-[1.02]' 
                        : 'glass border-white/5 hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea 
                  className="w-full h-48 p-6 glass border-white/5 rounded-3xl text-sm focus:outline-none focus:border-apex-accent/50 transition-all resize-none font-medium leading-relaxed"
                  placeholder="정답 입력..."
                  value={answers[currentProblem.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="glass rounded-[40px] p-8 flex-1 flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8">동기화 진행률</h3>
          <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {problems.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                  currentProblemIndex === idx 
                    ? 'ring-2 ring-white ring-offset-4 ring-offset-apex-black' 
                    : ''
                } ${
                  answers[p.id] 
                    ? 'bg-apex-accent text-apex-black' 
                    : 'bg-white/5 text-white/20 border border-white/5'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {blurCount > 0 && (
            <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {blurCount}회의 집중력 위반이 감지되었습니다
              </span>
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={!isOnline}
            className="w-full py-6 bg-white text-apex-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-apex-accent transition-all shadow-2xl disabled:opacity-50"
          >
            최종 제출
          </button>
        </div>
      </aside>
    </div>
  );
};
