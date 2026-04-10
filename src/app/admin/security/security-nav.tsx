'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Code, ShieldCheck, ScrollText } from "lucide-react"

const tabs = [
  { href: '/admin/security/scripts', label: 'Scripturi', icon: Code },
  { href: '/admin/security/captcha', label: 'Captcha', icon: ShieldCheck },
  { href: '/admin/security/logs', label: 'Loguri', icon: ScrollText },
]

export function SecurityNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl w-fit">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              active
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
