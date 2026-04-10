
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoicesTable } from "./invoices-table"
import { BudgetsTable } from "./budgets-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateInvoiceDialog } from "./create-invoice-dialog"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"


import { InvoiceSettingsForm } from "./invoice-settings-form"
import { InvoiceWithDetails, OfferWithDetails, ServiceItem, PatientBasic, LeadBasic } from "@/types/financial"

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

interface FinancialDashboardProps {
  initialInvoices: InvoiceWithDetails[]
  initialOffers: OfferWithDetails[]
  services: ServiceItem[]
  patients: PatientBasic[]
  leads: LeadBasic[]
  invoiceSettingsList: InvoiceSettings[]
  isAdmin: boolean
}

export default function FinancialDashboard({
  initialInvoices,
  initialOffers,
  services,
  patients,
  leads,
  invoiceSettingsList,
  isAdmin
}: FinancialDashboardProps) {
  const [activeTab, setActiveTab] = useState("invoices")
  const [isCreateInvoiceOpen, setCreateInvoiceOpen] = useState(false)
  const router = useRouter()

  const handleInvoiceCreated = () => {
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-6 gap-2 sm:gap-3 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        <div className="flex flex-wrap gap-1 sm:gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl w-fit border border-gray-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'invoices'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            Facturi
          </button>
          <button
            onClick={() => setActiveTab('estimates')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'estimates'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            Estimări
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'template'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            Template
          </button>
        </div>

        <div className="shrink-0">
          {activeTab !== 'template' && (
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button variant="admin_primary" size="admin_pill" className="h-9 sm:h-11 px-3 sm:px-8">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Factură Nouă</span>
                </Button>
              </DialogTrigger>
              <CreateInvoiceDialog
                services={services}
                patients={patients}
                leads={leads}
                settingsList={invoiceSettingsList}
                onOpenChange={setCreateInvoiceOpen}
                onInvoiceCreated={handleInvoiceCreated}
              />
            </Dialog>
          )}
        </div>
      </div>

      <div className="p-0">
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <InvoicesTable invoices={initialInvoices} invoiceSettingsList={invoiceSettingsList} isAdmin={isAdmin} patients={patients} />
          </div>
        )}

        {activeTab === 'estimates' && (
          <div className="overflow-x-auto">
            <BudgetsTable patients={patients} services={services} leads={leads} invoiceSettingsList={invoiceSettingsList} />
          </div>
        )}

        {activeTab === 'template' && (
          <InvoiceSettingsForm settingsList={invoiceSettingsList} />
        )}
      </div>
    </div>
  )
}
