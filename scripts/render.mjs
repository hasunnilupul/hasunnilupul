// Renders the profile README's images in the portfolio's look (nilupulperera.dev):
// same palette, fonts, sparkles and squiggles, in a dark and a light variant.
//
//   node scripts/render.mjs            static art + live GitHub cards (needs GITHUB_TOKEN)
//   node scripts/render.mjs --sample   same, with sample GitHub data (for local previews)
//   node scripts/render.mjs --static   static art only (header, section titles, stack, ...)
//
// The live cards and the "Latest activity" list in README.md are refreshed daily
// by .github/workflows/profile.yml.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGIN = 'hasunnilupul';
const args = new Set(process.argv.slice(2));

// ---------------------------------------------------------------------------
// Content — kept in step with the portfolio
// ---------------------------------------------------------------------------

const FEATURED = [
  {
    name: 'Micro Loan Manager',
    tag: 'Full-stack Web App',
    summary: 'A loan management system for microfinance teams, from borrower onboarding through repayment, delinquency tracking and portfolio reporting.',
    image: 'microloan-overview.jpg',
    stack: ['React', 'TypeScript', 'NestJS', 'PostgreSQL'],
    cta: 'Live demo ↗',
  },
  { repo: 'kiln', tag: 'Open Source' },
  { repo: 'personal-finance-tracker', tag: 'Web App' },
  { repo: 'web-image-compressor', tag: 'Tool' },
];

