import { SvgDocument, SvgElement, SvgElementType, SvgGeometry, SvgStyle, SvgTransform } from '@/types';

let idCounter = 0;
const generateId = () => `el-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;

function parseStyle(el: Element): SvgStyle {
  return {
    fill: el.getAttribute('fill') || undefined,
    stroke: el.getAttribute('stroke') || undefined,
    strokeWidth: el.getAttribute('stroke-width') ? parseFloat(el.getAttribute('stroke-width')!) : undefined,
    opacity: el.getAttribute('opacity') ? parseFloat(el.getAttribute('opacity')!) : undefined,
    fillOpacity: el.getAttribute('fill-opacity') ? parseFloat(el.getAttribute('fill-opacity')!) : undefined,
    strokeOpacity: el.getAttribute('stroke-opacity') ? parseFloat(el.getAttribute('stroke-opacity')!) : undefined,
    fontSize: el.getAttribute('font-size') ? parseFloat(el.getAttribute('font-size')!) : undefined,
    fontFamily: el.getAttribute('font-family') || undefined,
  };
}

function parseTransform(el: Element): SvgTransform {
  const transformStr = el.getAttribute('transform') || '';
  const transform: SvgTransform = {};
  const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    const parts = rotateMatch[1].split(/[\s,]+/);
    transform.rotation = parseFloat(parts[0]);
  }
  const translateMatch = transformStr.match(/translate\(([^)]+)\)/);
  if (translateMatch) {
    const parts = translateMatch[1].split(/[\s,]+/);
    transform.translateX = parseFloat(parts[0]);
    transform.translateY = parseFloat(parts[1] || '0');
  }
  const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    const parts = scaleMatch[1].split(/[\s,]+/);
    transform.scaleX = parseFloat(parts[0]);
    transform.scaleY = parseFloat(parts[1] || parts[0]);
  }
  return transform;
}

function parseGeometry(el: Element, type: SvgElementType): SvgGeometry {
  const g: SvgGeometry = {};
  switch (type) {
    case 'rect':
      g.x = parseFloat(el.getAttribute('x') || '0');
      g.y = parseFloat(el.getAttribute('y') || '0');
      g.width = parseFloat(el.getAttribute('width') || '0');
      g.height = parseFloat(el.getAttribute('height') || '0');
      break;
    case 'circle':
      g.cx = parseFloat(el.getAttribute('cx') || '0');
      g.cy = parseFloat(el.getAttribute('cy') || '0');
      g.r = parseFloat(el.getAttribute('r') || '0');
      break;
    case 'ellipse':
      g.cx = parseFloat(el.getAttribute('cx') || '0');
      g.cy = parseFloat(el.getAttribute('cy') || '0');
      g.rx = parseFloat(el.getAttribute('rx') || '0');
      g.ry = parseFloat(el.getAttribute('ry') || '0');
      break;
    case 'line':
      g.x1 = parseFloat(el.getAttribute('x1') || '0');
      g.y1 = parseFloat(el.getAttribute('y1') || '0');
      g.x2 = parseFloat(el.getAttribute('x2') || '0');
      g.y2 = parseFloat(el.getAttribute('y2') || '0');
      break;
    case 'path':
      g.d = el.getAttribute('d') || '';
      break;
    case 'polygon':
      g.points = el.getAttribute('points') || '';
      break;
    case 'text':
      g.x = parseFloat(el.getAttribute('x') || '0');
      g.y = parseFloat(el.getAttribute('y') || '0');
      break;
    case 'group':
      break;
  }
  return g;
}

const SUPPORTED_TYPES: SvgElementType[] = ['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'text', 'group'];

function parseElement(el: Element): SvgElement | null {
  const rawTag = el.tagName.toLowerCase();
  const type: SvgElementType = rawTag === 'g' ? 'group' : rawTag as SvgElementType;
  if (!SUPPORTED_TYPES.includes(type)) return null;

  const element: SvgElement = {
    id: el.getAttribute('id') || generateId(),
    type,
    geometry: parseGeometry(el, type),
    transform: parseTransform(el),
    style: parseStyle(el),
    text: type === 'text' ? el.textContent || '' : undefined,
  };

  if (type === 'group') {
    element.children = Array.from(el.children)
      .map(parseElement)
      .filter((e): e is SvgElement => e !== null);
  }

  return element;
}

export function parseSvg(svgString: string): SvgDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) throw new Error('Invalid SVG');

  const width = parseFloat(svgEl.getAttribute('width') || svgEl.getAttribute('viewBox')?.split(' ')[2] || '800');
  const height = parseFloat(svgEl.getAttribute('height') || svgEl.getAttribute('viewBox')?.split(' ')[3] || '600');

  const elements: SvgElement[] = Array.from(svgEl.children)
    .map(parseElement)
    .filter((e): e is SvgElement => e !== null);

  return { width, height, elements };
}
