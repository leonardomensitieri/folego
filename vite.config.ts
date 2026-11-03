import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

// O app é publicado em https://<usuario>.github.io/folego/ ; BASE permite mudar o caminho sem mexer no código.
const base = process.env.BASE ?? '/folego/'

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    preact(),
    VitePWA({
      // atualiza sozinho: não há dado no servidor, então a versão nova pode entrar sem perguntar
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fôlego — caixa do salão',
        short_name: 'Fôlego',
        description: 'Caixa de bolso para salão de uma profissional só: entradas e saídas, reserva e decisões com calma.',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf6f2',
        theme_color: '#6a2c5a',
        categories: ['finance', 'business', 'productivity'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
        // o Laboratório é uma página à parte; não deve cair no app
        navigateFallbackDenylist: [/\/laboratorio\//],
      },
    }),
  ],
})
