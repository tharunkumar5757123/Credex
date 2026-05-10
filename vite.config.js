import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const frontendRoot = `${projectRoot}/frontend`;

export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: `${projectRoot}/dist`,
    emptyOutDir: true,
  },
  test: {
    include: ['frontend/tests/**/*.test.js'],
  },
});
