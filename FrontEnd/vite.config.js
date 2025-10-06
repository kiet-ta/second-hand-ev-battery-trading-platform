import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
<<<<<<< HEAD
  test: {
    globals: true,         
    environment: 'jsdom',   
    setupFiles: './src/setupTests.js', 
  },
=======

>>>>>>> page/purchase-page-order-seller
})
