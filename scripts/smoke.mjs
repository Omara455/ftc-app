#!/usr/bin/env node
// End-to-end smoke test (auth, tasks, community, account, writes) against the mock API,
// in the web build. Phase 2 is switched on: writes and notifications.
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
    // mock mode, with the Phase 2 write flows on
    env: {
      ...process.env,
      EXPO_PUBLIC_API_BASE_URL: '',
      EXPO_PUBLIC_FLAG_WRITES: '1',
      EXPO_PUBLIC_FLAG_NOTIFICATIONS: '1',
    },
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

await step(
  'correct password signs in, asks about notifications once (05), opens Tasks',
  async () => {
    await fill('البريد الإلكتروني', 'abdullah@student.ksu.edu.sa');
    await fill('كلمة المرور', 'ftc-portal');
    await tap('تسجيل الدخول');
    await expectUrl('/notifications-permission');
    await see('خلّك أول من يعرف');
    await tap('لاحقًا');
    await expectUrl('/tasks');
    await see('مهام اللجنة التقنية');
    if ((await token()) !== 'mock-token') throw new Error('token not stored');
  },
);

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

// ── M4: community, leaderboard, account ──────────────────────────────────────
const bodyText = () => page.evaluate(() => document.body.innerText);
/** A number of hours («14 ساعة», «+3»): must never appear outside the leaderboard. */
const HOURS = /\d+\s*ساع|\+\d/;

await step('Community: counts, leadership, my committee, teams expand', async () => {
  await page.goto(base + '/community');
  await see('290 عضواً · 8 لجان · 6 فرق');
  await see('لمى العتيبي');
  await see('لجنتك');
  await page.getByLabel('عرض الفرق، 4 فرق', { exact: true }).click();
  await see('كتابة المحتوى · 27');
});

await step('committee page keeps the tab bar and never shows hours', async () => {
  await tap('لجنة الفعاليات');
  await expectUrl('/community/committee/3');
  await see('القيادة');
  if (!(await tabBarVisible())) throw new Error('tab bar hidden on committee page');
  await page.goto(base + '/community/committee/1');
  await see('أنت');
  if (HOURS.test(await bodyText())) throw new Error('hours shown on a committee page');
});

await step('search highlights matches and opens a member without hours', async () => {
  await page.goto(base + '/community/search');
  await fill('ابحث عن عضو', 'سا');
  await see('5 أعضاء');
  await tap('التقنية · نائبة القائد');
  await expectUrl('/community/member/102');
  await see('آخر إنجازاتها');
  await see('بيانات التواصل والساعات تظهر لصاحبها وقادته فقط.');
  if (await tabBarVisible()) throw new Error('tab bar visible on member profile');
  // A count of hours («14 ساعة», «+3») would be a privacy leak; achievement names like
  // «خمسون ساعة» are fine.
  if (HOURS.test(await bodyText())) throw new Error('hours shown on a member profile');
});

await step('Leaderboard: league progress, podium, pinned rank', async () => {
  await page.goto(base + '/leaderboard');
  await see('المستوى الفضي');
  await see('باقي لك 16 ساعة للذهبي');
  await see('العضو المتميز');
  await see('ترتيبك هالشهر');
  await see('5 ساعات وتدخل العشرة');
});

await step('Account → achievements; settings change-password sheet', async () => {
  await page.goto(base + '/account');
  await see('آخر النشاطات');
  await tap('عرض الكل');
  await expectUrl('/account/achievements');
  await see('حصلت على 4 من 9');
  await page.goto(base + '/account/settings');
  await tap('تغيير كلمة المرور');
  await see('أرسل الرابط');
  await tap('أرسل الرابط');
  await page.getByText('أرسل الرابط').waitFor({ state: 'hidden', timeout: 5000 });
});

// ── M5: writes (join, leave, submit, edit profile) ───────────────────────────
// The mock keeps write state in memory: these steps navigate inside the app (no reloads)
// where they depend on an earlier write.
await step('join from the detail: sheet → toast, event path, submit after the event', async () => {
  await page.goto(base + '/tasks/301');
  await tap('انضم للمهمة');
  await see('تنضم لهذي المهمة؟');
  await tap('تأكيد الانضمام');
  await see('انضممت للمهمة، بالتوفيق!');
  await see('الفعالية');
  await see('أنت، سلمان، ومحمد');
  await see('التسليم بعد الفعالية');
});

await step('leave: confirm sheet → back to Tasks, the task is available again', async () => {
  await tap('انسحاب');
  await see('تنسحب من المهمة؟');
  await tap('نعم، انسحب');
  await expectUrl('/tasks');
  await see('متاحة للجنتك');
  // the task is back under «متاحة للجنتك» straight away (optimistic), first in the list
  await page.getByText('انضم للمهمة', { exact: true }).first().waitFor({ timeout: 5000 });
});

