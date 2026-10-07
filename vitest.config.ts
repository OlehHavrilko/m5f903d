import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    reporters: ['default'],
    // The branch sweep builds every procedural level and walks every vertex,
    // which is CPU-heavy but has no GPU dependency; 5 s is too tight for it.
    testTimeout: 20000,
  },
});
