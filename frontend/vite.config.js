import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { splitVendorChunkPlugin } from 'vite'
import compression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';
  
  return {
    plugins: [
      react(),
      splitVendorChunkPlugin(),
      // GZIP compression
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        // Only compress files larger than 1KB
        threshold: 1024,
        // Skip compressing files that are already smaller than the compressed size
        skipIfLargerOrEqual: true,
      }),
      // Brotli compression (better than GZIP)
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        skipIfLargerOrEqual: true,
      }),
      // Image optimization
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 80,
        },
        pngquant: {
          quality: [0.7, 0.8],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
              active: false,
            },
            {
              name: 'removeEmptyAttrs',
              active: true,
            },
          ],
        },
      }),
      // Bundle analyzer (only in analyze mode)
      isAnalyze && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // 4MB chunk size threshold
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          // Manual chunk splitting for better performance
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'clsx', 'tailwind-merge'],
            'vendor-icons': ['react-icons'],
            'vendor-utils': ['axios'],
          },
          // Reduce asset file names for better caching
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.').at(-1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      // CSS optimization
      cssCodeSplit: true,
      // Generate source maps only for production builds
      sourcemap: false,
      // Use Terser for better compression
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        output: {
          comments: false,
        },
      },
      // Preload critical chunks
      reportCompressedSize: true,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  }
}) 