import { create } from 'zustand';
import { SvgDocument, SvgElement, Command } from '@/types';
import { serializeSvg } from '@/lib/svg/serializeSvg';
import { parseSvg } from '@/lib/svg/parseSvg';
import { CommandManager } from '@/lib/history/commandManager';

const commandManager = new CommandManager();

interface DocumentState {
  document: SvgDocument;
  svgCode: string;
}

interface SelectionState {
  selectedIds: string[];
}

interface TransformState {
  tool: 'select' | 'rect' | 'circle' | 'ellipse' | 'line' | 'path' | 'text';
  zoom: number;
  panX: number;
  panY: number;
}

interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

interface UIState {
  showCodeEditor: boolean;
  showAIStudio: boolean;
  showInspector: boolean;
  statusMessage: string;
}

interface StoreState extends DocumentState, SelectionState, TransformState, HistoryState, UIState {
  // Document actions
  setDocument: (doc: SvgDocument) => void;
  updateElements: (elements: SvgElement[]) => void;
  addElement: (element: SvgElement) => void;
  removeElements: (ids: string[]) => void;
  updateElement: (id: string, updates: Partial<SvgElement>) => void;
  updateSvgCode: (code: string) => void;
  loadFromCode: (code: string) => void;

  // Selection actions
  selectElements: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  // Transform actions
  setTool: (tool: TransformState['tool']) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;

  // History actions
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;

  // UI actions
  toggleCodeEditor: () => void;
  toggleAIStudio: () => void;
  toggleInspector: () => void;
  setStatusMessage: (message: string) => void;
}

const defaultDocument: SvgDocument = {
  width: 800,
  height: 600,
  elements: [],
};

const defaultSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
</svg>`;

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  document: defaultDocument,
  svgCode: defaultSvgCode,
  selectedIds: [],
  tool: 'select',
  zoom: 1,
  panX: 0,
  panY: 0,
  canUndo: false,
  canRedo: false,
  showCodeEditor: true,
  showAIStudio: false,
  showInspector: true,
  statusMessage: 'Ready',

  // Document actions
  setDocument: (doc) => {
    set({ document: doc, svgCode: serializeSvg(doc) });
  },

  updateElements: (elements) => {
    const doc = { ...get().document, elements };
    set({ document: doc, svgCode: serializeSvg(doc) });
  },

  addElement: (element) => {
    const doc = { ...get().document, elements: [...get().document.elements, element] };
    set({ document: doc, svgCode: serializeSvg(doc) });
  },

  removeElements: (ids) => {
    const doc = { ...get().document, elements: get().document.elements.filter(el => !ids.includes(el.id)) };
    set({ document: doc, svgCode: serializeSvg(doc), selectedIds: [] });
  },

  updateElement: (id, updates) => {
    const elements = get().document.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    const doc = { ...get().document, elements };
    set({ document: doc, svgCode: serializeSvg(doc) });
  },

  updateSvgCode: (code) => {
    set({ svgCode: code });
  },

  loadFromCode: (code) => {
    try {
      // parseSvg uses DOMParser - only call on client
      if (typeof window === 'undefined') return;
      const doc = parseSvg(code);
      set({ document: doc, svgCode: code, selectedIds: [], statusMessage: 'SVG loaded from code' });
    } catch {
      set({ statusMessage: 'Error: Invalid SVG code' });
    }
  },

  // Selection actions
  selectElements: (ids) => set({ selectedIds: ids }),

  toggleSelection: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter(sid => sid !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  clearSelection: () => set({ selectedIds: [] }),

  // Transform actions
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),

  // History actions
  executeCommand: (command) => {
    commandManager.execute(command);
    set({ canUndo: commandManager.canUndo(), canRedo: commandManager.canRedo() });
  },

  undo: () => {
    commandManager.undo();
    set({ canUndo: commandManager.canUndo(), canRedo: commandManager.canRedo() });
  },

  redo: () => {
    commandManager.redo();
    set({ canUndo: commandManager.canUndo(), canRedo: commandManager.canRedo() });
  },

  // UI actions
  toggleCodeEditor: () => set(state => ({ showCodeEditor: !state.showCodeEditor })),
  toggleAIStudio: () => set(state => ({ showAIStudio: !state.showAIStudio })),
  toggleInspector: () => set(state => ({ showInspector: !state.showInspector })),
  setStatusMessage: (message) => set({ statusMessage: message }),
}));
