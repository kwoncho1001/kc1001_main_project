import React, { useState, useEffect, useCallback } from 'react';
import { DigitalLearningCanvas } from './canvas/DigitalLearningCanvas';
import { useExamTimer } from '../hooks/useExamTimer';
import { useBookmarks } from '../hooks/useBookmarks';
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import { ExamManagerService } from '../services/examManagerService';
import { ExamScorerService, QuestionStat } from '../services/examScorerService';
import { Timer, AlertCircle, CheckCircle2, Save, Wifi, WifiOff, Layout, ListChecks, History, Clock, Star, Trophy, Users, FileDown, Loader2 } from 'lucide-react';
import { Problem, SolvingResult, ExamStatus, ExamScoringResponse, ExamPaperMetadata } from '../types/ability';

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
    <div className="flex w-full h-full gap-8">
      {/* Left: Problem Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className={`card px-6 py-3 flex items-center gap-3 ${remainingTime < 60 ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <Clock size={18} className={remainingTime < 60 ? 'text-red-500' : 'text-accent'} />
              <span className={`font-mono text-xl font-bold tracking-tighter ${remainingTime < 60 ? 'text-red-500' : 'text-foreground'}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
            {!isOnline && (
              <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <WifiOff size={14} /> 오프라인 모드
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-micro text-muted-foreground">활성 노드</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tighter text-foreground">{currentProblemIndex + 1}</span>
                <span className="text-xs text-muted-foreground">/ {problems.length}</span>
              </div>
            </div>
            <button 
              onClick={handleToggleBookmark}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                isBookmarked(currentProblem.id) 
                  ? 'bg-accent/10 border-accent/30 text-accent shadow-lg' 
                  : 'card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star size={20} className={isBookmarked(currentProblem.id) ? 'fill-accent' : ''} />
            </button>
          </div>
        </header>

        <div className="flex-1 card p-2 relative overflow-hidden group">
          <div className="absolute inset-0 grid-pattern opacity-10"></div>
          <div className="w-full h-full rounded-[32px] relative overflow-hidden bg-background/50">
            <DigitalLearningCanvas theme={theme} />
            
            {/* Floating Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 card p-2 rounded-3xl shadow-2xl">
              <button 
                disabled={currentProblemIndex === 0}
                onClick={() => setCurrentProblemIndex(i => i - 1)}
                className="px-8 py-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 hover:bg-accent/10 rounded-2xl transition-all"
              >
                이전
              </button>
              <div className="w-px h-6 bg-border" />
              <button 
                disabled={currentProblemIndex === problems.length - 1}
                onClick={() => setCurrentProblemIndex(i => i + 1)}
                className="px-8 py-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest disabled:opacity-20 hover:bg-accent/10 rounded-2xl transition-all"
              >
                다음 노드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Answer Panel */}
      <aside className="w-96 flex flex-col gap-8">
        <div className="card p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="text-micro text-muted-foreground">응답 매트릭스</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              동기화됨
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-background/50 rounded-3xl border border-border">
              <span className="block text-micro text-muted-foreground mb-3">노드 지능</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-tight text-foreground">문제 {currentProblemIndex + 1}</span>
                <span className="font-mono text-xs text-accent">{formatMs(perQuestionTime[currentProblem.id] || 0)}</span>
              </div>
            </div>

            {currentProblem.type === 'multiple' ? (
              <div className="grid grid-cols-2 gap-3">
                {currentProblem.options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerChange(opt)}
                    className={`h-16 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all ${
                      answers[currentProblem.id] === opt 
                        ? 'bg-accent text-white border-accent shadow-lg scale-[1.02]' 
                        : 'bg-background/50 border-border text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea 
                  className="w-full h-48 p-6 bg-background/50 border border-border rounded-3xl text-sm focus:outline-none focus:border-accent/50 transition-all resize-none font-medium leading-relaxed text-foreground placeholder:text-muted-foreground"
                  placeholder="정답 입력..."
                  value={answers[currentProblem.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="card p-8 flex-1 flex flex-col">
          <h3 className="text-micro text-muted-foreground mb-8">동기화 진행률</h3>
          <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 scrollbar-hide">
            {problems.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                  currentProblemIndex === idx 
                    ? 'ring-2 ring-accent ring-offset-4 ring-offset-background' 
                    : ''
                } ${
                  answers[p.id] 
                    ? 'bg-accent text-white' 
                    : 'bg-background/50 text-muted-foreground border border-border'
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
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {blurCount}회의 집중력 위반이 감지되었습니다
              </span>
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={!isOnline}
            className="w-full py-6 accent-gradient text-white rounded-3xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
          >
            최종 제출
          </button>
        </div>
      </aside>
    </div>
  );
};
