import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: "src/main.ts"
    },
    outDir: "D:/projects/django_images/dist",
    assetsDir: "",
    emptyOutDir: true,
  }
})
