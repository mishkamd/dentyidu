'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerT } from "@/lib/locale-server"
import { log } from "@/lib/logger"
import { sendTelegramAlert } from "@/lib/telegram"
import { getCurrentAdmin } from "@/lib/get-current-admin"

// Schemas
const HotelSchema = z.object({
  name: z.string().min(1, "Numele cazării este obligatoriu"),
  location: z.string().min(1, "Locația este obligatorie"),
  stars: z.number().min(1).max(5),
  pricePerNight: z.number().optional(),
})

const ClinicSchema = z.object({
  name: z.string().min(1, "Numele clinicii este obligatoriu"),
  location: z.string().min(1, "Locația este obligatorie"),
  phone: z.string().optional(),
})

const PatientSchema = z.object({
  name: z.string().min(1, "Numele pacientului este obligatoriu"),
  treatment: z.string().min(1, "Tratamentul este obligatoriu"),
  hotelId: z.string().optional(),
  clinicId: z.string().optional(),
  arrivalDate: z.string().optional(),
  status: z.enum(["IN_ASTEPTARE", "CAZAT", "FINALIZAT"]),
})

export type ActionState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  inputs?: Record<string, string>
}

// Actions
export async function createHotel(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    stars: parseInt(formData.get("stars") as string) || 3,
    pricePerNight: parseInt(formData.get("pricePerNight") as string) || 0,
  }

  const validated = HotelSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        location: rawData.location,
        stars: rawData.stars.toString(),
        pricePerNight: rawData.pricePerNight.toString()
      }
    }
  }

  try {
    await prisma.hotel.create({
      data: validated.data,
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.hotel.createSuccess', 'Cazare adăugată cu succes!') }
  } catch {
    return {
      success: false,
      message: t('action.hotel.createError', 'Eroare la salvarea cazării.'),
      inputs: {
        name: rawData.name,
        location: rawData.location,
        stars: rawData.stars.toString(),
        pricePerNight: rawData.pricePerNight.toString()
      }
    }
  }
}

export async function updateHotel(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    stars: parseInt(formData.get("stars") as string) || 3,
    pricePerNight: parseInt(formData.get("pricePerNight") as string) || 0,
  }

  const validated = HotelSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        location: rawData.location,
        stars: rawData.stars.toString(),
        pricePerNight: rawData.pricePerNight.toString()
      }
    }
  }

  try {
    await prisma.hotel.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.hotel.updateSuccess', 'Cazare actualizată cu succes!') }
  } catch {
    return {
      success: false,
      message: t('action.hotel.updateError', 'Eroare la actualizarea cazării.'),
      inputs: {
        name: rawData.name,
        location: rawData.location,
        stars: rawData.stars.toString(),
        pricePerNight: rawData.pricePerNight.toString()
      }
    }
  }
}

export async function createPatient(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    treatment: formData.get("treatment") as string,
    hotelId: formData.get("hotelId") === "none" ? undefined : formData.get("hotelId") as string,
    clinicId: formData.get("clinicId") === "none" ? undefined : formData.get("clinicId") as string,
    arrivalDate: formData.get("arrivalDate") as string,
    status: (formData.get("status") as any) || "IN_ASTEPTARE",
  }

  const validated = PatientSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        treatment: rawData.treatment,
        hotelId: rawData.hotelId || "",
        clinicId: rawData.clinicId || "",
        arrivalDate: rawData.arrivalDate,
        status: rawData.status
      }
    }
  }

  try {
    await prisma.patient.create({
      data: {
        name: validated.data.name,
        treatment: validated.data.treatment,
        hotelId: validated.data.hotelId || null,
        clinicId: validated.data.clinicId || null,
        arrivalDate: validated.data.arrivalDate ? new Date(validated.data.arrivalDate) : null,
        status: validated.data.status,
      },
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.patient.createSuccess', 'Pacient adăugat cu succes!') }
  } catch (error) {
    log.error('patient_create_error', 'Eroare creare pacient', error)
    return {
      success: false,
      message: t('action.patient.createError', 'Eroare la salvarea pacientului.'),
      inputs: {
        name: rawData.name,
        treatment: rawData.treatment,
        hotelId: rawData.hotelId || "",
        clinicId: rawData.clinicId || "",
        arrivalDate: rawData.arrivalDate,
        status: rawData.status
      }
    }
  }
}

export async function deleteHotel(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: 'Nu sunteți autentificat.' }

  try {
    await prisma.hotel.delete({ where: { id } })
    revalidatePath("/admin/patients")
    return { success: true }
  } catch {
    const t = await getServerT()
    return { message: t('action.common.deleteError', 'Eroare la ștergere.') }
  }
}

