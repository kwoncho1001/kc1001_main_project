import React, { useState } from 'react';
import { AIMetadataService } from '../services/aiMetadataService';
import { AIMetadataAnalysisResponse, AbilityLevel } from '../types/ability';
import { HierarchyService } from '../services/hierarchyService';
import { 
  Brain, 
  Search, 
  Tag, 
  Layers, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  Database
} from 'lucide-react';

export const AIMetadataAnalyzer: React.FC = () => {
  const [problemText, setProblemText] = useState('');
  const [analysis, setAnalysis] = useState<AIMetadataAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!problemText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await AIMetadataService.analyzeProblemMetadata(problemText);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze problem metadata. Please check your API configuration.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getNodeName = (id: string) => {
    const node = HierarchyService.getAllNodes().find(n => n.id === id);
    return node ? node.name : id;
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <Brain size={28} />
          </div>
          <h1 className="text-4xl font-bold heading-tight uppercase">AI 문제 분석기</h1>
        </div>
        <p className="text-muted-foreground font-medium ml-16">
          문제 텍스트를 분석하여 교육과정 단원과 난이도를 자동으로 분류합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Input Section */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="card p-8 flex flex-col flex-1 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-micro">문제 텍스트 입력</h2>
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20 tracking-widest uppercase">Ready</span>
              </div>
              
              <textarea
                className="flex-1 w-full p-6 bg-muted/50 border border-border rounded-2xl text-lg font-medium resize-none focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted-foreground"
                placeholder="문제 텍스트 또는 LaTeX를 여기에 붙여넣으세요... (예: 미분 f(x) = sin(x^2)를 구하시오...)"
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !problemText.trim()}
                className="mt-8 w-full accent-gradient text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    분석 실행
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          {analysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              {/* Confidence Score */}
              <div className="card p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-micro">AI 분석 신뢰도</h3>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent shadow-[0_0_10px_var(--accent-glow)] transition-all duration-1000" 
                          style={{ width: `${analysis.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-accent text-lg">{(analysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  {analysis.confidence < 0.8 && (
                    <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest">
                      <AlertTriangle size={16} />
                      낮은 신뢰도가 감지되었습니다. 수동 확인이 필요합니다.
                    </div>
                  )}
                </div>
              </div>

              {/* Hierarchy Mapping */}
              <div className="card p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-micro mb-8">교육과정 단원 분류</h3>
                  <div className="space-y-3">
                    {[
                      { label: '분야', id: analysis.metadata.fieldId },
                      { label: '과목', id: analysis.metadata.subjectId },
                      { label: '대단원', id: analysis.metadata.majorUnitId },
                      { label: '소단원', id: analysis.metadata.minorUnitId },
                      { label: '유형', id: analysis.metadata.tagId },
                    ].map((level, idx) => (
                      <div key={idx} className="flex items-center gap-6 group">
                        <div className="w-20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{level.label}</div>
                        <div className="flex-1 bg-muted p-4 rounded-xl border border-border flex items-center justify-between group-hover:border-accent/30 transition-all">
                          <span className="font-semibold text-sm text-foreground">{getNodeName(level.id)}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{level.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty Factors */}
              <div className="card p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-micro mb-8">상세 난이도 분석</h3>
                  <div className="space-y-8">
                    {[
                      { label: '계산 복잡도', value: analysis.difficultyFactors.computationalComplexity },
                      { label: '개념적 깊이', value: analysis.difficultyFactors.conceptualDepth },
                      { label: '논리적 추론', value: analysis.difficultyFactors.logicalReasoning },
                    ].map((factor, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                          <span className="text-muted-foreground">{factor.label}</span>
                          <span className="font-mono text-accent">{(factor.value * 10).toFixed(1)}/10</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent shadow-[0_0_10px_var(--accent-glow)] transition-all duration-1000 delay-300" 
                            style={{ width: `${factor.value * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags & Concepts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="card p-8">
                  <h3 className="text-micro mb-6">핵심 키워드</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-[10px] font-semibold text-muted-foreground border border-border">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card p-8">
                  <h3 className="text-micro mb-6">관련 개념</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.concepts.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-semibold border border-accent/20">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 card border-dashed opacity-50">
              <Database size={48} className="mb-6 text-muted-foreground" />
              <h3 className="text-xl font-bold uppercase tracking-widest text-foreground">분석 대기 중</h3>
              <p className="text-[10px] uppercase tracking-widest mt-3 text-muted-foreground">
                문제를 입력하여 분석을 시작하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
