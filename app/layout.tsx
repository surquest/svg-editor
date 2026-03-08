import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SVG Editor",
  description: "Browser-based SVG editor with code and canvas editing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
