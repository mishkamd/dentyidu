
import { format } from "date-fns"
import { Patient, Lead } from "@prisma/client"

export type InvoiceData = {
  id: string
  series: string
  number: string
  date: Date
  dueDate: Date
  status: string
  total: number
  paidAmount: number
  currency: string
  notes: string | null
  patient: (Patient & { lead?: Lead | null }) | null
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number; serviceId: string | null }[]
  [key: string]: unknown
}

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
  language?: string
  tvaRate?: number
}

interface InvoiceTemplateProps {
  invoice: InvoiceData
  settings?: InvoiceSettings | null
}

const labels = {
  ro: {
    title: 'FACTURĂ FISCALĂ',
    seriesNumber: 'Serie/Număr',
    issueDate: 'Data emiterii',
    dueDate: 'Data scadenței',
    client: 'Client / Pacient',
    noEmail: 'Fără email',
    serviceName: 'Denumire Serviciu / Produs',
    unit: 'U.M.',
    qty: 'Cant.',
    unitPrice: 'Preț Unit.',
    value: 'Valoare',
    unitLabel: 'buc',
    noItems: 'Nu există servicii adăugate.',
    total: 'TOTAL DE PLATĂ:',
    paymentInfo: 'Informații plată:',
    bank: 'Banca',
    createdBy: 'Întocmit de:',
    admin: 'Administrator',
  },
  fr: {
    title: 'FACTURE',
    seriesNumber: 'Série/Numéro',
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    client: 'Client / Patient',
    noEmail: 'Pas d\'email',
    serviceName: 'Désignation du Service / Produit',
    unit: 'U.M.',
    qty: 'Qté',
    unitPrice: 'Prix Unit. HT',
    value: 'Montant HT',
    unitLabel: 'pcs',
    noItems: 'Aucun service ajouté.',
    subtotalHT: 'Total HT :',
    tvaLabel: 'TVA',
    totalTTC: 'TOTAL TTC :',
    total: 'TOTAL À PAYER :',
    paymentInfo: 'Informations de paiement :',
    bank: 'Banque',
    createdBy: 'Établi par :',
    admin: 'Administrateur',
    cifLabel: 'N° TVA Intracom.',
    regComLabel: 'SIRET',
    conditions: 'Conditions de paiement :',
    dueNet: 'Paiement à réception de facture',
  }
}

