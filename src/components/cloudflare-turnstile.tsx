'use client'

import { useEffect, useRef, useState } from "react"
import { getPublicCaptchaSettings } from "@/app/actions/captcha-settings"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

export function CloudflareTurnstile({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void
  onExpire?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  const [siteKey, setSiteKey] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  // Keep refs in sync without triggering effects
  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useEffect(() => {
    getPublicCaptchaSettings().then((settings) => {
      if (settings?.isEnabled && settings.siteKey) {
        setSiteKey(settings.siteKey)
        setEnabled(true)
      }
    }).catch(() => {
      // Silently fail – captcha stays disabled
    })
  }, [])

  useEffect(() => {
    if (!siteKey || !enabled || !containerRef.current) return

    function renderWidget() {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerifyRef.current(token),
        'expired-callback': () => onExpireRef.current?.(),
        theme: 'auto',
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
      if (!document.querySelector('script[src*="turnstile"]')) {
        const script = document.createElement("script")
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        script.async = true
        document.head.appendChild(script)
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey, enabled])

  if (!enabled) return null

  return <div ref={containerRef} className="my-2 flex justify-center" />
}
