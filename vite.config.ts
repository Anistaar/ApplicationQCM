import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        legacy: resolve(__dirname, 'legacy.html'),
        quiz: resolve(__dirname, 'quiz.html'),
        admin: resolve(__dirname, 'src/admin/admin-panel.html')
      }
    }
  }
});
