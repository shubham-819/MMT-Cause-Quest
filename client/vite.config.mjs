import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,js,ts}',
      jsxRuntime: 'classic'
    })
  ],
  esbuild: {
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    jsx: 'transform',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name].[hash].js',
        entryFileNames: 'static/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `static/media/[name].[hash].[ext]`;
          }
          if (/css/i.test(extType)) {
            return `static/css/[name].[hash].[ext]`;
          }
          return `static/[ext]/[name].[hash].[ext]`;
        }
      }
    },
    // Increase chunk size limit to prevent warnings
    chunkSizeWarningLimit: 1000
  },
  // Handle environment variables
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  }
})
