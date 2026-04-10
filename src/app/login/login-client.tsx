'use client'

import { useActionState } from "react"
import { useState } from "react"
import { loginAdmin } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Tooth } from "@/components/ui/icons"
import { useLanguage } from "@/components/language-provider"
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile"

const initialState = {
  message: "",
  errors: {},
}

export function LoginFormClient({ branding }: { branding: { icon?: string; logo?: string; logoType?: "image" | "text" } }) {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const { t } = useLanguage()
  const [captchaToken, setCaptchaToken] = useState("")

  return (
    <Card className="w-full max-w-sm bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-2xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4 group">
          {branding?.icon ? (
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <Image src={branding.icon} alt="Icon" fill className="object-contain" sizes="40px" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Tooth className="w-6 h-6" />
            </div>
          )}
        </div>
        
        {branding?.logo ? (
          branding.logoType === 'text' ? (
            <CardTitle className="text-center text-2xl font-bold tracking-tight">{branding.logo}</CardTitle>
          ) : (
            <div className="flex justify-center mb-2">
              <Image src={branding.logo} alt="Logo" width={120} height={32} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
            </div>
          )
        ) : (
          <CardTitle className="text-center text-2xl font-bold tracking-tight">DentyAdmin</CardTitle>
        )}
        
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t('login.subtitle', 'Autentificare în panoul de administrare')}</p>
      </CardHeader>
      <CardContent>
        {error === 'inactive' && (
          <div className="mb-4 p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {t('login.inactive', 'Acest cont a fost dezactivat.')}
          </div>
        )}
        <form action={(fd) => { if (captchaToken) fd.set("captchaToken", captchaToken); formAction(fd) }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('form.email', 'Email')}</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="admin@denty.md"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('login.password', 'Parolă')}</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          
          {state?.message && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">{state.message}</p>
          )}

          <CloudflareTurnstile
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? t('login.authenticating', 'Se autentifică...') : t('login.submit', 'Autentificare')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
