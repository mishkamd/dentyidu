'use server'

import { getCurrentAdmin } from "@/lib/get-current-admin"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getServerT } from "@/lib/locale-server"
import { log } from "@/lib/logger"

type ActionState = {
  success?: boolean
  message: string
}

export async function getTranslationsForAdmin(locale: Locale) {
  const admin = await getCurrentAdmin()
  if (!admin) return []

  return prisma.translation.findMany({
    where: { locale },
    orderBy: { key: "asc" },
  })
}

export async function upsertTranslation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  const key = (formData.get("key") as string)?.trim()
  const locale = formData.get("locale") as string
  const value = (formData.get("value") as string) || ""

  if (!key || !locale || !isValidLocale(locale)) {
    return { message: t('action.form.invalidData', 'Date invalide.') }
  }

  try {
    await prisma.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value },
      create: { key, locale, value },
    })
  } catch {
    return { message: t('action.common.saveError', 'Eroare la salvare.') }
  }

  revalidatePath("/admin/translations")
  return { success: true, message: t('action.translation.saved', 'Traducere salvată!') }
}

export async function bulkUpsertTranslations(
  translations: Array<{ key: string; locale: string; value: string }>
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  try {
    for (const tr of translations) {
      if (!tr.key?.trim() || !isValidLocale(tr.locale)) continue
      await prisma.translation.upsert({
        where: { key_locale: { key: tr.key.trim(), locale: tr.locale } },
        update: { value: tr.value },
        create: { key: tr.key.trim(), locale: tr.locale, value: tr.value },
      })
    }
  } catch {
    return { message: t('action.common.saveError', 'Eroare la salvare.') }
  }

  revalidatePath("/admin/translations")
  return { success: true, message: t('action.translation.bulkSaved', 'Traduceri salvate!') }
}

export async function deleteTranslation(key: string, locale: string): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  if (!key || !isValidLocale(locale)) {
    return { message: t('action.form.invalidData', 'Date invalide.') }
  }

  try {
    await prisma.translation.delete({
      where: { key_locale: { key, locale } },
    })
  } catch {
    return { message: t('action.common.deleteError', 'Eroare la ștergere.') }
  }

  revalidatePath("/admin/translations")
  return { success: true, message: t('action.translation.deleted', 'Traducere ștearsă.') }
}

/**
 * Add a new language by creating empty translation entries
 * for all existing keys in the new locale.
 */
export async function addLanguage(
  localeCode: string,
  label: string
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  const code = localeCode.trim().toLowerCase()
  if (!code || code.length < 2 || code.length > 5 || !/^[a-z]{2,5}$/.test(code)) {
    return { message: t('action.language.invalidCode', 'Cod de limbă invalid. Folosiți coduri ISO 639-1 (ex: de, es, it).') }
  }

  let keyCount = 0
  try {
    // Check if language already exists
    const existing = await prisma.translation.findFirst({ where: { locale: code } })
    if (existing) {
      return { message: t('action.language.alreadyExists', 'Limba există deja.') }
    }

    // Get all unique keys from existing translations
    const allKeys = await prisma.translation.findMany({
      select: { key: true },
      distinct: ["key"],
    })
    keyCount = allKeys.length

    // Create empty entries for the new locale
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
  } catch {
    return { message: t('action.language.addError', 'Eroare la adăugarea limbii.') }
  }

  revalidatePath("/admin/translations")
  return { success: true, message: `${t('action.language.addSuccess', 'Limba')} "${label}" (${code}) ${t('action.language.addedWithKeys', 'a fost adăugată cu')} ${keyCount} ${t('action.language.emptyKeys', 'chei goale.')}` }
}

/**
 * Update content for a specific locale.
 * Used by the content editor to save localized content.
 */
export async function upsertLocalizedContent(
  key: string,
  locale: string,
  value: string
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  if (!key || !isValidLocale(locale)) {
    return { message: t('action.form.invalidData', 'Date invalide.') }
  }

  try {
    await prisma.content.upsert({
      where: { key_locale: { key, locale } },
      update: { value },
      create: { key, locale, value },
    })
  } catch {
    return { message: t('action.common.saveError', 'Eroare la salvare.') }
  }

  revalidatePath("/admin/content")
  revalidatePath("/")
  return { success: true, message: t('action.content.contentSaved', 'Conținut salvat!') }
}

/**
 * Delete a translation key across ALL locales.
 */
export async function deleteTranslationKey(key: string): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "ADMIN") {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  if (!key?.trim()) {
    return { message: t('action.form.invalidData', 'Date invalide.') }
  }

  try {
    await prisma.translation.deleteMany({ where: { key: key.trim() } })
  } catch {
    return { message: t('action.common.deleteError', 'Eroare la ștergere.') }
  }

  revalidatePath("/admin/translations")
  return { success: true, message: t('action.translation.deleted', 'Traducere ștearsă.') }
}

/**
 * Copy translations from one locale to another.
 * @param onlyMissing - if true, only copies where target is empty
 */
export async function copyLocaleTranslations(
  sourceLocale: string,
  targetLocale: string,
  onlyMissing: boolean = true
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  if (!isValidLocale(sourceLocale) || !isValidLocale(targetLocale)) {
    return { message: t('action.form.invalidData', 'Date invalide.') }
  }

  try {
    const sourceRows = await prisma.translation.findMany({
      where: { locale: sourceLocale },
    })

    let copied = 0
    for (const row of sourceRows) {
      if (!row.value?.trim()) continue

      if (onlyMissing) {
        const existing = await prisma.translation.findUnique({
          where: { key_locale: { key: row.key, locale: targetLocale } },
        })
        if (existing?.value?.trim()) continue
      }

      await prisma.translation.upsert({
        where: { key_locale: { key: row.key, locale: targetLocale } },
        update: { value: row.value },
        create: { key: row.key, locale: targetLocale, value: row.value },
      })
      copied++
    }

    revalidatePath("/admin/translations")
    return { success: true, message: `${copied} ${t('action.translation.copiedKeys', 'chei copiate.')}` }
  } catch {
    return { message: t('action.common.saveError', 'Eroare la salvare.') }
  }
}

/**
 * Bulk save translations across ALL locales at once.
 * Accepts array of { key, locale, value } entries.
 */
export async function bulkSaveAllLocales(
  entries: Array<{ key: string; locale: string; value: string }>
): Promise<ActionState> {
  const t = await getServerT()
  const admin = await getCurrentAdmin()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
    return { message: t('action.common.noPermission', 'Nu aveți permisiuni.') }
  }

  try {
    for (const entry of entries) {
      if (!entry.key?.trim() || !isValidLocale(entry.locale)) continue
      await prisma.translation.upsert({
        where: { key_locale: { key: entry.key.trim(), locale: entry.locale } },
        update: { value: entry.value },
        create: { key: entry.key.trim(), locale: entry.locale, value: entry.value },
      })
    }
  } catch {
    return { message: t('action.common.saveError', 'Eroare la salvare.') }
  }

  revalidatePath("/admin/translations")
  revalidatePath("/")
  return { success: true, message: t('action.translation.bulkSaved', 'Traduceri salvate!') }
}
