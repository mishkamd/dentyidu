"use client"

import { useState, useTransition, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  bulkSaveAllLocales,
  deleteTranslationKey,
  copyLocaleTranslations,
} from "@/app/actions/translations"
import {
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/app/actions/languages"
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
  Copy,
  FolderOpen,
  Hash,
  Star,
  ToggleLeft,
  ToggleRight,
  Languages,
  Settings2,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useRouter } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LanguageRow {
  code: string
  name: string
  flag: string
  active: boolean
  isDefault: boolean
  sortOrder: number
}

interface Props {
  initialData: Record<string, Record<string, string>>
  locales: string[]
  languagesMeta: Array<{ code: string; name: string; flag: string }>
  defaultLocale: string
  initialLanguages: LanguageRow[]
}

const KNOWN_FLAGS: Record<string, string> = {
  ro: "🇷🇴", en: "🇺🇸", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹",
  pt: "🇵🇹", nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺", uk: "🇺🇦", ja: "🇯🇵",
  zh: "🇨🇳", ko: "🇰🇷", ar: "🇸🇦", tr: "🇹🇷", sv: "🇸🇪", da: "🇩🇰",
  fi: "🇫🇮", no: "🇳🇴", cs: "🇨🇿", hu: "🇭🇺", el: "🇬🇷", bg: "🇧🇬",
  hr: "🇭🇷", sk: "🇸🇰", sl: "🇸🇮", nb: "🇳🇴",
}

const KNOWN_LABELS: Record<string, string> = {
  ro: "Română", en: "English", fr: "Français", de: "Deutsch", es: "Español",
  it: "Italiano", pt: "Português", nl: "Nederlands", pl: "Polski", ru: "Русский",
  uk: "Українська", ja: "日本語", zh: "中文", ko: "한국어", ar: "العربية",
  tr: "Türkçe", sv: "Svenska", da: "Dansk", fi: "Suomi", no: "Norsk",
  cs: "Čeština", hu: "Magyar", el: "Ελληνικά", bg: "Български",
  hr: "Hrvatski", sk: "Slovenčina", sl: "Slovenščina", nb: "Norsk Bokmål",
}

type FilterMode = "all" | "missing" | "filled"

