import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    host: 'localhost',
    port: 4200,
  },
  test: {
    globals: true,              
    environment: 'jsdom',       
    setupFiles: ['./src/setupTests.ts'],
  },
});
