import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:3000";

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

const STW = [0, 1, 2, 3, 4, 5].map((k) => 10.15 + k * 1.2648 + 0.5);

const marks = [
  ["act1", 2],
  ["act2", 7.2],
  ["act3-venture1", STW[0]],
  ["act3-venture2", STW[1]],
  ["act3-venture3", STW[2]],
  ["act3-venture4", STW[3]],
  ["act3-venture5", STW[4]],
  ["act3-venture6", STW[5]],
  ["act4", 20.4],
  ["act4-beams", 22.3],
  ["act4-shipped", 23.15],
  ["act5", 26.2],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(String(error)));
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForFunction(() => typeof window.__oneCommandSeek === "function", null, { timeout: 20000 });
await page.waitForSelector("canvas", { timeout: 20000 });
await page.waitForTimeout(1200);

const rows = [];
for (const [name, internal] of marks) {
  const progress = presentationForInternal(internal) / 52;
  await page.evaluate((value) => window.__oneCommandSeek(value), progress);
  await page.waitForTimeout(500);
  let sample = null;
  for (let frame = 0; frame < 6; frame += 1) {
    await page.waitForTimeout(100);
    sample = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      return {
        calls: Number(canvas?.dataset.drawCalls ?? "NaN"),
        triangles: Number(canvas?.dataset.triangles ?? "NaN"),
        phase: canvas?.dataset.act4Phase ?? "",
      };
    });
  }
  rows.push({ name, internal: Number(internal.toFixed(2)), progress: Number(progress.toFixed(4)), ...sample });
}

console.log(JSON.stringify({ base, rows, errors: errors.slice(0, 12) }, null, 2));
await browser.close();
