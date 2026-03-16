import { Vector2D } from '../../utils/vectorMath';

export type InkObjectType = 'rectangle' | 'ellipse' | 'text' | 'arrow' | 'line' | 'freedraw' | 'image';

export interface DigitalInkObject {
  id: string;
  type: InkObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  opacity: number;
  points?: number[]; // For freedraw, line, arrow
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageUrl?: string;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  customData?: Record<string, any>;
}

export interface CanvasViewportState {
  zoom: number;
  scrollX: number;
  scrollY: number;
}

export type UIMode = 'pen' | 'eraser' | 'selection' | 'rectangle' | 'ellipse' | 'text' | 'arrow';

export interface CanvasGlobalState {
  viewport: CanvasViewportState;
  mode: UIMode;
  theme: 'light' | 'dark';
}

export interface CanvasInitialData {
  elements?: DigitalInkObject[];
  appState?: Partial<CanvasGlobalState>;
}
