'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useStore } from '@/store/useStore';

export function StatusBar() {
  const { statusMessage, document, selectedIds, zoom, tool } = useStore();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        gap: 2,
        minHeight: 28,
      }}
    >
      <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>
        {statusMessage}
      </Typography>

      <Chip label={`Tool: ${tool}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
      <Chip label={`Elements: ${document.elements.length}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
      {selectedIds.length > 0 && (
        <Chip label={`Selected: ${selectedIds.length}`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
      )}
      <Chip label={`${document.width}×${document.height}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
      <Chip label={`Zoom: ${Math.round(zoom * 100)}%`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
    </Box>
  );
}
