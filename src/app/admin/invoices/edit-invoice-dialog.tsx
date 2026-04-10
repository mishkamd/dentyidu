
"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"
import { ServiceItem, PatientBasic, LeadBasic, InvoiceWithDetails } from "@/types/financial"
import { updateFullInvoice } from "@/app/actions/financial"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  patientId: z.string().min(1, "Selectează un pacient"),
  dueDate: z.date(),
  items: z.array(z.object({
    serviceId: z.string().optional(),
    description: z.string().min(1, "Descrierea este obligatorie"),
    quantity: z.number().min(1, "Cantitatea trebuie să fie cel puțin 1"),
    price: z.number(),
  })).min(1, "Adaugă cel puțin un serviciu"),
})

interface EditInvoiceDialogProps {
  invoice: InvoiceWithDetails
  patients: PatientBasic[] // We might need to fetch patients if not passed, but for now let's assume we can get them or pass them. 
  // Actually InvoicesTable doesn't have patients list. 
  // I should probably fetch patients inside this component or pass them down.
  // Passing them down from Page -> FinancialDashboard -> InvoicesTable -> EditInvoiceDialog is best.
  onOpenChange: (open: boolean) => void;
}

export function EditInvoiceDialog({ invoice, patients, onOpenChange }: EditInvoiceDialogProps) {
  const [total, setTotal] = useState(Number(invoice.total) || 0)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: invoice.patientId || "",
      dueDate: new Date(invoice.dueDate),
      items: invoice.items.map(item => ({
        serviceId: item.serviceId || "",
        description: item.description,
        quantity: item.quantity,
        price: item.unitPrice
      })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")

  useEffect(() => {
    const newTotal = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
    setTotal(newTotal)
  }, [watchedItems])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateFullInvoice(invoice.id, values)
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update invoice:", error)
    }
  }

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Editează Factura {invoice.series} {invoice.number}</DialogTitle>
        <DialogDescription>
          Modifică detaliile facturii existente.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Pacient</label>
            {/* If we have patients list we can show select, otherwise just show current patient name disabled */}
            {patients && patients.length > 0 ? (
                <Select onValueChange={(value) => form.setValue("patientId", value)} defaultValue={invoice.patientId || ""}>
                <SelectTrigger>
                    <SelectValue placeholder="Selectează un pacient" />
                </SelectTrigger>
                <SelectContent>
                    {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            ) : (
                <Input value={invoice.patient?.name || "N/A"} disabled />
            )}
            {form.formState.errors.patientId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.patientId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Data Scadență</label>
            <DatePicker date={form.watch("dueDate")} setDate={(date) => form.setValue("dueDate", date as Date)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Servicii / Produse</h3>
          </div>
          
          <div className="flex gap-4 px-4 mb-2">
            <div className="flex-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">Serviciu / Lucrare</div>
            <div className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wider">Cantitate</div>
            <div className="w-32 text-xs font-medium text-zinc-500 uppercase tracking-wider">Preț (EUR)</div>
            <div className="w-24 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4 p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
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
                
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="bg-white dark:bg-zinc-900/50"
                  />
                </div>
                
                <div className="w-32">
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                    className="bg-white dark:bg-zinc-900/50"
                  />
                </div>

                <div className="w-24 text-right py-2 font-medium">
                  {(Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.price || 0)).toFixed(2)}
                </div>

                <div className="w-10 flex justify-end">
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
          <Button variant="admin_primary" size="admin_pill" type="submit">Salvează Modificările</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
