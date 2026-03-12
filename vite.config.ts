import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueSigPlot',
      formats: ['es', 'umd'],
      fileName: (format) => `vue-sigplot.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'sigplot'],
      output: {
        globals: {
          vue: 'Vue',
          sigplot: 'sigplot',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    testTimeout: 30000,
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--no-warnings'],
      },
    },
  },
});
