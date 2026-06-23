import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Whenever fetch('/api/...') is called in frontend, forward it here
      '/api/': {
        target: 'http://localhost:5000', // Change this to your backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
