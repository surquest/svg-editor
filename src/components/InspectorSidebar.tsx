'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useStore } from '@/store/useStore';

export function InspectorSidebar() {
  const { document, selectedIds, selectElements, updateElement } = useStore();

  const selectedElements = document.elements.filter(el => selectedIds.includes(el.id));
  const firstSelected = selectedElements[0];

  const handleStyleChange = (key: string, value: string) => {
    if (!firstSelected) return;
    updateElement(firstSelected.id, {
      style: {
        ...firstSelected.style,
        [key]: key === 'strokeWidth' || key === 'opacity' ? parseFloat(value) : value,
      },
    });
  };

  const handleGeometryChange = (key: string, value: string) => {
    if (!firstSelected) return;
    updateElement(firstSelected.id, {
      geometry: { ...firstSelected.geometry, [key]: parseFloat(value) || 0 },
    });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Layers ({document.elements.length})
      </Typography>

      <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
        {document.elements.map((el) => (
          <ListItemButton
            key={el.id}
            selected={selectedIds.includes(el.id)}
            onClick={() => selectElements([el.id])}
            sx={{ py: 0.5 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Chip label={el.type} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                  <Typography variant="caption" noWrap>{el.id}</Typography>
                </Box>
              }
            />
          </ListItemButton>
        ))}
        {document.elements.length === 0 && (
          <ListItem><ListItemText secondary="No elements" /></ListItem>
        )}
      </List>

      {firstSelected && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Properties
          </Typography>

          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
              <Typography variant="caption" fontWeight="bold">Geometry</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              {Object.entries(firstSelected.geometry).map(([key, value]) => (
                <TextField
                  key={key}
                  label={key}
                  value={value || ''}
                  size="small"
                  type={typeof value === 'number' ? 'number' : 'text'}
                  onChange={(e) => handleGeometryChange(key, e.target.value)}
                  sx={{ mb: 1, width: '100%' }}
                  inputProps={{ style: { fontSize: '0.75rem' } }}
                />
              ))}
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
              <Typography variant="caption" fontWeight="bold">Style</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              {[
                { key: 'fill', label: 'Fill', type: 'color' },
                { key: 'stroke', label: 'Stroke', type: 'color' },
                { key: 'strokeWidth', label: 'Stroke Width', type: 'number' },
                { key: 'opacity', label: 'Opacity', type: 'number' },
              ].map(({ key, label, type }) => (
                <Box key={key} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type === 'color' && (
                    <input
                      type="color"
                      value={(firstSelected.style as Record<string, unknown>)[key] as string || '#000000'}
                      onChange={(e) => handleStyleChange(key, e.target.value)}
                      style={{ width: 32, height: 32, padding: 0, border: 'none', cursor: 'pointer' }}
                    />
                  )}
                  <TextField
                    label={label}
                    value={(firstSelected.style as Record<string, unknown>)[key] || ''}
                    size="small"
                    type={type === 'number' ? 'number' : 'text'}
                    onChange={(e) => handleStyleChange(key, e.target.value)}
                    sx={{ flex: 1 }}
                    inputProps={{
                      style: { fontSize: '0.75rem' },
                      min: 0,
                      max: type === 'opacity' ? 1 : undefined,
                      step: type === 'opacity' ? 0.1 : 1,
                    }}
                  />
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </>
      )}

      {selectedElements.length === 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Click an element to inspect
        </Typography>
      )}
    </Box>
  );
}
