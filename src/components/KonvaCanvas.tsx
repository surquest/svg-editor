'use client';

import React, { useCallback, useEffect, useRef, memo } from 'react';
import { Stage, Layer, Rect, Circle, Ellipse, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { useStore } from '@/store/useStore';
import { SvgElement } from '@/types';

interface KonvaCanvasProps {
  width: number;
  height: number;
}

interface ShapeRendererProps {
  el: SvgElement;
  onSelect: (id: string, multi: boolean) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, scaleX: number, scaleY: number, rotation: number, x: number, y: number) => void;
}

// Memoized shape renderer
const ShapeRenderer = memo(({ el, onSelect, onDragEnd, onTransformEnd }: ShapeRendererProps) => {
  const fill = el.style.fill || 'transparent';
  const stroke = el.style.stroke || '#000000';
  const strokeWidth = el.style.strokeWidth || 1;
  const opacity = el.style.opacity !== undefined ? el.style.opacity : 1;
  const rotation = el.transform.rotation || 0;

  const commonProps = {
    id: el.id,
    opacity,
    draggable: true,
    stroke,
    strokeWidth,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onSelect(el.id, e.evt.shiftKey),
    onTap: () => onSelect(el.id, false),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(el.id, e.target.x(), e.target.y());
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      onTransformEnd(el.id, node.scaleX(), node.scaleY(), node.rotation(), node.x(), node.y());
      node.scaleX(1);
      node.scaleY(1);
    },
  };

  switch (el.type) {
    case 'rect':
      return (
        <Rect
          x={el.geometry.x || 0}
          y={el.geometry.y || 0}
          width={el.geometry.width || 100}
          height={el.geometry.height || 100}
          fill={fill}
          rotation={rotation}
          {...commonProps}
        />
      );
    case 'circle':
      return (
        <Circle
          x={el.geometry.cx || 0}
          y={el.geometry.cy || 0}
          radius={el.geometry.r || 50}
          fill={fill}
          rotation={rotation}
          {...commonProps}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          x={el.geometry.cx || 0}
          y={el.geometry.cy || 0}
          radiusX={el.geometry.rx || 80}
          radiusY={el.geometry.ry || 40}
          fill={fill}
          rotation={rotation}
          {...commonProps}
        />
      );
    case 'line':
      return (
        <Line
          points={[el.geometry.x1 || 0, el.geometry.y1 || 0, el.geometry.x2 || 100, el.geometry.y2 || 100]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          id={el.id}
          draggable
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => onSelect(el.id, e.evt.shiftKey)}
          onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(el.id, e.target.x(), e.target.y())}
        />
      );
    case 'text':
      return (
        <Text
          x={el.geometry.x || 0}
          y={el.geometry.y || 0}
          text={el.text || 'Text'}
          fontSize={el.style.fontSize || 16}
          fontFamily={el.style.fontFamily || 'Arial'}
          fill={fill || '#000'}
          rotation={rotation}
          {...commonProps}
        />
      );
    default:
      return null;
  }
});

ShapeRenderer.displayName = 'ShapeRenderer';