const EXPERIENCE = [
  {
    role: 'Senior Software Engineer',
    company: 'Focalid Technologies · Mirigama, Sri Lanka',
    date: 'Feb 2025 — Present',
    color: 'accent',
    points: [
      'Built responsive, accessible UI with React.js and Tailwind CSS, reaching WCAG 2.1 compliance.',
      'Shipped interactive data visualizations and geospatial mapping with D3.js and React-Leaflet.',
      'Integrated WebSockets for live updates and notifications.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Virtusa · Colombo, Sri Lanka',
    date: 'Jan 2024 — Feb 2025',
    color: 'pink',
    points: [
      'Rewrote and modernized a legacy enterprise application with an international team.',
      'Optimized HTTP handling with Axios and RTK Query, and led code reviews.',
    ],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Virtusa · Colombo, Sri Lanka',
    date: 'Mar 2022 — Dec 2023',
    color: 'cyan',
    points: [
      'Revamped a user data management application used by thousands of users.',
      'Configured CI/CD pipelines on AWS for automated deployments.',
    ],
  },
];

const CREDENTIALS = [
  { label: 'Education', title: "Bachelor's in Software Engineering", meta: 'IIC University of Technology · 2021 – 2024' },
  { label: 'Certification', title: 'AWS Developer – Associate', meta: 'Amazon Web Services' },
];

const ALSO = ['jQuery', 'Vuex', 'Pinia', 'WebSocket', 'D3.js', 'React-Leaflet', 'NestJS', 'Postman'];

const CONNECT = [
  { id: 'portfolio', label: 'Portfolio', color: 'accent', primary: true },
  { id: 'linkedin', label: 'LinkedIn', color: 'cyan' },
  { id: 'medium', label: 'Medium', color: 'pink' },
  { id: 'devto', label: 'DEV', color: 'accent' },
  { id: 'email', label: 'Email', color: 'cyan' },
  { id: 'resume', label: 'Resume', color: 'pink' },
];

const SECTIONS = {
  about: ['01 / About', 'About Me'],
  experience: ['02 / Experience', "Where I've Worked"],
  stack: ['03 / Skills', 'My Skills'],
  projects: ['04 / Projects', 'Featured Projects'],
  github: ['05 / GitHub', 'On GitHub'],
  activity: ['06 / Activity', 'Latest Activity'],
  connect: ['07 / Contact', "Let's Work Together"],
};

// ---------------------------------------------------------------------------
// Design tokens (src/index.css in the portfolio)
// ---------------------------------------------------------------------------

const THEMES = {
  dark: {
    bg: '#0D0D10', card: '#17181C', text: '#F5F5F2', muted: '#A8ACB4', dim: '#6E7280',
    accent: '#C6FF3D', pink: '#E85FD0', cyan: '#46D2E8',
    accentInk: '#C6FF3D', pinkInk: '#E85FD0', cyanInk: '#46D2E8',
    border: 'rgba(255,255,255,0.08)', borderLoud: 'rgba(255,255,255,0.14)',
    onAccent: '#0D0D10', glow: 0.16,
    heat: ['#1F2126', '#33500F', '#5C8C18', '#92C62A', '#C6FF3D'],
    icons: { next: 'nextjs-dark.svg', aws: 'aws-light.svg', tanstack: 'tanstack-query-dark.svg' },
  },
  light: {
    bg: '#F7F4EC', card: '#FFFFFF', text: '#16181C', muted: '#5B5F68', dim: '#656B7A',
    accent: '#C6FF3D', pink: '#E85FD0', cyan: '#46D2E8',
    accentInk: '#3F6B0A', pinkInk: '#B8269E', cyanInk: '#08708A',
    border: 'rgba(20,20,20,0.08)', borderLoud: 'rgba(20,20,20,0.14)',
    onAccent: '#16181C', glow: 0.22,
    heat: ['#ECE8DD', '#DCF4A2', '#AEDD4F', '#77A81C', '#3F6B0A'],
    icons: { next: 'nextjs-light.svg', aws: 'aws-dark.svg', tanstack: 'tanstack-query-light.svg' },
  },
};

const W = 880; // every image shares one width so they scale together in the README
const HALF_H = 252; // half-width cards sit side by side, so they share a height

const FONTS = {
  display: ['Baloo 2', [['baloo-2-latin-700-normal.woff2', 700], ['baloo-2-latin-800-normal.woff2', 800]]],
  marker: ['Permanent Marker', [['permanent-marker-latin-400-normal.woff2', 400]]],
  sans: ['Manrope', [['manrope-latin-500-normal.woff2', 500], ['manrope-latin-600-normal.woff2', 600], ['manrope-latin-700-normal.woff2', 700]]],
  mono: ['IBM Plex Mono', [['ibm-plex-mono-latin-400-normal.woff2', 400], ['ibm-plex-mono-latin-500-normal.woff2', 500]]],
};
const FAMILY = {
  display: "'Baloo 2', sans-serif",
  marker: "'Permanent Marker', cursive",
  sans: "'Manrope', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const PATHS = {
  sparkle: 'M12 2l1.2 4.6L18 8l-4.8 1.4L12 14l-1.2-4.6L6 8l4.8-1.4z',
  star: 'M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4 5.7 21 8 13.8 2 9.2h7.6z',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
};

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

const cache = new Map();
const b64 = (file) => {
  if (!cache.has(file)) cache.set(file, readFileSync(join(ROOT, 'scripts', file)).toString('base64'));
  return cache.get(file);
};
const MIME = { png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2' };
const dataUri = (file) => `data:${MIME[file.split('.').pop()]};base64,${b64(file)}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Embeds only the font files a drawing actually uses, so each SVG stays small.
const CLASS_KIND = { d: 'display', k: 'marker', s: 'sans', m: 'mono' };
function fontCss(body) {
  const used = new Set();
  for (const [, cls, weight] of body.matchAll(/class="(\w)" font-size="[\d.]+" font-weight="(\d+)"/g)) used.add(`${CLASS_KIND[cls]}:${weight}`);
  return Object.entries(FONTS).flatMap(([kind, [family, files]]) => files
    .filter(([, weight]) => used.has(`${kind}:${weight}`))
    .map(([file, weight]) =>
      `@font-face{font-family:'${family}';font-weight:${weight};src:url(${dataUri(`fonts/${file}`)}) format('woff2')}`)).join('');
}

function svg({ h, title, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${fontCss(body)}
.d{font-family:${FAMILY.display}}.m{font-family:${FAMILY.mono}}.s{font-family:${FAMILY.sans}}.k{font-family:${FAMILY.marker}}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
${body}
</svg>
`;
}

const text = (x, y, content, { cls = 's', size = 14, weight = 500, fill, anchor, ls, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}${ls ? ` letter-spacing="${ls}"` : ''}${extra}>${content}</text>`;

const icon = (path, x, y, size, attrs) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${path}" ${attrs}/></g>`;

const glow = (id, cx, cy, r, color, opacity) =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${r / 3.4}"/></filter>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" filter="url(#${id})"/>`;

const card = (t, x, y, w, h, r = 18, stroke = t.border) =>
  `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="${r}" fill="${t.card}" stroke="${stroke}" stroke-width="1.5"/>`;

// Rough advance widths (in em) so titles can be followed by a sparkle and
// copy can be wrapped without a layout engine.
function measure(str, size, kind = 'sans') {
  const base = { display: 0.48, sans: 0.5, mono: 0.6, marker: 0.46 }[kind];
  let w = 0;
  for (const ch of str) {
    if (kind === 'mono') { w += 0.6; continue; }
    if (ch === ' ') w += 0.26;
    else if ('il.,:;\'|!'.includes(ch)) w += 0.26;
    else if ('mwMW'.includes(ch)) w += base + 0.32;
    else if (/[A-Z0-9]/.test(ch)) w += base + 0.12;
    else w += base;
  }
  return w * size;
}

function wrap(str, width, size, kind = 'sans', maxLines = 3) {
  const words = String(str).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next, size, kind) <= width || !line) line = next;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S+$/, '') + '…';
  }
  return lines;
}

const ago = (iso) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [u, n] of units) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return 'just now';
};
const fmt = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString('en-US'));

// ---------------------------------------------------------------------------
// Static art
// ---------------------------------------------------------------------------

function header(t) {
  const h = 420;
  const code = [
    [['const', t.pinkInk], [' engineer = {', t.text]],
    [['  name: ', t.text], ['"Nilupul Perera"', t.accentInk], [',', t.text]],
    [['  role: ', t.text], ['"Senior Software Engineer"', t.accentInk], [',', t.text]],
    [['  stack: [', t.text], ['"React"', t.accentInk], [', ', t.text], ['"Next.js"', t.accentInk], [', ', t.text], ['"Vue"', t.accentInk], ['],', t.text]],
    [['  focus: ', t.text], ['"clean, accessible UI"', t.accentInk], [',', t.text]],
    [['  status: ', t.text], ['"available"', t.accentInk]],
    [['};', t.text]],
  ];
  const cx = 532, cy = 64, cw = 316, ch = 270;
  const codeLines = code.map((parts, i) =>
    `<text x="${cx + 22}" y="${cy + 80 + i * 25}" class="m" font-size="12.5" xml:space="preserve">${parts
      .map(([s, c]) => `<tspan fill="${c}">${esc(s)}</tspan>`).join('')}</text>`).join('\n');
  const stack = ['React', 'Next.js', 'Vue', 'TypeScript', 'WebSocket'];
  let sx = 48;
  const stackLine = stack.map((s, i) => {
    const out = text(sx, 376, esc(s), { cls: 'm', size: 13, weight: 400, fill: t.dim })
      + (i < stack.length - 1 ? `<circle cx="${sx + measure(s, 13, 'mono') + 10}" cy="372" r="2.4" fill="${t.accent}"/>` : '');
    sx += measure(s, 13, 'mono') + 20;
    return out;
  }).join('');

  return svg({
    h, title: 'Hey, I am Nilupul Perera, Senior Software Engineer',
    css: `@keyframes blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}.cur{animation:blink 1.1s steps(1) infinite}
@keyframes pulse{0%{r:3.5;opacity:.9}100%{r:10;opacity:0}}.pulse{animation:pulse 1.8s ease-out infinite}`,
    body: `<defs><clipPath id="clip"><rect width="${W}" height="${h}" rx="24"/></clipPath></defs>
<g clip-path="url(#clip)">
<rect width="${W}" height="${h}" fill="${t.bg}"/>
${glow('g1', 30, 70, 170, t.cyan, t.glow)}
${glow('g2', W - 10, h + 10, 150, t.pink, t.glow * 0.9)}
</g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${h - 1.5}" rx="23.5" fill="none" stroke="${t.border}" stroke-width="1.5"/>
${text(48, 96, 'Hey, I’m', { cls: 'k', size: 24, weight: 400, fill: t.accentInk })}
<path d="M${48 + measure('Hey, I’m', 24, 'marker') + 12} 90c4-6 12-6 16 0" fill="none" stroke="${t.accentInk}" stroke-width="2.4" stroke-linecap="round"/>
${text(44, 186, `NILUPUL<tspan fill="${t.accent}">.</tspan>`, { cls: 'd', size: 96, weight: 800, fill: t.text, ls: '1' })}
${text(48, 236, 'Senior Software Engineer', { cls: 'd', size: 32, weight: 700, fill: t.text })}
<path d="M52 256 Q85 251 115 256 T180 256 T245 256 T308 256" fill="none" stroke="${t.pink}" stroke-width="3" stroke-linecap="round"/>
${['I build fast, accessible, production-grade interfaces', 'with React, Next.js, Vue and Angular — real-time', 'data, WebSockets and all.']
    .map((l, i) => text(48, 292 + i * 23, l, { size: 15.5, weight: 600, fill: t.muted })).join('\n')}
${stackLine}
${card(t, cx, cy, cw, ch, 18, t.borderLoud)}
<line x1="${cx + 1.5}" y1="${cy + 44}" x2="${cx + cw - 1.5}" y2="${cy + 44}" stroke="${t.border}" stroke-width="1"/>
<circle cx="${cx + 24}" cy="${cy + 22}" r="5.5" fill="#FF5F57"/><circle cx="${cx + 42}" cy="${cy + 22}" r="5.5" fill="#FEBC2E"/><circle cx="${cx + 60}" cy="${cy + 22}" r="5.5" fill="#28C840"/>
${text(cx + 78, cy + 26, 'profile.ts', { cls: 'm', size: 12, weight: 400, fill: t.dim })}
${codeLines}
<rect class="cur" x="${cx + 22 + measure('};', 12.5, 'mono') + 4}" y="${cy + 80 + 6 * 25 - 12}" width="7.5" height="15" fill="${t.accent}"/>
<circle cx="${cx + cw - 30}" cy="${cy + 80 + 5 * 25 - 4}" r="3.5" fill="#28C840"/>
<circle class="pulse" cx="${cx + cw - 30}" cy="${cy + 80 + 5 * 25 - 4}" r="3.5" fill="none" stroke="#28C840" stroke-width="1.5"/>
${icon(PATHS.bolt, cx + cw - 28, cy - 18, 34, `fill="${t.accent}"`)}
${icon(PATHS.star, cx - 22, cy + ch - 16, 26, `fill="none" stroke="${t.pink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`)}
${text(cx + cw - 16, cy + ch + 40, 'Ship often :)', { cls: 'k', size: 17, weight: 400, fill: t.cyanInk, anchor: 'end', extra: ` transform="rotate(-3 ${cx + cw - 70} ${cy + ch + 36})"` })}
${icon(PATHS.sparkle, W - 54, 24, 20, `fill="${t.pink}"`)}
<path d="M22 300 Q26 290 22 280 T22 260" fill="none" stroke="${t.cyan}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`,
  });
}

