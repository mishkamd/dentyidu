export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dentymd.md"
export const SITE_NAME = "DentyMD"
export const DEFAULT_OG_IMAGE = "/image/og-default.jpg"

export const SUPPORTED_LOCALES = ["ro", "en", "fr"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_MAP: Record<string, string> = {
  ro: "ro_RO",
  en: "en_US",
  fr: "fr_FR",
}
