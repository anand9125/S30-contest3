import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 10000,
    sequence: {
      shuffle: false, // Run tests in order
    },
  },
});
