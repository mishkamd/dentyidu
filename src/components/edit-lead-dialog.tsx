'use client'

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { updateLead, type LeadFormState } from "@/app/actions/leads"
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
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

interface EditLeadDialogProps {
  lead: {
    id: string
    name: string
    email: string
    phone: string
    description: string
    country: string
    budget?: string | null
  }
}

const initialState: LeadFormState = {
  message: "",
  errors: {},
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <Button variant="admin_primary" size="admin_pill" 
      type="submit" 
      disabled={pending}
    >
      {pending ? t('ui.saving', 'Se salvează...') : t('ui.saveChanges', 'Salvează Modificările')}
    </Button>
  )
}

export function EditLeadDialog({ lead }: EditLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const updateLeadWithId = updateLead.bind(null, lead.id)
  const [state, formAction] = useActionState(updateLeadWithId, initialState)

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        toast.success(state.message)
        setOpen(false)
      }, 0)
    } else if (state.message && !state.success) {
      setTimeout(() => {
        toast.error(state.message)
      }, 0)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all duration-200"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">{t('ui.edit', 'Editează')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.editLead.title', 'Editează Date Pacient')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {t('dialog.editLead.description', 'Modifică informațiile de contact și detaliile cererii.')}
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.name', 'Nume')}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={state.inputs?.name ?? lead.name}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-red-400">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.country', 'Țara')}</Label>
              <Input
                id="country"
                name="country"
                defaultValue={state.inputs?.country ?? lead.country}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
              {state.errors?.country && (
                <p className="text-sm text-red-400">{state.errors.country[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.email', 'Email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state.inputs?.email ?? lead.email}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-red-400">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.phone', 'Telefon')}</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={state.inputs?.phone ?? lead.phone}
                className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
              {state.errors?.phone && (
                <p className="text-sm text-red-400">{state.errors.phone[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budget" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.budget', 'Buget Estimat')}</Label>
            <Input
              id="budget"
              name="budget"
              defaultValue={state.inputs?.budget ?? (lead.budget || "")}
              placeholder="ex: 2000 EUR"
              className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
            {state.errors?.budget && (
                <p className="text-sm text-red-400">{state.errors.budget[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300 font-medium">{t('form.description', 'Descriere / Mesaj')}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={state.inputs?.description ?? lead.description}
              className="bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20 min-h-[100px] rounded-xl"
              required
            />
            {state.errors?.description && (
                <p className="text-sm text-red-400">{state.errors.description[0]}</p>
            )}
          </div>

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
