'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { log } from "@/lib/logger"

const ScriptSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  type: z.enum(["css", "js"]),
  content: z.string().min(1, "Conținutul este obligatoriu"),
  position: z.enum(["head", "body"]).default("head"),
  isActive: z.boolean().default(true),
})

export async function getSecurityScripts() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return []
  return prisma.securityScript.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getActiveSecurityScripts() {
  return prisma.securityScript.findMany({
    where: { isActive: true },
    select: { id: true, type: true, content: true, position: true },
  })
}

export async function createSecurityScript(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const parsed = ScriptSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    content: formData.get("content"),
    position: formData.get("position") || "head",
    isActive: formData.get("isActive") === "true",
  })

  if (!parsed.success) {
    return { message: 'Date invalide', errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.securityScript.create({ data: parsed.data })
  log.warn('script_created', `Script creat: ${parsed.data.name} (${parsed.data.type})`, { userId: admin.id })
  revalidatePath("/admin/security/scripts")
  return { success: true, message: "Script adăugat cu succes" }
}

export async function updateSecurityScript(id: string, formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const parsed = ScriptSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    content: formData.get("content"),
    position: formData.get("position") || "head",
    isActive: formData.get("isActive") === "true",
  })

  if (!parsed.success) {
    return { message: 'Date invalide', errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.securityScript.update({ where: { id }, data: parsed.data })
  log.warn('script_updated', `Script actualizat: ${id}`, { userId: admin.id })
  revalidatePath("/admin/security/scripts")
  return { success: true, message: "Script actualizat cu succes" }
}

export async function deleteSecurityScript(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  await prisma.securityScript.delete({ where: { id } })
  log.warn('script_deleted', `Script șters: ${id}`, { userId: admin.id })
  revalidatePath("/admin/security/scripts")
  return { success: true, message: "Script șters cu succes" }
}

export async function toggleSecurityScript(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return { message: 'Neautorizat' }

  const script = await prisma.securityScript.findUnique({ where: { id } })
  if (!script) return { message: 'Script negăsit' }

  await prisma.securityScript.update({
    where: { id },
    data: { isActive: !script.isActive },
  })
  log.info('script_toggled', `Script ${id}: ${script.isActive ? 'dezactivat' : 'activat'}`, { userId: admin.id })
  revalidatePath("/admin/security/scripts")
  return { success: true }
}
