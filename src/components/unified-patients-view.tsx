"use client"

import { useState, useTransition, useEffect } from "react"
import { Users, Building2, Calendar, Activity, MapPin, Star, Trash2, Loader2, AlertTriangle, Stethoscope, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { AddHotelDialog } from "@/components/add-hotel-dialog"
import { AddClinicDialog } from "@/components/add-clinic-dialog"
import { AddLeadDialog } from "@/components/add-lead-dialog"
import { deleteHotel, deletePatient, deleteClinic } from "@/app/actions/logistics"
import { EditPatientDialog } from "@/components/edit-patient-dialog"
import { EditHotelDialog } from "@/components/edit-hotel-dialog"
import { EditClinicDialog } from "@/components/edit-clinic-dialog"
import { PatientStatusSelect } from "@/components/patient-status-select"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Hotel, Patient, Lead, Clinic } from "@prisma/client"
import { LeadDetailsDialog } from "@/components/lead-details-dialog"
import { EditLeadDialog } from "@/components/edit-lead-dialog"
import { DeleteLeadButton } from "@/components/delete-lead-button"
import { LeadStatusSelect } from "@/components/lead-status-select"
import { MoveToLogisticsButton } from "@/components/move-to-logistics-button"
import { PatientDetailsDialog } from "@/components/patient-details-dialog"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { ClinicDetailsDialog } from "@/components/clinic-details-dialog"
import { useLanguage } from "@/components/language-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

type Serializable<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P] extends Date | null ? string | Date | null : T[P] extends object ? Serializable<T[P]> : T[P] extends object | null ? Serializable<T[P]> | null : T[P]
}

type PatientWithRelations = Patient & {
  hotel: Hotel | null
  clinic: Clinic | null
  lead: Lead | null
}

type LeadWithRelations = Lead & {
  patient: Patient | null
}

