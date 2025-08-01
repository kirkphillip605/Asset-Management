/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Disable SSR for Ionic components to prevent hydration issues
  experimental: {
    esmExternals: 'loose',
  },
  // Webpack configuration to handle Ionic/Stencil modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Handle Stencil/Ionic dynamic imports
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/@stencil/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-syntax-dynamic-import']
        }
      }
    })

    return config
  },
  transpilePackages: ['@ionic/react', '@ionic/core', '@stencil/core'],
  // Add this to help with Ionic SSR issues
  reactStrictMode: false,
}

module.exports = nextConfig