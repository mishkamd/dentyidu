
import { PatientBasic, InvoiceWithDetails, ServiceItem, LeadBasic } from "@/types/financial"
import { Euro, User, Activity, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PatientDetailsDialog } from "@/components/patient-details-dialog"
import { InvoicePreviewDialog } from "@/components/invoice-preview-dialog"
import { CreateInvoiceDialog } from "./create-invoice-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

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

interface BudgetsTableProps {
  patients: (PatientBasic & { invoices?: any[] })[]
  services: ServiceItem[]
  leads: LeadBasic[]
  invoiceSettingsList?: InvoiceSettings[]
}

export function BudgetsTable({ patients, services, leads, invoiceSettingsList }: BudgetsTableProps) {
  // Filter patients that have a budget
  const patientsWithBudget = patients.filter(p => p.lead?.budget && p.lead.budget !== '')
  const [openCreateId, setOpenCreateId] = useState<string | null>(null)
  const router = useRouter()

  const handleInvoiceCreated = () => {
    setOpenCreateId(null)
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
          <tr>
            <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Pacient</th>
            <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Factură</th>
            <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
            <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Buget Estimativ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
          {patientsWithBudget.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                  <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  <p>Nu există estimări de buget.</p>
                </div>
              </td>
            </tr>
          ) : (
            patientsWithBudget.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <PatientDetailsDialog patient={JSON.parse(JSON.stringify(patient))}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{patient.name}</span>
                    </div>
                  </PatientDetailsDialog>
                </td>
                <td className="px-6 py-4">
                  {patient.invoices && patient.invoices.length > 0 ? (
                    <InvoicePreviewDialog
                      invoice={patient.invoices[0] as unknown as any}
                      settings={invoiceSettingsList?.[0]}
                      trigger={
                        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded w-fit cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                          {patient.invoices[0].series} {patient.invoices[0].number}
                        </span>
                      }
                    />
                  ) : (
                    <Dialog open={openCreateId === patient.id} onOpenChange={(open) => setOpenCreateId(open ? patient.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="h-6 text-xs px-2">
                          <Plus className="w-3 h-3 mr-1" />
                          Adaugă
                        </Button>
                      </DialogTrigger>
                      <CreateInvoiceDialog
                        services={services}
                        patients={[patient]} // Pass only this patient as option
                        leads={leads}
                        settingsList={invoiceSettingsList || []}
                        onOpenChange={(open) => setOpenCreateId(open ? patient.id : null)}
                        onInvoiceCreated={handleInvoiceCreated}
                        defaultPatientId={patient.id} // We might need to add this prop to CreateInvoiceDialog to pre-select
                      />
                    </Dialog>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="text-xs font-normal">
                    {patient.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1 font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                    <Euro className="h-3 w-3" />
                    {patient.lead?.budget}
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
