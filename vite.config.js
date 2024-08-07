import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 9999, // Cambia '3000' al número de puerto que prefieras
      },
  plugins: [react()],
})



