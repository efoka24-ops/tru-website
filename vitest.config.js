/**
 * Configuration Vitest
 * Pour les tests unitaires du projet
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Framework
    globals: true,
    environment: 'jsdom',
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },

    // Test files
    include: ['tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Reporters
    reporters: ['verbose'],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json'
    },

    // Test isolation
    isolate: true,
    threads: true,
    maxThreads: 4,
    minThreads: 1
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
