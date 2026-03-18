import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, Target, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { GradePredictionData, UserLearningStats } from '../types/prediction';

const mockPredictionData: GradePredictionData[] = [
  {
    subject: '수학',
    currentScore: 72,
    predictedScore: 85,
    targetScore: 92,
    currentGrade: 3,
    predictedGrade: 2,
    targetGrade: 1,
    confidenceInterval: [82, 88],
    weakTypes: [
      { type: '미적분', impact: 8, recommendation: '부분 적분 및 그 응용에 집중하세요.' },
      { type: '확률', impact: 5, recommendation: '조건부 확률과 베이즈 정리를 복습하세요.' }
    ],
    studyGuide: '현재 학습 속도에 따르면 2등급 달성이 예상됩니다. 목표인 1등급에 도달하려면 미적분 성취도를 15% 향상시켜야 합니다.'
  },
  {
    subject: '영어',
    currentScore: 88,
    predictedScore: 91,
    targetScore: 95,
    currentGrade: 2,
    predictedGrade: 1,
    targetGrade: 1,
    confidenceInterval: [89, 93],
    weakTypes: [
      { type: '어휘', impact: 3, recommendation: '고급 학술 어휘를 매일 연습하세요.' }
    ],
    studyGuide: '목표에 매우 근접했습니다. 현재의 꾸준함을 유지한다면 1등급 달성이 가능할 것으로 보입니다.'
  }
];

const mockStats: UserLearningStats = {
  totalQuestions: 1240,
  accuracy: 76.5,
  avgTimePerQuestion: 45,
  streak: 12,
  weeklyStudyHours: 18.5
};

const historyData = [
  { month: '1월', score: 65, predicted: 68 },
  { month: '2월', score: 68, predicted: 72 },
  { month: '3월', score: 72, predicted: 78 },
  { month: '4월', score: null, predicted: 85 },
  { month: '5월', score: null, predicted: 88 },
];

export const GradePrediction: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold heading-tight uppercase mb-2">성적 예측 분석</h1>
          <p className="text-muted-foreground font-medium">미래 성취 노드에 대한 AI 기반 예측 분석</p>
        </div>
        <div className="flex gap-4">
          <div className="card p-6 flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-micro mb-1">현재 연속 학습</p>
              <p className="text-2xl font-bold tracking-tighter">{mockStats.streak} 일</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-micro mb-1">정밀도</p>
              <p className="text-2xl font-bold tracking-tighter">{mockStats.accuracy}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Prediction Chart */}
        <div className="lg:col-span-2 card p-8 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-micro">성취 궤적</h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-micro">실제</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground/20 rounded-full border border-dashed border-foreground/40"></div>
                  <span className="text-micro">예측</span>
                </div>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[50, 100]} 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderRadius: '24px', 
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700, color: 'var(--foreground)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--accent)" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: 'var(--accent)', strokeWidth: 4, stroke: 'var(--background)' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="var(--muted-foreground)" 
                    strokeWidth={2} 
                    strokeDasharray="8 8"
                    dot={{ r: 4, fill: 'var(--muted)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Target Progress */}
        <div className="card p-8 flex flex-col">
          <h2 className="text-micro mb-12">목표 동기화</h2>
          <div className="space-y-12 flex-1">
            {mockPredictionData.map((data) => (
              <div key={data.subject}>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xl font-bold tracking-tight text-foreground">{data.subject}</span>
                  <span className="text-micro">목표: {data.targetScore}</span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent transition-all duration-1000 shadow-[0_0_15px_var(--accent-glow)]"
                    style={{ width: `${(data.currentScore / data.targetScore) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 left-0 h-full bg-foreground/10 transition-all duration-1000"
                    style={{ width: `${(data.predictedScore / data.targetScore) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">현재</span>
                    <span className="text-lg font-bold text-accent">{data.currentScore}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">예측</span>
                    <span className="text-lg font-bold text-foreground">{data.predictedScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-accent/5 rounded-[32px] border border-accent/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={48} className="text-accent" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                <Zap size={14} />
                <span>AI 분석 통찰</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                주간 학습 시간을 2시간만 늘려도 예상 수학 점수가 3점 상승할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weakness Analysis */}
        <div className="card p-8">
          <h2 className="text-micro mb-12">최적화 프로토콜</h2>
          <div className="space-y-4">
            {mockPredictionData[0].weakTypes.map((weak, idx) => (
              <div key={idx} className="p-8 rounded-[32px] bg-muted/30 border border-border hover:border-accent/30 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <AlertTriangle size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">{weak.type}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    영향: +{weak.impact} 점
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-6 font-medium leading-relaxed">{weak.recommendation}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  연습 프로토콜 시작 <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Guide */}
        <div className="card p-8">
          <h2 className="text-micro mb-12">전략적 지침</h2>
          <div className="space-y-8">
            <p className="text-xl font-medium text-foreground leading-tight">
              최근 <span className="text-accent">수학</span> 성취도 분석 결과, <span className="italic">대수학</span>에서는 유의미한 향상을 보였으나 <span className="text-red-500">미적분</span>은 여전히 과제로 남아 있습니다.
            </p>
            
            <div className="p-8 rounded-[32px] bg-muted/50 border border-border">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 text-center">권장 주간 할당</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold tracking-tighter mb-1 text-foreground">8H</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">수학</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-2xl font-bold tracking-tighter mb-1 text-foreground">5H</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">영어</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold tracking-tighter mb-1 text-foreground">5H</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">기타</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-3xl bg-muted/50 border border-border">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Target size={20} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                다가오는 모의고사 예상 등급은 <span className="text-foreground font-bold">2등급</span>입니다. <span className="text-accent font-bold">1등급</span>을 확보하려면 대시보드에 할당된 '미적분' 연습 세트를 우선적으로 학습하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
