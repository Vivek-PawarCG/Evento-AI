import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    server: {
      port: parseInt(env.PORT || '5000', 10),
      host: '127.0.0.1',
    },
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'import.meta.env.VITE_GEMINI_MODEL': JSON.stringify(env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || 'gemini-3.5-flash-lite'),
    },
  }
})

