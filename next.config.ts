import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow the sandbox preview origin to access Next.js dev resources without warnings.
  allowedDevOrigins: ['*.space-z.ai', '*.space-z.ai:443'],
  output: 'standalone',
  transpilePackages: ['motion'],
};

export default nextConfig;
