import TelegramBot from "node-telegram-bot-api"
import { prisma } from "@/lib/prisma"

const PATIENT_STATUSES: Record<string, string> = {
  IN_ASTEPTARE: "⏳ În Așteptare",
  PROGRAMAT: "📅 Programat",
  SOSIT: "✈️ Sosit",
  CAZAT: "🏨 Cazat",
  IN_TRATAMENT: "🦷 În Tratament",
  FINALIZAT: "✅ Finalizat",
}

const LEAD_STATUSES: Record<string, string> = {
  NOU: "🆕 Nou",
  CONTACTAT: "📞 Contactat",
  OFERTA_TRIMISA: "📧 Ofertă Trimisă",
  PROGRAMAT: "📅 Programat",
  FINALIZAT: "✅ Finalizat",
  PIERDUT: "❌ Pierdut",
  ANULAT: "🚫 Anulat",
}

const PAGE_SIZE = 6

async function isAuthorized(telegramUserId: string): Promise<boolean> {
  const user = await prisma.telegramUser.findFirst({
    where: {
      telegramUserId,
      isActive: true,
      settings: { isActive: true },
    },
  })
  return !!user
}

export async function handleTelegramMessage(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id
  const userId = msg.from?.id?.toString()
  if (!userId) return

  if (!(await isAuthorized(userId))) {
    await bot.sendMessage(chatId, "⛔ Nu aveți acces. Contactați administratorul.")
    return
  }

  const text = msg.text?.trim() || ""

  if (text === "/start" || text === "/help") {
    const settings = await prisma.telegramSettings.findFirst({ where: { isActive: true } })
    const baseUrl = settings?.webhookUrl?.replace(/\/$/, '')

    const keyboard: TelegramBot.InlineKeyboardButton[][] = []
    if (baseUrl) {
      keyboard.push([{ text: "🖥 Admin Panel", web_app: { url: `${baseUrl}/admin` } }])
    }

    await bot.sendMessage(
      chatId,
      `🦷 <b>DentyIDU Bot</b>\n\n` +
        `Comenzi disponibile:\n` +
        `/pacienti — Lista pacienților\n` +
        `/leaduri — Lista lead-urilor\n` +
        `/medici — Lista medicilor\n` +
        `/cazare — Lista cazărilor\n` +
        `/clinici — Lista clinicilor\n` +
        `/stats — Statistici rapide`,
      {
        parse_mode: "HTML",
        ...(keyboard.length > 0 && { reply_markup: { inline_keyboard: keyboard } }),
      }
    )
    return
  }

  if (text === "/pacienti") {
    await sendPatientsPage(bot, chatId, 0)
    return
  }

  if (text === "/leaduri") {
    await sendLeadsPage(bot, chatId, 0)
    return
  }

  if (text === "/medici") {
    const doctors = await prisma.admin.findMany({
      where: { role: "DENTIST", active: true },
      include: { clinic: true },
    })

    if (!doctors.length) {
      await bot.sendMessage(chatId, "Nu există medici înregistrați.")
      return
    }

    let response = "🩺 <b>Medici:</b>\n\n"
    for (let i = 0; i < doctors.length; i++) {
      const d = doctors[i]
      response += `<b>${d.name || d.email}</b>\n`
      if (d.clinic) response += `🏥 ${d.clinic.name}\n`
      response += `📧 ${d.email}\n`
      if (i < doctors.length - 1) response += `\n———————————————\n\n`
    }

    await bot.sendMessage(chatId, response, { parse_mode: "HTML" })
    return
  }

  if (text === "/cazare") {
    const hotels = await prisma.hotel.findMany({
      orderBy: { createdAt: "desc" },
    })

    if (!hotels.length) {
      await bot.sendMessage(chatId, "Nu există unități de cazare.")
      return
    }

    let response = "🏨 <b>Cazare:</b>\n\n"
    for (let i = 0; i < hotels.length; i++) {
      const h = hotels[i]
      response += `<b>${h.name}</b>\n`
      response += `📍 ${h.location}\n`
      response += `⭐ ${h.stars} stele | 💶 €${h.pricePerNight}/noapte\n`
      if (i < hotels.length - 1) response += `\n———————————————\n\n`
    }

    await bot.sendMessage(chatId, response, { parse_mode: "HTML" })
    return
  }

  if (text === "/clinici") {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
    })

    if (!clinics.length) {
      await bot.sendMessage(chatId, "Nu există clinici.")
      return
    }

    let response = "🏥 <b>Clinici:</b>\n\n"
    for (let i = 0; i < clinics.length; i++) {
      const c = clinics[i]
      response += `<b>${c.name}</b>\n`
      response += `📍 ${c.location}\n`
      if (c.phone) response += `📞 ${c.phone}\n`
      if (i < clinics.length - 1) response += `\n———————————————\n\n`
    }

    await bot.sendMessage(chatId, response, { parse_mode: "HTML" })
    return
  }

  if (text === "/stats") {
    const [leadCount, patientCount, newLeads, activePatients] = await Promise.all([
      prisma.lead.count(),
      prisma.patient.count(),
      prisma.lead.count({ where: { status: "NOU" } }),
      prisma.patient.count({
        where: { status: { in: ["IN_ASTEPTARE", "PROGRAMAT", "SOSIT", "CAZAT", "IN_TRATAMENT"] } },
      }),
    ])

    await bot.sendMessage(
      chatId,
      `📊 <b>Statistici:</b>\n\n` +
        `📨 Lead-uri totale: <b>${leadCount}</b>\n` +
        `🆕 Lead-uri noi: <b>${newLeads}</b>\n` +
        `👥 Pacienți totali: <b>${patientCount}</b>\n` +
        `🔄 Pacienți activi: <b>${activePatients}</b>`,
      { parse_mode: "HTML" }
    )
    return
  }

  await bot.sendMessage(chatId, "Comandă necunoscută. Tastați /help pentru ajutor.")
}

