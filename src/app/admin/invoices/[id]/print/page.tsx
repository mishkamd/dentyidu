import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PrintControls } from "@/components/print-controls"
import { InvoiceTemplate, InvoiceData } from "@/components/invoice-template"

interface InvoicePrintPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoicePrintPage({ params }: InvoicePrintPageProps) {
  const { id } = await params
  
  const invoiceRaw = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          lead: true
        }
      },
      items: true
    }
  })

  if (!invoiceRaw) return notFound()

  const settingsRaw = invoiceRaw.settingsId
    ? await prisma.invoiceSettings.findUnique({ where: { id: invoiceRaw.settingsId } })
    : await prisma.invoiceSettings.findFirst({ orderBy: { updatedAt: 'asc' } })

  // Serialize Decimal fields to numbers
  const invoice: InvoiceData = JSON.parse(JSON.stringify(invoiceRaw, (_k, v) =>
    typeof v === 'object' && v !== null && v.constructor?.name === 'Decimal' ? Number(v) : v
  ))
  const settings = settingsRaw ? { ...settingsRaw, tvaRate: Number(settingsRaw.tvaRate) } : null

  return (
    <div className="bg-white min-h-screen [print-color-adjust:exact]">
      <PrintControls />
      <InvoiceTemplate invoice={invoice} settings={settings} />
    </div>
  )
}
