import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  output: 'export',
  exportPathMap: async (defaultPathMap) => {
    const { 'api/discord/callback': _, ...filteredPaths } = defaultPathMap;
    return filteredPaths;
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
