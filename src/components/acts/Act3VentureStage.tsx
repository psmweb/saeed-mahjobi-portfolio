"use client";

import { actSectionHeight } from "@/components/scene/cinema";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Scroll landmark for Act 3.
 * Visible copy is the fixed placard. The six slabs live in the scene.
 */
export function Act3VentureStage() {
  const { dictionary } = useLanguage();

  return (
    <section id="ventures" aria-label={dictionary.acts.ventures.title} style={{ height: actSectionHeight(2) }}>
      <h2 className="sr-only">{dictionary.acts.ventures.title}</h2>
      <p className="sr-only">{dictionary.acts.ventures.body}</p>
    </section>
  );
}
