'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 6,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          SVG Editor
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Create and edit SVGs live with instant preview.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Link href="/editor" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              Go to Editor
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
