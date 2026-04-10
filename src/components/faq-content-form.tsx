"use client"

import { useActionState, useState } from "react"
import { updateFaqContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

type FaqItem = {
  question: string
  answer: string
}

type FaqContent = {
  sectionTitle?: string
  sectionDescription?: string
  items: FaqItem[]
}

export function FaqContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: FaqContent
  locale?: string
}) {
  const [items, setItems] = useState<FaqItem[]>(initialData.items || [])
  const [state, formAction, isPending] = useActionState(updateFaqContent, initialState)

  const addItem = () => {
    setItems([...items, { question: "", answer: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border mb-6 backdrop-blur-sm ${state.success ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            {state.success ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
            {state.message}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Informații Secțiune</h3>
        </div>

        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune</Label>
          <Input 
            name="sectionTitle" 
            defaultValue={initialData.sectionTitle} 
            placeholder="Întrebări Frecvente"
            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Secțiune (Opțional)</Label>
          <Textarea 
            name="sectionDescription" 
            defaultValue={initialData.sectionDescription} 
            placeholder="Descriere pentru secțiunea FAQ..."
            className="min-h-[100px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Lista Întrebări</h3>
          </div>
          <Button 
            type="button" 
            variant="admin_primary_strong" size="admin_submit"
            onClick={addItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Întrebare
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="relative group transition-all duration-300 bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl backdrop-blur-sm p-6 space-y-4 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Întrebarea #{index + 1}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(index)}
                  className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Întrebare</Label>
                <Input 
                  value={item.question}
                  onChange={(e) => updateItem(index, "question", e.target.value)}
                  placeholder="Ex: Cât durează tratamentul?"
                  required
                  className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
                <input type="hidden" name="questions" value={item.question} />
              </div>

              <div className="grid gap-2">
                <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Răspuns</Label>
                <Textarea 
                  value={item.answer}
                  onChange={(e) => updateItem(index, "answer", e.target.value)}
                  placeholder="Ex: Majoritatea tratamentelor..."
                  required
                  className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 min-h-[100px]"
                />
                <input type="hidden" name="answers" value={item.answer} />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-zinc-400 dark:text-zinc-500 py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
              Nu există întrebări adăugate.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6 z-50">
        <Button 
          type="submit" 
          disabled={isPending} 
          variant="admin_primary_strong" size="admin_submit"
        >
          {isPending ? "Se salvează..." : "Salvează Modificările"}
        </Button>
      </div>
    </form>
  )
}
