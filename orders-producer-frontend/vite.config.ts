import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api-gateway-27263349264.northamerica-south1.run.app', // Cambia el puerto si tu api-gateway usa otro
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