function sectionTitle(t, [label, title]) {
  const h = 92;
  const tw = measure(title, 36, 'display');
  return svg({
    h, title,
    body: `<line x1="0" y1="1" x2="${W}" y2="1" stroke="${t.border}" stroke-width="1.5"/>
${text(2, 40, esc(label.toUpperCase()), { cls: 'm', size: 13, weight: 500, fill: t.accentInk, ls: '1.8' })}
${text(0, 82, esc(title), { cls: 'd', size: 36, weight: 700, fill: t.text })}
${icon(PATHS.sparkle, tw + 10, 52, 22, `fill="${t.accent}"`)}`,
  });
}

function experience(t) {
  const blocks = [];
  let y = 28;
  EXPERIENCE.forEach((job, i) => {
    const ink = t[`${job.color}Ink`];
    const pts = job.points.flatMap((p) => wrap(p, 640, 14.5).map((l, j) => ({ l, first: j === 0 })));
    const blockH = 74 + pts.length * 23;
    const dw = measure(job.date, 12, 'mono') + 26;
    blocks.push(`<circle cx="44" cy="${y + 20}" r="7" fill="${t[job.color]}"/>
<circle cx="44" cy="${y + 20}" r="12" fill="none" stroke="${t[job.color]}" stroke-opacity=".35" stroke-width="1.5"/>
${i < EXPERIENCE.length - 1 ? `<line x1="44" y1="${y + 36}" x2="44" y2="${y + blockH + 6}" stroke="${t.borderLoud}" stroke-width="2" stroke-dasharray="3 5"/>` : ''}
${text(76, y + 27, esc(job.role), { cls: 'd', size: 23, weight: 700, fill: t.text })}
${text(76, y + 51, esc(job.company), { cls: 'm', size: 12.5, weight: 400, fill: t.dim })}
<rect x="${W - 40 - dw}" y="${y + 6}" width="${dw}" height="28" rx="14" fill="none" stroke="${ink}" stroke-width="1.5"/>
${text(W - 40 - dw / 2, y + 24.5, esc(job.date), { cls: 'm', size: 12, weight: 500, fill: ink, anchor: 'middle' })}
${pts.map((p, j) => `${p.first ? `<circle cx="82" cy="${y + 78 + j * 23}" r="2.6" fill="${ink}"/>` : ''}${text(94, y + 83 + j * 23, esc(p.l), { size: 14.5, weight: 500, fill: t.muted })}`).join('\n')}`);
    y += blockH + 22;
  });
  const credY = y + 4;
  const cw = (W - 16) / 2;
  const creds = CREDENTIALS.map((c, i) => {
    const x = i * (cw + 16);
    return `${card(t, x, credY, cw, 92, 16)}
${text(x + 22, credY + 30, esc(c.label.toUpperCase()), { cls: 'm', size: 11.5, weight: 500, fill: i ? t.pinkInk : t.cyanInk, ls: '1.4' })}
${text(x + 22, credY + 56, esc(c.title), { cls: 'd', size: 18, weight: 700, fill: t.text })}
${text(x + 22, credY + 77, esc(c.meta), { size: 13, weight: 500, fill: t.dim })}`;
  }).join('\n');
  const h = credY + 94;
  return svg({
    h, title: 'Work experience: Senior Software Engineer at Focalid Technologies, Software Engineer and Associate Software Engineer at Virtusa',
    body: `${card(t, 0, 0, W, credY - 16, 20)}
${blocks.join('\n')}
${creds}`,
  });
}

