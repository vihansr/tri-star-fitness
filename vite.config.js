import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PORT = process.env.PORT || 3001;

export default defineConfig(() => {
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname),
            },
        },
        server: {
            // Dev proxy: the Vite client calls /api/* on its own origin (port 3000);
            // Vite forwards those requests to the Express API server below.
            proxy: {
                '/api': `http://localhost:${SERVER_PORT}`,
            },
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modify—file watching is disabled to prevent flickering during agent edits.
            hmr: process.env.DISABLE_HMR !== 'true',
            watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
        build: {
            outDir: 'dist',
        },
    };
});
