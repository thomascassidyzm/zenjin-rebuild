import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject build timestamp at build time
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_BUILD_NUMBER': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || Date.now().toString()),
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || ''),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // Optimized for Vercel deployment
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
        }
      }
    }
  },
  // Make SPA routing work correctly
  server: {
    host: true,
    port: 5432,
    strictPort: false
  },
  // Support absolute imports
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  }
})