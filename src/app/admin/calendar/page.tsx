import { prisma } from "@/lib/prisma"
import { getServerLocale, getTranslations } from "@/lib/locale-server"
import { CalendarView, CalendarEvent } from "@/components/calendar-view"
import { addDays } from "date-fns"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/login')
  }

  const [patients, leads] = await Promise.all([
    prisma.patient.findMany({
      where: {
        ...(currentAdmin.role === 'DENTIST' 
          ? { clinicId: currentAdmin.clinicId || 'RESTRICTED_VIEW' } 
          : {}),
        OR: [
          { arrivalDate: { not: null } },
          // We can add more conditions if needed
        ]
      },
      include: {
        hotel: true,
        lead: true
      }
    }),
    currentAdmin.role === 'DENTIST'
      ? Promise.resolve([])
      : prisma.lead.findMany({
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 2)) // Last 2 months
            }
          },
          orderBy: { createdAt: 'desc' }
        })
  ])

  const events: CalendarEvent[] = []

  // Add Patient Arrivals
  patients.forEach(patient => {
    if (patient.arrivalDate) {
      if (patient.status === 'FINALIZAT') {
        // ONLY show Finalizare event if status is FINALIZAT
        const departureDate = patient.updatedAt
        events.push({
          id: `dept-${patient.id}`,
          date: departureDate,
          title: `Finalizare: ${patient.name}`,
          type: 'treatment',
          description: `Tratament finalizat`,
          status: patient.status,
          details: {
            patientName: patient.name,
            treatment: patient.treatment
          }
        })
      } else {
        // ONLY show Arrival event if NOT finalized
        events.push({
          id: `arrival-${patient.id}`,
          date: patient.arrivalDate,
          title: `Sosire: ${patient.name}`,
          type: 'arrival',
          description: `Sosire pacient pentru tratament: ${patient.treatment}`,
          status: patient.status,
          details: {
            patientName: patient.name,
            hotel: patient.hotel?.name || 'Nespecificat',
            treatment: patient.treatment,
            phone: patient.lead?.phone
          }
        })
      }
    }
  })

  // Add New Leads (as info)
  leads.forEach(lead => {
    events.push({
      id: `lead-${lead.id}`,
      date: lead.createdAt,
      title: lead.name,
      type: 'lead',
      description: `Cerere nouă: ${lead.description}`,
      details: {
        patientName: lead.name,
        phone: lead.phone,
        treatment: 'Interesat de tratament' // Generic since it's a lead
      }
    })
  })

  const locale = await getServerLocale()
  const t = await getTranslations(locale)

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{t["admin.calendar.title"] || "Calendar & Programări"}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t["admin.calendar.description"] || "Vizualizează programul clinicii și termenele limită."}</p>
      </div>

      <div className="h-full pb-6">
        <CalendarView events={events} />
      </div>
    </div>
  )
}
