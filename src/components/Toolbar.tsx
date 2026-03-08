'use client';

import React, { useRef } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
} from '@mui/material';
import {
  PanTool,
  RadioButtonUnchecked,
  Remove,
  Timeline,
  TextFields,
  Undo,
  Redo,
  AlignHorizontalLeft,
  AlignHorizontalCenter,
  AlignHorizontalRight,
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
  SpaceBar,
  RotateRight,
  FileUpload,
  FileDownload,
  Code,
  AutoAwesome,
  ContentCopy,
  Delete,
  ContentPaste,
  Crop32,
  Lens,
} from '@mui/icons-material';
import { useStore } from '@/store/useStore';
import { alignElements, distributeElements } from '@/lib/svg/alignSvg';
import { serializeSvg } from '@/lib/svg/serializeSvg';

export function Toolbar() {
  const {
    tool,
    setTool,
    undo,
    redo,
    canUndo,
    canRedo,
    document,
    selectedIds,
    updateElements,
    removeElements,
    addElement,
    toggleCodeEditor,
    toggleAIStudio,
    loadFromCode,
    setStatusMessage,
    showCodeEditor,
    showAIStudio,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'select' as const, icon: <PanTool />, label: 'Select (V)' },
    { id: 'rect' as const, icon: <Crop32 />, label: 'Rectangle (R)' },
    { id: 'circle' as const, icon: <RadioButtonUnchecked />, label: 'Circle (C)' },
    { id: 'ellipse' as const, icon: <Lens />, label: 'Ellipse (E)' },
    { id: 'line' as const, icon: <Remove />, label: 'Line (L)' },
    { id: 'path' as const, icon: <Timeline />, label: 'Path (P)' },
    { id: 'text' as const, icon: <TextFields />, label: 'Text (T)' },
  ];

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const selected = document.elements.filter(el => selectedIds.includes(el.id));
    if (selected.length < 2) { setStatusMessage('Select at least 2 elements to align'); return; }
    const aligned = alignElements(selected, type);
    const elements = document.elements.map(el => aligned.find(a => a.id === el.id) || el);
    updateElements(elements);
  };

  const handleDistribute = (type: 'horizontal' | 'vertical') => {
    const selected = document.elements.filter(el => selectedIds.includes(el.id));
    if (selected.length < 3) { setStatusMessage('Select at least 3 elements to distribute'); return; }
    const distributed = distributeElements(selected, type);
    const elements = document.elements.map(el => distributed.find(a => a.id === el.id) || el);
    updateElements(elements);
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) removeElements(selectedIds);
  };

  const handleDuplicate = () => {
    const selected = document.elements.filter(el => selectedIds.includes(el.id));
    const duplicates = selected.map(el => ({
      ...el,
      id: `${el.id}-copy-${Date.now()}`,
      geometry: {
        ...el.geometry,
        x: (el.geometry.x || 0) + 20,
        y: (el.geometry.y || 0) + 20,
        cx: el.geometry.cx ? el.geometry.cx + 20 : undefined,
        cy: el.geometry.cy ? el.geometry.cy + 20 : undefined,
      },
    }));
    duplicates.forEach(d => addElement(d));
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      loadFromCode(content);
      setStatusMessage('SVG imported successfully');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const svgContent = serializeSvg(document);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('SVG exported');
  };

  const handleCopy = () => {
    const svgContent = serializeSvg(document);
    navigator.clipboard.writeText(svgContent).then(() => {
      setStatusMessage('SVG copied to clipboard');
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim().startsWith('<svg')) {
        loadFromCode(text);
        setStatusMessage('SVG pasted from clipboard');
      }
    } catch {
      setStatusMessage('Could not paste from clipboard');
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, gap: 0.5, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ mr: 1, fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
          SVG Editor
        </Typography>

        <Divider orientation="vertical" flexItem />

        {/* Drawing Tools */}
        {tools.map(t => (
          <Tooltip key={t.id} title={t.label}>
            <IconButton
              size="small"
              color={tool === t.id ? 'primary' : 'default'}
              onClick={() => setTool(t.id)}
              sx={{ bgcolor: tool === t.id ? 'primary.light' : 'transparent', '&:hover': { bgcolor: 'action.hover' } }}
            >
              {t.icon}
            </IconButton>
          </Tooltip>
        ))}

        <Divider orientation="vertical" flexItem />

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)">
          <span><IconButton size="small" onClick={undo} disabled={!canUndo}><Undo /></IconButton></span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <span><IconButton size="small" onClick={redo} disabled={!canRedo}><Redo /></IconButton></span>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Edit operations */}
        <Tooltip title="Delete (Del)">
          <span><IconButton size="small" onClick={handleDelete} disabled={selectedIds.length === 0}><Delete /></IconButton></span>
        </Tooltip>
        <Tooltip title="Duplicate (Ctrl+D)">
          <span><IconButton size="small" onClick={handleDuplicate} disabled={selectedIds.length === 0}><ContentCopy /></IconButton></span>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <Tooltip title="Align Left"><span><IconButton size="small" onClick={() => handleAlign('left')} disabled={selectedIds.length < 2}><AlignHorizontalLeft /></IconButton></span></Tooltip>
        <Tooltip title="Align Center (H)"><span><IconButton size="small" onClick={() => handleAlign('center')} disabled={selectedIds.length < 2}><AlignHorizontalCenter /></IconButton></span></Tooltip>
        <Tooltip title="Align Right"><span><IconButton size="small" onClick={() => handleAlign('right')} disabled={selectedIds.length < 2}><AlignHorizontalRight /></IconButton></span></Tooltip>
        <Tooltip title="Align Top"><span><IconButton size="small" onClick={() => handleAlign('top')} disabled={selectedIds.length < 2}><AlignVerticalTop /></IconButton></span></Tooltip>
        <Tooltip title="Align Middle (V)"><span><IconButton size="small" onClick={() => handleAlign('middle')} disabled={selectedIds.length < 2}><AlignVerticalCenter /></IconButton></span></Tooltip>
        <Tooltip title="Align Bottom"><span><IconButton size="small" onClick={() => handleAlign('bottom')} disabled={selectedIds.length < 2}><AlignVerticalBottom /></IconButton></span></Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Distribute */}
        <Tooltip title="Distribute Horizontally"><span><IconButton size="small" onClick={() => handleDistribute('horizontal')} disabled={selectedIds.length < 3}><SpaceBar /></IconButton></span></Tooltip>
        <Tooltip title="Distribute Vertically"><span><IconButton size="small" onClick={() => handleDistribute('vertical')} disabled={selectedIds.length < 3}><RotateRight /></IconButton></span></Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Import/Export */}
        <Tooltip title="Import SVG"><IconButton size="small" onClick={handleImport}><FileUpload /></IconButton></Tooltip>
        <Tooltip title="Export SVG"><IconButton size="small" onClick={handleExport}><FileDownload /></IconButton></Tooltip>
        <Tooltip title="Copy SVG Code"><IconButton size="small" onClick={handleCopy}><ContentCopy /></IconButton></Tooltip>
        <Tooltip title="Paste SVG Code"><IconButton size="small" onClick={handlePaste}><ContentPaste /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* View toggles */}
        <Tooltip title="Toggle Code Editor">
          <IconButton size="small" color={showCodeEditor ? 'primary' : 'default'} onClick={toggleCodeEditor}>
            <Code />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle AI Studio">
          <IconButton size="small" color={showAIStudio ? 'primary' : 'default'} onClick={toggleAIStudio}>
            <AutoAwesome />
          </IconButton>
        </Tooltip>

        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>
    </AppBar>
  );
}
