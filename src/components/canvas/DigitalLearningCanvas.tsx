import React, { forwardRef, useImperativeHandle } from 'react';
import { RenderingEngine } from './RenderingEngine';
import { useCanvasAPI, ExcalidrawImperativeAPI } from './StateControlAPI';
import { CanvasInitialData, UIMode, DigitalInkObject, CanvasGlobalState } from './types';

interface DigitalLearningCanvasProps {
  initialData?: CanvasInitialData;
  mode?: UIMode;
  onChange?: (elements: DigitalInkObject[], appState: CanvasGlobalState) => void;
}

export const DigitalLearningCanvas = forwardRef<ExcalidrawImperativeAPI, DigitalLearningCanvasProps>(
  ({ initialData, mode = 'pen', onChange }, ref) => {
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
          onChange={handleChange}
        />
        {/* Toolbar Overlay */}
        <div className="absolute top-6 left-6 flex gap-3 glass p-2.5 rounded-2xl border border-white/5 shadow-2xl">
          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${appState.mode === 'pen' ? 'bg-apex-accent text-apex-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'pen' }))}
          >
            Pen
          </button>
          <button 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${appState.mode === 'selection' ? 'bg-apex-accent text-apex-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'selection' }))}
          >
            Select
          </button>
          <div className="w-px h-6 bg-white/10 self-center mx-1" />
          <button 
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
            onClick={() => setElements([])}
          >
            Clear
          </button>
        </div>
      </div>
    );
  }
);

DigitalLearningCanvas.displayName = 'DigitalLearningCanvas';