export async function handleTelegramCallback(bot: TelegramBot, query: TelegramBot.CallbackQuery) {
  const chatId = query.message?.chat.id
  const userId = query.from.id.toString()
  if (!chatId) return

  if (!(await isAuthorized(userId))) {
    await bot.answerCallbackQuery(query.id, { text: "Acces interzis" })
    return
  }

  const data = query.data || ""

  // Lead list pagination
  if (data.startsWith("leads_page_")) {
    const page = parseInt(data.replace("leads_page_", ""), 10)
    await sendLeadsPage(bot, chatId, page, query.message?.message_id)
    await bot.answerCallbackQuery(query.id)
    return
  }

  // Patient list pagination
  if (data.startsWith("patients_page_")) {
    const page = parseInt(data.replace("patients_page_", ""), 10)
    await sendPatientsPage(bot, chatId, page, query.message?.message_id)
    await bot.answerCallbackQuery(query.id)
    return
  }

  // Patient detail + status change
  if (data.startsWith("patient_")) {
    const patientId = data.replace("patient_", "")
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { clinic: true, hotel: true, lead: true },
    })

    if (!patient) {
      await bot.answerCallbackQuery(query.id, { text: "Pacient negăsit" })
      return
    }

    const status = PATIENT_STATUSES[patient.status] || patient.status
    let detail = `👤 <b>${patient.name}</b>\n\n`
    detail += `📊 Status: ${status}\n`
    detail += `🦷 Tratament: ${patient.treatment}\n`
    if (patient.clinic) detail += `🏥 Clinică: ${patient.clinic.name}\n`
    if (patient.hotel) detail += `🏨 Hotel: ${patient.hotel.name}\n`
    if (patient.arrivalDate) detail += `📅 Sosire: ${patient.arrivalDate.toLocaleDateString("ro-RO")}\n`
    if (patient.lead) {
      detail += `\n📧 ${patient.lead.email}\n📱 ${patient.lead.phone}\n`
      if (patient.lead.country) detail += `🌍 ${patient.lead.country}\n`
    }

    // Status change buttons — show all, mark current
    const statusButtons = Object.entries(PATIENT_STATUSES)
      .map(([key, label]) => ({
        text: key === patient.status ? `✔ ${label}` : label,
        callback_data: `setstatus_${patientId}_${key}`,
      }))

    // Group buttons in rows of 2
    const keyboard: { text: string; callback_data: string }[][] = []
    for (let i = 0; i < statusButtons.length; i += 2) {
      keyboard.push(statusButtons.slice(i, i + 2))
    }

    await bot.editMessageText(detail, {
      chat_id: chatId,
      message_id: query.message?.message_id,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    })
    await bot.answerCallbackQuery(query.id)
    return
  }

  // Set patient status
  if (data.startsWith("setstatus_")) {
    const parts = data.split("_")
    const patientId = parts[1]
    const newStatus = parts.slice(2).join("_")

    if (!PATIENT_STATUSES[newStatus]) {
      await bot.answerCallbackQuery(query.id, { text: "Status invalid" })
      return
    }

    try {
      const patient = await prisma.patient.findUnique({ where: { id: patientId } })
      let arrivalDate = patient?.arrivalDate
      const isArrivalStatus = ["SOSIT", "CAZAT", "IN_TRATAMENT", "FINALIZAT"].includes(newStatus)

      if (newStatus === "SOSIT" || (isArrivalStatus && !arrivalDate)) {
        arrivalDate = new Date()
      }

      await prisma.patient.update({
        where: { id: patientId },
        data: { status: newStatus, arrivalDate },
      })

      const statusLabel = PATIENT_STATUSES[newStatus]
      await bot.answerCallbackQuery(query.id, {
        text: `✅ Status actualizat: ${statusLabel}`,
      })

      // Refresh the patient detail view
      await handleTelegramCallback(bot, {
        ...query,
        data: `patient_${patientId}`,
      })
    } catch {
      await bot.answerCallbackQuery(query.id, { text: "Eroare la actualizare" })
    }
    return
  }

  await bot.answerCallbackQuery(query.id, { text: "Acțiune necunoscută" })
}