await step('join from a Tasks card opens the task with the toast', async () => {
  await page.getByText('انضم للمهمة', { exact: true }).first().click();
  await see('تنضم لهذي المهمة؟');
  await tap('تأكيد الانضمام');
  await expectUrl('/tasks/301');
  await see('انضممت للمهمة، بالتوفيق!');
});

await step('submit: note + link → submitted state with my submission', async () => {
  await page.goto(base + '/tasks/101');
  await tap('سلّم المهمة');
  await see('إرسال للاعتماد');
  await fill('وش أنجزت؟', 'وثّقت مسارات الدخول والمهام مع أمثلة.');
  await see('37 / 500');
  await fill('رابط العمل', 'github.com/ftcksu/portal/pull/142');
  await tap('أضف صورة أو ملف'); // asks first: photo or file
  await see('صورة من الألبوم');
  await see('ملف');
  await tap('إرسال للاعتماد');
  await see('وصل تسليمك لفيصل');
  await see('github.com/ftcksu/portal/pull/142');
});

await step('edit submission opens the sheet prefilled', async () => {
  await tap('تعديل التسليم');
  const note = await page.getByLabel('وش أنجزت؟', { exact: true }).first().inputValue();
  if (!note.startsWith('وثّقت مسارات الدخول')) throw new Error(`note not prefilled: "${note}"`);
  await page.getByLabel('إغلاق', { exact: true }).click();
  await page.getByText('إرسال للاعتماد').waitFor({ state: 'hidden', timeout: 5000 });
});

await step('offline: write buttons are locked', async () => {
  await page.goto(base + '/tasks/302');
  await see('انضم للمهمة');
  await page.context().setOffline(true);
  await see('ما فيه اتصال بالإنترنت');
  const join = page.getByRole('button', { name: 'انضم للمهمة', exact: true });
  if (!(await join.isDisabled())) throw new Error('join still enabled offline');
  await page.context().setOffline(false);
  await page.getByText('ما فيه اتصال بالإنترنت').waitFor({ state: 'detached', timeout: 5000 });
});

await step('edit profile: read-only fields, bio saves', async () => {
  await page.goto(base + '/account/settings');
  await tap('تعديل الملف');
  await expectUrl('/account/edit-profile');
  await see('الاسم والرقم الجامعي واللجنة تعدّلها الموارد البشرية في البوابة.');
  await fill('نبذة عنك', 'أحب تصميم الواجهات.');
  await see('19 / 160');
  await tap('حفظ');
  await expectUrl('/account/settings');
  await tap('تعديل الملف');
  const bio = await page.getByLabel('نبذة عنك', { exact: true }).inputValue();
  if (bio !== 'أحب تصميم الواجهات.') throw new Error(`bio not saved: "${bio}"`);
});

// ── M6: notifications ────────────────────────────────────────────────────────
// 17 stays mounted under the screen it opens, so pick the back button that's on screen.
const visibleBack = () => page.getByLabel('رجوع', { exact: true }).locator('visible=true');

await step('bell → notifications grouped by day, unread first', async () => {
  await page.goto(base + '/tasks');
  await page.getByLabel('الإشعارات، غير مقروء', { exact: true }).click();
  await expectUrl('/notifications');
  await see('اليوم');
  await see('هالأسبوع');
  await see('رجّع فيصل تسليمك');
  await see('تحديد الكل كمقروء');
});

await step('tapping a notification marks it read and opens its task', async () => {
  await tap('رجّع فيصل تسليمك');
  await expectUrl('/tasks/102');
  await see('ملاحظة فيصل');
  await visibleBack().click();
  await expectUrl('/notifications');
  const row = page.getByRole('button', { name: /رجّع فيصل تسليمك/ });
  if ((await row.getAttribute('aria-label'))?.startsWith('غير مقروء'))
    throw new Error('notification still unread');
});

await step('mark all read clears the unread state and the bell dot', async () => {
  await tap('تحديد الكل كمقروء');
  await page.getByText('تحديد الكل كمقروء').waitFor({ state: 'detached', timeout: 5000 });
  await visibleBack().click();
  await expectUrl('/tasks');
  await page.getByLabel('الإشعارات', { exact: true }).waitFor({ timeout: 5000 });
});

await step('notification toggles are saved on the server', async () => {
  await page.goto(base + '/account');
  const openSettings = async () => {
    await page.getByLabel('الإعدادات', { exact: true }).click();
    await expectUrl('/account/settings');
  };
  await openSettings();
  const toggle = page.getByRole('switch', { name: 'تحديثات الصدارة والمستوى', exact: true });
  await toggle.waitFor({ timeout: 5000 });
  if ((await toggle.getAttribute('aria-checked')) !== 'false') throw new Error('expected off');
  await toggle.click();
  // Leave and come back inside the app (a reload would reset the mock's saved state).
  await visibleBack().click();
  await expectUrl('/account');
  await openSettings();
  await page.waitForTimeout(800);
  if ((await toggle.getAttribute('aria-checked')) !== 'true') throw new Error('toggle not saved');
});

await step('tab bar switches tabs', async () => {
  await page.goto(base + '/tasks');
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
