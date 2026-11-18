#!/usr/bin/env node
// Screenshot tool for the fast design-check loop (see CLAUDE.md › Working style).
//
//   node scripts/shot.mjs app /dev/kit [/tasks …] [--full] [--no-build]
//       Exports the web build, serves it, and screenshots each route at 390×844 (RTL).
//       --offline cuts the network after load (cached data + offline banner).
//       --signed-in starts with the mock session token (to reach screens behind the auth gate).
//       --fill="label=value" types into a field first (repeatable).
//       --click="نص" taps an element by its text before the shot (open a sheet, a tab…).
//       --height=6000 for a tall capture of a long scroll view, --debug to log page errors.
//   node scripts/shot.mjs design Tasks [Foundations …]
//       Renders artboards from design/artboards/<Name>.dc.html (a local copy of the
//       Claude Design canvas, not committed) so they can be compared with the app.
//   node scripts/shot.mjs compare /tasks Tasks
//       Both of the above, saved side by side in one image.
//
// Output goes to .screenshots/ (git-ignored).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, '.screenshots');
const ARTBOARDS = join(ROOT, 'design', 'artboards');
const VIEWPORT = { width: 390, height: 844 };
// --height=6000 renders a tall viewport so a whole scroll view fits (RN-web scrolls inside the page).
const heightArg = process.argv.find((a) => a.startsWith('--height='));
if (heightArg) VIEWPORT.height = Number(heightArg.split('=')[1]);

