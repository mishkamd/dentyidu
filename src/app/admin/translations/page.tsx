import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { redirect } from "next/navigation"
import { getActiveLanguages, getAllLanguages } from "@/lib/get-languages"
import { getDefaultLocale } from "@/lib/get-languages"
import { getContent, getContentForLocale } from "@/lib/get-content"
import { TranslationsPageClient } from "@/components/translations-page-client"

export const dynamic = "force-dynamic"

function parseContentJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

const CONTENT_KEYS = ["hero", "prices", "contact", "process", "faq", "menu", "footer", "chart", "consultation", "blog", "terms", "privacy", "cookies"] as const

export default async function TranslationsPage() {
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    redirect("/admin")
  }

  // Load all UI translations
  const allTranslations = await prisma.translation.findMany({
    orderBy: { key: "asc" },
  })

  // Load languages from DB
  const languages = await getActiveLanguages()
  const allLanguages = await getAllLanguages()
  const availableLocales = languages.map((l) => l.code)
  const languagesMeta = languages.map((l) => ({ code: l.code, name: l.name, flag: l.flag }))
  const defaultLocale = await getDefaultLocale()

  // Group UI translations by key → { [key]: { [locale]: value } }
  const grouped: Record<string, Record<string, string>> = {}
  for (const t of allTranslations) {
    if (!grouped[t.key]) grouped[t.key] = {}
    grouped[t.key][t.locale] = t.value
  }
  for (const key of Object.keys(grouped)) {
    for (const loc of availableLocales) {
      if (!grouped[key][loc]) grouped[key][loc] = ""
    }
  }

  // Load website content for non-RO locales
  const contentLocales = availableLocales.filter((l) => l !== "ro")
  const contentLocaleData: Record<string, Record<string, any>> = {}

  for (const loc of contentLocales) {
    const results = await Promise.all(
      CONTENT_KEYS.map((key) => getContentForLocale(key, loc))
    )
    const localeData: Record<string, any> = {}
    CONTENT_KEYS.forEach((key, i) => {
      const defaultVal = ["prices", "process", "faq", "menu", "chart", "blog"].includes(key) ? { items: [] } : {}
      localeData[key] = parseContentJson(results[i]?.value, defaultVal)
    })
    contentLocaleData[loc] = localeData
  }

  // Load RO content for export
  const roResults = await Promise.all(
    CONTENT_KEYS.map((key) => getContentForLocale(key, "ro"))
  )
  const roContentData: Record<string, any> = {}
  CONTENT_KEYS.forEach((key, i) => {
    const defaultVal = ["prices", "process", "faq", "menu", "chart", "blog"].includes(key) ? { items: [] } : {}
    roContentData[key] = parseContentJson(roResults[i]?.value, defaultVal)
  })

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.translations.subtitle"] || "Internationalization"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.translations.title"] || "Translation Manager"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(t["admin.translations.description"] || "Gestionează toate traducerile aplicației centralizat — blocuri, meniu, UI — în {count} limbi.").replace("{count}", String(availableLocales.length))}
        </p>
      </header>

      <TranslationsPageClient
        translationsData={grouped}
        locales={availableLocales}
        languagesMeta={languagesMeta}
        defaultLocale={defaultLocale}
        initialLanguages={allLanguages.map((l) => ({
          code: l.code,
          name: l.name,
          flag: l.flag,
          active: l.active,
          isDefault: l.isDefault,
          sortOrder: l.sortOrder,
        }))}
        contentLocaleData={contentLocaleData}
        contentLocales={contentLocales}
        roContentData={roContentData}
      />
    </div>
  )
}
