import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['frontend-take-home-service.fetch.com', 'frontend-take-home.fetch.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;