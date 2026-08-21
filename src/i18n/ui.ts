import { en } from './en';
import { de } from './de';

export const languages = {
  de: 'Deutsch',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'de';

export const ui = { de, en } as const;

export type TranslationKey = keyof typeof en;

/**
 * Returns a lookup for one language, falling back to the default language when
 * a key has not been translated yet.
 */
export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return (ui[lang] as Record<string, string>)[key]
      ?? (ui[defaultLang] as Record<string, string>)[key]
      ?? key;
  };
}

/** Reads the active language from the URL: /en/... is English, everything else German. */
export function getLangFromUrl(url: URL): Lang {
  const [, base, maybeLang] = url.pathname.split('/');
  const segment = base === 'mark-portfolio' ? maybeLang : base;
  return segment in languages ? (segment as Lang) : defaultLang;
}

/** Path of the same page in the other language, base path included. */
export function pathForLang(lang: Lang, base: string): string {
  const root = base.replace(/\/$/, '');
  return lang === defaultLang ? `${root}/` : `${root}/${lang}/`;
}
