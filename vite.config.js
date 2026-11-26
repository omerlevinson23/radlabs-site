import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` makes the real site (dist/). `npm run build:preview` makes one self-contained HTML file for previews.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'preview' ? 'dist-preview' : 'dist' },
}))
