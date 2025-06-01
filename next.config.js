const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  images: {
    loader: 'custom',
    path: 'https://scaleflex.cloudimg.io/',
  },
  ...(isProd ? {
    assetPrefix: '/next-cloudimage-responsive/',
    basePath: '/next-cloudimage-responsive',
  } : {}),
  productionBrowserSourceMaps: true,
};

export default nextConfig;
