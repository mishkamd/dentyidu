"use client"

import { useActionState } from "react"
import { saveTelegramSettings, addTelegramUser, removeTelegramUser, toggleTelegramUser, setTelegramWebhook, removeTelegramWebhook, testTelegramBot, setTelegramMiniApp } from "@/app/actions/telegram-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState, useTransition } from "react"
import { Bot, Plus, Trash2, Eye, EyeOff, Power, PowerOff, Globe, Unplug, FlaskConical, Smartphone } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface TelegramUser {
  id: string
  telegramUserId: string
  label: string
  isActive: boolean
}

interface Props {
  initialSettings: {
    botToken: string
    webhookUrl: string
    isActive: boolean
    users: TelegramUser[]
  } | null
}

const settingsInitial = { success: false, message: "" }
const userInitial = { success: false, message: "" }

export function TelegramSettingsForm({ initialSettings }: Props) {
  const { t } = useLanguage()
  const [settingsState, settingsAction, settingsPending] = useActionState(saveTelegramSettings, settingsInitial)
  const [userState, userAction, userPending] = useActionState(addTelegramUser, userInitial)
  const [showToken, setShowToken] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [webhookMsg, setWebhookMsg] = useState<{ success?: boolean; message?: string } | null>(null)
  const [testMsg, setTestMsg] = useState<{ success?: boolean; message?: string } | null>(null)
  const [miniAppMsg, setMiniAppMsg] = useState<{ success?: boolean; message?: string } | null>(null)
  const userFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (userState.success && userFormRef.current) {
      userFormRef.current.reset()
    }
  }, [userState.success])

  const handleRemoveUser = (userId: string) => {
    startTransition(async () => {
      await removeTelegramUser(userId)
    })
  }

  const handleToggleUser = (userId: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleTelegramUser(userId, !isActive)
    })
  }

  const handleSetWebhook = () => {
    setWebhookMsg(null)
    startTransition(async () => {
      const result = await setTelegramWebhook()
      setWebhookMsg(result)
    })
  }

  const handleRemoveWebhook = () => {
    setWebhookMsg(null)
    startTransition(async () => {
      const result = await removeTelegramWebhook()
      setWebhookMsg(result)
    })
  }

  const handleTestBot = () => {
    setTestMsg(null)
    startTransition(async () => {
      const result = await testTelegramBot()
      setTestMsg(result)
    })
  }

  const handleSetMiniApp = () => {
    setMiniAppMsg(null)
    startTransition(async () => {
      const result = await setTelegramMiniApp()
      setMiniAppMsg(result)
    })
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Bot Settings */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("admin.settings.botConfig", "Configurare Bot")}</h2>
            <p className="text-sm text-zinc-500">{t("admin.settings.botConfigDesc", "Token-ul și starea Telegram Bot-ului")}</p>
          </div>
        </div>

        <form key={`${initialSettings?.botToken}-${initialSettings?.webhookUrl}-${initialSettings?.isActive}`} action={settingsAction} className="space-y-4">
          {settingsState.message && (
            <p className={`text-sm ${settingsState.success ? 'text-emerald-500' : 'text-red-500'}`}>
              {settingsState.message}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="botToken" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              {t("admin.settings.botToken", "Bot Token")}
            </Label>
            <div className="relative">
              <Input
                id="botToken"
                name="botToken"
                type={showToken ? "text" : "password"}
                defaultValue={initialSettings?.botToken || ""}
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                className="pr-10 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {settingsState.errors?.botToken && (
              <p className="text-xs text-red-500">{settingsState.errors.botToken[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              {t("admin.settings.webhookUrl", "URL Website (pentru Webhook)")}
            </Label>
            <Input
              id="webhookUrl"
              name="webhookUrl"
              type="text"
              defaultValue={initialSettings?.webhookUrl || ""}
              placeholder="https://your-domain.com"
              className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10"
            />
            <p className="text-xs text-zinc-400">
              {t("admin.settings.webhookHint", "URL-ul public al site-ului. Webhook-ul va fi setat pe")} <code className="text-zinc-500">/api/telegram</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="hidden"
                name="isActive"
                value={initialSettings?.isActive ? "true" : "false"}
              />
              <input
                type="checkbox"
                defaultChecked={initialSettings?.isActive || false}
                onChange={(e) => {
                  const hidden = e.target.previousElementSibling as HTMLInputElement
                  hidden.value = e.target.checked ? "true" : "false"
                }}
                className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{t("admin.settings.botActive", "Bot activ")}</span>
            </label>
          </div>

          <Button type="submit" disabled={settingsPending} size="sm">
            {settingsPending ? t("admin.settings.saving", "Se salvează...") : t("admin.settings.saveBtn", "Salvează Setări")}
          </Button>
        </form>
      </div>

      {/* Webhook & Test */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("admin.settings.webhookSection", "Webhook & Conexiune")}</h2>
            <p className="text-sm text-zinc-500">{t("admin.settings.webhookSectionDesc", "Setează webhook-ul și testează conexiunea cu Telegram")}</p>
          </div>
        </div>

        {testMsg && (
          <p className={`text-sm ${testMsg.success ? 'text-emerald-500' : 'text-red-500'}`}>
            {testMsg.message}
          </p>
        )}

        {webhookMsg && (
          <p className={`text-sm ${webhookMsg.success ? 'text-emerald-500' : 'text-red-500'}`}>
            {webhookMsg.message}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleTestBot} disabled={isPending} size="sm" variant="outline">
            <FlaskConical className="h-4 w-4 mr-1.5" />
            {isPending ? t("admin.settings.testing", "Se testează...") : t("admin.settings.testBtn", "Testează Conexiunea")}
          </Button>
          <Button onClick={handleSetWebhook} disabled={isPending} size="sm">
            <Globe className="h-4 w-4 mr-1.5" />
            {isPending ? t("admin.settings.settingWebhook", "Se setează...") : t("admin.settings.setWebhookBtn", "Setează Webhook")}
          </Button>
          <Button onClick={handleRemoveWebhook} disabled={isPending} size="sm" variant="outline" className="text-red-500 hover:text-red-600 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20">
            <Unplug className="h-4 w-4 mr-1.5" />
            {t("admin.settings.removeWebhookBtn", "Elimină Webhook")}
          </Button>
        </div>
      </div>

      {/* Mini App */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("admin.settings.miniAppSection", "Telegram Mini App")}</h2>
            <p className="text-sm text-zinc-500">{t("admin.settings.miniAppDesc", "Setează butonul de meniu al botului să deschidă Admin Panel-ul ca Mini App")}</p>
          </div>
        </div>

        {miniAppMsg && (
          <p className={`text-sm ${miniAppMsg.success ? 'text-emerald-500' : 'text-red-500'}`}>
            {miniAppMsg.message}
          </p>
        )}

        <Button onClick={handleSetMiniApp} disabled={isPending} size="sm">
          <Smartphone className="h-4 w-4 mr-1.5" />
          {isPending ? t("admin.settings.settingMiniApp", "Se setează...") : t("admin.settings.setMiniAppBtn", "Setează Mini App")}
        </Button>
      </div>

      {/* Whitelisted Users */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("admin.settings.whitelistTitle", "Utilizatori Whitelist")}</h2>
          <p className="text-sm text-zinc-500">{t("admin.settings.whitelistDesc", "ID-urile Telegram care primesc alerte și pot controla bot-ul")}</p>
        </div>

        {/* Add User Form */}
        <form ref={userFormRef} action={userAction} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              name="telegramUserId"
              placeholder={t("admin.settings.telegramIdPlaceholder", "ID Telegram (ex: 123456789)")}
              className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10"
            />
          </div>
          <div className="flex-1">
            <Input
              name="label"
              placeholder={t("admin.settings.labelPlaceholder", "Etichetă (ex: Admin Principal)")}
              className="bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10"
            />
          </div>
          <Button type="submit" disabled={userPending} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            {userPending ? t("admin.settings.adding", "Se adaugă...") : t("admin.settings.addBtn", "Adaugă")}
          </Button>
        </form>

        {userState.message && (
          <p className={`text-sm ${userState.success ? 'text-emerald-500' : 'text-red-500'}`}>
            {userState.message}
          </p>
        )}

        {/* Users List */}
        {initialSettings?.users && initialSettings.users.length > 0 ? (
          <div className="space-y-2">
            {initialSettings.users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  user.isActive
                    ? 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/30'
                    : 'border-zinc-200/50 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-800/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{user.telegramUserId}</code>
                  {user.label && (
                    <span className="text-xs text-zinc-500 truncate">({user.label})</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleUser(user.id, user.isActive)}
                    disabled={isPending}
                    className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title={user.isActive ? t("admin.settings.deactivate", "Dezactivează") : t("admin.settings.activate", "Activează")}
                  >
                    {user.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors"
                    title={t("admin.settings.delete", "Șterge")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">{t("admin.settings.noUsers", "Niciun utilizator adăugat.")}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 p-4">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">{t("admin.settings.howToGetId", "Cum obțineți ID-ul Telegram?")}</h3>
        <ol className="text-sm text-blue-600 dark:text-blue-400/80 space-y-1 list-decimal list-inside">
          <li>{t("admin.settings.step1", "Deschideți Telegram și căutați @userinfobot")}</li>
          <li>{t("admin.settings.step2", "Trimiteți comanda /start")}</li>
          <li>{t("admin.settings.step3", "Bot-ul vă va răspunde cu ID-ul dvs. numeric")}</li>
        </ol>
      </div>
    </div>
  )
}
