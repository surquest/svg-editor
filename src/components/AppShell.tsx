'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Toolbar } from './Toolbar';
import { InspectorSidebar } from './InspectorSidebar';
import { CanvasEditor } from './CanvasEditor';
import { CodeEditor } from './CodeEditor';
import { StatusBar } from './StatusBar';
import { AIStudio } from './AIStudio';
import { KeyboardHandler } from './KeyboardHandler';
import { useStore } from '@/store/useStore';

export function AppShell() {
  const { showCodeEditor, showInspector, showAIStudio } = useStore();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <KeyboardHandler />
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Inspector */}
        {showInspector && (
          <Box sx={{ width: 240, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
            <InspectorSidebar />
          </Box>
        )}

        {/* Canvas Editor */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <CanvasEditor />
        </Box>

        {/* Right Panel - Code Editor */}
        {showCodeEditor && (
          <Box sx={{ width: '40%', borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <CodeEditor />
          </Box>
        )}

        {/* AI Studio Panel */}
        {showAIStudio && (
          <Box sx={{ width: 360, borderLeft: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
            <AIStudio />
          </Box>
        )}
      </Box>

      {/* Status Bar */}
      <StatusBar />
    </Box>
  );
}