export default function KonvaCanvas({ width, height }: KonvaCanvasProps) {
  const {
    document,
    selectedIds,
    tool,
    zoom,
    panX,
    panY,
    selectElements,
    toggleSelection,
    clearSelection,
    updateElement,
    addElement,
    setStatusMessage,
  } = useStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const isDrawing = useRef(false);
  const drawStart = useRef({ x: 0, y: 0 });
  const tempElementId = useRef<string | null>(null);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const selectedNodes = selectedIds
      .map(id => stageRef.current!.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);
    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, document.elements]);

  const handleSelect = useCallback((id: string, multi: boolean) => {
    if (tool !== 'select') return;
    if (multi) {
      toggleSelection(id);
    } else {
      selectElements([id]);
    }
  }, [tool, selectElements, toggleSelection]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    const el = document.elements.find(e => e.id === id);
    if (!el) return;
    const dx = x - (el.geometry.x ?? el.geometry.cx ?? 0);
    const dy = y - (el.geometry.y ?? el.geometry.cy ?? 0);

    switch (el.type) {
      case 'rect':
      case 'text':
        updateElement(id, { geometry: { ...el.geometry, x, y } });
        break;
      case 'circle':
      case 'ellipse':
        updateElement(id, { geometry: { ...el.geometry, cx: x, cy: y } });
        break;
      case 'line':
        updateElement(id, {
          geometry: {
            x1: (el.geometry.x1 || 0) + dx,
            y1: (el.geometry.y1 || 0) + dy,
            x2: (el.geometry.x2 || 0) + dx,
            y2: (el.geometry.y2 || 0) + dy,
          }
        });
        break;
    }
    setStatusMessage('Moved element');
  }, [document.elements, updateElement, setStatusMessage]);

  const handleTransformEnd = useCallback((id: string, scaleX: number, scaleY: number, rotation: number, x: number, y: number) => {
    const el = document.elements.find(e => e.id === id);
    if (!el) return;

    switch (el.type) {
      case 'rect':
        updateElement(id, {
          geometry: {
            ...el.geometry,
            x, y,
            width: (el.geometry.width || 100) * scaleX,
            height: (el.geometry.height || 100) * scaleY,
          },
          transform: { ...el.transform, rotation },
        });
        break;
      case 'circle':
        updateElement(id, {
          geometry: { ...el.geometry, cx: x, cy: y, r: (el.geometry.r || 50) * Math.max(scaleX, scaleY) },
          transform: { ...el.transform, rotation },
        });
        break;
      case 'ellipse':
        updateElement(id, {
          geometry: {
            ...el.geometry, cx: x, cy: y,
            rx: (el.geometry.rx || 80) * scaleX,
            ry: (el.geometry.ry || 40) * scaleY,
          },
          transform: { ...el.transform, rotation },
        });
        break;
      default:
        updateElement(id, { transform: { ...el.transform, rotation } });
    }
  }, [document.elements, updateElement]);

  const getStagePos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return {
      x: (pos.x - panX) / zoom,
      y: (pos.y - panY) / zoom,
    };
  }, [panX, panY, zoom]);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'select') {
      if (e.target === stageRef.current) {
        clearSelection();
      }
      return;
    }

    isDrawing.current = true;
    const pos = getStagePos();
    drawStart.current = pos;

    const id = `el-${Date.now()}`;
    tempElementId.current = id;

    const baseStyle = { fill: '#4488ff', stroke: '#2266cc', strokeWidth: 2, opacity: 1 };

    switch (tool) {
      case 'rect':
        addElement({ id, type: 'rect', geometry: { x: pos.x, y: pos.y, width: 1, height: 1 }, transform: {}, style: baseStyle });
        break;
      case 'circle':
        addElement({ id, type: 'circle', geometry: { cx: pos.x, cy: pos.y, r: 1 }, transform: {}, style: baseStyle });
        break;
      case 'ellipse':
        addElement({ id, type: 'ellipse', geometry: { cx: pos.x, cy: pos.y, rx: 1, ry: 1 }, transform: {}, style: baseStyle });
        break;
      case 'line':
        addElement({ id, type: 'line', geometry: { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y }, transform: {}, style: { ...baseStyle, fill: 'none' } });
        break;
      case 'text':
        addElement({ id, type: 'text', geometry: { x: pos.x, y: pos.y }, transform: {}, style: { ...baseStyle, fill: '#000' }, text: 'Text' });
        isDrawing.current = false;
        selectElements([id]);
        setStatusMessage('Text added');
        break;
    }
  }, [tool, getStagePos, addElement, clearSelection, selectElements, setStatusMessage]);

  const handleStageMouseMove = useCallback(() => {
    if (!isDrawing.current || !tempElementId.current) return;
    const pos = getStagePos();
    const start = drawStart.current;
    const id = tempElementId.current;
    const el = document.elements.find(el => el.id === id);
    if (!el) return;

    switch (el.type) {
      case 'rect':
        updateElement(id, {
          geometry: {
            x: Math.min(start.x, pos.x),
            y: Math.min(start.y, pos.y),
            width: Math.abs(pos.x - start.x),
            height: Math.abs(pos.y - start.y),
          }
        });
        break;
      case 'circle':
        updateElement(id, {
          geometry: { cx: start.x, cy: start.y, r: Math.sqrt((pos.x - start.x) ** 2 + (pos.y - start.y) ** 2) }
        });
        break;
      case 'ellipse':
        updateElement(id, {
          geometry: {
            cx: (start.x + pos.x) / 2,
            cy: (start.y + pos.y) / 2,
            rx: Math.abs(pos.x - start.x) / 2,
            ry: Math.abs(pos.y - start.y) / 2,
          }
        });
        break;
      case 'line':
        updateElement(id, { geometry: { x1: start.x, y1: start.y, x2: pos.x, y2: pos.y } });
        break;
    }
  }, [document.elements, updateElement, getStagePos]);

  const handleStageMouseUp = useCallback(() => {
    if (isDrawing.current && tempElementId.current) {
      selectElements([tempElementId.current]);
      setStatusMessage('Element added');
    }
    isDrawing.current = false;
    tempElementId.current = null;
  }, [selectElements, setStatusMessage]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      x={panX}
      y={panY}
      scaleX={zoom}
      scaleY={zoom}
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
    >
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0}
          y={0}
          width={document.width}
          height={document.height}
          fill="white"
          shadowBlur={10}
          shadowColor="rgba(0,0,0,0.3)"
        />

        {/* Elements */}
        {document.elements.map(el => (
          <ShapeRenderer
            key={el.id}
            el={el}
            onSelect={handleSelect}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        ))}

        {/* Transformer for selected shapes */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          borderDash={[4, 4]}
          anchorSize={8}
          anchorCornerRadius={2}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'middle-right', 'bottom-center', 'middle-left']}
        />
      </Layer>
    </Stage>
  );
}
