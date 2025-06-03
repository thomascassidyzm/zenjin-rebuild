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
  // APML v3.1 Context-based build configuration
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // APML Context-based manual chunks
        manualChunks: {
          // Infrastructure context - always loaded
          'core': [
            'react', 
            'react-dom', 
            'react-router-dom',
            'zustand',
            'localforage'
          ],
          
          // UI vendor libraries
          'ui-vendor': [
            'framer-motion', 
            'lucide-react', 
            'clsx', 
            'tailwind-merge',
            'react-hot-toast'
          ],
          
          // Payment context vendors
          'payment-vendor': [
            '@stripe/stripe-js',
            'stripe'
          ],
          
          // Data visualization
          'charts-vendor': [
            'chart.js',
            'react-chartjs-2'
          ],
          
          // Animation libraries
          'animation-vendor': [
            'gsap',
            'canvas-confetti'
          ],
          
          // Backend services
          'backend-vendor': [
            '@supabase/supabase-js',
            'jsonwebtoken'
          ],
          
          // Form handling
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ]
        },
        
        // Ensure proper chunk naming for context identification
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : '';
          
          // Context-based naming
          if (facadeModuleId?.includes('Context')) {
            return 'contexts/[name]-[hash].js';
          }
          
          // Component naming
          if (facadeModuleId?.includes('components')) {
            return 'components/[name]-[hash].js';
          }
          
          // Default
          return 'assets/[name]-[hash].js';
        }
      }
    },
    
    // Terser options for production optimization
    terserOptions: {
      compress: {
        // Remove console statements in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.trace'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
  },
  
  // Development server configuration
  server: {
    host: true,
    port: 5432,
    strictPort: false
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion',
      '@supabase/supabase-js',
      'zustand'
    ],
    exclude: [
      '@stripe/stripe-js' // Exclude payment SDKs from pre-bundling
    ]
  }
})