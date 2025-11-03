/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are enabled by default in Next.js 14+
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.dealtown.co.nz',
          },
        ],
        destination: 'https://dealtown.co.nz/:path*',
        permanent: true,
      },
      {
        source: '/queenstown/happy-hour',
        destination: '/happy-hour',
        permanent: true,
      },
      {
        source: '/queenstown/lunch',
        destination: '/lunch',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
