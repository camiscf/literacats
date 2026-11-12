import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Atualiza sozinho quando sai versão nova: as meninas não precisam fazer nada
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icone.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Clube Literacats',
        short_name: 'Literacats',
        description: 'Encontros, avisos, biblioteca e papo do livro do Clube Literacats.',
        lang: 'pt-BR',
        theme_color: '#1A1A19',
        background_color: '#ECEBE1',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
