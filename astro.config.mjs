import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://wlczak.net',
  output: 'static',
  // Go canonicalizes production page URLs; dev API requests must reach Vite's proxy.
  trailingSlash: 'ignore',
  integrations: [react()],
  server: { host: '127.0.0.1', port: 4321 },
  vite: { server: { strictPort: true, proxy: { '/api': 'http://127.0.0.1:8080' } } },
});
