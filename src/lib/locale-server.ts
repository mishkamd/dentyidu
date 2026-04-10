import { cookies, headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { detectLocaleFromHeader, isValidLocale, LOCALE_COOKIE, DEFAULT_LOCALE } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

/**
 * Resolve the current locale on the server side.
 * Priority: cookie (most up-to-date from client) > admin profile > Accept-Language header > default
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()

  // 1. Check cookie (set synchronously by client, always most current)
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie
  }

  // 2. Check admin profile preference
  const sessionId = cookieStore.get("admin_session")?.value
  if (sessionId) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: sessionId },
        select: { language: true },
      })
      if (admin?.language && isValidLocale(admin.language)) {
        return admin.language
      }
    } catch {
      // Fall through
    }
  }

  // 3. Detect from Accept-Language header
  const headerStore = await headers()
  const acceptLang = headerStore.get("accept-language")
  return detectLocaleFromHeader(acceptLang)
}

/**
 * Load all translations for a given locale from DB.
 */
export async function getTranslations(locale: Locale): Promise<Record<string, string>> {
  const rows = await prisma.translation.findMany({
    where: { locale },
  })

  const map: Record<string, string> = {}
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

/**
 * Convenience helper for server actions: resolves locale + loads translations,
 * returns a t(key, fallback) function identical to the client-side one.
 */
export async function getServerT(): Promise<(key: string, fallback?: string) => string> {
  const locale = await getServerLocale()
  const translations = await getTranslations(locale)
  return (key: string, fallback?: string) => translations[key] || fallback || key
}

/**
 * Load content for a given key and locale, with fallback to 'ro'.
 */
export async function getLocalizedContent(key: string, locale: Locale): Promise<string | null> {
  // Try requested locale first
  const content = await prisma.content.findUnique({
    where: { key_locale: { key, locale } },
  })
  if (content) return content.value

  // Fallback to Romanian
  if (locale !== "ro") {
    const fallback = await prisma.content.findUnique({
      where: { key_locale: { key, locale: "ro" } },
    })
    if (fallback) return fallback.value
  }

  return null
}
