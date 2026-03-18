import React, { useState, useEffect, useCallback } from 'react';
import { DigitalLearningCanvas } from './canvas/DigitalLearningCanvas';
import { useExamTimer } from '../hooks/useExamTimer';
import { useBookmarks } from '../hooks/useBookmarks';
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import { ExamManagerService } from '../services/examManagerService';
import { ExamScorerService, QuestionStat } from '../services/examScorerService';
import { Timer, AlertCircle, CheckCircle2, Save, Wifi, WifiOff, Layout, ListChecks, History, Clock, Star, Trophy, Users, FileDown, Loader2 } from 'lucide-react';
import { Problem, SolvingResult, ExamStatus, ExamScoringResponse, ExamPaperMetadata } from '../types/ability';
import { DigitalInkObject } from './canvas/types';

const EXAM_DURATION = 60 * 30; // 30 minutes

// Mock metadata for the exam
const MOCK_EXAM_METADATA: ExamPaperMetadata = {
  examId: 'exam-1',
  questions: [
    { questionId: 'p1', weight: 10 },
    { questionId: 'p2', weight: 10 },
    { questionId: 'p3', weight: 10 },
    { questionId: 'p4', weight: 10 },
    { questionId: 'p5', weight: 10 },
    { questionId: 'p6', weight: 10 },
    { questionId: 'p7', weight: 10 },
    { questionId: 'p8', weight: 10 },
    { questionId: 'p9', weight: 10 },
    { questionId: 'p10', weight: 10 },
  ]
};

