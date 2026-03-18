import React, { forwardRef, useImperativeHandle } from 'react';
import { RenderingEngine } from './RenderingEngine';
import { useCanvasAPI, ExcalidrawImperativeAPI } from './StateControlAPI';
import { CanvasInitialData, UIMode, DigitalInkObject, CanvasGlobalState } from './types';

interface DigitalLearningCanvasProps {
  initialData?: CanvasInitialData;
  mode?: UIMode;
  theme?: 'light' | 'dark'; // Added theme prop
  onChange?: (elements: DigitalInkObject[], appState: CanvasGlobalState) => void;
}

export const DigitalLearningCanvas = forwardRef<ExcalidrawImperativeAPI, DigitalLearningCanvasProps>(
  ({ initialData, mode = 'pen', theme = 'dark', onChange }, ref) => {
    const { elements, setElements, appState, setAppState, api } = useCanvasAPI(
      initialData?.elements,
      initialData?.appState
    );

    useImperativeHandle(ref, () => api, [api]);

    const handleChange = (newElements: DigitalInkObject[], newAppState: CanvasGlobalState) => {
      setElements(newElements);
      setAppState(newAppState);
      onChange?.(newElements, newAppState);
    };

    return (
      <div className="w-full h-full relative">
        <RenderingEngine
          initialData={{ elements, appState }}
          mode={mode}
          theme={theme} // Pass theme to RenderingEngine
          onChange={handleChange}
        />
        {/* Toolbar Overlay */}
        <div className={`absolute top-6 left-6 flex gap-3 glass p-2.5 rounded-2xl border-2 ${theme === 'light' ? 'border-black' : 'border-white/20'} shadow-2xl`}>
          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              appState.mode === 'pen' 
                ? 'bg-apex-accent text-apex-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : (theme === 'light' ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white') + ' hover:bg-white/5'
            }`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'pen' }))}
          >
            펜
          </button>
          
          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              appState.mode === 'eraser' 
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : (theme === 'light' ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white') + ' hover:bg-white/5'
            }`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'eraser' }))}
          >
            지우개
          </button>

          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              appState.mode === 'selection' 
                ? 'bg-apex-accent text-apex-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : (theme === 'light' ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white') + ' hover:bg-white/5'
            }`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'selection' }))}
          >
            선택
          </button>
          <div className={`w-px h-6 ${theme === 'light' ? 'bg-black/20' : 'bg-white/10'} self-center mx-1`} />
          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              theme === 'light' ? 'text-black/20 hover:text-red-600' : 'text-white/20 hover:text-red-500'
            } hover:bg-red-500/10 transition-all`}
            onClick={() => setElements([])}
          >
            지우기
          </button>
        </div>
      </div>
    );
  }
);

DigitalLearningCanvas.displayName = 'DigitalLearningCanvas';
