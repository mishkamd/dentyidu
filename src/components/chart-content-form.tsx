"use client"

import { useActionState, useState } from "react"
import { updateChartContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>,
    success: false,
}

type ChartItem = {
    label: string
    v1: number
    v2: number
    v3: number
}

type ChartContent = {
    legend1?: string
    legend2?: string
    legend3?: string
    items?: ChartItem[]
}

export function ChartContentForm({ initialData, locale = "ro" }: { initialData: ChartContent; locale?: string }) {
    const [items, setItems] = useState<ChartItem[]>(
        initialData.items && initialData.items.length > 0
            ? initialData.items
            : [
                { label: 'Implanturi Dentare', v1: 21, v2: 15, v3: 16 },
                { label: 'Fațete E-max', v1: 15, v2: 14, v3: 14 },
                { label: 'Coroane Zirconiu', v1: 11, v2: 15, v3: 16 },
                { label: 'Albire Dentară', v1: 16, v2: 13, v3: 11 },
                { label: 'Tratamente Endodonție', v1: 12, v2: 13, v3: 13 },
            ]
    )
    const [state, formAction, isPending] = useActionState(updateChartContent, initialState)

    const addItem = () => {
        setItems([...items, { label: "", v1: 0, v2: 0, v3: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof ChartItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            {state.message && (
                <div className={`p-4 rounded-xl border ${state.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <p className="text-sm font-bold uppercase tracking-wider">{state.message}</p>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                <h3 className="text-zinc-900 dark:text-white font-bold text-sm mb-4 uppercase tracking-wider">Legendă Grafic</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Legendă 1 (Verde Smarald)</Label>
                        <Input
                            name="legend1"
                            defaultValue={initialData.legend1 || "Europa (UE)"}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Legendă 2 (Zinc Închis)</Label>
                        <Input
                            name="legend2"
                            defaultValue={initialData.legend2 || "Marea Britanie"}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Legendă 3 (Verde Teal)</Label>
                        <Input
                            name="legend3"
                            defaultValue={initialData.legend3 || "SUA & Canada"}
                            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs tracking-widest">Date Statistici (Tratamente)</h3>
                    <Button type="button" onClick={addItem} variant="admin_primary_strong" size="admin_submit" className="text-[10px] tracking-wider">
                        <Plus className="h-3 w-3 mr-2" /> Adaugă
                    </Button>
                </div>

                {items.map((item, index) => (
                    <div key={index} className="relative group transition-all bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none p-6">
                        <div className="grid gap-4">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="grid gap-2 md:col-span-1">
                                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Nume Tratament</Label>
                                    <Input value={item.label} onChange={(e) => updateItem(index, "label", e.target.value)} required className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10" />
                                    <input type="hidden" name="labels" value={item.label} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Procentaj 1 (%)</Label>
                                    <Input type="number" step="0.1" value={item.v1} onChange={(e) => updateItem(index, "v1", e.target.value)} required className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10" />
                                    <input type="hidden" name="v1s" value={item.v1} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Procentaj 2 (%)</Label>
                                    <Input type="number" step="0.1" value={item.v2} onChange={(e) => updateItem(index, "v2", e.target.value)} required className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10" />
                                    <input type="hidden" name="v2s" value={item.v2} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Procentaj 3 (%)</Label>
                                    <Input type="number" step="0.1" value={item.v3} onChange={(e) => updateItem(index, "v3", e.target.value)} required className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10" />
                                    <input type="hidden" name="v3s" value={item.v3} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                <Button variant="admin_primary_strong" size="admin_submit" type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? "Se salvează..." : "Salvează Modificările"}
                </Button>
            </div>
        </form>
    )
}
