"use client"

import React from "react"

import { useSidebar } from "./sidebar-provider"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import { cn } from "@/lib/utils"

interface AdminShellProps {
  children: React.ReactNode
  admin: {
    email: string
    role: string
    name: string | null
  }
  branding: {
    icon?: string
    logo?: string
    logoType?: "image" | "text"
  }
  stats?: {
    totalPatients: number
    finalizedPatientsMonth: number
  }
}

export function AdminShell({ children, admin, branding, stats }: AdminShellProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
      <AdminSidebar role={admin.role} branding={branding} stats={stats} />

      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300",
        isOpen ? "md:ml-72" : "md:ml-0"
      )}>
        <AdminNavbar admin={admin} branding={branding} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto h-full max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
