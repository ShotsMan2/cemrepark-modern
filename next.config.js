/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA & Omni-channel configurations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Micro-Frontends (Module Federation) placeholder configuration
  // When the team grows, this config allows splitting 'Admin' and 'Storefront'
  // into two completely separate repositories that merge at runtime.
  webpack: (config, { isServer }) => {
    // Example: config.plugins.push(new NextFederationPlugin({...}))
    return config;
  },
};

module.exports = nextConfig;
