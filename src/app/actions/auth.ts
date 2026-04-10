'use server'

import { prisma } from "@/lib/prisma"
import { AdminLoginSchema } from "@/lib/validations"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { getServerT } from "@/lib/locale-server"
import { createSessionToken } from "@/lib/session"
import { log } from "@/lib/logger"

type LoginState = {
  errors?: Record<string, string[]>
  message?: string
}

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(email)
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(email, { count: 1, firstAttempt: now })
    return true
  }
  if (record.count >= MAX_ATTEMPTS) return false
  record.count++
  return true
}

function resetRateLimit(email: string) {
  loginAttempts.delete(email)
}

export async function loginAdmin(prevState: LoginState, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  // Captcha verification
  const captchaToken = formData.get("captchaToken") as string | null
  const captchaSettings = await prisma.captchaSettings.findFirst()
  if (captchaSettings?.isEnabled && captchaSettings.secretKey) {
    if (!captchaToken) {
      return { message: 'Completează verificarea captcha.' }
    }
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: captchaSettings.secretKey, response: captchaToken }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return { message: 'Verificarea captcha a eșuat.' }
    }
  }

  const t = await getServerT()
  const validatedFields = AdminLoginSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: t('action.auth.invalidData', 'Date de autentificare invalide.'),
    }
  }

  const { email, password } = validatedFields.data

  // Rate limit check
  if (!checkRateLimit(email)) {
    return { message: t('action.auth.tooManyAttempts', 'Prea multe încercări. Încercați din nou în 15 minute.') }
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  })

  if (!admin) {
    log.warn('login_failed', `Tentativă login eșuată: ${email}`)
    return { message: t('action.auth.invalidCredentials', 'Email sau parolă incorectă.') }
  }

  if (admin.active === false) {
    return { message: t('action.auth.accountDisabled', 'Contul este dezactivat.') }
  }

  const passwordsMatch = await bcrypt.compare(password, admin.password)

  if (!passwordsMatch) {
    log.warn('login_failed', `Parolă incorectă: ${email}`, { userId: admin.id })
    return { message: t('action.auth.invalidCredentials', 'Email sau parolă incorectă.') }
  }

  // Reset rate limit on successful login
  resetRateLimit(email)
  log.info('login_success', `Login reușit: ${email}`, { userId: admin.id })

  // Create signed session token (prevents session fixation)
  const sessionToken = createSessionToken(admin.id)
  const cookieStore = await cookies()

  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  })

  redirect('/admin')
}

export async function logoutAdmin() {
  log.info('logout', 'Utilizator deconectat')
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}
