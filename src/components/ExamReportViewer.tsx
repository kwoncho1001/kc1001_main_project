import React, { useState } from 'react';
import { Report } from './Report';
import { ExamScoringResponse } from '../types/ability';
import { QuestionStat } from '../services/examScorerService';
import { Search, Filter, History, ChevronRight } from 'lucide-react';

export const ExamReportViewer: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Mock reports data
  const mockReports = [
    { id: 'rep-1', title: '수학 실력 진단 평가', date: '2026.03.18', score: 85.0, student: '권초' },
    { id: 'rep-2', title: '미적분 기초 테스트', date: '2026.03.10', score: 92.5, student: '권초' },
    { id: 'rep-3', title: '확률과 통계 주간 평가', date: '2026.03.01', score: 78.0, student: '권초' }
  ];

  // Mock scoring and stats for the selected report
  const MOCK_SCORING: ExamScoringResponse = {
    totalScore: 85.0,
    rank: 12,
    totalCandidates: 154
  };

  const MOCK_STATS: QuestionStat[] = Array.from({ length: 10 }, (_, i) => ({
    questionId: `p${i + 1}`,
    errorRate: Math.random() * 0.8,
    totalAttempts: 154
  }));

  if (selectedReport) {
    const reportInfo = mockReports.find(r => r.id === selectedReport);
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedReport(null)}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ChevronRight size={14} className="rotate-180" />
          목록으로 돌아가기
        </button>
        <Report 
          studentName={reportInfo?.student || '권초'} 
          examTitle={reportInfo?.title || '진단 평가'} 
          date={reportInfo?.date || '2026.03.18'} 
          scoring={MOCK_SCORING} 
          questionStats={MOCK_STATS} 
          teacherComment="전반적으로 우수한 성적을 거두었습니다. 특히 고난도 문항에서의 논리적 사고력이 돋보입니다. 다만, 기초적인 연산 실수에 주의한다면 더 완벽한 결과를 얻을 수 있을 것입니다."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter uppercase mb-2">리포트 보관함</h2>
          <p className="text-white/40 font-medium">지금까지 산출된 모든 분석 보고서를 확인할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border-white/5">
            <Search size={16} className="text-white/20" />
            <input 
              type="text" 
              placeholder="리포트 검색..." 
              className="bg-transparent border-none focus:outline-none text-xs font-medium w-48"
            />
          </div>
          <button className="w-12 h-12 rounded-2xl glass border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockReports.map((report) => (
          <button 
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className="glass p-8 rounded-[40px] relative overflow-hidden group text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute inset-0 apex-grid opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-apex-accent/20 flex items-center justify-center text-apex-accent">
                  <History size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-apex-accent px-3 py-1 bg-apex-accent/10 rounded-full">
                  {report.score.toFixed(1)}점
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tighter uppercase mb-2">{report.title}</h3>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                <span>{report.date}</span>
                <div className="w-1 h-1 rounded-full bg-white/10"></div>
                <span>{report.student}</span>
              </div>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-apex-accent opacity-0 group-hover:opacity-100 transition-all">
                상세 분석 보기 <ChevronRight size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
