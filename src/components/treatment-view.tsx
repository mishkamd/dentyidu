'use client'

import { useState } from "react"
import { Users, Building2, Calendar, Activity, Search, Stethoscope, Euro, Plus } from "lucide-react"
import { Tooth } from "@/components/ui/icons"
import { Patient, Lead, Hotel, Invoice } from "@prisma/client"
import { PatientDetailsDialog } from "@/components/patient-details-dialog"
import { PatientStatusSelect } from "@/components/patient-status-select"
import { EditTreatmentDialog } from "@/components/edit-treatment-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

type Serializable<T> = {
    [P in keyof T]: T[P] extends Date ? string | Date : T[P] extends Date | null ? string | Date | null : T[P] extends object ? Serializable<T[P]> : T[P] extends object | null ? Serializable<T[P]> | null : T[P]
}

type PatientWithRelations = Patient & {
    lead: Lead | null
    hotel: Hotel | null
    invoices?: Partial<Invoice>[]
}

export function TreatmentView({ patients, role }: { patients: Serializable<PatientWithRelations>[], role?: string }) {
    const [searchTerm, setSearchTerm] = useState("")
    const { t } = useLanguage()

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lead?.phone?.includes(searchTerm) ||
        patient.treatment?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 gap-4">
                <div className="flex items-center gap-2 text-zinc-500">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Tooth className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{t("ui.treatment.title", "Listă Pacienți & Tratamente")}</span>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder={t("ui.treatment.searchPlaceholder", "Caută pacient...")}
                        className="pl-9 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 rounded-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-medium tracking-wider text-zinc-500 uppercase w-[100px]">{t("ui.tableHeaders.actions", "Acțiuni")}</th>
                            <th className="px-6 py-4 font-medium tracking-wider">{t("ui.treatment.patient", "Pacient")}</th>
                            <th className="px-6 py-4 font-medium tracking-wider">{t("ui.treatment.treatmentPlan", "Plan Tratament")}</th>
                            <th className="px-6 py-4 font-medium tracking-wider">{t("ui.treatment.costs", "Costuri")}</th>
                            <th className="px-6 py-4 font-medium tracking-wider">{t("ui.tableHeaders.status", "Status")}</th>
                            <th className="px-6 py-4 font-medium tracking-wider text-right">{t("ui.patients.arrivalDate", "Data Sosirii")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {filteredPatients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-zinc-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                                        <p className="text-zinc-500 font-medium">{t("ui.treatment.noPatients", "Nu au fost găsiți pacienți.")}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <EditTreatmentDialog patient={patient} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <PatientDetailsDialog patient={patient} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <div className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium" title={patient.treatment || ""}>
                                            {patient.treatment && patient.treatment.length > 25
                                                ? `${patient.treatment.substring(0, 25)}...`
                                                : (patient.treatment || t("ui.treatment.unspecified", "Nespecificat"))
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.lead?.budget ? (
                                            <div className="inline-flex items-center gap-1 font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                                                <Euro className="h-3 w-3" />
                                                {patient.lead.budget}
                                            </div>
                                        ) : (
                                            <span className="text-zinc-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="scale-90 origin-left">
                                            <PatientStatusSelect id={patient.id} status={patient.status} role={role} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {patient.arrivalDate ? (
                                            <span className="font-mono text-zinc-600 dark:text-zinc-400">
                                                {new Date(patient.arrivalDate).toLocaleDateString('ro-RO')}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400 text-xs">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
