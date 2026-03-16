import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Text, Line, Path, Group } from 'react-konva';
import Konva from 'konva';
import { DigitalInkObject, CanvasGlobalState, UIMode, CanvasInitialData } from './types';
import { generatePressureSensitiveStroke } from './HandwritingEngine';
import { convertToDigitalInkObjects, newElementWith } from './ComponentManagement';

interface RenderingEngineProps {
  initialData?: CanvasInitialData;
  mode?: UIMode;
  onChange?: (elements: DigitalInkObject[], appState: CanvasGlobalState) => void;
  onPointerDown?: (e: any) => void;
  onPointerUpdate?: (e: any) => void;
  onPointerUp?: (e: any) => void;
}

export const RenderingEngine: React.FC<RenderingEngineProps> = ({
  initialData,
  mode = 'pen',
  onChange,
  onPointerDown,
  onPointerUpdate,
  onPointerUp,
}) => {
  const [elements, setElements] = useState<DigitalInkObject[]>(initialData?.elements || []);
  const [appState, setAppState] = useState<CanvasGlobalState>({
    viewport: { zoom: 1, scrollX: 0, scrollY: 0 },
    mode: mode,
    theme: 'light',
    ...initialData?.appState,
  });
  const [activeElement, setActiveElement] = useState<DigitalInkObject | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    setAppState((prev) => ({ ...prev, mode }));
  }, [mode]);

  const handlePointerDown = (e: any) => {
    setIsInteracting(true);
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (appState.mode === 'pen') {
      const newEl: DigitalInkObject = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'freedraw',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 4,
        opacity: 1,
        points: [pos.x, pos.y, 0.5], // x, y, pressure
        version: 1,
        versionNonce: Date.now(),
        isDeleted: false,
      };
      setActiveElement(newEl);
    }
    
    onPointerDown?.(e);
  };

  const handlePointerMove = (e: any) => {
    if (!isInteracting) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (activeElement && appState.mode === 'pen') {
      const pressure = e.evt.pressure || 0.5;
      const updatedPoints = [...(activeElement.points || []), pos.x, pos.y, pressure];
      const updatedEl = { ...activeElement, points: updatedPoints };
      setActiveElement(updatedEl);
    }

    onPointerUpdate?.(e);
  };

  const handlePointerUp = (e: any) => {
    setIsInteracting(false);
    if (activeElement) {
      const newElements = [...elements, activeElement];
      setElements(newElements);
      setActiveElement(null);
      onChange?.(newElements, appState);
    }
    onPointerUp?.(e);
  };

  const renderElement = (el: DigitalInkObject) => {
    switch (el.type) {
      case 'freedraw':
        if (!el.points || el.points.length < 6) return null;
        // Convert flat points array [x, y, p, x, y, p...] to [[x, y, p], [x, y, p]...]
        const points2d: number[][] = [];
        for (let i = 0; i < el.points.length; i += 3) {
          points2d.push([el.points[i], el.points[i+1], el.points[i+2]]);
        }
        const pathData = generatePressureSensitiveStroke(points2d);
        return (
          <Path
            key={el.id}
            data={pathData}
            fill={el.strokeColor}
            opacity={el.opacity}
          />
        );
      case 'rectangle':
        return (
          <Rect
            key={el.id}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            stroke={el.strokeColor}
            strokeWidth={el.strokeWidth}
            fill={el.backgroundColor}
            opacity={el.opacity}
          />
        );
      case 'ellipse':
        return (
          <Ellipse
            key={el.id}
            x={el.x + el.width / 2}
            y={el.y + el.height / 2}
            radiusX={el.width / 2}
            radiusY={el.height / 2}
            stroke={el.strokeColor}
            strokeWidth={el.strokeWidth}
            fill={el.backgroundColor}
            opacity={el.opacity}
          />
        );
      case 'text':
        return (
          <Text
            key={el.id}
            x={el.x}
            y={el.y}
            text={el.text}
            fontSize={el.fontSize}
            fontFamily={el.fontFamily}
            fill={el.strokeColor}
            opacity={el.opacity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-white relative overflow-hidden touch-none">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        scaleX={appState.viewport.zoom}
        scaleY={appState.viewport.zoom}
        x={appState.viewport.scrollX}
        y={appState.viewport.scrollY}
      >
        <Layer>
          {elements.filter(el => !el.isDeleted).map(renderElement)}
          {activeElement && renderElement(activeElement)}
        </Layer>
      </Stage>
    </div>
  );
};
