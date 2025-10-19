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
  // Désactiver optimisation CSS pour corriger l'erreur de build
  swcMinify: false,
  compress: false,
  async headers() {
    // Temporarily disable custom headers to isolate 500 errors; re-enable after validation
    return []
  },
};

export default nextConfig;
