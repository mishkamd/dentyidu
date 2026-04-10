"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"
import { ServiceItem, PatientBasic, LeadBasic } from "@/types/financial"
import { createFullInvoice } from "@/app/actions/financial"

const formSchema = z.object({
  patientId: z.string().min(1, "Selectează un pacient"),
  settingsId: z.string().optional(),
  dueDate: z.date(),
  items: z.array(z.object({
    serviceId: z.string().optional(),
    description: z.string().min(1, "Descrierea este obligatorie"),
    quantity: z.number().min(1, "Cantitatea trebuie să fie cel puțin 1"),
    price: z.number(),
  })).min(1, "Adaugă cel puțin un serviciu"),
})

interface InvoiceSettingsItem {
  id: string
  name: string
  language: string
}

interface CreateInvoiceDialogProps {
  services: ServiceItem[]
  patients: PatientBasic[]
  leads: LeadBasic[]
  settingsList: InvoiceSettingsItem[]
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: () => void;
  defaultPatientId?: string;
}

function getInitialFormValues(defaultPatientId?: string, settingsList: InvoiceSettingsItem[] = []) {
  return {
    patientId: defaultPatientId || "",
    settingsId: settingsList[0]?.id || "",
    dueDate: new Date(),
    items: [{ serviceId: "", description: "", quantity: 1, price: 0 }],
  }
}

export function CreateInvoiceDialog({ services, patients, leads, settingsList, onOpenChange, onInvoiceCreated, defaultPatientId }: CreateInvoiceDialogProps) {
  const [total, setTotal] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<PatientBasic | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormValues(defaultPatientId, settingsList),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const watchedPatientId = form.watch("patientId")

  useEffect(() => {
    if (watchedPatientId) {
      const patient = patients.find(p => p.id === watchedPatientId) || null
      setSelectedPatient(patient)
    }
  }, [watchedPatientId, patients])

  useEffect(() => {
    const newTotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
    setTotal(newTotal)
  }, [watchedItems])

  const handleAddTreatmentToInvoice = () => {
    if (!selectedPatient) return

    const budget = selectedPatient.lead?.budget ? parseFloat(selectedPatient.lead.budget.replace(/[^0-9.]/g, '')) : 0
    
    // Check if the first item is empty (default state) and update it, otherwise append
    const firstItem = form.getValues("items.0")
    if (fields.length === 1 && !firstItem.description && !firstItem.price) {
      form.setValue("items.0.description", `Tratament: ${selectedPatient.treatment || "Nespecificat"}`)
      form.setValue("items.0.price", isNaN(budget) ? 0 : budget)
    } else {
      append({
        serviceId: "", // Custom item
        description: `Tratament: ${selectedPatient.treatment || "Nespecificat"}`,
        quantity: 1,
        price: isNaN(budget) ? 0 : budget
      })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createFullInvoice({
        patientId: values.patientId,
        dueDate: values.dueDate,
        settingsId: values.settingsId,
        items: values.items,
      })
      onInvoiceCreated()
      onOpenChange(false)
      setSelectedPatient(null)
      form.reset(getInitialFormValues(defaultPatientId, settingsList))
    } catch (error) {
      console.error("Failed to create invoice:", error)
    }
  }

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Creează Factură Nouă</DialogTitle>
        <DialogDescription>
          Completează detaliile de mai jos pentru a emite o nouă factură.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Pacient</label>
            <Select 
              value={form.watch("patientId") || undefined}
              onValueChange={(value) => {
                form.setValue("patientId", value)
                const patient = patients.find(p => p.id === value) || null
                setSelectedPatient(patient)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează un pacient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.patientId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.patientId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Data Scadență</label>
            <DatePicker date={form.watch("dueDate")} setDate={(date) => form.setValue("dueDate", date as Date)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Template Factură</label>
            <Select
              value={form.watch("settingsId") || undefined}
              onValueChange={(value) => form.setValue("settingsId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează template" />
              </SelectTrigger>
              <SelectContent>
                {settingsList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.language === 'fr' ? '🇫🇷' : '🇷🇴'} {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedPatient && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Plan Tratament Activ</h4>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <span className="text-emerald-700/70 dark:text-emerald-400/70 text-xs uppercase font-medium">Tratament:</span>
                    <p className="text-emerald-900 dark:text-emerald-100 mt-1">{selectedPatient.treatment || "Nespecificat"}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700/70 dark:text-emerald-400/70 text-xs uppercase font-medium">Buget Estimat:</span>
                    <p className="text-emerald-900 dark:text-emerald-100 mt-1">{selectedPatient.lead?.budget || "0"}</p>
                  </div>
                </div>
              </div>
              <Button 
                type="button" 
                variant="admin_secondary" size="admin_pill" 
                 
                onClick={handleAddTreatmentToInvoice}
                className="bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adaugă în Factură
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Servicii / Produse</h3>
          </div>
          
          {/* Table Header */}
          <div className="hidden sm:flex gap-4 px-4 mb-2">
            <div className="flex-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">Serviciu / Lucrare</div>
            <div className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wider">Cantitate</div>
            <div className="w-32 text-xs font-medium text-zinc-500 uppercase tracking-wider">Preț (EUR)</div>
            <div className="w-24 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                <div className="flex-1">
                  <Input
                    placeholder="Descriere serviciu..."
                    {...form.register(`items.${index}.description`)}
                    className="w-full bg-white dark:bg-zinc-900/50"
                  />
                  {form.formState.errors.items?.[index]?.description && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.items[index]?.description?.message}</p>
                  )}
                </div>
                
                <div className="w-full sm:w-24">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="bg-white dark:bg-zinc-900/50"
                  />
                </div>
                
                <div className="w-full sm:w-32">
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                    className="bg-white dark:bg-zinc-900/50"
                  />
                </div>

                <div className="w-full sm:w-24 text-right py-2 font-medium">
                  {(Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.price || 0)).toFixed(2)}
                </div>

                <div className="w-full sm:w-10 flex sm:justify-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-9 w-9">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="admin_secondary" size="admin_pill"
            onClick={() => append({ serviceId: "", description: "", quantity: 1, price: 0 })}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Linie
          </Button>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold">Total: {total.toFixed(2)} EUR</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button variant="admin_primary" size="admin_pill" type="submit">Emite Factură</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
