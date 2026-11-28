import { heroPortrait } from "@/data/portraits";

/**
 * Frameless editorial cutout in the Act 1 slot.
 * The file already fades at the shoulders and the hem. No frame, crop, or shadow.
 */
export function HeroPortrait() {
  return (
    <picture className="pointer-events-none absolute bottom-[28%] right-3 w-[min(46vw,200px)] sm:bottom-[11%] sm:right-[6%] sm:w-[min(26vw,360px)]">
      <source
        media="(max-width: 639px)"
        srcSet={heroPortrait.mobileSrc}
        type="image/webp"
        width={heroPortrait.mobileWidth}
        height={heroPortrait.mobileHeight}
      />
      <img
        src={heroPortrait.src}
        alt="Saeed Mahjobi"
        width={heroPortrait.width}
        height={heroPortrait.height}
        fetchPriority="high"
        decoding="async"
        sizes="(max-width: 639px) 46vw, 26vw"
        className="block h-auto w-full object-contain object-bottom"
      />
    </picture>
  );
}
