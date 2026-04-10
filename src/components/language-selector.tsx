"use client"

import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { Languages } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface LanguageMeta {
  code: string
  name: string
  flag: string
  isDefault?: boolean
}

export function LanguageSelector({ adminMode = false }: { adminMode?: boolean }) {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [languages, setLanguages] = useState<LanguageMeta[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  // Update dropdown position when opening
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right - 20,
      })
    }
  }, [open])

  // Load available languages from API
  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.ok ? res.json() : [])
      .then((data: LanguageMeta[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setLanguages(data)
        }
      })
      .catch(() => {
        // Fallback to hardcoded if API fails
      })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Build items: prefer dynamic languages, fallback to static
  const items = languages.length > 0
    ? languages.map((l) => ({ code: l.code as Locale, name: l.name, flag: l.flag }))
    : (Object.keys(LOCALE_LABELS) as Locale[]).map((code) => ({
        code,
        name: LOCALE_LABELS[code],
        flag: LOCALE_FLAGS[code] || "🏳️",
      }))

  const currentName = items.find((i) => i.code === locale)?.name || locale

  return (
    <div className="relative" ref={ref}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className={adminMode 
          ? "w-10 h-10 md:w-[42px] md:h-[42px] rounded-[14px] flex items-center justify-center text-[#64748b] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm"
          : "rounded-full"
        }
        title={currentName}
      >
        {adminMode ? (
          <Languages className="w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
        ) : (
          <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        )}
        <span className="sr-only">Schimbă limba</span>
      </Button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
          className="w-40 rounded-xl bg-background/60 backdrop-blur-2xl border border-border/50 p-1 shadow-2xl z-[200] space-y-1 ring-1 ring-white/10"
        >
          {items.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLocale(item.code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                locale === item.code ? "bg-accent font-medium" : ""
              }`}
            >
              <span className="text-base">{item.flag}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