interface CategoryNode {
  name: string
  fullPath: string
  keys: string[]
  children: Map<string, CategoryNode>
  allKeys: string[] // includes children's keys
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFlag(locale: string, meta?: Props["languagesMeta"]) {
  return meta?.find((m) => m.code === locale)?.flag || "🏳️"
}

function getLabel(locale: string, meta?: Props["languagesMeta"]) {
  return meta?.find((m) => m.code === locale)?.name || locale.toUpperCase()
}

function buildCategoryTree(keys: string[]): CategoryNode {
  const root: CategoryNode = {
    name: "all",
    fullPath: "",
    keys: [],
    children: new Map(),
    allKeys: [...keys],
  }

  for (const key of keys) {
    const parts = key.split(".")
    // Use first 2 levels for tree structure
    let current = root
    for (let i = 0; i < Math.min(parts.length - 1, 2); i++) {
      const segment = parts[i]
      const fullPath = parts.slice(0, i + 1).join(".")
      if (!current.children.has(segment)) {
        current.children.set(segment, {
          name: segment,
          fullPath,
          keys: [],
          children: new Map(),
          allKeys: [],
        })
      }
      current = current.children.get(segment)!
    }
    current.keys.push(key)
    current.allKeys.push(key)
  }

  // Propagate allKeys up
  function propagateKeys(node: CategoryNode): string[] {
    let all = [...node.keys]
    for (const child of node.children.values()) {
      all = all.concat(propagateKeys(child))
    }
    node.allKeys = all
    return all
  }
  propagateKeys(root)

  return root
}

function getKeysForPath(tree: CategoryNode, path: string | null): string[] {
  if (!path) return tree.allKeys
  const parts = path.split(".")
  let current = tree
  for (const part of parts) {
    const child = current.children.get(part)
    if (!child) return []
    current = child
  }
  return current.allKeys
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UnifiedTranslationsManager({
  initialData,
  locales,
  languagesMeta,
  defaultLocale,
  initialLanguages,
}: Props) {
  const { t } = useLanguage()
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [highlightLocale, setHighlightLocale] = useState(defaultLocale)
  const [isPending, startTransition] = useTransition()
  const [newKey, setNewKey] = useState("")
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set())
  const [showCopyPanel, setShowCopyPanel] = useState(false)
  const [copySource, setCopySource] = useState(defaultLocale)
  const [copyTarget, setCopyTarget] = useState(locales.find((l) => l !== defaultLocale) || "en")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Language management state
  const [languages, setLanguages] = useState(initialLanguages)
  const [showLangPanel, setShowLangPanel] = useState(false)
  const [newLangCode, setNewLangCode] = useState("")
  const [newLangName, setNewLangName] = useState("")
  const [newLangFlag, setNewLangFlag] = useState("")
  const [confirmDeleteLang, setConfirmDeleteLang] = useState<string | null>(null)

  // Derived data
  const allKeys = useMemo(() => Object.keys(data).sort(), [data])
  const tree = useMemo(() => buildCategoryTree(allKeys), [allKeys])

  // Category keys with filter + search
  const filteredKeys = useMemo(() => {
    let keys = getKeysForPath(tree, activeCategory)

    if (search) {
      const q = search.toLowerCase()
      keys = keys.filter(
        (k) =>
          k.toLowerCase().includes(q) ||
          locales.some((loc) => (data[k]?.[loc] || "").toLowerCase().includes(q))
      )
    }

    if (filterMode === "missing") {
      keys = keys.filter((k) => locales.some((loc) => !data[k]?.[loc]?.trim()))
    } else if (filterMode === "filled") {
      keys = keys.filter((k) => locales.every((loc) => !!data[k]?.[loc]?.trim()))
    }

    return keys.sort()
  }, [tree, activeCategory, search, filterMode, data, locales])

  // Stats
  function localeStats(locale: string, keys?: string[]) {
    const k = keys || allKeys
    let filled = 0
    for (const key of k) {
      if (data[key]?.[locale]?.trim()) filled++
    }
    return { filled, total: k.length }
  }

  function globalMissingCount() {
    let count = 0
    for (const key of allKeys) {
      for (const loc of locales) {
        if (!data[key]?.[loc]?.trim()) count++
      }
    }
    return count
  }

  // Mutations
  const updateValue = useCallback(
    (key: string, locale: string, value: string) => {
      setData((prev) => ({
        ...prev,
        [key]: { ...prev[key], [locale]: value },
      }))
      setDirtyKeys((prev) => new Set(prev).add(key))
    },
    []
  )

  function addKey() {
    const k = newKey.trim()
    if (!k || data[k]) {
      if (data[k]) toast.error(t("translations.keyExists", "Cheia există deja."))
      return
    }
    const empty: Record<string, string> = {}
    for (const loc of locales) empty[loc] = ""
    setData((prev) => ({ ...prev, [k]: empty }))
    setDirtyKeys((prev) => new Set(prev).add(k))
    setNewKey("")
    toast.success(t("translations.keyAdded", "Cheie adăugată. Completează traducerile și salvează."))
  }

  function removeKey(key: string) {
    if (!confirm(t("translations.confirmDeleteKey", `Șterge cheia "${key}" din toate limbile?`))) return
    startTransition(async () => {
      const result = await deleteTranslationKey(key)
      if (result.success) {
        setData((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
        setDirtyKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  function saveAll() {
    startTransition(async () => {
      const entries: Array<{ key: string; locale: string; value: string }> = []
      for (const key of dirtyKeys) {
        if (!data[key]) continue
        for (const loc of locales) {
          if (data[key][loc] !== undefined) {
            entries.push({ key, locale: loc, value: data[key][loc] })
          }
        }
      }
      if (entries.length === 0) {
        toast.info(t("translations.nothingToSave", "Nu sunt modificări de salvat."))
        return
      }
      const result = await bulkSaveAllLocales(entries)
      if (result.success) {
        setDirtyKeys(new Set())
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleCopyLocale(onlyMissing: boolean) {
    startTransition(async () => {
      const result = await copyLocaleTranslations(copySource, copyTarget, onlyMissing)
      if (result.success) {
        // Refresh local data
        setData((prev) => {
          const copy = { ...prev }
          for (const key of Object.keys(copy)) {
            if (onlyMissing && copy[key]?.[copyTarget]?.trim()) continue
            if (copy[key]?.[copySource]?.trim()) {
              copy[key] = { ...copy[key], [copyTarget]: copy[key][copySource] }
            }
          }
          return copy
        })
        toast.success(result.message)
        setShowCopyPanel(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  // Export/Import
  function handleExport(locale: string) {
    const exportData: Record<string, string> = {}
    for (const key of allKeys) {
      exportData[key] = data[key]?.[locale] || ""
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translations-${locale}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("translations.exportDownloaded", "Export {lang} descărcat").replace("{lang}", getLabel(locale, languagesMeta)))
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string)
        if (typeof imported !== "object" || Array.isArray(imported)) {
          toast.error(t("translations.invalidFormat", "Format invalid."))
          return
        }
        let count = 0
        setData((prev) => {
          const copy = { ...prev }
          for (const [key, value] of Object.entries(imported)) {
            if (typeof value !== "string") continue
            if (!copy[key]) {
              copy[key] = {}
              for (const loc of locales) copy[key][loc] = ""
            }
            copy[key] = { ...copy[key], [highlightLocale]: value }
            count++
          }
          return copy
        })
        setDirtyKeys((prev) => {
          const next = new Set(prev)
          for (const key of Object.keys(imported)) next.add(key)
          return next
        })
        toast.success(t("translations.importSuccess", "{count} traduceri importate pentru {lang}. Salvează pentru a persista.").replace("{count}", String(count)).replace("{lang}", getLabel(highlightLocale, languagesMeta)))
      } catch {
        toast.error(t("translations.invalidJsonFile", "Fișier JSON invalid."))
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ─── Language Management Handlers ───────────────────────────────────────────

  const handleLangCodeChange = (val: string) => {
    const code = val.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5)
    setNewLangCode(code)
    if (code.length >= 2) {
      if (!newLangName) setNewLangName(KNOWN_LABELS[code] || "")
      if (!newLangFlag) setNewLangFlag(KNOWN_FLAGS[code] || "🏳️")
    }
  }

  const handleCreateLang = () => {
    if (!newLangCode.trim() || !newLangName.trim()) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("code", newLangCode.trim())
      fd.set("name", newLangName.trim())
      fd.set("flag", newLangFlag.trim() || "🏳️")
      const result = await createLanguage(fd)
      if (result.success) {
        toast.success(result.message)
        setNewLangCode("")
        setNewLangName("")
        setNewLangFlag("")
        setShowLangPanel(false)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleToggleLangActive = (lang: LanguageRow) => {
    if (lang.isDefault && lang.active) {
      toast.error(t("language.cannotDisableDefault", "Nu puteți dezactiva limba implicită."))
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.set("code", lang.code)
      fd.set("name", lang.name)
      fd.set("flag", lang.flag)
      fd.set("active", String(!lang.active))
      fd.set("isDefault", String(lang.isDefault))
      const result = await updateLanguage(fd)
      if (result.success) {
        setLanguages((prev) => prev.map((l) => (l.code === lang.code ? { ...l, active: !l.active } : l)))
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleSetDefaultLang = (lang: LanguageRow) => {
    if (!lang.active) {
      toast.error(t("language.activateBeforeDefault", "Activați limba înainte de a o seta ca implicită."))
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.set("code", lang.code)
      fd.set("name", lang.name)
      fd.set("flag", lang.flag)
      fd.set("active", "true")
      fd.set("isDefault", "true")
      const result = await updateLanguage(fd)
      if (result.success) {
        setLanguages((prev) => prev.map((l) => ({ ...l, isDefault: l.code === lang.code })))
        toast.success(`${lang.flag} ${lang.name} ${t("language.nowDefault", "este acum limba implicită.")}`)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDeleteLang = (code: string) => {
    startTransition(async () => {
      const result = await deleteLanguage(code)
      if (result.success) {
        setLanguages((prev) => prev.filter((l) => l.code !== code))
        setConfirmDeleteLang(null)
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  // Sidebar toggle
  function toggleNode(path: string) {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const totalMissing = globalMissingCount()

  // ─── Render Sidebar Tree ─────────────────────────────────────────────────────

  function renderTreeNode(node: CategoryNode, depth: number = 0) {
    const hasChildren = node.children.size > 0
    const isExpanded = expandedNodes.has(node.fullPath)
    const isActive = activeCategory === node.fullPath
    const nodeStats = localeStats(highlightLocale, node.allKeys)
    const isFull = nodeStats.filled === nodeStats.total

    return (
      <div key={node.fullPath || "root"}>
        <button
          type="button"
          onClick={() => {
            setActiveCategory(isActive ? null : node.fullPath)
            if (hasChildren && !isExpanded) toggleNode(node.fullPath)
          }}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${
            isActive
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-medium"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.fullPath)
                }}
                className="shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </span>
            ) : (
              <Hash className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            {isFull ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <span className="text-xs text-amber-500">
                {nodeStats.total - nodeStats.filled}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{nodeStats.total}</span>
          </span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {Array.from(node.children.values())
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // ─── Main Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Languages Management Panel ──────────────────────────────────────── */}
      <div className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/30 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white text-sm">
              {t("language.configuredLanguages", "Limbi configurate")}
            </h2>
            <span className="text-xs text-muted-foreground">({languages.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Unsaved indicator */}
            {dirtyKeys.size > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                {dirtyKeys.size} {t("translations.unsaved", "modificări nesalvate")}
              </span>
            )}
            {totalMissing > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode("missing")}
                className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
              >
                <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
                {totalMissing} {t("translations.missingShort", "lipsă")}
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLangPanel(!showLangPanel)}
              className="rounded-lg gap-1.5 h-8"
            >
              {showLangPanel ? <Settings2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{t("language.addLanguage", "Adaugă limbă")}</span>
            </Button>
          </div>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4">
          {languages.map((lang) => {
            const stats = localeStats(lang.code)
            const pct = stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0
            const isSelected = highlightLocale === lang.code

            return (
              <div
                key={lang.code}
                onClick={() => setHighlightLocale(lang.code)}
                className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5 ring-1 ring-emerald-200 dark:ring-emerald-500/20"
                    : "border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10"
                } ${!lang.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white text-sm leading-tight">{lang.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{lang.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {lang.isDefault && (
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleLangActive(lang) }}
                      disabled={isPending}
                      className="transition-colors"
                      title={lang.active ? t("ui.deactivate", "Dezactivează") : t("ui.activate", "Activează")}
                    >
                      {lang.active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{stats.filled}/{stats.total}</span>
                    <span className={
                      pct === 100
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : pct >= 50
                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-red-600 dark:text-red-400 font-semibold"
                    }>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                  {!lang.isDefault && lang.active && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSetDefaultLang(lang) }}
                      disabled={isPending}
                      className="text-[10px] text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      {t("language.setDefault", "Implicită")}
                    </button>
                  )}
                  {lang.isDefault && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 px-1.5 py-0.5">
                      {t("language.default", "Implicită")}
                    </span>
                  )}
                  <div className="flex-1" />
                  {!lang.isDefault && (
                    <>
                      {confirmDeleteLang === lang.code ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteLang(lang.code) }}
                            disabled={isPending}
                            className="text-[10px] text-red-600 font-medium px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-500/10 hover:bg-red-100"
                          >
                            {t("ui.yesDelete", "Da, șterge")}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteLang(null) }}
                            className="text-[10px] text-muted-foreground px-1.5 py-0.5"
                          >
                            {t("ui.no", "Nu")}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteLang(lang.code) }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Language Panel */}
        {showLangPanel && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("language.codeLabel", "Cod (ISO 639)")}</label>
                <Input
                  placeholder={t("language.codePlaceholder", "de, es, it...")}
                  value={newLangCode}
                  onChange={(e) => handleLangCodeChange(e.target.value)}
                  className="w-28 h-9"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("form.name", "Nume")}</label>
                <Input
                  placeholder={t("language.namePlaceholder", "Deutsch, Español...")}
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="w-44 h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("language.flagLabel", "Steag")}</label>
                <Input
                  placeholder="🇩🇪"
                  value={newLangFlag}
                  onChange={(e) => setNewLangFlag(e.target.value)}
                  className="w-20 h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateLang}
                  disabled={isPending || !newLangCode.trim() || !newLangName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("ui.create", "Creează")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowLangPanel(false)
                    setNewLangCode("")
                    setNewLangName("")
                    setNewLangFlag("")
                  }}
                >
                  {t("ui.cancel", "Anulează")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* ─── Sidebar ─────────────────────────────────────────────────────────── */}
        <div className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-4 space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">
              {t("translations.categories", "Categorii")}
            </p>

            {/* All keys */}
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                !activeCategory
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t("ui.all", "Toate")}</span>
              </div>
              <span className="text-xs text-muted-foreground">{allKeys.length}</span>
            </button>

            {/* Category tree */}
            {Array.from(tree.children.values())
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => renderTreeNode(child))}
          </div>
        </div>

        {/* ─── Main Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("translations.searchPlaceholder", "Caută cheie sau valoare...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-white/5">
              {(
                [
                  { mode: "all" as const, label: t("ui.all", "Toate") },
                  { mode: "missing" as const, label: t("translations.missing", "Lipsă") },
                  { mode: "filled" as const, label: t("translations.complete", "Complete") },
                ] as const
              ).map(({ mode, label }) => (
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

          {/* Actions Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 flex-1 min-w-0">
              <Input
                placeholder={t("translations.newKeyPlaceholder", "Cheie nouă (ex: nav.home)")}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKey()}
                className="flex-1 min-w-0"
              />
              <Button variant="outline" className="shrink-0 h-7 sm:h-8 px-2 sm:px-3 text-xs" onClick={addKey} disabled={!newKey.trim()}>
                <Plus className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">{t("ui.add", "Adaugă")}</span>
              </Button>
            </div>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                onClick={() => setShowCopyPanel(!showCopyPanel)}
              >
                <Copy className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">{t("translations.copy", "Copiază")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                onClick={() => handleExport(highlightLocale)}
              >
                <Download className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">{t("ui.export", "Export")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">{t("ui.import", "Import")}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button className="h-7 sm:h-8 px-2 sm:px-3 text-xs" onClick={saveAll} disabled={isPending || dirtyKeys.size === 0}>
                <Save className="h-3.5 w-3.5 sm:mr-1" />{" "}
                <span className="hidden sm:inline">
                {isPending
                  ? t("ui.saving", "Se salvează...")
                  : t("ui.save", "Salvează")}
                </span>
              </Button>
            </div>
          </div>

          {/* Copy Panel */}
          {showCopyPanel && (
            <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {t("translations.copyFrom", "Copiază din")}
              </span>
              <select
                value={copySource}
                onChange={(e) => setCopySource(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-zinc-900"
              >
                {locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {getFlag(loc, languagesMeta)} {getLabel(loc, languagesMeta)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-blue-600 dark:text-blue-400">→</span>
              <select
                value={copyTarget}
                onChange={(e) => setCopyTarget(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-zinc-900"
              >
                {locales
                  .filter((l) => l !== copySource)
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {getFlag(loc, languagesMeta)} {getLabel(loc, languagesMeta)}
                    </option>
                  ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyLocale(true)}
                disabled={isPending}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-500/30"
              >
                {t("translations.copyMissing", "Doar lipsă")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm(t("translations.confirmCopyAll", "Suprascrie toate traducerile existente?"))) {
                    handleCopyLocale(false)
                  }
                }}
                disabled={isPending}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-500/30"
              >
                {t("translations.copyAll", "Toate (suprascrie)")}
              </Button>
            </div>
          )}

          {/* Mobile Category Pills */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <Globe className="w-4 h-4 text-muted-foreground" />
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
              {Array.from(tree.children.values())
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((child) => (
                  <button
                    key={child.fullPath}
                    type="button"
                    onClick={() =>
                      setActiveCategory(activeCategory === child.fullPath ? null : child.fullPath)
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      activeCategory === child.fullPath
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                        : "border-gray-200 dark:border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
            </div>
          </div>

          {/* ─── Multi-Locale Table ──────────────────────────────────────────── */}
          <div className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/30 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 sm:px-4 py-3 font-medium text-muted-foreground w-36 sm:w-52 sticky left-0 bg-muted/50 z-10">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        {t("translations.key", "Cheie")}
                      </div>
                    </th>
                    {locales.map((loc) => (
                      <th
                        key={loc}
                        className={`text-left px-3 py-3 font-medium min-w-[200px] transition-colors ${
                          highlightLocale === loc
                            ? "bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setHighlightLocale(loc)}
                          className="flex items-center gap-1.5 hover:opacity-80"
                        >
                          <span>{getFlag(loc, languagesMeta)}</span>
                          <span>{getLabel(loc, languagesMeta)}</span>
                        </button>
                      </th>
                    ))}
                    <th className="w-12 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((key) => {
                    const hasAnyMissing = locales.some((loc) => !data[key]?.[loc]?.trim())
                    const isDirty = dirtyKeys.has(key)

                    return (
                      <tr
                        key={key}
                        className={`border-b last:border-0 transition-colors ${
                          hasAnyMissing
                            ? "bg-amber-50/50 dark:bg-amber-500/5"
                            : isDirty
                              ? "bg-blue-50/30 dark:bg-blue-500/5"
                              : "hover:bg-muted/30"
                        }`}
                      >
                        {/* Key column */}
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground align-top pt-3.5 sticky left-0 bg-inherit z-10">
                          <div className="flex items-center gap-1.5">
                            {hasAnyMissing && (
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                            {isDirty && !hasAnyMissing && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[180px]" title={key}>
                              {key}
                            </span>
                          </div>
                        </td>

                        {/* Locale columns */}
                        {locales.map((loc) => {
                          const val = data[key]?.[loc] || ""
                          const isMissing = !val.trim()
                          const isHighlighted = highlightLocale === loc

                          return (
                            <td
                              key={loc}
                              className={`px-2 py-1.5 ${
                                isHighlighted
                                  ? "bg-emerald-50/30 dark:bg-emerald-500/5"
                                  : ""
                              }`}
                            >
                              <Input
                                value={val}
                                onChange={(e) => updateValue(key, loc, e.target.value)}
                                placeholder={isMissing ? `[${loc.toUpperCase()}]` : ""}
                                className={`text-sm h-8 ${
                                  isMissing
                                    ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-transparent"
                                    : ""
                                }`}
                              />
                            </td>
                          )
                        })}

                        {/* Delete */}
                        <td className="px-2 py-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKey(key)}
                            className="h-8 w-8 text-destructive/60 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredKeys.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {search || filterMode !== "all"
                  ? t("translations.noResults", "Nu s-au găsit traduceri cu filtrele aplicate.")
                  : t("translations.noTranslations", "Nu există traduceri. Adaugă prima cheie mai sus.")}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {filteredKeys.length} / {allKeys.length} {t("translations.keys", "chei")}
              {activeCategory && (
                <span className="ml-1 text-zinc-400">
                  ({activeCategory})
                </span>
              )}
            </span>
            <div className="flex gap-4">
              {locales.map((loc) => {
                const stats = localeStats(loc)
                const pct = stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0
                return (
                  <span key={loc} className="flex items-center gap-1">
                    <span>{getFlag(loc, languagesMeta)}</span>
                    <span
                      className={
                        pct === 100
                          ? "text-emerald-600 dark:text-emerald-400"
                          : pct > 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }
                    >
                      {pct}%
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
