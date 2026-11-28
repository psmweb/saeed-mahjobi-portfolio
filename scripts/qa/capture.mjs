import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const site = process.argv[2] ?? "http://127.0.0.1:3020";
const reference = process.argv[3] ?? "http://127.0.0.1:8090/index.html";
const root = path.resolve("docs/qa-screenshots");
const artifacts = "/opt/cursor/artifacts/qa";

const KN = [
  [0, 0],
  [5.6, 4],
  [7, 5],
  [13.7, 9.7],
  [14.2, 10.15],
  [33.5, 17.55],
  [34.2, 18.1],
  [44, 23.5],
  [52, 27.5],
];

function presentationForInternal(internal) {
  for (let i = 0; i < KN.length - 1; i += 1) {
    const [a, start] = KN[i];
    const [b, end] = KN[i + 1];
    if (internal <= end) return a + ((b - a) * (internal - start)) / (end - start);
  }
  return 52;
}

const ventureMarks = [0, 1, 2, 3, 4, 5].map((index) => ({
  name: `act3-venture${index + 1}`,
  internal: 10.15 + index * 1.2648 + 0.45,
}));

const evidence = [
  { name: "act1", internal: 2.2 },
  { name: "act2", internal: 7.2 },
  ...ventureMarks,
  { name: "act4", internal: 23.1 },
  { name: "act5", internal: 26.2 },
];

const compareTimes = [2, 6, 10, 13, 16, 20, 23, 27, 30, 33, 38, 42, 47, 51];
const sheets = [
  ["compare-01", compareTimes.slice(0, 4)],
  ["compare-02", compareTimes.slice(4, 8)],
  ["compare-03", compareTimes.slice(8, 11)],
  ["compare-04", compareTimes.slice(11)],
];

async function writePng(buffer, filename) {
  let quality = 80;
  let output = buffer;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    output = await sharp(buffer)
      .png({ compressionLevel: 9, palette: true, quality, effort: 8 })
      .toBuffer();
    if (output.length < 600 * 1024) break;
    quality -= 15;
  }
  await sharp(output).toFile(path.join(root, filename));
  await sharp(output).toFile(path.join(artifacts, filename));
  const info = await stat(path.join(root, filename));
  console.log(`${filename} ${(info.size / 1024).toFixed(0)}KB`);
  return info.size;
}

async function seek(page, presentationSeconds) {
  await page.evaluate((progress) => window.__oneCommandSeek(progress), presentationSeconds / 52);
  await page.waitForTimeout(450);
}

async function setLocale(page, locale) {
  await page.evaluate((next) => {
    if (document.documentElement.lang === next) return;
    document.querySelector("header button[aria-label]")?.click();
  }, locale);
  await page.waitForFunction((next) => document.documentElement.lang === next, locale);
  await page.waitForTimeout(150);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir(root, { recursive: true });
await mkdir(artifacts, { recursive: true });

const notes = { errors: [], chapters: [], meta: null, fallback: "" };

const refPage = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await refPage.goto(reference, { waitUntil: "domcontentloaded" });
await refPage.waitForFunction(() => window.ready === true, null, { timeout: 30000 });

const refShots = new Map();
for (const time of compareTimes) {
  await refPage.evaluate((value) => window.renderFrame(value), time);
  await refPage.waitForTimeout(80);
  refShots.set(time, await refPage.screenshot({ type: "png" }));
}
await refPage.close();

const sitePage = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const consoleErrors = [];
sitePage.on("pageerror", (error) => consoleErrors.push(String(error)));
sitePage.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
const failed = [];
sitePage.on("requestfailed", (request) => failed.push(`${request.failure()?.errorText} ${request.url()}`));
sitePage.on("response", (response) => {
  if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
});
await sitePage.goto(site, { waitUntil: "networkidle" });
await sitePage.waitForFunction(() => typeof window.__oneCommandSeek === "function");
await sitePage.waitForSelector("canvas");
await sitePage.waitForTimeout(800);
notes.meta = await sitePage.evaluate(() => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
  og: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
  lang: document.documentElement.lang,
  dir: document.documentElement.dir,
}));

const siteShots = new Map();
for (const time of compareTimes) {
  await seek(sitePage, time);
  siteShots.set(time, await sitePage.screenshot({ type: "png" }));
}

for (const [name, times] of sheets) {
  const rowH = 384;
  const width = 1280;
  const height = times.length * rowH;
  const composites = [];
  for (let index = 0; index < times.length; index += 1) {
    const time = times[index];
    const y = index * rowH;
    const label = Buffer.from(
      `<svg width="${width}" height="24"><rect width="100%" height="100%" fill="#05070C"/><text x="16" y="16" fill="#F2B544" font-family="sans-serif" font-size="13">t=${time}s    reference    |    site</text></svg>`,
    );
    composites.push({ input: label, top: y, left: 0 });
    composites.push({
      input: await sharp(refShots.get(time)).resize(640, 360).png().toBuffer(),
      top: y + 24,
      left: 0,
    });
    composites.push({
      input: await sharp(siteShots.get(time)).resize(640, 360).png().toBuffer(),
      top: y + 24,
      left: 640,
    });
  }
  const sheet = await sharp({
    create: { width, height, channels: 3, background: "#05070C" },
  })
    .composite(composites)
    .png()
    .toBuffer();
  await writePng(sheet, `${name}.png`);
}

for (const id of ["command", "evolution", "ventures", "arena", "finale"]) {
  await sitePage.locator(`nav button`).nth(["command", "evolution", "ventures", "arena", "finale"].indexOf(id)).click();
  let previous = -1;
  for (let frame = 0; frame < 25; frame += 1) {
    const y = await sitePage.evaluate(() => window.scrollY);
    if (Math.abs(y - previous) < 0.5 && frame > 3) break;
    previous = y;
    await sitePage.waitForTimeout(80);
  }
  const active = await sitePage.evaluate(() =>
    [...document.querySelectorAll("nav button")].findIndex((button) => button.getAttribute("aria-current") === "true"),
  );
  notes.chapters.push({ id, active });
}
await sitePage.close();

const viewports = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "mobile", width: 390, height: 844 },
];

for (const viewport of viewports) {
  for (const locale of ["en", "fa"]) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.key === "mobile",
      hasTouch: viewport.key === "mobile",
    });
    page.on("pageerror", (error) => consoleErrors.push(`${viewport.key}-${locale} ${error}`));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(`${viewport.key}-${locale} ${message.text()}`);
    });
    await page.goto(site, { waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.__oneCommandSeek === "function");
    await page.waitForSelector("canvas");
    await setLocale(page, locale);
    for (const shot of evidence) {
      const presentation = presentationForInternal(shot.internal);
      await seek(page, presentation);
      const buffer = await page.screenshot({ type: "png" });
      await writePng(buffer, `${shot.name}-${viewport.key}-${locale}.png`);
    }
    await page.close();
  }
}

const fallback = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await fallback.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function blocked(type, ...args) {
    if (type === "webgl" || type === "webgl2") return null;
    return original.call(this, type, ...args);
  };
});
await fallback.goto(site, { waitUntil: "networkidle" });
await fallback.waitForTimeout(800);
notes.fallback = await fallback.evaluate(() => document.body.innerText.slice(0, 280));
await fallback.close();

notes.errors = [...new Set([...consoleErrors, ...failed])].slice(0, 30);
console.log(JSON.stringify(notes, null, 2));
await browser.close();
