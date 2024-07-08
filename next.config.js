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
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
  serverRuntimeConfig: {
    // API 라우트에 대한 타임아웃 설정 (밀리초 단위)
    apiTimeout: 60000, // 60초
  },
};

module.exports = nextConfig;
