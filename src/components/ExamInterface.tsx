import React, { useState, useEffect, useCallback } from 'react';
import { DigitalLearningCanvas } from './canvas/DigitalLearningCanvas';
import { useExamTimer } from '../hooks/useExamTimer';
import { useBookmarks } from '../hooks/useBookmarks';
import { Timer, AlertCircle, CheckCircle2, Save, Wifi, WifiOff, Layout, ListChecks, History, Clock, Star } from 'lucide-react';

interface Problem {
  id: string;
  type: 'multiple' | 'subjective';
  options?: string[];
  title?: string;
}
// ... (rest of the interfaces)

const EXAM_DURATION = 60 * 30; // 30 minutes

export const ExamInterface: React.FC<{ problems: Problem[], initialProblemId?: string | null }> = ({ problems, initialProblemId }) => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const currentProblem = problems[currentProblemIndex];

  // Initialize Precision Timer Hook
  const { remainingTime, perQuestionTime, isTimeUp, blurCount } = useExamTimer(
    60 * 30,
    currentProblem.id,
    () => handleSubmit()
  );

  // Initialize Bookmarks Hook
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const handleToggleBookmark = () => {
    // AI Analysis Simulation:
    // If time spent > 60s, tag as "Deep Thinking"
    // If multiple choice and changed answer, tag as "Uncertain"
    const timeSpent = perQuestionTime[currentProblem.id] || 0;
    const autoTags = ['Saved'];
    if (timeSpent > 60000) autoTags.push('Deep Thinking');
    if (timeSpent > 120000) autoTags.push('High Difficulty');
    
    toggleBookmark(currentProblem.id, autoTags);
  };
// ... (rest of the component)

  // Sync answers with localStorage
  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem('exam_answers_v3', JSON.stringify(answers));
    }
  }, [answers, isSubmitted]);

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
    if (isSubmitted || isTimeUp) return;
    setAnswers(prev => ({
      ...prev,
      [currentProblem.id]: value
    }));
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    // Construct final data contract for analysis (g90y5xjqq)
    const finalData = {
      answers,
      perQuestionTime, // Precise milliseconds per question
      blurCount,
      submittedAt: new Date().toISOString(),
      remainingTime,
      totalTimeSpent: EXAM_DURATION - remainingTime
    };
    
    console.log('Final Submission Data (Contract g90y5xjqq):', finalData);
    
    // Clear local cache
    localStorage.removeItem('exam_answers_v3');
  }, [answers, perQuestionTime, blurCount, remainingTime, isSubmitted]);

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

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#E4E3E0] text-[#141414] p-8">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-black/5 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Exam Completed</h1>
          <p className="text-black/60 mb-8">Your performance data has been collected for analysis.</p>
          
          <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-black/5 mb-8">
            <div className="flex justify-between text-sm">
              <span className="opacity-50">Total Time</span>
              <span className="font-mono font-bold">{formatTime(EXAM_DURATION - remainingTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-50">Focus Interruptions</span>
              <span className="font-mono font-bold text-red-500">{blurCount}</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-[#E4E3E0] overflow-hidden">
      {/* Left: Problem Area (oiofljiz3) */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`bg-white px-4 py-2 rounded-xl border border-black/5 flex items-center gap-2 shadow-sm ${remainingTime < 60 ? 'animate-pulse' : ''}`}>
              <Timer size={16} className={remainingTime < 60 ? 'text-red-500' : 'text-emerald-500'} />
              <span className={`font-mono font-bold text-lg ${remainingTime < 60 ? 'text-red-500' : ''}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
            {!isOnline && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2 text-xs font-bold">
                <WifiOff size={14} /> OFFLINE
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold opacity-40">
              <Clock size={14} />
              <span>Q-TIME: {formatMs(perQuestionTime[currentProblem.id] || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked(currentProblem.id) 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-500 shadow-sm' 
                    : 'bg-white border-black/5 text-black/20 hover:text-black/40'
                }`}
                title="Bookmark this problem"
              >
                <Star size={18} className={isBookmarked(currentProblem.id) ? 'fill-emerald-500' : ''} />
              </button>
              <div className="w-px h-4 bg-black/5 mx-2" />
              <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Question</span>
              <span className="text-2xl font-black">{currentProblemIndex + 1}</span>
              <span className="text-sm opacity-30">/ {problems.length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden relative">
          <DigitalLearningCanvas />
          
          {/* Floating Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#141414] p-2 rounded-2xl shadow-2xl">
            <button 
              disabled={currentProblemIndex === 0}
              onClick={() => setCurrentProblemIndex(i => i - 1)}
              className="px-6 py-3 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-20 hover:bg-white/10 rounded-xl transition-colors"
            >
              Prev
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              disabled={currentProblemIndex === problems.length - 1}
              onClick={() => setCurrentProblemIndex(i => i + 1)}
              className="px-6 py-3 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-20 hover:bg-white/10 rounded-xl transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Right: Answer Panel (rul74ykmh) */}
      <aside className="w-80 bg-white border-l border-black/5 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">OMR Sheet</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <Save size={10} /> SYNCED
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">
                Active Question
              </label>
              <div className="flex items-center justify-between">
                <span className="font-bold">Question {currentProblemIndex + 1}</span>
                <span className="font-mono text-xs opacity-50">{formatMs(perQuestionTime[currentProblem.id] || 0)}</span>
              </div>
            </div>

            {currentProblem.type === 'multiple' ? (
              <div className="grid grid-cols-2 gap-2">
                {currentProblem.options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerChange(opt)}
                    className={`h-12 rounded-xl border text-sm font-bold transition-all ${
                      answers[currentProblem.id] === opt 
                        ? 'bg-[#141414] text-white border-[#141414] shadow-lg scale-[1.02]' 
                        : 'bg-white border-black/10 hover:border-black/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea 
                  className="w-full h-32 p-4 bg-gray-50 border border-black/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                  placeholder="Enter your solution..."
                  value={answers[currentProblem.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">Exam Progress</h3>
          <div className="grid grid-cols-5 gap-2">
            {problems.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                  currentProblemIndex === idx 
                    ? 'ring-2 ring-black ring-offset-2' 
                    : ''
                } ${
                  answers[p.id] 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 text-black/30'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-black/5">
          {blurCount > 0 && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {blurCount} Focus Violations Recorded
              </span>
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={!isOnline}
            className="w-full bg-[#141414] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalize & Submit
          </button>
        </div>
      </aside>
    </div>
  );
};
