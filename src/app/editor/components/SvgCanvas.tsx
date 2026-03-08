import React from 'react';
import { Box, Paper } from '@mui/material';

interface SvgCanvasProps {
  svgCode: string;
  onCanvasClick: (e: React.MouseEvent) => void;
  selectedElement?: SVGElement | null;
}

export default function SvgCanvas({
  svgCode,
  onCanvasClick,
}: SvgCanvasProps) {
  return (
    <Box sx={{ height: '100%', p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f2f2f2',
            backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, transparent 25%), linear-gradient(-45deg, #e6e6e6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6e6e6 75%), linear-gradient(-45deg, transparent 75%, #e6e6e6 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            overflow: 'auto',
            p: 4,
            position: 'relative',
            '& svg': {
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              cursor: 'pointer',
            },
          }}
        >
          <div
            onClick={onCanvasClick}
            dangerouslySetInnerHTML={{ __html: svgCode }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
