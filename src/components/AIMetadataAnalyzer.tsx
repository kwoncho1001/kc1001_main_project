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
      // Using mock for now to ensure it works in preview without env keys immediately
      // In real usage, swap to analyzeProblemMetadata
      const result = await AIMetadataService.mockAnalyze(problemText);
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
    <div className="flex flex-col h-full bg-[#E4E3E0] p-6 overflow-hidden">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#141414] rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Metadata Analyzer</h1>
        </div>
        <p className="text-black/60 text-sm">
          Extract hierarchical curriculum mapping and difficulty factors from problem text.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Input Section */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest opacity-40">Problem Input (OCR Text)</h2>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">READY</span>
            </div>
            
            <textarea
              className="flex-1 w-full p-6 bg-gray-50 border border-black/5 rounded-2xl text-lg font-serif resize-none focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="Paste problem text or LaTeX here... (e.g., Find the derivative of f(x) = sin(x^2) using implicit differentiation...)"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !problemText.trim()}
              className="mt-6 w-full bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing Context...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyze Metadata
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          {analysis ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Confidence Score */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-40">AI Confidence</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${analysis.confidence * 100}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-emerald-600">{(analysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                {analysis.confidence < 0.8 && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs font-bold">
                    <AlertTriangle size={14} />
                    Low confidence detected. Manual review recommended.
                  </div>
                )}
              </div>

              {/* Hierarchy Mapping */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Curriculum Mapping</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Field', id: analysis.metadata.fieldId },
                    { label: 'Course', id: analysis.metadata.subjectId },
                    { label: 'Major', id: analysis.metadata.majorUnitId },
                    { label: 'Minor', id: analysis.metadata.minorUnitId },
                    { label: 'Type', id: analysis.metadata.tagId },
                  ].map((level, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-20 text-[10px] font-black uppercase opacity-30">{level.label}</div>
                      <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-black/5 flex items-center justify-between group-hover:border-black/20 transition-colors">
                        <span className="font-bold text-sm">{getNodeName(level.id)}</span>
                        <span className="font-mono text-[10px] opacity-30">{level.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Factors */}
              <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Difficulty Fingerprint</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Computational Complexity', value: analysis.difficultyFactors.computationalComplexity },
                    { label: 'Conceptual Depth', value: analysis.difficultyFactors.conceptualDepth },
                    { label: 'Logical Reasoning', value: analysis.difficultyFactors.logicalReasoning },
                  ].map((factor, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span>{factor.label}</span>
                        <span className="font-mono opacity-50">{(factor.value * 10).toFixed(1)}/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#141414] transition-all duration-1000 delay-300" 
                          style={{ width: `${factor.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags & Concepts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Related Concepts</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.concepts.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/50 rounded-3xl border border-dashed border-black/10">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Database className="text-black/20" size={32} />
              </div>
              <h3 className="font-bold text-black/40">No Analysis Data</h3>
              <p className="text-sm text-black/30 max-w-[240px] mt-2">
                Enter problem text on the left to generate rich metadata using AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
