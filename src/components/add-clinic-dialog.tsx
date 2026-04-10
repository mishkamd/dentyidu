"use client"

import { useState, useActionState } from "react"
import { createClinic, ActionState } from "@/app/actions/logistics"
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
import { Plus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
}

export function AddClinicDialog() {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(createClinic, initialState)
    const { t } = useLanguage()

    // Close dialog on success
    if (state.success && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="admin_primary" size="admin_pill" className="h-9 sm:h-11 px-3 sm:px-8">
                    <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('dialog.addClinic.trigger', 'Adaugă Clinică')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-zinc-900/95 border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl shadow-emerald-900/10">
                <DialogHeader>
                    <DialogTitle className="text-zinc-900 dark:text-white text-xl font-bold flex items-center gap-2">
                        <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                        {t('dialog.addClinic.title', 'Adaugă Clinică Nouă')}
                    </DialogTitle>
                </DialogHeader>
                <form action={formAction} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.name', 'Nume Clinică')}</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={state.inputs?.name}
                            placeholder="Ex: DentyMD Centru"
                            required
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                        {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.location', 'Locație')}</Label>
                        <Input
                            id="location"
                            name="location"
                            defaultValue={state.inputs?.location}
                            placeholder="Ex: Str. Ștefan cel Mare 1, Chișinău"
                            required
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.phone', 'Telefon (opțional)')}</Label>
                        <Input
                            id="phone"
                            name="phone"
                            defaultValue={state.inputs?.phone}
                            placeholder="Ex: +373 60 000 000"
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
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
