import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { useThemeColors } from '../hooks/useThemeColors';

interface Stroke {
  points: number[];
  color: string;
}

interface HandwritingCanvasProps {
  problemId: string;
  theme: 'light' | 'dark'; // Added theme prop
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ problemId, theme }) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const colors = useThemeColors();

  const handlePointerDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const penColor = theme === 'light' ? '#000000' : '#FFFFFF'; // Theme-based pen color
    
    setActiveStroke({
      points: [pos.x, pos.y],
      color: penColor,
    });
  };

  const handlePointerMove = (e: any) => {
    if (!isDrawing || !activeStroke) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    setActiveStroke({
      ...activeStroke,
      points: [...activeStroke.points, pos.x, pos.y],
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (activeStroke) {
      setStrokes([...strokes, activeStroke]);
      setActiveStroke(null);
    }
  };

  return (
    <div className={`w-full h-full border border-border rounded-2xl overflow-hidden touch-none transition-colors duration-300 ${
      theme === 'light' ? 'bg-white' : 'bg-slate-900'
    }`}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Layer>
          {strokes.map((stroke, i) => (
            <Line
              key={i}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {activeStroke && (
            <Line
              points={activeStroke.points}
              stroke={activeStroke.color}
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
