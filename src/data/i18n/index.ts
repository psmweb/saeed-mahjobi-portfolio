import type { Locale } from "./types";
import { en } from "./en";
import { fa } from "./fa";

export const dictionaries = { en, fa } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type { Dictionary, Direction, Locale, ActId } from "./types";
export { ACT_ORDER } from "./types";
