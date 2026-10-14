import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/author/',
  server: { port: 5175 },
  preview: { port: 5175 },
});
