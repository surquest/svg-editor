import React from 'react';
import { 
  Box,
  Paper, 
  Stack, 
  Button, 
  Typography, 
  Divider, 
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  AlignHorizontalLeft, 
  AlignHorizontalCenter, 
  AlignHorizontalRight,
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
  Flip,
  Group as GroupIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface MultiSelectControlProps {
  selectedCount: number;
  onAlign: (alignment: string) => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onDelete: () => void;
}

export default function MultiSelectControl({ 
  selectedCount, 
  onAlign, 
  onDistribute,
  onDelete 
}: MultiSelectControlProps) {
  if (selectedCount <= 1) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
          {selectedCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          elements selected
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Align Left">
          <IconButton size="small" onClick={() => onAlign('left')}>
            <AlignHorizontalLeft fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <IconButton size="small" onClick={() => onAlign('center-h')}>
            <AlignHorizontalCenter fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <IconButton size="small" onClick={() => onAlign('right')}>
            <AlignHorizontalRight fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Align Top">
          <IconButton size="small" onClick={() => onAlign('top')}>
            <AlignVerticalTop fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Middle">
          <IconButton size="small" onClick={() => onAlign('center-v')}>
            <AlignVerticalCenter fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Align Bottom">
          <IconButton size="small" onClick={() => onAlign('bottom')}>
            <AlignVerticalBottom fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Delete selected">
        <IconButton size="small" color="error" onClick={onDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
