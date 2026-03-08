import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Drawer,
  TextField,
  Divider,
  Stack,
  InputAdornment,
  Menu
} from '@mui/material';
import { Palette } from '@mui/icons-material';
import { Close as CloseIcon } from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { Chip } from '@mui/material';

interface PropertiesPanelProps {
  selectedElements: SVGElement[];
  attributes: { name: string, value: string }[];
  textContent: string;
  onAttributeChange: (name: string, value: string) => void;
  onTextContentChange: (value: string) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  selectedElements,
  attributes,
  textContent,
  onAttributeChange,
  onTextContentChange,
  onClose
}: PropertiesPanelProps) {
  const selectedElement = selectedElements[selectedElements.length - 1] || null;
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  return (
    <Drawer
      anchor="right"
      open={selectedElements.length > 0}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: selectedElements.length > 0 ? 320 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          mt: '48px', // height of AppBar
          height: 'calc(100vh - 48px)',
          p: 2
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Properties: {selectedElements.length > 1 ? `${selectedElements.length} elements` : selectedElement?.tagName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon size={20} />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {selectedElements.length > 1 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedElements.map((el, i) => (
              <Chip 
                key={i} 
                label={el.tagName.toLowerCase()} 
                size="small" 
                variant={el === selectedElement ? "filled" : "outlined"}
                color={el === selectedElement ? "primary" : "default"}
              />
            ))}
          </Stack>
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}
      <Stack spacing={3}>
        {selectedElement?.tagName.toLowerCase() === 'text' && (
          <Box>
            <TextField
              label="Text Content"
              value={textContent}
              onChange={(e) => onTextContentChange(e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
            />
          </Box>
        )}
        {attributes.map((attr) => {
          const isNumericField = ['x', 'y', 'width', 'height'].includes(attr.name.toLowerCase());

          return (
            <Box key={attr.name}>
              <TextField
                label={attr.name}
                value={attr.value}
                type={isNumericField ? 'number' : 'text'}
                onChange={(e) => onAttributeChange(attr.name, e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
                inputProps={isNumericField ? { step: 'any' } : undefined}
                slotProps={{
                  input: {
                    endAdornment: (attr.name === 'fill' || attr.name === 'stroke') ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={(e) => setColorPickerAnchor({ ...colorPickerAnchor, [attr.name]: e.currentTarget })}
                          sx={{
                            color: 'inherit',
                            bgcolor: 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.04)'
                            }
                          }}
                        >
                          <Palette size={18} />
                        </IconButton>
                        <Menu
                          anchorEl={colorPickerAnchor[attr.name]}
                          open={Boolean(colorPickerAnchor[attr.name])}
                          onClose={() => setColorPickerAnchor({ ...colorPickerAnchor, [attr.name]: null })}
                          PaperProps={{
                            sx: { p: 1, mt: 1 }
                          }}
                        >
                          <HexColorPicker
                            color={attr.value.startsWith('#') ? attr.value : '#000000'}
                            onChange={(newColor) => onAttributeChange(attr.name, newColor)}
                            style={{ width: '200px', height: '200px' }}
                          />
                          <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {attr.value}
                            </Typography>
                          </Box>
                        </Menu>
                      </InputAdornment>
                    ) : null
                  }
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </Drawer>
  );
}
