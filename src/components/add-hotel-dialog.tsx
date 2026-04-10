"use client"

import { useState, useActionState } from "react"
import { createHotel, ActionState } from "@/app/actions/logistics"
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

export function AddHotelDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createHotel, initialState)
  const { t } = useLanguage()

  // Close dialog on success
  if (state.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="admin_primary" size="admin_pill" className="h-9 sm:h-11 px-3 sm:px-8">
          <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('dialog.addHotel.trigger', 'Adaugă Cazare')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-zinc-900/95 border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.addHotel.title', 'Adaugă Cazare Nouă')}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.name', 'Nume Cazare')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={state.inputs?.name}
              placeholder="Ex: Hotel Continental"
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.location', 'Locație (Manuală)')}</Label>
            <Input
              id="location"
              name="location"
              defaultValue={state.inputs?.location}
              placeholder="Ex: București, Sector 1"
              required
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('dialog.addHotel.locationHint', 'Introdu orașul sau adresa completă.')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stars" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.stars', 'Stele')}</Label>
              <Select name="stars" defaultValue={state.inputs?.stars || "3"}>
                <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100">
                  <SelectValue placeholder={t('ui.select', 'Selectează')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10">
                  <SelectItem value="1" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">1 {t('dialog.addHotel.star', 'Stea')}</SelectItem>
                  <SelectItem value="2" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">2 {t('dialog.addHotel.stars', 'Stele')}</SelectItem>
                  <SelectItem value="3" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">3 {t('dialog.addHotel.stars', 'Stele')}</SelectItem>
                  <SelectItem value="4" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">4 {t('dialog.addHotel.stars', 'Stele')}</SelectItem>
                  <SelectItem value="5" className="text-zinc-900 dark:text-zinc-100 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 focus:text-emerald-900 dark:focus:text-emerald-100">5 {t('dialog.addHotel.stars', 'Stele')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerNight" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.price', 'Preț/Noapte (€)')}</Label>
              <Input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                defaultValue={state.inputs?.pricePerNight}
                placeholder="50"
                className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
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