function stack(t) {
  const reactSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.2" fill="#61DAFB"/><g stroke="#61DAFB" stroke-width="1"><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/></g></svg>`;
  const angularSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#DD0031" d="M12 2l9 3.2-1.4 12L12 22l-7.6-4.8L3 5.2z"/><path fill="#FFFFFF" d="M12 4.2 6.7 15.8h2l1-2.5h4.6l1 2.5h2L12 4.2zm0 3.6 1.6 4H10.4z"/></svg>`;
  const inline = (s) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;
  const SKILLS = [
    ['JavaScript', '#F7DF1E', { file: 'icons/javascript.png' }],
    ['TypeScript', '#3178C6', { file: 'icons/typescript.png' }],
    ['React', '#61DAFB', { uri: inline(reactSvg), size: 42 }],
    ['Next.js', null, { file: `icons/${t.icons.next}` }],
    ['Vue.js', '#42B883', { file: 'icons/vue.svg' }],
    ['Angular', '#DD0031', { uri: inline(angularSvg) }],
    ['Redux', '#764ABC', { file: 'icons/redux.png' }],
    ['Git', '#F0503C', { file: 'icons/git.png' }],
    ['AWS', '#FF9900', { file: `icons/${t.icons.aws}`, w: 46, h: 28 }],
    ['Firebase', '#FFCA28', { file: 'icons/firebase.png' }],
    ['SCSS', '#CC6699', { label: 'Sass' }],
    ['TanStack Query', '#EEEBD4', { file: `icons/${t.icons.tanstack}`, size: 60 }],
  ];
  const cols = 6, box = 80, colW = W / cols;
  const tiles = SKILLS.map(([name, color, ic], i) => {
    const x = (i % cols) * colW + (colW - box) / 2, y = Math.floor(i / cols) * 128;
    const fill = color ? `${color}1A` : t.bg;
    const stroke = color ? `${color}55` : t.borderLoud;
    const iw = ic.w ?? ic.size ?? 36, ih = ic.h ?? ic.size ?? 36;
    const inner = ic.label
      ? text(x + box / 2, y + 47, ic.label, { cls: 'd', size: 21, weight: 800, fill: color, anchor: 'middle' })
      : `<image href="${ic.uri ?? dataUri(ic.file)}" x="${x + (box - iw) / 2}" y="${y + (box - ih) / 2}" width="${iw}" height="${ih}"/>`;
    return `<rect x="${x + 0.75}" y="${y + 0.75}" width="${box - 1.5}" height="${box - 1.5}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
${inner}
${text(x + box / 2, y + box + 22, esc(name), { size: 12.5, weight: 600, fill: t.muted, anchor: 'middle' })}`;
  }).join('\n');

  const chipY = 2 * 128 + 50;
  let cx = (colW - box) / 2;
  const chips = ALSO.map((c) => {
    const w = measure(c, 13, 'sans') + 34;
    const out = `<rect x="${cx + 0.75}" y="${chipY + 0.75}" width="${w - 1.5}" height="36" rx="18" fill="none" stroke="${t.borderLoud}" stroke-width="1.5"/>
${text(cx + w / 2, chipY + 23, esc(c), { size: 13, weight: 600, fill: t.muted, anchor: 'middle' })}`;
    cx += w + 10;
    return out;
  }).join('\n');

  return svg({
    h: chipY + 40, title: `Skills: ${SKILLS.map((s) => s[0]).join(', ')}. Also comfortable with ${ALSO.join(', ')}.`,
    body: `${tiles}
${text((colW - box) / 2, chipY - 16, 'ALSO COMFORTABLE WITH', { cls: 'm', size: 12, weight: 400, fill: t.dim, ls: '1.2' })}
${chips}`,
  });
}

