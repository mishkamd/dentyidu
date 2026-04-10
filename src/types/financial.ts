
import { Invoice, InvoiceItem, Offer, OfferItem, Patient, Lead, Service, Hotel } from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

// Recursively convert Prisma Decimal fields to number (matches toPlain() serialization)
type DecimalToNumber<T> = {
  [K in keyof T]: T[K] extends Decimal ? number : T[K]
}

export type InvoiceWithDetails = DecimalToNumber<Invoice> & {
  patient: (Patient & { lead: Lead | null }) | null
  offer: { number: string } | null
  items: DecimalToNumber<InvoiceItem>[]
}

export type OfferWithDetails = DecimalToNumber<Offer> & {
  patient: Patient | null
  lead: Lead | null
  items: DecimalToNumber<OfferItem>[]
  invoice: { number: string; series: string } | null
}

export type ServiceItem = DecimalToNumber<Service>

export type PatientBasic = Patient & {
  lead: Lead | null
  hotel: Hotel | null
}

export type LeadBasic = {
  id: string
  name: string
  email: string
}
