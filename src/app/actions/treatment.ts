'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { getServerT } from "@/lib/locale-server"
import { z } from "zod"
import { log } from "@/lib/logger"

const UpdateTreatmentSchema = z.object({
  treatment: z.string().min(1).max(500),
  budget: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
})

export async function updateTreatment(patientId: string, data: { treatment: string, budget?: string, status?: string }) {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.unauthorized', 'Unauthorized') }

  const validated = UpdateTreatmentSchema.safeParse(data)
  if (!validated.success) return { success: false, message: t('action.form.invalidData', 'Date invalide') }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { lead: true }
    })

    if (!patient) return { success: false, message: t('action.treatment.patientNotFound', 'Patient not found') }

    // Clinic scoping: DENTIST can only update patients in their clinic
    if (admin.role === 'DENTIST' && admin.clinicId && patient.clinicId !== admin.clinicId) {
      return { success: false, message: t('action.common.unauthorized', 'Unauthorized') }
    }

    // Update patient treatment and status
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        treatment: validated.data.treatment,
        status: validated.data.status || patient.status
      }
    })

    // Update lead budget if lead exists and budget is provided
    if (patient.leadId && validated.data.budget !== undefined) {
      await prisma.lead.update({
        where: { id: patient.leadId },
        data: {
          budget: validated.data.budget
        }
      })
    }

    log.info('treatment_updated', `Tratament actualizat: ${patientId}`, { userId: admin.id })
    revalidatePath("/admin/treatment")
    revalidatePath("/admin/patients")
    
    return { success: true, message: t('action.treatment.updateSuccess', 'Tratament actualizat cu succes') }
  } catch (error) {
    log.error('treatment_update_error', `Eroare actualizare tratament: ${patientId}`, error, { userId: admin.id })
    return { success: false, message: t('action.treatment.updateError', 'Eroare la actualizarea tratamentului') }
  }
}
