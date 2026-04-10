'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { revalidatePath } from "next/cache"
import { log } from "@/lib/logger"

export async function getCaptchaSettings() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return null

  return prisma.captchaSettings.findFirst()
}

export async function getPublicCaptchaSettings() {
  const settings = await prisma.captchaSettings.findFirst({
    select: { siteKey: true, isEnabled: true },
  })
  return settings
}

export async function updateCaptchaSettings(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const siteKey = (formData.get("siteKey") as string) || ""
  const secretKey = (formData.get("secretKey") as string) || ""
  const isEnabled = formData.get("isEnabled") === "true"

  const existing = await prisma.captchaSettings.findFirst()

  if (existing) {
    await prisma.captchaSettings.update({
      where: { id: existing.id },
      data: { siteKey, secretKey, isEnabled },
    })
  } else {
    await prisma.captchaSettings.create({
      data: { siteKey, secretKey, isEnabled },
    })
  }

  log.warn('captcha_settings_updated', `Captcha ${isEnabled ? 'activat' : 'dezactivat'}`, { userId: admin.id })
  revalidatePath("/admin/security/captcha")
  return { success: true, message: "Setări captcha salvate cu succes" }
}
