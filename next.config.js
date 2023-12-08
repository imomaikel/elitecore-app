/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.discordapp.com',
        protocol: 'https',
      },
      {
        hostname: 'dunb17ur4ymx4.cloudfront.net',
        protocol: 'https',
      },
    ],
  },
};

module.exports = nextConfig;
