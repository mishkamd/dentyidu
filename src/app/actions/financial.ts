"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/get-current-admin"
import { Decimal } from "@prisma/client/runtime/library"
import { log } from "@/lib/logger"

// Recursively convert Prisma Decimal → number at the type level
type SerializeDecimal<T> =
  T extends Decimal ? number :
  T extends Array<infer U> ? SerializeDecimal<U>[] :
  T extends Date ? T :
  T extends object ? { [K in keyof T]: SerializeDecimal<T[K]> } :
  T

// Serialize Prisma Decimal fields to plain numbers for client components.
function toPlain<T>(obj: T): SerializeDecimal<T> {
  return JSON.parse(JSON.stringify(obj, (_key, value) =>
    value instanceof Decimal ? Number(value) : value
  ))
}

const DEFAULT_ROMANIAN_TEMPLATE = {
  name: "Romana",
  language: "ro",
  companyName: "CLINICA TA",
  companyAddress: "Str. Exemplului nr. 1, Bucuresti, Sector 1",
  companyCif: "RO123456",
  companyRegCom: "J40/123/2024",
  companyEmail: "contact@clinica.ro",
  bankName: "Banca Transilvania",
  bankIban: "RO00 BTRL 0000 0000 0000 00XX",
  footerText: "Aceasta factura circula fara semnatura si stampila conform legii.",
  tvaRate: 0,
}

const DEFAULT_FRENCH_TEMPLATE = {
  name: "Francais",
  language: "fr",
  companyName: "VOTRE CLINIQUE",
  companyAddress: "1 Rue Exemple, 75001 Paris, France",
  companyCif: "FR00123456789",
  companyRegCom: "SIRET: 123 456 789 00010",
  companyEmail: "contact@clinique.fr",
  bankName: "BNP Paribas",
  bankIban: "FR76 0000 0000 0000 0000 0000 000",
  footerText: "En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee. Pas d'escompte pour paiement anticipe. Indemnite forfaitaire pour frais de recouvrement : 40 EUR.",
  tvaRate: 20,
}

// --- Invoice Settings ---
export async function getInvoiceSettings() {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')
  return await ensureDefaultTemplates()
}

export async function getInvoiceSettingsById(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const settings = await prisma.invoiceSettings.findUnique({ where: { id } })
  return settings ? toPlain(settings) : null
}

export async function ensureDefaultTemplates() {
  const allSettings = await prisma.invoiceSettings.findMany({ orderBy: { updatedAt: 'asc' } })

  const romanianExists = allSettings.some((settings) => settings.language === 'ro')
  const frenchExists = allSettings.some((settings) => settings.language === 'fr')

  if (!romanianExists) {
    await prisma.invoiceSettings.create({ data: DEFAULT_ROMANIAN_TEMPLATE })
  }

  if (!frenchExists) {
    await prisma.invoiceSettings.create({ data: DEFAULT_FRENCH_TEMPLATE })
  }

  return toPlain(await prisma.invoiceSettings.findMany({ orderBy: { updatedAt: 'asc' } }))
}

export async function updateInvoiceSettings(id: string, data: {
  companyName: string
  companyAddress: string
  companyCif: string
  companyRegCom: string
  companyEmail: string
  bankName: string
  bankIban: string
  footerText: string
  logoUrl?: string
  tvaRate?: number
}) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  await prisma.invoiceSettings.update({
    where: { id },
    data
  })
  
  revalidatePath('/admin/invoices')
}

// --- Services ---
export async function getServices() {
  return toPlain(await prisma.service.findMany({
    orderBy: { name: 'asc' }
  }))
}

export async function createService(data: { name: string, price: number, currency: string, category?: string }) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  await prisma.service.create({ data })
  log.info('service_created', `Serviciu creat: ${data.name}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

// --- Offers ---
export async function getOffers() {
  const currentAdmin = await getCurrentAdmin()
  const where = currentAdmin?.role === 'DENTIST' && currentAdmin?.clinicId
    ? { patient: { clinicId: currentAdmin.clinicId } }
    : {}

  return toPlain(await prisma.offer.findMany({
    where,
    include: {
      patient: true,
      lead: true,
      items: true,
      invoice: {
        select: { number: true, series: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }))
}

export async function createOffer(data: {
  patientId?: string,
  leadId?: string,
  validUntil: Date,
  items: { description: string, quantity: number, unitPrice: number, serviceId?: string }[],
  currency: string,
  notes?: string
}) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const currentYear = new Date().getFullYear()
  const count = await prisma.offer.count()
  const number = `OF-${currentYear}-${(count + 1).toString().padStart(4, '0')}`
  
  const total = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

  const offer = await prisma.offer.create({
    data: {
      number,
      validUntil: data.validUntil,
      patientId: data.patientId,
      leadId: data.leadId,
      currency: data.currency,
      notes: data.notes,
      total,
      items: {
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          serviceId: item.serviceId
        }))
      }
    }
  })

  log.info('offer_created', `Ofertă creată: ${number}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
  return offer
}

