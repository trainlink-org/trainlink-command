import { defineConfig } from 'vitest/config';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [Vue()],
    test: {
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html', 'cobertura'],
        },
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        root: './',
        environment: 'jsdom',
    },
});
