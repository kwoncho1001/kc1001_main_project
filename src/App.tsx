/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { ExamInterface } from './components/ExamInterface';
import { ScannerUI } from './components/ScannerUI';
import { BookmarksView } from './components/BookmarksView';
import { GradePrediction } from './components/GradePrediction';
import { AbilityTracker } from './components/AbilityTracker';
import { HierarchyManager } from './components/HierarchyManager';
import { AIMetadataAnalyzer } from './components/AIMetadataAnalyzer';
import { ProblemExtractor } from './components/ProblemExtractor';
import { PenTool, Scan, Star, BarChart3, Layers, Database, Brain, FileSearch } from 'lucide-react';
import { AbilityLevel, SolvingResult, BehaviorCorrectionOutput, InitialSkillRequest, AbilityScore, WeightCalculationResponse } from './types/ability';
import { BehaviorCorrectionService } from './services/behaviorCorrection';
import { InitialSkillService } from './services/initialSkillService';
import { SkillUpdateService } from './services/skillUpdateService';
import { WeightCalculationService } from './services/weightCalculationService';
import { HierarchyService } from './services/hierarchyService';

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

const mockHierarchy = HierarchyService.getAllNodes();

const mockAbilityScores: Record<string, number> = {
  f1: 0.75,
  s1: 0.68,
  s2: 0.82,
  s3: 0.55,
  t1: 0.45,
  t2: 0.92,
  t3: 0.78,
};

export default function App() {
  const [view, setView] = useState<'exam' | 'scanner' | 'bookmarks' | 'prediction' | 'ability' | 'hierarchy' | 'ai-analyzer' | 'ocr-extractor'>('scanner');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [abilityScores, setAbilityScores] = useState<Record<string, AbilityScore>>({}); // Start empty for onboarding demo
  const [lastBehavior, setLastBehavior] = useState<BehaviorCorrectionOutput | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [prediction, setPrediction] = useState<WeightCalculationResponse | null>(null);

  useEffect(() => {
    if (selectedProblemId && Object.keys(abilityScores).length > 0) {
      // Mock hierarchy for the selected problem
      const problemHierarchy = {
        L1: 'f1',
        L2: 's1',
        L3: 'm1',
        L4: 'n1',
        L5: 't1',
      };

      const result = WeightCalculationService.calculateFinalTheta(
        {
          studentId: 'user-123',
          contextHierarchy: problemHierarchy,
          reliabilityIndex: lastBehavior?.reliabilityIndex ?? 1.0
        },
        abilityScores
      );
      setPrediction(result);
    }
  }, [selectedProblemId, abilityScores, lastBehavior]);

  const handleOnboarding = (level: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const request: InitialSkillRequest = {
      studentId: 'user-123',
      newSubjectPath: {
        fieldId: 'f1',
        courseId: 's1',
        majorChapterId: 'm1',
        minorChapterId: 'n1',
        typeId: 't1',
      },
      selfAssessmentLevel: level,
    };
    const response = InitialSkillService.initializeSkills(request, {});
    const newScores: Record<string, AbilityScore> = {};
    response.initializedSkills.forEach(s => {
      newScores[s.id] = {
        id: s.id,
        name: mockHierarchy.find(h => h.id === s.id)?.name || s.id,
        level: s.level,
        score: s.initialScore,
        lastUpdated: Date.now(),
        solvedProblemCount: 0
      };
    });
    setAbilityScores(newScores);
    setShowOnboarding(false);
  };

  const handleSolve = (result: SolvingResult) => {
    const analysis = BehaviorCorrectionService.analyze(result);
    setLastBehavior(analysis);
    
    // Use SkillUpdateService v2.0
    const { updatedScores } = SkillUpdateService.processEvent(
      result.studentId,
      {
        type: 'PROBLEM_SOLVE',
        data: {
          problemId: 'p1', // Mock
          hierarchy: {
            fieldId: result.metadata.fieldId,
            courseId: result.metadata.subjectId,
            majorChapterId: result.metadata.majorUnitId,
            minorChapterId: result.metadata.minorUnitId,
            typeId: result.metadata.tagId,
          },
          isCorrect: result.isCorrect,
          difficultyLevel: result.metadata.difficulty * 4 + 1, // Convert 0-1 to 1-5
          correctionFactor: analysis.correctionFactor
        }
      },
      abilityScores,
      mockHierarchy
    );

    setAbilityScores(updatedScores);
  };

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

        <button 
          onClick={() => setView('ability')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'ability' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <Layers size={14} />
          Ability Tracker
        </button>

        <button 
          onClick={() => setView('hierarchy')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'hierarchy' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <Database size={14} />
          Hierarchy Manager
        </button>

        <button 
          onClick={() => setView('ai-analyzer')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'ai-analyzer' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <Brain size={14} />
          AI Analyzer
        </button>

        <button 
          onClick={() => setView('ocr-extractor')}
          className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${view === 'ocr-extractor' ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
        >
          <FileSearch size={14} />
          OCR Extractor
        </button>
      </nav>

      <main className="flex-1 overflow-auto relative">
        {showOnboarding && (
          <div className="absolute inset-0 z-50 bg-[#141414]/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-black mb-2">Welcome to AI Learning</h2>
              <p className="text-gray-500 mb-8">To personalize your learning path, please select your current level in Mathematics.</p>
              
              <div className="space-y-3">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => handleOnboarding(level)}
                    className="w-full py-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left px-6 group"
                  >
                    <div className="font-bold group-hover:text-emerald-700">{level}</div>
                    <div className="text-xs text-gray-400">
                      {level === 'HIGH' ? 'I am confident in this subject' : 
                       level === 'MEDIUM' ? 'I have some basic knowledge' : 
                       'I am just starting out'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'exam' ? (
          <ExamInterface 
            problems={problems as any} 
            initialProblemId={selectedProblemId} 
            onSolve={handleSolve}
          />
        ) : view === 'scanner' ? (
          <ScannerUI />
        ) : view === 'bookmarks' ? (
          <BookmarksView problems={problems as any} onSelectProblem={handleSelectProblemFromBookmarks} />
        ) : view === 'prediction' ? (
          <GradePrediction />
        ) : view === 'ability' ? (
          <AbilityTracker 
            scores={abilityScores} 
            hierarchy={mockHierarchy} 
            lastBehavior={lastBehavior}
          />
        ) : view === 'hierarchy' ? (
          <HierarchyManager />
        ) : view === 'ai-analyzer' ? (
          <AIMetadataAnalyzer />
        ) : (
          <ProblemExtractor />
        )}
      </main>
    </div>
  );
}
