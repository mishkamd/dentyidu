"use client"

import { useState } from "react"
import { Globe, FileText } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { UnifiedTranslationsManager } from "@/components/unified-translations-manager"
import { ContentTranslationsClient } from "@/components/content-translations-client"

interface LanguageMeta {
  code: string
  name: string
  flag: string
}

interface LanguageRow {
  code: string
  name: string
  flag: string
  active: boolean
  isDefault: boolean
  sortOrder: number
}

const TABS = [
  { id: "ui", key: "admin.translations.tabs.ui", fallback: "Traduceri UI", icon: Globe },
  { id: "content", key: "admin.translations.tabs.content", fallback: "Conținut Website", icon: FileText },
] as const

export function TranslationsPageClient({
  translationsData,
  locales,
  languagesMeta,
  defaultLocale,
  initialLanguages,
  contentLocaleData,
  contentLocales,
  roContentData,
}: {
  translationsData: Record<string, Record<string, string>>
  locales: string[]
  languagesMeta: LanguageMeta[]
  defaultLocale: string
  initialLanguages: LanguageRow[]
  contentLocaleData: Record<string, Record<string, any>>
  contentLocales: string[]
  roContentData: Record<string, any>
}) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<"ui" | "content">("ui")

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-1 sm:gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-white/5 w-fit">
        {TABS.map(({ id, key, fallback, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            suppressHydrationWarning
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span suppressHydrationWarning>{t(key, fallback)}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "ui" ? (
        <UnifiedTranslationsManager
          initialData={translationsData}
          locales={locales}
          languagesMeta={languagesMeta}
          defaultLocale={defaultLocale}
          initialLanguages={initialLanguages}
        />
      ) : (
        <ContentTranslationsClient
          allLocaleData={contentLocaleData}
          locales={contentLocales}
          languagesMeta={languagesMeta}
          roContentData={roContentData}
        />
      )}
    </div>
  )
}
