'use client'

import { useEffect } from "react"
import { getActiveSecurityScripts } from "@/app/actions/security-scripts"

export function SecurityScriptsInjector() {
  useEffect(() => {
    let mounted = true
    const elements: HTMLElement[] = []

    getActiveSecurityScripts().then((scripts) => {
      if (!mounted) return
      for (const script of scripts ?? []) {
        if (script.type === "css") {
          const style = document.createElement("style")
          style.setAttribute("data-security-script", script.id)
          style.textContent = script.content
          if (script.position === "body") {
            document.body.appendChild(style)
          } else {
            document.head.appendChild(style)
          }
          elements.push(style)
        } else if (script.type === "js") {
          const target = script.position === "body" ? document.body : document.head
          if (script.content.includes("<script")) {
            // HTML snippet (e.g. Google Analytics full paste) — parse and re-inject each <script> tag
            const temp = document.createElement("div")
            temp.innerHTML = script.content
            temp.querySelectorAll("script").forEach((s) => {
              const el = document.createElement("script")
              el.setAttribute("data-security-script", script.id)
              Array.from(s.attributes).forEach((attr) => el.setAttribute(attr.name, attr.value))
              if (!s.getAttribute("src") && s.textContent) el.textContent = s.textContent
              target.appendChild(el)
              elements.push(el)
            })
          } else {
            // Pure JS code
            const el = document.createElement("script")
            el.setAttribute("data-security-script", script.id)
            el.textContent = script.content
            target.appendChild(el)
            elements.push(el)
          }
        }
      }
    }).catch(() => {
      // Silently fail – don't break the page
    })

    return () => {
      mounted = false
      elements.forEach((el) => el.remove())
    }
  }, [])

  return null
}
