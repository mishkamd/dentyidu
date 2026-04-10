'use client'

import { useState } from "react"
import { updateLeadStatus } from "@/app/actions/leads"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

export function StatusChanger({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const handleStatusChange = async (value: string) => {
    setLoading(true)
    await updateLeadStatus(id, value)
    setLoading(false)
  }

  return (
    <Select onValueChange={handleStatusChange} defaultValue={currentStatus} disabled={loading}>
       <SelectTrigger className="w-[180px] bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100 h-8 text-xs font-medium">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-xl shadow-emerald-900/5">
        <SelectItem value="NOU" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer">{t('status.lead.new', 'Nou')}</SelectItem>
        <SelectItem value="CONTACTAT" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer">{t('status.lead.contacted', 'Contactat')}</SelectItem>
        <SelectItem value="OFERTA_TRIMISA" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer">{t('status.lead.offerSent', 'Ofertă Trimisă')}</SelectItem>
        <SelectItem value="PROGRAMAT" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer">{t('status.lead.scheduled', 'Programat')}</SelectItem>
        <SelectItem value="FINALIZAT" className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer">{t('status.lead.completed', 'Finalizat')}</SelectItem>
        <SelectItem value="ANULAT" className="focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">{t('status.lead.cancelled', 'Anulat')}</SelectItem>
        <SelectItem value="PIERDUT" className="focus:bg-zinc-100 dark:focus:bg-zinc-800/50 focus:text-zinc-600 dark:focus:text-zinc-400 cursor-pointer">{t('status.lead.lost', 'Pierdut')}</SelectItem>
      </SelectContent>
    </Select>
  )
}
