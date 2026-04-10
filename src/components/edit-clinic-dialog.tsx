"use client"

import { useState, useActionState } from "react"
import { updateClinic, ActionState } from "@/app/actions/logistics"
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
import { Pencil } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const initialState: ActionState = {
    message: "",
    errors: {},
    success: false
}

interface EditClinicDialogProps {
    clinic: {
        id: string
        name: string
        location: string
        phone: string | null
    }
}

export function EditClinicDialog({ clinic }: EditClinicDialogProps) {
    const [open, setOpen] = useState(false)
    const { t } = useLanguage()
    const updateClinicWithId = updateClinic.bind(null, clinic.id)
    const [state, formAction, isPending] = useActionState(updateClinicWithId, initialState)

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
                        {t('dialog.editClinic.title', 'Editează Clinică')}
                    </DialogTitle>
                </DialogHeader>
                <form action={formAction} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.name', 'Nume Clinică')}</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={state.inputs?.name ?? clinic.name}
                            required
                            className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
                        />
                        {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.location', 'Locație')}</Label>
                        <Input
                            id="location"
                            name="location"
                            defaultValue={state.inputs?.location ?? clinic.location}
                            required
                            className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('dialog.addClinic.phone', 'Telefon (opțional)')}</Label>
                        <Input
                            id="phone"
                            name="phone"
                            defaultValue={state.inputs?.phone ?? clinic.phone ?? ""}
                            placeholder="+373 60 000 000"
                            className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 dark:text-white"
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
