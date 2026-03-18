import React from 'react';
import { ResultCard } from './ResultCard';
import { ExamScoringResponse } from '../types/ability';
import { QuestionStat } from '../services/examScorerService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle2, FileDown, Loader2 } from 'lucide-react';
import { usePdfGenerator } from '../hooks/usePdfGenerator';

interface ReportProps {
  studentName: string;
  examTitle: string;
  date: string;
  scoring: ExamScoringResponse;
  questionStats: QuestionStat[];
  teacherComment?: string;
}

export const Report: React.FC<ReportProps> = ({ 
  studentName, 
  examTitle, 
  date, 
  scoring, 
  questionStats, 
  teacherComment 
}) => {
  const { generateReport, isGenerating } = usePdfGenerator();

  const handleDownload = async () => {
    await generateReport({
      studentName,
      examTitle,
      date,
      scoring,
      questionStats,
      teacherComment
    });
  };

  const chartData = questionStats.map(stat => ({
    name: `Q${stat.questionId}`,
    errorRate: stat.errorRate * 100,
    isHighError: stat.errorRate > 0.6
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold heading-tight uppercase mb-2">종합 분석 리포트</h2>
          <p className="text-muted-foreground font-medium">{studentName} 학생의 {examTitle} 결과 분석입니다.</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-8 py-4 accent-gradient text-white rounded-3xl font-bold uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all flex items-center gap-3 shadow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileDown size={16} />
          )}
          PDF 리포트 저장
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ResultCard 
          scoring={scoring} 
          title={examTitle} 
          date={date} 
          className="lg:col-span-1"
        />

        <div className="lg:col-span-2 card p-10 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-micro text-muted-foreground">문항별 오답률 분석</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">정상</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">취약</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
                    unit="%"
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--foreground)'
                    }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="errorRate" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isHighError ? 'var(--error)' : 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-10 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <h3 className="text-micro text-muted-foreground mb-8">선생님 피드백</h3>
            <div className="p-8 bg-accent/5 border border-accent/20 rounded-3xl">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                {teacherComment || "분석된 데이터를 바탕으로 개별 맞춤 학습 전략을 수립 중입니다."}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-10 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <h3 className="text-micro text-muted-foreground mb-8">취약 유형 분석</h3>
            <div className="space-y-4">
              {questionStats.filter(s => s.errorRate > 0.5).slice(0, 3).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">문항 {stat.questionId}</span>
                      <p className="text-xs font-bold tracking-tight text-muted-foreground">오답률 { (stat.errorRate * 100).toFixed(0) }%</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest px-3 py-1 bg-red-500/20 text-red-500 rounded-full">집중 학습 필요</span>
                </div>
              ))}
              {questionStats.filter(s => s.errorRate <= 0.2).slice(0, 1).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-accent/5 border border-accent/10 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">문항 {stat.questionId}</span>
                      <p className="text-xs font-bold tracking-tight text-muted-foreground">오답률 { (stat.errorRate * 100).toFixed(0) }%</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest px-3 py-1 bg-accent/20 text-accent rounded-full">완벽 이해</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
