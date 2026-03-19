import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, CheckCircle2, Loader2, Download, RefreshCw, ArrowRight, Scan, UploadCloud } from 'lucide-react';
import { runPipeline, PIPELINE_STEPS } from '../core/pipeline';
import confetti from 'canvas-confetti';

export const ScannerUI: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepCanvases, setStepCanvases] = useState<Record<number, string>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 처리 공통 로직
  const processFiles = (files: FileList) => {
    const newImages: string[] = [];
    let loadedCount = 0;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages[i] = event.target?.result as string;
        loadedCount++;
        if (loadedCount === files.length) {
          setImages(prev => [...prev, ...newImages]);
          reset();
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // [드래그 앤 드롭 핸들러]
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const reset = () => {
    setPdfUrl(null);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setStepCanvases({});
  };

  const startScan = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    reset();
    try {
      const finalPdfUrl = await runPipeline(images, (pageIndex, stepIndex, canvas) => {
        setCurrentPage(pageIndex);
        setCurrentStep(stepIndex);
        setCompletedSteps(prev => [...prev, stepIndex]);
        setStepCanvases(prev => ({ ...prev, [stepIndex]: canvas.toDataURL() }));
      });
      setPdfUrl(finalPdfUrl);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setProcessing(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div 
      className="max-w-7xl mx-auto h-full flex flex-col gap-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header: 드래그 중일 때 강조 표시 */}
      <header className={`flex justify-between items-end p-6 rounded-3xl transition-all ${isDragging ? 'bg-accent/20 border-2 border-dashed border-accent' : ''}`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scan size={16} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">이미지 분석 시스템</span>
          </div>
          <h1 className="text-5xl font-black heading-tight uppercase text-foreground">문제 스캐너</h1>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-10 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-3"
        >
          {isDragging ? <UploadCloud className="animate-bounce" /> : <Camera size={18} />}
          {isDragging ? "여기에 놓으세요" : "이미지 불러오기"}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-8 min-h-0">
          <div className={`flex-1 card border-2 border-foreground relative overflow-hidden ${isDragging ? 'scale-[0.98] border-accent' : ''}`}>
            <div className="absolute inset-0 grid-pattern opacity-10"></div>
            <div className="w-full h-full rounded-2xl relative overflow-hidden bg-background/50 flex items-center justify-center">
              {images.length > 0 ? (
                <img src={stepCanvases[currentStep] || images[currentPage]} alt="Preview" className="max-w-full max-h-full object-contain relative z-10" />
              ) : (
                <div className="text-center">
                  <UploadCloud size={64} className={`mx-auto mb-6 ${isDragging ? 'text-accent animate-pulse' : 'text-foreground/20'}`} />
                  <p className="font-black text-foreground uppercase tracking-widest">파일을 드래그하여 추가하세요</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Image List */}
          {images.length > 0 && !processing && !pdfUrl && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <div key={idx} className="relative group shrink-0 w-32 aspect-[3/4] card p-1 overflow-hidden">
                  <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeImage(idx)}
                      className="text-error text-[8px] font-bold uppercase tracking-widest hover:scale-110 transition-transform"
                    >
                      제거
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-accent text-white px-2 py-0.5 text-[8px] font-bold rounded-sm">
                    {idx + 1}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-32 aspect-[3/4] card border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-foreground/5 transition-all"
              >
                <Camera size={20} className="text-foreground/50" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/50">추가</span>
              </button>
            </div>
          )}

          {/* 하단 스캔 시작 버튼 */}
          {images.length > 0 && !processing && !pdfUrl && (
            <button 
              onClick={startScan}
              className="w-full py-6 accent-gradient text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-xl"
            >
              <RefreshCw size={20} />
              스캔 시작 ({images.length} 페이지)
            </button>
          )}

          {pdfUrl && (
            <div className="flex gap-4">
              <a 
                href={pdfUrl} 
                download="scanned_exam.pdf"
                className="flex-1 py-6 accent-gradient text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-xl"
              >
                <Download size={20} />
                PDF 저장
              </a>
              <button 
                onClick={() => reset()}
                className="px-12 py-6 card rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-foreground/5 transition-all"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* Right: Pipeline Status (회색 박멸 핵심) */}
        <aside className="space-y-6 overflow-y-auto pr-2">
          <div className="card p-8 border-2 border-foreground bg-card">
            <h2 className="text-[10px] font-black uppercase mb-8 text-foreground tracking-[0.3em]">분석 시퀀스</h2>
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                return (
                  <div key={index} className={`p-5 rounded-2xl border-2 transition-all ${
                    isCurrent ? 'bg-accent/10 border-accent' : 
                    isCompleted ? 'bg-foreground text-background border-foreground' : 
                    'border-foreground/20' // 투명도 제거, 선명한 경계
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-mono text-[10px] font-black ${isCurrent ? 'text-accent' : isCompleted ? 'text-background' : 'text-foreground'}`}>
                        단계 0{index + 1}
                      </span>
                      {isCompleted && <CheckCircle2 size={16} />}
                    </div>
                    <h3 className={`font-black text-xs uppercase tracking-widest ${isCurrent ? 'text-accent' : isCompleted ? 'text-background' : 'text-foreground'}`}>
                      {step.name}
                    </h3>
                    <p className={`text-[10px] font-bold leading-relaxed mt-2 ${isCurrent ? 'text-foreground' : isCompleted ? 'text-background/80' : 'text-foreground/60'}`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* PDF 완료 메시지 */}
          {pdfUrl && (
            <div className="p-8 bg-accent/10 border border-accent/30 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CheckCircle2 size={48} className="text-accent" />
              </div>
              <h3 className="font-bold uppercase tracking-[0.2em] text-xs mb-2 text-accent">분석 완료</h3>
              <p className="text-[10px] text-foreground leading-relaxed">이미지가 깔끔하게 보정되어 텍스트를 읽을 준비가 되었습니다.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
