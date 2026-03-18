import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, CheckCircle2, Loader2, Download, RefreshCw, ArrowRight, Scan } from 'lucide-react';
import { runPipeline, PIPELINE_STEPS } from '../core/pipeline';
import confetti from 'canvas-confetti';

export const ScannerUI: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepCanvases, setStepCanvases] = useState<Record<number, string>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
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
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setProcessing(false);
      setCurrentStep(-1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-accent mb-2">
            <Scan size={16} />
            <span className="text-micro">이미지 분석 중</span>
          </div>
          <h1 className="text-4xl font-bold heading-tight uppercase">문제 스캐너</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 card hover:bg-white/5 transition-all text-micro flex items-center gap-3"
          >
            <Camera size={16} className="text-accent" />
            이미지 불러오기
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            multiple
            className="hidden" 
          />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Left: Input & Preview */}
        <div className="lg:col-span-2 flex flex-col gap-8 min-h-0">
          <div className="flex-1 card p-2 relative overflow-hidden group">
            <div className="absolute inset-0 grid-pattern opacity-20"></div>
            <div className="w-full h-full rounded-2xl relative overflow-hidden bg-background/80 flex items-center justify-center">
              {images.length > 0 ? (
                <img 
                  src={stepCanvases[currentStep] || stepCanvases[completedSteps[completedSteps.length - 1]] || images[currentPage]} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain relative z-10"
                />
              ) : (
                <div className="text-center opacity-20">
                  <Camera size={64} className="mx-auto mb-6" />
                  <p className="text-micro">이미지를 추가해주세요</p>
                </div>
              )}
              
              {processing && (
                <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="card px-10 py-8 flex flex-col items-center gap-4 shadow-2xl border-accent/20">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-accent/20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <span className="block text-micro text-accent mb-1">
                        페이지 분석 중 {currentPage + 1} / {images.length}
                      </span>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
                        작업: {PIPELINE_STEPS[currentStep]?.name}
                      </span>
                    </div>
                  </div>
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
                      className="text-red-500 text-[8px] font-bold uppercase tracking-widest hover:scale-110 transition-transform"
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
                className="shrink-0 w-32 aspect-[3/4] card border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <Camera size={20} className="text-muted-foreground" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">추가</span>
              </button>
            </div>
          )}

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
                className="px-12 py-6 card rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-white/5 transition-all"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* Right: Pipeline Status */}
        <div className="space-y-6 overflow-y-auto pr-2">
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-8 text-muted-foreground">
              <RefreshCw size={14} />
              <h2 className="text-micro">분석 단계</h2>
            </div>
            
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                
                return (
                  <div 
                    key={index} 
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                      isCurrent ? 'bg-accent/10 border-accent/50' : 
                      isCompleted ? 'bg-background/50 border-border' : 
                      'border-border opacity-30'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`font-mono text-[8px] uppercase tracking-widest ${isCurrent ? 'text-accent' : 'text-muted-foreground'}`}>
                        단계 0{index + 1}
                      </span>
                      {isCompleted && <CheckCircle2 size={14} className="text-accent" />}
                      {isCurrent && <Loader2 size={14} className="animate-spin text-accent" />}
                    </div>
                    <h3 className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.name}
                    </h3>
                    <p className="text-[9px] text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                    
                    {isCurrent && (
                      <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                        <p className="text-[9px] italic text-accent/80">"{step.thought}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pdfUrl && (
            <div className="p-8 bg-accent/10 border border-accent/30 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CheckCircle2 size={48} className="text-accent" />
              </div>
              <h3 className="font-bold uppercase tracking-[0.2em] text-xs mb-2 text-accent">분석 완료</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">이미지가 깔끔하게 보정되어 텍스트를 읽을 준비가 되었습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