export const ExamInterface: React.FC<{ 
  problems: Problem[], 
  initialProblemId?: string | null,
  onSolve?: (result: SolvingResult) => void,
  theme: 'light' | 'dark' // Added theme prop
}> = ({ problems, initialProblemId, onSolve, theme }) => {
  const textPrimary = theme === 'light' ? 'text-black' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-black/80' : 'text-white/80';
  const borderPrimary = theme === 'light' ? 'border-black' : 'border-white';
  const bgCard = theme === 'light' ? 'bg-white' : 'bg-slate-900';
  const bgApp = theme === 'light' ? 'bg-white' : 'bg-black';

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

  // 1. 시험 세션 동안만 유지될 필기 데이터 상태 (초기값은 sessionStorage에서 로드)
  const [drawingData, setDrawingData] = useState<Record<string, DigitalInkObject[]>>(() => {
    const saved = sessionStorage.getItem('current_exam_drawings');
    return saved ? JSON.parse(saved) : {};
  });

  // 2. 필기 데이터가 변경될 때마다 세션 저장소에 임시 저장
  useEffect(() => {
    sessionStorage.setItem('current_exam_drawings', JSON.stringify(drawingData));
  }, [drawingData]);

  const [examStatus, setExamStatus] = useState<ExamStatus>('ACTIVE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scoringResult, setScoringResult] = useState<ExamScoringResponse | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);

  const { generateReport, isGenerating } = usePdfGenerator();

  const currentProblem = problems[currentProblemIndex];

  // Initialize Precision Timer Hook
  const { remainingTime, perQuestionTime, isTimeUp, blurCount } = useExamTimer(
    60 * 30,
    currentProblem.id,
    examStatus === 'ACTIVE', // Pass active state
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
      // Simple mock grading logic: if answered, 70% chance of being correct
      gradedResults[p.id] = !!answers[p.id] && Math.random() > 0.3;
    });

    // Calculate score using new service
    const score = ExamScorerService.calculateScore(
      { examId: 'exam-1', userId: 'user-123', gradedResults },
      MOCK_EXAM_METADATA
    );

    // Get rank using new service
    const result = ExamScorerService.getMockRank(score);
    setScoringResult(result);

    // Generate mock stats for the report
    const stats = ExamScorerService.generateStats(
      [gradedResults, ...Array.from({ length: 19 }, () => {
        const mockR: Record<string, boolean> = {};
        problems.forEach(p => mockR[p.id] = Math.random() > 0.5);
        return mockR;
      })],
      MOCK_EXAM_METADATA
    );
    setQuestionStats(stats.questionStats);
    
    localStorage.removeItem('exam_answers_v3');
    sessionStorage.removeItem('current_exam_drawings');
  }, [answers, problems, examStatus]);

  const handleDownloadReport = async () => {
    if (!scoringResult) return;
    
    await generateReport({
      studentName: '권초', // This would come from auth context in a real app
      examTitle: '수학 실력 진단 평가',
      date: new Date().toLocaleDateString('ko-KR'),
      scoring: scoringResult,
      questionStats: questionStats,
      teacherComment: '전반적으로 우수한 성적을 거두었습니다. 특히 고난도 문항에서의 논리적 사고력이 돋보입니다. 다만, 기초적인 연산 실수에 주의한다면 더 완벽한 결과를 얻을 수 있을 것입니다.'
    });
  };

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
        <div className="card p-12 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center ${examStatus === 'SUBMITTED' ? 'bg-accent/20 text-accent' : 'bg-amber-500/20 text-amber-500'}`}>
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-5xl font-bold heading-tight uppercase mb-4">
              {examStatus === 'SUBMITTED' ? '세션 종료' : '시간 초과'}
            </h1>
            <p className="text-muted-foreground mb-12 font-medium">
              {examStatus === 'SUBMITTED' 
                ? '시험이 완료되었습니다. 성능 데이터가 성공적으로 저장되었습니다.' 
                : '제한 시간이 초과되어 시험이 종료되었습니다.'}
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-3xl bg-background/50 border border-border">
                <span className="block text-micro text-muted-foreground mb-2">총 소요 시간</span>
                <span className="text-3xl font-bold tracking-tighter text-foreground">{formatTime(EXAM_DURATION - remainingTime)}</span>
              </div>
              <div className="p-8 rounded-3xl bg-background/50 border border-border">
                <span className="block text-micro text-muted-foreground mb-2">집중력 위반</span>
                <span className="text-3xl font-bold tracking-tighter text-red-500">{blurCount}</span>
              </div>
            </div>

            {scoringResult && (
              <>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="p-8 rounded-3xl bg-accent/10 border border-accent/20">
                    <span className="block text-micro text-accent mb-2">최종 점수</span>
                    <span className="text-4xl font-bold tracking-tighter text-accent">{scoringResult.totalScore.toFixed(1)}</span>
                  </div>
                  <div className="p-8 rounded-3xl bg-background/50 border border-border">
                    <span className="block text-micro text-muted-foreground mb-2">전체 석차</span>
                    <span className="text-4xl font-bold tracking-tighter text-foreground">{scoringResult.rank} / {scoringResult.totalCandidates}</span>
                  </div>
                </div>

                <button 
                  onClick={handleDownloadReport}
                  disabled={isGenerating}
                  className="w-full py-6 mb-4 bg-accent/10 text-accent border border-accent/20 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-accent/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FileDown size={18} />
                  )}
                  분석 보고서 다운로드 (PDF)
                </button>
              </>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-6 accent-gradient text-white rounded-3xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl"
            >
              커맨드 센터로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full h-full gap-8 p-6 ${bgApp}`}>
      {/* Left: Problem Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className={`px-6 py-3 border-2 rounded-2xl flex items-center gap-3 ${borderPrimary} ${bgCard} ${remainingTime < 60 ? 'bg-red-500/10' : ''}`}>
              <Clock size={18} className={remainingTime < 60 ? 'text-red-500' : textPrimary} />
              <span className={`font-mono text-2xl font-black ${remainingTime < 60 ? 'text-red-500' : textPrimary}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
            {!isOnline && (
              <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl border-2 border-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <WifiOff size={14} /> 오프라인 모드
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-black uppercase ${textSecondary}`}>Active Node</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${textPrimary}`}>{currentProblemIndex + 1}</span>
                <span className={`text-sm font-bold ${textSecondary}`}>/ {problems.length}</span>
              </div>
            </div>
            <button 
              onClick={handleToggleBookmark}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                isBookmarked(currentProblem.id) 
                  ? 'bg-yellow-500 text-white border-yellow-600 shadow-lg' 
                  : `${bgCard} ${borderPrimary} ${textPrimary} hover:opacity-80`
              }`}
            >
              <Star size={24} className={isBookmarked(currentProblem.id) ? 'fill-current' : ''} />
            </button>
          </div>
        </header>

        <div className={`flex-1 border-2 rounded-[40px] relative overflow-hidden ${borderPrimary} ${bgCard}`}>
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="w-full h-full relative overflow-hidden">
            <DigitalLearningCanvas 
              key={currentProblem.id}
              theme={theme}
              initialData={{ 
                elements: drawingData[currentProblem.id] || [],
                appState: { mode: 'pen' } 
              }}
              onChange={(newElements) => {
                setDrawingData(prev => ({
                  ...prev,
                  [currentProblem.id]: newElements
                }));
              }}
            />
            
            {/* Floating Navigation */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-3xl border-2 border-white/20 shadow-2xl`}>
              <button 
                disabled={currentProblemIndex === 0}
                onClick={() => setCurrentProblemIndex(i => i - 1)}
                className="px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 rounded-2xl disabled:opacity-20 transition-all"
              >
                PREV
              </button>
              <div className="w-px h-6 bg-white/20" />
              <button 
                disabled={currentProblemIndex === problems.length - 1}
                onClick={() => setCurrentProblemIndex(i => i + 1)}
                className="px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 rounded-2xl disabled:opacity-20 transition-all"
              >
                NEXT NODE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Answer Panel */}
      <aside className="w-96 flex flex-col gap-8">
        <div className={`p-8 border-2 rounded-[32px] ${borderPrimary} ${bgCard}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-[10px] font-black uppercase ${textSecondary}`}>Response Matrix</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              SYNCED
            </div>
          </div>

          <div className="space-y-8">
            <div className={`p-6 bg-black/5 dark:bg-white/5 rounded-3xl border-2 ${borderPrimary}`}>
              <span className={`block text-[10px] font-black uppercase ${textSecondary} mb-3`}>Node Intelligence</span>
              <div className="flex items-center justify-between">
                <span className={`font-black text-sm uppercase tracking-tight ${textPrimary}`}>Problem {currentProblemIndex + 1}</span>
                <span className={`font-mono text-xs font-black text-emerald-500`}>{formatMs(perQuestionTime[currentProblem.id] || 0)}</span>
              </div>
            </div>

            {currentProblem.type === 'multiple' ? (
              <div className="grid grid-cols-2 gap-4">
                {currentProblem.options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerChange(opt)}
                    className={`h-20 rounded-2xl border-2 text-sm font-black transition-all ${
                      answers[currentProblem.id] === opt 
                        ? (theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black border-white') 
                        : (theme === 'light' ? 'bg-white text-black border-black/20' : 'bg-transparent text-white border-white/20')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea 
                  className={`w-full h-64 p-6 border-2 rounded-3xl text-base font-bold focus:outline-none transition-all resize-none ${theme === 'light' ? 'bg-white border-black text-black placeholder:text-black/30' : 'bg-slate-800 border-white text-white placeholder:text-white/30'}`}
                  placeholder="정답을 입력하세요..."
                  value={answers[currentProblem.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className={`p-8 border-2 rounded-[32px] flex-1 flex flex-col ${borderPrimary} ${bgCard}`}>
          <h3 className={`text-[10px] font-black uppercase ${textSecondary} mb-8`}>Sync Progress</h3>
          <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {problems.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                  currentProblemIndex === idx 
                    ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-background' 
                    : ''
                } ${
                  answers[p.id] 
                    ? 'bg-emerald-500 text-white' 
                    : `border-2 ${borderPrimary} ${textPrimary}`
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {blurCount > 0 && (
            <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-4 rounded-2xl border-2 border-red-500/20">
              <AlertCircle size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {blurCount} VIOLATIONS DETECTED
              </span>
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={!isOnline}
            className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
          >
            TERMINATE SESSION
          </button>
        </div>
      </aside>
    </div>
  );
};
