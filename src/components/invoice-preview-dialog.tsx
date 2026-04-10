
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { InvoiceTemplate, InvoiceData } from "@/components/invoice-template"
import Link from "next/link"

interface InvoiceSettings {
  companyName: string
  companyAddress: string
  companyCif: string
  companyRegCom: string
  companyEmail: string
  bankName: string
  bankIban: string
  footerText: string
  logoUrl?: string | null
}

interface InvoicePreviewDialogProps {
  invoice: InvoiceData
  trigger?: React.ReactNode
  settings?: InvoiceSettings
  defaultOpen?: boolean
}

export function InvoicePreviewDialog({ invoice, trigger, settings, defaultOpen = false }: InvoicePreviewDialogProps) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Previzualizare">
            <Printer className="w-4 h-4 text-zinc-500 hover:text-emerald-600" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Previzualizare Factură</DialogTitle>
          <DialogDescription>
            Factura {invoice.series} / {invoice.number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="border rounded-lg overflow-hidden bg-gray-50/50 p-4 md:p-8">
            <div className="scale-90 origin-top">
                <InvoiceTemplate invoice={invoice} settings={settings} />
            </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
            <div className="text-xs text-muted-foreground flex items-center">
                * Aceasta este o previzualizare.
            </div>
            <div className="flex gap-2">
                <Button variant="admin_secondary" size="admin_pill" asChild>
                    <Link href={`/admin/invoices/${invoice.id}/print`} target="_blank">
                        <Printer className="w-4 h-4 mr-2" />
                        Printează (PDF)
                    </Link>
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
