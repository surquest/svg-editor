import { SvgElement, SvgGeometry, SvgTransform, SvgStyle } from '@/types';

export function moveElement(el: SvgElement, dx: number, dy: number): SvgElement {
  const g = { ...el.geometry };
  switch (el.type) {
    case 'rect':
    case 'text':
      g.x = (g.x || 0) + dx;
      g.y = (g.y || 0) + dy;
      break;
    case 'circle':
    case 'ellipse':
      g.cx = (g.cx || 0) + dx;
      g.cy = (g.cy || 0) + dy;
      break;
    case 'line':
      g.x1 = (g.x1 || 0) + dx;
      g.y1 = (g.y1 || 0) + dy;
      g.x2 = (g.x2 || 0) + dx;
      g.y2 = (g.y2 || 0) + dy;
      break;
    default:
      break;
  }
  return { ...el, geometry: g };
}

export function resizeElement(el: SvgElement, width: number, height: number): SvgElement {
  const g = { ...el.geometry };
  switch (el.type) {
    case 'rect':
      g.width = width;
      g.height = height;
      break;
    case 'circle':
      g.r = Math.min(width, height) / 2;
      break;
    case 'ellipse':
      g.rx = width / 2;
      g.ry = height / 2;
      break;
    default:
      break;
  }
  return { ...el, geometry: g };
}

export function rotateElement(el: SvgElement, angle: number): SvgElement {
  return {
    ...el,
    transform: { ...el.transform, rotation: (el.transform.rotation || 0) + angle },
  };
}

export function updateElementStyle(el: SvgElement, style: Partial<SvgStyle>): SvgElement {
  return { ...el, style: { ...el.style, ...style } };
}

export function updateElementGeometry(el: SvgElement, geometry: Partial<SvgGeometry>): SvgElement {
  return { ...el, geometry: { ...el.geometry, ...geometry } };
}

export function updateElementTransform(el: SvgElement, transform: Partial<SvgTransform>): SvgElement {
  return { ...el, transform: { ...el.transform, ...transform } };
}
