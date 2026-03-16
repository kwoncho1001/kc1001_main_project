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
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Prediction</h1>
          <p className="text-gray-500">AI-driven analysis of your future performance</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Current Streak</p>
              <p className="text-xl font-bold">{mockStats.streak} Days</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Accuracy</p>
              <p className="text-xl font-bold">{mockStats.accuracy}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Prediction Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Score Trend & Prediction</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Actual Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full border-dashed border"></div>
                <span>AI Prediction</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#93c5fd" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#93c5fd' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Target Achievement</h2>
          <div className="space-y-8">
            {mockPredictionData.map((data) => (
              <div key={data.subject}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{data.subject}</span>
                  <span className="text-sm text-gray-500">Target: {data.targetScore}</span>
                </div>
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${(data.currentScore / data.targetScore) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-300 opacity-50 transition-all duration-1000"
                    style={{ width: `${(data.predictedScore / data.targetScore) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-blue-600 font-bold">Current: {data.currentScore}</span>
                  <span className="text-blue-400 font-bold">Predicted: {data.predictedScore}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
              <Zap size={18} />
              <span>AI Insight</span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
              Increasing your weekly study hours by just 2 hours could boost your predicted Math score by 3 points.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weakness Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Weakness Analysis & Action Plan</h2>
          <div className="space-y-4">
            {mockPredictionData[0].weakTypes.map((weak, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg">
                      <AlertTriangle className="text-amber-600" size={16} />
                    </div>
                    <span className="font-bold text-gray-900">{weak.type}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Impact: +{weak.impact} pts
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{weak.recommendation}</p>
                <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                  Start Recommended Practice <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Guide */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Personalized Study Guide</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p className="mb-4">
              Based on your recent performance in <strong>Mathematics</strong>, you have shown significant improvement in <em>Algebra</em>, but <em>Calculus</em> remains a challenge.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
              <h4 className="font-bold text-gray-900 mb-2">Recommended Weekly Schedule:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Math: 8 hours (Focus 4h on Calculus)</li>
                <li>English: 5 hours (Focus 2h on Vocabulary)</li>
                <li>Other: 5 hours</li>
              </ul>
            </div>
            <p>
              Your current predicted grade for the upcoming Mock Exam is <strong>Grade 2</strong>. To secure <strong>Grade 1</strong>, prioritize the "Calculus" practice sets assigned in your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
