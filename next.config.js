/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'a9z.ir',
          port: '',
          pathname: '/**',
        },
      ],
    },
};

module.exports = nextConfig;
