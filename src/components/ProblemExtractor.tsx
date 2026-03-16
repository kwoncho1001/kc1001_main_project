import React, { useState, useRef } from 'react';
import { OCRService } from '../services/ocrService';
import { ExtractedProblem, OCRProcessingState, OCRResult } from '../types/ability';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Edit3, 
  Layers, 
  Type, 
  Sigma, 
  Image as ImageIcon,
  Check,
  X,
  Save,
  ArrowRight
} from 'lucide-react';

export const ProblemExtractor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<OCRProcessingState>({
    status: 'IDLE',
    progress: 0,
    message: ''
  });
  const [extractedProblems, setExtractedProblems] = useState<ExtractedProblem[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startProcessing = async () => {
    if (!file) return;
    try {
      const results = await OCRService.processFile(file, setProcessingState);
      setExtractedProblems(results);
    } catch (err) {
      setProcessingState({
        status: 'IDLE',
        progress: 0,
        message: 'Error processing file. Please try again.'
      });
    }
  };

  const handleCandidateSelect = (problemIdx: number, elementId: string, text: string) => {
    setExtractedProblems(prev => {
      const next = [...prev];
      const problem = { ...next[problemIdx] };
      const element = problem.rawElements.find(e => e.id === elementId);
      if (element) {
        element.content = text;
        element.isUncertain = false;
      }
      // Rebuild problem content if needed (simplified here)
      next[problemIdx] = problem;
      return next;
    });
  };

  const handleManualEdit = (problemIdx: number, field: keyof ExtractedProblem, value: string) => {
    setExtractedProblems(prev => {
      const next = [...prev];
      next[problemIdx] = { ...next[problemIdx], [field]: value };
      return next;
    });
  };

  const isAllReviewed = extractedProblems.every(p => 
    p.rawElements.every(e => !e.isUncertain)
  );

  if (processingState.status === 'IDLE') {
    return (
      <div className="flex flex-col h-full bg-[#E4E3E0] p-8 items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-black/5 shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Upload className="text-black/20" size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4">OCR Problem Extractor</h1>
          <p className="text-black/50 mb-12">
            Upload a PDF or image of a past exam paper. Our AI will separate handwriting, 
            extract text, formulas, and diagrams for digital storage.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black/10 rounded-2xl p-12 cursor-pointer hover:bg-gray-50 transition-all mb-8"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,image/*"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold">
                <FileText size={24} />
                <span>{file.name}</span>
              </div>
            ) : (
              <span className="text-black/30 font-bold">Click to select or drag & drop file</span>
            )}
          </div>

          <button
            disabled={!file}
            onClick={startProcessing}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
          >
            Start AI Analysis
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (processingState.status !== 'REVIEW_REQUIRED' && processingState.status !== 'COMPLETED') {
    return (
      <div className="flex flex-col h-full bg-[#E4E3E0] p-8 items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-black/5 shadow-xl p-12 text-center">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-8" size={48} />
          <h2 className="text-xl font-black mb-2">{processingState.message}</h2>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-6">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-4">
            Step {Math.ceil(processingState.progress / 20)} of 5
          </p>
        </div>
      </div>
    );
  }

  const activeProblem = extractedProblems[activeProblemIdx];

  return (
    <div className="flex flex-col h-full bg-[#E4E3E0] overflow-hidden">
      <header className="h-20 bg-white border-b border-black/5 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#141414] rounded-lg">
            <Layers className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Data Review & Correction</h1>
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
              {file?.name} • {extractedProblems.length} Problems Extracted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/5">
            <span className="text-xs font-bold opacity-40">Progress:</span>
            <div className="flex gap-1">
              {extractedProblems.map((p, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${
                    p.rawElements.every(e => !e.isUncertain) ? 'bg-emerald-500' : 'bg-amber-400'
                  }`} 
                />
              ))}
            </div>
          </div>
          <button
            disabled={!isAllReviewed}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            Finalize Data
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Problem List */}
        <aside className="w-80 bg-white border-r border-black/5 flex flex-col shrink-0">
          <div className="p-6 overflow-y-auto flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">Extracted Problems</h3>
            <div className="space-y-2">
              {extractedProblems.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProblemIdx(i)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    activeProblemIdx === i 
                      ? 'bg-[#141414] text-white border-[#141414] shadow-lg' 
                      : 'bg-white border-black/5 hover:border-black/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Problem {p.problemNumber}</span>
                    {p.rawElements.every(e => !e.isUncertain) ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-400" />
                    )}
                  </div>
                  <p className={`text-[10px] line-clamp-2 ${activeProblemIdx === i ? 'text-white/60' : 'text-black/40'}`}>
                    {p.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main: Review Area */}
        <main className="flex-1 flex flex-col overflow-hidden p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
            {/* Left: Raw Elements & Correction */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest opacity-40">OCR Raw Elements</h2>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  {activeProblem.rawElements.filter(e => e.isUncertain).length} Uncertain
                </span>
              </div>

              {activeProblem.rawElements.map((element) => (
                <div 
                  key={element.id}
                  className={`bg-white rounded-3xl border p-6 transition-all ${
                    element.isUncertain ? 'border-amber-200 shadow-md' : 'border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {element.type === 'text' ? <Type size={16} /> : element.type === 'formula' ? <Sigma size={16} /> : <ImageIcon size={16} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{element.type}</span>
                    </div>
                    {element.isUncertain && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <AlertCircle size={12} /> NEEDS REVIEW
                      </div>
                    )}
                  </div>

                  <div className="font-serif text-lg mb-6 p-4 bg-gray-50 rounded-xl border border-black/5">
                    {element.content}
                  </div>

                  {element.isUncertain && element.candidates && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">AI Candidates (Select one)</p>
                      {element.candidates.map((cand, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCandidateSelect(activeProblemIdx, element.id, cand.text)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-black/5 hover:border-black/20 hover:bg-gray-50 transition-all group"
                        >
                          <span className="text-sm font-medium">{cand.text}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono opacity-30">{(cand.confidence * 100).toFixed(0)}%</span>
                            <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all">
                              <Check size={12} className="text-white opacity-0 group-hover:opacity-100" />
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="pt-2">
                        <button className="text-[10px] font-bold text-black/40 hover:text-black flex items-center gap-1">
                          <Edit3 size={12} /> Manual Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Structured Data Editor */}
            <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-8 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-widest opacity-40">Structured Problem Data</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">AUTO-SAVING</span>
                </div>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">Problem Body</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-serif min-h-[120px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    value={activeProblem.content}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'content', e.target.value)}
                  />
                </div>

                {activeProblem.options && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">Options</label>
                    <div className="grid grid-cols-2 gap-3">
                      {activeProblem.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] font-black opacity-20">{i + 1}</span>
                          <input 
                            className="flex-1 p-3 bg-gray-50 border border-black/5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(activeProblem.options || [])];
                              newOpts[i] = e.target.value;
                              handleManualEdit(activeProblemIdx, 'options', newOpts as any);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">Correct Answer</label>
                    <input 
                      className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      value={activeProblem.answer || ''}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'answer', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">Problem Number</label>
                    <input 
                      className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      value={activeProblem.problemNumber}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'problemNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 block">Explanation / Solution</label>
                  <textarea 
                    className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-xs min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    value={activeProblem.explanation || ''}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
