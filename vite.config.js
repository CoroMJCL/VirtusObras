import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Target más conservador que el default de Vite, para evitar que el
    // bundle final use sintaxis de JS que versiones de Safari/iOS un poco
    // más antiguas no puedan interpretar (causa típica de "pantalla negra").
    target: ['es2017', 'safari13'],
  },
})
