import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Layers, Zap, TrendingUp, ChevronRight, Info } from 'lucide-react';
import { AbilityLevel, ABILITY_WEIGHTS, BehaviorCorrectionOutput, AbilityScore } from '../types/ability';

interface AbilityTrackerProps {
  scores: Record<string, AbilityScore>;
  hierarchy: {
    id: string;
    name: string;
    level: AbilityLevel;
    parentId?: string;
  }[];
  lastBehavior?: BehaviorCorrectionOutput | null;
}

export const AbilityTracker: React.FC<AbilityTrackerProps> = ({ scores, hierarchy, lastBehavior }) => {
  const radarData = useMemo(() => {
    return hierarchy
      .filter(h => h.level === 'subject')
      .map(h => ({
        subject: h.name,
        score: Math.round((scores[h.id]?.score ?? 0.5) * 100),
      }));
  }, [scores, hierarchy]);

  const tagData = useMemo(() => {
    return hierarchy
      .filter(h => h.level === 'tag')
      .map(h => ({
        name: h.name,
        score: scores[h.id]?.score ?? 0.5,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [scores, hierarchy]);

  const getLevelColor = (level: AbilityLevel) => {
    switch (level) {
      case 'field': return 'bg-purple-500';
      case 'subject': return 'bg-blue-500';
      case 'majorUnit': return 'bg-emerald-500';
      case 'minorUnit': return 'bg-amber-500';
      case 'tag': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layers className="text-blue-600" />
            Hierarchical Ability Tracking
          </h1>
          <p className="text-gray-500 mt-1">5-Level Multi-Weighted Ability Model (0.0 - 1.0)</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(ABILITY_WEIGHTS).reverse().map(([level, weight]) => (
            <div key={level} className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-wider">
              <div className={`w-2 h-2 rounded-full ${getLevelColor(level as AbilityLevel)}`}></div>
              <span>{level}: {weight * 100}%</span>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart: Subject Overview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Subject Ability Profile
            </h2>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={14} />
              Aggregated from 5-level weights
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Radar
                  name="Ability"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Tags / Weaknesses */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Top Mastery Tags
            </h2>
            <div className="space-y-4">
              {tagData.map((tag, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{tag.name}</span>
                    <span className="text-blue-600 font-bold">{Math.round(tag.score * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${tag.score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold text-lg mb-2">Real-time Propagation</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Your "Calculus" tag update will propagate to "Major: Analysis" and "Subject: Math" with decreasing weights.
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
              View Detailed Hierarchy <ChevronRight size={16} />
            </button>
          </div>

          {lastBehavior && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Behavior Analysis
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tag</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    lastBehavior.behaviorTag === 'NORMAL' ? 'bg-green-50 text-green-600' :
                    lastBehavior.behaviorTag === 'LUCKY_GUESS' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {lastBehavior.behaviorTag}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Correction</span>
                  <span className="text-sm font-mono font-bold">x{lastBehavior.correctionFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Reliability</span>
                  <span className="text-sm font-mono font-bold">{(lastBehavior.reliabilityIndex * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Hierarchy List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold">Hierarchical Breakdown</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {hierarchy.filter(h => h.level === 'field' || h.level === 'subject').map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl ${getLevelColor(item.level)} flex items-center justify-center text-white font-bold`}>
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{item.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Current $\theta$</p>
                    <p className="text-xl font-black text-gray-900">{(scores[item.id]?.score ?? 0.5).toFixed(3)}</p>
                    <p className="text-[10px] text-gray-400">Solved: {scores[item.id]?.solvedProblemCount ?? 0}</p>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getLevelColor(item.level)}`}
                      style={{ width: `${(scores[item.id]?.score ?? 0.5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
