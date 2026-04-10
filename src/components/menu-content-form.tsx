"use client"

import { useActionState, useState } from "react"
import { updateMenuContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

type MenuItem = {
  label: string
  href: string
}

type MenuItemWithId = MenuItem & {
  id: string
}

type MenuContent = {
  items: MenuItem[]
}

const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

function SortableRow({ 
  item, 
  index, 
  onRemove, 
  onUpdate 
}: { 
  item: MenuItemWithId, 
  index: number, 
  onRemove: (index: number) => void, 
  onUpdate: (index: number, field: keyof MenuItem, value: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' as const : undefined,
  }

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={`border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors ${isDragging ? 'bg-gray-50 dark:bg-white/[0.02] opacity-50' : ''}`}
    >
      <td className="p-4 w-[50px] text-zinc-400">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      </td>
      <td className="p-4">
        <Input 
          name={`items.${index}.label`}
          value={item.label}
          onChange={(e) => onUpdate(index, "label", e.target.value)}
          placeholder="Ex: Acasă"
          className="h-9 min-w-[150px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
        />
      </td>
      <td className="p-4">
        <Input 
          name={`items.${index}.href`}
          value={item.href}
          onChange={(e) => onUpdate(index, "href", e.target.value)}
          placeholder="Ex: / sau #contact"
          className="h-9 min-w-[150px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
        />
      </td>
      <td className="p-4 text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

export function MenuContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: MenuContent
  locale?: string
}) {
  const [items, setItems] = useState<MenuItemWithId[]>(
    (initialData.items || []).map(item => ({ ...item, id: generateId() }))
  )
  const [state, formAction, isPending] = useActionState(updateMenuContent, initialState)
  const { t } = useLanguage()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addItem = () => {
    setItems([...items, { label: "", href: "", id: generateId() }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof MenuItem, value: string) => {
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-xs tracking-widest">{t("ui.menu.listTitle", "Listă Elemente Meniu")}</h3>
          <Button 
            type="button" 
            onClick={addItem}
            variant="admin_primary_strong" size="admin_submit"
            className="text-[10px] font-bold uppercase tracking-wider h-8 px-3 rounded-xl bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="h-3 w-3 mr-2" />
            {t("ui.menu.addItem", "Adaugă Element")}
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
            id="menu-content-dnd-context"
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="border-b border-gray-200 dark:border-white/5">
                  <th className="p-4 w-[50px]"></th>
                  <th className="p-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.menu.labelColumn", "Etichetă (Nume)")}</th>
                  <th className="p-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.menu.linkColumn", "Link (Destinație)")}</th>
                  <th className="p-4 w-[80px] text-right text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.tableHeaders.actions", "Acțiuni")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                <SortableContext 
                  items={items.map(item => item.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item, index) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={removeItem}
                      onUpdate={updateItem}
                    />
                  ))}
                </SortableContext>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500 border-b border-gray-200 dark:border-white/5">
                      Nu există elemente în meniu. {t("ui.menu.emptyHint", "Adaugă primul element folosind butonul de mai sus.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/5">
        <Button 
          type="submit" 
          disabled={isPending}
          variant="admin_primary_strong" size="admin_submit"
          className="w-full md:w-auto"
        >
          {isPending ? t("ui.saving", "Se salvează...") : t("ui.saveChanges", "Salvează Modificările")}
        </Button>
      </div>
    </form>
  )
}
