import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.js', '**/*.d.ts', 'vitest.config.ts'],
    },
    setupFiles: ['test/setupFiles/hexo.ts'],
  },
});
