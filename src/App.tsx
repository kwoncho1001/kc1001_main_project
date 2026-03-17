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
 * @description Reusable navigation button for the sidebar/topbar.
 */
const NavButton: React.FC<NavButtonProps> = ({ id, currentView, onClick, icon: Icon, label }) => {
  const isActive = currentView === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${
        isActive ? 'border-emerald-500 text-white' : 'border-transparent opacity-50 hover:opacity-100'
      }`}
    >
      <Icon size={14} />
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
      <div className="w-screen h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#F5F5F0] p-6">
        <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-emerald-500/20">M</div>
          <h1 className="text-4xl font-serif italic mb-4 text-[#1A1A1A]">Welcome Back</h1>
          <p className="text-gray-500 mb-10">Sign in to sync your learning progress and access personalized rewards.</p>
          <button
            onClick={login}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Navigation Rail */}
      <nav className="h-12 bg-[#141414] text-[#E4E3E0] flex items-center px-6 gap-8 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-6 h-6 bg-emerald-500 rounded-sm flex items-center justify-center text-[#141414] font-bold text-xs">M</div>
          <span className="font-bold uppercase tracking-widest text-[10px]">Main Project</span>
        </div>
        
        <NavButton id="scanner" currentView={view} onClick={setView} icon={Scan} label="Advanced Scanner" />
        <NavButton id="exam" currentView={view} onClick={setView} icon={PenTool} label="Exam Interface" />
        <NavButton id="bookmarks" currentView={view} onClick={setView} icon={Star} label="Bookmarks" />
        <NavButton id="prediction" currentView={view} onClick={setView} icon={BarChart3} label="Grade Prediction" />
        <NavButton id="ability" currentView={view} onClick={setView} icon={Layers} label="Ability Tracker" />
        <NavButton id="hierarchy" currentView={view} onClick={setView} icon={Database} label="Hierarchy Manager" />
        <NavButton id="ai-analyzer" currentView={view} onClick={setView} icon={Brain} label="AI Analyzer" />
        <NavButton id="ocr-extractor" currentView={view} onClick={setView} icon={FileSearch} label="OCR Extractor" />
        <NavButton id="gamification" currentView={view} onClick={setView} icon={Trophy} label="Rewards" />

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-white/20" />
            <span className="text-[10px] font-bold opacity-70 truncate max-w-[100px]">{user.displayName}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
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

        {renderView()}
      </main>
    </div>
  );
}