export async function deletePatient(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: 'Nu sunteți autentificat.' }

  try {
    await prisma.patient.delete({ where: { id } })
    revalidatePath("/admin/patients")
    return { success: true }
  } catch {
    const t = await getServerT()
    return { message: t('action.common.deleteError', 'Eroare la ștergere.') }
  }
}

// Clinic Actions
export async function createClinic(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    phone: formData.get("phone") as string || undefined,
  }

  const validated = ClinicSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        location: rawData.location,
        phone: rawData.phone || ""
      }
    }
  }

  try {
    await prisma.clinic.create({
      data: validated.data,
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.clinic.createSuccess', 'Clinică adăugată cu succes!') }
  } catch {
    return {
      success: false,
      message: t('action.clinic.createError', 'Eroare la salvarea clinicii.'),
      inputs: {
        name: rawData.name,
        location: rawData.location,
        phone: rawData.phone || ""
      }
    }
  }
}

export async function updateClinic(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    phone: formData.get("phone") as string || undefined,
  }

  const validated = ClinicSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        location: rawData.location,
        phone: rawData.phone || ""
      }
    }
  }

  try {
    await prisma.clinic.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.clinic.updateSuccess', 'Clinică actualizată cu succes!') }
  } catch {
    return {
      success: false,
      message: t('action.clinic.updateError', 'Eroare la actualizarea clinicii.'),
      inputs: {
        name: rawData.name,
        location: rawData.location,
        phone: rawData.phone || ""
      }
    }
  }
}

export async function deleteClinic(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: 'Nu sunteți autentificat.' }

  try {
    await prisma.clinic.delete({ where: { id } })
    revalidatePath("/admin/patients")
    return { success: true }
  } catch {
    const t = await getServerT()
    return { message: t('action.common.deleteError', 'Eroare la ștergere.') }
  }
}

export async function moveToLogistics(leadId: string) {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return { success: false, message: t('action.lead.notFound', 'Lead not found') }

    // Check if already exists
    const existingPatient = await prisma.patient.findUnique({ where: { leadId } })
    if (existingPatient) return { success: false, message: t('action.patient.alreadyExists', 'Pacientul există deja') }

    await prisma.patient.create({
      data: {
        name: lead.name,
        treatment: lead.description.substring(0, 100) || "Tratament nespecificat",
        status: "IN_ASTEPTARE",
        leadId: lead.id
      }
    })

    // Update lead status to PROGRAMAT if it's currently NOU or CONTACTAT
    if (["NOU", "CONTACTAT"].includes(lead.status)) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "PROGRAMAT" }
      })
    }

    // Telegram alert
    sendTelegramAlert(
      `🏥 <b>Pacient Nou în Logistică</b>\n\n` +
        `👤 <b>${lead.name}</b>\n` +
        `📧 ${lead.email}\n` +
        `📱 ${lead.phone}\n` +
        `🦷 ${lead.description.substring(0, 100)}`
    ).catch(() => {})

    revalidatePath("/admin/patients")
    return { success: true, message: t('action.patient.transferSuccess', 'Transferat cu succes!') }
  } catch (error) {
    log.error('patient_transfer_error', 'Eroare transfer pacient', error)
    return { success: false, message: t('action.patient.transferError', 'Eroare la transfer') }
  }
}

