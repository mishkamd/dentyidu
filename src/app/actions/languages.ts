'use server'

import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerT } from "@/lib/locale-server"
import { log } from "@/lib/logger"

type ActionState = {
  success?: boolean
  message: string
}

/**
 * Fetch all languages for admin management view.
 */
export async function getLanguagesForAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) return []

  return prisma.language.findMany({
    orderBy: { sortOrder: "asc" },
  })
}

/**
 * Create a new language and initialize empty translation entries.
 */
export async function createLanguage(formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  const code = (formData.get("code") as string)?.trim().toLowerCase()
  const name = (formData.get("name") as string)?.trim()
  const flag = (formData.get("flag") as string)?.trim() || "🏳️"

  if (!code || !/^[a-z]{2,5}$/.test(code)) {
    return { message: t('action.language.invalidCodeFormat', 'Codul limbii trebuie să fie format din 2-5 litere (ISO 639-1).') }
  }
  if (!name || name.length < 1) {
    return { message: t('action.language.nameRequired', 'Numele limbii este obligatoriu.') }
  }

  try {
    const existing = await prisma.language.findUnique({ where: { code } })
    if (existing) {
      return { message: t('action.language.codeExists', 'Limba cu acest cod există deja.') }
    }

    // Get max sortOrder
    const last = await prisma.language.findFirst({ orderBy: { sortOrder: "desc" } })
    const sortOrder = (last?.sortOrder ?? -1) + 1

    await prisma.language.create({
      data: { code, name, flag, sortOrder },
    })

    // Create empty translation entries for all existing keys
    const allKeys = await prisma.translation.findMany({
      select: { key: true },
      distinct: ["key"],
    })

    if (allKeys.length > 0) {
      await prisma.translation.createMany({
        data: allKeys.map((t) => ({
          key: t.key,
          locale: code,
          value: "",
        })),
        skipDuplicates: true,
      })
    }

    revalidatePath("/admin/languages")
    revalidatePath("/admin/translations")
    return {
      success: true,
      message: `${t('action.language.addSuccess', 'Limba')} „${name}” (${code}) ${t('action.language.addedWithKeys', 'a fost adăugată cu')} ${allKeys.length} ${t('action.language.translationKeys', 'chei de traducere.')}`,
    }
  } catch {
    return { message: t('action.language.createError', 'Eroare la crearea limbii.') }
  }
}

/**
 * Update language properties (name, flag, active, isDefault).
 */
export async function updateLanguage(formData: FormData): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  const code = (formData.get("code") as string)?.trim()
  const name = (formData.get("name") as string)?.trim()
  const flag = (formData.get("flag") as string)?.trim()
  const active = formData.get("active") === "true"
  const isDefault = formData.get("isDefault") === "true"

  if (!code) {
    return { message: t('action.language.invalidCode', 'Cod de limbă invalid.') }
  }

  try {
    // If setting as default, unset previous default
    if (isDefault) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    await prisma.language.update({
      where: { code },
      data: {
        ...(name ? { name } : {}),
        ...(flag ? { flag } : {}),
        active,
        isDefault,
      },
    })

    revalidatePath("/admin/languages")
    revalidatePath("/admin/translations")
    revalidatePath("/admin/content")
    return { success: true, message: t('action.language.updated', 'Limba a fost actualizată.') }
  } catch {
    return { message: t('action.language.updateError', 'Eroare la actualizare.') }
  }
}

/**
 * Delete a language and all its translations/content.
 */
export async function deleteLanguage(code: string): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  if (!code || !/^[a-z]{2,5}$/.test(code)) {
    return { message: t('action.language.invalidCode', 'Cod de limbă invalid.') }
  }

  try {
    const lang = await prisma.language.findUnique({ where: { code } })
    if (!lang) {
      return { message: t('action.language.notFound', 'Limba nu a fost găsită.') }
    }
    if (lang.isDefault) {
      return { message: t('action.language.cannotDeleteDefault', 'Nu puteți șterge limba implicită. Setați alta ca implicită mai întâi.') }
    }

    // Delete all translations and content for this locale
    await prisma.translation.deleteMany({ where: { locale: code } })
    await prisma.content.deleteMany({ where: { locale: code } })
    await prisma.language.delete({ where: { code } })

    revalidatePath("/admin/languages")
    revalidatePath("/admin/translations")
    revalidatePath("/admin/content")
    return { success: true, message: `${t('action.language.addSuccess', 'Limba')} „${lang.name}” ${t('action.language.deletedWithTranslations', 'și toate traducerile asociate au fost șterse.')}` }
  } catch {
    return { message: t('action.language.deleteError', 'Eroare la ștergerea limbii.') }
  }
}

/**
 * Reorder languages (batch update sortOrder).
 */
export async function reorderLanguages(
  orderedCodes: string[]
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  try {
    for (let i = 0; i < orderedCodes.length; i++) {
      await prisma.language.update({
        where: { code: orderedCodes[i] },
        data: { sortOrder: i },
      })
    }

    revalidatePath("/admin/languages")
    return { success: true, message: t('action.language.reordered', 'Ordinea limbilor a fost actualizată.') }
  } catch {
    return { message: t('action.language.reorderError', 'Eroare la reordonare.') }
  }
}

/**
 * Get translation completeness stats per language.
 */
export async function getTranslationStats(): Promise<
  Array<{ code: string; name: string; flag: string; total: number; filled: number; percentage: number }>
> {
  const admin = await getCurrentAdmin()
  if (!admin) return []

  const languages = await prisma.language.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })

  // Total unique keys
  const allKeys = await prisma.translation.findMany({
    select: { key: true },
    distinct: ["key"],
  })
  const totalKeys = allKeys.length

  // Count filled per locale
  const stats = []
  for (const lang of languages) {
    const filled = await prisma.translation.count({
      where: {
        locale: lang.code,
        value: { not: "" },
      },
    })
    stats.push({
      code: lang.code,
      name: lang.name,
      flag: lang.flag,
      total: totalKeys,
      filled,
      percentage: totalKeys > 0 ? Math.round((filled / totalKeys) * 100) : 0,
    })
  }

  return stats
}
