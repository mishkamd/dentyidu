"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Clinic, Admin } from "@prisma/client"
import { MapPin, Phone, Calendar, UserRound } from "lucide-react"

type ClinicWithAdmins = Clinic & {
    admins: Admin[]
}

interface ClinicDetailsDialogProps {
    clinic: ClinicWithAdmins
    children?: React.ReactNode
    defaultOpen?: boolean
}

export function ClinicDetailsDialog({ clinic, children, defaultOpen = false }: ClinicDetailsDialogProps) {
    // Filter for dentists only (role == 'DENTIST')
    const dentists = clinic.admins.filter(admin => admin.role === 'DENTIST')

    return (
        <Dialog defaultOpen={defaultOpen}>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <button className="text-zinc-900 dark:text-white font-medium hover:underline text-left">
                        {clinic.name}
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 p-0 overflow-hidden rounded-2xl">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                C
                            </span>
                            {clinic.name}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">Detalii Clinică</h4>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-zinc-500 mb-0.5">Locație</div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{clinic.location}</div>
                                </div>
                            </div>

                            {clinic.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-zinc-500 mb-0.5">Telefon</div>
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{clinic.phone}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-zinc-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-zinc-500 mb-0.5">Data Adăugării</div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {new Date(clinic.createdAt).toLocaleDateString("ro-RO")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Medici Dentiști Asignați</h4>
                            <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                {dentists.length}
                            </div>
                        </div>

                        {dentists.length > 0 ? (
                            <div className="space-y-3">
                                {dentists.map((dentist) => (
                                    <div key={dentist.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <UserRound className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-white capitalize">Dr. {dentist.name || dentist.email.split('@')[0]}</div>
                                            <div className="text-xs text-zinc-500">{dentist.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                <UserRound className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Niciun medic dentist asignat la această clinică momentan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
