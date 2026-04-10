"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Locale } from "@/lib/i18n"
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n"

type Translations = Record<string, string>

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
  translations: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (_key: string, fallback?: string) => fallback || "",
  translations: {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

export function LanguageProvider({
  children,
  initialLocale,
  initialTranslations,
}: {
  children: React.ReactNode
  initialLocale: Locale
  initialTranslations: Translations
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [translations, setTranslations] = useState<Translations>(initialTranslations)
  const router = useRouter()

  // Sync with server-provided props on navigation
  useEffect(() => {
    setLocaleState(initialLocale)
    setTranslations(initialTranslations)
  }, [initialLocale, initialTranslations])

  const setLocale = useCallback(async (newLocale: Locale) => {
    // Accept any valid locale code (dynamic from DB)
    if (!/^[a-z]{2,5}$/.test(newLocale)) return
    setLocaleState(newLocale)
    setCookie(LOCALE_COOKIE, newLocale)

    // Fetch translations for new locale
    try {
      const res = await fetch(`/api/translations?locale=${newLocale}`)
      if (res.ok) {
        const data = await res.json()
        setTranslations(data)
      }
    } catch {
      // Keep current translations on error
    }

    // Persist to admin profile if logged in
    try {
      await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      })
    } catch {
      // Non-critical — preference already saved in cookie
    }

    // Refresh server components to pick up new locale from cookie
    router.refresh()
  }, [router])

  // Update html lang attribute
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: string, fallback?: string) => {
      return translations[key] || fallback || key
    },
    [translations]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}
