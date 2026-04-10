"use client"

import { useActionState, useState } from "react"
import { updateProfile, changePassword, type ProfileState } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Mail, User as UserIcon } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface ProfileSettingsDialogProps {
  children: React.ReactNode
  user: {
    name: string | null
    email: string
  }
}

const initialProfileState: ProfileState = {
  message: "",
  errors: {},
  success: false,
}

const initialPasswordState: ProfileState = {
  message: "",
  errors: {},
  success: false,
}

function UpdateProfileForm({ user }: { user: { name: string | null; email: string } }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialProfileState)
  const { t } = useLanguage()

  return (
    <form action={formAction} className="space-y-4 mt-4">
      {state.message && (
        <div className={`p-3 rounded-md text-sm ${state.success ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 font-medium">{t('form.name', 'Nume')}</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            id="name"
            name="name"
            defaultValue={state.inputs?.name ?? user.name ?? ""}
            placeholder={t('dialog.profile.namePlaceholder', 'Numele tău')}
            className="pl-9 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400 font-medium">{t('form.email', 'Email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            id="email"
            name="email"
            defaultValue={state.inputs?.email ?? user.email}
            placeholder="email@example.com"
            className="pl-9 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
      </div>

      <Button variant="admin_primary" size="admin_pill"
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? t('ui.updating', 'Se actualizează...') : t('ui.saveChanges', 'Salvează Modificările')}
      </Button>
    </form>
  )
}

function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialPasswordState)
  const { t } = useLanguage()

  return (
    <form action={formAction} className="space-y-4 mt-4">
      {state.message && (
        <div className={`p-3 rounded-md text-sm ${state.success ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-zinc-500 dark:text-zinc-400 font-medium">{t('dialog.profile.newPassword', 'Noua Parolă')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="••••••"
            className="pl-9 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        {state.errors?.newPassword && <p className="text-xs text-red-500">{state.errors.newPassword[0]}</p>}
      </div>

      <Button variant="admin_primary" size="admin_pill"
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? t('ui.processing', 'Se procesează...') : t('dialog.profile.changePassword', 'Schimbă Parola')}
      </Button>
    </form>
  )
}

export function ProfileSettingsDialog({ children, user }: ProfileSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general')
  const { t } = useLanguage()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            <div className="flex flex-col">
              <DialogTitle className="text-zinc-900 dark:text-white">{t('dialog.profile.title', 'Setări Profil')}</DialogTitle>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{t('dialog.profile.subtitle', 'Gestionează contul tău')}</div>
            </div>
          </div>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-4">
            {t('dialog.profile.descriptionText', 'Actualizează informațiile personale sau securitatea contului.')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-zinc-900/50 rounded-lg mb-2 border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'general'
                ? 'bg-emerald-500/10 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'
              }`}
          >
            {t('dialog.profile.tabGeneral', 'General')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'security'
                ? 'bg-emerald-500/10 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-emerald-500/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'
              }`}
          >
            {t('dialog.profile.tabSecurity', 'Securitate')}
          </button>
        </div>

        {activeTab === 'general' ? (
          <UpdateProfileForm user={user} />
        ) : (
          <ChangePasswordForm />
        )}
      </DialogContent>
    </Dialog>
  )
}
