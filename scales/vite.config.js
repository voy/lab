import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const demodule = {
  name: 'demodule',
  transformIndexHtml: (html) =>
    html.replace(/<script type="module" crossorigin/g, '<script defer'),
}

export default defineConfig({
  base: './',
  plugins: [react(), demodule],
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})

