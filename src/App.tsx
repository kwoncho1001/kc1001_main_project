/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { ExamInterface } from './components/ExamInterface';
import { ScannerUI } from './components/ScannerUI';
import { BookmarksView } from './components/BookmarksView';
import { GradePrediction } from './components/GradePrediction';
import { PenTool, Scan, Star, BarChart3 } from 'lucide-react';

const problems = [
  { id: 'p1', type: 'multiple', options: ['A', 'B', 'C', 'D'], title: 'Mathematics - Calculus' },
  { id: 'p2', type: 'multiple', options: ['A', 'B', 'C', 'D'], title: 'Mathematics - Algebra' },
  { id: 'p3', type: 'subjective', title: 'Essay - Modern History' },
  { id: 'p4', type: 'multiple', options: ['1', '2', '3', '4', '5'], title: 'Physics - Mechanics' },
  { id: 'p5', type: 'multiple', options: ['A', 'B', 'C'], title: 'Chemistry - Organic' },
  { id: 'p6', type: 'subjective', title: 'Short Answer - Biology' },
  { id: 'p7', type: 'multiple', options: ['A', 'B', 'C', 'D'], title: 'English - Grammar' },
  { id: 'p8', type: 'multiple', options: ['A', 'B', 'C', 'D'], title: 'English - Vocabulary' },
  { id: 'p9', type: 'subjective', title: 'Logic - Puzzles' },
  { id: 'p10', type: 'multiple', options: ['A', 'B', 'C', 'D'], title: 'General Knowledge' },
];

export default function App() {
  const [view, setView] = useState<'exam' | 'scanner' | 'bookmarks' | 'prediction'>('scanner');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  const handleSelectProblemFromBookmarks = (problemId: string) => {
    setSelectedProblemId(problemId);
    setView('exam');
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Navigation Rail */}
      <nav className="h-12 bg-[#141414] text-[#E4E3E0] flex items-center px-6 gap-8 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-6 h-6 bg-emerald-500 rounded-sm flex items-center justify-center text-[#141414] font-bold text-xs">M</div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Main Project</span>
        </div>
        
        <button 
          onClick={() => setView('scanner')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'scanner' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <Scan size={14} />
          Advanced Scanner
        </button>

        <button 
          onClick={() => setView('exam')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'exam' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <PenTool size={14} />
          Exam Interface
        </button>

        <button 
          onClick={() => setView('bookmarks')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'bookmarks' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <Star size={14} />
          Bookmarks
        </button>

        <button 
          onClick={() => setView('prediction')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'prediction' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <BarChart3 size={14} />
          Grade Prediction
        </button>
      </nav>

      <main className="flex-1 overflow-auto">
        {view === 'exam' ? (
          <ExamInterface problems={problems as any} initialProblemId={selectedProblemId} />
        ) : view === 'scanner' ? (
          <ScannerUI />
        ) : view === 'bookmarks' ? (
          <BookmarksView problems={problems as any} onSelectProblem={handleSelectProblemFromBookmarks} />
        ) : (
          <GradePrediction />
        )}
      </main>
    </div>
  );
}
