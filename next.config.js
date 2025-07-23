const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開啟 React 嚴格模式，有助於找出潛在問題
  reactStrictMode: false,

  // 部署相關配置，用於子目錄部署
  assetPrefix: process.env.BASE_PATH || '', // 靜態資源的基礎路徑
  basePath: process.env.BASE_PATH || '', // 應用的基礎路徑
  trailingSlash: true, // URL 結尾添加斜線
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || '', // 客戶端可訪問的配置
  },

  // 關閉 Next.js 的字體優化
  optimizeFonts: false,

  // 服務器運行時配置
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
    hostname: '0.0.0.0',
  },

  experimental: {
    serverComponentsExternalPackages: ['subset-font', '@pdf-lib/fontkit'],
  },

  // webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 只在生產環境的客戶端構建中啟用檔案系統快取
    if (!dev && !isServer) {
      config.cache = {
        type: 'filesystem', // 使用文件系統快取
        buildDependencies: {
          config: [__filename], // 監聽配置檔案變化
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache'), // 快取目錄
      }
    }
    return config
  },

  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
