'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { PlayArrow, Refresh } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export function CodeEditor() {
  const { svgCode, loadFromCode, setStatusMessage } = useStore();
  const [localCode, setLocalCode] = useState(svgCode);
  const [isDirty, setIsDirty] = useState(false);
  const syncFromStoreRef = useRef(true);

  // Sync from store to editor (when canvas changes)
  useEffect(() => {
    if (syncFromStoreRef.current) {
      setLocalCode(svgCode);
      setIsDirty(false);
    }
  }, [svgCode]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    syncFromStoreRef.current = false;
    setLocalCode(value);
    setIsDirty(true);
    // Re-enable store sync after a short delay to prevent loop
    setTimeout(() => { syncFromStoreRef.current = true; }, 100);
  }, []);

  const handleApply = useCallback(() => {
    loadFromCode(localCode);
    setIsDirty(false);
    setStatusMessage('SVG code applied');
  }, [localCode, loadFromCode, setStatusMessage]);

  const handleReset = useCallback(() => {
    setLocalCode(svgCode);
    setIsDirty(false);
  }, [svgCode]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'bold' }}>
          SVG Code {isDirty && <span style={{ color: 'orange' }}>●</span>}
        </Typography>
        <Tooltip title="Reset to canvas">
          <span>
            <IconButton size="small" onClick={handleReset} disabled={!isDirty}>
              <Refresh fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Apply code to canvas (Ctrl+Enter)">
          <span>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              disabled={!isDirty}
              startIcon={<PlayArrow />}
              sx={{ ml: 1 }}
            >
              Apply
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          height="100%"
          language="xml"
          value={localCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            folding: true,
            formatOnPaste: true,
          }}
          onMount={(editor, monaco) => {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => handleApply()
            );
          }}
        />
      </Box>
    </Box>
  );
}
