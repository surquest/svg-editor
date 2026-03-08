import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import interact from 'interactjs';

interface SvgCanvasProps {
  svgCode: string;
  onCanvasClick: (e: React.MouseEvent) => void;
  onElementTransform: (element: SVGElement, updates: Record<string, string>) => void;
  selectedElements: SVGElement[];
}

export default function SvgCanvas({
  svgCode,
  onCanvasClick,
  onElementTransform,
  selectedElements,
}: SvgCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectionSignatures = useMemo(() => {
    return selectedElements.map(element => {
      const tagName = element.tagName.toLowerCase();
      const ownerSvg = element.closest('svg');
      let index = -1;
      if (ownerSvg) {
        const all = Array.from(ownerSvg.querySelectorAll(tagName));
        index = all.indexOf(element);
      }

      return {
        tagName,
        index,
        id: element.getAttribute('id'),
        className: element.getAttribute('class'),
        transform: element.getAttribute('transform'),
        x: element.getAttribute('x'),
        y: element.getAttribute('y'),
        cx: element.getAttribute('cx'),
        cy: element.getAttribute('cy'),
        d: element.getAttribute('d'),
        vectorEffect: element.getAttribute('vector-effect'),
      };
    });
  }, [selectedElements]);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container || selectionSignatures.length === 0) {
      return;
    }

    const svgRoot = container.querySelector('svg');
    if (!svgRoot) {
      return;
    }

    const activeElements = selectionSignatures.map(sig => {
      const candidates = Array.from(
        svgRoot.querySelectorAll(sig.tagName)
      ) as SVGElement[];

      if (sig.index !== -1 && candidates[sig.index]) {
        return candidates[sig.index];
      }
      
      return candidates.find((candidate) => {
        const idMatches = !sig.id || candidate.getAttribute('id') === sig.id;
        const classMatches = !sig.className || candidate.getAttribute('class') === sig.className;
        const transformMatches = !sig.transform || candidate.getAttribute('transform') === sig.transform;
        const xyMatches =
          (!sig.x || candidate.getAttribute('x') === sig.x)
          && (!sig.y || candidate.getAttribute('y') === sig.y);
        const cxyMatches =
          (!sig.cx || candidate.getAttribute('cx') === sig.cx)
          && (!sig.cy || candidate.getAttribute('cy') === sig.cy);
        const pathMatches = !sig.d || candidate.getAttribute('d') === sig.d;

        return idMatches && classMatches && transformMatches && xyMatches && cxyMatches && pathMatches;
      });
    }).filter((el): el is SVGElement => !!el);

    if (activeElements.length === 0) {
      return;
    }

    // Use the first selected element as the anchor for coordinate transformations
    const anchorElement = activeElements[0];

    const toSvgDelta = (dx: number, dy: number, element: SVGElement = anchorElement) => {
      const ownerSvg = element.ownerSVGElement;
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

    const setOutlines = () => {
      activeElements.forEach(activeElement => {
        activeElement.setAttribute('vector-effect', 'non-scaling-stroke');
        activeElement.style.outline = '2px dashed #1976d2';
        activeElement.style.outlineOffset = '2px';
      });
    };

    const clearOutlines = () => {
      activeElements.forEach((activeElement, i) => {
        if (activeElement.getAttribute('vector-effect') === 'non-scaling-stroke') {
          const signatureVE = selectionSignatures[i]?.vectorEffect;
          if (signatureVE) {
            activeElement.setAttribute('vector-effect', signatureVE);
          } else {
            activeElement.removeAttribute('vector-effect');
          }
        }
        activeElement.style.outline = '';
        activeElement.style.outlineOffset = '';
      });
    };

    const pendingUpdates = new Map<SVGElement, Record<string, string>>();

    const commitPending = () => {
      if (pendingUpdates.size === 0) {
        return;
      }

      pendingUpdates.forEach((updates, element) => {
        onElementTransform(element, { ...updates });
      });
      pendingUpdates.clear();
    };

    const applyMove = (dx: number, dy: number, element: SVGElement) => {
      const tag = element.tagName.toLowerCase();
      const updates = pendingUpdates.get(element) || {};

      if (tag === 'line') {
        const next = {
          x1: toNumber(element.getAttribute('x1')) + dx,
          y1: toNumber(element.getAttribute('y1')) + dy,
          x2: toNumber(element.getAttribute('x2')) + dx,
          y2: toNumber(element.getAttribute('y2')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          element.setAttribute(key, formatted);
          updates[key] = formatted;
        });
        pendingUpdates.set(element, updates);
        return;
      }

      if (tag === 'circle' || tag === 'ellipse') {
        const next = {
          cx: toNumber(element.getAttribute('cx')) + dx,
          cy: toNumber(element.getAttribute('cy')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          element.setAttribute(key, formatted);
          updates[key] = formatted;
        });
        pendingUpdates.set(element, updates);
        return;
      }

      const hasXY = element.hasAttribute('x') && element.hasAttribute('y');
      if (hasXY) {
        const next = {
          x: toNumber(element.getAttribute('x')) + dx,
          y: toNumber(element.getAttribute('y')) + dy,
        };

        Object.entries(next).forEach(([key, value]) => {
          const formatted = formatNumber(value);
          element.setAttribute(key, formatted);
          updates[key] = formatted;
        });
        pendingUpdates.set(element, updates);
        return;
      }

      const currentTransform = element.getAttribute('transform');
      const { tx, ty } = parseTranslate(currentTransform);
      const nextTransform = `translate(${formatNumber(tx + dx)}, ${formatNumber(ty + dy)})`;
      element.setAttribute('transform', nextTransform);
      updates.transform = nextTransform;
      pendingUpdates.set(element, updates);
    };

    const canResizeTag = (element: SVGElement) => ['rect', 'image', 'foreignobject'].includes(
      element.tagName.toLowerCase()
    );

    const applyResize = (deltaLeft: number, deltaTop: number, width: number, height: number, element: SVGElement, originalSize: { width: number; height: number; strokeWidth: number; rx: number; ry: number }) => {
      const tag = element.tagName.toLowerCase();
      const supportsWH = ['rect', 'image', 'foreignobject'].includes(tag);
      if (!supportsWH) {
        return;
      }

      const updates = pendingUpdates.get(element) || {};
      const widthValue = formatNumber(Math.max(1, width));
      const heightValue = formatNumber(Math.max(1, height));

      element.setAttribute('width', widthValue);
      element.setAttribute('height', heightValue);
      element.setAttribute('stroke-width', formatNumber(originalSize.strokeWidth));
      element.setAttribute('rx', formatNumber(originalSize.rx));
      updates.width = widthValue;
      updates.height = heightValue;
      updates['stroke-width'] = formatNumber(originalSize.strokeWidth);
      updates.rx = formatNumber(originalSize.rx);

      const needsPositionUpdate = deltaLeft !== 0 || deltaTop !== 0 || element.hasAttribute('x') || element.hasAttribute('y');
      if (needsPositionUpdate) {
        const nextX = formatNumber(toNumber(element.getAttribute('x')) + deltaLeft);
        const nextY = formatNumber(toNumber(element.getAttribute('y')) + deltaTop);
        element.setAttribute('x', nextX);
        element.setAttribute('y', nextY);
        updates.x = nextX;
        updates.y = nextY;
      }
      pendingUpdates.set(element, updates);
    };

    setOutlines();

    const interactables = activeElements.map(element => {
      const interactable = interact(element);

      interactable.draggable({
        listeners: {
          move(event) {
            const delta = toSvgDelta(event.dx, event.dy, element);
            applyMove(delta.dx, delta.dy, element);
          },
          end() {
            commitPending();
          },
        },
      });

      if (canResizeTag(element)) {
        interactable.resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              const deltaTopLeft = toSvgDelta(event.deltaRect.left, event.deltaRect.top, element);
              const sizeDelta = toSvgDelta(event.rect.width, event.rect.height, element);
              const originalSize = {
                width: toNumber(element.getAttribute('width'), element.getBBox().width),
                height: toNumber(element.getAttribute('height'), element.getBBox().height),
                strokeWidth: toNumber(element.getAttribute('stroke-width'), 0),
                rx: toNumber(element.getAttribute('rx'), 0),
              };
              applyResize(deltaTopLeft.dx, deltaTopLeft.dy, sizeDelta.dx, sizeDelta.dy, element, originalSize);
            },
            end() {
              commitPending();
            },
          },
        });
      }
      return interactable;
    });

    return () => {
      clearOutlines();
      interactables.forEach(i => i.unset());
    };
  }, [onElementTransform, selectionSignatures, svgCode]);

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
