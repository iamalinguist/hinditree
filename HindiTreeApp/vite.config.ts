
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// Set base to repo name for GitHub Pages
export default defineConfig({
  base: '/hinditree/',
  plugins: [react(), tailwindcss()],
});
