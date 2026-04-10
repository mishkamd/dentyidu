/**
 * content-translations.ts
 *
 * Utility to merge Content JSON arrays with Translation key overrides.
 * Content still provides structure (images, URLs, numbers, array ordering).
 * Translation keys override text fields when present.
 */

/**
 * Merge an array of items with translation overrides for specific text fields.
 *
 * @param items - Array from Content JSON (e.g., prices.items, faq.items)
 * @param prefix - Translation key prefix (e.g., "homepage.prices.items")
 * @param textFields - Field names to override from translations (e.g., ["title", "description"])
 * @param translations - Full translations map from getTranslations()
 */
export function mergeItemsWithTranslations<T extends Record<string, unknown>>(
  items: T[],
  prefix: string,
  textFields: string[],
  translations: Record<string, string>
): T[] {
  return items.map((item, i) => {
    const merged = { ...item }
    for (const field of textFields) {
      const key = `${prefix}.${i}.${field}`
      const val = translations[key]
      if (val) (merged as Record<string, unknown>)[field] = val
    }
    return merged
  })
}
