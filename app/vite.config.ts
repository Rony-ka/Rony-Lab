import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ks-lab/',  // Change this to match your GitHub repo name
  server: {
    port: 3000,
    open: true
  }
})