export function InvoiceTemplate({ invoice, settings }: InvoiceTemplateProps) {
  // Default fallback values
  const companyName = settings?.companyName || "CLINICA TA"
  const companyAddress = settings?.companyAddress || "Str. Exemplului nr. 1, București, Sector 1"
  const companyCif = settings?.companyCif || "RO123456"
  const companyRegCom = settings?.companyRegCom || "J40/123/2024"
  const companyEmail = settings?.companyEmail || "contact@clinica.ro"
  const bankName = settings?.bankName || "Banca Transilvania"
  const bankIban = settings?.bankIban || "RO00 BTRL 0000 0000 0000 00XX"
  const footerText = settings?.footerText || "Această factură circulă fără semnătură și ștampilă conform legii."
  const lang = settings?.language === 'fr' ? 'fr' : 'ro'
  const numLocale = lang === 'fr' ? 'fr-FR' : 'ro-RO'
  const t = labels[lang]
  const tvaRate = Number(settings?.tvaRate) || 0
  const subtotalHT = Number(invoice.total) || 0
  const tvaAmount = tvaRate > 0 ? subtotalHT * (tvaRate / 100) : 0
  const totalTTC = subtotalHT + tvaAmount

  return (
    <div className="bg-white text-black p-8 md:p-10 max-w-[210mm] mx-auto font-sans text-sm md:text-base">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-6">
        <div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase">{t.title}</h1>
           <div className="text-sm mt-3 text-gray-600 space-y-1">
             <p><span className="font-medium text-gray-900">{t.seriesNumber}:</span> {invoice.series} / {invoice.number}</p>
             <p><span className="font-medium text-gray-900">{t.issueDate}:</span> {invoice.date ? format(new Date(invoice.date), 'dd.MM.yyyy') : 'N/A'}</p>
             <p><span className="font-medium text-gray-900">{t.dueDate}:</span> {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd.MM.yyyy') : 'N/A'}</p>
           </div>
        </div>
        <div className="text-left md:text-right">
           <h2 className="font-bold text-lg md:text-xl text-emerald-600 mb-1">{companyName}</h2>
           <div className="text-sm text-gray-600 space-y-0.5">
             <p>{companyAddress}</p>
             {lang === 'fr' ? (
               <>
                 <p>N° TVA Intracom.: {companyCif}</p>
                 <p>{companyRegCom}</p>
               </>
             ) : (
               <>
                 <p>CIF: {companyCif}</p>
                 <p>Reg. Com: {companyRegCom}</p>
               </>
             )}
             <p>Email: {companyEmail}</p>
           </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8 md:mb-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">{t.client}</h3>
        <div className="space-y-1">
          <p className="font-bold text-lg text-gray-900">{invoice.patient?.name || 'Nume Client'}</p>
          <p className="text-sm text-gray-600">{invoice.patient?.lead?.email || t.noEmail}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full mb-8 md:mb-12 text-sm min-w-[500px]">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-3 font-bold text-gray-900 w-[40%]">{t.serviceName}</th>
              <th className="text-right py-3 font-bold text-gray-900">{t.unit}</th>
              <th className="text-right py-3 font-bold text-gray-900">{t.qty}</th>
              <th className="text-right py-3 font-bold text-gray-900">{t.unitPrice}</th>
              <th className="text-right py-3 font-bold text-gray-900">{t.value}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-800">{item.description}</td>
                  <td className="py-3 text-right text-gray-600">{t.unitLabel}</td>
                  <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{Number(item.unitPrice).toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{(item.quantity * Number(item.unitPrice)).toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">{t.noItems}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
             {tvaRate > 0 ? (
               <>
                 <tr className="border-t-2 border-gray-900">
                   <td colSpan={4} className="text-right py-2 font-medium text-gray-700">{(t as any).subtotalHT || 'Subtotal HT :'}</td>
                   <td className="text-right py-2 font-medium text-gray-700">{subtotalHT.toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
                 </tr>
                 <tr>
                   <td colSpan={4} className="text-right py-2 font-medium text-gray-700">{(t as any).tvaLabel || 'TVA'} ({tvaRate}%) :</td>
                   <td className="text-right py-2 font-medium text-gray-700">{tvaAmount.toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
                 </tr>
                 <tr>
                   <td colSpan={4} className="text-right py-3 font-bold text-gray-900 text-lg">{(t as any).totalTTC || 'TOTAL TTC :'}</td>
                   <td className="text-right py-3 font-bold text-emerald-600 text-lg">{totalTTC.toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
                 </tr>
               </>
             ) : (
               <tr className="border-t-2 border-gray-900">
                 <td colSpan={4} className="text-right py-4 font-bold text-gray-900 text-lg">{t.total}</td>
                 <td className="text-right py-4 font-bold text-emerald-600 text-lg">{Number(invoice.total || 0).toLocaleString(numLocale, { minimumFractionDigits: 2 })} {invoice.currency}</td>
               </tr>
             )}
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 md:mt-auto pt-8 border-t border-gray-200">
        {lang === 'fr' && (
          <div className="mb-6 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">Conditions de paiement :</p>
            <p>Paiement à réception de facture</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end text-xs text-gray-500 gap-6">
          <div>
            <p className="font-medium text-gray-900 mb-1">{t.paymentInfo}</p>
            <p>IBAN: {bankIban}</p>
            <p>{t.bank}: {bankName}</p>
          </div>
          <div className="text-left md:text-right">
            <p>{t.createdBy}</p>
            <p className="font-medium text-gray-900 mt-1">{t.admin}</p>
            <p className="mt-4 italic">{footerText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
