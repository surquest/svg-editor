import type { Metadata } from 'next';
import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: 'SVG Editor',
  description: 'Browser-based SVG editor with AI generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
