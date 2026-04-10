import TelegramBot from "node-telegram-bot-api"
import { prisma } from "@/lib/prisma"

let botInstance: TelegramBot | null = null
let currentToken: string | null = null

async function getBot(): Promise<TelegramBot | null> {
  const settings = await prisma.telegramSettings.findFirst({
    where: { isActive: true },
  })
  if (!settings?.botToken) return null

  // Reuse existing instance if token hasn't changed
  if (botInstance && currentToken === settings.botToken) return botInstance

  // Stop old instance if token changed
  if (botInstance) {
    try { botInstance.stopPolling() } catch { /* ignore */ }
  }

  botInstance = new TelegramBot(settings.botToken)
  currentToken = settings.botToken
  return botInstance
}

export async function sendTelegramAlert(message: string) {
  try {
    const bot = await getBot()
    if (!bot) return

    const users = await prisma.telegramUser.findMany({
      where: { isActive: true, settings: { isActive: true } },
    })

    for (const user of users) {
      try {
        await bot.sendMessage(user.telegramUserId, message, { parse_mode: "HTML" })
      } catch (err) {
        console.error(`Telegram send failed for ${user.telegramUserId}:`, err)
      }
    }
  } catch (err) {
    console.error("Telegram alert error:", err)
  }
}

export async function sendTelegramAlertWithButtons(
  message: string,
  buttons: { text: string; callback_data: string }[][]
) {
  try {
    const bot = await getBot()
    if (!bot) return

    const users = await prisma.telegramUser.findMany({
      where: { isActive: true, settings: { isActive: true } },
    })

    for (const user of users) {
      try {
        await bot.sendMessage(user.telegramUserId, message, {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: buttons },
        })
      } catch (err) {
        console.error(`Telegram send failed for ${user.telegramUserId}:`, err)
      }
    }
  } catch (err) {
    console.error("Telegram alert with buttons error:", err)
  }
}

export { getBot }
