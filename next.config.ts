/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
