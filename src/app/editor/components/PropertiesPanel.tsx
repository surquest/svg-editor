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
import { X as CloseIcon, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface PropertiesPanelProps {
  selectedElement: SVGElement | null;
  attributes: { name: string, value: string }[];
  textContent: string;
  onAttributeChange: (name: string, value: string) => void;
  onTextContentChange: (value: string) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  selectedElement,
  attributes,
  textContent,
  onAttributeChange,
  onTextContentChange,
  onClose
}: PropertiesPanelProps) {
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  return (
    <Drawer
      anchor="right"
      open={!!selectedElement}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: selectedElement ? 320 : 0,
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
          Properties: {selectedElement?.tagName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon size={20} />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
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
