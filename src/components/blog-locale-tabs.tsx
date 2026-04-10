"use client"

import { useState } from "react"
import { BlogContentForm } from "@/components/blog-content-form"
import type { BlogContent } from "@/lib/content"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const KNOWN_FLAGS: Record<string, string> = {
  ro: "🇷🇴", en: "🇺🇸", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹",
  pt: "🇵🇹", nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺", uk: "🇺🇦", ja: "🇯🇵",
  zh: "🇨🇳", ko: "🇰🇷", ar: "🇸🇦", tr: "🇹🇷", sv: "🇸🇪", da: "🇩🇰",
  fi: "🇫🇮", no: "🇳🇴", cs: "🇨🇿", hu: "🇭🇺", el: "🇬🇷", bg: "🇧🇬",
}

const KNOWN_LABELS: Record<string, string> = {
  ro: "Română", en: "English", fr: "Français", de: "Deutsch", es: "Español",
  it: "Italiano", pt: "Português", nl: "Nederlands", pl: "Polski", ru: "Русский",
  uk: "Українська", ja: "日本語", zh: "中文", ko: "한국어", ar: "العربية",
  tr: "Türkçe", sv: "Svenska", da: "Dansk", fi: "Suomi", no: "Norsk",
  cs: "Čeština", hu: "Magyar", el: "Ελληνικά", bg: "Български",
}

export function BlogLocaleTabs({
  allLocaleData,
  locales,
  roData,
  managePostsLabel,
}: {
  allLocaleData: Record<string, BlogContent>
  locales: string[]
  roData: BlogContent
  managePostsLabel: string
}) {
  const [activeLocale, setActiveLocale] = useState("ro")

  const getFlag = (loc: string) => KNOWN_FLAGS[loc] || "🏳️"
  const getLabel = (loc: string) => KNOWN_LABELS[loc] || loc.toUpperCase()

  const currentData = allLocaleData[activeLocale] || { items: [] }
  const hasContent = currentData.items.length > 0

  const handleCopyFromRo = () => {
    // We copy RO data into the current locale slot in allLocaleData
    // Then force re-render by switching locale away and back
    allLocaleData[activeLocale] = JSON.parse(JSON.stringify(roData))
    const loc = activeLocale
    setActiveLocale("__reload")
    setTimeout(() => setActiveLocale(loc), 0)
    toast.success(`Conținutul RO a fost copiat pentru ${getLabel(loc)}. Editează textele și salvează.`)
  }

  return (
    <>
      {/* Language Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-white/5 flex-wrap">
          {locales.map((loc) => {
            const data = allLocaleData[loc]
            const count = data?.items?.length || 0
            return (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeLocale === loc
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span>{getFlag(loc)}</span>
                <span>{getLabel(loc)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  count > 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-200/80 text-zinc-400 dark:bg-zinc-700/50 dark:text-zinc-500"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Copy from RO hint when no content for this locale */}
      {activeLocale !== "ro" && !hasContent && roData.items.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <div className="text-sm text-amber-700 dark:text-amber-400 flex-1">
            Nu există conținut pentru <strong>{getFlag(activeLocale)} {getLabel(activeLocale)}</strong>.
            Poți copia articolele din Română ca punct de plecare, apoi traduce textele.
          </div>
          <Button
            type="button"
            variant="admin_primary"
            size="admin_pill"
            onClick={handleCopyFromRo}
            className="shrink-0"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiază din 🇷🇴 RO
          </Button>
        </div>
      )}

      {/* Content Form */}
      {activeLocale !== "__reload" && (
        <section className="grid grid-cols-1 gap-8">
          <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {managePostsLabel} — {getFlag(activeLocale)} {getLabel(activeLocale)}
              </h3>
            </div>
            <div className="p-6">
              <BlogContentForm
                key={activeLocale}
                initialData={currentData}
                locale={activeLocale}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
