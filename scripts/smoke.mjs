#!/usr/bin/env node
// End-to-end smoke test (auth + tasks) against the mock API, in the web build.
//   npm run smoke            (builds first)
//   npm run smoke -- --no-build
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
};

if (!process.argv.includes('--no-build') || !existsSync(DIST)) {
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, EXPO_PUBLIC_API_BASE_URL: '' }, // mock mode
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(DIST, url);
  if (!existsSync(file) || !statSync(file).isFile()) file = join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, ok));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

let failed = 0;
async function step(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`✗ ${name}\n    ${String(e.message).split('\n')[0]}`);
  }
}
const expectUrl = (path) => page.waitForURL((u) => u.pathname === path, { timeout: 5000 });
const see = (text) => page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 });
const fill = (label, value) => page.getByLabel(label, { exact: true }).first().fill(value);
const tap = (text) => page.getByText(text, { exact: true }).last().click();
const token = () => page.evaluate(() => localStorage.getItem('ftc.token'));

await step('signed out → / redirects to /login', async () => {
  await page.goto(base + '/');
  await expectUrl('/login');
  await see('أهلاً فيك');
});

await step('wrong password shows the error banner', async () => {
  await fill('البريد الإلكتروني', 'abdullah@student.ksu.edu.sa');
  await fill('كلمة المرور', 'wrongpass');
  await tap('تسجيل الدخول');
  await see('البريد أو كلمة المرور غير صحيحة');
});

await step('network failure shows the offline message', async () => {
  await fill('البريد الإلكتروني', 'offline@student.ksu.edu.sa');
  await tap('تسجيل الدخول');
  await see('ما فيه اتصال بالإنترنت');
});

await step('correct password signs in and opens Tasks', async () => {
  await fill('البريد الإلكتروني', 'abdullah@student.ksu.edu.sa');
  await fill('كلمة المرور', 'ftc-portal');
  await tap('تسجيل الدخول');
  await expectUrl('/tasks');
  await see('مهام اللجنة التقنية');
  if ((await token()) !== 'mock-token') throw new Error('token not stored');
});

await step('session survives a reload', async () => {
  await page.reload();
  await expectUrl('/tasks');
  await see('مهام اللجنة التقنية');
});

await step('signed in → /login is not reachable', async () => {
  await page.goto(base + '/login');
  await expectUrl('/tasks');
});

// ── M3: tasks ────────────────────────────────────────────────────────────────
const tabBarVisible = () => page.getByRole('tablist', { name: 'التنقل الرئيسي' }).isVisible();

await step('Tasks lists my tasks and the available ones', async () => {
  await page.goto(base + '/tasks');
  await see('مهامي');
  await see('متاحة للجنتك');
  await see('تغطية تقنية لفعالية FTC Talks');
});

await step('a task opens its detail without the tab bar, back returns', async () => {
  await tap('توثيق مسارات الواجهة البرمجية للتطبيق');
  await expectUrl('/tasks/101');
  await see('مسار المهمة');
  await see('دورك الحين');
  if (await tabBarVisible()) throw new Error('tab bar still visible on detail');
  await page.getByLabel('رجوع', { exact: true }).click();
  await expectUrl('/tasks');
  if (!(await tabBarVisible())) throw new Error('tab bar missing on Tasks');
});

await step('returned / submitted / available detail states', async () => {
  await page.goto(base + '/tasks/102');
  await see('ملاحظة فيصل');
  await see('تسليمك السابق');
  await page.goto(base + '/tasks/103');
  await see('وصل تسليمك لهيفاء');
  await see('ftc-talks-card.pdf');
  await page.goto(base + '/tasks/301');
  await see('باقي مقعدين');
  await see('سلمان ومحمد · 2 من 4');
});

await step('unknown task shows the error state', async () => {
  await page.goto(base + '/tasks/999');
  await see('صار خلل عندنا');
});

await step('history: this term, then all terms', async () => {
  await page.goto(base + '/tasks');
  await tap('مهام منجزة ›');
  await expectUrl('/tasks/history');
  await see('ترتيب ملفات اللجنة على Drive');
  await tap('كل الترمات');
  await see('تنظيم ورشة Git للمبتدئين');
});

await step('query cache is persisted', async () => {
  await page.goto(base + '/tasks');
  await see('مهامي');
  await page.waitForTimeout(1500); // persister throttle
  const cache = await page.evaluate(() => localStorage.getItem('ftc.queryCache'));
  if (!cache?.includes('توثيق مسارات')) throw new Error('tasks not in the persisted cache');
});

await step('offline: banner + cached tasks, back online: banner goes', async () => {
  await page.context().setOffline(true);
  await see('ما فيه اتصال بالإنترنت');
  await see('توثيق مسارات الواجهة البرمجية للتطبيق');
  await page.context().setOffline(false);
  await page.getByText('ما فيه اتصال بالإنترنت').waitFor({ state: 'detached', timeout: 5000 });
});

await step('tab bar switches tabs', async () => {
  await tap('الصدارة');
  await expectUrl('/leaderboard');
  await see('لوحة الصدارة');
  await tap('حسابي');
  await expectUrl('/account');
});

await step('logout sheet signs out and clears the token and cache', async () => {
  await page.getByLabel('الإعدادات', { exact: true }).click();
  await expectUrl('/account/settings');
  await tap('تسجيل الخروج'); // settings row
  await see('تسجيل الخروج؟');
  await tap('تسجيل الخروج'); // sheet confirm (last match)
  await expectUrl('/login');
  if ((await token()) !== null) throw new Error('token still stored');
  await page.waitForTimeout(1200);
  const cache = await page.evaluate(() => localStorage.getItem('ftc.queryCache'));
  if (cache?.includes('توثيق مسارات')) throw new Error('task cache survived logout');
});

await step('a 401 on any request logs out globally', async () => {
  await page.evaluate(() => localStorage.setItem('ftc.token', 'expired-token'));
  await page.goto(base + '/tasks');
  await expectUrl('/login');
  if ((await token()) !== null) throw new Error('token still stored');
});

await step('5 failed logins in a minute → throttled message', async () => {
  await page.goto(base + '/login');
  await fill('البريد الإلكتروني', 'abdullah@student.ksu.edu.sa');
  // one failure already happened above (same page session reset by navigation)
  for (let i = 0; i < 6; i++) {
    await fill('كلمة المرور', `wrong-${i}`);
    await tap('تسجيل الدخول');
    await page.waitForTimeout(700);
  }
  await see('جرّب مرة ثانية بعد دقيقة');
});

await step('forgot password → link sent → back to login', async () => {
  await page.goto(base + '/login');
  await fill('البريد الإلكتروني', 'abdullah@student.ksu.edu.sa');
  await tap('نسيت كلمة المرور؟');
  await expectUrl('/forgot');
  await see('اكتب بريدك المسجّل');
  await tap('أرسل الرابط');
  await expectUrl('/forgot-sent');
  await see('abdullah@student.ksu.edu.sa');
  await see('بعد 0:4');
  await tap('رجوع لتسجيل الدخول');
  await expectUrl('/login');
});

if (errors.length) {
  failed++;
  console.log(`✗ page errors:\n    ${errors.join('\n    ')}`);
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
