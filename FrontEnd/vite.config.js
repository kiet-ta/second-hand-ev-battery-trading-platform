import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(),
  tailwindcss()
  ],

  server: {
    proxy: {
      '/ghn': {
        target: 'https://online-gateway.ghn.vn',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ghn/, ''), // xoá prefix /ghn
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'ui-serif', 'Georgia'],
      },
    },
  },
})
