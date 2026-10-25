// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static (fast, cheap). Only /api/notes runs on demand, as a Vercel function.
export default defineConfig({
  // Change this to your custom domain if you add one later.
  site: 'https://larryjay.vercel.app',
  output: 'static',
  adapter: vercel(),
});
