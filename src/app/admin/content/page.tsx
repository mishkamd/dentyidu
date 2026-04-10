import { getContent } from "@/lib/get-content"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { ContentPageClient } from "@/components/content-page-client"

export const dynamic = 'force-dynamic'

function parseContentJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

const CONTENT_KEYS = ["hero", "prices", "contact", "process", "faq", "menu", "footer", "chart", "consultation", "blog"] as const

export default async function WebsiteConfigurationPage() {
  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  // Load RO content only
  const results = await Promise.all(CONTENT_KEYS.map((key) => getContent(key)))
  const data: Record<string, any> = {}
  CONTENT_KEYS.forEach((key, i) => {
    const defaultVal = ["prices", "process", "faq", "menu", "chart", "blog"].includes(key) ? { items: [] } : {}
    data[key] = parseContentJson(results[i]?.value, defaultVal)
  })

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.content.subtitle"] || "Website management"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.content.title"] || "Website Configuration"}
        </h1>
      </header>

      <ContentPageClient data={data} />
    </div>
  )
}
