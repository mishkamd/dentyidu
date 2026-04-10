"use client"

import { useState } from "react"
import { useActionState } from "react"
import { createPatient, ActionState } from "@/app/actions/logistics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const initialState: ActionState = {
  message: "",
  errors: {},
  success: false
}

export function AddPatientDialog({ hotels, clinics }: { hotels: { id: string; name: string }[], clinics: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createPatient, initialState)
  const { t } = useLanguage()

  if (state.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="admin_primary" size="admin_pill" className="h-9 sm:h-11 px-3 sm:px-8">
          <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('dialog.addPatient.trigger', 'Adaugă Pacient')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.addPatient.title', 'Adaugă Pacient Nou')}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.name', 'Nume Pacient')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={state.inputs?.name}
              placeholder="Ion Popescu"
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="treatment" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.treatment', 'Tratament Necesar')}</Label>
            <Input
              id="treatment"
              name="treatment"
              defaultValue={state.inputs?.treatment}
              placeholder="Ex: Implanturi Dentare"
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clinicId" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.clinic', 'Clinică')}</Label>
            <Select name="clinicId" defaultValue={state.inputs?.clinicId}>
              <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:ring-emerald-500/20">
                <SelectValue placeholder={t('dialog.addPatient.selectClinic', 'Alege clinică...')} />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                <SelectItem value="none" className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('ui.noClinic', 'Fără clinică')}</SelectItem>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id} className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hotelId" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.hotel', 'Cazare')}</Label>
            <Select name="hotelId" defaultValue={state.inputs?.hotelId}>
              <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:ring-emerald-500/20">
                <SelectValue placeholder={t('dialog.addPatient.selectHotel', 'Alege cazare...')} />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                <SelectItem value="none" className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('ui.noHotel', 'Fără cazare')}</SelectItem>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id} className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label htmlFor="arrivalDate" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addPatient.arrivalDate', 'Data Sosirii')}</Label>
              <Input
                id="arrivalDate"
                name="arrivalDate"
                type="date"
                defaultValue={state.inputs?.arrivalDate}
                className="[color-scheme:light] dark:[color-scheme:dark] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            <div className="grid gap-2 mt-2">
              <Label htmlFor="status" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('ui.status', 'Status')}</Label>
              <Select name="status" defaultValue={state.inputs?.status || "IN_ASTEPTARE"}>
                <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white focus:ring-emerald-500/20">
                  <SelectValue placeholder={t('ui.select', 'Selectează')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                  <SelectItem value="IN_ASTEPTARE" className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('status.patient.IN_ASTEPTARE', 'În așteptare')}</SelectItem>
                  <SelectItem value="CAZAT" className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('status.patient.CAZAT', 'Cazat')}</SelectItem>
                  <SelectItem value="FINALIZAT" className="text-zinc-500 dark:text-zinc-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">{t('status.patient.FINALIZAT', 'Finalizat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {t('ui.cancel', 'Anulează')}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              variant="admin_primary" size="admin_pill"
            >
              {isPending ? t('ui.saving', 'Se salvează...') : t('ui.save', 'Salvează')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
