"use client"

import { useActionState, useState } from "react"
import { updateHeroContent } from "@/app/actions/content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  success: false,
}

export function HeroContentForm({ 
  initialData,
  locale = "ro",
}: { 
  initialData: { 
    title?: string; 
    subtitle?: string; 
    seoTitle?: string;
    whatsappLink?: string;
    icon?: string;
    logo?: string;
    logoType?: "image" | "text";
    badge1Title?: string;
    badge1Description?: string;
    badge2Title?: string;
    badge2Description?: string;
    button1Text?: string;
    button2Text?: string;
    card2Title?: string;
    card2Description?: string;
    ratingValue?: string;
    ratingText?: string;
    mainImage?: string;
    card1Avatar1?: string;
    card1Avatar2?: string;
  } 
  locale?: string
}) {
  const [state, formAction, isPending] = useActionState(updateHeroContent, initialState)
  const [logoType, setLogoType] = useState<"image" | "text">(initialData.logoType || "image")
  const [logoDeleted, setLogoDeleted] = useState(false)
  const [iconDeleted, setIconDeleted] = useState(false)

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {state.message && (
        <div className={`p-4 rounded-xl border mb-6 ${state.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'}`}>
          <p className="text-sm font-bold uppercase tracking-wider">
            {state.message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Configuration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Logo Principal</Label>
            <input type="hidden" name="logoType" value={logoType} />
            <Select 
              value={logoType} 
              onValueChange={(v) => setLogoType(v as "image" | "text")}
            >
              <SelectTrigger  className="w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagine</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-4">
            {logoType === "image" ? (
              <>
                {initialData.logo && initialData.logoType !== "text" && !logoDeleted && (
                  <div className="h-20 w-40 relative inline-flex items-center justify-start bg-muted/50 rounded-xl p-2 border border-border group">
                    <Image src={initialData.logo} alt="Logo" fill className="object-contain" />
                    <button type="button" onClick={() => setLogoDeleted(true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <Input 
                  type="file" 
                  name="logoFile" 
                  accept="image/*, .svg, image/svg+xml"
                  className="cursor-pointer file:cursor-pointer"
                />
                <input type="hidden" name="existingLogo" value={!logoDeleted && initialData.logo ? initialData.logo : ""} />
              </>
            ) : (
              <Input 
                  type="text" 
                  name="logoText" 
                  defaultValue={initialData.logoType === "text" ? initialData.logo : ""}
                  placeholder="Ex: DentyMD"
                  className="focus-visible:ring-primary"
                />
            )}
          </div>
        </div>

        {/* Icon Upload */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Icon Pagina (Favicon/Small)</Label>
          <div className="flex flex-col gap-4">
            {initialData.icon && !iconDeleted && (
              <div className="h-20 w-20 relative flex items-center justify-center bg-muted/50 rounded-lg p-2 border border-border group">
                <Image src={initialData.icon} alt="Icon" fill className="object-contain" />
                <button type="button" onClick={() => setIconDeleted(true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <Input 
              type="file" 
              name="iconFile" 
              accept="image/*, .svg, image/svg+xml"
              className="cursor-pointer file:cursor-pointer"
            />
            <input type="hidden" name="existingIcon" value={!iconDeleted && initialData.icon ? initialData.icon : ""} />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seoTitle" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Titlu SEO (Meta Title)</Label>
        <Input 
          id="seoTitle" 
          name="seoTitle" 
          defaultValue={initialData.seoTitle} 
          placeholder="DentyMD - Turism Dentar în Chişinau" 
        />
        <p className="text-xs text-muted-foreground">
          Acest titlu va apărea în tab-ul browserului și în rezultatele Google.
        </p>
        {state.errors?.seoTitle && (
          <p className="text-sm text-red-500">{state.errors.seoTitle[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="whatsappLink" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Link WhatsApp</Label>
        <Input 
          id="whatsappLink" 
          name="whatsappLink" 
          defaultValue={initialData.whatsappLink} 
          placeholder="https://wa.me/..." 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Titlu Hero</Label>
          <Input 
            id="title" 
            name="title" 
            defaultValue={initialData.title} 
          />
          {state.errors?.title && (
            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Subtitlu Hero</Label>
          <Textarea 
            id="subtitle" 
            name="subtitle" 
            defaultValue={initialData.subtitle} 
            className="min-h-[80px]"
          />
          {state.errors?.subtitle && (
            <p className="text-sm text-red-500">{state.errors.subtitle[0]}</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Butoane & CTA</h3>
          <div className="space-y-2">
            <Label htmlFor="button1Text" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Text Buton Ofertă</Label>
            <Input 
              id="button1Text" 
              name="button1Text" 
              defaultValue={initialData.button1Text} 
              placeholder="Solicită Ofertă"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="button2Text" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Text Buton WhatsApp</Label>
            <Input 
              id="button2Text" 
              name="button2Text" 
              defaultValue={initialData.button2Text} 
              placeholder="Contactează pe WhatsApp"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Card Economie</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="card2Title" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Card 2 Valoare</Label>
              <Input 
                id="card2Title" 
                name="card2Title" 
                defaultValue={initialData.card2Title} 
                placeholder="70%"
                className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card2Description" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Card 2 Descriere</Label>
              <Input 
                id="card2Description" 
                name="card2Description" 
                defaultValue={initialData.card2Description} 
                placeholder="Economie..."
                className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Badge 1 (Stânga)</h3>
          <div className="space-y-2">
            <Label htmlFor="badge1Title" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Titlu Badge 1</Label>
            <Input 
              id="badge1Title" 
              name="badge1Title" 
              defaultValue={initialData.badge1Title} 
              placeholder="Transport & Cazare"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge1Description" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Descriere Badge 1</Label>
            <Input 
              id="badge1Description" 
              name="badge1Description" 
              defaultValue={initialData.badge1Description} 
              placeholder="Inclus în pachetele premium"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Badge 2 (Dreapta)</h3>
          <div className="space-y-2">
            <Label htmlFor="badge2Title" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Titlu Badge 2</Label>
            <Input 
              id="badge2Title" 
              name="badge2Title" 
              defaultValue={initialData.badge2Title} 
              placeholder="Garanție UE"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge2Description" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Descriere Badge 2</Label>
            <Input 
              id="badge2Description" 
              name="badge2Description" 
              defaultValue={initialData.badge2Description} 
              placeholder="Materiale certificate internațional"
              className="bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
          </div>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-900/30 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="space-y-4 col-span-full">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Rating Badge (Top Stânga)</h3>
        </div>
        <div className="space-y-2">
            <Label htmlFor="ratingValue" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Valoare Rating</Label>
            <Input 
                id="ratingValue" 
                name="ratingValue" 
                defaultValue={initialData.ratingValue} 
                placeholder="4.9/5"
                className="focus-visible:ring-emerald-500/20 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="ratingText" className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Text Rating</Label>
            <Input 
                id="ratingText" 
                name="ratingText" 
                defaultValue={initialData.ratingText} 
                placeholder="(2,800+ Pacienți Fericiți)"
                className="focus-visible:ring-emerald-500/20 bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 col-span-full">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Imagini Hero</h3>
        </div>
        
        <div className="space-y-2">
            <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Imagine Principală</Label>
            {initialData.mainImage && (
                <div className="h-40 w-full relative bg-gray-100 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden mb-2">
                    <Image src={initialData.mainImage} alt="Main" fill className="object-cover" />
                </div>
            )}
            <Input 
                type="file"
                name="mainImageFile" 
                accept="image/*, .svg, image/svg+xml"
                className="cursor-pointer file:cursor-pointer bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
            />
            <input type="hidden" name="existingMainImage" value={initialData.mainImage || ""} />
        </div>

        <div className="space-y-4">
             <div className="space-y-2">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Avatar Card 1 (Stânga)</Label>
                {initialData.card1Avatar1 && (
                    <div className="h-10 w-10 relative rounded-full overflow-hidden mb-2 border-2 border-gray-200 dark:border-white/10">
                        <Image src={initialData.card1Avatar1} alt="Avatar 1" fill className="object-cover" />
                    </div>
                )}
                <Input 
                    type="file"
                    name="card1Avatar1File" 
                    accept="image/*, .svg, image/svg+xml"
                    className="cursor-pointer file:cursor-pointer bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                />
                <input type="hidden" name="existingCard1Avatar1" value={initialData.card1Avatar1 || ""} />
            </div>

            <div className="space-y-2">
                <Label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Avatar Card 1 (Dreapta)</Label>
                {initialData.card1Avatar2 && (
                    <div className="h-10 w-10 relative rounded-full overflow-hidden mb-2 border-2 border-gray-200 dark:border-white/10">
                        <Image src={initialData.card1Avatar2} alt="Avatar 2" fill className="object-cover" />
                    </div>
                )}
                <Input 
                    type="file"
                    name="card1Avatar2File" 
                    accept="image/*, .svg, image/svg+xml"
                    className="cursor-pointer file:cursor-pointer bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-white/10"
                />
                <input type="hidden" name="existingCard1Avatar2" value={initialData.card1Avatar2 || ""} />
            </div>
        </div>
        </div>
      </div>

      <div className="flex justify-end">
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
