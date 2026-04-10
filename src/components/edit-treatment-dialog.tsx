'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Pencil, Stethoscope, Euro, Activity } from "lucide-react"
import { Patient, Lead } from "@prisma/client"
import { updateTreatment } from "@/app/actions/treatment"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

type Serializable<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P] extends Date | null ? string | Date | null : T[P] extends object ? Serializable<T[P]> : T[P] extends object | null ? Serializable<T[P]> | null : T[P]
}

type PatientWithLead = Patient & {
  lead: Lead | null
}

export function EditTreatmentDialog({ patient }: { patient: Serializable<PatientWithLead> }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { t } = useLanguage()

  const statuses = [
    { value: "IN_ASTEPTARE", label: t('status.patient.IN_ASTEPTARE', 'În așteptare') },
    { value: "PROGRAMAT", label: t('status.patient.PROGRAMAT', 'Programat') },
    { value: "SOSIT", label: t('status.patient.SOSIT', 'Sosit') },
    { value: "CAZAT", label: t('status.patient.CAZAT', 'Cazat') },
    { value: "IN_TRATAMENT", label: t('status.patient.IN_TRATAMENT', 'În tratament') },
    { value: "FINALIZAT", label: t('status.patient.FINALIZAT', 'Finalizat') },
  ]

  // Initial values
  const [treatment, setTreatment] = useState(patient.treatment || "")
  const [budget, setBudget] = useState(patient.lead?.budget || "")
  const [status, setStatus] = useState(patient.status || "IN_ASTEPTARE")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateTreatment(patient.id, {
        treatment,
        budget,
        status
      })

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 p-0 overflow-hidden gap-0 shadow-2xl shadow-emerald-900/10">
        <DialogHeader className="px-6 py-6 border-b border-emerald-500/10 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-zinc-900 dark:text-white text-lg">{t('dialog.treatment.title', 'Plan Tratament')}</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                {t('dialog.treatment.descriptionPrefix', 'Editează detaliile tratamentului pentru')} {patient.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" /> {t('dialog.treatment.statusLabel', 'Status Pacient')}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 focus:ring-emerald-500/20">
                  <SelectValue placeholder={t('dialog.treatment.selectStatus', 'Selectează status')} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5" /> {t('dialog.treatment.treatmentLabel', 'Descriere Tratament & Proceduri')}
              </Label>
              <Textarea
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                className="min-h-[150px] bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none font-medium"
                placeholder={t('dialog.treatment.treatmentPlaceholder', 'Descrie planul de tratament, etapele și observațiile medicale...')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Euro className="h-3.5 w-3.5" /> {t('dialog.treatment.costLabel', 'Costuri Estimative (EUR)')}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">€</span>
                <Input
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-8 bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20 font-mono"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="admin_secondary" size="admin_pill" type="button">{t('ui.cancel', 'Anulează')}</Button>
            </DialogClose>
            <Button variant="admin_primary" size="admin_pill" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('ui.saving', 'Se salvează...')}
                </>
              ) : (
                t('ui.saveChanges', 'Salvează Modificările')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
