import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Prevent Vite/plugin-react from reading babel.config.js (that file is for Jest only).
export default defineConfig({
  plugins: [react({ babel: { babelrc: false, configFile: false } })],
  server: { port: 5173, open: true },
});
