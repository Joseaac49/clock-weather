import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// si tu repo del front es "clock-weather-client"
export default defineConfig({
  plugins: [react()],
  base: '/clock-weather-client/'
})
