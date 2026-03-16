/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { ExamInterface } from './components/ExamInterface';
import { ScannerUI } from './components/ScannerUI';
import { PenTool, Scan } from 'lucide-react';

const problems = [
  { id: 'p1', type: 'multiple', options: ['A', 'B', 'C', 'D'] },
  { id: 'p2', type: 'subjective' },
];

export default function App() {
  const [view, setView] = useState<'exam' | 'scanner'>('scanner');

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
      </nav>

      <main className="flex-1 overflow-auto">
        {view === 'exam' ? (
          <ExamInterface problems={problems as any} />
        ) : (
          <ScannerUI />
        )}
      </main>
    </div>
  );
}
