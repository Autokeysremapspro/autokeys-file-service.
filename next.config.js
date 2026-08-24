/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.akcloud.es' }],
        destination: 'https://akcloud.es/:path*',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
