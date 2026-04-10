import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"
import { getCaptchaSettings } from "@/app/actions/captcha-settings"
import { CaptchaSettingsClient } from "./captcha-client"
import { SecurityNav } from "../security-nav"

export const dynamic = 'force-dynamic'

export default async function CaptchaSettingsPage() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') redirect('/admin')

  const settings = await getCaptchaSettings()

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase text-zinc-500 font-medium tracking-wider mb-2">Securitate</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Cloudflare Captcha
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Configurează Cloudflare Turnstile pe formularul de contact și pagina de login.</p>
      </header>
      <SecurityNav />
      <CaptchaSettingsClient
        initialSettings={settings ? {
          siteKey: settings.siteKey,
          secretKey: settings.secretKey,
          isEnabled: settings.isEnabled,
        } : { siteKey: "", secretKey: "", isEnabled: false }}
      />
    </div>
  )
}
