import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/five-subject/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          tiptap: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-underline',
            '@tiptap/extension-highlight', '@tiptap/extension-link', '@tiptap/extension-image'],
          markdown: ['marked', 'turndown'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Five Subject Notebook App (working title)',
        short_name: 'five-subject-notebook-app',
        description: 'A notebook-style PWA for personal and work notes',
        theme_color: '#2c1a0e',
        background_color: '#2c1a0e',
        display: 'standalone',
        start_url: '/five-subject/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
})