function DeleteButton({ id, action, title = "înregistrarea" }: { id: string, action: (id: string) => Promise<any>, title?: string }) {
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await action(id)
        toast.success(t("ui.deleteSuccess", "Ștergere efectuată cu succes"))
        setOpen(false)
      } catch (e) {
        toast.error(t("ui.deleteError", "Eroare la ștergere"))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-zinc-400 dark:hover:text-red-400 transition-all duration-200"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-red-900/10">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">{t("ui.deleteItem", "Ștergere")} {title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-1">
            {t("ui.deleteConfirmPrefix", "Ești sigur că vrei să ștergi")} {title}? {t("ui.deleteConfirmSuffix", "Această acțiune este ireversibilă și va șterge permanent datele asociate.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <DialogClose asChild>
            <Button variant="admin_secondary" size="admin_pill">{t("ui.cancel", "Anulează")}</Button>
          </DialogClose>
          <Button
            variant="admin_destructive" size="admin_pill"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("ui.deleting", "Se șterge...")}
              </>
            ) : (
              t("ui.deleteForever", "Șterge Definitiv")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface UnifiedPatientsViewProps {
  leads: Serializable<LeadWithRelations>[]
  patients: Serializable<PatientWithRelations>[]
  hotels: Serializable<Hotel>[]
  clinics: Serializable<Clinic>[]
}

export function UnifiedPatientsView({ leads, patients, hotels, clinics }: UnifiedPatientsViewProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'leads' | 'patients' | 'hotels' | 'clinics'>('leads')
  const searchParams = useSearchParams()
  const router = useRouter()
  const [autoOpenLeadId, setAutoOpenLeadId] = useState<string | null>(null)
  const [autoOpenPatientId, setAutoOpenPatientId] = useState<string | null>(null)

  useEffect(() => {
    const leadId = searchParams.get('leadId')
    const patientId = searchParams.get('patientId')
    const tab = searchParams.get('tab')

    if (leadId) {
      setTimeout(() => {
        setActiveTab('leads')
        setAutoOpenLeadId(leadId)
      }, 0)

      // Clean up URL
      const params = new URLSearchParams(searchParams)
      params.delete('leadId')
      router.replace(`/admin/patients?${params.toString()}`)
    } else if (patientId) {
      setTimeout(() => {
        setActiveTab('patients')
        setAutoOpenPatientId(patientId)
      }, 0)

      // Clean up URL
      const params = new URLSearchParams(searchParams)
      params.delete('patientId')
      router.replace(`/admin/patients?${params.toString()}`)
    } else if (tab && ['leads', 'patients', 'hotels', 'clinics'].includes(tab)) {
      setTimeout(() => {
        setActiveTab(tab as any)
      }, 0)
      setAutoOpenLeadId(null);
      setAutoOpenPatientId(null);
    }
  }, [searchParams, router])

  const filteredLeads = leads.filter(lead => !lead.patient)

  return (
    <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between p-3 sm:p-6 gap-2 sm:gap-3 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 p-1 bg-gray-200/50 dark:bg-zinc-800/50 rounded-xl w-fit border border-gray-200 dark:border-white/5">
          <button
            onClick={() => { setActiveTab('leads'); setAutoOpenLeadId(null); setAutoOpenPatientId(null); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'leads'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            <Calendar className="w-4 h-4 hidden sm:block" /> {t("patients.tabs.leads", "Cereri")}
          </button>
          <button
            onClick={() => { setActiveTab('patients'); setAutoOpenLeadId(null); setAutoOpenPatientId(null); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'patients'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            <Users className="w-4 h-4 hidden sm:block" /> {t("patients.tabs.patients", "Pacienți")}
          </button>
          <button
            onClick={() => { setActiveTab('hotels'); setAutoOpenLeadId(null); setAutoOpenPatientId(null); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'hotels'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            <Building2 className="w-4 h-4 hidden sm:block" /> {t("patients.tabs.hotels", "Cazare")}
          </button>
          <button
            onClick={() => { setActiveTab('clinics'); setAutoOpenLeadId(null); setAutoOpenPatientId(null); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'clinics'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            <Stethoscope className="w-4 h-4 hidden sm:block" /> {t("patients.tabs.clinics", "Clinici")}
          </button>
        </div>

        <div className="shrink-0">
          {activeTab === 'leads' && <AddLeadDialog />}
          {activeTab === 'patients' && <AddPatientDialog hotels={hotels} clinics={clinics} />}
          {activeTab === 'hotels' && <AddHotelDialog />}
          {activeTab === 'clinics' && <AddClinicDialog />}
        </div>
      </div>

      {/* Content */}
      <div className="p-0">
        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t("ui.tableHeaders.actions", "Acțiuni")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t("ui.tableHeaders.name", "Nume")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">{t("ui.leads.messageDocuments", "Mesaj & Documente")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">{t("ui.leads.locationBudget", "Locație / Buget")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">{t("ui.tableHeaders.status", "Status")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">{t("ui.leads.logistics", "Logistică")}</th>
                  <th className="py-3 px-3 sm:px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right hidden lg:table-cell">{t("ui.leads.receivedDate", "Data Primirii")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 sm:px-6">
                      <div className="flex items-center gap-1">
                        <EditLeadDialog lead={lead} />
                        <DeleteLeadButton leadId={lead.id} />
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <LeadDetailsDialog lead={lead} defaultOpen={lead.id === autoOpenLeadId}>
                            <span className="text-zinc-900 dark:text-white font-medium text-sm cursor-pointer hover:underline decoration-emerald-500/50 underline-offset-4 decoration-2 transition-all">{lead.name}</span>
                          </LeadDetailsDialog>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-6 max-w-[300px] hidden md:table-cell">
                      <div className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 italic">
                        &quot;{lead.description}&quot;
                      </div>
                      {lead.radiographyLink && (
                        <a
                          href={lead.radiographyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          {t("ui.leads.attachedDocuments", "Documente atașate")}
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-6 hidden sm:table-cell">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400"></span>
                          {lead.country}
                        </span>
                        {lead.budget && (
                          <div className="inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium px-2 py-1 w-fit uppercase tracking-wide">
                            €{lead.budget}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-6">
                      <div className="sm:scale-90 sm:origin-left">
                        <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-6 hidden md:table-cell">
                      {lead.status === 'FINALIZAT' ? (
                        <div className="inline-flex items-center rounded-full font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] text-[10px] px-3 py-1 w-[140px] justify-center h-8">
                          {t("ui.leads.logisticsBadge", "LOGISTICĂ")}
                        </div>
                      ) : (
                        <MoveToLogisticsButton leadId={lead.id} hasPatient={!!lead.patient} />
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-6 text-right hidden lg:table-cell">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {new Date(lead.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(lead.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                        <p className="text-zinc-500 font-medium">{t("ui.leads.empty", "Nu există cereri de programare.")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'patients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                <tr>
                  <th className="px-3 sm:px-4 py-3 font-medium tracking-wider text-zinc-500 uppercase">{t("ui.tableHeaders.actions", "Acțiuni")}</th>
                  <th className="px-3 sm:px-4 py-3 font-medium tracking-wider">{t("ui.patients.patientName", "Nume Pacient")}</th>
                  <th className="px-3 sm:px-4 py-3 font-medium tracking-wider hidden sm:table-cell">{t("ui.patients.clinic", "Clinică")}</th>
                  <th className="px-3 sm:px-4 py-3 font-medium tracking-wider hidden sm:table-cell">{t("ui.patients.accommodation", "Cazare")}</th>
                  <th className="px-4 py-3 font-medium tracking-wider">{t("ui.patients.arrivalDate", "Data Sosirii")}</th>
                  <th className="px-4 py-3 font-medium tracking-wider">{t("ui.tableHeaders.status", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500">
                      {t("ui.patients.empty", "Nu există pacienți înregistrați.")}
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-1">
                          <EditPatientDialog patient={patient} hotels={hotels} clinics={clinics} />
                          <DeleteButton id={patient.id} action={deletePatient} title="pacientul" />
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-medium text-zinc-900 dark:text-white">
                        <div className="flex flex-col">
                          <PatientDetailsDialog patient={patient} defaultOpen={patient.id === autoOpenPatientId} />
                          {patient.lead && (
                            <StatusBadge status="info" className="text-[10px] font-normal w-fit mt-1">
                              {new Date(patient.lead.createdAt).toLocaleDateString('ro-RO')}
                            </StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                        {patient.clinic ? (
                          <StatusBadge status="active" className="flex items-center gap-1.5 px-2 py-1 w-fit text-xs font-bold">
                            <Stethoscope className="h-3 w-3" />
                            {patient.clinic.name}
                          </StatusBadge>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">{t("ui.patients.noClinic", "Fără clinică")}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                        {patient.hotel ? (
                          <StatusBadge status="active" className="flex items-center gap-1.5 px-2 py-1 w-fit text-xs font-bold">
                            <Building2 className="h-3 w-3" />
                            {patient.hotel.name}
                          </StatusBadge>
                        ) : (
                          <span className="text-zinc-400 text-xs italic">{t("ui.patients.noAccommodation", "Fără cazare")}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-zinc-500">
                        {patient.arrivalDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-zinc-400" />
                            {new Date(patient.arrivalDate).toLocaleDateString('ro-RO')}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <PatientStatusSelect id={patient.id} status={patient.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* HOTELS TAB */}
        {activeTab === 'hotels' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="group bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <EditHotelDialog hotel={hotel} />
                      <DeleteButton id={hotel.id} action={deleteHotel} title="cazarea" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">{hotel.name}</h4>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6 bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {hotel.location}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <StatusBadge status="warning" className="flex items-center gap-1.5 px-2.5 py-1">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold text-xs">{hotel.stars}</span>
                    </StatusBadge>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-0.5">{t("ui.hotels.pricePerNight", "Preț / Noapte")}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">€{hotel.pricePerNight}</span>
                    </div>
                  </div>
                </div>
              ))}
              {hotels.length === 0 && (
                <div className="col-span-full py-16 text-center text-zinc-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/5">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-zinc-400">
                      <Building2 className="h-8 w-8" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-zinc-900 dark:text-white">{t("ui.hotels.empty", "Nu există unități de cazare adăugate.")}</p>
                  <p className="text-sm text-zinc-500 mt-1">{t("ui.hotels.emptyHint", "Adăugați o cazare nouă pentru a începe.")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLINICS TAB */}
        {activeTab === 'clinics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <div key={clinic.id} className="group bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none rounded-2xl overflow-hidden p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <EditClinicDialog clinic={clinic} />
                      <DeleteButton id={clinic.id} action={deleteClinic} title="clinica" />
                    </div>
                  </div>
                  <ClinicDetailsDialog clinic={clinic as any}>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 tracking-tight hover:underline cursor-pointer w-fit">{clinic.name}</h4>
                  </ClinicDetailsDialog>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-3 bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {clinic.location}
                  </div>
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm bg-gray-50 dark:bg-white/5 p-2 rounded-lg w-fit">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      {clinic.phone}
                    </div>
                  )}
                </div>
              ))}
              {clinics.length === 0 && (
                <div className="col-span-full py-16 text-center text-zinc-500 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/5">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-zinc-400">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-zinc-900 dark:text-white">{t("ui.clinics.empty", "Nu există clinici adăugate.")}</p>
                  <p className="text-sm text-zinc-500 mt-1">{t("ui.clinics.emptyHint", "Adăugați o clinică nouă pentru a începe.")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
