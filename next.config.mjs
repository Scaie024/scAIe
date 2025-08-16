/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Compress pages for better performance
  compress: true,
  // Enable React strict mode
  reactStrictMode: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
}

export default nextConfig
