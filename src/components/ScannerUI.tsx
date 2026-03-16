import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, CheckCircle2, Loader2, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { runPipeline, PIPELINE_STEPS } from '../core/pipeline';
import confetti from 'canvas-confetti';

export const ScannerUI: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepCanvases, setStepCanvases] = useState<Record<number, string>>({});
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        reset();
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setPdfUrl(null);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setStepCanvases({});
  };

  const startScan = async () => {
    if (!image) return;
    setProcessing(true);
    reset();

    try {
      const finalPdfUrl = await runPipeline(image, (index, canvas) => {
        setCurrentStep(index);
        setCompletedSteps(prev => [...prev, index]);
        setStepCanvases(prev => ({ ...prev, [index]: canvas.toDataURL() }));
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
    <div className="max-w-6xl mx-auto p-8 font-sans bg-[#E4E3E0] min-h-screen text-[#141414]">
      {/* Header */}
      <header className="mb-12 border-b border-[#141414] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic font-serif">Advanced Exam Scanner</h1>
          <p className="text-xs opacity-60 font-mono mt-2 uppercase tracking-widest">Digitization Pipeline v2.4.0</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors uppercase text-[10px] font-bold tracking-widest flex items-center gap-2"
          >
            <Camera size={14} />
            Capture Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input & Preview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-[#141414] p-1 bg-white">
            <div className="border border-[#141414] aspect-[3/4] relative overflow-hidden bg-gray-100 flex items-center justify-center">
              {image ? (
                <img 
                  src={stepCanvases[currentStep] || stepCanvases[completedSteps[completedSteps.length - 1]] || image} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center opacity-30">
                  <Camera size={48} className="mx-auto mb-4" />
                  <p className="font-mono text-xs uppercase">No image loaded</p>
                </div>
              )}
              
              {processing && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-[#141414] text-[#E4E3E0] px-6 py-4 flex items-center gap-4 shadow-2xl">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-mono text-xs uppercase tracking-widest">
                      Processing: {PIPELINE_STEPS[currentStep]?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {image && !processing && !pdfUrl && (
            <button 
              onClick={startScan}
              className="w-full py-6 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all flex items-center justify-center gap-4"
            >
              <RefreshCw size={20} />
              Initialize Digitization Pipeline
            </button>
          )}

          {pdfUrl && (
            <div className="flex gap-4">
              <a 
                href={pdfUrl} 
                download="scanned_exam.pdf"
                className="flex-1 py-6 bg-emerald-600 text-white font-bold uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-4"
              >
                <Download size={20} />
                Download PDF
              </a>
              <button 
                onClick={() => reset()}
                className="px-8 py-6 border border-[#141414] font-bold uppercase tracking-[0.2em] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right: Pipeline Status */}
        <div className="space-y-6">
          <div className="border border-[#141414] bg-white p-6">
            <h2 className="font-serif italic text-xl mb-6 border-b border-[#141414] pb-2">Pipeline Status</h2>
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === index;
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 border transition-all ${
                      isCurrent ? 'border-[#141414] bg-[#141414] text-[#E4E3E0]' : 
                      isCompleted ? 'border-emerald-600/30 bg-emerald-50/30' : 
                      'border-gray-200 opacity-40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-tighter">Step 0{index + 1}</span>
                      {isCompleted && <CheckCircle2 size={14} className="text-emerald-600" />}
                      {isCurrent && <Loader2 size={14} className="animate-spin" />}
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{step.name}</h3>
                    <p className="text-[10px] opacity-70 leading-relaxed mb-3">{step.description}</p>
                    
                    {isCurrent && (
                      <div className="mt-4 p-3 bg-white/10 border-l-2 border-[#E4E3E0]">
                        <p className="text-[11px] italic font-serif">"{step.thought}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pdfUrl && (
            <div className="p-6 bg-emerald-600 text-white border border-[#141414]">
              <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Process Complete</h3>
              <p className="text-[10px] opacity-80">The document has been successfully processed, deskewed, dewarped, and binarized for optimal readability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
