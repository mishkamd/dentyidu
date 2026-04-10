export const SUPPORTED_LOCALES = ["ro", "en", "fr"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "locale"

export const LOCALE_LABELS: Record<Locale, string> = {
  ro: "Română",
  en: "English",
  fr: "Français",
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  ro: "🇷🇴",
  en: "🇺🇸",
  fr: "🇫🇷",
}

/**
 * Detect locale from Accept-Language header.
 * Rules: fr* → fr, ro* → ro, else → en
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const languages = acceptLanguage
    .split(",")
    .map((part) => {
      const [lang, q] = part.trim().split(";q=")
      return { lang: lang.toLowerCase().trim(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of languages) {
    if (lang.startsWith("fr")) return "fr"
    if (lang.startsWith("ro") || lang.startsWith("mo")) return "ro"
  }
  return DEFAULT_LOCALE
}

export function isValidLocale(value: string): value is Locale {
  // Accept known locales and any valid ISO 639-1 code (2-5 lowercase letters)
  return SUPPORTED_LOCALES.includes(value as Locale) || /^[a-z]{2,5}$/.test(value)
}
