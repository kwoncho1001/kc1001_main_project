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
        <div className="absolute top-4 left-4 flex gap-2 bg-white/80 backdrop-blur p-2 rounded-lg shadow-lg border border-gray-200">
          <button 
            className={`p-2 rounded ${appState.mode === 'pen' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'pen' }))}
          >
            Pen
          </button>
          <button 
            className={`p-2 rounded ${appState.mode === 'selection' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            onClick={() => setAppState(prev => ({ ...prev, mode: 'selection' }))}
          >
            Select
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-100"
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
