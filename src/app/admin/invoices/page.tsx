
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { getInvoices, getOffers, getServices, ensureDefaultTemplates } from "@/app/actions/financial"
import { prisma } from "@/lib/prisma"
import FinancialDashboard from "./financial-dashboard"
import { Suspense } from "react"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"

export default async function FinancialPage() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    redirect('/login')
  }

  if (currentAdmin.role === 'DENTIST') {
    redirect('/admin')
  }

  const [invoices, offers, services, patients, leads, invoiceSettingsList] = await Promise.all([
    getInvoices(),
    getOffers(),
    getServices(),
    prisma.patient.findMany({
      where: currentAdmin.role === 'DENTIST' && currentAdmin.clinicId
        ? { clinicId: currentAdmin.clinicId }
        : {},
      include: {
        lead: true,
        hotel: true,
        invoices: {
          select: { series: true, number: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.lead.findMany({
      where: currentAdmin.role === 'DENTIST'
        ? { patient: { clinicId: currentAdmin.clinicId } }
        : { status: { not: 'CONVERTED' } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    }),
    ensureDefaultTemplates()
  ])

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{t["admin.invoices.title"] || "Financiar"}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t["admin.invoices.description"] || "Gestionează oferte, facturi și servicii."}</p>
      </div>

      <Suspense fallback={<div>{t["admin.invoices.loading"] || "Se încarcă financiar..."}</div>}>
        <FinancialDashboard
          initialInvoices={invoices}
          initialOffers={offers}
          services={services}
          patients={patients}
          leads={leads}
          invoiceSettingsList={invoiceSettingsList}
          isAdmin={currentAdmin.role === 'ADMIN'}
        />
      </Suspense>
    </div>
  )
}
