'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { revalidatePath } from "next/cache"

type LogData = {
  level: "info" | "warning" | "error" | "critical"
  event: string
  message: string
  details?: string
  ipAddress?: string
  userAgent?: string
  userId?: string
}

export async function createSecurityLog(data: LogData) {
  await prisma.securityLog.create({ data })
}

export async function getSecurityLogs(filters?: {
  level?: string
  event?: string
  limit?: number
}) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return []

  return prisma.securityLog.findMany({
    where: {
      ...(filters?.level && { level: filters.level }),
      ...(filters?.event && { event: filters.event }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
  })
}

export async function getSecurityLogStats() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return null

  const [total, errors, warnings, critical] = await Promise.all([
    prisma.securityLog.count(),
    prisma.securityLog.count({ where: { level: 'error' } }),
    prisma.securityLog.count({ where: { level: 'warning' } }),
    prisma.securityLog.count({ where: { level: 'critical' } }),
  ])

  return { total, errors, warnings, critical }
}

export async function cleanupOldLogs(daysOld: number = 30) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysOld)

  const result = await prisma.securityLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })

  revalidatePath("/admin/security/logs")
  return { success: true, message: `${result.count} loguri șterse` }
}

export async function deleteAllSecurityLogs() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  await prisma.securityLog.deleteMany()
  revalidatePath("/admin/security/logs")
  return { success: true, message: "Toate logurile au fost șterse" }
}
