"use client"

import { useActionState } from "react"
import { createUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
  inputs: undefined as Record<string, string> | undefined
}

interface CreateUserFormProps {
  clinics?: {
    id: string
    name: string
  }[]
}

export function CreateUserForm({ clinics = [] }: CreateUserFormProps) {
  const [state, formAction, isPending] = useActionState(createUser, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [role, setRole] = useState(state.inputs?.role || "MANAGER")
  const { t } = useLanguage()

  useEffect(() => {
    if (state.success && formRef.current) {
      setTimeout(() => {
        // Manually reset value for Select if needed, but standard reset clears form
        formRef.current?.reset()
        setRole("MANAGER")
      }, 0)
    }
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.message && (
        <p className={`text-sm ${state.success ? 'text-emerald-400' : 'text-red-400'}`}>
          {state.message}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.createUser.name', 'Nume (Opțional)')}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={state.inputs?.name}
          placeholder="Ex: Ion Popescu"
          className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
        {state.errors?.name && (
          <p className="text-sm text-red-400">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('form.email', 'Email')}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state.inputs?.email}
          placeholder="email@example.com"
          className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
        {state.errors?.email && (
          <p className="text-sm text-red-400">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.createUser.password', 'Parolă')}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          defaultValue={state.inputs?.password}
          placeholder="******"
          className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
        {state.errors?.password && (
          <p className="text-sm text-red-400">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.createUser.role', 'Rol')}</Label>
        <Select name="role" value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/20">
            <SelectValue placeholder={t('dialog.createUser.selectRole', 'Selectează rol')} />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
            <SelectItem value="ADMIN" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">Admin</SelectItem>
            <SelectItem value="MANAGER" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">Manager</SelectItem>
            <SelectItem value="DENTIST" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">Dentist</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.role && (
          <p className="text-sm text-red-400">{state.errors.role[0]}</p>
        )}
      </div>

      {role === "DENTIST" && (
        <div className="grid gap-2 transition-all duration-300">
          <Label htmlFor="clinicId" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.createUser.clinicLabel', 'Clinică (Opțional, pentru Dentiști)')}</Label>
          <Select name="clinicId" defaultValue={state.inputs?.clinicId || "none"}>
            <SelectTrigger className="w-full bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:ring-emerald-500/20">
              <SelectValue placeholder={t('ui.noClinicAssigned', 'Fără clinică asignată')} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
              <SelectItem value="none" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('ui.noClinic', 'Fără clinică')}</SelectItem>
              {clinics.map(clinic => (
                <SelectItem key={clinic.id} value={clinic.id} className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.clinicId && (
            <p className="text-sm text-red-400">{state.errors.clinicId[0]}</p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button variant="admin_primary" size="admin_pill" type="submit" disabled={isPending} className="h-11 px-8">
          {isPending ? t('dialog.createUser.creating', 'Se creează...') : t('dialog.createUser.submit', 'Creează Utilizator')}
        </Button>
      </div>
    </form>
  )
}
