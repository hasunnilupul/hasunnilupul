// Renders the profile README's images in the portfolio's look (nilupulperera.dev):
// same palette, fonts, sparkles and squiggles, in a dark and a light variant.
//
//   node scripts/render.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Content — kept in step with the portfolio
// ---------------------------------------------------------------------------

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
  connect: ['04 / Contact', "Let's Work Together"],
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
    icons: { next: 'nextjs-dark.svg', aws: 'aws-light.svg', tanstack: 'tanstack-query-dark.svg' },
  },
  light: {
    bg: '#F7F4EC', card: '#FFFFFF', text: '#16181C', muted: '#5B5F68', dim: '#656B7A',
    accent: '#C6FF3D', pink: '#E85FD0', cyan: '#46D2E8',
    accentInk: '#3F6B0A', pinkInk: '#B8269E', cyanInk: '#08708A',
    border: 'rgba(20,20,20,0.08)', borderLoud: 'rgba(20,20,20,0.14)',
    onAccent: '#16181C', glow: 0.22,
    icons: { next: 'nextjs-light.svg', aws: 'aws-dark.svg', tanstack: 'tanstack-query-light.svg' },
  },
};

const W = 880; // every image shares one width so they scale together in the README

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

renderStatic();
