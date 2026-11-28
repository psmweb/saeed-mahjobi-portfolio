import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire("/tmp/pngtools/package.json");
const { PNG } = require("pngjs");

const beforeSite = process.argv[2] ?? "http://127.0.0.1:3020";
const afterSite = process.argv[3] ?? "http://127.0.0.1:3021";
const outDir = process.argv[4] ?? path.resolve("docs/qa-screenshots/v1.1.0-c");

const progresses = [0, 0.3, 0.5, 0.7, 1];
const views = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const boundary = 13.9222 / 52;

await mkdir(path.join(outDir, "before"), { recursive: true });
await mkdir(path.join(outDir, "after"), { recursive: true });
await mkdir(path.join(outDir, "compare"), { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function settle(page) {
  await page.waitForFunction(() => typeof window.__oneCommandSeek === "function", null, { timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

async function shootHold(site, folder) {
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
    await settle(page);
    for (const progress of progresses) {
      await page.evaluate((value) => window.__oneCommandSeek(value), progress);
      await page.waitForTimeout(800);
      const meta = await page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        const motion = window.__oneCommandMotion?.();
        return {
          calls: canvas?.dataset.drawCalls ?? "",
          triangles: canvas?.dataset.triangles ?? "",
          phase: canvas?.dataset.act4Phase ?? "",
          tier: canvas?.dataset.tier ?? motion?.tier ?? "",
          dpr: canvas?.dataset.dpr ?? "",
          handoff: canvas?.dataset.handoff ?? "",
          sparks: canvas?.dataset.sparks ?? "",
        };
      });
      const file = path.join(outDir, folder, `${view.name}-p${progress.toFixed(1)}.png`);
      await page.screenshot({ path: file, type: "png" });
      notes.push({ folder, view: view.name, progress, file, ...meta, errors: errors.slice(0, 6) });
      errors.length = 0;
    }
    await page.close();
  }
  return notes;
}

function readPng(file) {
  return PNG.sync.read(require("node:fs").readFileSync(file));
}

function comparePair(beforeFile, afterFile, compareFile) {
  const before = readPng(beforeFile);
  const after = readPng(afterFile);
  const width = Math.min(before.width, after.width);
  const height = Math.min(before.height, after.height);
  const diff = new PNG({ width, height });
  let changed = 0;
  let maxDelta = 0;
  let sum = 0;
  const samples = width * height;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const db = Math.abs(before.data[index] - after.data[index]);
      const dg = Math.abs(before.data[index + 1] - after.data[index + 1]);
      const dr = Math.abs(before.data[index + 2] - after.data[index + 2]);
      const delta = Math.max(db, dg, dr);
      maxDelta = Math.max(maxDelta, delta);
      sum += delta;
      if (delta > 9) changed += 1;
      diff.data[index] = delta > 9 ? 255 : after.data[index];
      diff.data[index + 1] = delta > 9 ? 32 : after.data[index + 1];
      diff.data[index + 2] = delta > 9 ? 32 : after.data[index + 2];
      diff.data[index + 3] = 255;
    }
  }
  require("node:fs").writeFileSync(compareFile, PNG.sync.write(diff));
  return {
    changed,
    maxDelta,
    meanDelta: Number((sum / samples).toFixed(3)),
    width,
    height,
  };
}

const beforeNotes = await shootHold(beforeSite, "before");
const afterNotes = await shootHold(afterSite, "after");

const diffs = [];
for (const view of views) {
  for (const progress of progresses) {
    const name = `${view.name}-p${progress.toFixed(1)}.png`;
    const stats = comparePair(
      path.join(outDir, "before", name),
      path.join(outDir, "after", name),
      path.join(outDir, "compare", name),
    );
    diffs.push({ name, ...stats });
  }
}

