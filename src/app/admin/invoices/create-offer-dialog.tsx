
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOffer } from "@/app/actions/financial"
import { Plus, Trash2 } from "lucide-react"
import { PatientBasic, LeadBasic, ServiceItem } from "@/types/financial"

export function CreateOfferDialog({ 
  open, 
  onOpenChange,
  patients,
  leads,
  services
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientBasic[]
  leads: LeadBasic[]
  services: ServiceItem[]
}) {
  const [loading, setLoading] = useState(false)
  const [targetType, setTargetType] = useState<'patient' | 'lead'>('patient')
  const [targetId, setTargetId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [items, setItems] = useState<{ serviceId: string, description: string, quantity: number, unitPrice: number }[]>([
    { serviceId: '', description: '', quantity: 1, unitPrice: 0 }
  ])

  const handleAddItem = () => {
    setItems([...items, { serviceId: '', description: '', quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        serviceId,
        description: service.name,
        unitPrice: service.price
      }
      setItems(newItems)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createOffer({
        patientId: targetType === 'patient' ? targetId : undefined,
        leadId: targetType === 'lead' ? targetId : undefined,
        validUntil: new Date(validUntil),
        items,
        currency: 'EUR', // Default
        notes: ''
      })
      onOpenChange(false)
      // Reset form
      setTargetId('')
      setItems([{ serviceId: '', description: '', quantity: 1, unitPrice: 0 }])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ofertă Nouă</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tip Client</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v as 'patient' | 'lead')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Pacient Existent</SelectItem>
                  <SelectItem value="lead">Lead (Potențial)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Selectează {targetType === 'patient' ? 'Pacient' : 'Lead'}</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Caută..." />
                </SelectTrigger>
                <SelectContent>
                  {(targetType === 'patient' ? patients : leads).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Valabilă Până La</Label>
              <Input type="date" required value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Servicii / Produse</Label>
              <Button type="button" variant="admin_secondary" size="admin_pill" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Adaugă Linie
              </Button>
            </div>
            
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select value={item.serviceId} onValueChange={(v) => handleServiceChange(index, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege serviciu..." />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.price} {s.currency})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input 
                    className="w-20" 
                    type="number" 
                    placeholder="Cant." 
                    value={item.quantity} 
                    onChange={e => {
                      const newItems = [...items]
                      newItems[index].quantity = parseInt(e.target.value) || 0
                      setItems(newItems)
                    }} 
                  />
                  <Input 
                    className="w-24" 
                    type="number" 
                    placeholder="Preț" 
                    value={item.unitPrice} 
                    onChange={e => {
                      const newItems = [...items]
                      newItems[index].unitPrice = parseFloat(e.target.value) || 0
                      setItems(newItems)
                    }} 
                  />
                  <div className="w-24 py-2 text-right font-medium text-sm">
                    {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="text-right">
                <span className="text-sm text-zinc-500 mr-4">Total</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">{total.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="admin_secondary" size="admin_pill" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button variant="admin_primary" size="admin_pill" type="submit" disabled={loading}>
              {loading ? 'Se salvează...' : 'Creează Ofertă'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
