import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Dev-only stand-in for the Cloudflare Worker sync API, so `npm run dev`
 * works without wrangler. Data lives in memory for the life of the dev server.
 */
function devSyncApi(): Plugin {
  const store = new Map<string, string>();
  return {
    name: 'dev-sync-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/sync/', (req, res) => {
        const code = (req.url ?? '').replace(/^\//, '').split('?')[0];
        if (!/^[0-9a-f]{32}$/.test(code)) {
          res.statusCode = 400;
          res.end('bad code');
          return;
        }
        if (req.method === 'GET') {
          const v = store.get(code);
          res.statusCode = v ? 200 : 404;
          res.setHeader('content-type', 'application/json');
          res.end(v ?? 'null');
          return;
        }
        if (req.method === 'PUT') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            store.set(code, body);
            res.statusCode = 204;
            res.end();
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    devSyncApi(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Study Hub',
        short_name: 'Study Hub',
        description: 'Interactive study platform: lessons, flashcards, quizzes, mock exams and visualizations.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,woff,ttf}'],
        navigateFallbackDenylist: [/^\/api\//],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('katex')) return 'katex';
          if (/react-markdown|remark|rehype|micromark|mdast|hast|unified|unist|vfile|property-information|space-separated|comma-separated/.test(id)) return 'markdown';
          if (/d3-/.test(id)) return 'd3';
          if (/react|scheduler/.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'worker/**/*.test.ts'],
  },
});
