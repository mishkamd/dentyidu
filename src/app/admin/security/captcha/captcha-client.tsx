'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck, Key, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { updateCaptchaSettings } from "@/app/actions/captcha-settings"

type Settings = {
  siteKey: string
  secretKey: string
  isEnabled: boolean
}

export function CaptchaSettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [siteKey, setSiteKey] = useState(initialSettings.siteKey)
  const [secretKey, setSecretKey] = useState(initialSettings.secretKey)
  const [isEnabled, setIsEnabled] = useState(initialSettings.isEnabled)
  const [showSecret, setShowSecret] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const fd = new FormData()
    fd.set("siteKey", siteKey)
    fd.set("secretKey", secretKey)
    fd.set("isEnabled", String(isEnabled))

    startTransition(async () => {
      const result = await updateCaptchaSettings(fd)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">Cloudflare Turnstile</p>
            <p className="text-xs text-zinc-500">Protecție captcha pe formulare</p>
          </div>
          <div className="ml-auto">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteKey" className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-zinc-400" /> Site Key
            </Label>
            <Input
              id="siteKey"
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              placeholder="0x4AAAAA..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-zinc-400" /> Secret Key
            </Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="0x4AAAAA..."
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Unde se aplică:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Formularul &quot;Solicită o consultație&quot; (pagina principală)</li>
            <li>Pagina de autentificare (/login)</li>
          </ul>
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full">
          {isPending ? "Se salvează..." : "Salvează Setări"}
        </Button>
      </div>
    </div>
  )
}
