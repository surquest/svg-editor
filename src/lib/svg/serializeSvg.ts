import { SvgDocument, SvgElement, SvgStyle, SvgTransform } from '@/types';

function serializeStyle(style: SvgStyle): string {
  const attrs: string[] = [];
  if (style.fill !== undefined) attrs.push(`fill="${style.fill}"`);
  if (style.stroke !== undefined) attrs.push(`stroke="${style.stroke}"`);
  if (style.strokeWidth !== undefined) attrs.push(`stroke-width="${style.strokeWidth}"`);
  if (style.opacity !== undefined) attrs.push(`opacity="${style.opacity}"`);
  if (style.fillOpacity !== undefined) attrs.push(`fill-opacity="${style.fillOpacity}"`);
  if (style.strokeOpacity !== undefined) attrs.push(`stroke-opacity="${style.strokeOpacity}"`);
  if (style.fontSize !== undefined) attrs.push(`font-size="${style.fontSize}"`);
  if (style.fontFamily !== undefined) attrs.push(`font-family="${style.fontFamily}"`);
  return attrs.join(' ');
}

function serializeTransform(transform: SvgTransform): string {
  const parts: string[] = [];
  if (transform.translateX || transform.translateY) {
    parts.push(`translate(${transform.translateX || 0},${transform.translateY || 0})`);
  }
  if (transform.rotation) {
    parts.push(`rotate(${transform.rotation})`);
  }
  if (transform.scaleX || transform.scaleY) {
    parts.push(`scale(${transform.scaleX || 1},${transform.scaleY || 1})`);
  }
  return parts.length > 0 ? `transform="${parts.join(' ')}"` : '';
}

function serializeElement(el: SvgElement, indent = '  '): string {
  const styleAttrs = serializeStyle(el.style);
  const transformAttr = serializeTransform(el.transform);
  const idAttr = `id="${el.id}"`;
  const commonAttrs = [idAttr, styleAttrs, transformAttr].filter(Boolean).join(' ');

  switch (el.type) {
    case 'rect': {
      const { x = 0, y = 0, width = 0, height = 0 } = el.geometry;
      return `${indent}<rect x="${x}" y="${y}" width="${width}" height="${height}" ${commonAttrs}/>`;
    }
    case 'circle': {
      const { cx = 0, cy = 0, r = 0 } = el.geometry;
      return `${indent}<circle cx="${cx}" cy="${cy}" r="${r}" ${commonAttrs}/>`;
    }
    case 'ellipse': {
      const { cx = 0, cy = 0, rx = 0, ry = 0 } = el.geometry;
      return `${indent}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${commonAttrs}/>`;
    }
    case 'line': {
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = el.geometry;
      return `${indent}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${commonAttrs}/>`;
    }
    case 'path': {
      const { d = '' } = el.geometry;
      return `${indent}<path d="${d}" ${commonAttrs}/>`;
    }
    case 'polygon': {
      const { points = '' } = el.geometry;
      return `${indent}<polygon points="${points}" ${commonAttrs}/>`;
    }
    case 'text': {
      const { x = 0, y = 0 } = el.geometry;
      return `${indent}<text x="${x}" y="${y}" ${commonAttrs}>${el.text || ''}</text>`;
    }
    case 'group': {
      const children = (el.children || []).map(c => serializeElement(c, indent + '  ')).join('\n');
      return `${indent}<g ${commonAttrs}>\n${children}\n${indent}</g>`;
    }
    default:
      return '';
  }
}

export function serializeSvg(doc: SvgDocument): string {
  const elements = doc.elements.map(el => serializeElement(el)).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}">\n${elements}\n</svg>`;
}
