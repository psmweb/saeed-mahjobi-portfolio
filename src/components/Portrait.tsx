"use client";

import Image from "next/image";
import { useState } from "react";

export function Portrait({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-2xl border border-amber/40 bg-obsidian-raised ${className}`}
    >
      {failed ? (
        <div role="img" aria-label={alt} className="flex h-full items-center justify-center">
          <span className="font-display text-5xl text-amber">{Array.from(alt)[0]}</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 280px, 70vw"
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
