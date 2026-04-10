"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutAdmin } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  MessageSquare,
  LogOut,
  Settings,
  User,
  Users,
  X,
  Globe,
  Bot,
  BookOpen,
  Scale,
  Languages,
  Shield,
} from "lucide-react"
import { Tooth } from "@/components/ui/icons"

import { useSidebar } from "./sidebar-provider"
import { useLanguage } from "@/components/language-provider"

export function SidebarContent({
  role,
  pathname,
  logoutAdmin,
  branding,
  stats
}: {
  role: string,
  pathname: string,
  logoutAdmin: () => Promise<void>,
  branding?: { icon?: string; logo?: string; logoType?: "image" | "text" },
  stats?: { totalPatients: number; finalizedPatientsMonth: number }
}) {
  const { toggle, isOpen } = useSidebar()
  const { t } = useLanguage()
  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true
    if (path !== '/admin' && pathname?.startsWith(path)) return true
    return false
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && isOpen) {
      toggle()
    }
  }

  const percentage = stats && stats.totalPatients > 0
    ? Math.round((stats.finalizedPatientsMonth / stats.totalPatients) * 100)
    : 0

  const mainLinks = [
    { href: '/admin', icon: LayoutDashboard, label: t('admin.sidebar.dashboard', 'Panou Control') },
    { href: '/admin/calendar', icon: CalendarDays, label: t('admin.sidebar.calendar', 'Calendar') },
    { href: '/admin/patients', icon: Users, label: t('admin.sidebar.patients', 'Pacienți & Logistică') },
    { href: '/admin/treatment', icon: Tooth, label: t('admin.sidebar.treatment', 'Tratament') },
    { href: '/admin/invoices', icon: FileText, label: t('admin.sidebar.invoices', 'Facturi') },
    { href: '/admin/leads', icon: MessageSquare, label: t('admin.sidebar.leads', 'Mesaje') },
  ].filter(link => {
    if (role === 'DENTIST' && (link.href === '/admin/patients' || link.href === '/admin/invoices')) return false
    return true
  })

  const configLinks = [
    { href: '/admin/users', label: t('admin.sidebar.users', 'User Control'), icon: User },
    { href: '/admin/translations', label: t('admin.sidebar.translations', 'Traduceri'), icon: Languages },
    { href: '/admin/content', label: t('admin.sidebar.content', 'Website Config'), icon: Settings },
    { href: '/admin/blog', label: t('admin.sidebar.blog', 'Blog & Galerie'), icon: BookOpen },
    { href: '/admin/terms', label: t('admin.sidebar.legal', 'Pagini Legale'), icon: Scale },
    { href: '/admin/settings', label: t('admin.sidebar.settings', 'Setări Telegram'), icon: Bot },
    { href: '/admin/security/scripts', label: t('admin.sidebar.security', 'Securitate'), icon: Shield },
  ]

  return (
    <>
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/5 shrink-0 bg-transparent">
        <div className="flex items-center gap-3 w-full justify-between md:justify-start">
          <Link href="/admin" prefetch={false} className="flex items-center gap-3 group transition-all">
            {branding?.icon ? (
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image src={branding.icon} alt="Icon" fill className="object-contain" sizes="40px" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Tooth className="w-6 h-6" />
              </div>
            )}
            {branding?.logo ? (
              branding.logoType === 'text' ? (
                <span className="text-zinc-900 dark:text-white group-hover:text-primary transition-colors duration-300 text-lg font-bold tracking-tight">{branding.logo}</span>
              ) : (
                <Image src={branding.logo} alt="Logo" width={120} height={32} className="h-6 w-auto object-contain dark:brightness-0 dark:invert" />
              )
            ) : (
              <span className="text-zinc-900 dark:text-white group-hover:text-primary transition-colors duration-300 text-lg font-bold tracking-tight">AdminDenty</span>
            )}
          </Link>
          <Button type="button" variant="ghost" size="icon" onClick={toggle} className="md:hidden text-zinc-500 dark:text-zinc-400">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1 mt-2 uppercase tracking-widest">{t('admin.sidebar.sectionMain', 'Principal')}</p>

        {mainLinks.map((link) => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group",
                active
                  ? "text-zinc-900 dark:text-white bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
              )}
              onClick={handleLinkClick}
            >
              <span className={cn(
                "flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-md transition-colors",
                active
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              )}>
                <link.icon className="w-4 h-4" />
              </span>
              <span className={cn(
                "truncate",
                active ? "font-medium" : ""
              )}>{link.label}</span>
            </Link>
          )
        })}

        {role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{t('admin.sidebar.sectionConfig', 'Configurare')}</p>
            </div>
            {configLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group",
                    active
                      ? "text-zinc-900 dark:text-white bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                  )}
                  onClick={handleLinkClick}
                >
                  <span className={cn(
                    "flex-shrink-0 flex items-center justify-center w-[30px] h-[30px] rounded-md transition-colors",
                    active
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  )}>
                    <link.icon className="w-4 h-4" />
                  </span>
                  <span className={cn(
                    "truncate",
                    active ? "font-medium" : ""
                  )}>{link.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom Widgets */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-transparent shrink-0">
        <Link href="/admin/treatment" className="block mb-4 p-4 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none hover:border-emerald-500/30 transition-all cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">Status</p>
              <p className="text-2xl text-zinc-900 dark:text-white font-medium tracking-tight">
                {stats ? stats.finalizedPatientsMonth : 0}
                <span className="text-zinc-400 dark:text-zinc-600 font-normal text-lg ml-0.5">/{stats ? stats.totalPatients : 0}</span>
              </p>
            </div>
            <Tooth className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-black/40 h-1.5 rounded-full overflow-hidden relative z-10">
            <div
              className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </Link>

        <form action={logoutAdmin}>
          <Button variant="ghost" className="w-full justify-start h-auto flex items-center gap-3 p-2 transition-all cursor-pointer text-left group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-medium text-xs">
              <LogOut className="w-4 h-4 ml-0.5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm text-zinc-900 dark:text-white font-medium truncate">{t('admin.sidebar.logout', 'Deconectare')}</p>
              <p className="text-xs text-zinc-500 truncate">{t('admin.sidebar.logoutSub', 'Ieșire din cont')}</p>
            </div>
          </Button>
        </form>
      </div>
    </>
  )
}

export function AdminSidebar({
  role,
  branding,
  stats
}: {
  role: string,
  branding?: { icon?: string; logo?: string; logoType?: "image" | "text" },
  stats?: { totalPatients: number; finalizedPatientsMonth: number }
}) {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggle}
      />

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-white/5 flex flex-col z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent role={role} pathname={pathname} logoutAdmin={logoutAdmin} branding={branding} stats={stats} />
      </aside>
    </>
  )
}
