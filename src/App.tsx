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
import { ExamScorer } from './components/ExamScorer';
import { ExamReportViewer } from './components/ExamReportViewer';
import { AnalysisSettings } from './components/AnalysisSettings';
import { FileUpload } from './components/FileUpload';
import { TeacherDashboard } from './components/TeacherDashboard';
import { DatabaseInitializer } from './components/DatabaseInitializer';
import { 
  PenTool, 
  Scan, 
  Star, 
  BarChart3, 
  Layers, 
  Database, 
  Brain, 
  FileSearch, 
  Trophy,
  LogOut,
  Calculator,
  FileText,
  Settings,
  Upload,
  Users,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

import { AbilityLevel, SolvingResult, BehaviorCorrectionOutput, InitialSkillRequest, AbilityScore, WeightCalculationResponse } from './types/ability';
import { BehaviorCorrectionService } from './services/behaviorCorrection';
import { InitialSkillService } from './services/initialSkillService';
import { SkillUpdateService } from './services/skillUpdateService';
import { WeightCalculationService } from './services/weightCalculationService';
import { HierarchyService } from './services/hierarchyService';
import { useAuth } from './components/AuthProvider';
import { FirebaseService } from './services/firebaseService';

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
      className={`w-full px-4 py-2.5 flex items-center gap-3 text-[11px] font-semibold transition-all rounded-lg group ${
        isActive 
          ? 'bg-accent/10 text-accent border border-accent/20' 
          : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
      }`}
    >
      <Icon size={16} className={isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground/70'} />
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
  const [view, setView] = useState<'exam' | 'scanner' | 'bookmarks' | 'prediction' | 'ability' | 'hierarchy' | 'ocr-extractor' | 'gamification' | 'scorer' | 'reports' | 'settings' | 'upload' | 'teacher-dashboard'>('scanner');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [abilityScores, setAbilityScores] = useState<Record<string, AbilityScore>>({}); // Start empty for onboarding demo
  const [lastBehavior, setLastBehavior] = useState<BehaviorCorrectionOutput | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [prediction, setPrediction] = useState<WeightCalculationResponse | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

    // Save Transaction Log
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const log = {
      id: logId,
      studentId: result.studentId,
      problemId: 'p1', // Mock
      isCorrect: result.isCorrect,
      timeSpentMs: result.timeSpentMs,
      difficulty: Math.round(result.metadata.difficulty * 4 + 1),
      timestamp: Date.now(),
      hierarchyPath: `${result.metadata.fieldId}/${result.metadata.subjectId}/${result.metadata.majorUnitId}/${result.metadata.minorUnitId}/${result.metadata.tagId}`
    };
    await FirebaseService.saveTransactionLog(log);

    // Update Progress Master for the specific type
    const hierarchyId = result.metadata.tagId;
    const currentProgress = (await FirebaseService.subscribeToProgressMaster((p) => {})) // This is a bit complex for a simple handleSolve
    // For simplicity, let's just save a new progress entry
    await FirebaseService.saveProgressMaster({
      studentId: result.studentId,
      hierarchyId: hierarchyId,
      level: 'TYPE',
      currentScore: updatedScores[hierarchyId]?.score || 0,
      totalAttempts: 1, // Mock: would normally fetch current
      correctAttempts: result.isCorrect ? 1 : 0,
      lastAttemptTimestamp: Date.now(),
      trend: result.isCorrect ? 'UP' : 'DOWN'
    });
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
      case 'ocr-extractor':
        return <ProblemExtractor />;
      case 'gamification':
        return <GamificationDashboard />;
      case 'scorer':
        return <ExamScorer />;
      case 'reports':
        return <ExamReportViewer />;
      case 'settings':
        return (
          <div className="space-y-12">
            <AnalysisSettings />
            <div className="border-t border-white/5 pt-12">
              <DatabaseInitializer />
            </div>
          </div>
        );
      case 'upload':
        return <FileUpload />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      default:
        return <ScannerUI />;
    }
  };

  if (loading) {
    return (
      <div className={`${theme}`}>
        <div className="w-screen h-screen flex items-center justify-center bg-background text-foreground grid-pattern">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-accent/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${theme}`}>
        <div className="w-screen h-screen flex items-center justify-center bg-background text-foreground grid-pattern p-6">
          <div className="card p-12 max-w-md w-full text-center relative overflow-hidden glow">
            <div className="absolute top-0 left-0 w-full h-1 accent-gradient"></div>
            <div className="w-20 h-20 accent-gradient rounded-2xl mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black shadow-lg">A</div>
            <h1 className="text-3xl font-bold mb-3 heading-tight">APEX NETWORK</h1>
            <p className="text-muted-foreground mb-10 text-sm">차세대 학생들을 위한 쉽고 강력한 학습 도우미입니다.</p>
            <button
              onClick={login}
              className="w-full bg-foreground text-background py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Google로 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme}`}>
      <div className="w-screen h-screen flex bg-background text-foreground overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border flex flex-col shrink-0 bg-card/50 backdrop-blur-md">
          <div className="p-6 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md">A</div>
              <div>
                <span className="block font-bold text-sm tracking-tight">APEX</span>
                <span className="block text-[10px] text-muted-foreground">Learning System</span>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
          
          <div className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
            <div className="px-3 mb-3">
              <span className="text-micro">학습 도구</span>
            </div>
            <NavButton id="scanner" currentView={view} onClick={setView} icon={Scan} label="문제 스캔" />
            <NavButton id="exam" currentView={view} onClick={setView} icon={PenTool} label="학습 모드" />
            <NavButton id="bookmarks" currentView={view} onClick={setView} icon={Star} label="오답 노트" />
            
            <div className="px-3 mt-8 mb-3">
              <span className="text-micro">학습 분석</span>
            </div>
            <NavButton id="prediction" currentView={view} onClick={setView} icon={BarChart3} label="성적 예측" />
            <NavButton id="ability" currentView={view} onClick={setView} icon={Layers} label="학습 지표" />
            <NavButton id="hierarchy" currentView={view} onClick={setView} icon={Database} label="학습 계층" />
            
            <div className="px-3 mt-8 mb-3">
              <span className="text-micro">AI 도우미</span>
            </div>
            <NavButton id="ocr-extractor" currentView={view} onClick={setView} icon={FileSearch} label="문제 추출 및 분석" />
            <NavButton id="gamification" currentView={view} onClick={setView} icon={Trophy} label="업적 및 보상" />
            
            <div className="px-3 mt-8 mb-3">
              <span className="text-micro">시스템 관리</span>
            </div>
            <NavButton id="scorer" currentView={view} onClick={setView} icon={Calculator} label="성적 입력" />
            <NavButton id="reports" currentView={view} onClick={setView} icon={FileText} label="리포트 보관함" />
            <NavButton id="settings" currentView={view} onClick={setView} icon={Settings} label="분석 설정" />
            <NavButton id="upload" currentView={view} onClick={setView} icon={Upload} label="데이터 업로드" />
            <NavButton id="teacher-dashboard" currentView={view} onClick={setView} icon={Users} label="교사 대시보드" />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-all">
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-lg border border-border" />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold truncate">{user.displayName}</span>
                <span className="block text-[10px] text-muted-foreground">Active</span>
              </div>
              <button onClick={logout} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto relative grid-pattern">
          {showOnboarding && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="card p-10 max-w-md w-full shadow-2xl relative overflow-hidden glow">
                <div className="absolute top-0 left-0 w-full h-1 accent-gradient"></div>
                <h2 className="text-2xl font-bold mb-2 heading-tight">학습 프로필 설정</h2>
                <p className="text-muted-foreground mb-8 text-sm">맞춤형 학습 분석을 위해 현재 실력을 선택해주세요.</p>
                
                <div className="space-y-3">
                  {(['HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => handleOnboarding(level)}
                      className="w-full py-4 rounded-xl border border-border bg-foreground/5 hover:bg-accent/10 hover:border-accent/30 transition-all text-left px-6 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{level === 'HIGH' ? '상급' : level === 'MEDIUM' ? '중급' : '초급'}</span>
                        <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-12 max-w-7xl mx-auto min-h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
