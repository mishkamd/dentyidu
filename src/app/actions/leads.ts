'use server'

import { prisma } from "@/lib/prisma"
import { LeadSchema, LeadStatusSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { getServerT } from "@/lib/locale-server"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { sendTelegramAlertWithButtons } from "@/lib/telegram"
import { log } from "@/lib/logger"

export type LeadFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
  inputs?: Record<string, string>
}

export async function createLead(prevState: LeadFormState, formData: FormData) {
  // Captcha verification
  const captchaToken = formData.get("captchaToken") as string | null
  const captchaSettings = await prisma.captchaSettings.findFirst()
  if (captchaSettings?.isEnabled && captchaSettings.secretKey) {
    if (!captchaToken) {
      return { message: 'Completează verificarea captcha.', inputs: {} as Record<string, string> }
    }
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: captchaSettings.secretKey, response: captchaToken }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return { message: 'Verificarea captcha a eșuat. Reîncearcă.', inputs: {} as Record<string, string> }
    }
  }

  let radiographyLink = (formData.get("radiographyLink") as string) || undefined
  const radiographyFile = formData.get("radiographyFile") as File | null

  const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB

  if (radiographyFile && radiographyFile.size > 0) {
    // Validate file type and size
    if (!ALLOWED_UPLOAD_TYPES.includes(radiographyFile.type)) {
      return { message: 'Tip de fișier nepermis. Sunt acceptate: JPEG, PNG, WebP, PDF.', inputs: {} as Record<string, string> }
    }
    if (radiographyFile.size > MAX_UPLOAD_SIZE) {
      return { message: 'Fișierul este prea mare. Dimensiunea maximă este 10MB.', inputs: {} as Record<string, string> }
    }

    try {
      const buffer = Buffer.from(await radiographyFile.arrayBuffer())
      const filename = `${Date.now()}-${radiographyFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
      const uploadDir = path.join(process.cwd(), "src/app/image")
      
      await mkdir(uploadDir, { recursive: true })
      await writeFile(path.join(uploadDir, filename), buffer)
      
      radiographyLink = `/image/${filename}`
    } catch (error) {
      log.error('lead_file_upload_error', 'Eroare upload radiografie lead', error)
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    description: formData.get("description") as string,
    radiographyLink: radiographyLink,
    country: formData.get("country") as string,
    budget: (formData.get("budget") as string) || undefined,
  }

  const t = await getServerT()
  const validatedFields = LeadSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: t('action.form.validationError', 'Te rugăm să corectezi erorile din formular.'),
      inputs: rawData as Record<string, string>
    }
  }

  try {
    const createdLead = await prisma.lead.create({
      data: {
        ...validatedFields.data,
        status: "NOU",
      },
    })
    
    // Notify all admins
    const admins = await prisma.admin.findMany({ where: { active: true } })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: t('action.lead.newRequestTitle', 'Solicitare Nouă'),
          message: `${validatedFields.data.name} ${t('action.lead.newRequestMessage', 'a trimis o solicitare nouă.')}`,
          type: "SUCCESS",
          link: `/admin/patients?leadId=${createdLead.id}`
        }))
      })
    }
    
    // Telegram alert
    sendTelegramAlertWithButtons(
      `🆕 <b>Lead Nou!</b>\n\n` +
        `👤 <b>${validatedFields.data.name}</b>\n` +
        `📧 ${validatedFields.data.email}\n` +
        `📱 ${validatedFields.data.phone}\n` +
        `🌍 ${validatedFields.data.country || "—"}\n` +
        `💰 ${validatedFields.data.budget || "—"}\n\n` +
        `📝 ${validatedFields.data.description.substring(0, 200)}`,
      [[{ text: "📋 Vezi în Admin", callback_data: `lead_detail_${createdLead.id}` }]]
    ).catch(() => {}) // fire-and-forget

    // Simulate email sending
    // await sendEmail(...)

    log.info('lead_created', `Lead creat: ${validatedFields.data.name} (${validatedFields.data.email})`)
    revalidatePath("/admin/leads")
    revalidatePath("/admin/appointments")
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.lead.createSuccess', 'Cererea a fost trimisă cu succes!') }
  } catch (error) {
    log.error('lead_create_error', `Eroare creare lead: ${rawData.email}`, error)
    return {
      message: t('action.lead.createError', 'A apărut o eroare la salvarea datelor.'),
      inputs: rawData as Record<string, string>
    }
  }
}

export async function updateLead(id: string, prevState: LeadFormState, formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin) return { message: 'Neautorizat', success: false }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    description: formData.get("description") as string,
    country: formData.get("country") as string,
    budget: (formData.get("budget") as string) || undefined,
    radiographyLink: (formData.get("radiographyLink") as string) || undefined,
  }

  const t = await getServerT()
  const validated = LeadSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.validationError', 'Te rugăm să corectezi erorile din formular.'),
      inputs: rawData as Record<string, string>
    }
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        description: validated.data.description,
        country: validated.data.country,
        budget: validated.data.budget,
        radiographyLink: validated.data.radiographyLink
      },
    })

    log.info('lead_updated', `Lead actualizat: ${id}`, { userId: admin?.id })
    revalidatePath("/admin/leads")
    revalidatePath("/admin/patients")
    return { success: true, message: t('action.lead.updateSuccess', 'Lead actualizat cu succes!') }
  } catch (error) {
    log.error('lead_update_error', `Eroare actualizare lead: ${id}`, error)
    return { 
        message: t('action.lead.updateError', 'Eroare la actualizarea lead-ului.'),
        inputs: rawData as Record<string, string>
    }
  }
}

export async function updateLeadStatus(id: string, status: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const validatedStatus = LeadStatusSchema.safeParse(status)
  
  if (!validatedStatus.success) {
    return { error: "Invalid status" }
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id } })
    await prisma.lead.update({
      where: { id },
      data: { status: validatedStatus.data },
    })

    // Telegram alert for status change
    if (lead) {
      sendTelegramAlertWithButtons(
        `📊 <b>Status Lead Actualizat</b>\n\n` +
          `👤 ${lead.name}\n` +
          `📧 ${lead.email}\n` +
          `Status: <b>${validatedStatus.data}</b>`,
        []
      ).catch(() => {})
    }

    log.info('lead_status_changed', `Lead ${id}: ${lead?.status} → ${validatedStatus.data}`, { userId: admin?.id })
    revalidatePath("/admin/leads")
    revalidatePath("/admin/appointments")
    revalidatePath(`/admin/leads/${id}`)
    return { success: true }
  } catch (error) {
    log.error('lead_status_error', `Eroare schimbare status lead: ${id}`, error)
    return { error: "Failed to update status" }
  }
}

export async function deleteLead(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { success: false, message: 'Neautorizat' }

  try {
    await prisma.lead.delete({
      where: { id },
    })
    log.warn('lead_deleted', `Lead șters: ${id}`, { userId: admin?.id })
    revalidatePath("/admin/leads")
    revalidatePath("/admin/appointments")
    const t = await getServerT()
    return { success: true, message: t('action.lead.deleteSuccess', 'Lead șters cu succes') }
  } catch (error) {
    log.error('lead_delete_error', `Eroare ștergere lead: ${id}`, error)
    const t = await getServerT()
    return { success: false, message: t('action.lead.deleteError', 'Eroare la ștergerea lead-ului') }
  }
}

