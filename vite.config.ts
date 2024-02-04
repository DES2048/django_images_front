import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      vue(),
      splitVendorChunkPlugin(),
      vuetify({ autoImport:{ 
        ignore: [
          //'Touch'
        ]
      }}), // Enabled by default
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: +env.VITE_SERVER_PORT,
      host: env.VITE_SERVER_HOST,
      hmr: {host:env.VITE_HMR_HOST}
    },
    build: {
      manifest: true,
      rollupOptions: {
        input: "src/main.ts"
      },
      outDir: env.VITE_BUILD_OUT_DIR || 'frontend_dist',
      assetsDir: "",
      emptyOutDir: true,
      sourcemap:true
    }
  }
})
