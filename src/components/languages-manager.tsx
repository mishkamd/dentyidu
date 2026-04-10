"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/app/actions/languages"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  Languages,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

interface LanguageRow {
  code: string
  name: string
  flag: string
  active: boolean
  isDefault: boolean
  sortOrder: number
}

interface Stat {
  code: string
  name: string
  flag: string
  total: number
  filled: number
  percentage: number
}

interface Props {
  initialLanguages: LanguageRow[]
  stats: Stat[]
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

export function LanguagesManager({ initialLanguages, stats }: Props) {
  const { t } = useLanguage()
  const router = useRouter()
  const [languages, setLanguages] = useState(initialLanguages)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newFlag, setNewFlag] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Auto-fill name/flag when code changes
  const handleCodeChange = (val: string) => {
    const code = val.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5)
    setNewCode(code)
    if (code.length >= 2) {
      if (!newName) setNewName(KNOWN_LABELS[code] || "")
      if (!newFlag) setNewFlag(KNOWN_FLAGS[code] || "🏳️")
    }
  }

  const handleCreate = () => {
    if (!newCode.trim() || !newName.trim()) return

    startTransition(async () => {
      const fd = new FormData()
      fd.set("code", newCode.trim())
      fd.set("name", newName.trim())
      fd.set("flag", newFlag.trim() || "🏳️")

      const result = await createLanguage(fd)
      if (result.success) {
        toast.success(result.message)
        setShowAdd(false)
        setNewCode("")
        setNewName("")
        setNewFlag("")
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleToggleActive = (lang: LanguageRow) => {
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
        setLanguages((prev) =>
          prev.map((l) => (l.code === lang.code ? { ...l, active: !l.active } : l))
        )
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleSetDefault = (lang: LanguageRow) => {
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
        setLanguages((prev) =>
          prev.map((l) => ({
            ...l,
            isDefault: l.code === lang.code,
          }))
        )
        toast.success(`${lang.flag} ${lang.name} ${t("language.nowDefault", "este acum limba implicită.")}`)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleDelete = (code: string) => {
    startTransition(async () => {
      const result = await deleteLanguage(code)
      if (result.success) {
        setLanguages((prev) => prev.filter((l) => l.code !== code))
        setConfirmDelete(null)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const getStatForCode = (code: string) => stats.find((s) => s.code === code)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.code}
            className="p-4 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.flag}</span>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white text-sm">{stat.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{stat.code}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stat.filled} / {stat.total} traduceri</span>
                <span className={
                  stat.percentage === 100
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : stat.percentage >= 50
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-red-600 dark:text-red-400 font-semibold"
                }>
                  {stat.percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stat.percentage === 100
                      ? "bg-emerald-500"
                      : stat.percentage >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Languages Table */}
      <div className="border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/30 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-white">{t("language.configuredLanguages", "Limbi configurate")}</h2>
            <span className="text-xs text-muted-foreground">({languages.length})</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-lg gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t("language.addLanguage", "Adaugă limbă")}
          </Button>
        </div>

        {/* Add Language Panel */}
        {showAdd && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("language.codeLabel", "Cod (ISO 639)")}</label>
                <Input
                  placeholder={t("language.codePlaceholder", "de, es, it...")}
                  value={newCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-28 h-9"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("form.name", "Nume")}</label>
                <Input
                  placeholder={t("language.namePlaceholder", "Deutsch, Español...")}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-44 h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">{t("language.flagLabel", "Steag")}</label>
                <Input
                  placeholder="🇩🇪"
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  className="w-20 h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={isPending || !newCode.trim() || !newName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("ui.create", "Creează")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAdd(false)
                    setNewCode("")
                    setNewName("")
                    setNewFlag("")
                  }}
                >
                  {t("ui.cancel", "Anulează")}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">{t("language.flag", "Steag")}</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">{t("language.language", "Limbă")}</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">{t("language.code", "Cod")}</th>
                <th className="text-center px-6 py-3 font-medium text-muted-foreground">{t("ui.status", "Status")}</th>
                <th className="text-center px-6 py-3 font-medium text-muted-foreground">
                  <BarChart3 className="inline w-4 h-4 mr-1 -mt-0.5" />
                  {t("language.translations", "Traduceri")}
                </th>
                <th className="text-center px-6 py-3 font-medium text-muted-foreground">{t("language.default", "Implicită")}</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">{t("ui.actions", "Acțiuni")}</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => {
                const stat = getStatForCode(lang.code)
                return (
                  <tr
                    key={lang.code}
                    className={`border-b last:border-0 transition-colors ${
                      !lang.active ? "opacity-50" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium text-zinc-900 dark:text-white">{lang.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {lang.code}
                      </code>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(lang)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                        title={lang.active ? t("ui.deactivate", "Dezactivează") : t("ui.activate", "Activează")}
                      >
                        {lang.active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">{t("status.activeFemale", "Activă")}</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-zinc-400" />
                            <span className="text-zinc-500">{t("status.inactiveFemale", "Inactivă")}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {stat ? (
                        <Link
                          href="/admin/translations"
                          className="inline-flex items-center gap-1.5 text-xs hover:underline"
                        >
                          <span>{stat.filled} / {stat.total} {t("language.translationsLower", "traduceri")}</span>
                          <span className={
                            stat.percentage === 100
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : stat.percentage >= 50
                              ? "text-amber-600 dark:text-amber-400 font-semibold"
                              : "text-red-600 dark:text-red-400 font-semibold"
                          }>
                            {stat.filled}/{stat.total}
                          </span>
                          <span className="text-muted-foreground">({stat.percentage}%)</span>
                          {stat.percentage < 100 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {lang.isDefault ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {t("language.default", "Implicită")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(lang)}
                          disabled={isPending || !lang.active}
                          className="text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50"
                        >
                          {t("ui.set", "Setează")}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {!lang.isDefault && (
                        <>
                          {confirmDelete === lang.code ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-xs text-red-600">{t("ui.confirmShort", "Sigur?")}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(lang.code)}
                                disabled={isPending}
                                className="h-7 text-xs"
                              >
                                {t("ui.yesDelete", "Da, șterge")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDelete(null)}
                                className="h-7 text-xs"
                              >
                                {t("ui.no", "Nu")}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setConfirmDelete(lang.code)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <p className="text-xs text-muted-foreground">
        {languages.filter((l) => l.active).length} {t("language.activeLanguages", "limbi active")} {t("ui.from", "din")} {languages.length} {t("language.configured", "configurate")} ·
        {t("language.defaultLanguage", "Limba implicită:")} {languages.find((l) => l.isDefault)?.flag} {languages.find((l) => l.isDefault)?.name || "—"}
      </p>
    </div>
  )
}
