'use server'

import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { CreateUserSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerT } from "@/lib/locale-server"
import { z } from "zod"
import { log } from "@/lib/logger"

type CreateUserState = {
  errors?: Record<string, string[]>
  message: string
  success?: boolean
  inputs?: Record<string, string>
}

export async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermissionCreate', 'Nu aveți permisiunea de a crea utilizatori.') }
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
    clinicId: formData.get("clinicId") as string || "none",
  }

  const validated = CreateUserSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.'),
      inputs: rawData as Record<string, string>
    }
  }

  const { name, email, password, role, clinicId } = validated.data

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    return {
      message: t('action.user.emailExists', 'Există deja un utilizator cu acest email.'),
      inputs: rawData as Record<string, string>
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.admin.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: role as any,
        clinicId: clinicId !== "none" ? clinicId : null,
      },
    })
  } catch (error) {
    log.error('user_create_error', `Eroare creare utilizator: ${email}`, error, { userId: currentAdmin.id })
    return {
      message: t('action.user.createError', 'Eroare la crearea utilizatorului.'),
      inputs: rawData as Record<string, string>
    }
  }

  log.info('user_created', `Utilizator creat: ${email} (${role})`, { userId: currentAdmin.id })
  revalidatePath('/admin/users')
  return { message: t('action.user.createSuccess', 'Utilizator creat cu succes!'), success: true }
}

export async function deleteUser(userId: string) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    throw new Error(t('action.user.noPermissionDelete', 'Nu aveți permisiunea de a șterge utilizatori.'))
  }

  if (currentAdmin.id === userId) {
    throw new Error(t('action.user.cannotDeleteSelf', 'Nu vă puteți șterge propriul cont.'))
  }

  await prisma.admin.delete({
    where: { id: userId },
  })

  log.warn('user_deleted', `Utilizator șters: ${userId}`, { userId: currentAdmin.id })
  revalidatePath('/admin/users')
}

export async function toggleUserStatus(userId: string, active: boolean) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermission', 'Nu aveți permisiunea.') }
  }
  if (currentAdmin.id === userId) {
    return { message: t('action.user.cannotDeactivateSelf', 'Nu vă puteți dezactiva propriul cont.') }
  }

  await prisma.admin.update({
    where: { id: userId },
    data: { active },
  })

  log.info('user_status_toggled', `Utilizator ${userId}: ${active ? 'activat' : 'dezactivat'}`, { userId: currentAdmin.id })
  revalidatePath('/admin/users', 'page')
  return { success: true, message: active ? t('action.user.activated', 'Utilizatorul a fost activat.') : t('action.user.deactivated', 'Utilizatorul a fost dezactivat.') }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermission', 'Nu aveți permisiunea.') }
  }

  const parsed = z.string().min(6).max(100).safeParse(newPassword)
  if (!parsed.success) return { message: t('action.form.invalidData', 'Parola trebuie să aibă minim 6 caractere.') }

  const hashedPassword = await bcrypt.hash(parsed.data, 10)
  await prisma.admin.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  log.warn('user_password_reset', `Parola resetată pentru: ${userId}`, { userId: currentAdmin.id })
  revalidatePath('/admin/users', 'page')
  return { success: true, message: t('action.user.passwordReset', 'Parola a fost resetată.') }
}

export async function updateUserName(userId: string, name: string) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermission', 'Nu aveți permisiunea.') }
  }

  const parsed = z.string().min(1).max(200).safeParse(name)
  if (!parsed.success) return { message: t('action.form.invalidData', 'Date invalide.') }

  await prisma.admin.update({
    where: { id: userId },
    data: { name: parsed.data },
  })

  revalidatePath('/admin/users', 'page')
  return { success: true, message: t('action.user.nameUpdated', 'Numele a fost actualizat.') }
}

const VALID_ROLES = ['ADMIN', 'MANAGER', 'DENTIST'] as const

export async function updateUserRole(userId: string, role: string) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermission', 'Nu aveți permisiunea.') }
  }

  if (!VALID_ROLES.includes(role as any)) {
    return { message: t('action.form.invalidData', 'Rol invalid.') }
  }

  // Optional: Prevenim schimbarea propriului rol pentru a nu pierde accesul admin
  if (currentAdmin.id === userId && role !== 'ADMIN') {
    return { message: t('action.user.cannotChangeOwnRole', 'Nu vă puteți schimba propriul rol de ADMIN.') }
  }

  await prisma.admin.update({
    where: { id: userId },
    data: { role },
  })

  log.warn('user_role_changed', `Rol schimbat pentru ${userId}: ${role}`, { userId: currentAdmin.id })
  revalidatePath('/admin/users', 'page')
  return { success: true, message: t('action.user.roleUpdated', 'Rolul a fost actualizat.') }
}
export async function updateUserClinic(userId: string, clinicId: string | null) {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
    return { message: t('action.user.noPermission', 'Nu aveți permisiunea.') }
  }

  await prisma.admin.update({
    where: { id: userId },
    data: { clinicId },
  })

  revalidatePath('/admin/users', 'page')
  return { success: true, message: t('action.user.clinicUpdated', 'Clinica a fost actualizată.') }
}