function button(t, { label, color, primary }) {
  const glyphs = {
    Portfolio: '<path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/><circle cx="12" cy="12" r="8"/>',
    LinkedIn: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 11v5M8 8v.01M12 16v-5M12 13a2 2 0 0 1 4 0v3"/>',
    Medium: '<circle cx="8" cy="12" r="4"/><ellipse cx="15.5" cy="12" rx="2" ry="4"/><path d="M20 8.5v7"/>',
    DEV: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10v4h1a2 2 0 0 0 0-4zM12.5 10h-1.5v4h1.5M11 12h1.2M15 10l1 4 1-4"/>',
    Email: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    Resume: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  };
  const w = measure(label, 15, 'sans') + 84, h = 50;
  const ink = primary ? t.onAccent : t.text;
  return {
    w,
    body: svgButton(t, w, h, label, ink, color, primary, glyphs[label]),
  };
}

function svgButton(t, w, h, label, ink, color, primary, glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>${fontCss(text(0, 0, '', { weight: 700 }))}.s{font-family:${FAMILY.sans}}</style>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${primary ? t.accent : t.card}" stroke="${primary ? t.accent : t[`${color}Ink`]}" stroke-width="2"/>
<g transform="translate(22 ${h / 2 - 10}) scale(${20 / 24})" fill="none" stroke="${primary ? ink : t[`${color}Ink`]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
${text(52, h / 2 + 5.5, esc(label), { size: 15, weight: 700, fill: ink })}
</svg>
`;
}

function footer(t) {
  return svg({
    h: 120, title: 'Design. Develop. Ship.',
    body: `<line x1="0" y1="1" x2="${W}" y2="1" stroke="${t.border}" stroke-width="1.5"/>
${text(W / 2, 72, `Design<tspan fill="${t.accent}">.</tspan> Develop<tspan fill="${t.pink}">.</tspan> Ship<tspan fill="${t.cyan}">.</tspan>`, { cls: 'd', size: 34, weight: 800, fill: t.text, anchor: 'middle' })}
${text(W / 2, 104, 'thanks for stopping by :)', { cls: 'k', size: 15, weight: 400, fill: t.dim, anchor: 'middle' })}
${icon(PATHS.sparkle, W / 2 + 184, 30, 20, `fill="${t.accent}"`)}
${icon(PATHS.star, W / 2 - 212, 44, 22, `fill="none" stroke="${t.pink}" stroke-width="2" stroke-linejoin="round"`)}`,
  });
}

// ---------------------------------------------------------------------------
// GitHub data
// ---------------------------------------------------------------------------

const QUERY = `query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name description url pushedAt stargazerCount forkCount
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
      }
    }
    pullRequests { totalCount }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalPullRequestReviewContributions restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { authorization: `bearer ${process.env.GITHUB_TOKEN}`, 'user-agent': LOGIN, ...init.headers },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchGitHub() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set (use --sample for a local preview)');
  const { data, errors } = await gh('/graphql', { method: 'POST', body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }) });
  if (errors) throw new Error(JSON.stringify(errors));
  const events = await gh(`/users/${LOGIN}/events/public?per_page=60`);
  return { user: data.user, events };
}

function sampleData() {
  const day = 86400000, now = Date.now();
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const weeks = Array.from({ length: 53 }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => {
      const r = rand(), busy = Math.sin(w / 6) + 1.2;
      return { date: new Date(now - ((52 - w) * 7 + (6 - d)) * day).toISOString().slice(0, 10), contributionCount: r < 0.28 ? 0 : Math.floor(r * busy * 9) };
    }),
  }));
  const repo = (name, description, lang, color, stars, daysAgo) => ({
    name, description, url: `https://github.com/${LOGIN}/${name}`, pushedAt: new Date(now - daysAgo * day).toISOString(),
    stargazerCount: stars, forkCount: Math.floor(stars / 3), primaryLanguage: { name: lang, color },
    languages: { edges: [{ size: 50000 + stars * 9000, node: { name: lang, color } }, { size: 9000, node: { name: 'CSS', color: '#663399' } }] },
  });
  return {
    user: {
      followers: { totalCount: 48 },
      repositories: {
        totalCount: 42,
        nodes: [
          repo('kiln', 'Sample description — the live card pulls the real one from GitHub.', 'TypeScript', '#3178c6', 6, 0.2),
          repo('personal-finance-tracker', 'Sample description for the personal finance tracker.', 'TypeScript', '#3178c6', 3, 0.5),
          repo('grocerry-flow', 'Sample description.', 'Vue', '#41b883', 2, 6),
          repo('web-image-compressor', 'Sample description for the image compressor.', 'JavaScript', '#f1e05a', 4, 129),
          repo('finance-managaer-backend', 'Sample description.', 'PHP', '#4F5D95', 1, 199),
          repo('shorty', 'Sample description.', 'Go', '#00ADD8', 2, 266),
          repo('movana', 'Sample description.', 'JavaScript', '#f1e05a', 1, 267),
        ],
      },
      pullRequests: { totalCount: 214 },
      contributionsCollection: {
        totalCommitContributions: 1043, totalPullRequestContributions: 96, totalIssueContributions: 21,
        totalPullRequestReviewContributions: 58, restrictedContributionsCount: 0,
        contributionCalendar: { totalContributions: weeks.flatMap((w) => w.contributionDays).reduce((a, d) => a + d.contributionCount, 0), weeks },
      },
    },
    events: [
      { type: 'PushEvent', repo: { name: `${LOGIN}/kiln` }, payload: { size: 3, ref: 'refs/heads/main' }, created_at: new Date(now - 0.1 * day).toISOString() },
      { type: 'PullRequestEvent', repo: { name: `${LOGIN}/personal-finance-tracker` }, payload: { action: 'opened', number: 12, pull_request: { title: 'Sample pull request title', html_url: '#' } }, created_at: new Date(now - 0.4 * day).toISOString() },
      { type: 'CreateEvent', repo: { name: `${LOGIN}/grocerry-flow` }, payload: { ref_type: 'repository' }, created_at: new Date(now - 6 * day).toISOString() },
      { type: 'WatchEvent', repo: { name: 'vitejs/vite' }, payload: {}, created_at: new Date(now - 8 * day).toISOString() },
    ],
  };
}

