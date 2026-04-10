"use client"

import { useActionState, useState } from "react"
import { updateFooterContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type LegalLinkItem = {
  label: string
  url: string
}

type MenuItemWithId = MenuItem & {
  id: string
}

type FooterData = {
  brandDescription?: string
  newsletterTitle?: string
  newsletterDescription?: string
  copyrightText?: string
  quickLinksTitle?: string
  contactTitle?: string
  newsletterButtonText?: string
  newsletterPlaceholder?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  quickLinks?: MenuItem[]
  legalLinks?: LegalLinkItem[]
}

const defaultQuickLinks: MenuItem[] = [
  { label: "Acasă", href: "#" },
  { label: "Despre Noi", href: "#despre" },
  { label: "Lista de Prețuri", href: "#preturi" },
  { label: "Contact", href: "#contact" },
  { label: "Termeni și Condiții", href: "/terms-and-conditions" },
]

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
      className={`group border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors ${isDragging ? 'bg-emerald-50/50 dark:bg-emerald-900/10 opacity-50' : ''}`}
    >
      <td className="p-2 w-[50px]">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      </td>
      <td className="p-2">
        <Input 
          name={`quickLinks.${index}.label`}
          value={item.label}
          onChange={(e) => onUpdate(index, "label", e.target.value)}
          placeholder="Ex: Acasă"
          className="h-9 min-w-[150px] bg-transparent border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </td>
      <td className="p-2">
        <Input 
          name={`quickLinks.${index}.href`}
          value={item.href}
          onChange={(e) => onUpdate(index, "href", e.target.value)}
          placeholder="Ex: / sau #contact"
          className="h-9 min-w-[150px] bg-transparent border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
      </td>
      <td className="p-2 text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}


const defaultLegalLinks: LegalLinkItem[] = [
  { label: "Confidențialitate", url: "/privacy" },
  { label: "Cookies", url: "/cookies" },
  { label: "Termeni", url: "/terms" }
]

export function FooterContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: FooterData
  locale?: string
}) {
  const [state, formAction, isPending] = useActionState(updateFooterContent, initialState)
  const { t } = useLanguage()
  const [legalLinks, setLegalLinks] = useState<LegalLinkItem[]>(initialData.legalLinks || defaultLegalLinks)
  const [quickLinks, setQuickLinks] = useState<MenuItemWithId[]>(
    (initialData.quickLinks || defaultQuickLinks).map(item => ({ ...item, id: generateId() }))
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setQuickLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { label: "", href: "", id: generateId() }])
  }

  const removeQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index))
  }

  const updateQuickLink = (index: number, field: keyof MenuItem, value: string) => {
    const newLinks = [...quickLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setQuickLinks(newLinks)
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

      {/* Brand & Description Section */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("ui.footer.brandInfo", "Informații Brand")}</h3>
        </div>
        
        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.brandDescription", "Descriere Brand")}</Label>
          <Textarea 
            name="brandDescription" 
            defaultValue={initialData.brandDescription || "Redefinim standardele stomatologiei moderne. Tratamente premium, tehnologie de ultimă oră și grijă pentru pacient, totul la prețuri corecte."} 
            placeholder="Ex: Clinica noastră oferă servicii stomatologice..."
            className="min-h-[100px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.quickLinksTitle", "Titlu Link-uri Rapide")}</Label>
            <Input 
              name="quickLinksTitle" 
              defaultValue={initialData.quickLinksTitle || "Link-uri Rapide"} 
              placeholder="Ex: Link-uri Rapide"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.contactTitle", "Titlu Contact")}</Label>
            <Input 
              name="contactTitle" 
              defaultValue={initialData.contactTitle || "Contact"} 
              placeholder="Ex: Contact"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("ui.footer.footerMenu", "Meniu Footer")}</h3>
          </div>
          <Button 
            type="button" 
            onClick={addQuickLink}
            variant="admin_primary_strong" size="admin_submit"
            className="text-[10px] h-8 px-3 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all"
          >
            <Plus className="h-3 w-3 mr-2" />
            {t("ui.footer.addLink", "Adaugă Link")}
          </Button>
        </div>

        <div className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
            id="footer-content-dnd-context"
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
                <tr className="border-b border-gray-200 dark:border-white/5">
                  <th className="p-4 w-[50px]"></th>
                  <th className="p-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.footer.labelColumn", "Etichetă")}</th>
                  <th className="p-4 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.footer.linkColumn", "Link")}</th>
                  <th className="p-4 w-[80px] text-right text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{t("ui.tableHeaders.actions", "Acțiuni")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                <SortableContext 
                  items={quickLinks.map(item => item.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {quickLinks.map((link, index) => (
                    <SortableRow
                      key={link.id}
                      item={link}
                      index={index}
                      onRemove={removeQuickLink}
                      onUpdate={updateQuickLink}
                    />
                  ))}
                </SortableContext>
                {quickLinks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-400 dark:text-zinc-500">
                      {t("ui.footer.emptyLinks", "Nu există link-uri. Adaugă primul link folosind butonul de mai sus.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("ui.footer.newsletter", "Newsletter")}</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.newsletterTitle", "Titlu Newsletter")}</Label>
            <Input 
              name="newsletterTitle" 
              defaultValue={initialData.newsletterTitle || "Newsletter"} 
              placeholder="Ex: Abonează-te la newsletter"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.newsletterDescription", "Descriere Newsletter")}</Label>
            <Input 
              name="newsletterDescription" 
              defaultValue={initialData.newsletterDescription || "Abonează-te pentru noutăți și oferte exclusive."} 
              placeholder="Ex: Primește ultimele noutăți și oferte"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.buttonText", "Text Buton")}</Label>
            <Input 
              name="newsletterButtonText" 
              defaultValue={initialData.newsletterButtonText || "Abonează-te"} 
              placeholder="Ex: Abonează-te"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Placeholder</Label>
            <Input 
              name="newsletterPlaceholder" 
              defaultValue={initialData.newsletterPlaceholder || "Email-ul tău"} 
              placeholder="Ex: Email-ul tău"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Social Media & Copyright */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("ui.footer.socialCopyright", "Social Media & Copyright")}</h3>
        </div>

        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t("ui.footer.copyrightText", "Text Copyright")}</Label>
          <Input 
            name="copyrightText" 
            defaultValue={initialData.copyrightText || `© ${new Date().getFullYear()} DentyMD. Toate drepturile rezervate.`} 
            placeholder="Ex: © 2024 DentyMD. Toate drepturile rezervate."
            className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Facebook URL</Label>
            <Input 
              name="facebook" 
              defaultValue={initialData.facebook || ""} 
              placeholder="https://facebook.com/..."
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Instagram URL</Label>
            <Input 
              name="instagram" 
              defaultValue={initialData.instagram || ""} 
              placeholder="https://instagram.com/..."
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">LinkedIn URL</Label>
            <Input 
              name="linkedin" 
              defaultValue={initialData.linkedin || ""} 
              placeholder="https://linkedin.com/..."
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Twitter (X) URL</Label>
            <Input 
              name="twitter" 
              defaultValue={initialData.twitter || ""} 
              placeholder="https://twitter.com/..."
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6 z-50">
        <Button 
          type="submit" 
          disabled={isPending} 
          variant="admin_primary_strong" size="admin_submit"
        >
          {isPending ? t("ui.saving", "Se salvează...") : t("ui.saveChanges", "Salvează Modificările")}
        </Button>
      </div>
          
        <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">{t("ui.footer.legalLinksTitle", "Link-uri Legale (Subsol)")}</h4>
          <p className="text-xs text-muted-foreground">{t("ui.footer.legalLinksDescription", "Adaugă, editează sau șterge link-urile din subsolul paginii (ex: Termeni, Privacy).")}</p>
          <div className="space-y-4">
            {legalLinks.map((link, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <Input
                    name={`legalLinks.${index}.label`}
                    value={link.label}
                    onChange={(e) => {
                      const newLinks = [...legalLinks]
                      newLinks[index].label = e.target.value
                      setLegalLinks(newLinks)
                    }}
                    placeholder="Nume link (ex: Termeni)"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <Input
                    name={`legalLinks.${index}.url`}
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...legalLinks]
                      newLinks[index].url = e.target.value
                      setLegalLinks(newLinks)
                    }}
                    placeholder="URL (ex: /terms)"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 mt-0"
                  onClick={() => {
                    const newLinks = legalLinks.filter((_, i) => i !== index)
                    setLegalLinks(newLinks)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={() => {
                setLegalLinks([...legalLinks, { label: "", url: "" }])
              }}
            >
              <Plus className="w-4 h-4" /> {t("ui.footer.addLegalLink", "Adaugă Link Legal")}
            </Button>
          </div>
        </div>

      </form>
  )
}
