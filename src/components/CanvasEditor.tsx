'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useStore } from '@/store/useStore';
import dynamic from 'next/dynamic';

// Dynamically import Konva components to avoid SSR issues
const KonvaCanvas = dynamic(() => import('./KonvaCanvas'), { ssr: false });

export function CanvasEditor() {
  const { zoom, panX, panY, setZoom, setPan } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(zoom * delta);
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onWheel={handleWheel}
    >
      <KonvaCanvas
        width={containerSize.width}
        height={containerSize.height}
      />

      {/* Zoom indicator */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          bgcolor: 'background.paper',
          px: 1,
          py: 0.25,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          pointerEvents: 'none',
        }}
      >
        {Math.round(zoom * 100)}%
      </Typography>
    </Box>
  );
}
