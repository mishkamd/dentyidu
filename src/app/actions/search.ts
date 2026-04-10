"use server"

import { prisma } from "@/lib/prisma"
import { getServerT } from "@/lib/locale-server"
import { getCurrentAdmin } from "@/lib/get-current-admin"

export type SearchResult = {
  type: "LEAD" | "PATIENT" | "INVOICE"
  id: string
  title: string
  subtitle?: string
  href: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const admin = await getCurrentAdmin()
  if (!admin) return []

  if (!query || query.trim().length < 2) return []

  const t = await getServerT()

  const leadStatusMap: Record<string, string> = {
    NOU: t('status.lead.NOU', 'Nou'),
    CONTACT: t('status.lead.CONTACT', 'Contactat'),
    INTERESAT: t('status.lead.INTERESAT', 'Interesat'),
    OFERTAT: t('status.lead.OFERTAT', 'Ofertat'),
    NEINTERESAT: t('status.lead.NEINTERESAT', 'Neinteresat'),
    CONVERTIT: t('status.lead.CONVERTIT', 'Convertit'),
    PIERDUT: t('status.lead.PIERDUT', 'Pierdut'),
    PROGRAMAT: t('status.lead.PROGRAMAT', 'Programat'),
    FINALIZAT: t('status.lead.FINALIZAT', 'Transformat')
  }

  const patientStatusMap: Record<string, string> = {
    IN_ASTEPTARE: t('status.patient.IN_ASTEPTARE', 'În așteptare'),
    PROGRAMAT: t('status.patient.PROGRAMAT', 'Programat'),
    IN_TRATAMENT: t('status.patient.IN_TRATAMENT', 'În tratament'),
    FINALIZAT: t('status.patient.FINALIZAT', 'Finalizat'),
    INCHEIATA: t('status.patient.INCHEIATA', 'Încheiată'),
    ANULATA: t('status.patient.ANULATA', 'Anulată')
  }

  const search = query.trim()
  const results: SearchResult[] = []
  const processedPatientIds = new Set<string>()

  const [leads, patients, invoices] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } }
        ]
      },
      include: { patient: true },
      take: 50
    }),
    prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { treatment: { contains: search, mode: "insensitive" } }
        ]
      },
      take: 50
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { series: { contains: search, mode: "insensitive" } },
          { number: { contains: search, mode: "insensitive" } }
        ]
      },
      include: {
        patient: true,
        offer: {
            include: { lead: true }
        }
      },
      take: 50
    })
  ])

  // Process leads: if lead has patient, add patient to array; otherwise add lead to results
  leads.forEach(lead => {
    if (lead.patient) {
      processedPatientIds.add(lead.patient.id)
      results.push({
        type: "PATIENT",
        id: lead.patient.id,
        title: lead.patient.name,
        subtitle: `Pacient (${patientStatusMap[lead.patient.status] || lead.patient.status})${lead.patient.treatment ? ` • ${lead.patient.treatment}` : ""}`,
        href: `/admin/patients?tab=patients&patientId=${lead.patient.id}`
      })
    } else {
      const statusLabel = leadStatusMap[lead.status] || lead.status
      results.push({
        type: "LEAD",
        id: lead.id,
        title: lead.name,
        subtitle: `Lead (${statusLabel}) • ${lead.email || lead.phone || ""}`,
        href: `/admin/patients?tab=leads&leadId=${lead.id}`
      })
    }
  })

  // Process remaining patients (not already added from leads)
  patients.forEach(patient => {
    if (!processedPatientIds.has(patient.id)) {
      results.push({
        type: "PATIENT",
        id: patient.id,
        title: patient.name,
        subtitle: `Pacient (${patientStatusMap[patient.status] || patient.status})${patient.treatment ? ` • ${patient.treatment}` : ""}`,
        href: `/admin/patients?tab=patients&patientId=${patient.id}`
      })
    }
  })

  invoices.forEach(invoice => {
    const clientName = invoice.patient?.name || invoice.offer?.lead?.name || t('search.unknownClient', 'Client Necunoscut')
    results.push({
      type: "INVOICE",
      id: invoice.id,
      title: `${invoice.series}-${invoice.number}`,
      subtitle: `Factură - ${clientName} - ${invoice.total} ${invoice.currency}`,
      href: `/admin/invoices?invoiceId=${invoice.id}`
    })
  })

  return results
}
