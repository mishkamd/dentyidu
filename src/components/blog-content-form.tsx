"use client"

import { useActionState, useState } from "react"
import { updateBlogContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Star, X, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from "sonner"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

type BlogItem = {
  title: string
  description: string
  imageBefore: string
  imageAfter: string
  image?: string
  videoUrl?: string
  tags?: string
  isFavorite?: boolean
  type?: 'COMPARISON' | 'SINGLE' | 'STANDARD'
  _id?: string
  warrantyTitle?: string
  warrantyPoints?: string
}

type BlogContent = {
  sectionTitle?: string
  sectionDescription?: string
  items: BlogItem[]
}

const generateId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

export function BlogContentForm({
  initialData,
  locale = "ro",
}: {
  initialData: BlogContent
  locale?: string
}) {
  const [items, setItems] = useState<BlogItem[]>(
    (initialData.items || []).map(item => ({
      ...item,
      _id: item._id,
      title: item.title || "",
      description: item.description || "",
      imageBefore: item.imageBefore || "",
      imageAfter: item.imageAfter || "",
      image: item.image || "",
      videoUrl: item.videoUrl || "",
      tags: item.tags || "",
      isFavorite: !!item.isFavorite,
      type: item.type || 'COMPARISON',
      warrantyTitle: item.warrantyTitle || "",
      warrantyPoints: item.warrantyPoints || "",
    }))
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [state, formAction, isPending] = useActionState(updateBlogContent, initialState)

  const addItem = () => {
    const newItems: BlogItem[] = [{
      _id: generateId(),
      title: "",
      description: "",
      imageBefore: "",
      imageAfter: "",
      image: "",
      videoUrl: "",
      tags: "",
      isFavorite: false,
      type: 'COMPARISON',
      warrantyTitle: "",
      warrantyPoints: "",
    }, ...items]
    setItems(newItems)
    setEditingIndex(0)
  }

  const promptRemoveItem = (index: number) => {
    setItemToDelete(index)
  }

  const executeRemoveItem = () => {
    if (itemToDelete === null) return

    setItems(items.filter((_, i) => i !== itemToDelete))
    if (editingIndex === itemToDelete) setEditingIndex(null)
    // Adjust editing index if we removed an item before the current editing index
    else if (editingIndex !== null && itemToDelete < editingIndex) {
      setEditingIndex(editingIndex - 1)
    }
    setItemToDelete(null)
    toast.success("Postare ștearsă")
  }

  const updateItem = (index: number, field: keyof BlogItem, value: string | boolean) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const toggleFavorite = (index: number) => {
    // If we are about to favorite this item, check if we already have 2 favorites
    if (!items[index].isFavorite) {
      const currentFavorites = items.filter(i => i.isFavorite).length
      if (currentFavorites >= 2) {
        toast.error("Poți selecta maxim 2 postări favorite.")
        return
      }
    }
    updateItem(index, 'isFavorite', !items[index].isFavorite)
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

      {/* Main Section Info */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Informații Generale</h3>
        </div>

        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Secțiune (Ex: Zâmbete transformate)</Label>
          <Input
            name="sectionTitle"
            defaultValue={initialData.sectionTitle}
            placeholder="Zâmbete transformate"
            className="h-11 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere Secțiune</Label>
          <Textarea
            name="sectionDescription"
            defaultValue={initialData.sectionDescription}
            placeholder="Descrierea completă a secțiunii..."
            className="min-h-[100px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Blog Items Section */}
      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Articole Blog</h3>
          </div>

          <Button
            type="button"
            onClick={addItem}
            variant="admin_primary_strong" size="admin_submit"
          >
            <Plus className="mr-2 h-4 w-4" /> Adaugă Postare Nouă
          </Button>
        </div>

        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-center text-zinc-400 dark:text-zinc-500 py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
              Nu există postări. Adaugă prima postare.
            </div>
          )}
          {items.map((item, index) => (
            <div key={item._id || index} className="relative group transition-all duration-300">
              {/* Summary View - Visible when NOT editing */}
              <div
                className={`p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl backdrop-blur-sm ${editingIndex === index ? 'hidden' : 'flex'}`}
              >
                <div className="relative h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/5">
                  {item.imageBefore ? (
                    <Image src={item.imageBefore} alt="" fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs font-medium">No img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate text-zinc-900 dark:text-zinc-100">{item.title || "Postare nouă"}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">{item.tags || "Fără tag-uri"}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={item.isFavorite ? "admin_primary" : "admin_secondary"}
                    size="icon"
                    onClick={() => toggleFavorite(index)}
                    className={cn(
                      "h-9 w-9 transition-all active:scale-95 rounded-lg border",
                      item.isFavorite
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-transparent text-zinc-400 border-transparent hover:text-amber-500 hover:bg-amber-500/10"
                    )}
                  >
                    <Star className={cn("h-4 w-4", item.isFavorite && "fill-current")} />
                  </Button>

                  <Button
                    type="button"
                    variant="admin_primary_strong" size="admin_submit"
                    onClick={() => setEditingIndex(index)}
                    className="h-9 px-4 text-xs font-medium"
                  >
                    Editează
                  </Button>
                </div>
              </div>

              {/* Edit Form - Visible when editing */}
              <div className={`bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 ring-1 ring-emerald-500/10 rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 ${editingIndex === index ? 'block' : 'hidden'}`}>
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-4">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Editare Postare #{index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingIndex(null)}
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Tip Postare</Label>
                    <Select
                      value={item.type || "COMPARISON"}
                      onValueChange={(value) => updateItem(index, 'type', value as any)}
                    >
                      <SelectTrigger className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20">
                        <SelectValue placeholder="Alege tipul" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPARISON">Before & After</SelectItem>
                        <SelectItem value="SINGLE">Noutăți (Foto/Video)</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="types" value={item.type || "COMPARISON"} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      placeholder="Ex: Transformare totală..."
                      className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="titles" value={item.title} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Tag-uri</Label>
                    <Input
                      value={item.tags}
                      onChange={(e) => updateItem(index, 'tags', e.target.value)}
                      placeholder="Ex: implanturi, fațete, estetică"
                      className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="tags" value={item.tags} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Descriere</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Povestea pacientului..."
                    className="min-h-[80px] bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  />
                  <input type="hidden" name="descriptions" value={item.description} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Titlu Garanție</Label>
                    <Input
                      value={item.warrantyTitle || ""}
                      onChange={(e) => updateItem(index, 'warrantyTitle', e.target.value)}
                      placeholder="Garanție DentyMD"
                      className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="warrantyTitles" value={item.warrantyTitle || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Puncte Garanție (csv)</Label>
                    <Input
                      value={item.warrantyPoints || ""}
                      onChange={(e) => updateItem(index, 'warrantyPoints', e.target.value)}
                      placeholder="Certificat, Pașaport, Control"
                      className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="warrantyPoints" value={item.warrantyPoints || ""} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className={cn("space-y-2", item.type === 'SINGLE' && "hidden")}>
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Imagine Before</Label>
                    {item.imageBefore && (
                      <div className="relative h-20 w-full mb-2 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group">
                        <Image src={item.imageBefore} alt="Before" fill className="object-cover" />
                        <button type="button" onClick={() => updateItem(index, 'imageBefore', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <Input
                      type="file"
                      name="imageBeforeFiles"
                      accept="image/*, .svg, image/svg+xml"
                      className="font-mono text-xs bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="existingImagesBefore" value={item.imageBefore || ""} />
                  </div>

                  <div className={cn("space-y-2", item.type === 'SINGLE' && "hidden")}>
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Imagine After</Label>
                    {item.imageAfter && (
                      <div className="relative h-20 w-full mb-2 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group">
                        <Image src={item.imageAfter} alt="After" fill className="object-cover" />
                        <button type="button" onClick={() => updateItem(index, 'imageAfter', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <Input
                      type="file"
                      name="imageAfterFiles"
                      accept="image/*, .svg, image/svg+xml"
                      className="font-mono text-xs bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="existingImagesAfter" value={item.imageAfter || ""} />
                  </div>

                  <div className={cn("space-y-2", (item.type === 'COMPARISON' || !item.type) && "hidden")}>
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Imagine Cover</Label>
                    {item.image && (
                      <div className="relative h-20 w-full mb-2 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 group">
                        <Image src={item.image} alt="Cover" fill className="object-cover" />
                        <button type="button" onClick={() => updateItem(index, 'image', '')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <Input
                      type="file"
                      name="imageFiles"
                      accept="image/*, .svg, image/svg+xml"
                      className="font-mono text-xs bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="existingImages" value={item.image || ""} />
                  </div>

                  <div className={cn("space-y-2", (item.type === 'COMPARISON' || !item.type) && "hidden")}>
                    <Label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Video URL (YouTube/Vimeo)</Label>
                    <Input
                      value={item.videoUrl || ""}
                      onChange={(e) => updateItem(index, 'videoUrl', e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    />
                    <input type="hidden" name="videoUrls" value={item.videoUrl || ""} />
                  </div>
                </div>

                <input type="hidden" name="isFavorites" value={item.isFavorite ? "true" : "false"} />

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/5">
                  <Button
                    type="button"
                    variant="admin_destructive" size="admin_pill"
                    onClick={() => promptRemoveItem(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 px-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Șterge
                  </Button>

                  <Button
                    type="button"
                    variant="admin_primary" size="admin_pill"
                    onClick={() => setEditingIndex(null)}
                    className="px-6"
                  >
                    <Check className="mr-2 h-4 w-4" /> Gata
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6 z-50">
        <Button
          type="submit"
          disabled={isPending}
          variant="admin_primary" size="admin_pill"
          className="px-8 shadow-xl"
        >
          {isPending ? "Se salvează..." : "Salvează Toate Modificările"}
        </Button>
      </div>

      <Dialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-red-900/10">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-zinc-900 dark:text-zinc-100">Ștergere Postare</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-1">
              Ești sigur că vrei să ștergi această postare? Această acțiune este ireversibilă după salvare.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <DialogClose asChild>
              <Button variant="admin_secondary" size="admin_pill">Anulează</Button>
            </DialogClose>
            <Button
              variant="admin_destructive" size="admin_pill"
              onClick={executeRemoveItem}
            >
              Șterge Definitiv
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
