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
import { GamificationDashboard } from './components/GamificationDashboard';
import { PenTool, Scan, Star, BarChart3, Layers, Database, Brain, FileSearch, Trophy } from 'lucide-react';
import { AbilityLevel, SolvingResult, BehaviorCorrectionOutput, InitialSkillRequest, AbilityScore, WeightCalculationResponse } from './types/ability';
import { BehaviorCorrectionService } from './services/behaviorCorrection';
import { InitialSkillService } from './services/initialSkillService';
import { SkillUpdateService } from './services/skillUpdateService';
import { WeightCalculationService } from './services/weightCalculationService';
import { HierarchyService } from './services/hierarchyService';
import { useAuth } from './components/AuthProvider';
import { FirebaseService } from './services/firebaseService';
import { LogOut } from 'lucide-react';

/**
 * @interface NavButtonProps
 * @description Properties for the reusable navigation button component.
 */
interface NavButtonProps {
  id: string;
  currentView: string;
  onClick: (id: any) => void;
  icon: React.ElementType;
  label: string;
}

/**
 * @component NavButton
 * @description Reusable navigation button for the sidebar.
 */
const NavButton: React.FC<NavButtonProps> = ({ id, currentView, onClick, icon: Icon, label }) => {
  const isActive = currentView === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full px-4 py-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-xl group ${
        isActive 
          ? 'bg-apex-accent/10 text-apex-accent shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon size={16} className={isActive ? 'text-apex-accent' : 'text-white/20 group-hover:text-white/40'} />
      {label}
    </button>
  );
};

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
  const { user, loading, login, logout } = useAuth();
  const [view, setView] = useState<'exam' | 'scanner' | 'bookmarks' | 'prediction' | 'ability' | 'hierarchy' | 'ai-analyzer' | 'ocr-extractor' | 'gamification'>('scanner');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [abilityScores, setAbilityScores] = useState<Record<string, AbilityScore>>({}); // Start empty for onboarding demo
  const [lastBehavior, setLastBehavior] = useState<BehaviorCorrectionOutput | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [prediction, setPrediction] = useState<WeightCalculationResponse | null>(null);

  // Sync ability scores from Firestore
  useEffect(() => {
    if (user) {
      const unsubscribe = FirebaseService.subscribeToAbilityScores((scores) => {
        setAbilityScores(scores);
        if (Object.keys(scores).length > 0) {
          setShowOnboarding(false);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

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
    response.initializedSkills.forEach(async (s) => {
      const score: AbilityScore = {
        id: s.id,
        name: mockHierarchy.find(h => h.id === s.id)?.name || s.id,
        level: s.level,
        score: s.initialScore,
        lastUpdated: Date.now(),
        solvedProblemCount: 0
      };
      newScores[s.id] = score;
      // Persist to Firestore
      await FirebaseService.saveAbilityScore(score);
    });
    setAbilityScores(newScores);
    setShowOnboarding(false);
  };

  const handleSolve = async (result: SolvingResult) => {
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

    // Persist updated scores to Firestore
    for (const scoreId in updatedScores) {
      await FirebaseService.saveAbilityScore(updatedScores[scoreId]);
    }
  };

  const handleSelectProblemFromBookmarks = (problemId: string) => {
    setSelectedProblemId(problemId);
    setView('exam');
  };

  /**
   * @constant VIEW_COMPONENTS
   * @description Map of view IDs to their corresponding components to avoid long conditional chains.
   */
  const renderView = () => {
    switch (view) {
      case 'exam':
        return <ExamInterface problems={problems as any} initialProblemId={selectedProblemId} onSolve={handleSolve} />;
      case 'scanner':
        return <ScannerUI />;
      case 'bookmarks':
        return <BookmarksView problems={problems as any} onSelectProblem={handleSelectProblemFromBookmarks} />;
      case 'prediction':
        return <GradePrediction />;
      case 'ability':
        return <AbilityTracker scores={abilityScores} hierarchy={mockHierarchy} lastBehavior={lastBehavior} />;
      case 'hierarchy':
        return <HierarchyManager />;
      case 'ai-analyzer':
        return <AIMetadataAnalyzer />;
      case 'ocr-extractor':
        return <ProblemExtractor />;
      case 'gamification':
        return <GamificationDashboard />;
      default:
        return <ScannerUI />;
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-apex-black">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-apex-accent/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-apex-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-apex-accent font-black text-xs">A</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-apex-black apex-grid p-6">
        <div className="glass rounded-[40px] p-12 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-apex-accent to-transparent"></div>
          <div className="w-24 h-24 bg-apex-accent/10 border border-apex-accent/20 rounded-3xl mx-auto mb-8 flex items-center justify-center text-apex-accent text-5xl font-black shadow-[0_0_40px_rgba(16,185,129,0.2)] glow-text">A</div>
          <h1 className="text-4xl font-bold mb-4 tracking-tighter">APEX NETWORK</h1>
          <p className="text-white/40 mb-10 text-sm">Secure, high-performance learning infrastructure for the next generation of students.</p>
          <button
            onClick={login}
            className="w-full bg-white text-apex-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-apex-accent transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Establish Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex bg-apex-black overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-apex-border flex flex-col shrink-0 bg-apex-dark/50 backdrop-blur-md">
        <div className="p-8 flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-apex-accent/10 border border-apex-accent/30 rounded-xl flex items-center justify-center text-apex-accent font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">A</div>
          <div>
            <span className="block font-black uppercase tracking-[0.3em] text-xs glow-text">APEX</span>
            <span className="block text-[8px] uppercase tracking-[0.5em] text-white/30">Infrastructure</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="px-4 mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Core Systems</span>
          </div>
          <NavButton id="scanner" currentView={view} onClick={setView} icon={Scan} label="Scanner" />
          <NavButton id="exam" currentView={view} onClick={setView} icon={PenTool} label="Interface" />
          <NavButton id="bookmarks" currentView={view} onClick={setView} icon={Star} label="Vault" />
          
          <div className="px-4 mt-8 mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Analytics</span>
          </div>
          <NavButton id="prediction" currentView={view} onClick={setView} icon={BarChart3} label="Prediction" />
          <NavButton id="ability" currentView={view} onClick={setView} icon={Layers} label="Ability" />
          <NavButton id="hierarchy" currentView={view} onClick={setView} icon={Database} label="Hierarchy" />
          
          <div className="px-4 mt-8 mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Intelligence</span>
          </div>
          <NavButton id="ai-analyzer" currentView={view} onClick={setView} icon={Brain} label="Analyzer" />
          <NavButton id="ocr-extractor" currentView={view} onClick={setView} icon={FileSearch} label="Extractor" />
          <NavButton id="gamification" currentView={view} onClick={setView} icon={Trophy} label="Rewards" />
        </div>

        <div className="p-6 border-t border-apex-border">
          <div className="flex items-center gap-4 p-3 glass rounded-2xl">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-widest truncate">{user.displayName}</span>
              <span className="block text-[8px] text-white/30 uppercase tracking-widest">Active Node</span>
            </div>
            <button onClick={logout} className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative apex-grid">
        {showOnboarding && (
          <div className="absolute inset-0 z-50 bg-apex-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="glass rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-apex-accent"></div>
              <h2 className="text-3xl font-bold mb-2 tracking-tighter">INITIALIZING NODE</h2>
              <p className="text-white/40 mb-10 text-sm">Configure your cognitive baseline to optimize the learning neural network.</p>
              
              <div className="space-y-3">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => handleOnboarding(level)}
                    className="w-full py-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-apex-accent/10 hover:border-apex-accent/30 transition-all text-left px-8 group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 h-full w-1 bg-apex-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="font-black uppercase tracking-[0.2em] text-xs group-hover:text-apex-accent mb-1">{level}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest">
                      {level === 'HIGH' ? 'Advanced Cognitive State' : 
                       level === 'MEDIUM' ? 'Standard Baseline' : 
                       'Initial Learning Phase'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="h-full p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
