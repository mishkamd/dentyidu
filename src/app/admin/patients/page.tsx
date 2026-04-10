import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { UnifiedPatientsView } from "@/components/unified-patients-view"

export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/login')
  }

  if (currentAdmin.role === 'DENTIST') {
    redirect('/admin')
  }

  // Fetch all necessary data in parallel
  const [leads, patients, hotels, clinics] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { patient: true }
    }),
    prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: true,
        clinic: true,
        lead: true
      }
    }),
    prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: { admins: true }
    })
  ])

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{t["admin.patients.title"] || "Management Pacienți"}</h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t["admin.patients.description"] || "Platformă unificată pentru programări, pacienți și logistică."}</p>
      </div>

      <Suspense fallback={<div>{t["admin.patients.loading"] || "Se încarcă lista..."}</div>}>
        <UnifiedPatientsView
          leads={JSON.parse(JSON.stringify(leads))}
          patients={JSON.parse(JSON.stringify(patients))}
          hotels={JSON.parse(JSON.stringify(hotels))}
          clinics={JSON.parse(JSON.stringify(clinics))}
        />
      </Suspense>
    </div>
  )
}
