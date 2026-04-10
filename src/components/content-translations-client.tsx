"use client"

import { useState, useRef } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { bulkUpsertContent } from "@/app/actions/content"
import { HeroContentForm } from "@/components/hero-content-form"
import { PricesContentForm } from "@/components/prices-content-form"
import { ContactContentForm } from "@/components/contact-content-form"
import { ProcessContentForm } from "@/components/process-content-form"
import { FaqContentForm } from "@/components/faq-content-form"
import { MenuContentForm } from "@/components/menu-content-form"
import { FooterContentForm } from "@/components/footer-content-form"
import { ChartContentForm } from "@/components/chart-content-form"
import { ConsultationContentForm } from "@/components/consultation-content-form"
import { BlogContentForm } from "@/components/blog-content-form"
import { TermsContentForm } from "@/components/terms-content-form"
import { PrivacyContentForm } from "@/components/privacy-content-form"
import { CookiesContentForm } from "@/components/cookies-content-form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface LanguageMeta {
  code: string
  name: string
  flag: string
}

const SECTIONS = [
  { key: "meniu-navigare", tKey: "admin.content.sections.menu", fallback: "Meniu Navigare", contentKey: "menu" },
  { key: "continut-hero", tKey: "admin.content.sections.hero", fallback: "Conținut Homepage (Hero)", contentKey: "hero" },
  { key: "preturi-servicii", tKey: "admin.content.sections.prices", fallback: "Prețuri și Servicii", contentKey: "prices" },
  { key: "grafic-statistici", tKey: "admin.content.sections.chart", fallback: "Grafic Economii (Statistici)", contentKey: "chart" },
  { key: "procesul-lucru", tKey: "admin.content.sections.process", fallback: "Procesul de Lucru", contentKey: "process" },
  { key: "blog-transformari", tKey: "admin.content.sections.blog", fallback: "Blog / Transformări", contentKey: "blog" },
  { key: "sectiune-consultatie", tKey: "admin.content.sections.consultation", fallback: "Secțiune Consultație", contentKey: "consultation" },
  { key: "intrebari-faq", tKey: "admin.content.sections.faq", fallback: "Întrebări Frecvente (FAQ)", contentKey: "faq" },
  { key: "informatii-contact", tKey: "admin.content.sections.contact", fallback: "Informații Contact", contentKey: "contact" },
  { key: "footer", tKey: "admin.content.sections.footer", fallback: "Footer", contentKey: "footer" },
  { key: "termeni-conditii", tKey: "admin.content.sections.terms", fallback: "Termeni și Condiții", contentKey: "terms" },
  { key: "politica-confidentialitate", tKey: "admin.content.sections.privacy", fallback: "Politică de Confidențialitate", contentKey: "privacy" },
  { key: "politica-cookies", tKey: "admin.content.sections.cookies", fallback: "Politică de Cookies", contentKey: "cookies" },
] as const

function renderForm(contentKey: string, data: any, locale: string) {
  switch (contentKey) {
    case "menu": return <MenuContentForm key={locale} initialData={data} locale={locale} />
    case "hero": return <HeroContentForm key={locale} initialData={data} locale={locale} />
    case "prices": return <PricesContentForm key={locale} initialData={data} locale={locale} />
    case "chart": return <ChartContentForm key={locale} initialData={data} locale={locale} />
    case "process": return <ProcessContentForm key={locale} initialData={data} locale={locale} />
    case "consultation": return <ConsultationContentForm key={locale} initialData={data} locale={locale} />
    case "blog": return <BlogContentForm key={locale} initialData={data} locale={locale} />
    case "faq": return <FaqContentForm key={locale} initialData={data} locale={locale} />
    case "contact": return <ContactContentForm key={locale} initialData={data} locale={locale} />
    case "footer": return <FooterContentForm key={locale} initialData={data} locale={locale} />
    case "terms": return <TermsContentForm key={locale} initialData={data} locale={locale} />
    case "privacy": return <PrivacyContentForm key={locale} initialData={data} locale={locale} />
    case "cookies": return <CookiesContentForm key={locale} initialData={data} locale={locale} />
    default: return null
  }
}

export function ContentTranslationsClient({
  allLocaleData,
  locales,
  languagesMeta,
  roContentData,
}: {
  allLocaleData: Record<string, Record<string, any>>
  locales: string[] // non-RO locales only
  languagesMeta: LanguageMeta[]
  roContentData: Record<string, any>
}) {
  const { t } = useLanguage()
  const [activeLocale, setActiveLocale] = useState(locales[0] || "en")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentData = allLocaleData[activeLocale] || {}
  const metaMap = Object.fromEntries(languagesMeta.map((l) => [l.code, l]))

  function handleExportRoContent() {
    const exportData: Record<string, any> = {}
    for (const section of SECTIONS) {
      exportData[section.contentKey] = roContentData[section.contentKey] || {}
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "content-ro.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Export RO descărcat")
  }

  function handleImportContent(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string)
        if (typeof imported !== "object" || Array.isArray(imported)) {
          toast.error("Format JSON invalid.")
          return
        }
        const entries: Array<{ key: string; locale: string; value: string }> = []
        for (const [key, value] of Object.entries(imported)) {
          if (typeof value !== "object" || value === null) continue
          entries.push({ key, locale: activeLocale, value: JSON.stringify(value) })
        }
        if (entries.length === 0) {
          toast.error("Nicio secțiune validă găsită în fișier.")
          return
        }
        const result = await bulkUpsertContent(entries)
        if (result.success) {
          toast.success(result.message)
          window.location.reload()
        } else {
          toast.error(result.message)
        }
      } catch {
        toast.error("Fișier JSON invalid.")
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (locales.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("admin.content.noActiveLanguages", "Nu există limbi active pentru traducere. Adaugă limbi din pagina Limbi.")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 sm:gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-white/5 flex-wrap">
          {locales.map((loc) => {
            const meta = metaMap[loc]
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeLocale === loc
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span>{meta?.flag || "🏳️"}</span>
                <span className="hidden sm:inline">{meta?.name || loc.toUpperCase()}</span>
                <span className="sm:hidden">{loc.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportRoContent}>
            <Download className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Export RO</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Import {metaMap[activeLocale]?.name || activeLocale.toUpperCase()}</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportContent}
          />
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="w-full">
        {SECTIONS.map(({ key, tKey, fallback, contentKey }) => (
          <AccordionItem key={`${key}-${activeLocale}`} value={key} className="border-b-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden mb-6">
            <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline [&[data-state=open]]:border-b border-gray-100 dark:border-white/5 transition-none m-0">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white mb-0">{t(tKey, fallback)}</h3>
            </AccordionTrigger>
            <AccordionContent className="p-3 sm:p-6 pt-3 sm:pt-6">
              {renderForm(contentKey, currentData[contentKey] || {}, activeLocale)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
