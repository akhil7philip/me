/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    // Fix webpack caching issues for cloud storage environments (Google Drive)
    if (dev) {
      // Use memory cache instead of filesystem cache to avoid cloud storage issues
      // This prevents "Unable to snapshot resolve dependencies" errors
      config.cache = {
        type: 'memory',
      };
      
      // Disable snapshotting that causes issues with cloud storage file systems
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
