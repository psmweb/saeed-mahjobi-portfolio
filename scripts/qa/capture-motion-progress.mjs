import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const site = process.argv[2] ?? "http://127.0.0.1:3020";
const outDir = process.argv[3] ?? "/tmp/motion-before";
const progresses = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1];
const views = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const notes = [];

for (const view of views) {
  const page = await browser.newPage({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(site, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => typeof window.__oneCommandSeek === "function", null, { timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  for (const progress of progresses) {
    await page.evaluate((value) => window.__oneCommandSeek(value), progress);
    await page.waitForTimeout(700);
    const meta = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return {
        calls: canvas?.dataset.drawCalls ?? "",
        triangles: canvas?.dataset.triangles ?? "",
        phase: canvas?.dataset.act4Phase ?? "",
      };
    });
    const file = path.join(outDir, `${view.name}-p${progress.toFixed(1)}.png`);
    await page.screenshot({ path: file, type: "png" });
    notes.push({ view: view.name, progress, file, ...meta, errors: errors.slice(0, 4) });
    errors.length = 0;
  }
  await page.close();
}

await writeFile(path.join(outDir, "notes.json"), JSON.stringify(notes, null, 2));
console.log(JSON.stringify(notes, null, 2));
await browser.close();
