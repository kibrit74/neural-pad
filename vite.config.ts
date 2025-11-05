import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: './',
      server: {
        port: 5175,
        host: '0.0.0.0',
        strictPort: true,
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          external: ['electron', 'better-sqlite3', 'knex', 'path', 'fs', 'crypto', 'util', 'stream', 'events', 'assert', 'timers', 'tty']
        }
      }
    };
});
