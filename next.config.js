/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://0.0.0.0:5002/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
