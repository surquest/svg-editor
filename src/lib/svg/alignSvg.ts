import { SvgElement } from '@/types';

type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
type DistributeType = 'horizontal' | 'vertical';

function getBounds(el: SvgElement): { x: number; y: number; width: number; height: number } {
  switch (el.type) {
    case 'rect':
    case 'text':
      return {
        x: el.geometry.x || 0,
        y: el.geometry.y || 0,
        width: el.geometry.width || 0,
        height: el.geometry.height || 0,
      };
    case 'circle':
      return {
        x: (el.geometry.cx || 0) - (el.geometry.r || 0),
        y: (el.geometry.cy || 0) - (el.geometry.r || 0),
        width: (el.geometry.r || 0) * 2,
        height: (el.geometry.r || 0) * 2,
      };
    case 'ellipse':
      return {
        x: (el.geometry.cx || 0) - (el.geometry.rx || 0),
        y: (el.geometry.cy || 0) - (el.geometry.ry || 0),
        width: (el.geometry.rx || 0) * 2,
        height: (el.geometry.ry || 0) * 2,
      };
    case 'line':
      return {
        x: Math.min(el.geometry.x1 || 0, el.geometry.x2 || 0),
        y: Math.min(el.geometry.y1 || 0, el.geometry.y2 || 0),
        width: Math.abs((el.geometry.x2 || 0) - (el.geometry.x1 || 0)),
        height: Math.abs((el.geometry.y2 || 0) - (el.geometry.y1 || 0)),
      };
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

function moveTo(el: SvgElement, x: number, y: number): SvgElement {
  const bounds = getBounds(el);
  const dx = x - bounds.x;
  const dy = y - bounds.y;
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
  }
  return { ...el, geometry: g };
}

export function alignElements(elements: SvgElement[], type: AlignType): SvgElement[] {
  if (elements.length < 2) return elements;
  const bounds = elements.map(getBounds);

  switch (type) {
    case 'left': {
      const minX = Math.min(...bounds.map(b => b.x));
      return elements.map(el => moveTo(el, minX, getBounds(el).y));
    }
    case 'right': {
      const maxRight = Math.max(...bounds.map(b => b.x + b.width));
      return elements.map(el => {
        const b = getBounds(el);
        return moveTo(el, maxRight - b.width, b.y);
      });
    }
    case 'center': {
      const centerX = bounds.reduce((sum, b) => sum + b.x + b.width / 2, 0) / bounds.length;
      return elements.map(el => {
        const b = getBounds(el);
        return moveTo(el, centerX - b.width / 2, b.y);
      });
    }
    case 'top': {
      const minY = Math.min(...bounds.map(b => b.y));
      return elements.map(el => moveTo(el, getBounds(el).x, minY));
    }
    case 'bottom': {
      const maxBottom = Math.max(...bounds.map(b => b.y + b.height));
      return elements.map(el => {
        const b = getBounds(el);
        return moveTo(el, b.x, maxBottom - b.height);
      });
    }
    case 'middle': {
      const centerY = bounds.reduce((sum, b) => sum + b.y + b.height / 2, 0) / bounds.length;
      return elements.map(el => {
        const b = getBounds(el);
        return moveTo(el, b.x, centerY - b.height / 2);
      });
    }
    default:
      return elements;
  }
}

export function distributeElements(elements: SvgElement[], type: DistributeType): SvgElement[] {
  if (elements.length < 3) return elements;
  const sorted = [...elements].sort((a, b) => {
    const ba = getBounds(a);
    const bb = getBounds(b);
    return type === 'horizontal' ? ba.x - bb.x : ba.y - bb.y;
  });

  const first = getBounds(sorted[0]);
  const last = getBounds(sorted[sorted.length - 1]);

  if (type === 'horizontal') {
    const totalWidth = sorted.reduce((sum, el) => sum + getBounds(el).width, 0);
    const gap = (last.x + last.width - first.x - totalWidth) / (sorted.length - 1);
    let currentX = first.x;
    return sorted.map(el => {
      const b = getBounds(el);
      const moved = moveTo(el, currentX, b.y);
      currentX += b.width + gap;
      return moved;
    });
  } else {
    const totalHeight = sorted.reduce((sum, el) => sum + getBounds(el).height, 0);
    const gap = (last.y + last.height - first.y - totalHeight) / (sorted.length - 1);
    let currentY = first.y;
    return sorted.map(el => {
      const b = getBounds(el);
      const moved = moveTo(el, b.x, currentY);
      currentY += b.height + gap;
      return moved;
    });
  }
}
