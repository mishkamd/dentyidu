'use client'

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { updatePatient, type ActionState } from "@/app/actions/logistics"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

interface EditPatientDialogProps {
  patient: {
    id: string
    name: string
    treatment: string
    hotelId?: string | null
    clinicId?: string | null
    arrivalDate?: string | Date | null
    status: string
  }
  hotels: { id: string; name: string }[]
  clinics: { id: string; name: string }[]
}

const initialState: ActionState = { success: false, message: "" }

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="admin_primary" size="admin_pill"
    >
      {pending ? t('ui.saving', 'Se salvează...') : t('ui.saveChanges', 'Salvează Modificările')}
    </Button>
  )
}

export function EditPatientDialog({ patient, hotels, clinics }: EditPatientDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const updatePatientWithId = updatePatient.bind(null, patient.id)
  const [state, formAction] = useActionState(updatePatientWithId, initialState)

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

  // Format date for input type="date"
  const formattedDate = patient.arrivalDate
    ? new Date(patient.arrivalDate).toISOString().split('T')[0]
    : ''

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
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-zinc-900/95 border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.editPatient.title', 'Editează Date Pacient')}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {t('dialog.editPatient.description', 'Modifică detaliile logistice și de tratament ale pacientului.')}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="status" value={state.inputs?.status ?? patient.status} />

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.name', 'Nume Pacient')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={state.inputs?.name ?? patient.name}
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
            {state.errors?.name && (
              <p className="text-sm text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="treatment" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.editPatient.treatment', 'Tratament')}</Label>
            <Input
              id="treatment"
              name="treatment"
              defaultValue={state.inputs?.treatment ?? patient.treatment}
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
            {state.errors?.treatment && (
              <p className="text-sm text-red-400">{state.errors.treatment[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clinicId" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.clinic', 'Clinică')}</Label>
              <Select name="clinicId" defaultValue={state.inputs?.clinicId ?? (patient.clinicId || "none")}>
                <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100">
                  <SelectValue placeholder={t('dialog.editPatient.selectClinic', 'Selectează clinică')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                  <SelectItem value="none" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('ui.noClinic', 'Fără clinică')}</SelectItem>
                  {clinics.map(clinic => (
                    <SelectItem key={clinic.id} value={clinic.id} className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{clinic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotelId" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.hotel', 'Cazare')}</Label>
              <Select name="hotelId" defaultValue={state.inputs?.hotelId ?? (patient.hotelId || "none")}>
                <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100">
                  <SelectValue placeholder={t('dialog.editPatient.selectHotel', 'Selectează cazare')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                  <SelectItem value="none" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('ui.noHotel', 'Fără cazare')}</SelectItem>
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.id} className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{hotel.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arrivalDate" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.arrivalDate', 'Data Sosirii')}</Label>
              <Input
                id="arrivalDate"
                name="arrivalDate"
                type="date"
                defaultValue={state.inputs?.arrivalDate ?? formattedDate}
                className="[color-scheme:light] dark:[color-scheme:dark] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
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
