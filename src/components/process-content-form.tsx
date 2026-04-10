"use client"

import { useActionState, useState } from "react"
import { updateProcessContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

type ProcessItem = {
  title: string
  description: string
}

type ProcessContent = {
  sectionTitle?: string
  subtitle?: string
  sectionDescription?: string
  items: ProcessItem[]
}

export function ProcessContentForm({
  initialData,
  locale = "ro",
}: {
  initialData: ProcessContent
  locale?: string
}) {
  const [items, setItems] = useState<ProcessItem[]>(initialData.items || [])
  const [state, formAction, isPending] = useActionState(updateProcessContent, initialState)

  const addItem = () => {
    if (items.length < 4) {
      setItems([...items, { title: "", description: "" }])
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ProcessItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border mb-6 ${state.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider">
            {state.message}
          </p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 grid gap-6">
          <div className="grid gap-2">
            <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune</Label>
            <Input
              name="sectionTitle"
              defaultValue={initialData.sectionTitle}
              placeholder="4 Pași Simpli către Noul Tău Zâmbet"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Subtitlu</Label>
            <Input
              name="subtitle"
              defaultValue={initialData.subtitle}
              placeholder="CUM FUNCȚIONEAZĂ"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Descriere Secțiune</Label>
            <Textarea
              name="sectionDescription"
              defaultValue={initialData.sectionDescription}
              placeholder="Procesul nostru este optimizat..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold uppercase text-xs tracking-widest">Pașii Procesului</h3>
          <Button
            type="button"
            onClick={addItem}
            disabled={items.length >= 4}
            variant="admin_primary_strong" size="admin_submit"
            className="h-8 px-3 text-[10px]"
          >
            <Plus className="h-3 w-3 mr-2" />
            Adaugă Pas
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={index} className="relative group transition-all">
            <CardContent className="pt-6 grid gap-4">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Pas {index + 1} - Titlu</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="Ex: Trimite Radiografia"
                  required
                />
                <input type="hidden" name="titles" value={item.title} />
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Descriere</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Ex: Contactează-ne și trimite o radiografie..."
                  required
                />
                <input type="hidden" name="descriptions" value={item.description} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-4">
        <Button
          type="button"
          variant="admin_primary_strong" size="admin_submit"
          onClick={addItem}
          disabled={items.length >= 4}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Adaugă Pas
        </Button>

        <Button variant="admin_primary_strong" size="admin_submit"
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto"
        >
          {isPending ? "Se salvează..." : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  )
}
