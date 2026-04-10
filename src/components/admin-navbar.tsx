"use client"

import { Search, Menu, PlusCircle, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { ProfileSettingsDialog } from "@/components/profile-settings-dialog"
import { useSidebar } from "@/components/sidebar-provider"
import { NotificationsPopover } from "@/components/notifications-popover"
import { GlobalSearch } from "@/components/global-search"
import { LanguageSelector } from "@/components/language-selector"

interface AdminNavbarProps {
  admin: {
    email: string
    role: string
    name: string | null
  }
  branding?: { icon?: string; logo?: string; logoType?: "image" | "text" }
}

export function AdminNavbar({ admin }: AdminNavbarProps) {
  const { toggle: toggleDesktopSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()

  // Format name from email or use default
  const name = admin.name || admin.email.split('@')[0].split('.').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ')

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">

      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <Button type="button" variant="ghost" size="icon" onClick={toggleDesktopSidebar} className="lg:hidden w-10 h-10 md:w-[42px] md:h-[42px] flex items-center justify-center text-[#64748b] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm">
          <Menu className="w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
        </Button>

        {/* Desktop Toggle */}
        <Button type="button" variant="ghost" size="icon" onClick={toggleDesktopSidebar} className="hidden lg:flex w-10 h-10 md:w-[42px] md:h-[42px] items-center justify-center text-[#64748b] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm">
          <Menu className="w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
        </Button>

        <div className="flex-1 lg:w-96 relative group lg:ml-2 z-50">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">

        {/* Language Selector */}
        <LanguageSelector adminMode />

        {/* Theme Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-[14px] flex items-center justify-center text-[#64748b] hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm"
          aria-label="Toggle Theme"
        >
          <Sun className="hidden dark:block w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
          <Moon className="block dark:hidden w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
        </Button>

        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

        <NotificationsPopover />

        <div className="flex items-center pl-1">
          <ProfileSettingsDialog user={{ email: admin.email, name: admin.name }}>
            <Button
              variant="ghost" 
              size="icon"
              className="w-10 h-10 md:w-[42px] md:h-[42px] rounded-[14px] flex items-center justify-center bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-all border border-transparent shadow-sm relative overflow-hidden"
              suppressHydrationWarning
            >
              <span className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400">{name.charAt(0)}</span>
            </Button>
          </ProfileSettingsDialog>
        </div>
      </div>
    </header>
  )
}
