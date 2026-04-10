"use client"

import { useState, useActionState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, X, Calendar, FileText, CheckCircle2, ArrowRight, UploadCloud, Trash2, Mail, Phone, MapPin, Wallet, Info, Plus } from "lucide-react"
import { statuses } from "@/components/patient-status-select"
import { Hotel, Patient, Lead } from "@prisma/client"
import { uploadRadiography, deleteRadiography, ActionState } from "@/app/actions/logistics"
import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

export type PatientWithRelations = Patient & {
  hotel: Hotel | null
  lead: Lead | null
}

type Serializable<T> = {
  [P in keyof T]: T[P] extends Date ? string | Date : T[P] extends Date | null ? string | Date | null : T[P] extends object ? Serializable<T[P]> : T[P] extends object | null ? Serializable<T[P]> | null : T[P]
}

function SubmitButton() {
  const { t } = useLanguage()
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="admin_primary" size="admin_pill" disabled={pending} className="w-full mt-4">
      {pending ? t("ui.uploading", "Se încarcă...") : t("patient.radiography.upload", "Încarcă Radiografie")}
    </Button>
  );
}

function DeleteSubmitButton() {
  const { t } = useLanguage()
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="ghost"
      disabled={pending}
      className="h-8 rounded-full text-[12px] gap-1.5 text-red-500/90 hover:text-red-600 hover:bg-red-50 dark:text-red-400/90 dark:hover:text-red-300 dark:hover:bg-red-500/10 px-3 font-medium transition-colors"
    >
      {pending ? t("ui.deleting", "Se șterge...") : <>{t("ui.delete", "Șterge")} <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} /></>}
    </Button>
  );
}

