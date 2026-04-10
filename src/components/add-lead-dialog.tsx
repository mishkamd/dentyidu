"use client"

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { createLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { useActionState } from "react"
import { useLanguage } from "@/components/language-provider"

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <Button variant="admin_primary" size="admin_pill" 
        type="submit" 
        disabled={pending}
    >
      {pending ? t('ui.saving', 'Se salvează...') : t('dialog.addLead.save', 'Salvează Programare')}
    </Button>
  )
}

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>,
    inputs: {} as Record<string, string>
}

export function AddLeadDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(createLead, initialState)
  const { t } = useLanguage()

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        setOpen(false)
        toast.success(state.message || "Cererea a fost creată cu succes!")
      }, 0)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="admin_primary" size="admin_pill" 
            className="h-9 sm:h-11 px-3 sm:px-8"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('dialog.addLead.trigger', 'Programare Nouă')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.addLead.title', 'Adaugă Programare Nouă')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {t('dialog.addLead.description', 'Adaugă manual o cerere nouă în sistem.')}
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction} className="grid gap-4 py-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.name', 'Nume')}</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={state?.inputs?.name}
                    placeholder={t('dialog.addLead.namePlaceholder', 'Nume Pacient')}
                    className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                />
                {state?.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
                </div>
                <div className="grid gap-2">
                <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.phone', 'Telefon')}</Label>
                <Input
                    id="phone"
                    name="phone"
                    defaultValue={state?.inputs?.phone}
                    placeholder={t('dialog.addLead.phonePlaceholder', 'Telefon')}
                    className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                />
                {state?.errors?.phone && <p className="text-red-500 text-xs">{state.errors.phone}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.email', 'Email')}</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={state?.inputs?.email}
                    placeholder="email@example.com"
                    className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                />
                {state?.errors?.email && <p className="text-red-500 text-xs">{state.errors.email}</p>}
                </div>
                 <div className="grid gap-2">
                <Label htmlFor="country" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.country', 'Țara')}</Label>
                <Input
                    id="country"
                    name="country"
                    defaultValue={state?.inputs?.country}
                    placeholder="România"
                    className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                />
                </div>
            </div>

             <div className="grid gap-2">
                <Label htmlFor="budget" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.budget', 'Buget Estimat')}</Label>
                <Input
                id="budget"
                name="budget"
                defaultValue={state?.inputs?.budget}
                placeholder="ex: 2000 EUR"
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.description', 'Descriere / Mesaj')}</Label>
                <Textarea
                id="description"
                name="description"
                defaultValue={state?.inputs?.description}
                placeholder={t('dialog.addLead.descriptionPlaceholder', 'Detalii despre solicitare...')}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20 min-h-[100px] rounded-xl"
                required
                />
                 {state?.errors?.description && <p className="text-red-500 text-xs">{state.errors.description}</p>}
            </div>

             {state?.message && !state.success && (
                <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {state.message}
                </div>
            )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-bold"
            >
              {t('ui.cancel', 'Anulează')}
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
