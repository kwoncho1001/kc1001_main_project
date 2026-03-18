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
          <h2 className="text-4xl font-bold tracking-tighter uppercase mb-2">교사 대시보드</h2>
          <p className="text-white/40 font-medium">학생들의 학습 현황과 성취도를 실시간으로 모니터링합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5">
            <Search size={16} className="text-white/20" />
            <input 
              type="text" 
              placeholder="학생 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-medium w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-1 glass p-8 rounded-[48px] relative overflow-hidden h-[800px] flex flex-col">
          <div className="absolute inset-0 apex-grid opacity-5"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <Users size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">학생 목록</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={32} className="text-apex-accent animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {filteredStudents.map(student => (
                  <button
                    key={student.uid}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                      selectedStudent?.uid === student.uid 
                        ? 'bg-apex-accent/10 border-apex-accent/30 text-apex-accent' 
                        : 'glass border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedStudent?.uid === student.uid ? 'bg-apex-accent/20' : 'bg-white/5'
                    }`}>
                      <User size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-xs font-bold tracking-tight text-white group-hover:text-apex-accent transition-colors">
                        {student.displayName}
                      </span>
                      <span className="block text-[8px] uppercase tracking-widest opacity-40">
                        {student.email}
                      </span>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${selectedStudent?.uid === student.uid ? 'rotate-90' : ''}`} />
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
              <div className="glass p-10 rounded-[48px] relative overflow-hidden">
                <div className="absolute inset-0 apex-grid opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-apex-accent/20 flex items-center justify-center text-apex-accent border border-apex-accent/30">
                      <User size={40} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold tracking-tighter uppercase">{selectedStudent.displayName}</h3>
                      <p className="text-white/40 font-medium">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {analysis ? (
                <ProgressReport analysis={analysis} loading={analyzing} />
              ) : (
                <div className="glass p-10 rounded-[48px] flex flex-col items-center justify-center text-center opacity-40 h-64">
                  <AlertCircle size={40} className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">학습 데이터가 없습니다.</p>
                </div>
              )}
            </>
          ) : (
            <div className="glass p-10 rounded-[48px] h-full flex flex-col items-center justify-center text-center opacity-20 min-h-[600px]">
              <Users size={80} className="mb-6" />
              <h3 className="text-2xl font-bold tracking-tighter uppercase">학생을 선택해주세요</h3>
              <p className="text-sm font-medium">좌측 목록에서 학생을 선택하여 상세 데이터를 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
