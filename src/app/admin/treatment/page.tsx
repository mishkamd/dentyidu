import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { redirect } from "next/navigation"
import { TreatmentView } from "@/components/treatment-view"

export const dynamic = 'force-dynamic'

export default async function TreatmentPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/login')
  }

  // Fetch patients with their leads to access budget/country info
  const patients = await prisma.patient.findMany({
    where: currentAdmin.role === 'DENTIST' && currentAdmin.clinicId 
      ? { clinicId: currentAdmin.clinicId } 
      : {},
    orderBy: { createdAt: 'desc' },
    include: {
      lead: true,
      hotel: true,
      invoices: {
        select: { series: true, number: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-zinc-900 dark:text-white tracking-tight">
            {t["admin.treatment.title"] || "Planificare Tratament"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t["admin.treatment.description"] || "Gestionare planuri de tratament, costuri și proceduri medicale."}
          </p>
      </div>

      <TreatmentView patients={JSON.parse(JSON.stringify(patients))} role={currentAdmin.role} />
    </div>
  )
}