export function PatientDetailsDialog({ patient, children, defaultOpen = false }: { patient: Serializable<PatientWithRelations>, children?: React.ReactNode, defaultOpen?: boolean }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(defaultOpen)
  const [isRadiographyOpen, setIsRadiographyOpen] = useState(false)

  useEffect(() => {
    if (defaultOpen) setOpen(true)
  }, [defaultOpen])
  const [zoomLevel, setZoomLevel] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)

  const uploadRadiographyWithLeadId = patient.lead?.id ? uploadRadiography.bind(null, patient.lead.id) : async () => ({ success: false, message: t("lead.notFound", "No lead") });
  const [uploadState, uploadFormAction] = useActionState<ActionState, FormData>(uploadRadiographyWithLeadId, { success: false, message: "" });

  const deleteRadiographyWithLeadId = patient.lead?.id ? deleteRadiography.bind(null, patient.lead.id) : async () => ({ success: false, message: t("lead.notFound", "No lead") });
  const [deleteState, deleteFormAction] = useActionState<ActionState, FormData>(deleteRadiographyWithLeadId, { success: false, message: "" });

  useEffect(() => {
    if (uploadState.success) {
      // Success logic
    }
  }, [uploadState.success]);

  const steps = [
    { label: t("patient.timeline.lead", "Cerere (Lead)"), date: patient.lead?.createdAt, status: "completed" },
    { label: t("patient.timeline.takenOver", "Preluat"), date: patient.createdAt, status: "completed" },
    { label: t("patient.timeline.treatment", "Tratament"), date: patient.arrivalDate, status: patient.status !== "IN_ASTEPTARE" ? "completed" : "current" },
    { label: t("patient.timeline.completed", "Finalizat"), date: patient.status === "FINALIZAT" ? patient.updatedAt : null, status: patient.status === "FINALIZAT" ? "completed" : "pending" }
  ]

  const currentStatus = statuses.find(s => s.value === patient.status)

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <span className="cursor-pointer hover:underline decoration-emerald-500/50 underline-offset-4 decoration-2 transition-all font-medium text-zinc-700 dark:text-zinc-200">
              {patient.name}
            </span>
          )}
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[750px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-zinc-200 dark:border-white/10 p-0 overflow-hidden shadow-2xl shadow-emerald-900/10 rounded-[24px]"
          showCloseButton={false}
        >
          {/* Header Compact */}
          <div className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="h-[52px] w-[52px] rounded-full bg-[#dcfce7] dark:bg-emerald-500/10 flex items-center justify-center text-[#22c55e] dark:text-emerald-400 shrink-0">
                <User strokeWidth={2} className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[20px] font-semibold text-zinc-900 dark:text-white truncate tracking-tight mb-0.5">{patient.name}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", currentStatus?.className?.replace('bg-emerald-50 text-emerald-600 border border-emerald-200', 'text-zinc-500'))}>
                    {currentStatus?.label || patient.status}
                  </span>
                  <div className="h-2.5 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-400 uppercase text-[9px] font-bold tracking-wider">ID:</span>
                      <span className="text-[#3b82f6] font-medium">{patient.lead ? patient.lead.id.split('-')[0].toUpperCase() : patient.id.split('-')[0].toUpperCase()}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      <span>{t("patient.added", "Adăugat:")} {new Date(patient.createdAt as string).toLocaleDateString('ro-RO')}</span>
                    </span>
                  </div>
                </div>
              </div>
              <DialogClose asChild>
                <div className="ml-auto w-9 h-9 rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shrink-0">
                  <X className="h-4 w-4 text-zinc-500" strokeWidth={2.5} />
                </div>
              </DialogClose>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[75vh] bg-[#fdfdfd] dark:bg-zinc-950">
            {/* Timeline Compact */}
            <div className="px-8 py-5 bg-white dark:bg-zinc-900">
              <div className="relative flex items-start justify-between">
                <div className="absolute left-[24px] right-[24px] top-[12px] h-[1px] bg-zinc-200 dark:bg-zinc-800 -z-10" />
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 z-10 bg-white dark:bg-zinc-900 px-2">
                    <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-300 ${step.status === 'completed'
                      ? 'bg-[#22c55e] text-white'
                      : step.status === 'current'
                        ? 'bg-white border-2 border-[#22c55e] text-[#22c55e]'
                        : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-300'
                      }`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-[14px] h-[14px]" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-[11px] font-semibold leading-tight ${step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-200'}`}>{step.label}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{step.date ? new Date(step.date).toLocaleDateString('ro-RO') : t("ui.notAvailableShort", "N/A")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-white/5" />

            {/* Patient Info Grid */}
            <div className="p-6 bg-[#fdfdfd] dark:bg-zinc-950">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{patient.lead?.email || t("ui.notAvailableShort", "N/A")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <Phone className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">{patient.lead?.phone || t("ui.notAvailableShort", "N/A")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200 uppercase">{patient.lead?.country || t("ui.notAvailableShort", "N/A")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <Wallet className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[15px] font-semibold text-[#22c55e] dark:text-emerald-400">{patient.lead?.budget || t("ui.notAvailableShort", "N/A")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-[20px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex-1">
                    <Info className="w-4 h-4 text-zinc-400 mt-1 shrink-0" strokeWidth={1.5} />
                    <div className="w-full">
                      <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {patient.lead?.description || t("patient.noNotes", "Nu există notițe / descriere.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Radiography Section - Conditional rendering */}
              <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 md:px-6 md:py-5">
                {patient.lead?.radiographyLink && (
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#f2fdf5] dark:bg-emerald-900/10 border border-[#bbf7d0] dark:border-emerald-500/20 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#dcfce7] dark:bg-emerald-500/20 flex items-center justify-center text-[#22c55e] dark:text-emerald-400 shrink-0">
                        <FileText className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{t("patient.radiography.title", "Radiografie")}</p>
                        <p className="text-[11px] text-[#22c55e]/90 dark:text-emerald-400/90 font-medium">{t("patient.radiography.attachment", "Document atașat")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="admin_secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUploadForm(!showUploadForm);
                        }}
                        className="h-8 px-4"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} /> {t("ui.add", "Adaugă")}
                      </Button>
                      <form action={deleteFormAction}>
                        <DeleteSubmitButton />
                      </form>
                      <Button
                        size="sm"
                        variant="admin_primary"
                        onClick={(e) => {
                          e.preventDefault();
                          setZoomLevel(0);
                          setIsRadiographyOpen(true);
                        }}
                        className="h-8 px-4"
                      >
                        {t("ui.open", "Deschide")} <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                )}

                {(!patient.lead?.radiographyLink || showUploadForm) && (
                  <div className="w-full max-w-md mx-auto">
                    <form action={uploadFormAction} className="flex flex-col gap-4">
                      {/* Top: Header & Tabs */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <UploadCloud className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} />
                          </div>
                          <h4 className="text-[14px] font-bold text-zinc-900 dark:text-white leading-tight">{t("patient.radiography.collection", "Radiografii")}</h4>
                        </div>
                        {/* We use a CSS peer trick below to render the tab switches, pushed up via negative margin */}
                      </div>
                      <div className="relative w-full">
                        <input type="radio" name="upload_tab" id="tab-link" className="peer/link hidden" defaultChecked />
                        <input type="radio" name="upload_tab" id="tab-file" className="peer/file hidden" />

                        {/* Tab Buttons styling via label */}
                        <div className="absolute -top-[52px] right-0 flex bg-zinc-100 dark:bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800 shrink-0 z-10 pointer-events-auto">
                          <label htmlFor="tab-link" className="cursor-pointer px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all peer-checked/link:bg-white peer-checked/link:shadow-sm peer-checked/link:text-zinc-900 dark:peer-checked/link:bg-zinc-700 dark:peer-checked/link:text-white text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                            {t("ui.link", "Link")}
                          </label>
                          <label htmlFor="tab-file" className="cursor-pointer px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all peer-checked/file:bg-white peer-checked/file:shadow-sm peer-checked/file:text-zinc-900 dark:peer-checked/file:bg-zinc-700 dark:peer-checked/file:text-white text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                            {t("ui.files", "Fișiere")}
                          </label>
                        </div>

                        {/* Link Input Container */}
                        <div className="hidden peer-checked/link:block w-full">
                          <Input
                            id="radiographyLink"
                            name="radiographyLink"
                            type="url"
                            placeholder={t("patient.radiography.linkPlaceholder", "Adresa (Google Drive, WeTransfer, etc)...")}
                            className="bg-white dark:bg-zinc-900/50 text-[12px] h-10 px-3 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm placeholder:text-zinc-400/70"
                          />
                        </div>

                        {/* File Input Container */}
                        <div className="hidden peer-checked/file:block w-full relative">
                          <Input
                            id="radiographyFile"
                            name="radiographyFile"
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            className="bg-white dark:bg-zinc-900/50 text-[12px] h-10 px-1 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm file:mr-2 file:h-8 file:mt-0.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:tracking-wide file:bg-[#f2fdf5] file:text-[#4ade80] hover:file:bg-[#dcfce7] cursor-pointer text-zinc-600 dark:text-zinc-400 w-full disabled:opacity-50"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none hidden sm:block">{t("patient.radiography.maxFiles", "Max 5 fișiere")}</span>
                        </div>
                      </div>

                      {/* Submit */}
                      <div>
                        <Button type="submit" variant="admin_primary" size="admin_pill" disabled={uploadState === undefined ? false : false} className="w-full mt-1">
                          {t("patient.radiography.uploadDocuments", "Încarcă Documentele")}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRadiographyOpen} onOpenChange={(open) => {
        setIsRadiographyOpen(open);
        if (open) setImageError(false);
      }}>
        <DialogContent
          className="max-w-[85vw] h-[85vh] p-0 overflow-hidden bg-white dark:bg-[#0a0a0a] border-zinc-200 dark:border-zinc-800 rounded-[24px]"
          showCloseButton={false}
        >
          <div className="relative w-full h-full flex items-center justify-center group bg-white dark:bg-[#0a0a0a]">
            <div
              className="absolute top-6 right-6 w-10 h-10 rounded-full border border-zinc-200 dark:border-[#262626] bg-zinc-50 dark:bg-[#141414] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1f1f1f] flex items-center justify-center cursor-pointer transition-colors z-50 shadow-sm"
              onClick={() => setIsRadiographyOpen(false)}
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </div>

            {patient.lead?.radiographyLink && !imageError ? (
              <div className="w-full h-full p-4 md:p-16 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patient.lead.radiographyLink || ""}
                  alt={t("patient.radiography.title", "Radiografie")}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-zinc-900/5 dark:ring-white/10"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="text-center flex flex-col items-center gap-5">
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">{t("patient.radiography.previewUnavailable", "Previzualizarea directă nu este disponibilă pentru acest link.")}</p>
                <Button asChild variant="admin_secondary" size="admin_pill">
                  <a href={patient.lead?.radiographyLink || '#'} target="_blank" rel="noopener noreferrer">
                    {t("patient.radiography.openNewWindow", "Deschide în fereastră nouă")} <ArrowRight className="ml-2 h-[14px] w-[14px]" strokeWidth={1.5} />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
