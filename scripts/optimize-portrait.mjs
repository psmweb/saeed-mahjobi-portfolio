/**
 * Write the 720px-wide mobile variant of the approved editorial portrait.
 *
 * sharp is a devDependency. Nothing here is imported by the page.
 * The 1080×2003 source is not rewritten, so its bytes stay the approved file.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public/portrait/saeed-portrait-editorial.webp");
const target = path.join(root, "public/portrait/saeed-portrait-editorial-720.webp");
const input = await readFile(source);
const meta = await sharp(input).metadata();

if (meta.format !== "webp" || meta.width !== 1080 || meta.height !== 2003 || !meta.hasAlpha) {
  throw new Error(
    `Expected a 1080×2003 WebP with alpha. Got ${meta.format} ${meta.width}×${meta.height} alpha=${Boolean(meta.hasAlpha)}.`,
  );
}

const buffer = await sharp(input)
  .resize({ width: 720, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 100, effort: 6 })
  .toBuffer();
const out = await sharp(buffer).metadata();
await writeFile(target, buffer);
console.log(
  `${path.relative(root, target)} ${buffer.length} bytes ${out.width}×${out.height} alpha=${Boolean(out.hasAlpha)}`,
);