const VALID_OFFER_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'] as const

export async function updateOfferStatus(id: string, status: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  if (!VALID_OFFER_STATUSES.includes(status as any)) throw new Error('Invalid status')

  await prisma.offer.update({
    where: { id },
    data: { status }
  })
  log.info('offer_status_changed', `Ofertă ${id}: status → ${status}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

// --- Invoices ---
export async function getInvoices() {
  const currentAdmin = await getCurrentAdmin()
  const where = currentAdmin?.role === 'DENTIST' && currentAdmin?.clinicId
    ? { patient: { clinicId: currentAdmin.clinicId } }
    : {}

  return toPlain(await prisma.invoice.findMany({
    where,
    include: {
      patient: {
        include: {
          lead: true
        }
      },
      offer: {
        select: { number: true }
      },
      items: true
    },
    orderBy: { createdAt: 'desc' }
  }))
}

export async function createInvoice(data: {
  patientId?: string,
  offerId?: string,
  dueDate: Date,
  items: { description: string, quantity: number, unitPrice: number, serviceId?: string }[],
  currency: string,
  notes?: string,
  series?: string
}) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const series = data.series || 'INV'
  const count = await prisma.invoice.count({ where: { series } })
  const number = (count + 1).toString().padStart(4, '0') // Simple auto-increment per series logic
  
  const total = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

  const invoice = await prisma.invoice.create({
    data: {
      series,
      number,
      dueDate: data.dueDate,
      patientId: data.patientId,
      offerId: data.offerId,
      currency: data.currency,
      notes: data.notes,
      total,
      items: {
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          serviceId: item.serviceId
        }))
      }
    }
  })

  // If created from offer, update offer status
  if (data.offerId) {
    await prisma.offer.update({
      where: { id: data.offerId },
      data: { status: 'CONVERTED' }
    })
  }

  log.info('invoice_created', `Factură creată: ${series}-${number}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
  return invoice
}

const VALID_INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'] as const

export async function updateInvoiceStatus(id: string, status: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  if (!VALID_INVOICE_STATUSES.includes(status as any)) throw new Error('Invalid status')

  await prisma.invoice.update({
    where: { id },
    data: { status }
  })
  log.info('invoice_status_changed', `Factură ${id}: status → ${status}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

export async function markInvoicePaid(id: string, amount: number) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return

  const newPaidAmount = Number(invoice.paidAmount) + amount
  const status = newPaidAmount >= Number(invoice.total) ? 'PAID' : 'PARTIAL'

  await prisma.invoice.update({
    where: { id },
    data: { 
      paidAmount: newPaidAmount,
      status
    }
  })
  log.info('invoice_payment', `Plată factură ${id}: +${amount} → ${status}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

export async function deleteInvoice(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  await prisma.invoice.delete({ where: { id } })
  log.warn('invoice_deleted', `Factură ștearsă: ${id}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

export async function deleteOffer(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  await prisma.offer.delete({ where: { id } })
  log.warn('offer_deleted', `Ofertă ștearsă: ${id}`, { userId: admin.id })
  revalidatePath('/admin/invoices')
}

export async function createFullInvoice(data: {
  patientId: string;
  dueDate: Date;
  settingsId?: string;
  items: { serviceId?: string; description?: string; quantity: number; price: number }[];
}) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const series = 'INV';
  const count = await prisma.invoice.count({ where: { series } });
  const number = (count + 1).toString().padStart(4, '0');

  const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  await prisma.invoice.create({
    data: {
      series,
      number,
      dueDate: data.dueDate,
      patientId: data.patientId,
      settingsId: data.settingsId || undefined,
      total,
      items: {
        create: data.items.map(item => {
          const itemData: any = {
            description: item.description || "Serviciu",
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.quantity * item.price,
          }
          if (item.serviceId) {
            itemData.serviceId = item.serviceId
          }
          return itemData
        })
      }
    }
  });

  revalidatePath('/admin/invoices');
}

export async function updateFullInvoice(id: string, data: {
  patientId: string;
  dueDate: Date;
  items: { serviceId?: string; description?: string; quantity: number; price: number }[];
}) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const total = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  // Delete existing items
  await prisma.invoiceItem.deleteMany({
    where: { invoiceId: id }
  });

  // Update invoice and recreate items
  await prisma.invoice.update({
    where: { id },
    data: {
      patientId: data.patientId,
      dueDate: data.dueDate,
      total,
      items: {
        create: data.items.map(item => {
          const itemData: any = {
            description: item.description || "Serviciu",
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.quantity * item.price,
          }
          if (item.serviceId) {
            itemData.serviceId = item.serviceId
          }
          return itemData
        })
      }
    }
  });

  revalidatePath('/admin/invoices');
}
