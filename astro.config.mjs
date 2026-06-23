// @ts-check
import { defineConfig } from 'astro/config';

// User GitHub Pages site (dingtianding.github.io) deploys at the domain root,
// so the base path stays "/". `site` is set for correct canonical/asset URLs.
export default defineConfig({
  site: 'https://dingtianding.github.io',
  base: '/',
});
