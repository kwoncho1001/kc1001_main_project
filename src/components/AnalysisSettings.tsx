import React, { useState } from 'react';
import { Settings, Sliders, Target, ShieldAlert, CheckCircle2, Save } from 'lucide-react';

interface WeightSetting {
  level: string;
  weight: number;
}

export const AnalysisSettings: React.FC = () => {
  const [weights, setWeights] = useState<WeightSetting[]>([
    { level: '기초 (Lv.1)', weight: 0.1 },
    { level: '기본 (Lv.2)', weight: 0.2 },
    { level: '응용 (Lv.3)', weight: 0.3 },
    { level: '심화 (Lv.4)', weight: 0.25 },
    { level: '킬러 (Lv.5)', weight: 0.15 }
  ]);

  const [range, setRange] = useState('전체');
  const [saved, setSaved] = useState(false);

  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...weights];
    newWeights[index].weight = value;
    setWeights(newWeights);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalWeight = weights.reduce((acc, w) => acc + w.weight, 0);

  return (
    <div className="glass p-10 rounded-[48px] relative overflow-hidden">
      <div className="absolute inset-0 apex-grid opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-apex-accent/20 flex items-center justify-center text-apex-accent">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tighter uppercase">분석 엔진 설정</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">알고리즘 가중치 및 범위 최적화</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-white text-apex-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-apex-accent transition-all flex items-center gap-3"
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? '저장됨' : '설정 저장'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Difficulty Weights */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Sliders size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">난이도별 가중치</h3>
            </div>
            
            <div className="space-y-6">
              {weights.map((w, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">{w.level}</span>
                    <span className="text-apex-accent">{(w.weight * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={w.weight}
                    onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-apex-accent"
                  />
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${Math.abs(totalWeight - 1) < 0.01 ? 'bg-apex-accent/10 border-apex-accent/20 text-apex-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {Math.abs(totalWeight - 1) < 0.01 ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                가중치 합계: {(totalWeight * 100).toFixed(0)}% {Math.abs(totalWeight - 1) >= 0.01 && '(100%가 되어야 합니다)'}
              </span>
            </div>
          </div>

          {/* Analysis Range */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Target size={16} className="text-apex-accent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">분석 범위 설정</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['전체', '최근 1개월', '최근 3개월', '특정 단원'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRange(r)}
                  className={`p-6 rounded-3xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    range === r 
                      ? 'bg-white text-apex-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                      : 'glass border-white/5 text-white/40 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
              <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">알고리즘 정보</h4>
              <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                설정된 가중치는 학생의 역량 지수($\theta$) 산출 시 각 문항의 기여도를 결정합니다. 
                범위 설정에 따라 시계열 분석의 윈도우 크기가 조정됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
