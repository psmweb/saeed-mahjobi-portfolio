/**
 * Frameless editorial cutout for the Act 1 hero.
 * `src` is the approved 1080×2003 WebP. Do not recompress it.
 * `mobileSrc` is the 720px-wide variant from `npm run optimize:portrait`.
 */
export const heroPortrait = {
  src: "/portrait/saeed-portrait-editorial.webp",
  width: 1080,
  height: 2003,
  mobileSrc: "/portrait/saeed-portrait-editorial-720.webp",
  mobileWidth: 720,
  mobileHeight: 1335,
} as const;

/**
 * Older framed paths. `Portrait.tsx` is not mounted on the page.
 * The hero uses `heroPortrait` and must not request these files.
 */
export const portraitAssetsReady = false;

export const portraits = {
  editorial: heroPortrait.src,
  cutout: heroPortrait.src,
} as const;
