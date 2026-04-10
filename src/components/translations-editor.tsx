"use client"

import { useState, useTransition, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bulkUpsertTranslations, deleteTranslation } from "@/app/actions/translations"
import { toast } from "sonner"
import {
  Plus,
  Save,
  Trash2,
  Search,
  Globe,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  Filter,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface Props {
  initialData: Record<string, Record<string, string>>
  locales: string[]
  languagesMeta?: Array<{ code: string; name: string; flag: string }>
}

function getFlag(locale: string, meta?: Props["languagesMeta"]) {
  const found = meta?.find((m) => m.code === locale)
  if (found) return found.flag
  const flags: Record<string, string> = {
    ro: "🇷🇴", en: "🇺🇸", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹",
    pt: "🇵🇹", nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺", uk: "🇺🇦", ja: "🇯🇵",
    zh: "🇨🇳", ko: "🇰🇷", ar: "🇸🇦", tr: "🇹🇷", sv: "🇸🇪",
  }
  return flags[locale] || "🏳️"
}

function getLabel(locale: string, meta?: Props["languagesMeta"]) {
  const found = meta?.find((m) => m.code === locale)
  if (found) return found.name
  const labels: Record<string, string> = {
    ro: "Română", en: "English", fr: "Français", de: "Deutsch", es: "Español",
    it: "Italiano", pt: "Português", nl: "Nederlands", pl: "Polski",
  }
  return labels[locale] || locale.toUpperCase()
}

type FilterMode = "all" | "missing" | "filled"

export function TranslationsEditor({ initialData, locales, languagesMeta }: Props) {
  const { t } = useLanguage()
  const [data, setData] = useState(initialData)
  const [activeLocale, setActiveLocale] = useState(locales[0] || "ro")
  const [newKey, setNewKey] = useState("")
  const [filter, setFilter] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [isPending, startTransition] = useTransition()
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const keys = useMemo(() => Object.keys(data).sort(), [data])

  // Extract categories from dot-notation keys
  const categories = useMemo(() => {
    const cats = new Map<string, string[]>()
    for (const key of keys) {
      const dot = key.indexOf(".")
      const cat = dot > 0 ? key.substring(0, dot) : "_uncategorized"
      if (!cats.has(cat)) cats.set(cat, [])
      cats.get(cat)!.push(key)
    }
    return cats
  }, [keys])

  const categoryNames = useMemo(() => Array.from(categories.keys()).sort(), [categories])

  // Filter keys by search and mode
  const filteredKeys = useMemo(() => {
    let result = activeCategory
      ? categories.get(activeCategory) || []
      : keys

    if (filter) {
      const lf = filter.toLowerCase()
      result = result.filter(
        (k) =>
          k.toLowerCase().includes(lf) ||
          (data[k]?.[activeLocale] || "").toLowerCase().includes(lf)
      )
    }

    if (filterMode === "missing") {
      result = result.filter((k) => !data[k]?.[activeLocale]?.trim())
    } else if (filterMode === "filled") {
      result = result.filter((k) => !!data[k]?.[activeLocale]?.trim())
    }

    return result
  }, [keys, filter, data, activeLocale, filterMode, activeCategory, categories])

  // Group filtered keys by category for display
  const groupedKeys = useMemo(() => {
    if (activeCategory) return new Map([[activeCategory, filteredKeys]])

    const groups = new Map<string, string[]>()
    for (const key of filteredKeys) {
      const dot = key.indexOf(".")
      const cat = dot > 0 ? key.substring(0, dot) : "_uncategorized"
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(key)
    }
    return groups
  }, [filteredKeys, activeCategory])

  function localeStats(locale: string) {
    let filled = 0
    for (const key of keys) {
      if (data[key]?.[locale]?.trim()) filled++
    }
    return { filled, total: keys.length }
  }

  function categoryStats(category: string, locale: string) {
    const catKeys = categories.get(category) || []
    let filled = 0
    for (const key of catKeys) {
      if (data[key]?.[locale]?.trim()) filled++
    }
    return { filled, total: catKeys.length }
  }

  function updateValue(key: string, value: string) {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [activeLocale]: value },
    }))
  }

  function addKey() {
    const k = newKey.trim()
    if (!k || data[k]) return
    setData((prev) => ({
      ...prev,
      [k]: {},
    }))
    setNewKey("")
  }

  function removeKey(key: string) {
    startTransition(async () => {
      for (const loc of locales) {
        if (data[key]?.[loc]) {
          await deleteTranslation(key, loc)
        }
      }
      setData((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
      toast.success(t("translations.keyDeleted", "Cheie ștearsă"))
    })
  }

  function saveLocale() {
    startTransition(async () => {
      const items: Array<{ key: string; locale: string; value: string }> = []
      for (const key of Object.keys(data)) {
        if (data[key][activeLocale] !== undefined) {
          items.push({ key, locale: activeLocale, value: data[key][activeLocale] })
        }
      }
      const result = await bulkUpsertTranslations(items)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  // Export translations for active locale as JSON
  function handleExport() {
    const exportData: Record<string, string> = {}
    for (const key of keys) {
      exportData[key] = data[key]?.[activeLocale] || ""
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translations-${activeLocale}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${t("translations.export", "Export")} ${getLabel(activeLocale, languagesMeta)} ${t("translations.downloaded", "descărcat")}`)
  }

  // Import translations from JSON file
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string)
        if (typeof imported !== "object" || Array.isArray(imported)) {
          toast.error(t("translations.invalidFormat", "Format invalid. Fișierul trebuie să conțină un obiect JSON."))
          return
        }

        let count = 0
        setData((prev) => {
          const copy = { ...prev }
          for (const [key, value] of Object.entries(imported)) {
            if (typeof value !== "string") continue
            if (!copy[key]) copy[key] = {}
            copy[key] = { ...copy[key], [activeLocale]: value }
            count++
          }
          return copy
        })
        toast.success(`${count} ${t("translations.imported", "traduceri importate.")} ${t("translations.saveToPersist", "Salvează pentru a persista.")}`)
      } catch {
        toast.error(t("translations.invalidJsonFile", "Fișier JSON invalid."))
      }
    }
    reader.readAsText(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const missingCount = keys.filter((k) => !data[k]?.[activeLocale]?.trim()).length

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-white/5 flex-wrap">
          {locales.map((loc) => {
            const stats = localeStats(loc)
            return (
              <button
                key={loc}
                onClick={() => setActiveLocale(loc)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeLocale === loc
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <span>{getFlag(loc, languagesMeta)}</span>
                <span>{getLabel(loc, languagesMeta)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  stats.filled === stats.total
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {stats.filled}/{stats.total}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Missing Translation Alert */}
      {missingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
            <strong>{missingCount}</strong> {t("translations.missingFor", "traduceri lipsă pentru")} {getFlag(activeLocale, languagesMeta)} {getLabel(activeLocale, languagesMeta)}.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterMode("missing")}
            className="text-xs text-amber-600 hover:text-amber-800"
          >
            {t("translations.showMissing", "Arată lipsă")}
          </Button>
        </div>
      )}

      {/* Category Sidebar + Content */}
      <div className="flex gap-6">
        {/* Category Nav */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-4 space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">{t("translations.categories", "Categorii")}</p>
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                !activeCategory
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span>{t("ui.all", "Toate")}</span>
              <span className="text-xs text-muted-foreground">{keys.length}</span>
            </button>
            {categoryNames.map((cat) => {
              const catStats = categoryStats(cat, activeLocale)
              const isFull = catStats.filled === catStats.total
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeCategory === cat
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="truncate">{cat === "_uncategorized" ? t("translations.otherKeys", "Alte chei") : cat}</span>
                  <span className="flex items-center gap-1">
                    {isFull ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-amber-500">{catStats.total - catStats.filled}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("translations.searchPlaceholder", "Caută cheie sau valoare...")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Mode */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-white/5">
              {([
                { mode: "all" as const, label: t("ui.all", "Toate") },
                { mode: "missing" as const, label: t("translations.missing", "Lipsă") },
                { mode: "filled" as const, label: t("translations.complete", "Complete") },
              ]).map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterMode === mode
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Add + Actions Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder={t("translations.newKeyPlaceholder", "Cheie nouă (ex: nav.home)")}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKey()}
                className="w-56"
              />
              <Button variant="outline" onClick={addKey} disabled={!newKey.trim()}>
                <Plus className="h-4 w-4 mr-1" /> {t("ui.add", "Adaugă")}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" /> {t("ui.export", "Export")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" /> {t("ui.import", "Import")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button onClick={saveLocale} disabled={isPending}>
                <Save className="h-4 w-4 mr-1" /> {isPending ? t("ui.saving", "Se salvează...") : t("ui.save", "Salvează")}
              </Button>
            </div>
          </div>

          {/* Mobile Category Filter */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  !activeCategory
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "border-gray-200 dark:border-zinc-700 text-zinc-500"
                }`}
              >
                {t("ui.all", "Toate")}
              </button>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    activeCategory === cat
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                      : "border-gray-200 dark:border-zinc-700 text-zinc-500"
                  }`}
                >
                  {cat === "_uncategorized" ? t("translations.other", "Alte") : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Translations Table — grouped by category */}
          {Array.from(groupedKeys.entries()).map(([category, catKeys]) => {
            const isCollapsed = collapsedCategories.has(category)
            const catStats = categoryStats(category, activeLocale)

            return (
              <div
                key={category}
                className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/30 shadow-sm"
              >
                {/* Category Header */}
                {!activeCategory && (
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                      <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                        {category === "_uncategorized" ? t("translations.otherKeys", "Alte chei") : category}
                      </span>
                      <span className="text-xs text-muted-foreground">({catKeys.length} {t("translations.keys", "chei")})</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      catStats.filled === catStats.total
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {catStats.filled}/{catStats.total}
                    </span>
                  </button>
                )}

                {/* Keys Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-64">
                            <Globe className="inline h-4 w-4 mr-1 -mt-0.5" />
                            {t("translations.key", "Cheie")}
                          </th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            <span className="mr-1">{getFlag(activeLocale, languagesMeta)}</span>
                            {getLabel(activeLocale, languagesMeta)}
                          </th>
                          {activeLocale !== "ro" && (
                            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-56">
                              🇷🇴 {t("translations.roReference", "Referință RO")}
                            </th>
                          )}
                          <th className="w-12" />
                        </tr>
                      </thead>
                      <tbody>
                        {catKeys.map((key) => {
                          const refValue = activeLocale !== "ro" ? (data[key]?.["ro"] || "") : ""
                          const isMissing = !data[key]?.[activeLocale]?.trim()

                          return (
                            <tr
                              key={key}
                              className={`border-b last:border-0 transition-colors ${
                                isMissing
                                  ? "bg-amber-50/50 dark:bg-amber-500/5"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <td className="px-4 py-2 font-mono text-xs text-muted-foreground align-top pt-3">
                                <div className="flex items-center gap-1.5">
                                  {isMissing && (
                                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                  )}
                                  <span className="truncate" title={key}>
                                    {key}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  value={data[key]?.[activeLocale] || ""}
                                  onChange={(e) => updateValue(key, e.target.value)}
                                  placeholder={`[${activeLocale.toUpperCase()}]`}
                                  className={`text-sm h-9 ${isMissing ? "border-amber-300 dark:border-amber-500/30" : ""}`}
                                />
                              </td>
                              {activeLocale !== "ro" && (
                                <td
                                  className="px-4 py-2 text-xs text-muted-foreground align-top pt-3 max-w-[220px] truncate"
                                  title={refValue}
                                >
                                  {refValue && (
                                    <span className="opacity-70">{refValue}</span>
                                  )}
                                </td>
                              )}
                              <td className="px-2 py-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeKey(key)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}

          {filteredKeys.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {filter || filterMode !== "all"
                ? t("translations.noResults", "Nu s-au găsit traduceri cu filtrele aplicate.")
                : t("translations.noTranslations", "Nu există traduceri. Adaugă prima cheie mai sus.")}
            </div>
          )}

          {/* Footer Stats */}
          <p className="text-xs text-muted-foreground">
            {filteredKeys.length} din {keys.length} chei ·{" "}
            {getFlag(activeLocale, languagesMeta)} {getLabel(activeLocale, languagesMeta)} ·{" "}
            {localeStats(activeLocale).filled} {t("translations.translated", "traduse")} ·{" "}
            {missingCount > 0 && <span className="text-amber-500">{missingCount} {t("translations.missingShort", "lipsă")}</span>}
            {missingCount === 0 && <span className="text-emerald-500">✓ {t("translations.completeShort", "complet")}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