async function shootExtra(page, file, progress) {
  await page.evaluate((value) => window.__oneCommandSeek(value), progress);
  await page.waitForTimeout(700);
  const meta = await page.evaluate(() => window.__oneCommandMotion?.() ?? null);
  await page.screenshot({ path: file, type: "png" });
  return meta;
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(afterSite, { waitUntil: "networkidle", timeout: 60000 });
await settle(page);
const transitionDesktop = await shootExtra(page, path.join(outDir, "transition-act2-act3-desktop.png"), boundary);
const transitionAct1 = await shootExtra(page, path.join(outDir, "transition-act1-act2-desktop.png"), 6.72 / 52);

const chapter = await page.evaluate(async () => {
  const click = (index) => {
    const button = document.querySelectorAll("nav button")[index];
    button?.click();
  };
  const wait = (predicate, frames = 180) =>
    new Promise((resolve) => {
      let left = frames;
      const step = () => {
        if (predicate() || left <= 0) resolve(window.__oneCommandMotion());
        else {
          left -= 1;
          requestAnimationFrame(step);
        }
      };
      step();
    });
  click(4);
  const finale = await wait(() => window.__oneCommandMotion().current > 0.9);
  click(0);
  const command = await wait(
    () => window.__oneCommandMotion().current < 0.02 && Math.abs(window.__oneCommandMotion().smoothed - window.__oneCommandMotion().current) < 0.01,
  );
  const act1 = document.querySelector("[data-act='1']");
  const veil = document.querySelector("[data-act-veil]");
  return {
    finale: { current: finale.current, smoothed: finale.smoothed, pulse: finale.handoff.pulse, boundary: finale.handoff.boundary },
    command: { current: command.current, smoothed: command.smoothed, pulse: command.handoff.pulse },
    act1Opacity: act1?.dataset.opacity ?? "",
    veil: veil?.getAttribute("data-act-veil") ?? "absent",
  };
});
await page.screenshot({ path: path.join(outDir, "seek-command.png"), type: "png" });
await page.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await mobile.goto(afterSite, { waitUntil: "networkidle", timeout: 60000 });
await settle(mobile);
const transitionMobile = await shootExtra(mobile, path.join(outDir, "transition-act2-act3-mobile.png"), boundary);
await mobile.close();

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const reduced = await reducedContext.newPage();
await reduced.goto(afterSite, { waitUntil: "networkidle", timeout: 60000 });
await settle(reduced);
const reducedHold = await shootExtra(reduced, path.join(outDir, "reduced-desktop-p0.5.png"), 0.5);
const reducedBoundary = await shootExtra(reduced, path.join(outDir, "reduced-boundary.png"), boundary);
const reducedProbe = await reduced.evaluate(() => {
  const card = document.querySelector("[data-act='3'], [data-act='2']");
  const magnetic = document.querySelector("header span");
  return {
    motion: window.__oneCommandMotion(),
    cardFilter: card ? getComputedStyle(card).filter : "",
    magneticTransform: magnetic ? magnetic.style.transform : "",
  };
});
await reduced.close();
await reducedContext.close();

const throttleContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const throttle = await throttleContext.newPage();
const client = await throttleContext.newCDPSession(throttle);
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await throttle.goto(afterSite, { waitUntil: "networkidle", timeout: 90000 });
await settle(throttle);
await throttle.evaluate((value) => window.__oneCommandSeek(value), 0.7);
await throttle.waitForTimeout(600);
const throttleStats = await throttle.evaluate(
  () =>
    new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const tick = (now) => {
        frames += 1;
        if (now - start < 2000) requestAnimationFrame(tick);
        else {
          const canvas = document.querySelector("canvas");
          const motion = window.__oneCommandMotion();
          resolve({
            fps: Number((frames / ((now - start) / 1000)).toFixed(1)),
            tier: motion.tier,
            dprCap: motion.dprCap,
            dpr: canvas?.dataset.dpr ?? "",
            sparks: motion.sparks,
            stars: motion.stars,
            dof: motion.dof,
            degraded: motion.degraded,
            cores: navigator.hardwareConcurrency ?? null,
            memory: navigator.deviceMemory ?? null,
            coarse: window.matchMedia("(pointer: coarse)").matches,
            width: window.innerWidth,
          });
        }
      };
      requestAnimationFrame(tick);
    }),
);
await throttle.screenshot({ path: path.join(outDir, "mobile-throttle-p0.7.png"), type: "png" });
await throttle.close();
await throttleContext.close();

const videoContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
});
const videoPage = await videoContext.newPage();
await videoPage.goto(afterSite, { waitUntil: "networkidle", timeout: 60000 });
await settle(videoPage);
await videoPage.evaluate((value) => window.__oneCommandSeek(value), 0.22);
await videoPage.waitForTimeout(400);
for (let step = 0; step < 18; step += 1) {
  await videoPage.mouse.wheel(0, 140);
  await videoPage.waitForTimeout(90);
}
await videoPage.waitForTimeout(500);
await videoPage.close();
await videoContext.close();

await browser.close();

const notes = {
  beforeSite,
  afterSite,
  firstLoadJs: { before: "321 kB", after: "324 kB", routeBefore: "174 kB", routeAfter: "177 kB" },
  holds: { before: beforeNotes, after: afterNotes },
  diffs,
  transitionDesktop,
  transitionAct1,
  transitionMobile,
  chapter,
  reducedHold,
  reducedBoundary,
  reducedProbe,
  throttleStats,
};
await writeFile(path.join(outDir, "notes.json"), JSON.stringify(notes, null, 2));
console.log(JSON.stringify({ diffs, chapter, reducedProbe, throttleStats, transitionDesktop, transitionMobile }, null, 2));
