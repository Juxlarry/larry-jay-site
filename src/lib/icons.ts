// Phosphor icons (regular weight), read from the installed package at build time.
// Nothing here ships to the browser unless a page inlines the SVG.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('node_modules/@phosphor-icons/core/assets/regular');
const cache = new Map<string, string>();

export function iconSvg(name: string): string {
  if (!cache.has(name)) {
    const file = path.join(dir, `${name}.svg`);
    cache.set(name, fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : '');
  }
  return cache.get(name)!;
}

/** The icon's paths without the outer <svg>, for nesting inside another SVG. */
export function iconInner(name: string): string {
  return iconSvg(name).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}
