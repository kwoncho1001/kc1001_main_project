import React, { useState, useEffect } from 'react';
import { Users, User, TrendingUp, AlertCircle, ChevronRight, Search, Filter, Loader2 } from 'lucide-react';
import { FirebaseService } from '../services/firebaseService';
import { ProgressMaster, TransactionLog, AbilityScore, AnalysisResult } from '../types/ability';
import { AnalysisService } from '../services/analysisService';
import { ProgressReport } from './ProgressReport';

interface StudentData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [studentLogs, setStudentLogs] = useState<TransactionLog[]>([]);
  const [studentProgress, setStudentProgress] = useState<ProgressMaster[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Mock student list for now, in real app fetch from 'users' collection
        const mockStudents = [
          { uid: 'student-1', email: 'student1@example.com', displayName: '김철수' },
          { uid: 'student-2', email: 'student2@example.com', displayName: '이영희' },
          { uid: 'student-3', email: 'student3@example.com', displayName: '박지민' },
        ];
        setStudents(mockStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;

    setAnalyzing(true);
    const unsubLogs = FirebaseService.subscribeToRecentLogs((logs) => {
      setStudentLogs(logs);
    }, selectedStudent.uid);

    const unsubProgress = FirebaseService.subscribeToProgressMaster((progress) => {
      setStudentProgress(progress);
    }, selectedStudent.uid);

    return () => {
      unsubLogs();
      unsubProgress();
    };
  }, [selectedStudent]);

  useEffect(() => {
    const runAnalysis = async () => {
      if (!selectedStudent || studentLogs.length === 0) {
        setAnalysis(null);
        setAnalyzing(false);
        return;
      }

      setAnalyzing(true);
      const result = await AnalysisService.analyzeStudent(selectedStudent.uid, studentLogs, studentProgress);
      setAnalysis(result);
      setAnalyzing(false);
    };

    runAnalysis();
  }, [studentLogs, studentProgress, selectedStudent]);

  const filteredStudents = students.filter(s => 
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold heading-tight uppercase mb-2">교사 대시보드</h2>
          <p className="text-muted-foreground font-medium">학생들의 학습 현황과 성취도를 실시간으로 모니터링합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="card px-6 py-3 flex items-center gap-3 border-border">
            <Search size={16} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="학생 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-medium w-48 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-1 card p-8 relative overflow-hidden h-[800px] flex flex-col">
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <Users size={16} className="text-accent" />
              <h3 className="text-micro text-muted-foreground">학생 목록</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={32} className="text-accent animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {filteredStudents.map(student => (
                  <button
                    key={student.uid}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-4 group ${
                      selectedStudent?.uid === student.uid 
                        ? 'bg-accent/10 border-accent/30 text-accent shadow-lg' 
                        : 'bg-background/50 border-border text-muted-foreground hover:border-accent/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      selectedStudent?.uid === student.uid ? 'bg-accent/20 text-accent' : 'bg-background/50 text-muted-foreground'
                    }`}>
                      <User size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`block text-sm font-bold tracking-tight transition-colors ${
                        selectedStudent?.uid === student.uid ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        {student.displayName}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {student.email}
                      </span>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${selectedStudent?.uid === student.uid ? 'rotate-90 text-accent' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Detail */}
        <div className="lg:col-span-2 space-y-8">
          {selectedStudent ? (
            <>
              <div className="card p-10 relative overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[32px] bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-xl">
                      <User size={48} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold heading-tight uppercase mb-2">{selectedStudent.displayName}</h3>
                      <p className="text-muted-foreground font-medium text-lg">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {analysis ? (
                <ProgressReport analysis={analysis} loading={analyzing} />
              ) : (
                <div className="card p-10 flex flex-col items-center justify-center text-center opacity-40 h-64 border-dashed border-2">
                  <AlertCircle size={40} className="mb-4 text-muted-foreground" />
                  <p className="text-micro">학습 데이터가 없습니다.</p>
                </div>
              )}
            </>
          ) : (
            <div className="card p-10 h-full flex flex-col items-center justify-center text-center opacity-20 min-h-[600px] border-dashed border-2">
              <Users size={80} className="mb-6 text-muted-foreground" />
              <h3 className="text-3xl font-bold heading-tight uppercase mb-4">학생을 선택해주세요</h3>
              <p className="text-lg font-medium text-muted-foreground">좌측 목록에서 학생을 선택하여 상세 데이터를 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
