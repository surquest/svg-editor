import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import interact from 'interactjs';

interface SvgCanvasProps {
  svgCode: string;
  onCanvasClick: (e: React.MouseEvent) => void;
  onElementTransform: (element: SVGElement, updates: Record<string, string>) => void;
  selectedElement?: SVGElement | null;
}

export default function SvgCanvas({
  svgCode,
  onCanvasClick,
  onElementTransform,
  selectedElement,
}: SvgCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectionSignature = useMemo(() => {
    if (!selectedElement) {
      return null;
    }

    const tagName = selectedElement.tagName.toLowerCase();
    const ownerSvg = selectedElement.closest('svg');
    let index = -1;
    if (ownerSvg) {
      const all = Array.from(ownerSvg.querySelectorAll(tagName));
      index = all.indexOf(selectedElement);
    }

    return {
      tagName,
      index,
      id: selectedElement.getAttribute('id'),
      className: selectedElement.getAttribute('class'),
      transform: selectedElement.getAttribute('transform'),
      x: selectedElement.getAttribute('x'),
      y: selectedElement.getAttribute('y'),
      cx: selectedElement.getAttribute('cx'),
      cy: selectedElement.getAttribute('cy'),
      d: selectedElement.getAttribute('d'),
      vectorEffect: selectedElement.getAttribute('vector-effect'),
    };
  }, [selectedElement]);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container || !selectionSignature) {
      return;
    }

    const svgRoot = container.querySelector('svg');
    if (!svgRoot) {
      return;
    }

    const candidates = Array.from(
      svgRoot.querySelectorAll(selectionSignature.tagName)
    ) as SVGElement[];

    let activeElement: SVGElement | undefined;

    if (selectionSignature.index !== -1 && candidates[selectionSignature.index]) {
      activeElement = candidates[selectionSignature.index];
    } else {
      activeElement = candidates.find((candidate) => {
        const idMatches = !selectionSignature.id || candidate.getAttribute('id') === selectionSignature.id;
        const classMatches = !selectionSignature.className || candidate.getAttribute('class') === selectionSignature.className;
        const transformMatches = !selectionSignature.transform || candidate.getAttribute('transform') === selectionSignature.transform;
        const xyMatches =
          (!selectionSignature.x || candidate.getAttribute('x') === selectionSignature.x)
          && (!selectionSignature.y || candidate.getAttribute('y') === selectionSignature.y);
        const cxyMatches =
          (!selectionSignature.cx || candidate.getAttribute('cx') === selectionSignature.cx)
          && (!selectionSignature.cy || candidate.getAttribute('cy') === selectionSignature.cy);
        const pathMatches = !selectionSignature.d || candidate.getAttribute('d') === selectionSignature.d;

        return idMatches && classMatches && transformMatches && xyMatches && cxyMatches && pathMatches;
      });
    }

    if (!activeElement) {
      return;
    }

    const toSvgDelta = (dx: number, dy: number) => {
      const ownerSvg = activeElement.ownerSVGElement;
      const matrix = ownerSvg?.getScreenCTM();

      if (!ownerSvg || !matrix) {
        return { dx, dy };
      }

      const inverse = matrix.inverse();
      const origin = new DOMPoint(0, 0).matrixTransform(inverse);
      const deltaPoint = new DOMPoint(dx, dy).matrixTransform(inverse);

      return {
        dx: deltaPoint.x - origin.x,
        dy: deltaPoint.y - origin.y,
      };
    };

    const toNumber = (value: string | null, fallback = 0) => {
      if (!value) {
        return fallback;
      }

      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const formatNumber = (value: number) => {
      return Number(value.toFixed(3)).toString();
    };

    const parseTranslate = (value: string | null) => {
      if (!value) {
        return { tx: 0, ty: 0 };
      }

      const match = value.match(/translate\(\s*([-+]?\d*\.?\d+)\s*,?\s*([-+]?\d*\.?\d+)?\s*\)/);
      if (!match) {
        return { tx: 0, ty: 0 };
      }

      return {
        tx: Number.parseFloat(match[1] || '0'),
        ty: Number.parseFloat(match[2] || '0'),
      };
    };

    const setOutline = () => {
      activeElement.setAttribute('vector-effect', 'non-scaling-stroke');
      activeElement.style.outline = '2px dashed #1976d2';
      activeElement.style.outlineOffset = '2px';
    };

    const clearOutline = () => {
      if (activeElement.getAttribute('vector-effect') === 'non-scaling-stroke') {
        const signatureVE = selectionSignature?.vectorEffect;
        if (signatureVE) {
          activeElement.setAttribute('vector-effect', signatureVE);
        } else {
          activeElement.removeAttribute('vector-effect');
        }
      }
      activeElement.style.outline = '';
      activeElement.style.outlineOffset = '';
    };

    const pendingUpdates: Record<string, string> = {};

    const commitPending = () => {
      if (Object.keys(pendingUpdates).length === 0) {
        return;
      }

      onElementTransform(activeElement, { ...pendingUpdates });
      Object.keys(pendingUpdates).forEach((key) => {
        delete pendingUpdates[key];
      });
    };

    const applyMove = (dx: number, dy: number) => {
      const tag = activeElement.tagName.toLowerCase();

      if (tag === 'line') {
        const next = {
          x1: toNumber(activeElement.getAttribute('x1')) + dx,
          y1: toNumber(activeElement.getAttribute('y1')) + dy,
          x2: toNumber(activeElement.getAttribute('x2')) + dx,
          y2: toNumber(activeElement.getAttribute('y2')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          activeElement.setAttribute(key, formatted);
          pendingUpdates[key] = formatted;
        });

        return;
      }

      if (tag === 'circle' || tag === 'ellipse') {
        const next = {
          cx: toNumber(activeElement.getAttribute('cx')) + dx,
          cy: toNumber(activeElement.getAttribute('cy')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          activeElement.setAttribute(key, formatted);
          pendingUpdates[key] = formatted;
        });

        return;
      }

      const hasXY = activeElement.hasAttribute('x') && activeElement.hasAttribute('y');
      if (hasXY) {
        const next = {
          x: toNumber(activeElement.getAttribute('x')) + dx,
          y: toNumber(activeElement.getAttribute('y')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          activeElement.setAttribute(key, formatted);
          pendingUpdates[key] = formatted;
        });

        return;
      }

      const currentTransform = activeElement.getAttribute('transform');
      const { tx, ty } = parseTranslate(currentTransform);
      const nextTransform = `translate(${formatNumber(tx + dx)}, ${formatNumber(ty + dy)})`;
      activeElement.setAttribute('transform', nextTransform);
      pendingUpdates.transform = nextTransform;
    };

    const canResizeTag = ['rect', 'image', 'foreignobject'].includes(
      activeElement.tagName.toLowerCase()
    );

    const applyResize = (deltaLeft: number, deltaTop: number, width: number, height: number, originalSize: { width: number; height: number; strokeWidth: number; rx: number; ry: number }) => {
      const tag = activeElement.tagName.toLowerCase();
      const supportsWH = ['rect', 'image', 'foreignobject'].includes(tag);
      if (!supportsWH) {
        return;
      }

      const widthValue = formatNumber(Math.max(1, width));
      const heightValue = formatNumber(Math.max(1, height));

      activeElement.setAttribute('width', widthValue);
      activeElement.setAttribute('height', heightValue);
      activeElement.setAttribute('stroke-width', formatNumber(originalSize.strokeWidth));
      activeElement.setAttribute('rx', formatNumber(originalSize.rx));
      // activeElement.setAttribute('ry', formatNumber(originalSize.ry));
      pendingUpdates.width = widthValue;
      pendingUpdates.height = heightValue;
      pendingUpdates['stroke-width'] = formatNumber(originalSize.strokeWidth);
      pendingUpdates.rx = formatNumber(originalSize.rx);
      // pendingUpdates.ry = formatNumber(originalSize.ry);

      const needsPositionUpdate = deltaLeft !== 0 || deltaTop !== 0 || activeElement.hasAttribute('x') || activeElement.hasAttribute('y');
      if (needsPositionUpdate) {
        const nextX = formatNumber(toNumber(activeElement.getAttribute('x')) + deltaLeft);
        const nextY = formatNumber(toNumber(activeElement.getAttribute('y')) + deltaTop);
        activeElement.setAttribute('x', nextX);
        activeElement.setAttribute('y', nextY);
        pendingUpdates.x = nextX;
        pendingUpdates.y = nextY;
      }
    };
    const interactable = interact(activeElement);

    setOutline();

    interactable.draggable({
      listeners: {
        move(event) {
          const delta = toSvgDelta(event.dx, event.dy);
          applyMove(delta.dx, delta.dy);
        },
        end() {
          commitPending();
        },
      },
    });

    if (canResizeTag) {
      interactable.resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const deltaTopLeft = toSvgDelta(event.deltaRect.left, event.deltaRect.top);
            const sizeDelta = toSvgDelta(event.rect.width, event.rect.height);
            // Get all original attributes needed 
            // for resizing before applying any changes 
            // to ensure consistent calculations:
            const originalSize = {
              width: toNumber(activeElement.getAttribute('width'), activeElement.getBBox().width),
              height: toNumber(activeElement.getAttribute('height'), activeElement.getBBox().height),
              strokeWidth: toNumber(activeElement.getAttribute('stroke-width'), 0),
              rx: toNumber(activeElement.getAttribute('rx'), 0),
              // ry: toNumber(activeElement.getAttribute('ry'), 0),
            };
            applyResize(deltaTopLeft.dx, deltaTopLeft.dy, sizeDelta.dx, sizeDelta.dy, originalSize);
          },
          end() {
            commitPending();
          },
        },
      });
    }

    return () => {
      clearOutline();
      interactable.unset();
    };
  }, [onElementTransform, selectionSignature, svgCode]);

  return (
    <Box sx={{ height: '100%', p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f2f2f2',
            backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, transparent 25%), linear-gradient(-45deg, #e6e6e6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6e6e6 75%), linear-gradient(-45deg, transparent 75%, #e6e6e6 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            overflow: 'auto',
            p: 4,
            position: 'relative',
            '& svg': {
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              cursor: 'pointer',
            },
          }}
        >
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            dangerouslySetInnerHTML={{ __html: svgCode }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
