import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { verifySessionToken } from "@/lib/session"

export const getCurrentAdmin = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')?.value

  if (!sessionToken) return null

  // Verify signed session token
  const adminId = verifySessionToken(sessionToken)
  if (!adminId) return null

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, role: true, active: true, name: true, clinicId: true }
  })

  if (!admin || !admin.active) return null

  return admin
})
