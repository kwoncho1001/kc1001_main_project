import { useState, useCallback, useMemo } from 'react';
import { DigitalInkObject, CanvasGlobalState, CanvasInitialData } from './types';
import { convertToDigitalInkObjects } from './ComponentManagement';

export interface ExcalidrawImperativeAPI {
  getSceneElements: () => DigitalInkObject[];
  updateScene: (data: { elements?: Partial<DigitalInkObject>[]; appState?: Partial<CanvasGlobalState> }) => void;
  scrollToContent: () => void;
  refresh: () => void;
}

export const useCanvasAPI = (
  initialElements: DigitalInkObject[] = [],
  initialAppState: Partial<CanvasGlobalState> = {}
) => {
  const [elements, setElements] = useState<DigitalInkObject[]>(initialElements);
  const [appState, setAppState] = useState<CanvasGlobalState>({
    viewport: { zoom: 1, scrollX: 0, scrollY: 0 },
    mode: 'pen',
    theme: 'light',
    ...initialAppState,
  });

  const getSceneElements = useCallback(() => elements, [elements]);

  const updateScene = useCallback((data: { elements?: Partial<DigitalInkObject>[]; appState?: Partial<CanvasGlobalState> }) => {
    if (data.elements) {
      // In a real implementation, we would reconcile elements.
      // For now, we'll just update the ones that match IDs or add new ones.
      setElements((prev) => {
        const updated = [...prev];
        data.elements?.forEach((elUpdate) => {
          const idx = updated.findIndex((e) => e.id === elUpdate.id);
          if (idx > -1) {
            updated[idx] = { ...updated[idx], ...elUpdate } as DigitalInkObject;
          } else if (elUpdate.type && elUpdate.x !== undefined && elUpdate.y !== undefined) {
            const newEls = convertToDigitalInkObjects([elUpdate as any]);
            updated.push(newEls[0]);
          }
        });
        return updated;
      });
    }
    if (data.appState) {
      setAppState((prev) => ({ ...prev, ...data.appState }));
    }
  }, []);

  const api: ExcalidrawImperativeAPI = useMemo(() => ({
    getSceneElements,
    updateScene,
    scrollToContent: () => console.log('Scrolling to content...'),
    refresh: () => console.log('Refreshing canvas...'),
  }), [getSceneElements, updateScene]);

  return {
    elements,
    setElements,
    appState,
    setAppState,
    api,
  };
};
