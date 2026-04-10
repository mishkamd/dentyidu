import { NextRequest, NextResponse } from "next/server"
import { getBot } from "@/lib/telegram"
import { handleTelegramMessage, handleTelegramCallback } from "@/lib/telegram-handlers"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Verify Telegram webhook secret if configured
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
    if (webhookSecret) {
      const secretHeader = request.headers.get('x-telegram-bot-api-secret-token')
      if (secretHeader !== webhookSecret) {
        return NextResponse.json({ ok: false }, { status: 401 })
      }
    }

    const bot = await getBot()
    if (!bot) {
      return NextResponse.json({ ok: false, error: "Bot not configured" }, { status: 503 })
    }

    const body = await request.json()

    if (body.message) {
      await handleTelegramMessage(bot, body.message)
    } else if (body.callback_query) {
      await handleTelegramCallback(bot, body.callback_query)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    log.error('telegram_webhook_error', 'Telegram webhook error', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
