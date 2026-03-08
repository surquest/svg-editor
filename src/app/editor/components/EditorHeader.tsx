import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';

export default function EditorHeader() {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense">
        <Link href="/" passHref>
          <IconButton edge="start" color="inherit" aria-label="home" sx={{ mr: 2 }}>
            <HomeIcon fontSize="small" />
          </IconButton>
        </Link>
        <Typography variant="h6" color="inherit" component="div">
          SVG Live Editor
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
