"use client"

import { useEffect } from "react"

export function TelegramWebAppInit() {
  useEffect(() => {
    const tg = (window as unknown as Record<string, unknown>).Telegram as
      | { WebApp?: { ready: () => void; expand: () => void } }
      | undefined
    if (tg?.WebApp) {
      tg.WebApp.ready()
      tg.WebApp.expand()
    }
  }, [])

  return null
}
