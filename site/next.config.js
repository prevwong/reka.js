/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/introduction',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
