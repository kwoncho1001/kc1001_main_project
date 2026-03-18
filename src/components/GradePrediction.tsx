import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, Target, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { GradePredictionData, UserLearningStats } from '../types/prediction';

const mockPredictionData: GradePredictionData[] = [
  {
    subject: 'Mathematics',
    currentScore: 72,
    predictedScore: 85,
    targetScore: 92,
    currentGrade: 3,
    predictedGrade: 2,
    targetGrade: 1,
    confidenceInterval: [82, 88],
    weakTypes: [
      { type: 'Calculus', impact: 8, recommendation: 'Focus on integration by parts and its applications.' },
      { type: 'Probability', impact: 5, recommendation: 'Review conditional probability and Bayes theorem.' }
    ],
    studyGuide: 'Currently, based on your learning pace, you are expected to reach Grade 2. To reach your target of Grade 1, you need to improve your Calculus performance by 15%.'
  },
  {
    subject: 'English',
    currentScore: 88,
    predictedScore: 91,
    targetScore: 95,
    currentGrade: 2,
    predictedGrade: 1,
    targetGrade: 1,
    confidenceInterval: [89, 93],
    weakTypes: [
      { type: 'Vocabulary', impact: 3, recommendation: 'Daily practice of advanced academic vocabulary.' }
    ],
    studyGuide: 'You are very close to your target. Maintaining your current consistency will likely result in a Grade 1.'
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
  { month: 'Jan', score: 65, predicted: 68 },
  { month: 'Feb', score: 68, predicted: 72 },
  { month: 'Mar', score: 72, predicted: 78 },
  { month: 'Apr', score: null, predicted: 85 },
  { month: 'May', score: null, predicted: 88 },
];

export const GradePrediction: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-2">Neural Forecasting</h1>
          <p className="text-white/40 font-medium">AI-driven predictive analysis of future performance nodes</p>
        </div>
        <div className="flex gap-4">
          <div className="glass p-6 rounded-3xl flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-apex-accent/10 flex items-center justify-center text-apex-accent">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Current Streak</p>
              <p className="text-2xl font-bold tracking-tighter">{mockStats.streak} DAYS</p>
            </div>
          </div>
          <div className="glass p-6 rounded-3xl flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-apex-accent/10 flex items-center justify-center text-apex-accent">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Accuracy</p>
              <p className="text-2xl font-bold tracking-tighter">{mockStats.accuracy}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Prediction Chart */}
        <div className="lg:col-span-2 glass rounded-[48px] p-8 relative overflow-hidden">
          <div className="absolute inset-0 apex-grid opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Performance Trajectory</h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-apex-accent rounded-full"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/20 rounded-full border border-dashed border-white/40"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Forecast</span>
                </div>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[50, 100]} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10,10,10,0.9)', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#0a0a0a' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth={2} 
                    strokeDasharray="8 8"
                    dot={{ r: 4, fill: 'rgba(255,255,255,0.1)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Target Progress */}
        <div className="glass rounded-[48px] p-8 flex flex-col">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-12">Target Synchronization</h2>
          <div className="space-y-12 flex-1">
            {mockPredictionData.map((data) => (
              <div key={data.subject}>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xl font-bold tracking-tight">{data.subject}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target: {data.targetScore}</span>
                </div>
                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-apex-accent transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(data.currentScore / data.targetScore) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/10 transition-all duration-1000"
                    style={{ width: `${(data.predictedScore / data.targetScore) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Current</span>
                    <span className="text-lg font-bold text-apex-accent">{data.currentScore}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Forecast</span>
                    <span className="text-lg font-bold text-white/60">{data.predictedScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-apex-accent/5 rounded-[32px] border border-apex-accent/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={48} className="text-apex-accent" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-apex-accent font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                <Zap size={14} />
                <span>Neural Insight</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-medium">
                Increasing your weekly study hours by just 2 hours could boost your predicted Math score by 3 points.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weakness Analysis */}
        <div className="glass rounded-[48px] p-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-12">Optimization Protocols</h2>
          <div className="space-y-4">
            {mockPredictionData[0].weakTypes.map((weak, idx) => (
              <div key={idx} className="p-8 rounded-[32px] bg-white/5 border border-white/5 hover:border-apex-accent/30 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <AlertTriangle size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">{weak.type}</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Impact: +{weak.impact} PTS
                  </span>
                </div>
                <p className="text-white/40 text-sm mb-6 font-medium leading-relaxed">{weak.recommendation}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-apex-accent uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  Initiate Practice Protocol <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Guide */}
        <div className="glass rounded-[48px] p-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-12">Strategic Directive</h2>
          <div className="space-y-8">
            <p className="text-xl font-medium text-white/80 leading-tight">
              Based on your recent performance in <span className="text-apex-accent">Mathematics</span>, you have shown significant improvement in <span className="italic">Algebra</span>, but <span className="text-red-500">Calculus</span> remains a challenge.
            </p>
            
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
              <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-6 text-center">Recommended Weekly Allocation</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold tracking-tighter mb-1">8H</div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Math</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-2xl font-bold tracking-tighter mb-1">5H</div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">English</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold tracking-tighter mb-1">5H</div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Other</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-apex-accent/10 flex items-center justify-center text-apex-accent shrink-0">
                <Target size={20} />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                Your current predicted grade for the upcoming Mock Exam is <span className="text-white font-bold">Grade 2</span>. To secure <span className="text-apex-accent font-bold">Grade 1</span>, prioritize the "Calculus" practice sets assigned in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
