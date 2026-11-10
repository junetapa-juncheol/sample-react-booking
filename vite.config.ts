import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/sample-react-booking/',
  build: { outDir: 'docs', emptyOutDir: false, sourcemap: false },
});
