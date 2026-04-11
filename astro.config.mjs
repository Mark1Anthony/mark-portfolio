import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mark1anthony.github.io',
  base: '/mark-portfolio',
  integrations: [tailwind()],
  output: 'static',
  trailingSlash: 'always',
});
