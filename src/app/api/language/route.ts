import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isValidLocale } from "@/lib/i18n"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { locale } = body

  if (!locale || !isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
  }

  // Try to persist to admin profile if authenticated
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (session?.value) {
    try {
      const admin = await prisma.admin.findFirst({
        where: { id: session.value },
      })
      if (admin) {
        await prisma.admin.update({
          where: { id: admin.id },
          data: { language: locale },
        })
      }
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ success: true })
}
