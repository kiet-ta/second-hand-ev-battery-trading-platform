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
  test: {
    globals: true,         
    environment: 'jsdom',   
    setupFiles: './src/setupTests.js', 
  },
    server: {
    host: true, 
    port: 5173, 
    allowedHosts: [
      'overhostile-mindy-overhastily.ngrok-free.dev'
    ],
  },
    theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'ui-serif', 'Georgia'],
      },
    },},
})