function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
  // Today may not have contributions yet; don't break the streak for it.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount) current++;
    else if (i !== days.length - 1) break;
  }
  return { current, longest };
}

// ---------------------------------------------------------------------------
// GitHub cards
// ---------------------------------------------------------------------------

function statsCard(t, user) {
  const c = user.contributionsCollection;
  const days = c.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const { current, longest } = streaks(days);
  const stars = user.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0);
  const tiles = [
    ['Contributions', c.contributionCalendar.totalContributions, 'accent', 'last 12 months'],
    ['Commits', c.totalCommitContributions + c.restrictedContributionsCount, 'pink', 'last 12 months'],
    ['Pull requests', user.pullRequests.totalCount, 'cyan', 'all time'],
    ['Reviews', c.totalPullRequestReviewContributions, 'accent', 'last 12 months'],
    ['Current streak', `${current}d`, 'pink', `longest ${longest}d`],
    ['Stars earned', stars, 'cyan', `${user.repositories.totalCount} public repos`],
  ];
  const cols = 3, tw = (W - 16 * (cols - 1)) / cols, th = 116;
  const body = tiles.map(([label, value, color, note], i) => {
    const x = (i % cols) * (tw + 16), y = Math.floor(i / cols) * (th + 16);
    return `${card(t, x, y, tw, th, 18)}
<rect x="${x + 22}" y="${y + 22}" width="22" height="4" rx="2" fill="${t[color]}"/>
${text(x + 22, y + 48, esc(label.toUpperCase()), { cls: 'm', size: 11.5, weight: 500, fill: t.dim, ls: '1.2' })}
${text(x + 20, y + 90, typeof value === 'number' ? fmt(value) : esc(value), { cls: 'd', size: 40, weight: 800, fill: t[`${color}Ink`] })}
${text(x + tw - 22, y + 88, esc(note), { size: 12.5, weight: 600, fill: t.muted, anchor: 'end' })}`;
  }).join('\n');
  return svg({
    h: 2 * th + 16,
    title: tiles.map(([l, v, , n]) => `${l}: ${v} (${n})`).join('; '),
    body,
  });
}

