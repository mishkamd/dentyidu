"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, User, X } from "lucide-react"
import { StatusChanger } from "@/components/status-changer"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  description: string
  radiographyLink?: string | null
  country: string
  budget?: string | null
  status: string
  createdAt: string | Date
}

export function LeadDetailsDialog({ lead, children, defaultOpen = false }: { lead: Lead, children?: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="admin_secondary" size="admin_pill"

            className="text-xs"
          >
            Vezi detalii
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 p-0 overflow-hidden gap-0 shadow-2xl shadow-emerald-900/10">
        <DialogHeader className="px-6 py-6 border-b border-emerald-500/10 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner shadow-emerald-500/5">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">{lead.name}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Globe className="h-3.5 w-3.5" />
                {lead.country}
              </div>
              <div className="pt-2 flex gap-2">
                <Badge variant="outline" className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-gray-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300">
                  Direct
                </Badge>
                <StatusChanger id={lead.id} currentStatus={lead.status} />
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-6 px-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Nume:</span>
            <span className="col-span-3 font-medium text-zinc-900 dark:text-zinc-100">{lead.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Email:</span>
            <span className="col-span-3 text-zinc-900 dark:text-zinc-100">{lead.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Telefon:</span>
            <span className="col-span-3 text-zinc-900 dark:text-zinc-100">{lead.phone}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Țară:</span>
            <span className="col-span-3 text-zinc-900 dark:text-zinc-100">{lead.country}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Buget:</span>
            <span className="col-span-3 text-zinc-900 dark:text-zinc-100">{lead.budget || "Nespecificat"}</span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400 mt-1">Descriere:</span>
            <div className="col-span-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-60 overflow-y-auto p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-zinc-900/50 custom-scrollbar shadow-sm">
              {lead.description}
            </div>
          </div>
          {lead.radiographyLink && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Radiografie:</span>
              <a href={lead.radiographyLink} target="_blank" rel="noopener noreferrer" className="col-span-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline truncate block">
                {lead.radiographyLink}
              </a>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Status:</span>
            <div className="col-span-3">
              <StatusChanger id={lead.id} currentStatus={lead.status} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-zinc-500 dark:text-zinc-400">Data primirii:</span>
            <span suppressHydrationWarning className="col-span-3 text-sm text-zinc-500 dark:text-zinc-400">{new Date(lead.createdAt).toLocaleString('ro-RO')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
