import React from 'react';
import { Box, Paper } from '@mui/material';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  svgCode: string;
  onEditorMount: OnMount;
  onChange: (value: string) => void;
}

export default function CodeEditor({ svgCode, onEditorMount, onChange }: CodeEditorProps) {
  return (
    <Box sx={{ height: '100%', p: 1 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            defaultLanguage="xml"
            theme="vs-dark"
            value={svgCode}
            onMount={onEditorMount}
            onChange={(value) => onChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
