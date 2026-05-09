/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/history/:path*',
        destination: 'http://localhost:5000/api/history/:path*',
      },
    ]
  },
}

export default nextConfig
