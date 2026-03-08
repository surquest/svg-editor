'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import { AutoAwesome, Image as ImageIcon, Clear, Send } from '@mui/icons-material';
import { useStore } from '@/store/useStore';

export function AIStudio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadFromCode, setStatusMessage } = useStore();

  const examplePrompts = [
    'Create a flat minimalist shopping cart icon',
    'Draw a simple house with a roof and door',
    'Create a colorful geometric pattern',
    'Make a simple star shape',
    'Draw a smiling face emoji',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      // Extract base64 data
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageBase64: imageBase64 || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate SVG');
      }

      const { svg } = await response.json();
      loadFromCode(svg);
      setStatusMessage('AI-generated SVG loaded successfully');
      setPrompt('');
      setImagePreview(null);
      setImageBase64(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" />
        <Typography variant="h6" fontSize="1rem" fontWeight="bold">
          AI Studio
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Describe what SVG you want to generate using Google Gemini AI.
      </Typography>

      {/* Example prompts */}
      <Box>
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          Examples:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {examplePrompts.map((p, i) => (
            <Chip
              key={i}
              label={p}
              size="small"
              onClick={() => setPrompt(p)}
              sx={{ fontSize: '0.65rem', cursor: 'pointer' }}
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Prompt input */}
      <TextField
        multiline
        rows={4}
        label="Describe your SVG"
        placeholder="Create a flat minimalist icon of a shopping cart..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        fullWidth
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
        }}
      />

      {/* Image upload */}
      <Box>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Reference Image (Optional):
        </Typography>
        {imagePreview ? (
          <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Reference" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }} />
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper' }}
              onClick={() => { setImagePreview(null); setImageBase64(null); }}
            >
              <Clear fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ImageIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Upload Reference Image
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        fullWidth
      >
        {loading ? 'Generating...' : 'Generate SVG'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        Powered by Google Gemini. Set GEMINI_API_KEY env var to enable.
      </Typography>
    </Box>
  );
}
