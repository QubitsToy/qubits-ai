import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// README documents GEMINI_API_KEY in .env.local. Cloud Agent secrets use the
// same name. The client reads process.env.API_KEY, which Vite inlines here.
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(apiKey)
  }
});
