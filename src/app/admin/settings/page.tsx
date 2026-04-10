import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"
import { getTelegramSettings } from "@/app/actions/telegram-settings"
import { TelegramSettingsForm } from "@/components/telegram-settings-form"
import { getServerLocale, getTranslations } from "@/lib/locale-server"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    redirect('/admin')
  }

  const [settings, locale] = await Promise.all([
    getTelegramSettings(),
    getServerLocale(),
  ])
  const t = await getTranslations(locale)

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">
          {t["admin.settings.subtitle"] || "Configurare"}
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {t["admin.settings.title"] || "Setări Telegram Bot"}
        </h1>
      </header>

      <TelegramSettingsForm
        initialSettings={settings ? {
          botToken: settings.botToken,
          webhookUrl: settings.webhookUrl,
          isActive: settings.isActive,
          users: settings.users.map(u => ({
            id: u.id,
            telegramUserId: u.telegramUserId,
            label: u.label,
            isActive: u.isActive,
          })),
        } : null}
      />
    </div>
  )
}
