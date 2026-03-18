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
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-apex-accent mb-2">
            <Scan size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] glow-text">이미지 분석 중</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter uppercase">문제 스캐너</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 glass hover:bg-white/10 transition-all uppercase text-[10px] font-black tracking-[0.2em] flex items-center gap-3 rounded-xl"
          >
            <Camera size={16} className="text-apex-accent" />
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-12 min-h-0">
        {/* Left: Input & Preview */}
        <div className="lg:col-span-2 flex flex-col gap-8 min-h-0">
          <div className="flex-1 glass rounded-[40px] p-2 relative overflow-hidden group">
            <div className="absolute inset-0 apex-grid opacity-20"></div>
            <div className="w-full h-full rounded-[32px] relative overflow-hidden bg-black/40 flex items-center justify-center">
              {images.length > 0 ? (
                <img 
                  src={stepCanvases[currentStep] || stepCanvases[completedSteps[completedSteps.length - 1]] || images[currentPage]} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain relative z-10"
                />
              ) : (
                <div className="text-center opacity-20">
                  <Camera size={64} className="mx-auto mb-6" />
                  <p className="font-black text-[10px] uppercase tracking-[0.5em]">이미지를 추가해주세요</p>
                </div>
              )}
              
              {processing && (
                <div className="absolute inset-0 z-20 bg-apex-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="glass px-10 py-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border-apex-accent/20">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-apex-accent/20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-apex-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-[10px] uppercase tracking-[0.3em] text-apex-accent mb-1">
                        페이지 분석 중 {currentPage + 1} / {images.length}
                      </span>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">
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
                <div key={idx} className="relative group shrink-0 w-32 aspect-[3/4] glass rounded-xl p-1 overflow-hidden">
                  <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-apex-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeImage(idx)}
                      className="text-red-500 text-[8px] font-black uppercase tracking-widest hover:scale-110 transition-transform"
                    >
                      제거
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-apex-accent text-apex-black px-2 py-0.5 text-[8px] font-black rounded-sm">
                    {idx + 1}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-32 aspect-[3/4] glass rounded-xl border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all"
              >
                <Camera size={20} className="text-white/20" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">추가</span>
              </button>
            </div>
          )}

          {images.length > 0 && !processing && !pdfUrl && (
            <button 
              onClick={startScan}
              className="w-full py-6 bg-white text-apex-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-apex-accent transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
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
                className="flex-1 py-6 bg-apex-accent text-apex-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                <Download size={20} />
                PDF 저장
              </a>
              <button 
                onClick={() => reset()}
                className="px-12 py-6 glass rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* Right: Pipeline Status */}
        <div className="space-y-6 overflow-y-auto pr-2">
          <div className="glass rounded-[40px] p-8">
            <div className="flex items-center gap-2 mb-8 text-white/40">
              <RefreshCw size={14} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">분석 단계</h2>
            </div>
            
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                
                return (
                  <div 
                    key={index} 
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                      isCurrent ? 'bg-apex-accent/10 border-apex-accent/50' : 
                      isCompleted ? 'bg-white/5 border-white/10' : 
                      'border-white/5 opacity-30'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-apex-accent"></div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`font-mono text-[8px] uppercase tracking-widest ${isCurrent ? 'text-apex-accent' : 'text-white/40'}`}>
                        단계 0{index + 1}
                      </span>
                      {isCompleted && <CheckCircle2 size={14} className="text-apex-accent" />}
                      {isCurrent && <Loader2 size={14} className="animate-spin text-apex-accent" />}
                    </div>
                    <h3 className={`font-black text-[10px] uppercase tracking-widest mb-1 ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                      {step.name}
                    </h3>
                    <p className="text-[9px] text-white/40 leading-relaxed mb-4">{step.description}</p>
                    
                    {isCurrent && (
                      <div className="p-3 bg-apex-accent/5 rounded-lg border border-apex-accent/10">
                        <p className="text-[9px] italic text-apex-accent/80">"{step.thought}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pdfUrl && (
            <div className="p-8 bg-apex-accent/10 border border-apex-accent/30 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CheckCircle2 size={48} className="text-apex-accent" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-xs mb-2 text-apex-accent">분석 완료</h3>
              <p className="text-[10px] text-white/60 leading-relaxed">이미지가 깔끔하게 보정되어 텍스트를 읽을 준비가 되었습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