function calendarCard(t, user) {
  const cal = user.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.slice(-53);
  const all = weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => all[Math.floor((all.length - 1) * p)] ?? 1;
  const level = (n) => (!n ? 0 : n <= q(0.25) ? 1 : n <= q(0.5) ? 2 : n <= q(0.8) ? 3 : 4);
  const size = 12, gap = 3, x0 = 52, y0 = 76;
  const months = [];
  const cells = weeks.map((w, wi) => {
    const first = w.contributionDays[0];
    const m = new Date(first.date).getUTCMonth();
    if (wi < weeks.length - 2 && (wi === 0 ? new Date(first.date).getUTCDate() <= 7 : m !== new Date(weeks[wi - 1].contributionDays[0].date).getUTCMonth())) {
      months.push(text(x0 + wi * (size + gap), y0 - 12, new Date(first.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), { cls: 'm', size: 11, weight: 400, fill: t.dim }));
    }
    return w.contributionDays.map((d) => {
      const di = new Date(d.date).getUTCDay();
      return `<rect x="${x0 + wi * (size + gap)}" y="${y0 + di * (size + gap)}" width="${size}" height="${size}" rx="3" fill="${t.heat[level(d.contributionCount)]}"/>`;
    }).join('');
  }).join('\n');
  const dayLabels = [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']].map(([d, l]) => text(22, y0 + d * (size + gap) + 10, l, { cls: 'm', size: 10.5, weight: 400, fill: t.dim })).join('');
  const ly = y0 + 7 * (size + gap) + 22;
  const legend = t.heat.map((c, i) => `<rect x="${W - 168 + i * 16}" y="${ly - 10}" width="12" height="12" rx="3" fill="${c}"/>`).join('');
  const h = ly + 24;
  return svg({
    h,
    title: `${cal.totalContributions} contributions in the last year`,
    body: `${card(t, 0, 0, W, h, 20)}
${text(24, 40, `${fmt(cal.totalContributions)} contributions`, { cls: 'd', size: 22, weight: 700, fill: t.text })}
${text(24 + measure(`${fmt(cal.totalContributions)} contributions`, 22, 'display') + 10, 40, 'in the last year', { size: 13.5, weight: 600, fill: t.muted })}
${icon(PATHS.sparkle, W - 46, 20, 20, `fill="${t.pink}"`)}
${months.join('')}
${dayLabels}
${cells}
${text(W - 176, ly, 'Less', { cls: 'm', size: 11, weight: 400, fill: t.dim, anchor: 'end' })}${legend}${text(W - 84, ly, 'More', { cls: 'm', size: 11, weight: 400, fill: t.dim })}`,
  });
}

function languagesCard(t, user) {
  const totals = new Map();
  for (const r of user.repositories.nodes) {
    for (const { size, node } of r.languages.edges) {
      const cur = totals.get(node.name) ?? { size: 0, color: node.color };
      cur.size += size;
      totals.set(node.name, cur);
    }
  }
  const sorted = [...totals].sort((a, b) => b[1].size - a[1].size);
  const top = sorted.slice(0, 7);
  const rest = sorted.slice(7).reduce((a, [, v]) => a + v.size, 0);
  if (rest) top.push(['Other', { size: rest, color: t.dim }]);
  const sum = top.reduce((a, [, v]) => a + v.size, 0) || 1;
  const cw = (W - 16) / 2, bw = cw - 48;
  let bx = 24;
  const bar = top.map(([, v]) => {
    const w = (v.size / sum) * bw;
    const out = `<rect x="${bx}" y="80" width="${Math.max(w, 0)}" height="12" fill="${v.color ?? t.dim}"/>`;
    bx += w;
    return out;
  }).join('');
  const legend = top.map(([name, v], i) => {
    const x = 24 + (i % 2) * (bw / 2), y = 132 + Math.floor(i / 2) * 32;
    return `<circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${v.color ?? t.dim}"/>
${text(x + 18, y, esc(name), { size: 13.5, weight: 700, fill: t.text })}
${text(x + bw / 2 - 16, y, `${((v.size / sum) * 100).toFixed(1)}%`, { cls: 'm', size: 12, weight: 400, fill: t.dim, anchor: 'end' })}`;
  }).join('\n');
  const h = HALF_H;
  return svg({
    h,
    title: `Most used languages: ${top.map(([n, v]) => `${n} ${((v.size / sum) * 100).toFixed(1)}%`).join(', ')}`,
    body: `<defs><clipPath id="bar"><rect x="24" y="80" width="${bw}" height="12" rx="6"/></clipPath></defs>
${card(t, 0, 0, cw, h, 20)}
${text(24, 40, 'Top languages', { cls: 'd', size: 22, weight: 700, fill: t.text })}
${text(cw - 24, 39, 'by code size', { cls: 'm', size: 11.5, weight: 400, fill: t.dim, anchor: 'end' })}
<g clip-path="url(#bar)">${bar}</g>
${legend}`,
    // the card is half width; widen the canvas back to W so both halves scale alike
  }).replace(`width="${W}" height="${h}" viewBox="0 0 ${W} ${h}"`, `width="${cw}" height="${h}" viewBox="0 0 ${cw} ${h}"`);
}

function recentCard(t, user) {
  const repos = user.repositories.nodes.slice(0, 5);
  const cw = (W - 16) / 2;
  const rows = repos.map((r, i) => {
    const y = 78 + i * 36;
    const name = r.name.length > 26 ? `${r.name.slice(0, 25)}…` : r.name;
    return `<circle cx="29" cy="${y - 4}" r="5" fill="${r.primaryLanguage?.color ?? t.dim}"/>
${text(44, y, esc(name), { size: 14, weight: 700, fill: t.text })}
${r.stargazerCount ? `${icon(PATHS.star, cw - 132, y - 13, 13, `fill="${t.accentInk}"`)}${text(cw - 115, y, String(r.stargazerCount), { cls: 'm', size: 12, weight: 500, fill: t.muted })}` : ''}
${text(cw - 24, y, ago(r.pushedAt), { cls: 'm', size: 12, weight: 400, fill: t.dim, anchor: 'end' })}`;
  }).join('\n');
  const h = HALF_H;
  return svg({
    h,
    title: `Recently pushed: ${repos.map((r) => r.name).join(', ')}`,
    body: `${card(t, 0, 0, cw, h, 20)}
${text(24, 40, 'Recently pushed', { cls: 'd', size: 22, weight: 700, fill: t.text })}
${icon(PATHS.bolt, cw - 44, 20, 20, `fill="${t.accent}"`)}
${rows}`,
  }).replace(`width="${W}" height="${h}" viewBox="0 0 ${W} ${h}"`, `width="${cw}" height="${h}" viewBox="0 0 ${cw} ${h}"`);
}

const THUMBS = [
  (t) => [t.pink, t.accent],
  (t) => [t.cyan, t.pink],
  (t) => [t.accent, t.cyan],
];

function projectCard(t, p, repo, i) {
  const cw = (W - 16) / 2, th = 170;
  const name = p.name ?? repo?.name ?? p.repo;
  const summary = p.summary ?? repo?.description ?? 'Source on GitHub.';
  const lines = wrap(summary, cw - 48, 14, 'sans', 3);
  const [c1, c2] = THUMBS[i % THUMBS.length](t);
  const thumb = p.image
    ? `<image href="${dataUri(p.image)}" x="0" y="0" width="${cw}" height="${cw * 0.625}" preserveAspectRatio="xMinYMin slice" clip-path="url(#thumb${i})"/>`
    : `<rect width="${cw}" height="${th}" fill="url(#grad${i})" clip-path="url(#thumb${i})"/>
${text(cw - 26, th - 26, esc(name.split(/[-\s]/).map((s) => s[0]).join('').slice(0, 3).toUpperCase()), { cls: 'd', size: 64, weight: 800, fill: '#0D0D10', anchor: 'end', extra: ' opacity=".18"' })}
${icon(PATHS.sparkle, cw - 66, 22, 30, 'fill="#0D0D10" opacity=".25"')}`;
  const tw = measure(p.tag, 13, 'sans') + 32;
  const meta = repo
    ? `<circle cx="29" cy="${th + 152 - 4}" r="5" fill="${repo.primaryLanguage?.color ?? t.dim}"/>
${text(42, th + 152, esc(repo.primaryLanguage?.name ?? 'Code'), { size: 12.5, weight: 600, fill: t.muted })}
${icon(PATHS.star, 132, th + 152 - 12, 13, `fill="${t.accentInk}"`)}${text(149, th + 152, String(repo.stargazerCount), { cls: 'm', size: 12, weight: 500, fill: t.muted })}
${text(cw - 24, th + 152, `updated ${ago(repo.pushedAt)}`, { cls: 'm', size: 12, weight: 400, fill: t.dim, anchor: 'end' })}`
    : text(24, th + 152, esc(p.stack.join(' · ')), { cls: 'm', size: 12, weight: 400, fill: t.dim });
  const h = th + 176;
  return svg({
    h,
    title: `${name}: ${summary}`,
    body: `<defs><clipPath id="thumb${i}"><path d="M0 18a18 18 0 0 1 18-18h${cw - 36}a18 18 0 0 1 18 18v${th - 18}h-${cw}z"/></clipPath>
<linearGradient id="grad${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
${card(t, 0, 0, cw, h, 18)}
${thumb}
<rect x="14" y="14" width="${tw}" height="34" rx="17" fill="${t.bg}"/>
${text(14 + tw / 2, 36, esc(p.tag), { size: 13, weight: 600, fill: t.text, anchor: 'middle' })}
<line x1="0" y1="${th}" x2="${cw}" y2="${th}" stroke="${t.border}" stroke-width="1.5"/>
${text(24, th + 38, esc(name), { cls: 'd', size: 20, weight: 700, fill: t.text })}
${lines.map((l, j) => text(24, th + 64 + j * 22, esc(l), { size: 14, weight: 500, fill: t.muted })).join('\n')}
<line x1="24" y1="${th + 128}" x2="${cw - 24}" y2="${th + 128}" stroke="${t.border}" stroke-width="1"/>
${meta}`,
  }).replace(`width="${W}" height="${h}" viewBox="0 0 ${W} ${h}"`, `width="${cw}" height="${h}" viewBox="0 0 ${cw} ${h}"`);
}

function activityMarkdown(events) {
  const repoLink = (name) => `[${name}](https://github.com/${name})`;
  const date = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const lines = [];
  for (const e of events) {
    const r = repoLink(e.repo.name), p = e.payload ?? {};
    let line;
    switch (e.type) {
      case 'PushEvent': {
        const n = p.size ?? p.commits?.length ?? p.distinct_size;
        const branch = p.ref?.replace('refs/heads/', '');
        line = n
          ? `⚡ Pushed ${n} commit${n === 1 ? '' : 's'} to ${r}${branch ? ` \`${branch}\`` : ''}`
          : `⚡ Pushed to ${r}${branch ? ` \`${branch}\`` : ''}`;
        break;
      }
      case 'PullRequestEvent':
        if (!['opened', 'closed', 'reopened'].includes(p.action)) continue;
        line = `${p.action === 'closed' && p.pull_request?.merged ? '🟣 Merged' : p.action === 'closed' ? '✖️ Closed' : '🔀 Opened'} PR [#${p.number}](${p.pull_request?.html_url}) in ${r}${p.pull_request?.title ? ` — ${p.pull_request.title}` : ''}`;
        break;
      case 'IssuesEvent':
        if (!['opened', 'closed'].includes(p.action)) continue;
        line = `${p.action === 'opened' ? '🐛 Opened' : '✅ Closed'} issue [#${p.issue?.number}](${p.issue?.html_url}) in ${r}`;
        break;
      case 'CreateEvent':
        if (p.ref_type !== 'repository') continue;
        line = `✨ Created ${r}`;
        break;
      case 'ReleaseEvent':
        line = `🚀 Released [${p.release?.tag_name}](${p.release?.html_url}) of ${r}`;
        break;
      case 'WatchEvent':
        line = `⭐ Starred ${r}`;
        break;
      case 'ForkEvent':
        line = `🍴 Forked ${r}`;
        break;
      default:
        continue;
    }
    line = line.replace(/\|/g, '\\|');
    if (lines.at(-1)?.text === line) continue; // collapse repeated pushes
    lines.push({ text: line, at: e.created_at });
    if (lines.length === 6) break;
  }
  if (!lines.length) return '_Nothing public in the last few days._';
  return lines.map((l) => `- ${l.text} <sub>· ${date(l.at)}</sub>`).join('\n');
}

// ---------------------------------------------------------------------------

function write(theme, name, content) {
  const dir = join(ROOT, 'assets', theme);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.svg`), content);
}

function renderStatic() {
  for (const [name, t] of Object.entries(THEMES)) {
    write(name, 'header', header(t));
    for (const [id, labels] of Object.entries(SECTIONS)) write(name, `title-${id}`, sectionTitle(t, labels));
    write(name, 'experience', experience(t));
    write(name, 'stack', stack(t));
    write(name, 'footer', footer(t));
    for (const b of CONNECT) write(name, `btn-${b.id}`, button(t, b).body);
  }
}

async function renderLive() {
  const { user, events } = args.has('--sample') ? sampleData() : await fetchGitHub();
  const byName = new Map(user.repositories.nodes.map((r) => [r.name, r]));
  for (const [name, t] of Object.entries(THEMES)) {
    write(name, 'stats', statsCard(t, user));
    write(name, 'calendar', calendarCard(t, user));
    write(name, 'languages', languagesCard(t, user));
    write(name, 'recent', recentCard(t, user));
    FEATURED.forEach((p, i) => write(name, `project-${i + 1}`, projectCard(t, p, p.repo && byName.get(p.repo), i)));
  }
  const readmePath = join(ROOT, 'README.md');
  const readme = readFileSync(readmePath, 'utf8');
  const next = readme.replace(/(<!-- ACTIVITY:START -->)[\s\S]*?(<!-- ACTIVITY:END -->)/, `$1\n${activityMarkdown(events)}\n$2`);
  writeFileSync(readmePath, next);
}

renderStatic();
if (!args.has('--static')) await renderLive();
