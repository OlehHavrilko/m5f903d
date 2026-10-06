import { defineConfig } from 'vite';

// Core + spine live in the main bundle; each branch is a dynamic import()
// so it is emitted as a separate chunk (see docs/M0-design-plan.md §6.1).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      // Multi-page build: the JS-free text guide is a first-class entry.
      input: {
        main: 'index.html',
        guide: 'guide/index.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          return undefined;
        },
      },
    },
  },
});
