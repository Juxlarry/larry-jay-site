// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static (fast, cheap). Only /api/notes runs on demand, as a Vercel function.
export default defineConfig({
  // Custom domain (set up in Vercel > Settings > Domains).
  site: 'https://larry-jay.com',
  output: 'static',
  adapter: vercel(),
});
