
"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { OfferWithDetails } from "@/types/financial"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOfferStatus } from "@/app/actions/financial"
import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

export function OffersTable({ offers }: { offers: OfferWithDetails[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { t } = useLanguage()

  const handleStatusChange = async (offerId: string, newStatus: string) => {
    setLoadingId(offerId)
    try {
      await updateOfferStatus(offerId, newStatus)
    } finally {
      setLoadingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return "text-emerald-700 bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10"
      case 'REJECTED': return "text-red-700 bg-red-100 dark:text-red-500 dark:bg-red-500/10"
      case 'SENT': return "text-blue-700 bg-blue-100 dark:text-blue-500 dark:bg-blue-500/10"
      case 'CONVERTED': return "text-purple-700 bg-purple-100 dark:text-purple-500 dark:bg-purple-500/10"
      default: return "text-zinc-700 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800"
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden bg-white dark:bg-zinc-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
            <tr>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">{t('table.offer.number', 'Număr')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">{t('table.offer.client', 'Client')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden md:table-cell">{t('table.offer.date', 'Dată')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{t('table.offer.validUntil', 'Valabilă Până')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">{t('table.offer.status', 'Status')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">{t('table.offer.total', 'Total')}</th>
              <th className="px-3 sm:px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">{t('table.offer.empty', 'Nu există oferte.')}</td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-3 sm:px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {offer.number}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                    {offer.patient?.name || offer.lead?.name || 'N/A'}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-zinc-500 hidden md:table-cell">
                    {format(new Date(offer.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-zinc-500 hidden lg:table-cell">
                    {format(new Date(offer.validUntil), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <Select 
                      defaultValue={offer.status} 
                      onValueChange={(val) => handleStatusChange(offer.id, val)}
                      disabled={loadingId === offer.id || offer.status === 'CONVERTED'}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-xs font-medium border-0 ring-0 focus:ring-0 ${getStatusColor(offer.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">{t('status.offer.draft', 'Draft')}</SelectItem>
                        <SelectItem value="SENT">{t('status.offer.sent', 'Trimisă')}</SelectItem>
                        <SelectItem value="ACCEPTED">{t('status.offer.accepted', 'Acceptată')}</SelectItem>
                        <SelectItem value="REJECTED">{t('status.offer.rejected', 'Refuzată')}</SelectItem>
                        {offer.status === 'CONVERTED' && <SelectItem value="CONVERTED">{t('status.offer.converted', 'Facturată')}</SelectItem>}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-white">
                    {Number(offer.total).toLocaleString()} {offer.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                    </Button>
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
