import React, { useState, useRef } from 'react';
import { OCRService } from '../services/ocrService';
import { AIMetadataService } from '../services/aiMetadataService';
import { HierarchyService } from '../services/hierarchyService';
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
  ArrowRight,
  Brain,
  Target,
  BarChart3
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const startProcessing = async () => {
    if (!file) return;
    setProcessingState({ status: 'UPLOADING', progress: 0, message: '문제 추출 준비 중...' });
    try {
      const results = await OCRService.processFile(file, setProcessingState);
      
      // AI Metadata Analysis Step
      setProcessingState({ 
        status: 'ANALYZING', 
        progress: 95, 
        message: 'AI가 문제의 교육과정 단원과 난이도를 자동으로 분류하고 있습니다...' 
      });

      const analyzedResults = await Promise.all(results.map(async (p) => {
        try {
          const analysis = await AIMetadataService.analyzeProblemMetadata(p.content);
          return { ...p, analysis };
        } catch (e) {
          console.error(`[ProblemExtractor] Analysis failed for problem ${p.problemNumber}:`, e);
          return p;
        }
      }));

      setExtractedProblems(analyzedResults);
      setProcessingState({ 
        status: 'REVIEW_REQUIRED', 
        progress: 100, 
        message: '분석 완료. 추출된 데이터와 AI 분류 결과를 검토해 주세요.' 
      });
    } catch (err: any) {
      console.error('Extraction failed:', err);
      setProcessingState({
        status: 'IDLE',
        progress: 0,
        message: `추출 실패: ${err.message || '알 수 없는 오류'}. 다시 시도해 주세요.`
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
      <div className="flex flex-col h-full items-center justify-center">
        <div className="glass rounded-[40px] p-16 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-apex-accent"></div>
          <div className="absolute inset-0 apex-grid opacity-5"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto mb-10 text-apex-accent shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Upload size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tighter uppercase">문제 추출기</h1>
            
            {processingState.message && (
              <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle size={20} />
                {processingState.message}
              </div>
            )}

            <p className="text-white/40 mb-12 font-medium">
              과거 시험지(PDF/이미지)를 업로드하세요. AI가 필기체를 인식하고 수식과 텍스트를 분리하여 디지털 데이터로 변환하며, <b>교육과정 단원과 난이도를 자동으로 분류</b>합니다.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all mb-10 group ${
                isDragging 
                  ? 'border-apex-accent bg-apex-accent/5' 
                  : 'border-white/10 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,image/*"
              />
              {file ? (
                <div className="flex items-center justify-center gap-4 text-apex-accent font-black uppercase tracking-widest text-xs">
                  <FileText size={28} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <span className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] group-hover:text-white/40 transition-colors">파일 선택 또는 드래그 앤 드롭</span>
                </div>
              )}
            </div>

            <button
              disabled={!file}
              onClick={startProcessing}
              className="w-full bg-white text-apex-black py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-apex-accent transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              추출 시작
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (processingState.status !== 'REVIEW_REQUIRED' && processingState.status !== 'COMPLETED') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="glass rounded-[40px] p-16 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-apex-accent"></div>
          <Loader2 className="animate-spin text-apex-accent mx-auto mb-10" size={64} />
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">{processingState.message}</h2>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-8">
            <div 
              className="h-full bg-apex-accent shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700" 
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mt-6">
            시퀀스 단계 {Math.ceil(processingState.progress / 20)} / 5
          </p>
        </div>
      </div>
    );
  }

  const activeProblem = extractedProblems[activeProblemIdx];

  return (
    <div className="flex flex-col h-full gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-apex-accent shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">데이터 합성 및 검토</h1>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">
              소스: {file?.name} • {extractedProblems.length}개의 문제 추출됨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="glass px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">추출 진행 상황</span>
            <div className="flex gap-1.5">
              {extractedProblems.map((p, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    p.rawElements.every(e => !e.isUncertain) ? 'bg-apex-accent shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-amber-500/40'
                  }`} 
                />
              ))}
            </div>
          </div>
          <button
            disabled={!isAllReviewed}
            className="bg-white text-apex-black px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-apex-accent transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <Save size={18} />
            보관소에 저장
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Sidebar: Problem List */}
        <aside className="w-80 flex flex-col shrink-0 min-h-0">
          <div className="flex-1 glass rounded-[40px] p-6 border border-white/5 overflow-y-auto scrollbar-hide">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 px-2">추출된 문제</h3>
            <div className="space-y-3">
              {extractedProblems.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProblemIdx(i)}
                  className={`w-full p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                    activeProblemIdx === i 
                      ? 'bg-apex-accent/10 border-apex-accent/40 shadow-lg' 
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  {activeProblemIdx === i && <div className="absolute top-0 left-0 w-1 h-full bg-apex-accent"></div>}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeProblemIdx === i ? 'text-apex-accent' : 'text-white/40'}`}>문제 {p.problemNumber}</span>
                      {p.analysis && <Brain size={10} className="text-apex-accent animate-pulse" />}
                    </div>
                    {p.rawElements.every(e => !e.isUncertain) ? (
                      <CheckCircle2 size={14} className="text-apex-accent" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                  </div>
                  <p className={`text-[11px] line-clamp-2 font-medium ${activeProblemIdx === i ? 'text-white' : 'text-white/40'}`}>
                    {p.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main: Review Area */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
          {/* Left: Raw Elements & Correction */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">추출된 원본 요소</h2>
              <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 tracking-widest">
                {activeProblem.rawElements.filter(e => e.isUncertain).length}개의 불확실한 요소
              </span>
            </div>

            {activeProblem.rawElements.map((element) => (
              <div 
                key={element.id}
                className={`glass rounded-[40px] p-8 border transition-all relative overflow-hidden ${
                  element.isUncertain ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'
                }`}
              >
                <div className="absolute inset-0 apex-grid opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40">
                        {element.type === 'text' ? <Type size={18} /> : element.type === 'formula' ? <Sigma size={18} /> : <ImageIcon size={18} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{element.type === 'text' ? '텍스트' : element.type === 'formula' ? '수식' : '이미지'}</span>
                    </div>
                    {element.isUncertain && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        <AlertCircle size={14} /> 검토 필요
                      </div>
                    )}
                  </div>

                  <div className="text-lg font-medium mb-8 p-6 glass rounded-2xl border border-white/5 bg-black/20">
                    {element.content}
                  </div>

                  {element.isUncertain && element.candidates && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">인식 결과 후보 (정답 선택)</p>
                      {element.candidates.map((cand, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCandidateSelect(activeProblemIdx, element.id, cand.text)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl glass border border-white/5 hover:border-apex-accent/30 hover:bg-apex-accent/5 transition-all group"
                        >
                          <span className="text-sm font-bold tracking-tight">{cand.text}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-white/20">{(cand.confidence * 100).toFixed(0)}%</span>
                            <div className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center group-hover:border-apex-accent group-hover:bg-apex-accent transition-all">
                              <Check size={16} className="text-apex-black opacity-0 group-hover:opacity-100" />
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="pt-4">
                        <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white flex items-center gap-2 transition-colors">
                          <Edit3 size={14} /> 수동 수정
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Structured Data Editor */}
          <div className="glass rounded-[40px] p-10 border border-white/5 flex flex-col min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 apex-grid opacity-5"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">문제 상세 정보</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-apex-accent bg-apex-accent/10 px-3 py-1 rounded-lg border border-apex-accent/20 tracking-widest">실시간 동기화</span>
                </div>
              </div>

              <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block">문제 내용</label>
                  <textarea 
                    className="w-full p-6 glass border border-white/5 rounded-3xl text-lg font-medium min-h-[160px] focus:outline-none focus:border-apex-accent/30 transition-all placeholder:text-white/5 bg-black/20 resize-none"
                    value={activeProblem.content}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'content', e.target.value)}
                  />
                </div>

                {activeProblem.options && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block">선택지</label>
                    <div className="grid grid-cols-2 gap-4">
                      {activeProblem.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-white/10 uppercase">{String.fromCharCode(65 + i)}</span>
                          <input 
                            className="flex-1 p-4 glass border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-apex-accent/30 transition-all bg-black/10"
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

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block">검증된 정답</label>
                    <input 
                      className="w-full p-4 glass border border-white/5 rounded-2xl text-sm font-black text-apex-accent focus:outline-none focus:border-apex-accent/30 transition-all bg-black/10"
                      value={activeProblem.answer || ''}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'answer', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block">문제 번호</label>
                    <input 
                      className="w-full p-4 glass border border-white/5 rounded-2xl text-sm font-black text-white/60 focus:outline-none focus:border-apex-accent/30 transition-all bg-black/10"
                      value={activeProblem.problemNumber}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'problemNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block">해설 및 풀이</label>
                  <textarea 
                    className="w-full p-6 glass border border-white/5 rounded-3xl text-xs font-medium min-h-[140px] focus:outline-none focus:border-apex-accent/30 transition-all placeholder:text-white/5 bg-black/20 resize-none"
                    value={activeProblem.explanation || ''}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'explanation', e.target.value)}
                  />
                </div>

                {/* AI Analysis Results */}
                {activeProblem.analysis && (
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <Brain size={16} className="text-apex-accent" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">AI 자동 분석 결과</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-apex-accent/5 border border-apex-accent/20 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Target size={14} className="text-apex-accent" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">교육과정 분류</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            activeProblem.analysis.metadata.fieldId,
                            activeProblem.analysis.metadata.subjectId,
                            activeProblem.analysis.metadata.majorUnitId,
                            activeProblem.analysis.metadata.minorUnitId,
                            activeProblem.analysis.metadata.tagId
                          ].map((id, idx) => {
                            const node = HierarchyService.getAllNodes().find(n => n.id === id);
                            return node ? (
                              <div key={id} className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-white/5 text-white/80 text-[10px] font-bold rounded-lg border border-white/10">
                                  {node.name}
                                </span>
                                {idx < 4 && <ChevronRight size={10} className="text-white/20" />}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex items-center gap-3 mb-4">
                            <BarChart3 size={14} className="text-apex-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">난이도 분석</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">종합 난이도</span>
                              <span className="text-xs font-bold text-apex-accent">
                                {(activeProblem.analysis.confidence * 5).toFixed(1)} / 5.0
                              </span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-apex-accent" 
                                style={{ width: `${activeProblem.analysis.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <div className="flex items-center gap-3 mb-4">
                            <Layers size={14} className="text-apex-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">키워드</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {activeProblem.analysis.keywords.map((kw, i) => (
                              <span key={i} className="text-[9px] font-bold text-white/60">#{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
