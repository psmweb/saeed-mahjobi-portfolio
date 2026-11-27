"use client";

import { useLanguage } from "@/context/LanguageContext";

const laterVentures = ["honarmarket", "yadaki-yar", "sandoq-yar"] as const;

/**
 * Scroll landmark for Act 3.
 * Ventures 1–3 are the fixed placard and the 3D slabs.
 * Ventures 4–6 stay unnamed on screen until v0.5.0; their glass placeholders live in the scene.
 */
export function Act3VentureStage() {
  const { dictionary } = useLanguage();

  return (
    <section id="ventures" aria-label={dictionary.acts.ventures.title} className="min-h-[100svh]">
      <h2 className="sr-only">{dictionary.acts.ventures.title}</h2>
      <p className="sr-only">{dictionary.acts.ventures.body}</p>
      <ul className="sr-only" data-venture-placeholder="4-6">
        {laterVentures.map((id) => (
          <li key={id}>{dictionary.ventureNames[id]}</li>
        ))}
      </ul>
    </section>
  );
}
