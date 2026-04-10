import React from "react"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AdminShell } from "@/components/admin-shell"
import { TelegramWebAppInit } from "@/components/telegram-webapp-init"
import { startOfMonth } from "date-fns"

import { prisma } from "@/lib/prisma"
import { getContent } from "@/lib/get-content"

export const metadata: Metadata = {
  title: "DentyAdmin",
}

interface Branding {
  icon?: string
  logo?: string
  logoType?: "image" | "text"
}

async function getBranding(): Promise<Branding> {
  const content = await getContent("hero")
  
  if (!content?.value) return {}
  
  try {
    const data = JSON.parse(content.value)
    return {
      icon: data.icon as string | undefined,
      logo: data.logo as string | undefined,
      logoType: data.logoType as "image" | "text" | undefined,
    }
  } catch {
    return {}
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentMonthStart = startOfMonth(new Date())
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/login?error=inactive')
  }

  const clinicFilter = currentAdmin.role === 'DENTIST'
    ? { clinicId: currentAdmin.clinicId || 'RESTRICTED' }
    : {};

  const [branding, totalPatients, finalizedPatientsMonth] = await Promise.all([
    getBranding(),
    prisma.patient.count({
      where: clinicFilter
    }),
    prisma.patient.count({
      where: {
        ...clinicFilter,
        status: "FINALIZAT",
        updatedAt: {
          gte: currentMonthStart
        }
      }
    })
  ])

  // Ensure role and email exist for types
  const adminData = {
    email: currentAdmin.email || '',
    role: currentAdmin.role || 'USER',
    name: currentAdmin.name || null
  }

  const stats = {
    totalPatients,
    finalizedPatientsMonth
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <TelegramWebAppInit />
      <SidebarProvider>
        <AdminShell admin={adminData} branding={branding} stats={stats}>
          {children}
        </AdminShell>
      </SidebarProvider>
    </div>
  )
}
