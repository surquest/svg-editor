import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Change to your repository name if not using a custom domain
  basePath: process.env.NODE_ENV === 'production' ? '/svg-editor' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
