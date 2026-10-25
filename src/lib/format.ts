import data from '../data/portfolio.json';

export type Project = (typeof data.projects)[number] & {
  gallery?: { src: string; alt: string; caption: string }[];
  problem?: string;
  solution?: string;
  outcomes?: { value: string; label: string; verified?: boolean }[];
  highlights?: string[];
  private?: boolean;
  links?: { live?: string; repo?: string };
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-05" -> "May 2026", "2026" -> "2026" */
export function fmtDate(v?: string | null): string {
  if (!v) return '';
  const [y, m] = String(v).split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export function fmtPeriod(p?: { start?: string | null; end?: string | null }): string {
  if (!p || (!p.start && !p.end)) return '';
  return fmtDate(p.start) + (p.end ? ` - ${fmtDate(p.end)}` : ' - Present');
}

/** Drops placeholder values like "[confirm]" that haven't been filled in yet. */
export const isFilled = (s?: string | null): s is string => !!s && !/^\[/.test(s);

export const projects = data.projects as Project[];
export const featured = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
export const caseUrl = (p: Project) => `/work/${p.id}/`;
