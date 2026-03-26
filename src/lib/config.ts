import { type VitePWAOptions } from 'vite-plugin-pwa';

export const PWAConfig: Partial<VitePWAOptions> = {
  includeAssets: [
    'favicon.svg',
    'favicon.ico',
    'robots.txt',
    'apple-touch-icon.png',
  ],
  manifest: {
    name: 'System for Retinal Vascular Health Screening',
    short_name: 'AURA EYES',
    description: 'AURA EYES - System for Retinal Vascular Health Screening',
    theme_color: '#1A202C',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: 'icon_16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: 'icon_32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: 'icon_48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: 'icon_64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: 'icon_128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: 'icon_256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: 'icon_256x256.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: 'icon_512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'icon_512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  devOptions: {
    // Disable PWA in development to avoid cross-project cache collisions on localhost.
    enabled: false,
  },
  workbox: {
    sourcemap: true,
    runtimeCaching: [
      {
        urlPattern: /\/icon_\d+x\d+\.png$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'app-icons',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
    ],
  },
};
