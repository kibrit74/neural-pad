import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5175,
    host: true,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: ['electron', 'better-sqlite3', 'knex', 'path', 'fs', 'crypto', 'util', 'stream', 'events', 'assert', 'timers', 'tty']
    }
  }
})
