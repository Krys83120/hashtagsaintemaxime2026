/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY,
  },
};

module.exports = nextConfig;