export interface SvgDocument {
  width: number;
  height: number;
  elements: SvgElement[];
}

export type SvgElementType =
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'path'
  | 'polygon'
  | 'text'
  | 'group';

export interface SvgGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: string;
  d?: string;
}

export interface SvgTransform {
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  translateX?: number;
  translateY?: number;
}

export interface SvgStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface SvgElement {
  id: string;
  type: SvgElementType;
  geometry: SvgGeometry;
  transform: SvgTransform;
  style: SvgStyle;
  children?: SvgElement[];
  text?: string;
}

export interface Command {
  execute(): void;
  undo(): void;
  description?: string;
}
