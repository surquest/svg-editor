'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { generateId } from '@/lib/utils/generateId';

export function KeyboardHandler() {
  const { undo, redo, removeElements, selectedIds, document, addElement } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          removeElements(selectedIds);
        }
      }
      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const selected = document.elements.filter(el => selectedIds.includes(el.id));
        selected.forEach(el => {
          addElement({
            ...el,
            id: generateId('copy'),
            geometry: {
              ...el.geometry,
              x: (el.geometry.x || 0) + 20,
              y: (el.geometry.y || 0) + 20,
              cx: el.geometry.cx ? el.geometry.cx + 20 : undefined,
              cy: el.geometry.cy ? el.geometry.cy + 20 : undefined,
            },
          });
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeElements, selectedIds, document.elements, addElement]);

  return null;
}
