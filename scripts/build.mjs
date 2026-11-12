// Generates the README's SVG assets in the style of rubensrojas.com.
//
//   node scripts/build.mjs
//
// GitHub strips <style>/<script>/class/id from README HTML, but an SVG loaded through <img>
// keeps its own CSS (animations included) and can carry fonts as base64. Fonts are subset to
// the glyphs each SVG uses when `pyftsubset` (pip install fonttools brotli) is on PATH or in
// $PYFTSUBSET; otherwise the full latin files are embedded.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
mkdirSync(out, { recursive: true });

const C = {
  bg: '#0D0D0D',
  card: '#151515',
  line: '#232323',
  line2: '#262626',
  lineMuted: '#3A3A3A',
  text: '#F5F5F5',
  text2: '#B8B8B8',
  text3: '#8F8F8F',
  accent: '#FF4B24',
  lightText: '#1F2328',
};

// ---------- fonts ----------
const FONTS = {
  sans: join(root, 'scripts/fonts/inter-latin-wght-normal.woff2'),
  mono: join(root, 'scripts/fonts/space-mono-latin-400-normal.woff2'),
};
const pyft = process.env.PYFTSUBSET || 'pyftsubset';
function fontData(file, text) {
  try {
    const dir = mkdtempSync(join(tmpdir(), 'ft-'));
    const dest = join(dir, 'sub.woff2');
    execFileSync(pyft, [file, `--text=${[...new Set(text + ' ')].join('')}`, '--flavor=woff2', `--output-file=${dest}`, '--layout-features=*'], { stdio: 'ignore' });
    const b = readFileSync(dest).toString('base64');
    rmSync(dir, { recursive: true });
    return b;
  } catch {
    return readFileSync(file).toString('base64');
  }
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textOf = svg => svg.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Wraps body in an <svg>, embedding only the fonts/glyphs the body uses. */
function svg({ w, h, body, css = '', title }) {
  const text = textOf(body);
  const faces = [
    `@font-face{font-family:S;font-weight:100 900;src:url(data:font/woff2;base64,${fontData(FONTS.sans, text)}) format('woff2')}`,
    `@font-face{font-family:M;src:url(data:font/woff2;base64,${fontData(FONTS.mono, text)}) format('woff2')}`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
${faces.join('\n')}
.s{font-family:S,Inter,system-ui,-apple-system,'Segoe UI',sans-serif}
.m{font-family:M,'Space Mono',ui-monospace,Menlo,monospace;text-transform:uppercase}
${css}
</style>
${body}
</svg>
`;
}
const write = (name, content) => {
  writeFileSync(join(out, name), content);
  console.log(`${name}  ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
};

// ---------- agent flow (same story as the portfolio hero, as a CSS-only 8s loop) ----------
function agentFlow(ox, oy) {
  const D = (cy) => `190,${cy - 50} 290,${cy} 190,${cy + 50} 90,${cy}`;
  const robot = (x, y, cls = '') =>
    `<g${cls ? ` class="${cls}"` : ''}><path d="M${x + 10} ${y}V${y - 4}" stroke="currentColor" stroke-width="1.3"/><circle cx="${x + 10}" cy="${y - 5.5}" r="1.5" fill="currentColor"/><rect x="${x}" y="${y}" width="20" height="16" rx="5" fill="${C.card}" stroke="currentColor" stroke-width="1.3"/><circle cx="${x + 6}" cy="${y + 8}" r="1.6" fill="currentColor"/><circle cx="${x + 14}" cy="${y + 8}" r="1.6" fill="currentColor"/></g>`;
  const agentAt = { in1: [35, 32], in2: [95, 32], lead: [65, 80], tTop: [330, 197], tLeft: [308, 254], tRight: [352, 254], rev: [105, 292] };

  // pulses: [id, from, to, start%, end%, opts]
  const pulses = [
    ['a', [50, 50], [70, 78], 2, 11],
    ['b', [100, 50], [80, 78], 7, 16],
    ['bx', [80, 78], [105, 40], 17, 26, { swallow: 1 }], // rejected idea returns to its sender
    ['c', [86, 92], [184, 118], 13, 27],
    ['d', [190, 128], [190, 234], 29, 41],
    ['e', [190, 246], [190, 300], 43, 49, { keep: 'out' }],
    ['f', [190, 300], [115, 300], 49, 57, { keep: 'in', swallow: 1 }], // swallowed by the reviewer
    ['g', [115, 300], [190, 300], 70, 78, { emerge: 1, keep: 'out' }], // handed back after the check
    ['h', [190, 300], [190, 354], 78, 85, { keep: 'in' }],
    ['a2', [50, 50], [70, 78], 52, 61],
    ['b2', [100, 50], [80, 78], 58, 67],
    ['t1', [336, 214], [322, 252], 4, 13, { small: 1 }],
    ['t2', [330, 262], [350, 262], 15, 22, { small: 1 }],
    ['t3', [358, 252], [344, 214], 24, 33, { small: 1 }],
    ['t4', [322, 252], [336, 214], 44, 53, { small: 1 }],
    ['t5', [350, 262], [330, 262], 55, 62, { small: 1 }],
    ['t6', [344, 214], [358, 252], 64, 73, { small: 1 }],
    ['fd', [332, 243], [197, 240], 74, 88, { small: 1 }],
  ];
  // flashes: [selector, at%, fade%] — orange overlays light up when something lands
  const flashes = [
    ['.fl-lead', 11, 10],
    ['.fl-lead2', 61, 10],
    ['.fl-in2', 26, 10],
    ['.fl-p1', 27, 22],
    ['.fl-p2', 41, 20],
    ['.fl-p2b', 88, 10],
    ['.fl-rev', 57, 28],
    ['.fl-p3', 85, 14],
  ];

  let css = '';
  let body = '';
  for (const [id, [x0, y0], [x1, y1], s, e, o = {}] of pulses) {
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const tl = o.small ? 8 : 11;
    const r = o.small ? [3.8, 2.1] : [4.6, 2.6];
    body += `<g class="p p-${id}"><line x2="${((-(x1 - x0) / len) * tl).toFixed(1)}" y2="${((-(y1 - y0) / len) * tl).toFixed(1)}" stroke="${C.accent}" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/><circle r="${r[0]}" fill="${C.accent}" fill-opacity=".18"/><circle r="${r[1]}" fill="${C.accent}"/></g>`;
    const T = (x, y, sc = 1) => `translate(${x}px,${y}px) scale(${sc})`;
    const inOp = o.keep === 'in' || o.emerge ? 1 : 0;
    const outOp = o.keep === 'out' ? 1 : 0;
    const k = [
      `0%,${s}%{transform:${T(x0, y0, o.emerge ? 0.2 : 1)};opacity:0}`,
      `${s + 0.01}%{opacity:${inOp}}`,
      `${s + (e - s) * 0.15}%{opacity:1}`,
      o.swallow ? `${s + (e - s) * 0.8}%{transform:${T(x0 + (x1 - x0) * 0.8, y0 + (y1 - y0) * 0.8)};opacity:1}` : `${e - (e - s) * 0.12}%{opacity:1}`,
      `${e}%{transform:${T(x1, y1, o.swallow ? 0.15 : 1)};opacity:${outOp}}`,
      `${e + 0.01}%,100%{transform:${T(x1, y1)};opacity:0}`,
    ];
    css += `.p-${id}{animation-name:k-${id}}@keyframes k-${id}{${k.join('')}}\n`;
  }
  flashes.forEach(([sel, at, fade], i) => {
    css += `${sel}{animation-name:f${i}}@keyframes f${i}{0%,${at}%{opacity:0}${at + 1}%{opacity:1}${Math.min(99.9, at + fade)}%,100%{opacity:0}}\n`;
  });
  css += `.p,.fl{opacity:0;animation-duration:8s;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(.45,0,.55,1)}
.fl{animation-timing-function:cubic-bezier(.2,.8,.2,1)}
.gear{animation:spin 3.2s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.caret{animation:blink 1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}
.row{opacity:0;animation:row 1.8s ease-in-out infinite}.row2{animation-delay:.6s}@keyframes row{30%,50%{opacity:.9}}
.lens{animation:lens 2.4s ease-in-out infinite}@keyframes lens{25%{transform:translate(-1.5px,1px)}50%{transform:translate(0,2px)}75%{transform:translate(1.5px,1px)}}
@media (prefers-reduced-motion:reduce){.p,.fl,.gear,.caret,.row,.lens{animation:none}}
`;

  const flPlane = (cls, cy) =>
    `<g class="fl ${cls}"><polygon points="${D(cy)}" fill="${C.accent}" fill-opacity=".14" stroke="${C.accent}" stroke-width="1.5"/><text class="m" x="24" y="${cy + 4}" font-size="11" letter-spacing=".08em" fill="${C.accent}">${String((cy - 0) / 120).padStart(2, '0')}</text></g>`;

  const g = `<g transform="translate(${ox} ${oy})">
${[120, 240, 360].map(cy => `<polygon points="${D(cy)}" fill="${C.card}" stroke="${C.lineMuted}"/>`).join('')}
<path d="M190 126V234M190 246V354M50 50L70 78M100 50L80 78M86 92L184 118M336 214L322 252M330 262H350M358 252L344 214M332 243L197 240.2" fill="none" stroke="#4A4A4A" stroke-dasharray="2 4"/>
<path d="M126 300H186" stroke="#4A4A4A"/>
${flPlane('fl-p1', 120)}${flPlane('fl-p2', 240)}${flPlane('fl-p2b', 240)}${flPlane('fl-p3', 360)}
<polygon points="190,114 196,120 190,126 184,120" fill="${C.text3}"/>
<circle cx="190" cy="240" r="6" fill="${C.card}" stroke="${C.text3}" stroke-width="1.5"/><circle cx="190" cy="240" r="2" fill="${C.text3}"/>
<circle cx="340" cy="243" r="3" fill="${C.card}" stroke="${C.text3}" stroke-width="1.2"/>
<circle cx="190" cy="300" r="3.5" fill="${C.card}" stroke="${C.text3}" stroke-width="1.2"/>
<circle cx="190" cy="360" r="10" fill="none" stroke="#4A4A4A"/><circle cx="190" cy="360" r="4.5" fill="${C.text3}"/>
<g color="${C.text3}">${Object.values(agentAt).map(([x, y]) => robot(x, y)).join('')}</g>
<g color="${C.accent}">${robot(...agentAt.lead, 'fl fl-lead')}${robot(...agentAt.lead, 'fl fl-lead2')}${robot(...agentAt.in2, 'fl fl-in2')}<g class="fl fl-rev">${robot(...agentAt.rev)}<path d="M126 300H186" stroke="${C.accent}"/><circle cx="128" cy="290" r="5.5" fill="${C.accent}"/></g></g>
<circle cx="128" cy="290" r="5.5" fill="${C.text3}" class="badge"/>
<g class="fl fl-rev"><circle cx="128" cy="290" r="5.5" fill="${C.accent}"/></g>
<path d="M125.3 290.2L127.2 292.1L130.8 288" fill="none" stroke="${C.card}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(99 84)"><g class="gear"><circle r="3.2" fill="none" stroke="${C.text3}" stroke-width="1.3"/><circle r="1.1" fill="${C.text3}"/><path d="M0 -5.6V-3.9M0 3.9V5.6M-5.6 0H-3.9M3.9 0H5.6M-4 -4L-2.8 -2.8M2.8 2.8L4 4M-4 4L-2.8 2.8M2.8 -2.8L4 -4" stroke="${C.text3}" stroke-width="1.6" stroke-linecap="round"/></g></g>
<g transform="translate(362 205)"><g class="lens"><circle r="3.4" fill="none" stroke="${C.text3}" stroke-width="1.3"/><path d="M2.5 2.5L5.2 5.2" stroke="${C.text3}" stroke-width="1.5" stroke-linecap="round"/></g></g>
<g transform="translate(316 283)"><path d="M-5 -3L-8 0L-5 3M5 -3L8 0L5 3M1.4 -4L-1.4 4" fill="none" stroke="${C.text3}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect class="caret" x="10.5" y="-3.5" width="1.4" height="7" fill="${C.accent}"/></g>
<g transform="translate(362 284)"><ellipse cy="-4" rx="6" ry="2" fill="none" stroke="${C.text3}" stroke-width="1.2"/><path d="M-6 -4V4.5A6 2 0 0 0 6 4.5V-4" fill="none" stroke="${C.text3}" stroke-width="1.2"/><path class="row" d="M-6 -0.5A6 2 0 0 0 6 -0.5" fill="none" stroke="${C.accent}" stroke-width="1.2"/><path class="row row2" d="M-6 2.5A6 2 0 0 0 6 2.5" fill="none" stroke="${C.accent}" stroke-width="1.2"/></g>
<g class="m" font-size="11" letter-spacing=".08em" fill="${C.text3}"><text x="24" y="124">01</text><text x="24" y="244">02</text><text x="24" y="364">03</text></g>
${body}
</g>`;
  return { g, css };
}

// ---------- header ----------
{
  const W = 1280;
  const H = 640;
  const flow = agentFlow(800, 110);
  const body = `
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="${C.bg}" stroke="${C.line}"/>
<text class="s" x="1250" y="640" font-size="560" font-weight="700" letter-spacing="-.08em" fill="none" stroke="#1C1C1C" text-anchor="end">01</text>
<g transform="translate(56 44)">
  <rect x=".5" y=".5" width="39" height="39" rx="10" fill="#1C1C1C" stroke="#2C2C2C"/>
  <text class="s" x="11" y="27" font-size="19" font-weight="700" letter-spacing="-.04em" fill="${C.text}">R<tspan fill="${C.accent}">.</tspan></text>
  <text class="s" x="56" y="18" font-size="16" font-weight="600" letter-spacing="-.02em" fill="${C.text}">Rubens Rojas</text>
  <text class="m" x="56" y="38" font-size="13" letter-spacing=".04em" fill="${C.text3}">Senior Full-Stack Engineer</text>
</g>
<circle cx="${W - 292}" cy="63" r="3.5" fill="${C.accent}"/>
<text class="m" x="${W - 56}" y="68" font-size="15" letter-spacing=".06em" fill="${C.text2}" text-anchor="end">Rio de Janeiro · UTC−3</text>
<line x1="56" y1="112" x2="${W - 56}" y2="112" stroke="${C.line}"/>

<text class="m" x="56" y="176" font-size="16" letter-spacing=".08em" fill="${C.text3}">Product-minded full-stack engineer</text>
<text class="s" x="50" y="296" font-size="136" font-weight="600" letter-spacing="-.075em" fill="${C.text}">Rubens</text>
<text class="s" x="50" y="410" font-size="136" font-weight="600" letter-spacing="-.075em" fill="${C.text}">Rojas<tspan fill="${C.accent}">.</tspan></text>
<text class="s" x="56" y="470" font-size="25" letter-spacing="-.02em" fill="${C.text}">I take products from idea to production.</text>
<text class="s" x="56" y="504" font-size="25" letter-spacing="-.02em" fill="${C.text3}">Design, front-end, back-end, infra and the deploy.</text>
<line x1="56" y1="540" x2="696" y2="540" stroke="${C.line2}"/>
<g class="s" font-size="30" font-weight="600" letter-spacing="-.04em" fill="${C.text}">
  <text x="56" y="584">6+</text><text x="256" y="584">5</text><text x="476" y="584">Idea → Prod</text>
</g>
<g class="m" font-size="14" letter-spacing=".05em" fill="${C.text3}">
  <text x="56" y="610">Years shipping</text><text x="256" y="610">US startups, remote</text><text x="476" y="610">End-to-end ownership</text>
</g>

<rect x="760" y="100" width="464" height="512" rx="22" fill="${C.card}"/>
${flow.g}
<text class="m" x="788" y="566" font-size="14" letter-spacing=".05em" fill="#FFFFFFCC">Idea → Execution → Production</text>
<text class="s" x="788" y="598" font-size="24" font-weight="500" letter-spacing="-.03em" fill="#FFF">One engineer, the whole stack.</text>
`;
  write('header.svg', svg({ w: W, h: H, body, css: flow.css, title: 'Rubens Rojas — product-minded full-stack engineer. I take products from idea to production.' }));
}

// ---------- section labels (dark + light variants) ----------
const sections = [
  ['01', 'About'],
  ['02', 'Toolkit'],
  ['03', 'Contact'],
];
for (const [n, name] of sections) {
  for (const theme of ['dark', 'light']) {
    const fg = theme === 'dark' ? C.text : C.lightText;
    const rule = theme === 'dark' ? '#30363D' : '#D0D7DE';
    const W = 880;
    const body = `
<text class="m" x="0" y="31" font-size="15" fill="${C.accent}">${n}</text>
<line x1="34" y1="26.5" x2="66" y2="26.5" stroke="${C.text3}"/>
<text class="s" x="80" y="34" font-size="26" font-weight="600" letter-spacing="-.04em" fill="${fg}">${name}<tspan fill="${C.accent}">.</tspan></text>
<line x1="${80 + name.length * 15 + 40}" y1="26.5" x2="${W}" y2="26.5" stroke="${rule}"/>`;
    write(`section-${name.toLowerCase()}-${theme}.svg`, svg({ w: W, h: 48, body, title: `${n} — ${name}` }));
  }
}

// ---------- toolkit ----------
{
  const groups = [
    ['01', 'Front-end', 'The product people touch', [['JavaScript', 6], ['React', 6], ['TypeScript', 6], ['Tailwind CSS', 5], ['Vue', 4], ['Next.js', 3], ['Nuxt.js', 2], ['React Native', 1]]],
    ['02', 'Back-end & infra', 'The systems behind it', [['Node.js', 5], ['PostgreSQL', 5], ['Docker', 4], ['Python', 2], ['GCP', 2], ['AWS', 1], ['Laravel', 1], ['PHP', 1], ['Firebase', 1]]],
    ['03', 'Other', 'Product, design and workflow', [['Git', 6], ['Figma', 2], ['AI-Powered Product Dev', 2]]],
  ];
  const W = 1280;
  const rowH = 34;
  let y = 196;
  let rows = '';
  for (const [n, title, sub, tools] of groups) {
    const half = Math.ceil(tools.length / 2);
    const h = Math.max(half * rowH, 56) + 28;
    rows += `<line x1="56" y1="${y}" x2="${W - 56}" y2="${y}" stroke="${C.line}"/>`;
    rows += `<text class="m" x="56" y="${y + 34}" font-size="15" letter-spacing=".06em" fill="${C.text3}">${n}</text>`;
    rows += `<text class="s" x="120" y="${y + 40}" font-size="26" font-weight="600" letter-spacing="-.03em" fill="${C.text}">${esc(title)}</text>`;
    rows += `<text class="s" x="120" y="${y + 68}" font-size="17" fill="${C.text3}">${esc(sub)}</text>`;
    tools.forEach(([name, yrs], i) => {
      const col = i < half ? 0 : 1;
      const x = 440 + col * 420;
      const ty = y + 38 + (i % half) * rowH;
      rows += `<text class="s" x="${x}" y="${ty}" font-size="20" fill="${C.text}">${esc(name)}</text>`;
      rows += `<text class="m" x="${x + 370}" y="${ty}" font-size="16" letter-spacing=".04em" fill="${C.text2}" text-anchor="end">${yrs} ${yrs === 1 ? 'yr' : 'yrs'}</text>`;
    });
    y += h;
  }
  const H = y + 96;
  const body = `
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="${C.bg}" stroke="${C.line}"/>
<text class="m" x="56" y="74" font-size="15" letter-spacing=".08em" fill="${C.text3}">Tools / practice · years of hands-on use</text>
<text class="s" x="52" y="150" font-size="68" font-weight="600" letter-spacing="-.07em" fill="${C.text}">Design. Build. Ship<tspan fill="${C.accent}">.</tspan></text>
${rows}
<line x1="56" y1="${y}" x2="${W - 56}" y2="${y}" stroke="${C.line}"/>
<rect x="120" y="${y + 47}" width="26" height="2" fill="${C.accent}"/>
<text class="s" x="162" y="${y + 55}" font-size="20" fill="${C.text2}">Different stacks, same job: <tspan fill="${C.text}">get the product into people’s hands.</tspan></text>`;
  write('toolkit.svg', svg({ w: W, h: H, body, title: 'Toolkit — front-end, back-end & infra, product and design, with years of hands-on use per tool.' }));
}

// ---------- contact buttons ----------
{
  const pill = (name, label, { primary = false, icon = 'out', w }) => {
    const H = 64;
    const fill = primary ? C.accent : C.bg;
    const fg = primary ? C.bg : C.text;
    const iconSvg =
      icon === 'mail'
        ? `<g transform="translate(26 22)" fill="none" stroke="${fg}" stroke-width="1.8"><rect x="1" y="1" width="18" height="14" rx="2.5"/><path d="M1.5 2.5l8.5 6.5 8.5-6.5"/></g>`
        : `<path d="M${w - 40} 38L${w - 28} 26M${w - 38} 26h10v10" fill="none" stroke="${fg}" stroke-width="1.8"/>`;
    const tx = icon === 'mail' ? 60 : 28;
    const body = `<rect x=".5" y=".5" width="${w - 1}" height="${H - 1}" rx="32" fill="${fill}" stroke="${primary ? C.accent : C.line2}"/>${iconSvg}<text class="s" x="${tx}" y="40" font-size="20" font-weight="600" letter-spacing="-.02em" fill="${fg}">${esc(label)}</text>`;
    write(`btn-${name}.svg`, svg({ w, h: H, body, title: label }));
  };
  pill('email', 'rubensrojascompany@gmail.com', { primary: true, icon: 'mail', w: 400 });
  pill('portfolio', 'rubensrojas.com', { w: 252 });
  pill('linkedin', 'LinkedIn', { w: 170 });
}
