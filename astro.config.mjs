// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
  ],

  site: 'https://nenamaga-website.pages.dev',
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto',
  },
});