// Image blobs used by the design canvas → the same files in assets/
const BLOBS = {
  a88d0af705cf7669933751ae1bf8befe: 'bg-app.svg',
  '9e2a30d735753f9bdf4152d2380925e2': 'bg-login.svg',
  f37ef5221e20f087b91f06fe02e14bfc: 'ftc-mark-white.svg',
  '18f06927e5669b96ff7157332ffc4bb6': 'ftc-logo-white.svg',
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const [mode, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')).map((a) => a.split('=')[0]));
// Routes may be given without the leading slash (Git Bash rewrites "/dev/kit" into a path).
const args = rest
  .filter((a) => !a.startsWith('--'))
  .map((a) => (mode !== 'design' && /^[a-z(]/.test(a) ? `/${a}` : a));
const full = flags.has('--full');

if (!['app', 'design', 'compare'].includes(mode) || args.length === 0) {
  console.error('usage: shot.mjs app <route…> | design <Artboard…> | compare <route> <Artboard>');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const slug = (s) => s.replace(/^\//, '').replace(/[^\w-]+/g, '_') || 'index';

function build() {
  if (flags.has('--no-build') && existsSync(DIST)) return;
  console.log('› expo export --platform web');
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    // Screenshot builds include the hidden /dev/kit page.
    env: { ...process.env, EXPO_PUBLIC_DEV_KIT: '1' },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function serve() {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = null;
    if (url.startsWith('/__design/')) {
      const name = url.slice('/__design/'.length);
      file = BLOBS[name] ? join(ROOT, 'assets', BLOBS[name]) : join(ARTBOARDS, name);
    } else {
      for (const c of [url, `${url}.html`, join(url, 'index.html')]) {
        const p = join(DIST, c);
        if (existsSync(p) && statSync(p).isFile()) {
          file = p;
          break;
        }
      }
      // Single-page web build: every unknown route without an extension serves index.html.
      if (!file && !extname(url)) file = join(DIST, 'index.html');
    }
    if (!file || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    let body = readFileSync(file);
    if (file.endsWith('.dc.html')) {
      // Standalone render of an artboard: drop the canvas runtime, point blobs at assets/.
      body = body
        .toString()
        .replace(/<script src="\.\/support\.js"><\/script>/, '')
        .replace(/\/_blob\/([0-9a-f]{32})/g, '/__design/$1');
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  });
  return new Promise((ok) => server.listen(0, () => ok(server)));
}

async function shoot(page, url, file) {
  const isDesign = url.includes('/__design/');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // let entry animations and the mock API (450 ms) settle
  await page.waitForTimeout(isDesign ? 400 : 1300);
  // --wait=ms: extra settle time (e.g. to let query retries end on the error state)
  const extra = process.argv.find((a) => a.startsWith('--wait='));
  if (extra && !isDesign) await page.waitForTimeout(Number(extra.slice(7)));
  // --click="label" taps an element by its visible text first (e.g. to open a sheet).
  // --fill="البريد الإلكتروني=a@b.c" types into the field with that label (repeatable).
  // Fills and clicks drive the app only; artboards are static references.
  for (const fill of isDesign ? [] : process.argv.filter((a) => a.startsWith('--fill='))) {
    const [label, ...value] = fill.slice('--fill='.length).split('=');
    await page.getByLabel(label, { exact: true }).first().fill(value.join('='));
  }
  if (!isDesign && process.argv.some((x) => x.startsWith('--fill='))) {
    await page.waitForTimeout(1200); // debounce + mock API before the shot
  }
  const click = process.argv.find((a) => a.startsWith('--click='));
  if (click && !isDesign) {
    await page.getByText(click.slice('--click='.length), { exact: true }).first().click();
    await page.waitForTimeout(1200); // covers the mock API delay
  }
  // --offline: load online (so the query cache fills), then cut the network (screen 19).
  if (flags.has('--offline') && !isDesign) {
    await page.context().setOffline(true);
    await page.waitForTimeout(800);
  }
  if (flags.has('--debug')) {
    const online = await page.evaluate(() => navigator.onLine);
    console.log(`  navigator.onLine: ${online}`);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`  text: ${JSON.stringify(text.slice(0, 200))}`);
  }
  if (VIEWPORT.height > 844) {
    // Tall capture: also save 844-high slices that are easy to view one by one.
    const parts = Math.ceil(VIEWPORT.height / 844);
    for (let i = 0; i < parts; i++) {
      const h = Math.min(844, VIEWPORT.height - i * 844);
      const part = file.replace(/.png$/, `-${i + 1}.png`);
      await page.screenshot({ path: part, clip: { x: 0, y: i * 844, width: 390, height: h } });
      console.log(`✓ ${part}`);
    }
  }
  await page.screenshot({ path: file, fullPage: full });
  if (flags.has('--offline')) await page.context().setOffline(false);
  console.log(`✓ ${file}`);
  return file;
}

const needsApp = mode !== 'design';
if (needsApp) build();
const server = await serve();
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
// --signed-in: start with the mock session token (mock mode), so app routes past the auth gate render.
if (flags.has('--signed-in')) {
  await page.addInitScript(() => localStorage.setItem('ftc.token', 'mock-token'));
}
page.on('pageerror', (e) => console.error(`✗ page error: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && console.error(`✗ console: ${m.text()}`));
if (flags.has('--debug')) {
  page.on('console', (m) => console.log(`  console.${m.type()}: ${m.text().slice(0, 300)}`));
  page.on('requestfailed', (r) => console.log(`  request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && console.log(`  ${r.status()} ${r.url()}`));
}

try {
  if (mode === 'app') {
    for (const route of args) await shoot(page, base + route, join(OUT, `app-${slug(route)}.png`));
  } else if (mode === 'design') {
    for (const name of args) {
      await shoot(page, `${base}/__design/${name}.dc.html`, join(OUT, `design-${name}.png`));
    }
  } else {
    const [route, name] = args;
    const a = await shoot(page, base + route, join(OUT, `app-${slug(route)}.png`));
    const d = await shoot(
      page,
      `${base}/__design/${name}.dc.html`,
      join(OUT, `design-${name}.png`),
    );
    const img = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
    await page.setViewportSize({ width: VIEWPORT.width * 2 + 24, height: VIEWPORT.height + 40 });
    await page.setContent(
      `<body style="margin:0;background:#000;display:flex;gap:24px;font:12px sans-serif;color:#aaa">
        <figure style="margin:0"><figcaption>app ${route}</figcaption><img src="${img(a)}" width="390"></figure>
        <figure style="margin:0"><figcaption>design ${name}</figcaption><img src="${img(d)}" width="390"></figure>
      </body>`,
    );
    const out = join(OUT, `compare-${slug(route)}-${name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`✓ ${out}`);
  }
} finally {
  await browser.close();
  server.close();
}
