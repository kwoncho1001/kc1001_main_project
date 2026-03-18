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
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleReAnalyze = async (problemIdx: number) => {
    const problem = extractedProblems[problemIdx];
    setIsAnalyzing(true);
    try {
      const analysis = await AIMetadataService.analyzeProblemMetadata(problem.content);
      setExtractedProblems(prev => {
        const next = [...prev];
        next[problemIdx] = { ...next[problemIdx], analysis };
        return next;
      });
    } catch (err) {
      console.error('Re-analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!manualText.trim()) return;
    setProcessingState({ status: 'ANALYZING', progress: 50, message: 'AI가 입력된 문제를 분석하고 있습니다...' });
    try {
      const analysis = await AIMetadataService.analyzeProblemMetadata(manualText);
      const newProblem: ExtractedProblem = {
        id: `manual-${Date.now()}`,
        problemNumber: '1',
        content: manualText,
        rawElements: [{ 
          id: 'e1', 
          type: 'text', 
          content: manualText, 
          isUncertain: false,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 }
        }],
        analysis
      };
      setExtractedProblems([newProblem]);
      setProcessingState({ status: 'REVIEW_REQUIRED', progress: 100, message: '분석 완료. AI 분류 결과를 검토해 주세요.' });
    } catch (err: any) {
      setProcessingState({ status: 'IDLE', progress: 0, message: `분석 실패: ${err.message}` });
    }
  };

  const isAllReviewed = extractedProblems.every(p => 
    p.rawElements.every(e => !e.isUncertain)
  );

  if (processingState.status === 'IDLE') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="card p-16 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
          <div className="absolute inset-0 grid-pattern opacity-5"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 accent-gradient rounded-3xl flex items-center justify-center mx-auto mb-10 text-white shadow-xl">
              <Brain size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-4 heading-tight uppercase">문제 추출 및 분석기</h1>
            
            {processingState.message && (
              <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-micro">
                <AlertCircle size={20} />
                {processingState.message}
              </div>
            )}

            <div className="flex justify-center gap-4 mb-12">
              <button 
                onClick={() => setIsManualInput(false)}
                className={`px-8 py-3 rounded-xl text-micro font-bold uppercase tracking-widest transition-all ${!isManualInput ? 'bg-accent text-white shadow-lg' : 'bg-muted/50 text-muted-foreground border border-border'}`}
              >
                파일 업로드
              </button>
              <button 
                onClick={() => setIsManualInput(true)}
                className={`px-8 py-3 rounded-xl text-micro font-bold uppercase tracking-widest transition-all ${isManualInput ? 'bg-accent text-white shadow-lg' : 'bg-muted/50 text-muted-foreground border border-border'}`}
              >
                직접 입력 분석
              </button>
            </div>

            {!isManualInput ? (
              <>
                <p className="text-muted-foreground mb-12 font-medium">
                  과거 시험지(PDF/이미지)를 업로드하세요. AI가 필기체를 인식하고 수식과 텍스트를 분리하며, <b>교육과정 단원과 난이도를 자동으로 분류</b>합니다.
                </p>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all mb-10 group ${
                    isDragging 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:bg-foreground/5 hover:border-accent/20'
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
                    <div className="flex items-center justify-center gap-4 text-accent font-bold uppercase tracking-widest text-xs">
                      <FileText size={28} />
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-muted-foreground text-micro group-hover:text-muted-foreground transition-colors">파일 선택 또는 드래그 앤 드롭</span>
                    </div>
                  )}
                </div>

                <button
                  disabled={!file}
                  onClick={startProcessing}
                  className="w-full bg-foreground text-background py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  추출 및 분석 시작
                  <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <div className="space-y-8">
                <p className="text-muted-foreground mb-8 font-medium">
                  분석하고자 하는 문제 텍스트를 아래에 입력하세요. AI가 즉시 교육과정을 매핑하고 난이도를 평가합니다.
                </p>
                <textarea 
                  className="w-full p-8 card bg-muted/50 border-border rounded-3xl text-lg font-medium min-h-[240px] focus:outline-none focus:border-accent/30 transition-all placeholder:text-muted-foreground resize-none"
                  placeholder="예: f(x) = x^2 + 2x + 1 일 때, f'(1)의 값을 구하시오."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                />
                <button
                  disabled={!manualText.trim()}
                  onClick={handleManualAnalyze}
                  className="w-full accent-gradient text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  AI 분석 시작
                  <Brain size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (processingState.status !== 'REVIEW_REQUIRED' && processingState.status !== 'COMPLETED') {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="card p-16 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
          <Loader2 className="animate-spin text-accent mx-auto mb-10" size={64} />
          <h2 className="text-2xl font-bold heading-tight mb-4">{processingState.message}</h2>
          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mt-8">
            <div 
              className="h-full bg-accent shadow-[0_0_10px_var(--accent-glow)] transition-all duration-700" 
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-6">
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
          <div className="w-14 h-14 accent-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold heading-tight uppercase">데이터 합성 및 검토</h1>
            <p className="text-micro text-muted-foreground mt-1">
              소스: {file?.name} • {extractedProblems.length}개의 문제 추출됨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="card px-6 py-3 flex items-center gap-4">
            <span className="text-micro">추출 진행 상황</span>
            <div className="flex gap-1.5">
              {extractedProblems.map((p, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    p.rawElements.every(e => !e.isUncertain) ? 'bg-accent shadow-[0_0_5px_var(--accent-glow)]' : 'bg-amber-500/40'
                  }`} 
                />
              ))}
            </div>
          </div>
          <button
            disabled={!isAllReviewed}
            className="accent-gradient text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
          >
            <Save size={18} />
            보관소에 저장
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Sidebar: Problem List */}
        <aside className="w-80 flex flex-col shrink-0 min-h-0">
          <div className="flex-1 card p-6 overflow-y-auto scrollbar-hide">
            <h3 className="text-micro mb-6 px-2">추출된 문제</h3>
            <div className="space-y-3">
              {extractedProblems.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProblemIdx(i)}
                  className={`w-full p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                    activeProblemIdx === i 
                      ? 'bg-accent/10 border-accent/40 shadow-lg' 
                      : 'bg-muted/50 border-border hover:border-accent/20'
                  }`}
                >
                  {activeProblemIdx === i && <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-micro ${activeProblemIdx === i ? 'text-accent' : 'text-muted-foreground'}`}>문제 {p.problemNumber}</span>
                      {p.analysis && <Brain size={10} className="text-accent animate-pulse" />}
                    </div>
                    {p.rawElements.every(e => !e.isUncertain) ? (
                      <CheckCircle2 size={14} className="text-accent" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500" />
                    )}
                  </div>
                  <p className={`text-[11px] line-clamp-2 font-medium ${activeProblemIdx === i ? 'text-foreground' : 'text-muted-foreground'}`}>
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
              <h2 className="text-micro text-muted-foreground">추출된 원본 요소</h2>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 tracking-widest">
                {activeProblem.rawElements.filter(e => e.isUncertain).length}개의 불확실한 요소
              </span>
            </div>

            {activeProblem.rawElements.map((element) => (
              <div 
                key={element.id}
                className={`card p-8 border transition-all relative overflow-hidden ${
                  element.isUncertain ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'
                }`}
              >
                <div className="absolute inset-0 grid-pattern opacity-5"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 card flex items-center justify-center text-muted-foreground">
                        {element.type === 'text' ? <Type size={18} /> : element.type === 'formula' ? <Sigma size={18} /> : <ImageIcon size={18} />}
                      </div>
                      <span className="text-micro text-muted-foreground">{element.type === 'text' ? '텍스트' : element.type === 'formula' ? '수식' : '이미지'}</span>
                    </div>
                    {element.isUncertain && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                        <AlertCircle size={14} /> 검토 필요
                      </div>
                    )}
                  </div>

                  <div className="text-lg font-medium mb-8 p-6 card bg-muted/50 border-border">
                    {element.content}
                  </div>

                  {element.isUncertain && element.candidates && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">인식 결과 후보 (정답 선택)</p>
                      {element.candidates.map((cand, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCandidateSelect(activeProblemIdx, element.id, cand.text)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl card border-border hover:border-accent/30 hover:bg-accent/5 transition-all group"
                        >
                          <span className="text-sm font-bold tracking-tight">{cand.text}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-muted-foreground">{(cand.confidence * 100).toFixed(0)}%</span>
                            <div className="w-8 h-8 rounded-xl border border-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent transition-all">
                              <Check size={16} className="text-white opacity-0 group-hover:opacity-100" />
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="pt-4">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
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
          <div className="card p-10 flex flex-col min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-5"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-micro text-muted-foreground">문제 상세 정보</h2>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleReAnalyze(activeProblemIdx)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 text-[10px] font-bold text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                    AI 재분석
                  </button>
                  <span className="text-[8px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg border border-accent/20 tracking-widest">실시간 동기화</span>
                </div>
              </div>

              <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <div>
                  <label className="text-micro text-muted-foreground mb-3 block">문제 내용</label>
                  <textarea 
                    className="w-full p-6 card bg-muted/50 border-border rounded-3xl text-lg font-medium min-h-[160px] focus:outline-none focus:border-accent/30 transition-all placeholder:text-muted-foreground resize-none"
                    value={activeProblem.content}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'content', e.target.value)}
                  />
                </div>

                {activeProblem.options && (
                  <div>
                    <label className="text-micro text-muted-foreground mb-3 block">선택지</label>
                    <div className="grid grid-cols-2 gap-4">
                      {activeProblem.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{String.fromCharCode(65 + i)}</span>
                          <input 
                            className="flex-1 p-4 card bg-muted/50 border-border rounded-2xl text-sm font-bold focus:outline-none focus:border-accent/30 transition-all"
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
                    <label className="text-micro text-muted-foreground mb-3 block">검증된 정답</label>
                    <input 
                      className="w-full p-4 card bg-muted/50 border-border rounded-2xl text-sm font-bold text-accent focus:outline-none focus:border-accent/30 transition-all"
                      value={activeProblem.answer || ''}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'answer', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-micro text-muted-foreground mb-3 block">문제 번호</label>
                    <input 
                      className="w-full p-4 card bg-muted/50 border-border rounded-2xl text-sm font-bold text-muted-foreground focus:outline-none focus:border-accent/30 transition-all"
                      value={activeProblem.problemNumber}
                      onChange={(e) => handleManualEdit(activeProblemIdx, 'problemNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-micro text-muted-foreground mb-3 block">해설 및 풀이</label>
                  <textarea 
                    className="w-full p-6 card bg-muted/50 border-border rounded-3xl text-xs font-medium min-h-[140px] focus:outline-none focus:border-accent/30 transition-all placeholder:text-muted-foreground resize-none"
                    value={activeProblem.explanation || ''}
                    onChange={(e) => handleManualEdit(activeProblemIdx, 'explanation', e.target.value)}
                  />
                </div>

                {/* AI Analysis Results */}
                {activeProblem.analysis && (
                  <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-8">
                      <Brain size={16} className="text-accent" />
                      <h3 className="text-micro text-muted-foreground">AI 자동 분석 결과</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Target size={14} className="text-accent" />
                          <span className="text-micro text-muted-foreground">교육과정 분류</span>
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
                                <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-[10px] font-bold rounded-lg border border-border">
                                  {node.name}
                                </span>
                                {idx < 4 && <ChevronRight size={10} className="text-muted-foreground" />}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 card bg-muted/50 border-border rounded-3xl">
                          <div className="flex items-center gap-3 mb-6">
                            <BarChart3 size={14} className="text-accent" />
                            <span className="text-micro text-muted-foreground">난이도 분석</span>
                          </div>
                          <div className="space-y-5">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">종합 난이도</span>
                              <span className="text-xs font-bold text-accent">
                                {(activeProblem.analysis.confidence * 5).toFixed(1)} / 5.0
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent" 
                                style={{ width: `${activeProblem.analysis.confidence * 100}%` }}
                              />
                            </div>
                            
                            <div className="pt-4 space-y-4">
                              {[
                                { label: '계산 복잡도', value: activeProblem.analysis.difficultyFactors.computationalComplexity },
                                { label: '개념 깊이', value: activeProblem.analysis.difficultyFactors.conceptualDepth },
                                { label: '논리 추론', value: activeProblem.analysis.difficultyFactors.logicalReasoning },
                              ].map((factor, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                                    <span className="text-muted-foreground">{factor.label}</span>
                                    <span className="text-muted-foreground">{(factor.value * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-accent/40" 
                                      style={{ width: `${factor.value * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="p-6 card bg-muted/50 border-border rounded-3xl flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <Layers size={14} className="text-accent" />
                              <span className="text-micro text-muted-foreground">키워드</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {activeProblem.analysis.keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-accent/5 text-accent text-[9px] font-bold rounded-lg border border-accent/10">#{kw}</span>
                              ))}
                            </div>
                          </div>

                          <div className="p-6 card bg-muted/50 border-border rounded-3xl flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <CheckCircle2 size={14} className="text-accent" />
                              <span className="text-micro text-muted-foreground">연관 개념</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {activeProblem.analysis.concepts.map((concept, i) => (
                                <span key={i} className="px-3 py-1.5 bg-foreground/5 text-muted-foreground text-[9px] font-bold rounded-lg border border-foreground/5">{concept}</span>
                              ))}
                            </div>
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
