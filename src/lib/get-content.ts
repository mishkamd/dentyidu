import { prisma } from "@/lib/prisma"

/**
 * Fetch content by key. Always loads the base (RO) version.
 * Text translations are handled separately via the Translation model.
 * Content stores structure, images, logos and other non-translatable data.
 */
export async function getContent(key: string) {
  return prisma.content.findUnique({
    where: { key_locale: { key, locale: "ro" } },
  })
}

/**
 * Fetch content for a specific locale (used in admin for editing per-locale).
 */
export async function getContentForLocale(key: string, locale: string) {
  return prisma.content.findUnique({
    where: { key_locale: { key, locale } },
  })
}

/**
 * Fetch content for a locale with fallback to RO.
 * Returns parsed JSON or the provided fallback value.
 */
export async function getContentForLocaleWithFallback<T>(
  key: string,
  locale: string,
  fallback: T
): Promise<T> {
  const content = await getContentForLocale(key, locale)
  if (content?.value) {
    try {
      return JSON.parse(content.value) as T
    } catch {
      // fall through
    }
  }

  // Fallback to RO if not found or empty
  if (locale !== "ro") {
    const roContent = await getContent(key)
    if (roContent?.value) {
      try {
        return JSON.parse(roContent.value) as T
      } catch {
        // fall through
      }
    }
  }

  return fallback
}
