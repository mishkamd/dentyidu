'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { revalidatePath } from "next/cache"
import { log } from "@/lib/logger"

export async function getSentrySettings() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return null

  return prisma.sentrySettings.findFirst()
}

export async function getPublicSentryDsn() {
  const settings = await prisma.sentrySettings.findFirst({
    select: { dsn: true, isEnabled: true },
  })
  if (!settings?.isEnabled || !settings.dsn) return null
  return { dsn: settings.dsn }
}

export async function updateSentrySettings(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const dsn = (formData.get("dsn") as string) || ""
  const authToken = (formData.get("authToken") as string) || ""
  const isEnabled = formData.get("isEnabled") === "true"

  const existing = await prisma.sentrySettings.findFirst()

  if (existing) {
    await prisma.sentrySettings.update({
      where: { id: existing.id },
      data: { dsn, authToken, isEnabled },
    })
  } else {
    await prisma.sentrySettings.create({
      data: { dsn, authToken, isEnabled },
    })
  }

  log.warn('sentry_settings_updated', `Sentry ${isEnabled ? 'activat' : 'dezactivat'}`, { userId: admin.id })
  revalidatePath("/admin/security/logs")
  return { success: true, message: "Setări Sentry salvate cu succes" }
}
