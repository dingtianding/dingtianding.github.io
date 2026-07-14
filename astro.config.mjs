// @ts-check
import { defineConfig } from 'astro/config';

// User GitHub Pages site (dingtianding.github.io) deploys at the domain root,
// so the base path stays "/". `site` is set for correct canonical/asset URLs.
// Sitemap is a hand-maintained public/sitemap.xml (9 stable routes) rather than
// the @astrojs/sitemap integration, which mismatched the Astro 4.16 build hook.
export default defineConfig({
  site: 'https://dingtianding.github.io',
  base: '/',
});
