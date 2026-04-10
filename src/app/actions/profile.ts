'use server'

import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerT } from "@/lib/locale-server"
import { log } from "@/lib/logger"

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere").optional(),
  email: z.string().email("Adresă de email invalidă").optional(),
})

const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
})

export type ProfileState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  inputs?: Record<string, string>
}

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { success: false, message: t('action.profile.notAuthenticated', 'Nu sunteți autentificat.'), errors: {} }
  }

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  }

  const validated = UpdateProfileSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.'),
      inputs: rawData
    }
  }

  const { name, email } = validated.data

  try {
    // Check if email is taken by another user
    if (email && email !== currentAdmin.email) {
      const existing = await prisma.admin.findUnique({ where: { email } })
      if (existing) {
        return { 
          success: false, 
          message: t('action.profile.emailTaken', 'Acest email este deja utilizat.'), 
          errors: {},
          inputs: rawData
        }
      }
    }

    await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/users')
    return { success: true, message: t('action.profile.updateSuccess', 'Profil actualizat cu succes!'), errors: {} }
  } catch {
    return { success: false, message: t('action.profile.updateError', 'Eroare la actualizarea profilului.'), errors: {}, inputs: rawData }
  }
}

export async function changePassword(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const t = await getServerT()
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return { success: false, message: t('action.profile.notAuthenticated', 'Nu sunteți autentificat.'), errors: {} }
  }

  const rawData = {
    newPassword: formData.get("newPassword") as string,
  }

  const validated = ChangePasswordSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: t('action.form.invalidData', 'Date invalide.')
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10)

    await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: { password: hashedPassword }
    })

    return { success: true, message: t('action.profile.passwordChanged', 'Parola a fost schimbată cu succes!'), errors: {} }
  } catch {
    return { success: false, message: t('action.profile.passwordError', 'Eroare la schimbarea parolei.'), errors: {} }
  }
}
