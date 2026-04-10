"use client"

import { useState, useActionState } from "react"
import { updateHotel, ActionState } from "@/app/actions/logistics"
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
import { Pencil } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const initialState: ActionState = {
  message: "",
  errors: {},
  success: false
}

interface EditHotelDialogProps {
  hotel: {
    id: string
    name: string
    location: string
    stars: number
    pricePerNight: number | null
  }
}

export function EditHotelDialog({ hotel }: EditHotelDialogProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const updateHotelWithId = updateHotel.bind(null, hotel.id)
  const [state, formAction, isPending] = useActionState(updateHotelWithId, initialState)

  // Close dialog on success
  if (state.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all duration-200"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full" />
            {t('dialog.editHotel.title', 'Editează Cazare')}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.name', 'Nume Cazare')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={state.inputs?.name ?? hotel.name}
              required
              className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
            />
            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.location', 'Locație (Manuală)')}</Label>
            <Input
              id="location"
              name="location"
              defaultValue={state.inputs?.location ?? hotel.location}
              required
              className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('dialog.addHotel.locationHint', 'Introdu orașul sau adresa completă.')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stars" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addHotel.stars', 'Stele')}</Label>
              <Select name="stars" defaultValue={state.inputs?.stars ?? hotel.stars.toString()}>
                <SelectTrigger className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-zinc-900 dark:text-white">
                  <SelectValue placeholder={t('ui.select', 'Selectează')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10">
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
                defaultValue={state.inputs?.pricePerNight ?? hotel.pricePerNight ?? 0}
                placeholder="50"
                className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
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