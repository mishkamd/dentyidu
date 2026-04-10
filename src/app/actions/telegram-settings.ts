'use server'

import { prisma } from "@/lib/prisma"
import { TelegramSettingsSchema, TelegramUserSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { log } from "@/lib/logger"

export type TelegramFormState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

// --- Settings CRUD ---

export async function getTelegramSettings() {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') return null

  return prisma.telegramSettings.findFirst({
    include: { users: { orderBy: { createdAt: 'asc' } } },
  })
}

export async function saveTelegramSettings(
  prevState: TelegramFormState,
  formData: FormData
): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  const rawData = {
    botToken: (formData.get('botToken') as string)?.trim(),
    webhookUrl: (formData.get('webhookUrl') as string)?.trim() || '',
    isActive: formData.get('isActive') === 'true',
  }

  const validated = TelegramSettingsSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      message: 'Date invalide',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const existing = await prisma.telegramSettings.findFirst()

    if (existing) {
      await prisma.telegramSettings.update({
        where: { id: existing.id },
        data: validated.data,
      })
    } else {
      await prisma.telegramSettings.create({
        data: validated.data,
      })
    }

    revalidatePath('/admin/settings')
    return { success: true, message: 'Setări Telegram salvate!' }
  } catch (error) {
    log.error('telegram_settings_error', 'Eroare salvare setări telegram', error)
    return { success: false, message: 'Eroare la salvarea setărilor.' }
  }
}

// --- Webhook ---

export async function setTelegramWebhook(): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    const settings = await prisma.telegramSettings.findFirst()
    if (!settings?.botToken) {
      return { success: false, message: 'Salvați mai întâi token-ul bot-ului.' }
    }
    if (!settings.webhookUrl) {
      return { success: false, message: 'Introduceți URL-ul website-ului.' }
    }

    const webhookEndpoint = `${settings.webhookUrl.replace(/\/$/, '')}/api/telegram`

    const res = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookEndpoint }),
      }
    )
    const data = await res.json()

    if (data.ok) {
      return { success: true, message: `Webhook setat: ${webhookEndpoint}` }
    } else {
      return { success: false, message: `Eroare Telegram: ${data.description || 'Eroare necunoscută'}` }
    }
  } catch (error) {
    log.error('telegram_webhook_error', 'Eroare setare webhook', error)
    return { success: false, message: 'Eroare la setarea webhook-ului.' }
  }
}

export async function removeTelegramWebhook(): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    const settings = await prisma.telegramSettings.findFirst()
    if (!settings?.botToken) {
      return { success: false, message: 'Token-ul bot-ului lipsește.' }
    }

    const res = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/deleteWebhook`,
      { method: 'POST' }
    )
    const data = await res.json()

    if (data.ok) {
      return { success: true, message: 'Webhook eliminat cu succes.' }
    } else {
      return { success: false, message: `Eroare: ${data.description || 'Eroare necunoscută'}` }
    }
  } catch (error) {
    log.error('telegram_webhook_remove_error', 'Eroare eliminare webhook', error)
    return { success: false, message: 'Eroare la eliminarea webhook-ului.' }
  }
}

export async function testTelegramBot(): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    const settings = await prisma.telegramSettings.findFirst()
    if (!settings?.botToken) {
      return { success: false, message: 'Token-ul bot-ului lipsește.' }
    }

    const res = await fetch(`https://api.telegram.org/bot${settings.botToken}/getMe`)
    const data = await res.json()

    if (data.ok) {
      return {
        success: true,
        message: `✅ Bot conectat: @${data.result.username} (${data.result.first_name})`,
      }
    } else {
      return { success: false, message: `❌ Token invalid: ${data.description || 'Eroare necunoscută'}` }
    }
  } catch (error) {
    log.error('telegram_test_error', 'Eroare testare bot', error)
    return { success: false, message: 'Eroare la testarea conexiunii.' }
  }
}

// --- Mini App ---

export async function setTelegramMiniApp(): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    const settings = await prisma.telegramSettings.findFirst()
    if (!settings?.botToken) {
      return { success: false, message: 'Salvați mai întâi token-ul bot-ului.' }
    }
    if (!settings.webhookUrl) {
      return { success: false, message: 'Introduceți URL-ul website-ului.' }
    }

    const adminUrl = `${settings.webhookUrl.replace(/\/$/, '')}/admin`

    const res = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/setChatMenuButton`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_button: {
            type: 'web_app',
            text: 'Admin Panel',
            web_app: { url: adminUrl },
          },
        }),
      }
    )
    const data = await res.json()

    if (data.ok) {
      return { success: true, message: `Mini App setat: ${adminUrl}` }
    } else {
      return { success: false, message: `Eroare Telegram: ${data.description || 'Eroare necunoscută'}` }
    }
  } catch (error) {
    log.error('telegram_miniapp_error', 'Eroare setare Mini App', error)
    return { success: false, message: 'Eroare la setarea Mini App.' }
  }
}

// --- Telegram Users CRUD ---

export async function addTelegramUser(
  prevState: TelegramFormState,
  formData: FormData
): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  const rawData = {
    telegramUserId: (formData.get('telegramUserId') as string)?.trim(),
    label: (formData.get('label') as string)?.trim() || '',
    isActive: true,
  }

  const validated = TelegramUserSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      message: 'Date invalide',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const settings = await prisma.telegramSettings.findFirst()
    if (!settings) {
      return { success: false, message: 'Salvați mai întâi setările bot-ului.' }
    }

    await prisma.telegramUser.create({
      data: {
        telegramUserId: validated.data.telegramUserId,
        label: validated.data.label || '',
        isActive: validated.data.isActive,
        settingsId: settings.id,
      },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: 'Utilizator Telegram adăugat!' }
  } catch (error) {
    log.error('telegram_user_add_error', 'Eroare adăugare utilizator telegram', error)
    return { success: false, message: 'Eroare la adăugarea utilizatorului.' }
  }
}

export async function removeTelegramUser(userId: string): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    await prisma.telegramUser.delete({ where: { id: userId } })
    revalidatePath('/admin/settings')
    return { success: true, message: 'Utilizator șters.' }
  } catch (error) {
    log.error('telegram_user_remove_error', 'Eroare ștergere utilizator telegram', error)
    return { success: false, message: 'Eroare la ștergerea utilizatorului.' }
  }
}

export async function toggleTelegramUser(userId: string, isActive: boolean): Promise<TelegramFormState> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, message: 'Neautorizat' }
  }

  try {
    await prisma.telegramUser.update({
      where: { id: userId },
      data: { isActive },
    })
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    log.error('telegram_user_toggle_error', 'Eroare actualizare utilizator telegram', error)
    return { success: false, message: 'Eroare la actualizare.' }
  }
}
