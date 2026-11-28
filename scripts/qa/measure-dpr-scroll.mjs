import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:3100";

function installProbe() {
  const changes = [];
  window.__dprBufferChanges = changes;
  window.__dprProbeScrolling = false;
  window.__dprHoldActive = true;

  for (const axis of ["width", "height"]) {
    const desc = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, axis);
    Object.defineProperty(HTMLCanvasElement.prototype, axis, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return desc.get.call(this);
      },
      set(value) {
        const previous = desc.get.call(this);
        if (previous !== value) {
          changes.push({
            axis,
            from: previous,
            to: value,
            t: performance.now(),
            scrolling: window.__dprProbeScrolling === true,
            y: window.scrollY,
          });
        }
        desc.set.call(this, value);
      },
    });
  }

  const ping = () => {
    if (!window.__dprHoldActive) return;
    window.dispatchEvent(new Event("scroll"));
    window.setTimeout(ping, 180);
  };
  window.setTimeout(ping, 0);
}

function cluster(changes) {
  const groups = [];
  for (const change of changes) {
    const last = groups[groups.length - 1];
    if (!last || change.t - last.t > 80 || change.scrolling !== last.scrolling) {
      groups.push({ t: change.t, scrolling: change.scrolling, y: change.y, axes: [change] });
    } else {
      last.axes.push(change);
    }
  }
  return groups;
}

async function measure(page) {
  await page.addInitScript(installProbe);
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => typeof window.__oneCommandSeek === "function", null, { timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas");
    return canvas && canvas.width > 0 && canvas.dataset.dpr;
  });

  const before = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const motion = window.__oneCommandMotion();
    return {
      width: canvas.width,
      height: canvas.height,
      dpr: canvas.dataset.dpr,
      tier: motion.tier,
      dprCap: motion.dprCap,
      device: window.devicePixelRatio,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  const first = await page.evaluate(async () => {
    window.__dprHoldActive = false;
    window.__dprProbeScrolling = true;
    const started = performance.now();
    const duration = 10000;
    const stall = 70;
    let degraded = false;
    await new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - started) / duration);
        window.__oneCommandSeek(t);
        if (window.__oneCommandMotion().degraded) degraded = true;
        const until = performance.now() + stall;
        while (performance.now() < until) {
          /* hold the frame so PerformanceMonitor samples a low rate */
        }
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const canvas = document.querySelector("canvas");
    const motion = window.__oneCommandMotion();
    window.__dprProbeScrolling = false;
    const stopped = performance.now();
    return {
      degraded,
      progress: motion.current,
      dpr: canvas.dataset.dpr,
      width: canvas.width,
      height: canvas.height,
      stopped,
    };
  });

  const settled = await page.evaluate(async () => {
    const canvas = document.querySelector("canvas");
    const startedDpr = canvas.dataset.dpr;
    const samples = [];
    const started = performance.now();
    let calm = 0;
    let last = started;
    while (performance.now() - started < 5000) {
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (dt < 500) calm += dt;
      samples.push({
        t: now - started,
        calm,
        width: canvas.width,
        height: canvas.height,
        dpr: canvas.dataset.dpr,
      });
      if (calm > 1600 && canvas.dataset.dpr !== startedDpr) break;
      if (calm > 2000) break;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return samples;
  });

  const second = await page.evaluate(async () => {
    window.__dprProbeScrolling = true;
    const started = performance.now();
    const duration = 6000;
    const stall = 70;
    await new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - started) / duration);
        window.__oneCommandSeek(1 - t);
        const until = performance.now() + stall;
        while (performance.now() < until) {
          /* second pass, still slow, must not resize again */
        }
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const canvas = document.querySelector("canvas");
    window.__dprProbeScrolling = false;
    return {
      progress: window.__oneCommandMotion().current,
      dpr: canvas.dataset.dpr,
      width: canvas.width,
      height: canvas.height,
    };
  });

  const changes = await page.evaluate(() => window.__dprBufferChanges);
  const firstChanges = changes.filter((change) => change.scrolling && change.t <= first.stopped);
  const secondChanges = changes.filter((change) => change.scrolling && change.t > first.stopped);
  const idleChanges = changes.filter((change) => !change.scrolling && change.t > first.stopped);

  return {
    before,
    first,
    settledTail: settled[settled.length - 1] ?? null,
    settledSamples: settled.length,
    second,
    firstScrollResizes: cluster(firstChanges).length,
    secondScrollResizes: cluster(secondChanges).length,
    idleResizes: cluster(idleChanges).length,
    idleChanges,
    errors: errors.slice(0, 8),
  };
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const desktopReport = await measure(desktop);
await desktop.close();

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mobileReport = await measure(mobile);
await browser.close();

const report = { base, desktop: desktopReport, mobile: mobileReport };
function heldDuringScroll(report) {
  return (
    report.firstScrollResizes === 0 &&
    report.secondScrollResizes === 0 &&
    report.first.progress > 0.98 &&
    report.second.width === report.settledTail?.width &&
    report.second.height === report.settledTail?.height &&
    report.errors.length === 0
  );
}

const ok =
  heldDuringScroll(desktopReport) &&
  heldDuringScroll(mobileReport) &&
  desktopReport.first.degraded === true &&
  mobileReport.first.degraded === true &&
  desktopReport.idleResizes === 1 &&
  mobileReport.idleResizes <= 1;

console.log(JSON.stringify(report, null, 2));
if (!ok) {
  console.error("DPR scroll probe failed");
  process.exit(1);
}