export async function updatePatient(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    name: formData.get("name") as string,
    treatment: formData.get("treatment") as string,
    hotelId: formData.get("hotelId") === "none" ? undefined : formData.get("hotelId") as string,
    clinicId: formData.get("clinicId") === "none" ? undefined : formData.get("clinicId") as string,
    arrivalDate: formData.get("arrivalDate") as string,
    status: (formData.get("status") as any) || "IN_ASTEPTARE",
  }

  const validated = PatientSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      message: t('action.form.invalidData', 'Date invalide'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        name: rawData.name,
        treatment: rawData.treatment,
        hotelId: rawData.hotelId || "",
        clinicId: rawData.clinicId || "",
        arrivalDate: rawData.arrivalDate,
        status: rawData.status
      }
    }
  }

  try {
    await prisma.patient.update({
      where: { id },
      data: {
        name: validated.data.name,
        treatment: validated.data.treatment,
        hotelId: validated.data.hotelId || null,
        clinicId: validated.data.clinicId || null,
        arrivalDate: validated.data.arrivalDate ? new Date(validated.data.arrivalDate) : null,
        status: validated.data.status,
      },
    })
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.patient.updateSuccess', 'Pacient actualizat cu succes!') }
  } catch (error) {
    log.error('patient_update_error', 'Eroare actualizare pacient', error)
    return {
      success: false,
      message: t('action.patient.updateError', 'Eroare la actualizarea pacientului.'),
      inputs: {
        name: rawData.name,
        treatment: rawData.treatment,
        hotelId: rawData.hotelId || "",
        clinicId: rawData.clinicId || "",
        arrivalDate: rawData.arrivalDate,
        status: rawData.status
      }
    }
  }
}

export async function updatePatientStatus(id: string, status: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: 'Nu sunteți autentificat.' }

  try {
    const patient = await prisma.patient.findUnique({ where: { id } })
    
    let arrivalDate = patient?.arrivalDate
    const isArrivalStatus = ['SOSIT', 'CAZAT', 'IN_TRATAMENT', 'FINALIZAT'].includes(status)

    // Dacă statusul devine SOSIT, actualizăm data sosirii la momentul curent (confirmare sosire)
    // Sau dacă trecem la un status avansat și nu avem dată setată
    if (status === 'SOSIT' || (isArrivalStatus && !arrivalDate)) {
      arrivalDate = new Date()
    }

    await prisma.patient.update({
      where: { id },
      data: { 
        status,
        arrivalDate
      }
    })

    // Telegram alert for patient status change
    if (patient) {
      const statusLabels: Record<string, string> = {
        IN_ASTEPTARE: "⏳ În Așteptare",
        PROGRAMAT: "📅 Programat",
        SOSIT: "✈️ Sosit",
        CAZAT: "🏨 Cazat",
        IN_TRATAMENT: "🦷 În Tratament",
        FINALIZAT: "✅ Finalizat",
      }
      sendTelegramAlert(
        `📊 <b>Status Pacient Actualizat</b>\n\n` +
          `👤 ${patient.name}\n` +
          `Status: <b>${statusLabels[status] || status}</b>`
      ).catch(() => {})
    }

    revalidatePath("/admin/patients")
    return { success: true }
  } catch {
    return { error: "Failed to update status" }
  }
}

const RadiographySchema = z.object({
  radiographyLink: z.string().url("URL invalid"),
});

export async function uploadRadiography(leadId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  const rawData = {
    radiographyLink: formData.get("radiographyLink") as string,
  };

  const validated = RadiographySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: t('action.radiography.invalidUrl', 'Date invalide: URL-ul radiografiei lipsește sau este invalid.'),
      errors: validated.error.flatten().fieldErrors,
      inputs: {
        radiographyLink: rawData.radiographyLink,
      },
    };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        radiographyLink: validated.data.radiographyLink,
      },
    });
    revalidatePath("/admin/patients");
    revalidatePath("/admin");
    return { success: true, message: t('action.radiography.uploadSuccess', 'Radiografie încărcată cu succes!') };
  } catch (error) {
    log.error('radiography_upload_error', 'Eroare upload radiografie', error);
    return {
      success: false,
      message: t('action.radiography.uploadError', 'Eroare la salvarea radiografiei în baza de date.'),
      inputs: {
        radiographyLink: rawData.radiographyLink,
      },
    };
  }
}

export async function deleteRadiography(leadId: string): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: t('action.common.notAuthenticated', 'Nu sunteți autentificat.') }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        radiographyLink: null,
      },
    });
    revalidatePath("/admin/patients");
    revalidatePath("/admin");
    return { success: true, message: t('action.radiography.deleteSuccess', 'Radiografie ștearsă cu succes!') };
  } catch (error) {
    log.error('radiography_delete_error', 'Eroare ștergere radiografie', error);
    return {
      success: false,
      message: t('action.radiography.deleteError', 'Eroare la ștergerea radiografiei.'),
    };
  }
}
