/** Small locale helpers used by pages and the language switcher. */

import { defaultLang, languages, type Lang } from './ui';

/** Root URL for a locale: en → '/', others → '/<lang>/'. */
export function localeRoot(lang: Lang): string {
  return lang === defaultLang ? '/' : `/${lang}/`;
}

/**
 * Locale-prefixed URL for a locale-relative path.
 * localePath('ca', 'projects/tap-vi/') → '/ca/projects/tap-vi/'
 * localePath('en', '') → '/'
 */
export function localePath(lang: Lang, path: string): string {
  return localeRoot(lang) + path.replace(/^\/+/, '');
}

/** Narrow an arbitrary string to a supported Lang, falling back to default. */
export function toLang(value: string | undefined): Lang {
  return (languages as readonly string[]).includes(value ?? '')
    ? (value as Lang)
    : defaultLang;
}
