/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  eslint: {
    // Unblock builds even if ESLint config outside this app is incompatible
    ignoreDuringBuilds: true,
  },
  // Désactiver optimisations problématiques pour le build
  swcMinify: false,
  compress: false,
  optimizeFonts: false,
  // Désactiver complètement la minification CSS
  webpack: (config, { dev }) => {
    if (!dev) {
      // Désactiver cssnano qui cause l'erreur
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => !minimizer.constructor.name.includes('Css')
      );
    }
    return config;
  },
  async headers() {
    // Temporarily disable custom headers to isolate 500 errors; re-enable after validation
    return []
  },
};

export default nextConfig;
