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
  ({ initialData, theme = 'dark', onChange }, ref) => {
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

    // 테마별 UI 스타일 계산
    const toolbarBg = theme === 'light' ? 'bg-white' : 'bg-slate-900';
    const toolbarBorder = theme === 'light' ? 'border-black' : 'border-white';
    const activeBtn = theme === 'light' ? 'bg-black text-white' : 'bg-white text-black';
    const inactiveBtn = theme === 'light' ? 'bg-transparent text-black/40' : 'bg-transparent text-white/40';

    return (
      <div className="w-full h-full relative">
        <RenderingEngine
          initialData={{ elements, appState }}
          mode={appState.mode}
          theme={theme}
          onChange={handleChange}
        />
        
        {/* 고대비 툴바 오버레이 */}
        <div className={`absolute top-6 left-6 flex gap-3 p-2.5 rounded-2xl border-2 shadow-2xl ${toolbarBg} ${toolbarBorder}`}>
          <button 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${appState.mode === 'pen' ? activeBtn : inactiveBtn}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'pen' }))}
          >
            PEN
          </button>
          <button 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${appState.mode === 'eraser' ? 'bg-red-600 text-white' : inactiveBtn}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'eraser' }))}
          >
            ERASER
          </button>
          <button 
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${appState.mode === 'selection' ? activeBtn : inactiveBtn}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'selection' }))}
          >
            SELECT
          </button>
          <div className={`w-px h-6 self-center mx-1 ${theme === 'light' ? 'bg-black/20' : 'bg-white/20'}`} />
          <button 
            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all"
            onClick={() => setElements([])}
          >
            CLEAR ALL
          </button>
        </div>
      </div>
    );
  }
);

DigitalLearningCanvas.displayName = 'DigitalLearningCanvas';
