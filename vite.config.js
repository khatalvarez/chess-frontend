import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh but limit its overhead
      fastRefresh: true,
    }),
    
    // Enable compression for all assets
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10kb
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10kb
    }),
    
    // Optimize images
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 65 },
      pngquant: { quality: [0.65, 0.8], speed: 4 },
      webp: { quality: 75 },
      svgo: { plugins: [{ name: 'removeViewBox', active: false }] },
    }),
    
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Chess Master',
        short_name: 'ChessMaster',
        theme_color: '#1F2937',
        background_color: '#1F2937',
        display: 'standalone',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { 
            src: '/pwa-512x512.png', 
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
      },
      workbox: {
        // Cache resources for better performance
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
        ]
      }
    }),
    
    // Add critical HTML directives
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<\/head>/,
          `
            <!-- Meta tags for better performance -->
            <meta http-equiv="x-dns-prefetch-control" content="on">
            
            <!-- Preload critical assets -->
            <link rel="preload" href="/src/assets/images/bgChess-placeholder.webp" as="image" type="image/webp" fetchpriority="high">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link rel="preload" href="/src/index.css" as="style">
            
            <!-- Optimization CSS hooks -->
            <style>
              .chess-piece { content-visibility: auto; }
              img { image-rendering: auto; }
              body { text-rendering: optimizeSpeed; }
            </style>
          </head>`
        );
      }
    },
  ],
  
  build: {
    // Modern minification
    minify: 'terser',
    terserOptions: {
      compress: { 
        drop_console: true, 
        drop_debugger: true,
        passes: 2
      },
      mangle: true
    },
    
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['redux', 'react-redux'],
          'vendor-ui': ['framer-motion'],
          'app-core': ['./src/main.jsx'],
          'app-components': ['./src/components'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
      },
    },
    
    // Other build optimizations
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    sourcemap: false,
    modulePreload: { polyfill: true },
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  
  // Server optimizations
  server: {
    host: true,
    port: 5173,
    hmr: { overlay: false },
    fs: { strict: true },
  },
  
  // Optimization for production preview
  preview: {
    port: 5000,
    host: true,
    strictPort: true,
  },
  
  // Resolve optimizations
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  
  // CSS optimizations
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})