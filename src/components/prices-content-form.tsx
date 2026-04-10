"use client"

import { useActionState, useState } from "react"
import { updatePricesContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

type PriceItem = {
  title: string
  description: string
  price: string
  oldPrice?: string
}

type PricesContent = {
  sectionTitle?: string
  sectionDescription?: string
  items: PriceItem[]
}

export function PricesContentForm({
  initialData,
  locale = "ro",
}: {
  initialData: PricesContent
  locale?: string
}) {
  const [items, setItems] = useState<PriceItem[]>(initialData.items || [])
  const [state, formAction, isPending] = useActionState(updatePricesContent, initialState)

  const addItem = () => {
    setItems([...items, { title: "", description: "", price: "", oldPrice: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PriceItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border ${state.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider">
            {state.message}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune</Label>
            <Input
              name="sectionTitle"
              defaultValue={initialData.sectionTitle}
              placeholder="Soluții dentare complete la standarde europene"
              className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus-visible:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Etichetă / Descriere Scurtă</Label>
            <Input
              name="sectionDescription"
              defaultValue={initialData.sectionDescription}
              placeholder="TRATAMENTE & COSTURI"
              className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus-visible:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs tracking-widest">Lista Servicii</h3>
          <Button
            type="button"
            onClick={addItem}
            variant="admin_primary_strong" size="admin_submit"
            
            className="text-[10px] tracking-wider"
          >
            <Plus className="h-3 w-3 mr-2" />
            Adaugă Serviciu
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="relative group transition-all bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none p-6">
            <div className="grid gap-4">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Serviciu</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Ex: Implant Dentar Premium"
                    required
                    className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                  />
                  <input type="hidden" name="titles" value={item.title} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Scurtă</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Ex: Include bont protetic și garanție"
                    required
                    className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                  />
                  <input type="hidden" name="descriptions" value={item.description} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Preț Vechi (Opțional)</Label>
                  <Input
                    value={item.oldPrice || ""}
                    onChange={(e) => updateItem(index, "oldPrice", e.target.value)}
                    placeholder="Ex: 1200 €"
                    className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                  />
                  <input type="hidden" name="oldPrices" value={item.oldPrice || ""} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Preț (€)</Label>
                  <Input
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    placeholder="Ex: 350 €"
                    required
                    className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                  />
                  <input type="hidden" name="prices" value={item.price} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
        <Button
          type="button"
          variant="admin_primary_strong" size="admin_submit"
          onClick={addItem}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Adaugă Serviciu
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          variant="admin_primary_strong" size="admin_submit"
          className="w-full md:w-auto"
        >
          {isPending ? "Se salvează..." : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  )
}