async function sendPatientsPage(bot: TelegramBot, chatId: number, page: number, editMessageId?: number) {
  const total = await prisma.patient.count()
  const patients = await prisma.patient.findMany({
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    include: { clinic: true },
  })

  if (!patients.length) {
    const msg = page === 0 ? "Nu există pacienți." : "👥 Nu mai sunt pacienți."
    if (editMessageId) {
      await bot.editMessageText(msg, { chat_id: chatId, message_id: editMessageId })
    } else {
      await bot.sendMessage(chatId, msg)
    }
    return
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  let response = `👥 <b>Pacienți (${page + 1}/${totalPages}):</b>\n\n`
  for (let i = 0; i < patients.length; i++) {
    const p = patients[i]
    const status = PATIENT_STATUSES[p.status] || p.status
    response += `<b>${p.name}</b>\n`
    response += `${status}`
    if (p.clinic) response += ` | 🏥 ${p.clinic.name}`
    response += `\n🦷 ${p.treatment}\n`
    if (i < patients.length - 1) response += `\n———————————————\n\n`
  }

  // Patient detail buttons (2 per row)
  const buttonList = patients.map((p) => ({
    text: `📋 ${p.name}`,
    callback_data: `patient_${p.id}`,
  }))
  const keyboard: TelegramBot.InlineKeyboardButton[][] = []
  for (let i = 0; i < buttonList.length; i += 2) {
    const row: TelegramBot.InlineKeyboardButton[] = [buttonList[i]]
    if (buttonList[i + 1]) row.push(buttonList[i + 1])
    keyboard.push(row)
  }

  // Navigation buttons
  const nav: TelegramBot.InlineKeyboardButton[] = []
  if (page > 0) nav.push({ text: "◀ Înapoi", callback_data: `patients_page_${page - 1}` })
  if ((page + 1) * PAGE_SIZE < total) nav.push({ text: "Următor ▶", callback_data: `patients_page_${page + 1}` })
  if (nav.length) keyboard.push(nav)

  if (editMessageId) {
    await bot.editMessageText(response, {
      chat_id: chatId,
      message_id: editMessageId,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    })
  } else {
    await bot.sendMessage(chatId, response, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    })
  }
}

async function sendLeadsPage(bot: TelegramBot, chatId: number, page: number, editMessageId?: number) {
  const total = await prisma.lead.count()
  const leads = await prisma.lead.findMany({
    skip: page * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
  })

  if (!leads.length) {
    const msg = page === 0 ? "Nu există lead-uri." : "📨 Nu mai sunt lead-uri."
    if (editMessageId) {
      await bot.editMessageText(msg, { chat_id: chatId, message_id: editMessageId })
    } else {
      await bot.sendMessage(chatId, msg)
    }
    return
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  let response = `📨 <b>Lead-uri (${page + 1}/${totalPages}):</b>\n\n`
  for (let i = 0; i < leads.length; i++) {
    const l = leads[i]
    const status = LEAD_STATUSES[l.status] || l.status
    response += `<b>${l.name}</b> — ${status}\n`
    response += `📧 ${l.email} | 📱 ${l.phone}\n`
    if (i < leads.length - 1) response += `\n———————————————\n\n`
  }

  const keyboard: TelegramBot.InlineKeyboardButton[][] = []
  const nav: TelegramBot.InlineKeyboardButton[] = []
  if (page > 0) nav.push({ text: "◀ Înapoi", callback_data: `leads_page_${page - 1}` })
  if ((page + 1) * PAGE_SIZE < total) nav.push({ text: "Următor ▶", callback_data: `leads_page_${page + 1}` })
  if (nav.length) keyboard.push(nav)

  if (editMessageId) {
    await bot.editMessageText(response, {
      chat_id: chatId,
      message_id: editMessageId,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    })
  } else {
    await bot.sendMessage(chatId, response, {
      parse_mode: "HTML",
      reply_markup: keyboard.length ? { inline_keyboard: keyboard } : undefined,
    })
  }
}
