import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@mantine/form'],
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
