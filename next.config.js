/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ASTRA_DB_NAMESPACE: process.env.ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION: process.env.ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT: process.env.ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN: process.env.ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
