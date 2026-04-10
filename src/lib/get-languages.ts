import { prisma } from "@/lib/prisma"
import { cache } from "react"

export type LanguageRow = {
  code: string
  name: string
  flag: string
  active: boolean
  isDefault: boolean
  sortOrder: number
}

/**
 * Get all active languages from DB, ordered by sortOrder.
 * Cached per request via React cache.
 */
export const getActiveLanguages = cache(async (): Promise<LanguageRow[]> => {
  return prisma.language.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })
})

/**
 * Get all languages (including inactive), ordered by sortOrder.
 */
export const getAllLanguages = cache(async (): Promise<LanguageRow[]> => {
  return prisma.language.findMany({
    orderBy: { sortOrder: "asc" },
  })
})

/**
 * Get active locale codes as string array.
 */
export async function getActiveLocaleCodes(): Promise<string[]> {
  const langs = await getActiveLanguages()
  return langs.map((l) => l.code)
}

/**
 * Get the default language code.
 */
export async function getDefaultLocale(): Promise<string> {
  const lang = await prisma.language.findFirst({
    where: { isDefault: true, active: true },
  })
  return lang?.code || "en"
}
