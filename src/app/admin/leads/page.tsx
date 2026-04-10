import { getCurrentAdmin } from "@/lib/get-current-admin"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/admin')
  }

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="flex flex-col h-[calc(100dvh-110px)] md:h-[calc(100vh-140px)] gap-0 md:gap-6">
      <header className="shrink-0 md:block hidden">
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.leads.subtitle"] || "Comunicare"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.leads.title"] || "Chat & Mesagerie"}
        </h1>
      </header>

      <div className="flex-1 min-h-0">
        <ChatInterface currentUser={currentAdmin} />
      </div>
    </div>
  )
}
