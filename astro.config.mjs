import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mingchuan.net',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'material-theme-lighter',
    },
  },
});
