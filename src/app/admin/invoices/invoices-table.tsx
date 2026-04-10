
"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Printer, Pencil } from "lucide-react"
import { InvoiceWithDetails, PatientBasic } from "@/types/financial"
import { InvoicePreviewDialog } from "@/components/invoice-preview-dialog"
import { EditInvoiceDialog } from "./edit-invoice-dialog"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

interface InvoiceSettings {
  id: string
  name: string
  language: string
  companyName: string
  companyAddress: string
  companyCif: string
  companyRegCom: string
  companyEmail: string
  bankName: string
  bankIban: string
  footerText: string
  logoUrl?: string | null
  tvaRate: number
}

// ... existing imports ...

export function InvoicesTable({ 
  invoices, 
  invoiceSettingsList, 
  patients,
  isAdmin = false 
}: { 
  invoices: InvoiceWithDetails[], 
  invoiceSettingsList?: InvoiceSettings[], 
  patients: PatientBasic[],
  isAdmin?: boolean 
}) {
  const [openEditId, setOpenEditId] = useState<string | null>(null)
  const [autoOpenInvoiceId, setAutoOpenInvoiceId] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId')
    if (invoiceId) {
      setTimeout(() => {
        setAutoOpenInvoiceId(invoiceId)
      }, 0)
      
      const params = new URLSearchParams(searchParams)
      params.delete('invoiceId')
      router.replace(`?${params.toString()}`)
    }
  }, [searchParams, router])

  const getSettingsForInvoice = (invoice: InvoiceWithDetails) => {
    if ((invoice as any).settings) return (invoice as any).settings
    if ((invoice as any).settingsId && invoiceSettingsList) {
      return invoiceSettingsList.find(s => s.id === (invoice as any).settingsId)
    }
    return invoiceSettingsList?.[0]
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500">{t('status.invoice.paid', 'Plătit')}</span>
      case 'PARTIAL': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500">{t('status.invoice.partial', 'Parțial')}</span>
      case 'OVERDUE': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500">{t('status.invoice.overdue', 'Restant')}</span>
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">{t('status.invoice.draft', 'Draft')}</span>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
          <tr>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('table.invoice.number', 'Număr')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">{t('table.invoice.patient', 'Pacient')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">{t('table.invoice.date', 'Dată')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">{t('table.invoice.dueDate', 'Scadență')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('table.invoice.status', 'Status')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">{t('table.invoice.total', 'Total')}</th>
            <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Printer className="h-8 w-8 text-zinc-300 dark:text-zinc-700 opacity-50" />
                  <p className="font-medium">{t('table.invoice.empty', 'Nu există facturi.')}</p>
                </div>
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-3 sm:px-6 py-4 font-medium text-zinc-900 dark:text-white">
                  {invoice.series} {invoice.number}
                </td>
                <td className="px-3 sm:px-6 py-4 text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                  {invoice.patient?.name || 'N/A'}
                </td>
                <td className="px-3 sm:px-6 py-4 text-zinc-500 text-sm hidden md:table-cell">
                  {format(new Date(invoice.date), 'dd MMM yyyy')}
                </td>
                <td className="px-3 sm:px-6 py-4 text-zinc-500 text-sm hidden lg:table-cell">
                  {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                </td>
                <td className="px-3 sm:px-6 py-4">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-3 sm:px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                  {Number(invoice.total).toLocaleString()} {invoice.currency}
                </td>
                <td className="px-3 sm:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <InvoicePreviewDialog invoice={invoice} settings={getSettingsForInvoice(invoice)} defaultOpen={invoice.id === autoOpenInvoiceId} />
                    {isAdmin && (
                      <Dialog open={openEditId === invoice.id} onOpenChange={(open) => setOpenEditId(open ? invoice.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Editează">
                            <Pencil className="w-4 h-4 text-zinc-500 hover:text-emerald-600" />
                          </Button>
                        </DialogTrigger>
                        <EditInvoiceDialog 
                          invoice={invoice} 
                          patients={patients} 
                          onOpenChange={(open) => setOpenEditId(open ? invoice.id : null)} 
                        />
                      </Dialog>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
